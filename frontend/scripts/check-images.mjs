/**
 * Fails the build if the photo folder and the gallery manifest disagree.
 *
 * This exists because a photo once vanished from the site silently: a script
 * that reordered the manifest dropped one entry, the file stayed on disk,
 * and nothing anywhere complained. A missing photo is invisible — there is no
 * error, no gap, just one less piece of work on display.
 *
 * Both directions are hard failures:
 *   - referenced but not on disk  → a broken image for every visitor
 *   - on disk but not referenced  → work that was uploaded and never shown
 *
 * If a file really is meant to sit unused, delete it or move it to brand/.
 */
import { readdirSync, readFileSync } from "node:fs";

const DIR = "public/images/portfolio";
const MANIFEST = "data/gallery.json";
const PREFIX = "/images/portfolio/";

const items = JSON.parse(readFileSync(MANIFEST, "utf8"));
const referenced = new Set(
  items
    .map((item) => item.src)
    .filter((src) => typeof src === "string" && src.startsWith(PREFIX))
    .map((src) => src.slice(PREFIX.length))
);
const onDisk = new Set(
  readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
);

const missing = [...referenced].filter((f) => !onDisk.has(f));
const orphaned = [...onDisk].filter((f) => !referenced.has(f));

if (missing.length || orphaned.length) {
  console.error("\n✗ gallery manifest and photo folder are out of sync\n");
  if (missing.length) {
    console.error(`  referenced in ${MANIFEST} but not in ${DIR}:`);
    missing.forEach((f) => console.error(`    ${f}`));
  }
  if (orphaned.length) {
    console.error(`  in ${DIR} but shown nowhere on the site:`);
    orphaned.forEach((f) => console.error(`    ${f}`));
    console.error(`\n  Add each one to ${MANIFEST}, or delete the file.`);
  }
  console.error("");
  process.exit(1);
}

console.log(`✓ ${referenced.size} photos, manifest and folder agree`);
