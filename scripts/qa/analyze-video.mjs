// Analisador objetivo de vídeo exportado + nota 0–100.
// Uso: import { analyze } from './analyze-video.mjs'   ou   node scripts/qa/analyze-video.mjs <video> [duracaoEsperada] [WxH]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
const FF = createRequire(import.meta.url)('ffmpeg-static');

const ff = (args, opts = {}) => spawnSync(FF, ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const err = (r) => (r.stderr || '') + (r.stdout || '');
const stat = (xs) => { const s = [...xs].sort((a, b) => a - b); const n = s.length || 1; const mean = xs.reduce((a, b) => a + b, 0) / n; return { n: xs.length, mean, min: s[0], max: s[s.length - 1], p50: s[Math.floor(n * 0.5)], p99: s[Math.min(n - 1, Math.floor(n * 0.99))], sd: Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n) }; };

export function probe(file) {
  const t = err(ff(['-i', file]));
  const dur = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(t);
  const seconds = dur ? +dur[1] * 3600 + +dur[2] * 60 + +dur[3] : NaN;
  const v = /Stream #\d+:\d+[^\n]*Video:\s*([a-z0-9]+)(?:\s*\(([^)]*)\))?[^\n]*?,\s*(yuv\w+)[^\n]*?,\s*(\d+)x(\d+)(?:\s*\[SAR (\d+:\d+)[^\]]*\])?/.exec(t);
  const a = /Stream #\d+:\d+[^\n]*Audio:\s*([a-z0-9_]+)[^\n]*?,\s*(\d+) Hz,\s*(\w+)/.exec(t);
  const br = /bitrate:\s*(\d+) kb\/s/.exec(t);
  return {
    seconds, bitrateKbps: br ? +br[1] : NaN, sizeMB: fs.statSync(file).size / 1048576,
    video: v ? { codec: v[1], profile: v[2], pix: v[3], w: +v[4], h: +v[5], sar: v[6] || '1:1' } : null,
    audio: a ? { codec: a[1], hz: +a[2], layout: a[3] } : null,
  };
}

function frameTiming(file) {
  const r = ff(['-i', file, '-map', '0:v:0', '-vf', 'showinfo', '-f', 'null', '-']);
  const ts = [...err(r).matchAll(/pts_time:\s*([\d.]+)/g)].map((m) => +m[1]).sort((a, b) => a - b);
  const gaps = ts.slice(1).map((t, i) => (t - ts[i]) * 1000);
  const g = stat(gaps.length ? gaps : [0]);
  const span = ts.length > 1 ? ts[ts.length - 1] - ts[0] : 0;
  return { frames: ts.length, avgFps: span > 0 ? (ts.length - 1) / span : 0, gapMs: { mean: g.mean, p50: g.p50, p99: g.p99, max: g.max, sd: g.sd }, stalls200: gaps.filter((x) => x > 200).length, stalls100: gaps.filter((x) => x > 100).length };
}

const count = (text, re) => (text.match(re) || []).length;
function defects(file) {
  const black = err(ff(['-i', file, '-an', '-vf', 'blackdetect=d=0.15:pic_th=0.97:pix_th=0.08', '-f', 'null', '-']));
  const freeze = err(ff(['-i', file, '-an', '-vf', 'freezedetect=n=-55dB:d=0.7', '-f', 'null', '-']));
  return { blackSegments: count(black, /black_start/g), freezeSegments: count(freeze, /freeze_start/g) };
}

function audioStats(file) {
  const vol = err(ff(['-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-']));
  const loud = err(ff(['-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']));
  const sil = err(ff(['-i', file, '-vn', '-af', 'silencedetect=n=-50dB:d=1.5', '-f', 'null', '-']));
  const m = /mean_volume:\s*(-?[\d.]+) dB/.exec(vol), mx = /max_volume:\s*(-?[\d.]+) dB/.exec(vol);
  const I = [...loud.matchAll(/\bI:\s*(-?[\d.]+) LUFS/g)].pop(), P = [...loud.matchAll(/Peak:\s*(-?[\d.]+) dBFS/g)].pop();
  const ad = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(err(ff(['-i', file])));
  return { meanDb: m ? +m[1] : null, maxDb: mx ? +mx[1] : null, lufs: I ? +I[1] : null, truePeak: P ? +P[1] : null, silences: count(sil, /silence_start/g) };
}

