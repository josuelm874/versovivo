/**
 * Smoke tests — validação estática do VersoVivo (sem browser).
 * Executar: npm test  ou  node tests/smoke.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readMainScript() {
  const appPath = path.join(ROOT, 'js', 'versovivo.js');
  assert(fs.existsSync(appPath), 'js/versovivo.js ausente — rode node scripts/extract-main.mjs');
  return fs.readFileSync(appPath, 'utf8');
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

console.log('VersoVivo smoke tests\n');

const html = read('index.html');
const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));
const exportJs = read('js/export-video.js');

check('js/versovivo.js parseia', () => {
  new Function(readMainScript());
});

check('index.html referencia versovivo.js', () => {
  assert(html.includes('js/versovivo.js'), 'script principal não linkado');
});

check('js/export-video.js parseia', () => {
  new Function(exportJs);
});

check('VVExport expõe renderFrameAccurateLoop', () => {
  assert(/renderFrameAccurateLoop/.test(exportJs), 'função ausente');
  assert(/global\.VVExport/.test(exportJs), 'VVExport não exposto');
});

check('index.html referencia export-video.js', () => {
  assert(html.includes('js/export-video.js'), 'script externo não linkado');
});

check('saveProject: IndexedDB antes de localStorage', () => {
  const script = readMainScript();
  const idbIdx = script.indexOf('store.clear()');
  const lsIdx = script.indexOf("localStorage.setItem(LS_KEY");
  assert(idbIdx > 0 && lsIdx > idbIdx, 'ordem de persistência incorreta');
});

check('export imagens usa getPlaybackFadeState', () => {
  assert(readMainScript().includes('getPlaybackFadeState(recElapsed'), 'fade export');
});

check('export vídeo usa VVExport.renderFrameAccurateLoop', () => {
  assert(readMainScript().includes('VVExport.renderFrameAccurateLoop'), 'export frame-accurate');
});

check('applyLayoutTemplate reseta TBOX2/TBOX3', () => {
  const s = readMainScript();
  assert(/TBOX2\.show = false[\s\S]*TBOX3\.show = false/.test(s), 'reset templates');
});

check('BOX_DEFS inclui signature', () => {
  assert(readMainScript().includes('signature:'), 'caixa assinatura');
});

check('barra de progresso imagens', () => {
  assert(html.includes('id="tl-img-progress"'), 'tl-img-progress');
});

check('SW cache inclui versovivo.js', () => {
  assert(sw.includes('versovivo.js'), 'SW não cacheia app principal');
  assert(sw.includes('versovivo-v8'), 'versão cache desatualizada');
});

check('manifest inclui ícones PNG', () => {
  const pngs = manifest.icons.filter(i => i.type === 'image/png');
  assert(pngs.some(i => i.sizes === '192x192'), '192x192');
  assert(pngs.some(i => i.sizes === '512x512'), '512x512');
});

check('arquivos PNG existem no disco', () => {
  assert(fs.existsSync(path.join(ROOT, 'icons/icon-192.png')), 'icon-192.png');
  assert(fs.existsSync(path.join(ROOT, 'icons/icon-512.png')), 'icon-512.png');
});

check('build meta vv-build presente', () => {
  assert(/vv-build/.test(html), 'meta build');
});

console.log('');
if (failures.length) {
  console.error(`Falhou: ${failures.length} teste(s)`);
  process.exit(1);
}
console.log(`OK — ${failures.length === 0 ? 'todos os testes passaram' : ''}`);
