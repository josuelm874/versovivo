/**
 * Extrai o bloco <script> principal de index.html para js/versovivo.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(ROOT, 'index.html');
const outPath = path.join(ROOT, 'js', 'versovivo.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const marker = '<script src="js/export-video.js"></script>\n<script>';
const endMarker = '</script>\n</body>';

const start = html.indexOf(marker);
if (start === -1) throw new Error('Marcador de início não encontrado');
const scriptStart = start + marker.length;

const end = html.indexOf(endMarker, scriptStart);
if (end === -1) throw new Error('Marcador de fim não encontrado');

const js = html.slice(scriptStart, end).trimStart();
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, js + '\n', 'utf8');

const newHtml =
  html.slice(0, start) +
  '<script src="js/export-video.js"></script>\n<script src="js/versovivo.js"></script>\n' +
  html.slice(end);

fs.writeFileSync(htmlPath, newHtml, 'utf8');

const lines = js.split('\n').length;
console.log(`Extraído js/versovivo.js — ${lines} linhas, ${js.length} bytes`);
