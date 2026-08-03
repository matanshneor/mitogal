"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { site, waDefaultMessage, waLink } from "@/lib/site.config";

/**
 * Shown if a client component throws in production.
 *
 * Without this, Next renders its own generic English error screen — which on
 * a Hebrew site reads as broken, and drops the visitor with nowhere to go.
 * A lead that hits a bug should still be able to reach Gal, so the WhatsApp
 * button is the primary action here rather than "try again".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console and in any error reporting added later.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-[1200px] flex-col justify-center px-6 py-24">
      <p className="text-label font-semibold uppercase text-muted">שגיאה</p>

      <h1 className="mt-3 font-display text-h1 font-semibold text-ink">
        משהו השתבש
      </h1>
      <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand" />

      <p className="mt-5 max-w-prose text-body-lg text-muted">
        התקלה אצלנו, לא אצלכם. אפשר לנסות לטעון מחדש, ואם זה נמשך — פשוט כתבו
        ל{site.owner} בוואטסאפ ונסגור את זה שם.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ButtonLink
          href={waLink(waDefaultMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          דברו איתנו בוואטסאפ
        </ButtonLink>

        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center font-display text-base font-semibold text-ink transition-colors hover:text-brand-deep"
        >
          לנסות שוב
        </button>
      </div>
    </section>
  );
}
