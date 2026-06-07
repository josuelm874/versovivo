/**
 * Testes unitários — VVEnhance.computeEnhanceTarget e lógica de melhoria.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function loadVVEnhance() {
  const code = fs.readFileSync(path.join(ROOT, 'js/image-enhance.js'), 'utf8');
  return new Function(`${code}\nreturn globalThis.VVEnhance;`)();
}

const failures = [];
function check(name, fn) {
  try {
    fn();
    console.log('  ✓', name);
  } catch (e) {
    failures.push({ name, error: e.message });
    console.log('  ✗', name, '—', e.message);
  }
}

console.log('VersoVivo enhance tests\n');

const VVEnhance = loadVVEnhance();

check('VVEnhance.computeEnhanceTarget existe', () => {
  if (typeof VVEnhance.computeEnhanceTarget !== 'function') throw new Error('ausente');
});

check('foto grande 4000×3000 vs 1080×1920 → null (já adequada)', () => {
  const r = VVEnhance.computeEnhanceTarget(4000, 3000, 1080, 1920);
  if (r !== null) throw new Error(JSON.stringify(r));
});

check('foto pequena 640×480 vs 1080×1920 → upscale', () => {
  const r = VVEnhance.computeEnhanceTarget(640, 480, 1080, 1920);
  if (!r || r.tw <= 640 || r.th <= 480) throw new Error(JSON.stringify(r));
  if (r.tw < 1080 || r.th < 1920) throw new Error(`abaixo do export: ${r.tw}×${r.th}`);
});

check('vídeo 1280×720 vs 1920×1080 → precisa melhoria', () => {
  const r = VVEnhance.computeEnhanceTarget(1280, 720, 1920, 1080);
  if (!r) throw new Error('esperava target para vídeo baixa res');
});

check('applyFrameSharpen exportado', () => {
  if (typeof VVEnhance.applyFrameSharpen !== 'function') throw new Error('ausente');
});

check('maybeSharpenVideoFrame referenciado no app', () => {
  const app = fs.readFileSync(path.join(ROOT, 'js/versovivo.js'), 'utf8');
  if (!app.includes('maybeSharpenVideoFrame')) throw new Error('função ausente');
  if (!app.includes('S.enhanceVideos')) throw new Error('flag enhanceVideos ausente');
});

console.log('');
if (failures.length) {
  console.error(`Falhou: ${failures.length} teste(s)`);
  process.exit(1);
}
console.log('OK — todos os testes de enhance passaram');
