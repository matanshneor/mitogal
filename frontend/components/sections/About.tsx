import InstagramIcon from "@/components/ui/InstagramIcon";
import MediaTile from "@/components/ui/MediaTile";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { site } from "@/lib/site.config";

/**
 * TODO — לאשר מול גל לפני עלייה לאוויר.
 *
 * The copy below is a draft written from the Instagram bio and the nature of
 * the work. It is plausible but it is NOT Gal's own words: the origin of the
 * name is a reasonable inference, and the personal details are invented
 * framing. Gal should read this and either approve it or rewrite it before
 * launch — a bio is a factual claim about a real person.
 */
export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="bg-surface py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <Reveal>
          <MediaTile
            alt="גל אהרוני, מעצבת ומייסדת מיתוגל"
            label="גל אהרוני"
            aspect="portrait"
            shape="arch"
            tintClass="bg-cat-weddings-tint"
            sizes="(min-width: 768px) 40vw, 90vw"
            className="shadow-ink-lg"
          />
        </Reveal>

        <div>
          <SectionHeading id="about-title" eyebrow="אודות" title="גל" accent="אהרוני" />

          <div className="mt-6 space-y-4 text-body-lg text-muted">
            <p>
              מיתוגל נולד משילוב של שתי מילים —{" "}
              <strong className="font-semibold text-ink">מיתוג</strong> ו־
              <strong className="font-semibold text-ink">גל</strong> — ומתוך
              אמונה פשוטה: אירוע טוב מרגישים בפרטים הקטנים.
            </p>
            <p>
              אני מעצבת ומפיקה מיתוג לאירועים וחגיגות — שלטים, מתנות, פינות
              צילום וכל מה שהופך חלל רגיל למקום שנראה כאילו נבנה במיוחד עבורכם.
              כל פרויקט מתחיל בשיחה, ואני מלווה אותו עד שהכל מוכן ומגיע אליכם.
            </p>
            <p>
              אני מאמינה שכל אירוע הוא ייחודי בפני עצמו, לכן כל
              פרויקט מתחיל מהאנשים ומהסיפור שלהם.
            </p>
          </div>

          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 font-display text-base font-semibold text-ink transition-colors hover:text-brand-deep"
          >
            <InstagramIcon className="h-5 w-5" />
            עקבו אחריי באינסטגרם {site.instagramHandle}
          </a>
        </div>
      </div>
    </section>
  );
}
