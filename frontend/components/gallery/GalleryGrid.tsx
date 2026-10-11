"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import MediaTile from "@/components/ui/MediaTile";
import Lightbox from "./Lightbox";
import type { GalleryItem } from "@/data/gallery";
import { classesFor, serviceBySlug } from "@/data/services";

/**
 * Masonry grid of event photographs.
 *
 * CSS multi-column gives a true masonry flow with no JavaScript measuring.
 * On a filter change the whole grid cross-fades (keyed on `filterKey`) rather
 * than animating individual tiles — with column flow, per-item layout
 * animation fights the browser and looks worse than a clean fade.
 *
 * Every tile is a real button that opens the lightbox, so the gallery is
 * fully keyboard-operable.
 */
export default function GalleryGrid({
  items,
  filterKey = "all",
  layout = "masonry",
}: {
  items: GalleryItem[];
  filterKey?: string;
  /**
   * "masonry" — column flow at each photo's own proportions. Used on the full
   *   category pages, where showing the work as shot is the point.
   * "grid" — uniform squares, three per row. Used for the landing-page
   *   preview so it reads as two clean rows rather than a ragged block.
   */
  layout?: "masonry" | "grid";
}) {
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted">
        עוד לא הועלו עבודות בקטגוריה הזו. בקרוב!
      </p>
    );
  }

  const isGrid = layout === "grid";

  return (
    <>
      <motion.div
        key={filterKey}
        initial={reduced ? undefined : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={
          isGrid
            ? // Three columns at every width, so six tiles are always exactly
              // two rows — on a phone and on a desktop alike.
              "grid grid-cols-3 gap-3 sm:gap-4"
            : "columns-2 gap-4 md:columns-3"
        }
      >
        {items.map((item, i) => {
          const service = serviceBySlug.get(item.category);
          return (
            <figure
              key={item.id}
              className={isGrid ? "" : "mb-4 break-inside-avoid"}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`הגדלת התמונה: ${item.alt}`}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[1.5rem] text-start"
              >
                <MediaTile
                  src={item.src}
                  alt={item.alt}
                  // Squares in grid mode — mixed heights are precisely what
                  // stops rows from lining up.
                  aspect={isGrid ? "square" : item.aspect}
                  label={service?.label}
                  // Tint, not the vivid fill: a wall of saturated blocks reads
                  // as a colour-swatch page rather than a portfolio. The tint
                  // still colour-codes the category without shouting.
                  tintClass={classesFor(item.category).bgTint}
                  sizes={
                    isGrid
                      ? "(min-width: 768px) 25vw, 33vw"
                      : "(min-width: 768px) 33vw, 50vw"
                  }
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            </figure>
          );
        })}
      </motion.div>

      <Lightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </>
  );
}
