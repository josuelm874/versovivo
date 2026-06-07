/**
 * Gera imagens de demonstração para o tutorial (720×1280, leves).
 * Executar: npm run tutorial-assets
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'tutorial');

const DEMOS = [
  { file: 'demo-1.jpg', bg: '#8B5CF6', accent: '#C4B5FD', title: 'VersoVivo', sub: 'Demo 1 · Amanhecer' },
  { file: 'demo-2.jpg', bg: '#EC4899', accent: '#FBCFE8', title: 'Poesia', sub: 'Demo 2 · Horizonte' },
  { file: 'demo-3.jpg', bg: '#1E4D8C', accent: '#93C5FD', title: 'Silêncio', sub: 'Demo 3 · Mar' },
];

function svg({ bg, accent, title, sub }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#09090F"/>
    </linearGradient>
  </defs>
  <rect width="720" height="1280" fill="url(#g)"/>
  <circle cx="620" cy="180" r="120" fill="${accent}" opacity="0.25"/>
  <circle cx="120" cy="980" r="180" fill="${accent}" opacity="0.18"/>
  <text x="360" y="560" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, serif" font-size="56" font-weight="700">${title}</text>
  <text x="360" y="630" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="28">${sub}</text>
</svg>`;
}

fs.mkdirSync(OUT, { recursive: true });

for (const demo of DEMOS) {
  const buf = Buffer.from(svg(demo));
  await sharp(buf).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, demo.file));
  console.log('  ✓', demo.file);
}

console.log(`\n${DEMOS.length} imagens em assets/tutorial/`);
