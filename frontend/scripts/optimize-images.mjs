/**
 * Resizes and compresses every photo once, at build time.
 *
 * Why this exists: Next.js can do this on request (the /_next/image route),
 * but on Railway that kept the image library loaded and holding memory for
 * as long as the server ran — the frontend sat at ~670MB with almost no
 * visitors, which was most of the hosting bill. Measured locally: the server
 * idles at ~120MB, and climbs to ~460MB once it has processed the photos.
 *
 * Doing the work here instead means the running server only hands out files
 * that already exist. lib/image-loader.ts points <Image> at them.
 *
 * Output (both generated, both git-ignored):
 *   public/_opt/<path>.<width>.webp   one file per width
 *   lib/image-manifest.json           which widths exist for each photo
 */
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";
import sizes from "../lib/image-sizes.json" with { type: "json" };

const PUBLIC = "public";
const OUT = join(PUBLIC, "_opt");
const MANIFEST = "lib/image-manifest.json";
const WIDTHS = [...sizes.imageSizes, ...sizes.deviceSizes].sort((a, b) => a - b);
// Same as the gallery's old setting. One quality for everything keeps the
// file count down; the hero's slightly harder compression saved little.
const QUALITY = 75;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (path === OUT) return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

rmSync(OUT, { recursive: true, force: true });

const photos = walk(PUBLIC).filter((f) => /\.(jpe?g|png)$/i.test(f));
const manifest = {};
const started = Date.now();

for (const file of photos) {
  // .rotate() with no argument applies the EXIF orientation, so phone photos
  // come out the right way up — the same thing Next's optimizer did.
  const { width: original } = await sharp(file).rotate().metadata();
  // Never upscale: widths above the original collapse into the original size.
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, original)))];

  const src = "/" + relative(PUBLIC, file).split("\\").join("/");
  const base = join(OUT, relative(PUBLIC, file)).replace(/\.[^.]+$/, "");
  mkdirSync(dirname(base), { recursive: true });

  for (const w of widths) {
    await sharp(file)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(`${base}.${w}.webp`);
  }
  manifest[src] = widths;
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `✓ ${photos.length} images optimised in ${((Date.now() - started) / 1000).toFixed(1)}s`
);
