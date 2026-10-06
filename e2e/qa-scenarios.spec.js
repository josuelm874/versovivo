// Campanha de QA — cenários de borda, robustez, persistência, offline, layout e acessibilidade.
// Mídias sintéticas: node scripts/qa/make-media.mjs
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const M = (f) => `test-media/qa/${f}`;
const PHOTO = (n) => `test-media/img_id_${n}.jpg`;
const OUT = 'qa-results'; fs.mkdirSync(OUT, { recursive: true });
const save = (name, data) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 1));

/** coleta erros de página/console durante o teste */
function watch(page) {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('dialog', (d) => {
    if (d.type() === 'confirm') { d.accept().catch(() => {}); return; }          // confirmações legítimas do app
    if (/Nenhuma imagem pôde ser carregada/.test(d.message())) { d.accept().catch(() => {}); return; } // aviso esperado p/ arquivos inválidos
    errs.push('dialog inesperado: ' + d.message()); d.dismiss().catch(() => {});
  });
  return errs;
}

async function open(page, { storage = {} } = {}) {
  await page.addInitScript((st) => {
    localStorage.setItem('versovivo-skip-boot', '1');
    for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v);
  }, storage);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));
}
async function newProject(page) {
  await page.locator('.new-proj').click();
  await expect(page.locator('#editor')).toHaveClass(/on/, { timeout: 15_000 });
}
async function addImages(page, files, n) {
  const before = await page.evaluate(() => S.imgs.length);
  await page.setInputFiles('#img-input', files);
  await page.waitForFunction(([b, k]) => S.imgs.length >= b + k, [before, n ?? files.length], { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(400);
}

test.use({ viewport: { width: 412, height: 892 } });

test.describe('Q1 · importação de mídia (bordas)', () => {
  test('imagens válidas de formatos/tamanhos extremos entram; inválidas são ignoradas sem quebrar', async ({ page }) => {
    test.setTimeout(120_000);
    const errs = watch(page);
    await open(page); await newProject(page);

    const valid = ['tiny_320x240.jpg', 'pixel_1x1.png', 'huge_6000x4000.jpg', 'alpha_1600x900.png', 'portrait_1200x1800.webp', 'panorama_2000x500.jpg'];
    await addImages(page, valid.map(M), valid.length);
    const n = await page.evaluate(() => S.imgs.length);
    expect(n, 'todas as 6 imagens válidas devem entrar').toBe(6);

    // inválidas (não imagem) — o app não pode travar nem lançar exceção não tratada
    await page.setInputFiles('#img-input', [M('corrupt.jpg'), M('empty.png'), M('notes.txt')]);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => S.imgs.length), 'importar só arquivos inválidos NÃO pode apagar as imagens atuais').toBe(6);
    const after = await page.evaluate(() => ({ n: S.imgs.length, dl: !document.getElementById('dl-btn').disabled, ok: document.getElementById('editor').classList.contains('on') }));
    expect(after.ok).toBe(true);
    expect(after.dl, 'export deve continuar disponível').toBe(true);
    expect(after.n).toBeGreaterThanOrEqual(6);
    // canvas renderiza todas sem erro
    const drew = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const x = c.getContext('2d'); let ok = 0;
      for (let i = 0; i < S.imgs.length; i++) { drawMedia(x, 270, 480, { idx: i, prevIdx: i, fadeT: 1, holdT: 0.3 }); const d = x.getImageData(135, 240, 1, 1).data; if (d[3] === 255) ok++; } return ok; });
    expect(drew).toBe(after.n);
    save('q1-import', { valid: n, after, errs });
    expect(errs.filter((e) => !/Failed to load resource|decode|corrupt/i.test(e)), errs.join('\n')).toEqual([]);
  });

  test('12 imagens de uma vez + remover todas: estado consistente', async ({ page }) => {
    test.setTimeout(120_000);
    const errs = watch(page);
    await open(page); await newProject(page);
    const files = []; for (let i = 0; i < 3; i++) files.push(PHOTO(1015), PHOTO(1043), PHOTO(1036), PHOTO(1039));
    await addImages(page, files, 12);
    expect(await page.evaluate(() => S.imgs.length)).toBe(12);
    // remove tudo
    while (await page.evaluate(() => S.imgs.length)) { await page.evaluate(() => removeSlide(0)); }
    expect(await page.evaluate(() => ({ n: S.imgs.length, dl: document.getElementById('dl-btn').disabled }))).toEqual({ n: 0, dl: true });
    // exportar sem mídia não pode estourar
    await page.evaluate(() => startDownload().catch(() => {})).catch(() => {});
    expect(errs.filter((e) => /pageerror/.test(e)), errs.join('\n')).toEqual([]);
  });
});

