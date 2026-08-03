"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { GalleryItem } from "@/data/gallery";
import { serviceBySlug } from "@/data/services";

/**
 * Full-screen viewer for the gallery.
 *
 * Accessibility contract, since this is a modal:
 *   - role="dialog" + aria-modal, labelled by the current photo's alt text
 *   - focus moves in on open and returns to the tile that opened it on close
 *   - Tab is trapped inside the dialog
 *   - Escape closes, ArrowRight/ArrowLeft step through (mirrored for RTL:
 *     in Hebrew, "next" is to the left)
 *   - the page behind is scroll-locked
 *
 * Touch: a horizontal swipe of more than 60px steps to the next/previous
 * photo, which is what people try first on a phone.
 */
export default function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: GalleryItem[];
  /** null = closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  /** The element that had focus before opening, so we can restore it. */
  const openerRef = useRef<HTMLElement | null>(null);

  const open = index !== null;
  const item = open ? items[index] : undefined;

  const step = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // RTL: the left arrow moves forward through the list.
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable =
        dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.alt} — תמונה ${index + 1} מתוך ${items.length}`}
          initial={reduced ? undefined : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={(e) => {
            // Clicking the backdrop closes; clicking the photo does not.
            if (e.target === e.currentTarget) onClose();
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירת התצוגה"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            <p className="font-display text-sm text-white/70">
              {index + 1} / {items.length}
            </p>
          </div>

          {/* `items-stretch`, not `items-center`: centring the cross axis left
              the <figure> with a content-derived height, so the flexing image
              box below it had nothing to divide and collapsed to 0px. The
              arrows get `self-center` instead. */}
          <div className="flex min-h-0 flex-1 items-stretch justify-center gap-2 px-2 pb-4">
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="התמונה הבאה"
              className="hidden h-12 w-12 shrink-0 self-center items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:flex"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>

            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              {item.src ? (
                // `flex-1 min-h-0`, not `h-full`: a percentage height resolves
                // against a flex parent whose own height is auto, which
                // computed to zero — `fill` then painted into a 0px-tall box
                // and the photo never appeared. Flexing for the leftover space
                // is deterministic and adapts to short viewports.
                <div className="relative min-h-0 w-full flex-1">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="100vw"
                    className="rounded-[1.5rem] object-contain"
                  />
                </div>
              ) : (
                // Placeholder items are still browsable, so the interaction
                // can be judged before Gal's photos land.
                <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-[1.5rem] bg-white/10 p-8 text-center">
                  <p className="font-display text-xl text-white/70">
                    {serviceBySlug.get(item.category)?.label} — תמונה תתווסף בקרוב
                  </p>
                </div>
              )}

              <figcaption className="max-w-xl px-4 text-center text-sm text-white/75">
                {item.alt}
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="התמונה הקודמת"
              className="hidden h-12 w-12 shrink-0 self-center items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:flex"
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
