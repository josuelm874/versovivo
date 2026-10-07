// Reanalisa MP4/refs já gerados (sem aparelho). Uso: node scripts/qa/reanalyze.mjs <id> ...
import fs from 'node:fs';
import { SCENARIOS } from './device-matrix.mjs';
import { analyze } from './analyze-video.mjs';
const SIZES = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080] };
const D = 'qa-results/device/';
for (const id of process.argv.slice(2)) {
  const cfg = SCENARIOS.find((s) => s.id === id); const [w, h] = SIZES[cfg.aspect];
  const refs = fs.readdirSync(D).filter((f) => f.startsWith(id + '_ref_')).map((f) => ({ t: +f.match(/_ref_([\d.]+)\.png/)[1], png: D + f })).sort((a, b) => a.t - b.t);
  const a = { expectDur: cfg.dur, w, h, audioExpected: !!cfg.audioExpected, refs };
  if (cfg.mode !== 'video' && !cfg.noSsim && refs.length) a.textRef = { t: refs[0].t, withText: refs[0].png, noText: D + `${id}_bare_${refs[0].t}.png` };
  if (cfg.mode === 'video' && cfg.text && fs.existsSync(D + `${id}_ref_2.png`)) { a.refs = [{ t: 2, png: D + `${id}_ref_2.png` }]; a.textRef = { t: 2, withText: D + `${id}_ref_2.png`, noText: D + `${id}_bare_2.png` }; a.ssimIgnore = true; }
  if (cfg.noSsim && cfg.mode !== 'video') a.refs = [];
  if (cfg.noSsim) a.noSsim = true; if (cfg.noFreezeCheck) a.noFreezeCheck = true; if (!cfg.text) a.noText = true; if (cfg.avSync) a.avSync = cfg.avSync;
  const rep = await analyze(D + id + '.mp4', a); rep.id = id; rep.desc = cfg.desc;
  fs.writeFileSync(D + id + '.json', JSON.stringify(rep, null, 1));
  console.log(id.padEnd(28), rep.score.total + '/100', rep.score.grade, '| ssim', JSON.stringify(rep.ssimFrames?.map((x) => x.ssim)));
}
