// Extrai o monograma "V" da arte-fonte (sem o texto VERSO), vetoriza com potrace e gera os ícones.
// Uso: node scripts/make-logo.mjs <imagem-fonte.jpg>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
const require = createRequire(import.meta.url);
const potrace = require('potrace');

const src = process.argv[2];
if (!src) { console.error('Uso: node scripts/make-logo.mjs <imagem>'); process.exit(1); }
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const BURGUNDY = '#6E1A1F';
const CREAM = '#F3E9D8';

// 1) recorte do V (acima do texto), ampliado e suavizado => bordas limpas no trace
const CROP = { left: 215, top: 180, width: 300, height: 255 };
const SCALE = 6;
const buf = await sharp(src).extract(CROP).greyscale()
  .resize(CROP.width * SCALE, CROP.height * SCALE, { kernel: 'lanczos3' })
  .blur(3).threshold(140).png().toBuffer();

// 2) vetoriza
const trace = (b) => new Promise((res, rej) => potrace.trace(b, { threshold: 128, turdSize: 400, optTolerance: 0.4, color: BURGUNDY, background: 'transparent' }, (e, svg) => e ? rej(e) : res(svg)));
const rawSvg = await trace(buf);
const d = [...rawSvg.matchAll(/ d="([^"]+)"/g)].map(m => m[1]).join(' ');
const W = CROP.width * SCALE, H = CROP.height * SCALE;
if (!d) throw new Error('trace vazio');

// 3) normaliza o V para um quadrado de 1000 centrado (path em coordenadas originais + transform)
const bbox = await sharp(buf).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
const { trimOffsetLeft: ox, trimOffsetTop: oy } = bbox.info; // offsets negativos
const gw = bbox.info.width, gh = bbox.info.height;
const left = -ox, top = -oy;
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${gw} ${gh}"><path fill="${BURGUNDY}" fill-rule="evenodd" d="${d}"/></svg>`;
fs.writeFileSync(path.join(ROOT, 'icons', 'mark.svg'), MARK);

// 4) ícone completo 512: fundo creme, filete fino, V centrado
const box = 512 * 0.5; // largura do V
const sc = box / gw;
const tx = 256 - (left + gw / 2) * sc, ty = 256 - (top + gh / 2) * sc + 4;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${CREAM}"/>
  <rect x="26" y="26" width="460" height="460" rx="88" fill="none" stroke="${BURGUNDY}" stroke-opacity=".35" stroke-width="2"/>
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(5)})"><path fill="${BURGUNDY}" fill-rule="evenodd" d="${d}"/></g>
</svg>`;
fs.writeFileSync(path.join(ROOT, 'icons', 'icon.svg'), icon);

// 5) Android adaptive: foreground = V na zona segura (66%), fundo creme
const FG = 432, safe = FG * 0.40; // V ocupa ~40% de 432 (dentro dos 66% centrais)
const fsc = safe / gw;
const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${FG}" height="${FG}" viewBox="0 0 ${FG} ${FG}"><g transform="translate(${(FG / 2 - (left + gw / 2) * fsc).toFixed(2)} ${(FG / 2 - (top + gh / 2) * fsc + 3).toFixed(2)}) scale(${fsc.toFixed(5)})"><path fill="${BURGUNDY}" fill-rule="evenodd" d="${d}"/></g></svg>`;
const res = path.join(ROOT, 'android/app/src/main/res');
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, k] of Object.entries(dens)) {
  const dir = path.join(res, `mipmap-${name}`);
  const full = Math.round(48 * k), fgSize = Math.round(108 * k);
  const rounded = (r) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${full}" height="${full}"><rect width="${full}" height="${full}" rx="${r}" fill="#fff"/></svg>`);
  const base = await sharp(Buffer.from(icon)).resize(full, full).png().toBuffer();
  await sharp(base).composite([{ input: rounded(full * 0.22), blend: 'dest-in' }]).png().toFile(path.join(dir, 'ic_launcher.png'));
  await sharp(base).composite([{ input: rounded(full / 2), blend: 'dest-in' }]).png().toFile(path.join(dir, 'ic_launcher_round.png'));
  await sharp(Buffer.from(fgSvg)).resize(fgSize, fgSize).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));
}
// adaptive-icon: fundo creme + foreground png
fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${CREAM}</color>\n</resources>\n`);
for (const f of ['mipmap-anydpi-v26/ic_launcher.xml', 'mipmap-anydpi-v26/ic_launcher_round.xml']) {
  fs.writeFileSync(path.join(res, f), `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`);
}
for (const f of ['drawable-v24/ic_launcher_foreground.xml', 'drawable/ic_launcher_background.xml']) fs.rmSync(path.join(res, f), { force: true });
console.log('mark.svg', gw, gh, '| path chars', d.length);

// 6) splash do Android: fundo creme + V centrado (mantém o tamanho de cada splash.png existente)
const markPng = (h) => sharp(Buffer.from(MARK)).resize({ height: Math.round(h) }).png().toBuffer();
for (const dir of fs.readdirSync(res).filter(n => /^drawable(-|$)/.test(n))) {
  const f = path.join(res, dir, 'splash.png');
  if (!fs.existsSync(f)) continue;
  const { width, height } = await sharp(f).metadata();
  const m = await markPng(Math.min(width, height) * 0.22);
  await sharp({ create: { width, height, channels: 3, background: CREAM } }).composite([{ input: m, gravity: 'center' }]).png().toFile(f + '.tmp');
  fs.renameSync(f + '.tmp', f);
}
// 7) maskable (sem cantos transparentes) para o manifest
await sharp(Buffer.from(icon)).resize(512, 512).flatten({ background: CREAM }).png().toFile(path.join(ROOT, 'icons', 'icon-maskable-512.png'));