/** SSIM de um quadro do vídeo (no tempo t) contra um PNG de referência (mesmo tamanho). */
export function ssimAt(file, t, refPng, w, h) {
  const tmp = path.join(path.dirname(file), `.frame_${Math.round(t * 1000)}.png`);
  ff(['-y', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `scale=${w}:${h}:flags=bicubic`, tmp]);
  const r = ff(['-i', tmp, '-i', refPng, '-lavfi', `[0:v]scale=${w}:${h}[a];[1:v]scale=${w}:${h}[b];[a][b]ssim`, '-f', 'null', '-']);
  const m = /All:([\d.]+)/.exec(err(r));
  return { ssim: m ? +m[1] : null, frame: tmp };
}

const lumOf = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
/** Contraste do texto no quadro exportado: pixels de texto (diferença entre render com/sem texto) vs anel de fundo ao redor. */
export async function textContrast(frame, withText, noText, w, h) {
  const rd = async (p) => (await sharp(p).resize(w, h, { fit: 'fill' }).removeAlpha().raw().toBuffer());
  const [F, A, B] = [await rd(frame), await rd(withText), await rd(noText)];
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) { const d = Math.abs(A[i * 3] - B[i * 3]) + Math.abs(A[i * 3 + 1] - B[i * 3 + 1]) + Math.abs(A[i * 3 + 2] - B[i * 3 + 2]); mask[i] = d > 120 ? 1 : 0; }
  // anel: dilata a máscara por R px (caixa) e remove a própria máscara
  const R = Math.max(4, Math.round(w * 0.012)); const ring = new Uint8Array(w * h);
  const integ = new Int32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += mask[y * w + x]; integ[(y + 1) * (w + 1) + x + 1] = integ[y * (w + 1) + x + 1] + row; } }
  const box = (x0, y0, x1, y1) => integ[y1 * (w + 1) + x1] - integ[y0 * (w + 1) + x1] - integ[y1 * (w + 1) + x0] + integ[y0 * (w + 1) + x0];
  let nT = 0, nB = 0, lb = 0; const tl = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const i = y * w + x; const near = box(Math.max(0, x - R), Math.max(0, y - R), Math.min(w, x + R + 1), Math.min(h, y + R + 1)) > 0;
    const L = lumOf(F[i * 3], F[i * 3 + 1], F[i * 3 + 2]);
    if (mask[i]) { tl.push(L); nT++; } else if (near) { lb += L; nB++; }
  }
  if (!nT || !nB) return { ratio: null, textPx: nT, ringPx: nB };
  tl.sort((a, b) => a - b); const Lt = tl[Math.floor(tl.length * 0.97)]; /* preenchimento do glifo */ const Lb = tl[Math.floor(tl.length * 0.5)]; /* fundo imediato atrás das letras (inclui a caixa/sombra) */ const [hi, lo] = Lt > Lb ? [Lt, Lb] : [Lb, Lt];
  return { ratio: (hi + 0.05) / (lo + 0.05), textL: Lt, bgL: Lb, textPx: nT, ringPx: nB };
}

