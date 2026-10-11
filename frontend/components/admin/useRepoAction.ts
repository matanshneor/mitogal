"use client";

import { useCallback, useState } from "react";
import { ApiError, UnauthorizedError } from "@/lib/api";

/**
 * Shared plumbing for /admin screens whose actions commit to the repo:
 * one busy flag, one status message, sign-out on an expired session, and
 * the backend's error codes translated to Hebrew.
 */

const LIVE_DELAY = "השינויים יופיעו באתר בעוד כ-3 דקות.";

const ERRORS: Record<string, string> = {
  gallery_not_configured: "הניהול עוד לא הופעל: חסר לשרת אישור לכתוב לגיטהאב.",
  stale_order: "משהו השתנה בינתיים. לחצו רענון ונסו שוב.",
  unknown_category: "הקטגוריה הזו כבר לא קיימת. לחצו רענון.",
};

export type Notice = { kind: "ok" | "error"; text: string } | null;

export function useRepoAction(onSignOut: () => void, errors: Record<string, string>) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Stable, so screens can list it as an effect dependency. `errors` is a
  // module-level constant in every caller.
  const messageFor = useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        const text = errors[err.code] ?? ERRORS[err.code];
        if (text) return text;
      }
      return "משהו השתבש מול השרת. נסו שוב בעוד רגע.";
    },
    [errors],
  );

  /** Runs one server action. Returns whether it succeeded. */
  async function run(action: () => Promise<void>, success: string): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ kind: "ok", text: `${success} ${LIVE_DELAY}` });
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedError) onSignOut();
      else setNotice({ kind: "error", text: messageFor(err) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, notice, setNotice, run, messageFor };
}
