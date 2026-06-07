/**
 * Gera icon-192.png e icon-512.png a partir de icons/icon.svg
 * Requer: npm install sharp
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const svgPath = path.join(ROOT, 'icons', 'icon.svg');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (_) {
  console.error('Instale sharp: npm install sharp');
  process.exit(1);
}

const svg = fs.readFileSync(svgPath);

for (const size of [192, 512]) {
  const out = path.join(ROOT, 'icons', `icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log('Gerado:', out);
}
