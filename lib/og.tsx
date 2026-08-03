import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "./site.config";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Loads a Hebrew-capable font for `ImageResponse`.
 *
 * Satori (which backs ImageResponse) ships no Hebrew glyphs, so without this
 * every OG image would render the Hebrew as empty boxes. The file is read
 * from the installed `next/font` cache at build time — no network call, so
 * the build cannot fail because Google Fonts was slow or blocked.
 *
 * Returns null if the file can't be found, in which case the caller falls
 * back to a Latin-only card rather than failing the build.
 */
export async function loadHebrewFont(): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(
      path.join(process.cwd(), "brand/Assistant-Bold.ttf")
    );
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    ) as ArrayBuffer;
  } catch {
    // Font missing — the caller renders a Latin-only card rather than
    // failing the build.
    return null;
  }
}

/**
 * Reads the "MitoGal" script as a data URI so Satori can embed it.
 *
 * Deliberately the script file and not `logo.png`: the full mark still carries
 * the tagline baked into the JPEG, where it is 25px tall and smeared by
 * compression. The card renders the tagline as text underneath instead, the
 * same way the site header does.
 */
export const LOGO_ASPECT = 316 / 73;

export async function logoDataUri(): Promise<string | null> {
  try {
    const buf = await readFile(
      path.join(process.cwd(), "public/logo-script.png")
    );
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Reorders a Hebrew string for Satori.
 *
 * `next/og` renders through Satori, which does NOT implement the Unicode
 * bidirectional algorithm — `direction: rtl` only affects alignment, so
 * Hebrew comes out letter-reversed ("הופכים" renders as "םיכפוה"). Feeding it
 * the string already in visual order is the standard workaround.
 *
 * Only use this on strings that are entirely Hebrew plus symmetric
 * punctuation. Anything with Latin text or digits (the phone number) must be
 * left alone and marked dir="ltr", since reversing would break it.
 */
export function rtl(s: string): string {
  return [...s].reverse().join("");
}

export const OG = {
  paper: "#F7F9F9",
  ink: "#15191A",
  muted: "#66716F",
  /** The header's tagline colour — ink at 75% over paper, resolved. */
  taglineInk: "#4E5152",
  brand: "#6ED7D8",
  brandDeep: "#3C7677",
  site,
};
