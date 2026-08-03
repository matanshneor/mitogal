import Image from "next/image";
import { Spark } from "./Logo";

/**
 * Renders a real photograph when one exists, and a coloured placeholder frame
 * when it doesn't — identical dimensions either way, so dropping in real
 * photos never shifts the layout.
 *
 * Placeholders now carry the category's own colour instead of a beige
 * gradient. That single change is what stops the gallery reading as an empty
 * grid while Gal's photos are still on the way.
 */

const ASPECT: Record<string, string> = {
  tall: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[4/3]",
  hero: "aspect-[4/5]",
  portrait: "aspect-[4/5]",
};

const SHAPE = {
  /** Die-cut rounded rectangle — the default for gallery tiles. */
  card: "rounded-[1.5rem]",
  /** The balloon arch, reserved for the hero and Gal's portrait. */
  arch: "arch",
} as const;

export default function MediaTile({
  src,
  alt,
  aspect = "square",
  shape = "card",
  label,
  /** Tailwind background class for the placeholder, e.g. "bg-cat-weddings". */
  tintClass = "bg-brand-tint",
  priority = false,
  sizes = "(min-width: 768px) 33vw, 50vw",
  className = "",
}: {
  src?: string;
  /** Describes the photograph. Required even for placeholders. */
  alt: string;
  aspect?: keyof typeof ASPECT;
  shape?: keyof typeof SHAPE;
  /** Category name shown inside the placeholder, e.g. "חתונות". */
  label?: string;
  tintClass?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const frame = `relative overflow-hidden ${SHAPE[shape]} ${ASPECT[aspect]} ${className}`;

  if (src) {
    return (
      <div className={frame}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  // No photo yet — say so honestly rather than pretending this is an image.
  return (
    <div
      className={`${frame} ${tintClass}`}
      role="img"
      aria-label={label ? `${label} — תמונה תתווסף בקרוב` : "תמונה תתווסף בקרוב"}
    >
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <Spark className="h-5 w-5 text-ink/25" />
          <span className="font-display text-lg font-medium text-ink/50">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
