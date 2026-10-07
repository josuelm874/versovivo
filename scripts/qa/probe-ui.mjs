// Fluxo 100% por toques reais via uiautomator (sem CDP): novo projeto -> ← -> Voltar. Registra callbacks nativos.
import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8', maxBuffer: 1 << 26 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NL = String.fromCharCode(10);
function nodes() { sh('adb shell uiautomator dump /sdcard/ui.xml'); return sh('adb shell cat /sdcard/ui.xml'); }
async function tapText(re, tries = 6) {
  for (let i = 0; i < tries; i++) { if (tapOnce(re)) return true; await sleep(1000); }
  return false;
}
function tapOnce(re) {
  const xml = nodes(); const m = [...xml.matchAll(/<node [^>]*?(?:text|content-desc)="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)].find((x) => re.test(x[1]));
  if (!m) return false;
  const x = (+m[2] + +m[4]) / 2 | 0, y = (+m[3] + +m[5]) / 2 | 0; sh(`adb shell input tap ${x} ${y}`); console.log('toque', m[1].slice(0, 30), x, y); return true;
}
sh('adb shell am force-stop app.versovivo.editor'); sh('adb shell am start -n app.versovivo.editor/.MainActivity'); await sleep(2500);
// pula a intro só se a flag existir; senão aguarda o fim
await sleep(Number(process.env.INTRO || 9000));
await tapText(/Novo poema/); await sleep(1000); await tapText(/^OK$/, 2); await sleep(1500); await tapText(/9:16/); await sleep(2000);
await tapText(/^← In/); await sleep(1500);
sh('adb logcat -c'); sh('adb shell input keyevent KEYCODE_BACK'); await sleep(3000);
console.log(sh('adb logcat -d').split(NL).filter((l) => /VVBack|VVLife/.test(l)).map((l) => l.slice(0, 90)).join(NL));
console.log('foco:', (sh('adb shell dumpsys window').split(NL).find((l) => l.includes('mCurrentFocus')) || '').trim());
