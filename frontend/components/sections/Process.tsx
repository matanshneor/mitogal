import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/process";

/**
 * The four-step process, on a full-width tinted band.
 *
 * The band is doing structural work, not decoration: without it the page runs
 * paper → white → paper → white for its whole length, and every section reads
 * with the same weight. The numerals are set at display size because the
 * sequence is the content here — this is one of the few places on the site
 * where 01/02/03 genuinely encodes information the reader needs.
 */
export default function Process() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="bg-brand-tint py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          id="process-title"
          eyebrow="התהליך"
          title="איך זה"
          accent="עובד?"
          intro="ארבעה שלבים, מהשיחה הראשונה ועד שהכל מוכן בידיים שלכם."
        />

        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
          {processSteps.map((step, i) => (
            <li key={step.number}>
              <Reveal delay={i * 0.08} className="h-full">
                <span
                  aria-hidden="true"
                  className="block font-display text-5xl font-bold text-brand-deep/35 sm:text-6xl"
                >
                  {step.number}
                </span>
                <h3 className="mt-2 font-display text-h3 font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-base text-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal>
          <p className="mt-12 text-sm text-muted">
            כל אירוע מתחיל מדף חלק. אין תבניות מוכנות ואין שני אירועים שנראים
            אותו דבר.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