test.describe('Q2 · textos (conteúdo hostil/extremo)', () => {
  const CASES = {
    longo: 'Poema '.repeat(120),
    emoji: 'Lua 🌙 e mar 🌊 — “aspas” ‘simples’ … ç ã é ü ñ',
    rtl: 'مرحبا بالعالم — שלום עולם',
    html: '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>"><b>negrito</b>',
    linhas: Array.from({ length: 40 }, (_, i) => 'verso ' + i).join('\n'),
    vazio: '',
  };
  for (const [name, text] of Object.entries(CASES)) {
    test(`texto ${name}`, async ({ page }) => {
      const errs = watch(page);
      await open(page); await newProject(page);
      await addImages(page, [PHOTO(1015)], 1);
      await page.evaluate(() => createOrEditTextBox());
      await page.locator('#tb-edit').fill(text);
      await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); });
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => ({ xss: window.__xss === 1, injected: document.querySelectorAll('#editor img[src="x"], #editor script').length, text: S.text.length }));
      expect(r.xss, 'XSS executou').toBe(false);
      expect(r.injected, 'DOM injetado').toBe(0);
      // desenha o texto no canvas de export sem lançar
      const ok = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d'); try { drawMedia(x, 1080, 1920); drawAllTextLayers(x, 1080, 1920, false); return true; } catch (e) { return String(e); } });
      expect(ok).toBe(true);
      expect(errs, errs.join('\n')).toEqual([]);
    });
  }

  test('três caixas (título + verso + assinatura) ficam dentro do quadro nas 3 proporções', async ({ page }) => {
    await open(page); await newProject(page);
    await addImages(page, [PHOTO(1015)], 1);
    await page.evaluate(() => { createOrEditTitleBox(); });
    await page.locator('#tb-edit-2').fill('Título do poema');
    await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); createOrEditTextBox(); });
    await page.locator('#tb-edit').fill('primeiro verso\nsegundo verso');
    await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); createOrEditSignatureBox(); });
    await page.locator('#tb-edit-3').fill('@poeta');
    await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); });
    const res = {};
    for (const k of ['9:16', '1:1', '16:9']) {
      await page.evaluate((a) => setAspect(a), k); await page.waitForTimeout(250);
      res[k] = await page.evaluate(() => ['title', 'main', 'signature'].map((key) => { const b = BOX_DEFS[key].state; return { key, inside: b.lf >= -0.001 && b.tf >= -0.001 && b.lf + b.wf <= 1.001 && b.tf + b.hf <= 1.001 }; }));
      for (const r of res[k]) expect(r.inside, `${k} ${r.key} fora do quadro`).toBe(true);
    }
    save('q2-boxes', res);
  });
});

