import { ChevronLeft } from "lucide-react";
import HeroSlideshow from "@/components/ui/HeroSlideshow";
import { Spark } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { heroSlides } from "@/data/gallery";
import { site, waDefaultMessage, waLink } from "@/lib/site.config";

/**
 * The opening frame.
 *
 * The headline is set large in Fredoka, and the photography sits inside an
 * arch — the shape of a balloon arch, and a shape that turns up in Gal's own
 * acrylic plaques. The arch cross-fades through one photo per category so the
 * first screen shows the full range of the work within a few seconds.
 *
 * Which photos rotate is controlled by `heroSlides` in data/gallery.ts.
 */
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden px-6 pb-16 pt-28 sm:pb-24 sm:pt-36"
    >
      {/* Confetti. Purely atmospheric, and kept to three so it reads as a
          detail rather than a pattern. */}
      <Spark
        aria-hidden="true"
        className="pointer-events-none absolute end-[8%] top-[18%] h-8 w-8 text-cat-birthdays/50"
      />
      <Spark
        aria-hidden="true"
        className="pointer-events-none absolute start-[6%] top-[52%] h-5 w-5 text-cat-holidays/45"
      />
      <Spark
        aria-hidden="true"
        className="pointer-events-none absolute end-[22%] bottom-[8%] h-4 w-4 text-cat-proposals/40"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
          {/* A touch larger than the section eyebrows elsewhere — this one is
              Gal's actual tagline from the logo, not a generic label. */}
          <p className="text-[0.9375rem] font-semibold tracking-[0.06em] text-brand-deep sm:text-base">
            {site.tagline}
          </p>

          <h1
            id="hero-title"
            className="mt-4 font-display text-display font-bold text-ink"
          >
            הופכים כל אירוע
            <br />
            <span className="text-brand-deep">לבלתי נשכח</span>
          </h1>

          <p className="mt-6 max-w-lg text-body-lg text-muted">
            מיתוג ייחודי לאירועים שזוכרים, מעיצוב הקונספט ועד ההפקה: שילוט,
            אריזות, עטיפות ומזכרות.
          </p>

          {/* Its own line, not a trailing clause — the payoff loses its edge
              when it wraps mid-sentence out of the paragraph above. */}
          <p className="mt-3 font-display text-lg font-semibold text-ink sm:text-xl">
            אין רעיון שנשאר על הנייר.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink
              href={waLink(waDefaultMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              בואו נדבר בוואטסאפ
            </ButtonLink>

            <a
              href="#portfolio"
              className="inline-flex min-h-13 items-center gap-1.5 font-display text-base font-semibold text-ink transition-colors hover:text-brand-deep"
            >
              לצפייה בעבודות
              {/* Points right-to-left, following the reading direction. */}
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative">
          <HeroSlideshow slides={heroSlides} />
        </div>
      </div>
    </section>
  );
}
