/**
 * Admin sessions without a sessions table.
 *
 * There is exactly one admin (Gal), so a token is just an expiry time signed
 * with SESSION_SECRET. Rotating the secret logs everyone out.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";

const SESSION_HOURS = 12;

function sign(payload: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(candidate: string): boolean {
  // Compare HMACs so the comparison is constant-time regardless of length.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${env.ADMIN_PASSWORD}`));
}

export function issueToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

function verifyToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  return Number(payload) > Date.now();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