test.describe('Q3 · persistência e dados corrompidos', () => {
  test('projeto completo sobrevive a recarregar (imagens, texto, efeitos, proporção)', async ({ page }) => {
    test.setTimeout(90_000);
    const errs = watch(page);
    await open(page); await newProject(page);
    await addImages(page, [PHOTO(1015), PHOTO(1043), PHOTO(1036)], 3);
    await page.evaluate(() => { createOrEditTextBox(); });
    await page.locator('#tb-edit').fill('persistir é lembrar');
    await page.evaluate(() => { document.activeElement?.blur(); exitAnyEditMode?.(); setTransition('wipe'); setFilter('vintage'); setDim(25); setKenBurns(false); setAspect('1:1'); });
    await page.waitForTimeout(2500); // autosave
    await page.evaluate(() => saveProject());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));
    await expect(page.locator('#resume-proj')).toBeVisible();
    await page.locator('#resume-proj').click();
    await page.waitForFunction(() => S.imgs.length === 3, null, { timeout: 30_000 });
    const st = await page.evaluate(() => ({ t: S.transition, f: S.filter, d: S.dim, kb: S.kenBurns, a: S.aspectKey, text: S.text, n: S.imgs.length }));
    expect(st).toEqual({ t: 'wipe', f: 'vintage', d: 0.25, kb: false, a: '1:1', text: 'persistir é lembrar', n: 3 });
    await page.waitForTimeout(800);
    const thumbs = await page.evaluate(() => [...document.querySelectorAll('.tl-slide-thumb')].map((i) => i.naturalWidth));
    expect(thumbs.length, 'miniaturas').toBe(3);
    expect(thumbs.every((w) => w > 0), 'miniaturas quebradas após retomar: ' + thumbs).toBe(true);
    expect(errs, errs.join('\n')).toEqual([]);
  });

  const BAD = {
    'json inválido': '{{{ not json',
    'array no lugar de objeto': '[1,2,3]',
    'tipos errados': JSON.stringify({ text: 123, text2: {}, duration: 'abc', speed: null, aspectKey: 'foo', transition: 42, filter: 'nao-existe', dim: 'x', tbox: 'x', images: 'x' }),
    'valores extremos': JSON.stringify({ duration: 99999999, speed: -5, dim: 99, tbox: { lf: 9e9, tf: -9e9, wf: 0, hf: 0 }, text: 'x'.repeat(200000) }),
    'vazio': '',
  };
  for (const [name, raw] of Object.entries(BAD)) {
    test(`save corrompido: ${name}`, async ({ page }) => {
      const errs = watch(page);
      await open(page, { storage: { 'versovivo-project': raw } });
      await expect(page.locator('#home')).toHaveClass(/on/);
      // novo projeto continua utilizável
      await newProject(page);
      await addImages(page, [PHOTO(1015)], 1);
      expect(await page.evaluate(() => S.imgs.length)).toBe(1);
      expect(errs.filter((e) => /pageerror/.test(e)), errs.join('\n')).toEqual([]);
    });
  }

  test('retomar com save corrompido não deixa o app inutilizável', async ({ page }) => {
    const errs = watch(page);
    await open(page, { storage: { 'versovivo-project': JSON.stringify({ text: 'ok', aspectKey: 'zzz', duration: 'x', images: 'x', tbox: 7 }) } });
    if (await page.locator('#resume-proj').isVisible()) await page.locator('#resume-proj').click();
    await page.waitForTimeout(1500);
    const alive = await page.evaluate(() => ({ editor: document.getElementById('editor').classList.contains('on'), home: document.getElementById('home').classList.contains('on') }));
    expect(alive.editor || alive.home).toBe(true);
    expect(errs.filter((e) => /pageerror/.test(e)), errs.join('\n')).toEqual([]);
  });
});

