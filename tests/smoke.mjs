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

check('export imagens usa renderSlideshowFrameAccurateLoop', () => {
  const main = readMainScript();
  const exp = exportJs;
  assert(main.includes('renderSlideshowFrameAccurateLoop'), 'slideshow frame-accurate');
  assert(exp.includes('renderSlideshowFrameAccurateLoop'), 'função no módulo export');
});

check('export Full HD nos presets', () => {
  const s = readMainScript();
  assert(s.includes('rw: 1080, rh: 1920'), '9:16 Full HD');
  assert(s.includes('rw: 1920, rh: 1080'), '16:9 Full HD');
});

check('bitrate adaptativo no export', () => {
  assert(exportJs.includes('getExportVideoBitrate'), 'bitrate por resolução');
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

check('crossfade loop última→primeira sem pos>=fadeMs', () => {
  const s = readMainScript();
  assert(!/within < fadeMs && pos >= fadeMs/.test(s), 'condição que bloqueava wrap');
  assert(/idx === 0 \? imgCount - 1 : idx - 1/.test(s), 'prevIdx no wrap');
});

check('slideClockMs separado do playMs', () => {
  assert(readMainScript().includes('slideClockMs'), 'relógio contínuo');
});

check('index.html referencia image-enhance.js', () => {
  assert(html.includes('js/image-enhance.js'), 'módulo enhance não linkado');
});

check('VVEnhance expõe enhanceBatch', () => {
  const enhance = read('js/image-enhance.js');
  new Function(enhance);
  assert(/VVEnhance/.test(enhance) && /enhanceBatch/.test(enhance), 'API enhance');
});

check('melhorar qualidade nas configurações', () => {
  assert(readMainScript().includes('enhancePhotos'), 'flag enhancePhotos');
  assert(readMainScript().includes('enhanceVideos'), 'flag enhanceVideos');
  assert(html.includes('id="home-settings"'), 'botão configurações');
  assert(html.includes('id="settings-enhance-photos"'), 'toggle imagens');
  assert(html.includes('id="settings-enhance-videos"'), 'toggle vídeos');
  assert(!html.includes('id="tl-enhance"'), 'toggle legado removido da timeline');
});

check('SW cache v12', () => {
  assert(sw.includes('versovivo-v13'), 'versão cache desatualizada');
});

check('SW cache inclui scripts principais', () => {
  assert(sw.includes('versovivo.js'), 'SW não cacheia app principal');
  assert(sw.includes('image-enhance.js'), 'SW não cacheia enhance');
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

check('barra de progresso imagens', () => {
  assert(html.includes('id="tl-img-progress"'), 'tl-img-progress');
});

check('tutorial cobre funções principais', () => {
  const s = readMainScript();
  assert(s.includes('loadTutorialDemoAssets'), 'demo tutorial');
  assert(html.includes('data-tut="legibilidade"'), 'marcador legibilidade');
  assert((s.match(/title: '/g) || []).length >= 45, 'passos suficientes');
});

check('tutorial cobre todos data-tut do editor', () => {
  const tutBlock = readMainScript().slice(
    readMainScript().indexOf('const TUTORIAL_STEPS'),
    readMainScript().indexOf('function tutorialVisibleCount')
  );
  const skipIds = new Set(['configuracoes', 'configuracoes-btn']);
  const ids = [...html.matchAll(/data-tut="([^"]+)"/g)].map(m => m[1]);
  const editorSection = html.slice(html.indexOf('id="editor"'), html.indexOf('<!-- File inputs -->'));
  const editorIds = [...editorSection.matchAll(/data-tut="([^"]+)"/g)].map(m => m[1]);
  const homeIds = ['configuracoes-btn', 'enhance-imagens', 'enhance-videos'];
  const required = [...new Set([...editorIds, ...homeIds])].filter(id => !skipIds.has(id));
  const missing = required.filter(id => !tutBlock.includes(`data-tut="${id}"`) && !tutBlock.includes(`#${id}`));
  assert(missing.length === 0, `passos faltando: ${missing.join(', ')}`);
});

check('assets tutorial existem', () => {
  assert(fs.existsSync(path.join(ROOT, 'assets/tutorial/demo-1.jpg')), 'demo-1.jpg');
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
