import { Spark } from "./Logo";

/**
 * The signature element: a full-bleed ribbon of what Gal actually makes.
 *
 * It does three jobs at once — it injects the colour and movement the page
 * was missing, it breaks the identical rhythm between sections, and most
 * importantly it names the concrete deliverables, which appear nowhere else
 * on the site. "עיצוב ומיתוג לאירועים" is abstract; "כרטיסי גירוד" is not.
 *
 * Every item below is something visible in the portfolio photographs, so the
 * strip and the gallery corroborate each other.
 *
 * The visual track is `dir="ltr"` on purpose — see the note on @keyframes
 * marquee in globals.css. It is duplicated and translated by exactly -50%,
 * which is what makes the loop seamless. That copy is aria-hidden and the
 * real list is exposed to assistive tech once, as text.
 */
const ITEMS = [
  "שלטים מודפסים",
  "עטיפות שוקולד",
  "כרטיסי גירוד",
  "מארזי חטיפים",
  "בלונים",
  "מתנות ממותגות",
  "סלסלות חג",
  "כוסות ממותגות",
  "תפריטים",
  "קופות צדקה",
  "אריזות מתנה",
  "עיצוב קונספט",
  "מחזיקי מפתחות",
];

/**
 * One full cycle of the list.
 *
 * At 70s each item took 5.4 seconds to cross the screen, so someone scrolling
 * past read one or two of them — and this strip is the only place on the site
 * that names the actual products. 32s puts an item on screen roughly every
 * 2.4 seconds, which is readable at a glance without turning into a blur.
 *
 * Adding items lengthens the cycle, so raise this in proportion if the list
 * grows much beyond its current length.
 */
const DURATION_S = 32;

export default function Marquee() {
  return (
    <section aria-labelledby="marquee-title" className="bg-brand-deep py-5">
      <h2 id="marquee-title" className="sr-only">
        מה אנחנו מייצרים
      </h2>

      {/* The accessible copy — read once, never animated. */}
      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {/* The OVERFLOW CONTAINER carries dir="ltr", not just the track.
          Inside the page's RTL context a `w-max` child is anchored to the
          right and overflows leftward, so translateX walked the strip off the
          screen and left a growing empty gap. Making the clipping box itself
          LTR anchors the track at the left edge, which is what the -50%
          translate assumes. */}
      <div dir="ltr" className="overflow-hidden">
        <div
          aria-hidden="true"
          className="flex w-max motion-reduce:[animation:none]"
          style={{ animation: `marquee ${DURATION_S}s linear infinite` }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {ITEMS.map((item) => (
                <span
                  key={item}
                  dir="rtl"
                  className="flex items-center gap-6 whitespace-nowrap px-6 font-display text-xl font-medium text-white sm:text-2xl"
                >
                  {item}
                  <Spark className="h-3 w-3 shrink-0 text-white/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
