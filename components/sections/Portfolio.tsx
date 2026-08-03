"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useGalleryFilter } from "@/components/gallery/FilterContext";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import { galleryFor } from "@/data/gallery";
import { classesFor, serviceBySlug, services } from "@/data/services";

const CHIPS = [{ slug: "all", label: "הכל" }, ...services];

/**
 * The landing page shows two rows per category; everything else lives behind
 * the "לכל העבודות" link.
 *
 * Six, because the preview grid is three columns at every width — six tiles
 * are therefore exactly two rows on a phone and on a desktop alike. Weddings
 * and proposals currently hold only four photos each, so those two show a
 * full row plus two; adding one more photo to each would even them out.
 *
 * Each category's photos are ordered strongest-first in data/gallery.ts, so
 * this slice is a curated preview rather than an arbitrary one.
 */
const PREVIEW_LIMIT = 6;

/**
 * The filterable gallery.
 *
 * a11y note: these chips used to be marked up as role="tablist" / role="tab".
 * That was wrong — the ARIA tabs pattern requires arrow-key navigation and a
 * roving tabindex, so a screen reader announced "tab 3 of 7" and then the
 * arrow keys did nothing. They are what they look like: a group of toggle
 * buttons, so they now use aria-pressed, which needs no extra keyboard
 * contract and describes the actual behaviour.
 */
export default function Portfolio() {
  const { category, setCategory } = useGalleryFilter();
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const all = galleryFor(category);
  const items = all.slice(0, PREVIEW_LIMIT);
  const hidden = all.length - items.length;
  const activeService = serviceBySlug.get(category);

  /**
   * When Services sets the category from outside, the matching chip may be
   * scrolled off the row. Bring it into view so the filter state is visible.
   *
   * Skipped on the very first render: on mount the chip row sits far below
   * the fold, so scrolling it into view dragged the whole page down to the
   * gallery the moment anyone opened the site. Only a real category change
   * should move anything.
   */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    chipRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [category]);

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="bg-surface py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          id="portfolio-title"
          eyebrow="גלריה"
          title="עבודות"
          accent="אחרונות"
        />

        {/* Negative margins let the row bleed to the screen edge while the
            heading above stays inside the container. */}
        <div
          role="group"
          aria-label="סינון לפי סוג אירוע"
          className="no-scrollbar -mx-6 mt-10 flex snap-x gap-2 overflow-x-auto px-6 pb-2"
        >
          {CHIPS.map((chip) => {
            const active = chip.slug === category;
            const c = classesFor(chip.slug);
            return (
              <button
                key={chip.slug}
                ref={(el) => {
                  chipRefs.current[chip.slug] = el;
                }}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(chip.slug)}
                className={`min-h-11 shrink-0 snap-center whitespace-nowrap rounded-full px-5 font-display text-sm font-semibold transition-all duration-200 ${
                  active
                    ? `${c.bg} text-ink shadow-ink`
                    : "border-2 border-line bg-surface text-ink hover:border-ink/30"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <GalleryGrid items={items} filterKey={category} layout="grid" />
        </div>

        {/* Sends visitors to the full, indexable category page.
            "הכל" has no page of its own, and leaving that state with no
            follow-through meant the default view showed six of forty-three
            photos and then simply stopped. It gets a pointer to the filters
            instead. */}
        <div className="mt-10">
          {activeService ? (
            <Link
              href={`/gallery/${activeService.slug}`}
              className="inline-flex min-h-11 items-center gap-1.5 font-display text-base font-semibold text-ink transition-colors hover:text-brand-deep"
            >
              {hidden > 0
                ? `לכל העבודות ב${activeService.label} (עוד ${hidden})`
                : `לעמוד המלא של ${activeService.label}`}
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <p className="text-base text-muted">
              בוחרים סוג אירוע למעלה כדי לראות את כל העבודות מתוכו.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
