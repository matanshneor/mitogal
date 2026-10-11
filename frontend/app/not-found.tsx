import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { waDefaultMessage, waLink } from "@/lib/site.config";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-[1200px] flex-col justify-center px-6 py-24">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium text-ink">
        הדף הזה לא נמצא
      </h1>
      <div aria-hidden="true" className="mt-5 h-px w-10 bg-accent" />
      <p className="mt-5 max-w-prose text-base text-muted">
        יכול להיות שהקישור השתנה. אפשר לחזור לעמוד הבית או פשוט לכתוב לנו.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ButtonLink href={waLink(waDefaultMessage)} target="_blank" rel="noopener noreferrer">
          דברו איתנו בוואטסאפ
        </ButtonLink>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center text-base font-semibold text-ink transition-colors hover:text-accent"
        >
          חזרה לעמוד הבית
        </Link>
      </div>
    </section>
  );
}
