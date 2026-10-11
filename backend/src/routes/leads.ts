/**
 * Public endpoint: the contact form posts here.
 *
 * The visitor's browser still opens WhatsApp right after, so this request is
 * a safety net — a lead is recorded even if they never hit send.
 */
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { pool } from "../db.js";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: optionalText(30),
  eventType: optionalText(60),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  message: optionalText(2000),
  /** Honeypot: hidden from people, filled by bots. */
  website: z.string().optional(),
});

export const leadsRouter = Router();

leadsRouter.post(
  "/",
  rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res) => {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_lead" });
      return;
    }

    const lead = parsed.data;

    // Answer the bot exactly like a real submission so it learns nothing.
    if (lead.website) {
      res.status(201).json({ ok: true });
      return;
    }

    await pool.query(
      `INSERT INTO leads (name, phone, event_type, event_date, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [lead.name, lead.phone, lead.eventType, lead.date, lead.message],
    );

    res.status(201).json({ ok: true });
  },
);
