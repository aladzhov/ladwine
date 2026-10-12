// Scans the per-month site-background folders and writes a manifest that the
// app fetches at runtime. Image file names are random, so the manifest is the
// only reliable way for a static site to know which images exist per month.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKGROUND_DIR = join(__dirname, '..', 'public', 'ladwine', 'images', 'site-background');
const MANIFEST_PATH = join(BACKGROUND_DIR, 'manifest.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

function extname(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function listImages(monthDir) {
  try {
    return readdirSync(monthDir)
      .filter((name) => {
        const full = join(monthDir, name);
        return statSync(full).isFile() && IMAGE_EXTENSIONS.has(extname(name));
      })
      .sort();
  } catch {
    return [];
  }
}

const manifest = {};
for (const month of MONTHS) {
  manifest[month] = listImages(join(BACKGROUND_DIR, month));
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

const total = Object.values(manifest).reduce((sum, images) => sum + images.length, 0);
console.log(`Generated site-background manifest with ${total} image(s) at ${MANIFEST_PATH}`);
