import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

/**
 * ⚠️  STILL RENDERING PLACEHOLDER QUOTES — see data/testimonials.ts.
 *
 * The on-page developer notice was removed so the section reads as finished
 * while Gal reviews the design. The safeguard that remains is the attribution
 * under each quote: it says "דוגמה לטקסט", not a person's name. Nothing here
 * claims to be a real customer.
 *
 * BEFORE THE SITE IS PUBLIC: replace every quote and every author in
 * data/testimonials.ts with something a real client actually said and gave
 * permission to publish, or delete this section from app/page.tsx. Inventing
 * names for these quotes would turn them into fabricated testimonials.
 */

/** Each card takes a different category tint, so the row itself has rhythm. */
const CARD_TINTS = [
  "bg-cat-birthdays-tint",
  "bg-cat-weddings-tint",
  "bg-cat-holidays-tint",
  "bg-cat-concept-tint",
];

const QUOTE_MARKS = [
  "text-cat-birthdays",
  "text-cat-weddings",
  "text-cat-holidays",
  "text-cat-concept",
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28"
    >
      <SectionHeading
        id="testimonials-title"
        eyebrow="לקוחות מספרים"
        title="מה אומרים"
        accent="עלינו"
      />

      {/* Scroll-snap carousel on mobile, plain grid from md up. */}
      <ul className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {testimonials.map((t, i) => (
          <li
            key={t.id}
            className="w-[85%] shrink-0 snap-start md:w-auto md:shrink"
          >
            <Reveal delay={i * 0.08} className="h-full">
              <figure
                className={`relative h-full overflow-hidden rounded-[1.5rem] p-6 ${
                  CARD_TINTS[i % CARD_TINTS.length]
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-6 start-3 font-display text-8xl leading-none ${
                    QUOTE_MARKS[i % QUOTE_MARKS.length]
                  }`}
                >
                  &rdquo;
                </span>

                <blockquote className="relative font-display text-lg font-medium leading-relaxed text-ink">
                  {t.quote}
                </blockquote>

                <figcaption className="relative mt-5 text-sm text-muted">
                  <cite className="font-semibold not-italic text-ink">
                    {t.author}
                  </cite>
                  {" · "}
                  {t.event}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
