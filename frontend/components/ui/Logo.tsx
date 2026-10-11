import Image from "next/image";
import { site } from "@/lib/site.config";

/**
 * Gal's actual wordmark — the "MitoGal" hand-script with "Gal" in turquoise.
 *
 * Two assets, both derived from the JPEG Gal supplied (background keyed out to
 * transparency so the mark sits on any surface):
 *   - logo-script.png  the script alone, tight crop      → header, footer
 *   - logo.png         full mark with the watercolour wash → About, OG
 *
 * The script file is named for what it contains rather than "wordmark": it was
 * renamed when the tagline came out of the image, because browsers and the
 * Next image optimiser both cache aggressively by URL and were still serving
 * the old crop — which showed the tagline twice, once baked in and once live.
 *
 * The tagline is NOT part of the image. In the source JPEG "מיתוג לכל אירוע"
 * is only 25px tall, and at that scale compression has smeared the letters
 * into the space between them — there is no ink/background split left to key
 * on, so any crop of it carries a grey haze. It is plain typeset text in the
 * original anyway, not lettering, so it is set here as real text: sharp at
 * every size, correct contrast, and it scales with the layout.
 *
 * `alt` is empty when `decorative`, because in the header the mark is wrapped
 * in a link that already carries its own accessible name.
 */
/*
 * Heights live here, not at the call site, so the script and the tagline stay
 * in proportion to each other wherever the mark appears.
 *
 * The header is 80px tall; `sm` totals ~52px there, which leaves the mark room
 * to breathe while keeping the tagline at 11px — small, but a real text size
 * rather than the 2px it occupied when it was baked into the image.
 */
const SIZES = {
  /** Header. */
  sm: {
    img: "h-9 sm:h-10",
    tagline: "mt-[0.15em] text-[0.6875rem] tracking-[0.2em] sm:text-xs",
  },
  /** Footer — the mark is the focus there, not a marker. */
  lg: {
    img: "h-14 sm:h-16",
    tagline: "mt-[0.2em] text-[0.8125rem] tracking-[0.22em] sm:text-[0.9375rem]",
  },
} as const;

export default function Logo({
  variant = "wordmark",
  size = "sm",
  className = "",
  priority = false,
  decorative = false,
}: {
  variant?: "wordmark" | "full";
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  if (variant === "full") {
    return (
      <Image
        src="/logo.png"
        alt={decorative ? "" : `${site.name} — ${site.tagline}`}
        width={395}
        height={381}
        priority={priority}
        className={className}
      />
    );
  }

  const s = SIZES[size];

  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <Image
        src="/logo-script.png"
        alt={decorative ? "" : site.name}
        width={316}
        height={73}
        priority={priority}
        className={`${s.img} w-auto`}
      />
      {/* Centred under the script, matching the original mark. text-ink/75
          sits between the muted body grey and full ink: it holds its own next
          to the script without competing with it. 7.58:1 on paper. */}
      <span
        className={`${s.tagline} whitespace-nowrap font-body font-bold text-ink/75`}
      >
        {site.tagline}
      </span>
    </span>
  );
}

/**
 * Four-point burst used as a small decorative accent (placeholder tiles,
 * marquee separators, confetti in the hero). Not part of the supplied logo —
 * it is the one added glyph, and it always carries a brand or category
 * colour so it reads as belonging to the identity.
 */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0Z" />
    </svg>
  );
}
