import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { checkPassword, issueToken, requireAdmin } from "../auth.js";
import { pool, type LeadRow } from "../db.js";

export const adminRouter = Router();

/** Five wrong guesses locks the IP out for 15 minutes. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

adminRouter.post("/login", loginLimiter, (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!checkPassword(password)) {
    res.status(401).json({ error: "wrong_password" });
    return;
  }
  res.json(issueToken());
});

adminRouter.get("/leads", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query<LeadRow>(
    `SELECT id, name, phone, event_type, event_date, message, status, created_at
       FROM leads
      ORDER BY created_at DESC
      LIMIT 500`,
  );
  res.json({ leads: rows });
});

const statusSchema = z.object({ status: z.enum(["new", "contacted"]) });

adminRouter.patch("/leads/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = statusSchema.safeParse(req.body);
  if (!Number.isSafeInteger(id) || id <= 0 || !parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { rows } = await pool.query<LeadRow>(
    `UPDATE leads SET status = $1 WHERE id = $2
     RETURNING id, name, phone, event_type, event_date, message, status, created_at`,
    [parsed.data.status, id],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ lead: rows[0] });
});