/** Nota 0–100 com rubrica. cfg: {expectDur, w, h, audioExpected, ssims:[...], contrast} */
export function score(rep, cfg) {
  const S = []; const add = (name, max, got, note) => S.push({ name, max, got: Math.max(0, Math.min(max, Math.round(got * 10) / 10)), note });
  const p = rep.probe;
  // 1) compatibilidade (15)
  let c = 0; const cn = [];
  if (p.video?.codec === 'h264') c += 5; else cn.push('codec≠h264');
  if (p.video?.pix === 'yuv420p') c += 3; else cn.push('pix≠yuv420p');
  if (p.video && /High|Main|Baseline|Constrained/i.test(p.video.profile || 'High')) c += 2;
  if (p.video?.sar === '1:1') c += 2; else cn.push('SAR≠1:1');
  if (!cfg.audioExpected || p.audio) c += 3; else cn.push('sem áudio');
  add('Compatibilidade (H.264/yuv420p/SAR/áudio)', 15, c, cn.join(', ') || 'ok');
  // 2) resolução (10)
  add('Resolução exata', 10, p.video && p.video.w === cfg.w && p.video.h === cfg.h ? 10 : 0, p.video ? `${p.video.w}x${p.video.h}` : 'n/d');
  // 3) duração (10)
  const dErr = Math.abs(p.seconds - cfg.expectDur) / cfg.expectDur;
  add('Duração', 10, dErr <= 0.02 ? 10 : dErr <= 0.04 ? 8 : dErr <= 0.08 ? 5 : 0, `${p.seconds.toFixed(2)}s vs ${cfg.expectDur}s (${(dErr * 100).toFixed(1)}%)`);
  // 4) ritmo de quadros (15)
  const t = rep.timing; let f = 0;
  f += t.avgFps >= 29 ? 6 : t.avgFps >= 25 ? 4 : t.avgFps >= 20 ? 2 : 0;
  f += t.gapMs.p99 <= 70 ? 5 : t.gapMs.p99 <= 100 ? 3 : t.gapMs.p99 <= 150 ? 1 : 0;
  f += t.stalls200 === 0 ? 4 : 0;
  add('Ritmo de quadros', 15, f, `${t.avgFps.toFixed(1)} fps · p99 ${t.gapMs.p99.toFixed(0)}ms · max ${t.gapMs.max.toFixed(0)}ms · stalls>200ms: ${t.stalls200}`);
  // 5) defeitos (10)
  const d = rep.defects;
  const fz = cfg.noFreezeCheck ? 0 : d.freezeSegments;
  add('Sem quadros pretos/congelados', 10, 10 - Math.min(10, d.blackSegments * 5 + fz * 3), `pretos ${d.blackSegments} · congelados ${d.freezeSegments}${cfg.noFreezeCheck ? ' (ignorado: imagem estática por definição)' : ''}`);
  // 6) fidelidade (15)
  const ss = cfg.ssimIgnore ? [] : (rep.ssims || []).filter((x) => x != null); const mean = ss.length ? ss.reduce((a, b) => a + b, 0) / ss.length : null; const mn = ss.length ? Math.min(...ss) : null;
  if (!cfg.noSsim && !cfg.ssimIgnore) add('Fidelidade ao preview (SSIM)', 15, mean == null ? 0 : mean >= 0.97 && mn >= 0.93 ? 15 : mean >= 0.95 ? 12 : mean >= 0.92 ? 8 : mean >= 0.88 ? 4 : 0, mean == null ? 'n/d' : `média ${mean.toFixed(4)} · mín ${mn.toFixed(4)} (${ss.length} quadros)`);
  // 7) legibilidade (10)
  const cr = rep.contrast?.ratio;
  if (!cfg.noText) add('Legibilidade do texto (contraste)', 10, cr == null ? 5 : cr >= 4.5 ? 10 : cr >= 3 ? 7 : cr >= 2 ? 3 : 0, cr == null ? 'sem texto' : `${cr.toFixed(2)}:1`);
  // 8) áudio (10)
  if (!cfg.audioExpected) add('Áudio', 10, 10, 'não esperado');
  else {
    const a = rep.audio; let s = 0; const an = [];
    if (p.audio) s += 3; if (a.maxDb != null && a.maxDb <= -0.3) s += 3; else an.push('clipping');
    if (a.lufs != null && a.lufs >= -24 && a.lufs <= -9) s += 2; else an.push('volume fora da faixa');
    if (a.silences === 0) s += 2; else an.push('silêncio longo');
    add('Áudio', 10, s, `LUFS ${a.lufs} · pico ${a.maxDb}dB · ${an.join(', ') || 'ok'}`);
  }
  // 9) tamanho/bitrate (5)
  const okSize = p.sizeMB <= 120 && p.bitrateKbps >= 4000 && p.bitrateKbps <= 40000;
  add('Tamanho/bitrate', 5, okSize ? 5 : 2, `${p.sizeMB.toFixed(1)}MB · ${p.bitrateKbps}kbps`);
  const total = S.reduce((a, b) => a + b.got, 0), max = S.reduce((a, b) => a + b.max, 0);
  const pct = Math.round((total / max) * 100);
  return { total: pct, grade: pct >= 90 ? 'EXCELENTE' : pct >= 75 ? 'BOM' : 'REPROVADO', items: S };
}

