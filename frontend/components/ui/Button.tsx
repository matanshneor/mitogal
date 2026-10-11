import type { ComponentProps, ReactNode } from "react";

/**
 * Pill buttons.
 *
 * `primary` is the burnt coral, which was verified at 5.23:1 against white —
 * it can carry white text and still work as a text colour elsewhere.
 * `onColor` is the inverse, for the brand-coloured contact band and over the
 * hero image, where a coral button would disappear into its background.
 */
/**
 * `primary` is the logo turquoise carrying INK text, not white — that is the
 * exact pairing in Gal's wordmark, and at 10.4:1 it is also the most legible
 * option. White on this turquoise would fail contrast badly.
 */
const VARIANTS = {
  primary: "bg-brand text-ink hover:brightness-105 shadow-brand",
  deep: "bg-brand-deep text-white hover:brightness-110 shadow-brand",
  onColor: "bg-surface text-ink hover:bg-white/90 shadow-ink",
  ink: "bg-ink text-white hover:bg-ink/90 shadow-ink",
  outline:
    "border-2 border-ink/15 bg-transparent text-ink hover:border-brand-deep hover:text-brand-deep",
  whatsapp: "bg-whatsapp text-white hover:brightness-95 shadow-ink",
} as const;

const BASE =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 font-display text-base font-semibold transition-all duration-200";

type Variant = keyof typeof VARIANTS;

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
