// Matriz de cenários de exportação NO APARELHO (WebView real) + análise objetiva de cada vídeo.
// Pré-req: adb forward tcp:9222 localabstract:webview_devtools_remote_<pid> ; ANDROID_SERIAL definido.
// Uso: node scripts/qa/device-matrix.mjs [idCenario ...]   (sem args = todos)
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { analyze } from './analyze-video.mjs';

const OUT = 'qa-results/device'; fs.mkdirSync(OUT, { recursive: true });
const PHOTO = (n) => `test-media/img_id_${n}.jpg`;
const QA = (f) => `test-media/qa/${f}`;
const sh = (c) => execSync(c, { encoding: 'utf8', maxBuffer: 1 << 28 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080] };

const POEM = 'O mar guarda em silêncio\ntudo o que o vento esqueceu';
export const SCENARIOS = [
  { id: 'S1-vertical-4fotos', desc: '9:16 · 4 fotos · 12 s · transição suave · legibilidade ativa', aspect: '9:16', files: [1015, 1043, 1036, 1039].map(PHOTO), dur: 12, speed: 3, transition: 'fade', filter: 'none', dim: 25, text: POEM, preset: 'light' },
  { id: 'S2-quadrado-slide-warm', desc: '1:1 · 3 fotos · 10 s · deslizar + filtro quente', aspect: '1:1', files: [1015, 1043, 1036].map(PHOTO), dur: 10, speed: 3, transition: 'slide', filter: 'warm', dim: 20, text: 'Cada verso\né uma janela', preset: 'light' },
  { id: 'S3-paisagem-zoom-bw', desc: '16:9 · 2 fotos · 8 s · zoom + P&B', aspect: '16:9', files: [1015, 1043].map(PHOTO), dur: 8, speed: 4, transition: 'zoom', filter: 'bw', dim: 30, text: 'Preto e branco\nainda é poesia', preset: 'light' },
  { id: 'S4-uma-foto-minimo', desc: '9:16 · 1 foto · 5 s (mínimo) · sem zoom lento', aspect: '9:16', files: [PHOTO(1043)], dur: 5, speed: 5, transition: 'fade', filter: 'none', dim: 20, kenBurns: false, text: 'Um instante', preset: 'light', noFreezeCheck: true },
  { id: 'S5-bordas-mistas', desc: '9:16 · mídias extremas (1×1, 320×240, 6000×4000, WebP, PNG, panorama) · 18 s · cortina', aspect: '9:16', files: ['tiny_320x240.jpg', 'huge_6000x4000.jpg', 'portrait_1200x1800.webp', 'alpha_1600x900.png', 'panorama_2000x500.jpg', 'pixel_1x1.png'].map(QA), dur: 18, speed: 3, transition: 'wipe', filter: 'vivid', dim: 25, text: 'Do menor ao maior\ncabe um verso', preset: 'light', noFreezeCheck: true },
  { id: 'S6-video-musica', desc: '9:16 · vídeo 720p + música + filtro quente', mode: 'video', aspect: '9:16', video: 'test-media/bbb_10s.mp4', audio: 'test-media/music_soundhelix1.mp3', dur: 10, filter: 'warm', dim: 15, text: 'Cada quadro é um verso\nque o tempo não apaga', preset: 'light', noSsim: true, audioExpected: true },
  { id: 'S6a-video-musica-sem-filtro', desc: 'diagnóstico: vídeo + música, SEM filtro', mode: 'video', aspect: '9:16', video: 'test-media/bbb_10s.mp4', audio: 'test-media/music_soundhelix1.mp3', dur: 10, filter: 'none', dim: 0, text: 'Cada quadro é um verso', preset: 'light', noSsim: true, audioExpected: true },
  { id: 'S6b-video-sem-musica-filtro', desc: 'diagnóstico: vídeo + filtro quente, SEM música', mode: 'video', aspect: '9:16', video: 'test-media/bbb_10s.mp4', dur: 10, filter: 'warm', dim: 15, text: 'Cada quadro é um verso', preset: 'light', noSsim: true },
  { id: 'S9-sincronia-av', desc: 'sincronia A/V: bipe em 3,375 s × wipe preto→branco (50% em 3,375 s)', aspect: '9:16', files: ['black.png', 'white.png'].map(QA), dur: 8, speed: 3, transition: 'wipe', filter: 'none', dim: 0, kenBurns: false, text: null, audio: QA('beep_3375ms.mp3'), audioExpected: true, noSsim: true, noFreezeCheck: true, avSync: 3.375 },
  { id: 'S7-video-paisagem', desc: '16:9 · vídeo 720p sem música · vívido', mode: 'video', aspect: '16:9', video: 'test-media/bbb_10s.mp4', dur: 10, filter: 'vivid', dim: 10, text: 'Em movimento', preset: 'light', noSsim: true },
  { id: 'S10-gold-completo', desc: 'TESTE FINAL: 9:16 · 4 fotos · 20 s · transição wipe · filtro quente · escurecer 30% · texto legível · música', aspect: '9:16', files: [1015, 1043, 1036, 1039].map(PHOTO), dur: 20, speed: 5, transition: 'wipe', filter: 'warm', dim: 30, text: POEM, preset: 'light', audio: 'test-media/music_soundhelix1.mp3', audioExpected: true },
  { id: 'S8-longo-60s-musica', desc: '9:16 · 8 fotos · 60 s · música · estabilidade/memória', aspect: '9:16', files: [1015, 1043, 1036, 1039, 1015, 1043, 1036, 1039].map(PHOTO), dur: 60, speed: 7.5, transition: 'fade', filter: 'none', dim: 25, text: POEM, preset: 'light', audio: 'test-media/music_soundhelix1.mp3', audioExpected: true },
];

