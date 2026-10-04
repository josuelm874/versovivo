import { cpSync, rmSync, mkdirSync } from 'node:fs';
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const p of ['index.html', 'manifest.webmanifest', 'sw.js', 'js', 'icons', 'assets']) cpSync(p, `www/${p}`, { recursive: true });
console.log('www ok');
