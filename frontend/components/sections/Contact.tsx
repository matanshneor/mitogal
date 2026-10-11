"use client";

import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import InstagramIcon from "@/components/ui/InstagramIcon";
import Reveal from "@/components/ui/Reveal";
import { saveLead } from "@/lib/api";
import { services } from "@/data/services";
import {
  site,
  telHref,
  waDefaultMessage,
  waLeadLink,
  waLink,
} from "@/lib/site.config";

/** Underline-only field styling — no boxes. */
const FIELD =
  "min-h-12 w-full border-0 border-b-2 border-line bg-transparent px-0 pb-2 text-base text-ink transition-colors placeholder:text-muted/60 focus:border-brand-deep focus:outline-none";

const LABEL = "block text-label font-semibold uppercase text-muted";

const SOCIAL_BUTTON =
  "flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 text-white transition-colors hover:border-white hover:bg-white/10";

/**
 * The lead form, closing the page on a full-width brand band.
 *
 * On submit the lead is saved to the backend (so it reaches /admin even if
 * the visitor never hits send) and, in the same gesture, composed into a
 * ready-to-send WhatsApp message — the lead still lands on Gal's phone in the
 * app she already lives in.
 *
 * Because WhatsApp opens in a different tab, the page itself looked like
 * nothing had happened. A confirmation now stays behind, announced through
 * role="status".
 */
export default function Contact() {
  const [nameError, setNameError] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();

    if (!name) {
      setNameError(true);
      (e.currentTarget.elements.namedItem("name") as HTMLInputElement)?.focus();
      return;
    }
    setNameError(false);

    const lead = {
      name,
      phone: String(form.get("phone") ?? "").trim() || undefined,
      eventType: String(form.get("eventType") ?? "").trim() || undefined,
      date: String(form.get("date") ?? "").trim() || undefined,
      message: String(form.get("message") ?? "").trim() || undefined,
    };

    saveLead({ ...lead, website: String(form.get("website") ?? "") });
    const url = waLeadLink(lead);

    // Called straight from the submit gesture, so popup blockers allow it.
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-brand-deep py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <p className="text-label font-semibold uppercase text-white/70">
            יצירת קשר
          </p>
          <h2
            id="contact-title"
            className="mt-2 font-display text-h1 font-semibold text-white"
          >
            בואו נתחיל <span className="text-brand">לתכנן</span>
          </h2>
          {/* Unconstrained so it sits on one line from `sm` up — max-w-md was
              wrapping it mid-sentence with room to spare. `text-balance`
              splits it evenly on the narrow screens where it must wrap. */}
          <p className="mt-4 text-balance text-body-lg text-white/80">
          ממלאים פרטים, ונפתחת הודעת וואטסאפ מוכנה.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-12">
          <Reveal>
            <div className="rounded-[1.75rem] bg-surface p-6 shadow-ink-lg sm:p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-7">
                <div>
                  <label htmlFor="name" className={LABEL}>
                    שם מלא *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={nameError}
                    aria-describedby={nameError ? "name-error" : undefined}
                    onChange={() => nameError && setNameError(false)}
                    className={`${FIELD} mt-2`}
                  />
                  {nameError && (
                    <p
                      id="name-error"
                      role="alert"
                      className="mt-2 text-sm font-semibold text-cat-proposals-deep"
                    >
                      נשמח לדעת איך קוראים לך לפני שנמשיך.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={LABEL}>
                    טלפון
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    className={`${FIELD} mt-2 text-end`}
                  />
                </div>

                <div>
                  <label htmlFor="eventType" className={LABEL}>
                    סוג האירוע
                  </label>
                  <div className="relative">
                    <select
                      id="eventType"
                      name="eventType"
                      defaultValue=""
                      className={`${FIELD} mt-2 pe-6`}
                    >
                      <option value="">בחרו סוג אירוע</option>
                      {services.map((s) => (
                        <option key={s.slug} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                      <option value="אחר">אחר</option>
                    </select>
                    {/* In RTL, `end` resolves to the left edge. */}
                    <ChevronDown
                      className="pointer-events-none absolute bottom-3 end-0 h-4 w-4 text-muted"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className={LABEL}>
                    תאריך משוער
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className={`${FIELD} mt-2`}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={LABEL}>
                    ספרו לנו על האירוע
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className={`${FIELD} mt-2 resize-y`}
                  />
                </div>

                {/* Honeypot: invisible to people and screen readers, filled
                    in by spam bots. The backend silently drops those. */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor="website">אתר</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 font-display text-base font-semibold text-ink shadow-brand transition-all hover:brightness-105"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  שליחה בוואטסאפ
                </button>

                {/* Announced to screen readers the moment WhatsApp opens. */}
                <div role="status" aria-live="polite">
                  {sent && (
                    <p className="rounded-[1rem] bg-cat-holidays-tint px-4 py-3 text-sm text-ink">
                      <strong className="font-semibold">נפתח לכם וואטסאפ</strong>{" "}
                      עם ההודעה מוכנה — נשאר רק ללחוץ שלח. אם החלון לא נפתח,{" "}
                      <a
                        href={waLink(waDefaultMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        לחצו כאן
                      </a>
                      .
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted">
                  הפרטים נשמרים אצלנו רק כדי שנוכל לחזור אליכם, ולא מועברים לאף
                  אחד אחר.
                </p>
              </form>
            </div>
          </Reveal>

          {/* Direct routes for anyone who would rather not fill a form. */}
          <Reveal className="lg:pt-4">
            <p className="font-display text-h3 font-semibold text-white">
              התקשרו עכשיו
            </p>
            <a
              href={telHref}
              dir="ltr"
              className="mt-2 inline-flex min-h-11 items-center font-display text-3xl font-semibold text-brand transition-opacity hover:opacity-80"
            >
              {site.phoneDisplay}
            </a>

            <div className="mt-6 flex gap-3">
              <a
                href={waLink(waDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="וואטסאפ — פתיחת שיחה ישירה"
                className={SOCIAL_BUTTON}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={telHref}
                aria-label={`התקשרו אלינו — ${site.phoneDisplay}`}
                className={SOCIAL_BUTTON}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`אינסטגרם — ${site.instagramHandle}`}
                className={SOCIAL_BUTTON}
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