function adb(c) { return sh(`adb ${c}`); }
function forward() { const pid = adb('shell pidof app.versovivo.editor').trim(); adb(`forward tcp:9222 localabstract:webview_devtools_remote_${pid}`); }
function focus() { return (adb('shell dumpsys window').split('\n').find((l) => l.includes('mCurrentFocus')) || ''); }

export async function runScenario(page, cfg) {
  const log = (...a) => console.log(`[${cfg.id}]`, ...a);
  const [W, H] = SIZES[cfg.aspect];
  page.removeAllListeners('dialog'); page.on('dialog', (d) => d.accept().catch(() => {}));
  const errs = []; const onErr = (e) => errs.push(String(e)); page.on('pageerror', onErr);
  await page.evaluate(() => { localStorage.setItem('versovivo-skip-boot', '1'); localStorage.removeItem('versovivo-project'); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));
  await page.locator('.new-proj').click();
  await page.waitForFunction(() => document.getElementById('editor')?.classList.contains('on'));

  if (cfg.mode === 'video') {
    await page.setInputFiles('#video-input', cfg.video);
    await page.waitForFunction(() => S.mode === 'video' && S.videoReady, null, { timeout: 60_000 });
  } else {
    await page.setInputFiles('#img-input', cfg.files);
    await page.waitForFunction((n) => S.imgs.length >= n, cfg.files.length, { timeout: 90_000 });
  }
  if (cfg.audio) { await page.setInputFiles('#audio-input', cfg.audio); await page.waitForTimeout(2500); }
  await page.evaluate((c) => {
    setAspect(c.aspect);
    if (c.mode !== 'video') { onProjectDurationChange(c.dur); onTimelineSpeedChange(Math.round(c.speed * 10)); setTransition(c.transition || 'fade'); setKenBurns(c.kenBurns !== false); }
    setFilter(c.filter || 'none'); setDim(c.dim || 0);
    if (c.preset) applyLegPreset(c.preset);
  }, cfg);
  if (cfg.text) {
    await page.evaluate(() => createOrEditTextBox());
    await page.locator('#tb-edit').fill(cfg.text);
    await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); });
  }
  await page.waitForTimeout(1200);

  // referências (render do próprio app no tamanho de export) — só slideshow
  const refs = [], extra = {};
  if (cfg.mode !== 'video' && !cfg.noSsim) {
    const total = cfg.dur * 1000, slideMs = cfg.speed * 1000;
    // quadros no meio do "hold" de cada foto e dentro de transições
    const times = [];
    const nImg = cfg.files.length, fadeMs = Math.min(750, slideMs * 0.38);
    for (let i = 0; i < Math.min(nImg, 4); i++) times.push((i * slideMs + slideMs * 0.6) / 1000);
    if (nImg > 1) for (let i = 1; i < Math.min(nImg, 3); i++) { times.push((i * slideMs + fadeMs * 0.15) / 1000); times.push((i * slideMs + fadeMs * 0.85) / 1000); if (cfg.transition === 'fade') times.push((i * slideMs + fadeMs * 0.5) / 1000); }
    const ts = [...new Set(times.filter((t) => t > 0.4 && t < cfg.dur - 0.4).map((t) => +t.toFixed(2)))];
    const data = await page.evaluate(([ts]) => {
      const { rw, rh } = getExportSize(); const mk = () => { const c = document.createElement('canvas'); c.width = rw; c.height = rh; return c; };
      const out = [];
      for (const t of ts) {
        const a = mk(); renderFrame(a.getContext('2d', { alpha: false }), rw, rh, getSlideFadeState(t * 1000, S.imgs.length, S.speed * 1000));
        const b = mk(); const bx = b.getContext('2d', { alpha: false }); VVExport.configureExportCanvas(bx); bx.fillStyle = '#09090F'; bx.fillRect(0, 0, rw, rh); drawMedia(bx, rw, rh, getSlideFadeState(t * 1000, S.imgs.length, S.speed * 1000));
        out.push({ t, full: a.toDataURL('image/png'), bare: b.toDataURL('image/png') });
      } return out;
    }, [ts]);
    for (const d of data) {
      const f = `${OUT}/${cfg.id}_ref_${d.t}.png`, g = `${OUT}/${cfg.id}_bare_${d.t}.png`;
      fs.writeFileSync(f, Buffer.from(d.full.split(',')[1], 'base64')); fs.writeFileSync(g, Buffer.from(d.bare.split(',')[1], 'base64'));
      refs.push({ t: d.t, png: f, bare: g });
    }
  }

  // vídeo: referência só p/ medir contraste do texto (1 quadro em 2 s)
  if (cfg.mode === 'video' && cfg.text) {
    const d = await page.evaluate(async () => {
      const v = S.videoEl; v.pause(); await new Promise((r) => { v.onseeked = r; v.currentTime = 2.0; setTimeout(r, 3000); });
      const { rw, rh } = getExportSize(); const mk = () => { const c = document.createElement('canvas'); c.width = rw; c.height = rh; return c; };
      const a = mk(); renderFrame(a.getContext('2d', { alpha: false }), rw, rh, {});
      const b = mk(); const bx = b.getContext('2d', { alpha: false }); bx.fillStyle = '#09090F'; bx.fillRect(0, 0, rw, rh); drawMedia(bx, rw, rh, {});
      v.currentTime = 0; return { full: a.toDataURL('image/png'), bare: b.toDataURL('image/png') };
    });
    const f = `${OUT}/${cfg.id}_ref_2.png`, g = `${OUT}/${cfg.id}_bare_2.png`;
    fs.writeFileSync(f, Buffer.from(d.full.split(',')[1], 'base64')); fs.writeFileSync(g, Buffer.from(d.bare.split(',')[1], 'base64'));
    extra.contrastRef = { t: 2, png: f, bare: g };
  }

  // exporta
  await page.evaluate(() => { window.__t0 = performance.now(); window.__ok = null; startDownload().then(() => { window.__ok = true; }).catch((e) => { window.__ok = String(e); }); });
  const t0 = Date.now(); let f = '';
  const limit = (cfg.dur + 240) * 1000;
  while (Date.now() - t0 < limit && !/Chooser|intentresolver/i.test(f)) { await sleep(1500); f = focus(); }
  const exportSec = (Date.now() - t0) / 1000;
  const shared = /Chooser|intentresolver/i.test(f);
  log(`export ${exportSec.toFixed(1)}s · folha de compartilhar: ${shared}`);
  const name = adb('shell run-as app.versovivo.editor ls cache').split(/\s+/).filter((x) => /^VersoVivo_.*\.(mp4|webm)$/.test(x))[0];
  const file = `${OUT}/${cfg.id}.mp4`;
  if (name) fs.writeFileSync(file, execSync(`adb exec-out run-as app.versovivo.editor cat cache/${name}`, { maxBuffer: 1 << 30 }));
  adb('shell input keyevent KEYCODE_BACK'); await sleep(1500);
  if (name) adb(`shell run-as app.versovivo.editor rm -f cache/${name}`);
  page.off('pageerror', onErr);
  if (!name || !shared) return { id: cfg.id, desc: cfg.desc, failed: 'export não concluiu', exportSec, errs };

  const aCfg = { expectDur: cfg.dur, w: W, h: H, audioExpected: !!cfg.audioExpected, refs: refs.map((r) => ({ t: r.t, png: r.png })) };
  if (refs.length) aCfg.textRef = { t: refs[0].t, withText: refs[0].png, noText: refs[0].bare };
  if (extra.contrastRef) { aCfg.refs = [{ t: 2, png: extra.contrastRef.png }]; aCfg.textRef = { t: 2, withText: extra.contrastRef.png, noText: extra.contrastRef.bare }; aCfg.ssimIgnore = true; }
  if (!cfg.text) aCfg.noText = true;
  if (cfg.avSync) aCfg.avSync = cfg.avSync;
  if (cfg.noSsim) aCfg.noSsim = true;
  if (cfg.noFreezeCheck) aCfg.noFreezeCheck = true;
  const rep = await analyze(file, aCfg);
  rep.id = cfg.id; rep.desc = cfg.desc; rep.exportSec = exportSec; rep.errs = errs;
  fs.writeFileSync(`${OUT}/${cfg.id}.json`, JSON.stringify(rep, null, 1));
  log(`NOTA ${rep.score.total}/100 ${rep.score.grade} · ${rep.timing.avgFps.toFixed(1)}fps · ${rep.probe.seconds.toFixed(2)}s · ${rep.probe.sizeMB.toFixed(1)}MB`);
  return rep;
}

if (process.argv[1] && process.argv[1].endsWith('device-matrix.mjs')) {
  const want = process.argv.slice(2);
  forward();
  const b = await chromium.connectOverCDP('http://localhost:9222'); const page = b.contexts()[0].pages()[0];
  const results = [];
  for (const sc of SCENARIOS.filter((s) => !want.length || want.includes(s.id))) {
    try { results.push(await runScenario(page, sc)); } catch (e) { console.log(`[${sc.id}] ERRO`, e.message.split('\n')[0]); results.push({ id: sc.id, desc: sc.desc, failed: e.message.split('\n')[0] }); forward(); }
  }
  fs.writeFileSync(`${OUT}/matrix-${Date.now()}.json`, JSON.stringify(results.map((r) => ({ id: r.id, failed: r.failed, total: r.score?.total, grade: r.score?.grade })), null, 1));
  console.log('\nRESUMO'); for (const r of results) console.log(r.id.padEnd(26), r.failed ? 'FALHOU: ' + r.failed : `${r.score.total}/100 ${r.score.grade}`);
  await b.close().catch(() => {});
}
