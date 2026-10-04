/**
 * VersoVivo — intro estilo "hello" do iPhone.
 *  - fundo: manchas de cor desfocadas em movimento lento (como o papel de parede da configuração do iOS)
 *  - a palavra é escrita por uma caneta invisível que segue o traço (dados em intro-data.js)
 *  - fica parada e se dissolve revelando a tela
 *  - não tem como pular. Toca na abertura e sempre que o usuário voltar após > 1 min fora.
 * 'versovivo-skip-boot' = '1' é só atalho dos testes automatizados (sem UI).
 */
(function (global) {
  'use strict';

  const AWAY_MS = 60_000;                 // fora por mais de 1 min => intro de novo
  const KEY = 'versovivo-last-active';
  const T = { lead: 0.5, write: 2.2, hold: 0.9, out: 0.65 }; // segundos
  const BLOBS = [ // c = rgb, a = opacidade, x/y = centro, ax/ay = amplitude do passeio, w = velocidade, r = raio (× maior lado)
    { c: [58, 22, 44],   a: 0.95, x: 0.72, y: 0.18, ax: 0.14, ay: 0.12, w: 0.50, p: 4.4, r: 1.00 },   // ameixa
    { c: [150, 38, 54],  a: 0.78, x: 0.22, y: 0.58, ax: 0.18, ay: 0.14, w: 0.42, p: 1.7, r: 0.90 },   // vinho
    { c: [196, 134, 58], a: 0.52, x: 0.80, y: 0.80, ax: 0.16, ay: 0.12, w: 0.36, p: 3.1, r: 0.70 },   // âmbar
    { c: [226, 176, 112], a: 0.20, x: 0.34, y: 0.26, ax: 0.20, ay: 0.10, w: 0.55, p: 0.0, r: 0.55 },  // ouro claro
  ];

  let playing = false;
  let imgPromise = null;

  const $ = (id) => document.getElementById(id);
  const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));        // smoothstep
  const easeWrite = (u) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, u))) / 2; // início e fim suaves

  function loadImg() {
    if (!imgPromise) {
      imgPromise = new Promise((resolve) => {
        const D = global.VVIntroData;
        if (!D) { resolve(null); return; }
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = D.src;
      });
    }
    return imgPromise;
  }

  // ── atividade do usuário ────────────────────────────
  function lastActive() { try { return Number(localStorage.getItem(KEY)) || 0; } catch (_) { return 0; } }
  function touch() { try { localStorage.setItem(KEY, String(Date.now())); } catch (_) { /* sem storage */ } }
  function awayTooLong() { const l = lastActive(); return !l || Date.now() - l > AWAY_MS; }
  function skipFlag() { try { return localStorage.getItem('versovivo-skip-boot') === '1'; } catch (_) { return false; } }

  // ── animação ────────────────────────────────────────
  async function play(hooks) {
    hooks = hooks || {};
    const D = global.VVIntroData;
    const boot = $('boot'), cv = $('boot-canvas');
    const img = await loadImg();
    if (!boot || !cv || !D || !img) { if (hooks.beforeFade) hooks.beforeFade(); if (hooks.done) hooks.done(); return; }
    if (playing) return;
    playing = true;

    const dpr = Math.min(global.devicePixelRatio || 1, 3);
    const W = global.innerWidth, H = global.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d');
    boot.style.transition = 'none'; boot.style.opacity = '1'; boot.style.display = 'block';

    // fundo em baixa resolução (é só cor difusa) — barato mesmo em telas 1220x2712
    const BG_SCALE = 0.3;
    const bg = document.createElement('canvas');
    bg.width = Math.max(2, Math.round(W * BG_SCALE)); bg.height = Math.max(2, Math.round(H * BG_SCALE));
    const bctx = bg.getContext('2d');
    const baseCol = (getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()) || '#14110F';

    // texto: caixa de destino + camadas (texto tingido, máscara da caneta, resultado)
    const tw = Math.min(W * 0.84, 760), th = tw * (D.h / D.w);
    const px = Math.round(tw * dpr), py = Math.round(th * dpr);
    const k = px / D.w;                                  // escala dado->pixel
    const dx = (W - tw) / 2, dy = (H - th) / 2 - H * 0.015;
    const mk = () => { const c = document.createElement('canvas'); c.width = px; c.height = py; return c; };
    const textC = mk(), maskC = mk(), revC = mk();
    const tctx = textC.getContext('2d'), mctx = maskC.getContext('2d'), rctx = revC.getContext('2d');
    tctx.drawImage(img, 0, 0, px, py);
    tctx.globalCompositeOperation = 'source-in'; tctx.fillStyle = '#F6EEDF'; tctx.fillRect(0, 0, px, py);
    mctx.fillStyle = '#fff';

    let t = 0, last = performance.now(), idx = 0, fading = false, raf = 0;
    const pts = D.pts;

    function drawBg(time) {
      bctx.globalCompositeOperation = 'source-over';
      bctx.fillStyle = baseCol; bctx.fillRect(0, 0, bg.width, bg.height);
      bctx.globalCompositeOperation = 'source-over';
      const m = Math.max(bg.width, bg.height);
      for (const b of BLOBS) {
        const cx = (b.x + b.ax * Math.sin(time * b.w + b.p)) * bg.width;
        const cy = (b.y + b.ay * Math.cos(time * b.w * 0.8 + b.p)) * bg.height;
        const r = b.r * m;
        const g = bctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a})`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        bctx.fillStyle = g; bctx.fillRect(0, 0, bg.width, bg.height);
      }
    }

    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;

      drawBg(t);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bg, 0, 0, cv.width, cv.height);
      // vinheta
      const vg = ctx.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.25, cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, cv.width, cv.height);

      // entrada suave do fundo (a partir da cor base)
      const fin = 1 - ease(t / T.lead);
      if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = baseCol; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }

      // caneta: revela os pontos do traço até o progresso atual
      const u = (t - T.lead) / T.write;
      const p = easeWrite(u);
      while (idx < pts.length && pts[idx][2] <= p) {
        const q = pts[idx++];
        mctx.beginPath(); mctx.arc(q[0] * k, q[1] * k, q[3] * k, 0, Math.PI * 2); mctx.fill();
      }
      if (u >= 1 && idx < pts.length) { // garante o fim do traço
        while (idx < pts.length) { const q = pts[idx++]; mctx.beginPath(); mctx.arc(q[0] * k, q[1] * k, q[3] * k, 0, Math.PI * 2); mctx.fill(); }
      }
      if (idx > 0) {
        rctx.globalCompositeOperation = 'source-over';
        rctx.clearRect(0, 0, px, py); rctx.drawImage(textC, 0, 0);
        rctx.globalCompositeOperation = 'destination-in'; rctx.drawImage(maskC, 0, 0);
        ctx.save();
        ctx.shadowColor = 'rgba(255,236,200,0.28)'; ctx.shadowBlur = 14 * dpr;
        ctx.drawImage(revC, dx * dpr, dy * dpr);
        ctx.restore();
      }

      // saída: o overlay inteiro dissolve revelando a tela por baixo
      if (!fading && t >= T.lead + T.write + T.hold) {
        fading = true;
        if (hooks.beforeFade) hooks.beforeFade();
        boot.style.transition = `opacity ${T.out}s ease`;
        boot.style.opacity = '0';
        setTimeout(() => {
          cancelAnimationFrame(raf);
          boot.style.display = 'none'; boot.style.transition = ''; boot.style.opacity = '1';
          playing = false;
          if (hooks.done) hooks.done();
        }, T.out * 1000 + 60);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  // ── integração com o app ────────────────────────────
  function init(opts) {
    opts = opts || {};
    const boot = $('boot');
    const showHome = opts.showHome || function () {};
    const isBusy = opts.isBusy || function () { return false; };

    const skip = skipFlag();
    const mustPlay = !skip && awayTooLong();      // decide ANTES de carimbar a atividade
    touch();

    if (mustPlay) {
      play({ beforeFade: showHome });
    } else {
      if (boot) boot.style.display = 'none';
      showHome();
    }

    // batimento + carimbo ao sair: dá a "última atividade" mesmo se o sistema matar o app
    setInterval(() => { if (document.visibilityState === 'visible' && !playing) touch(); }, 4000);
    const stamp = () => touch();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { stamp(); return; }
      onReturn();
    });
    global.addEventListener('pagehide', stamp);
    document.addEventListener('pause', stamp);
    document.addEventListener('resume', onReturn);

    function onReturn() {
      if (skipFlag() || playing || isBusy()) { if (!playing) touch(); return; }
      if (awayTooLong()) play({});
      touch();
    }
  }

  global.VVIntro = { init, play, AWAY_MS, KEY, _awayTooLong: awayTooLong };
})(typeof window !== 'undefined' ? window : globalThis);
