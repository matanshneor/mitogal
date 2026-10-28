/**
 * Points <Image> at the files scripts/optimize-images.mjs made at build time,
 * so the server never resizes a photo on request. See that script for why.
 *
 * For each width the browser asks for, this returns the smallest prepared
 * file that is at least that wide (or the largest one, for small originals).
 * A photo the build hasn't seen — e.g. one just uploaded from /admin, before
 * the redeploy finishes — is served as the original file.
 */
import manifest from "./image-manifest.json";

const prepared = manifest as Record<string, number[]>;

export default function imageLoader({ src, width }: { src: string; width: number }) {
  const widths = prepared[src];
  if (!widths) return `${src}?w=${width}`;

  const pick = widths.find((w) => w >= width) ?? widths[widths.length - 1];
  return `/_opt${src.replace(/\.[^.]+$/, "")}.${pick}.webp`;
}