/** Sincronia A/V: instante em que o áudio “acende” (bipe) vs instante em que a luminância cruza 50% (wipe preto→branco). */
export function avSync(file) {
  const v = err(ff(['-i', file, '-an', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-']));
  const rows = [...v.matchAll(/pts_time:([\d.]+)[\s\S]*?YAVG=([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const lo = Math.min(...rows.map((r) => r[1])), hi = Math.max(...rows.map((r) => r[1])), mid = (lo + hi) / 2;
  // 1º cruzamento ascendente (preto→branco) depois de 1,5 s (o loop faz um fade branco→preto em t=0)
  let vis = null;
  for (let i = 1; i < rows.length; i++) { if (rows[i][0] > 1.5 && rows[i - 1][1] < mid && rows[i][1] >= mid) { const [t0, y0] = rows[i - 1], [t1, y1] = rows[i]; vis = +(t0 + (mid - y0) / (y1 - y0) * (t1 - t0)).toFixed(3); break; } }
  const au = err(ff(['-i', file, '-vn', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-']));
  const ar = [...au.matchAll(/pts_time:([\d.]+)[\s\S]*?RMS_level=(-?[\d.]+|-inf)/g)].map((m) => [+m[1], m[2] === '-inf' ? -200 : +m[2]]);
  const beep = ar.find((r) => r[1] > -30)?.[0] ?? null;
  return { visualMidS: vis, beepS: beep, offsetMs: vis != null && beep != null ? Math.round((beep - vis) * 1000) : null, luma: [lo, hi] };
}

export async function analyze(file, cfg) {
  const rep = { file, probe: probe(file) };
  rep.timing = frameTiming(file); rep.defects = defects(file); rep.audio = rep.probe.audio ? audioStats(file) : {};
  rep.ssims = []; rep.ssimFrames = [];
  for (const r of cfg.refs || []) {
    // tolerância temporal: captura a 30 fps => o quadro exportado pode estar ±1–2 quadros do instante pedido; vale o melhor casamento
    let best = null;
    for (const d of cfg.exactTime ? [0] : [0, -1 / 30, 1 / 30, -2 / 30, 2 / 30]) {
      const s = ssimAt(file, Math.max(0, r.t + d), r.png, cfg.w, cfg.h);
      if (!best || (s.ssim ?? 0) > (best.ssim ?? 0)) best = { ...s, d };
    }
    rep.ssims.push(best.ssim); rep.ssimFrames.push({ t: r.t, ssim: best.ssim, shiftFrames: Math.round(best.d * 30) }); r._frame = best.frame;
  }
  if (cfg.textRef) rep.contrast = await textContrast(cfg.refs.find((r) => r.t === cfg.textRef.t)._frame, cfg.textRef.withText, cfg.textRef.noText, cfg.w, cfg.h);
  if (cfg.avSync) { rep.sync = avSync(file); }
  rep.score = score(rep, cfg);
  if (cfg.avSync) { const o = rep.sync.offsetMs; const ok = o != null && Math.abs(o) <= 40; rep.score.items.push({ name: 'Sincronia áudio/vídeo (bipe × wipe)', max: 0, got: 0, note: `bipe ${rep.sync.beepS}s · luz 50% ${rep.sync.visualMidS}s · desvio ${o}ms (alvo ±40ms) → ${ok ? 'OK' : 'FORA'}` }); }
  return rep;
}

if (process.argv[1] && process.argv[1].endsWith('analyze-video.mjs') && process.argv[2]) {
  const [, , file, dur, wh] = process.argv; const [w, h] = (wh || '1080x1920').split('x').map(Number);
  const rep = await analyze(file, { expectDur: +dur || 20, w, h, audioExpected: false });
  console.log(JSON.stringify({ probe: rep.probe, timing: rep.timing, defects: rep.defects, score: rep.score }, null, 1));
}