test.describe('Q4 · estresse de interface', () => {
  test('300 interações rápidas (painéis, efeitos, proporções, play/pause) sem erro', async ({ page }) => {
    test.setTimeout(120_000);
    const errs = watch(page);
    await open(page); await newProject(page);
    await addImages(page, [PHOTO(1015), PHOTO(1043)], 2);
    await page.evaluate(() => {
      const panels = ['fx', 'ar', 'tp', 'ap', 'lp', 'fp', 'fmt', 'cp', 'ts'];
      const tr = ['fade', 'slide', 'zoom', 'wipe'], fl = ['none', 'warm', 'cool', 'bw', 'vintage', 'vivid'], ar = ['9:16', '1:1', '16:9'];
      for (let i = 0; i < 300; i++) {
        const k = i % 6;
        if (k === 0) openPanel(panels[i % panels.length]);
        else if (k === 1) setTransition(tr[i % 4]);
        else if (k === 2) setFilter(fl[i % 6]);
        else if (k === 3) setAspect(ar[i % 3]);
        else if (k === 4) togglePlay();
        else closePanels();
      }
      closePanels();
    });
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => document.getElementById('editor').classList.contains('on'))).toBe(true);
    expect(errs, errs.join('\n')).toEqual([]);
  });

  test('duplo clique em exportar não dispara duas exportações', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page); await newProject(page);
    await addImages(page, [PHOTO(1015)], 1);
    await page.evaluate(() => { onProjectDurationChange(5); });
    const count = await page.evaluate(() => { let n = 0; const o = window.exportVideoBlob; window.exportVideoBlob = (...a) => { n++; return o(...a); }; const b = document.getElementById('dl-btn'); b.click(); b.click(); b.click(); return new Promise((r) => setTimeout(() => r(n), 300)); });
    expect(count, 'exportVideoBlob chamado mais de 1 vez').toBeLessThanOrEqual(1);
  });
});

test.describe('Q5 · offline e PWA', () => {
  test('após a 1ª visita o app abre sem rede, com fontes e ícones locais', async ({ page, context }) => {
    test.setTimeout(90_000);
    await open(page);
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated', null, { timeout: 20_000 });
    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('home')?.classList.contains('on'));
    const fonts = await page.evaluate(async () => {
      const q = ['italic 32px "Cormorant Garamond"', '18px "EB Garamond"', '32px Sacramento', 'italic 32px "Playfair Display"'];
      const out = {}; for (const f of q) { const faces = await document.fonts.load(f); out[f] = faces.length > 0 && faces.every((x) => x.status === 'loaded'); } return out;
    });
    expect(fonts, 'fontes locais devem carregar sem rede').toEqual({ 'italic 32px "Cormorant Garamond"': true, '18px "EB Garamond"': true, '32px Sacramento': true, 'italic 32px "Playfair Display"': true });
    await newProject(page);
    await context.setOffline(false);
  });

  test('manifest válido: nome, ícones existentes, display standalone', async ({ page, request }) => {
    await open(page);
    const m = await (await request.get('/manifest.webmanifest')).json();
    expect(m.name).toBeTruthy(); expect(m.display).toBe('standalone'); expect(m.start_url).toBeTruthy();
    for (const ic of m.icons) { const r = await request.get('/' + ic.src); expect(r.ok(), ic.src).toBe(true); }
    expect(m.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    expect(m.icons.some((i) => /512/.test(i.sizes))).toBe(true);
  });
});

