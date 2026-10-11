/** Class strings shared by the /admin screens, matching the contact form. */

export const FIELD =
  "min-h-12 w-full border-0 border-b-2 border-line bg-transparent px-0 pb-2 text-base text-ink transition-colors focus:border-brand-deep focus:outline-none";

export const LABEL = "block text-label font-semibold uppercase text-muted";

export const PRIMARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 font-display text-base font-semibold text-ink shadow-brand transition-all hover:brightness-105 disabled:opacity-60";

export const GHOST =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-deep disabled:opacity-50";

export const CHIP = (active: boolean) =>
  `min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
    active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-brand-tint"
  }`;

export const NOTICE = "rounded-[1rem] px-4 py-3 text-sm text-ink";
