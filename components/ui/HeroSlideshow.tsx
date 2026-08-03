"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/data/gallery";

const INTERVAL_MS = 3000;
/** Kept well under the interval so a slide is fully settled before the next. */
const FADE_S = 0.7;

/**
 * The cross-fading arch in the hero.
 *
 * Loading: slides mount lazily as the loop reaches them — index 0 plus the
 * one queued next — rather than all six upfront. Mounting every slide at once
 * would pull roughly half a megabyte on a phone for photos the visitor may
 * never sit through. Once a slide has been mounted it stays, so every
 * subsequent cross-fade has both layers already decoded.
 *
 * Motion & control (WCAG 2.2.2 — Pause, Stop, Hide):
 *   - `prefers-reduced-motion` disables the rotation entirely; slide one just
 *     sits there.
 *   - Hover or keyboard focus pauses it.
 *   - The dots are real buttons: choosing one jumps to that photo and stops
 *     the auto-advance for the rest of the visit, so there is a permanent,
 *     discoverable way to stop the movement.
 *   - It also pauses whenever the tab is hidden, which costs nothing and
 *     avoids burning cycles in a background tab.
 */
export default function HeroSlideshow({ slides }: { slides: GalleryItem[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  /** Set once the visitor picks a slide themselves — never auto-advances again. */
  const [manual, setManual] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  /**
   * Only slide 0 at first. Mounting slide 1 alongside it put two full-size
   * hero photos on the wire at once — 224KB competing for the same bandwidth
   * — and pushed mobile LCP to 4.8s. Slide 1 is not needed for three seconds,
   * so it is mounted after the first one has had the connection to itself.
   */
  const [mounted, setMounted] = useState<number[]>([0]);

  const running = !reduced && !hovered && !manual && !tabHidden && slides.length > 1;

  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      // Mount the target itself — jumping straight to a slide via a dot would
      // otherwise land on an index that was never mounted and render blank —
      // plus the one after it, so the following cross-fade has something to
      // fade into.
      setMounted((prev) => {
        const wanted = [next, (next + 1) % slides.length];
        const missing = wanted.filter((i) => !prev.includes(i));
        return missing.length ? [...prev, ...missing] : prev;
      });
    },
    [slides.length]
  );

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Queue the second slide once the first has loaded, so the LCP image never
  // shares bandwidth with a photo nobody is looking at yet.
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setTimeout(
      () => setMounted((prev) => (prev.includes(1) ? prev : [...prev, 1])),
      1400
    );
    return () => window.clearTimeout(id);
  }, [slides.length]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () => goTo((index + 1) % slides.length),
      INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [running, index, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="arch relative aspect-[4/5] overflow-hidden bg-brand-tint shadow-ink-lg">
        {slides.map((slide, i) => {
          if (!mounted.includes(i)) return null;
          const active = i === index;
          return (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : FADE_S, ease: "easeInOut" }}
              // Only the visible slide is exposed; the stack underneath would
              // otherwise read out as a pile of duplicate images.
              aria-hidden={!active}
            >
              <Image
                src={slide.src as string}
                alt={slide.alt}
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                priority={i === 0}
                // Slightly harder compression than the gallery: this is the
                // LCP image and the biggest single download on a phone, and
                // it is seen at a glance rather than studied.
                quality={62}
                className="object-cover"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Twelve dots at a comfortable width overflow a 390px screen, so the
          row wraps rather than pushing the page sideways. Each button keeps a
          44px-tall hit area even though the dot itself is 8px. */}
      {slides.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-0.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                setManual(true);
                goTo(i);
              }}
              aria-label={`הצגת תמונה ${i + 1} מתוך ${slides.length}`}
              aria-current={i === index ? "true" : undefined}
              className="group flex h-11 w-6 items-center justify-center"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 bg-brand-deep"
                    : "w-2 bg-ink/20 group-hover:bg-ink/40"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