test.describe('Q6 · layout em vários aparelhos', () => {
  const VIEWS = [[320, 568, 'iPhone SE 1'], [360, 640, 'Android compacto'], [412, 892, 'Android atual'], [768, 1024, 'tablet'], [1280, 720, 'desktop'], [844, 390, 'celular deitado']];
  for (const [w, h, label] of VIEWS) {
    test(`${label} ${w}x${h}: editor utilizável, sem rolagem horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      const errs = watch(page);
      await open(page); await newProject(page);
      await addImages(page, [PHOTO(1015), PHOTO(1043)], 2);
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const vis = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
        return { sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, cv: vis('#cv'), tb: vis('.toolbar'), dl: vis('#dl-btn'), mainTb: (() => { const e = document.querySelector('.main-tb'); return { sw: e.scrollWidth, cw: e.clientWidth }; })() };
      });
      save(`q6-${w}x${h}`, r);
      expect(r.sw, 'rolagem horizontal da página').toBeLessThanOrEqual(r.iw + 1);
      expect(r.cv && r.cv.w > 80 && r.cv.h > 80, 'canvas visível').toBe(true);
      expect(r.dl && r.dl.r <= r.iw + 1 && r.dl.x >= 0, 'botão de exportar visível').toBe(true);
      expect(r.tb && r.tb.b <= r.ih + 2, 'toolbar dentro da tela').toBe(true);
      await page.screenshot({ path: `${OUT}/q6-${w}x${h}.png` });
      expect(errs, errs.join('\n')).toEqual([]);
    });
  }
});

test.describe('Q7 · acessibilidade', () => {
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  test('contraste dos tokens (WCAG AA)', async () => {
    const pairs = [
      ['texto/fundo', '#EFE6D6', '#14110F', 4.5], ['mudo/fundo', '#8C7F6E', '#14110F', 4.5], ['mudo/superfície', '#8C7F6E', '#1B1714', 4.5],
      ['ouro/fundo', '#C9A66B', '#14110F', 4.5], ['tinta/pergaminho', '#1A130C', '#EFE6D6', 7], ['tinta/botão-ouro', '#1A130C', '#BD9654', 4.5],
      ['rótulo toolbar/fundo', '#B7A98F', '#17120F', 4.5], ['vinho/pergaminho (ícone)', '#8E2A33', '#EFE6D6', 3],
    ];
    const rows = pairs.map(([n, f, b, min]) => ({ n, f, b, min, ratio: +ratio(hex(f), hex(b)).toFixed(2) }));
    save('q7-contrast', rows);
    for (const r of rows) expect.soft(r.ratio, `${r.n} ${r.ratio} < ${r.min}`).toBeGreaterThanOrEqual(r.min);
  });

  test('alvos de toque ≥ 44px, nomes acessíveis, idioma e viewport', async ({ page }) => {
    await open(page); await newProject(page);
    await addImages(page, [PHOTO(1015), PHOTO(1043)], 2);
    const r = await page.evaluate(() => {
      const bad = [], noname = [];
      document.querySelectorAll('#editor button, #home button, #home .new-proj, #home .resume-proj').forEach((e) => {
        const cs = getComputedStyle(e), b = e.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || b.width === 0) return;
        const dense = /tl-del/.test(e.className); // controle denso dentro da miniatura: mínimo 32px (WCAG 2.2 AA pede 24px)
        if (b.width < (dense ? 32 : 44) || b.height < (dense ? 32 : 44)) bad.push({ el: (e.id || e.className || e.tagName).toString().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height) });
        const name = (e.getAttribute('aria-label') || e.textContent || e.title || '').trim();
        if (!name) noname.push((e.id || e.className).toString().slice(0, 40));
      });
      return { bad, noname, lang: document.documentElement.lang, vp: document.querySelector('meta[name=viewport]')?.content, title: document.title };
    });
    save('q7-a11y', r);
    expect(r.lang).toMatch(/^pt/); expect(r.vp).toContain('width=device-width'); expect(r.title).toBeTruthy();
    expect.soft(r.noname, 'botões sem nome acessível: ' + r.noname.join(', ')).toEqual([]);
    expect.soft(r.bad, 'alvos de toque < 44px: ' + JSON.stringify(r.bad)).toEqual([]);
  });

  test('tamanhos de fonte mínimos legíveis (≥ 11px)', async ({ page }) => {
    await open(page); await newProject(page);
    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#editor *, #home *').forEach((e) => {
        if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
        const cs = getComputedStyle(e), b = e.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || b.width === 0) return;
        const px = parseFloat(cs.fontSize); if (px && px < 11) out.push({ el: (e.id || e.className).toString().slice(0, 30), px, t: e.textContent.trim().slice(0, 20) });
      }); return out;
    });
    save('q7-fontsize', small);
    expect.soft(small, 'textos < 11px: ' + JSON.stringify(small)).toEqual([]);
  });
});
