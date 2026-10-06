// Gera mídias sintéticas de borda em test-media/qa (gitignored)
import sharp from 'sharp'; import fs from 'node:fs';
const D = 'test-media/qa'; fs.mkdirSync(D, { recursive: true });
const grad = (w, h, c1, c2) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 4}" fill="#fff" fill-opacity=".35"/></svg>`);
await sharp(grad(320, 240, '#264653', '#e9c46a')).jpeg({ quality: 80 }).toFile(`${D}/tiny_320x240.jpg`);
await sharp(grad(1, 1, '#ff0000', '#ff0000')).png().toFile(`${D}/pixel_1x1.png`);
await sharp(grad(6000, 4000, '#0b3d91', '#f4a261')).jpeg({ quality: 70 }).toFile(`${D}/huge_6000x4000.jpg`);
await sharp(grad(1600, 900, '#2a9d8f', '#e76f51')).png().toFile(`${D}/alpha_1600x900.png`);
await sharp(grad(1200, 1800, '#6a4c93', '#ffca3a')).webp({ quality: 80 }).toFile(`${D}/portrait_1200x1800.webp`);
await sharp(grad(2000, 500, '#1982c4', '#8ac926')).jpeg().toFile(`${D}/panorama_2000x500.jpg`);
fs.writeFileSync(`${D}/corrupt.jpg`, Buffer.from('not an image at all \x00\x01\x02'));
fs.writeFileSync(`${D}/empty.png`, Buffer.alloc(0));
fs.writeFileSync(`${D}/notes.txt`, 'texto qualquer');
console.log(fs.readdirSync(D));
