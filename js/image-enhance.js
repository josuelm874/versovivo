/**
 * VersoVivo — melhoria local de fotos (upscale + nitidez) antes do export.
 * Funciona 100% no navegador; expõe VVEnhance no window.
 */
(function (global) {
  'use strict';

  const MAX_LONG_SIDE = 3840;
  const KEN_BURNS_MARGIN = 1.08;
  const SKIP_SCALE = 1.02;
  const JPEG_QUALITY = 0.93;

  function computeEnhanceTarget(sw, sh, exportW, exportH) {
    if (!sw || !sh || !exportW || !exportH) return null;
    const scale = Math.max(exportW / sw, exportH / sh) * KEN_BURNS_MARGIN;
    if (scale <= SKIP_SCALE) return null;

    let tw = Math.round(sw * scale);
    let th = Math.round(sh * scale);
    const longSide = Math.max(tw, th);
    if (longSide > MAX_LONG_SIDE) {
      const cap = MAX_LONG_SIDE / longSide;
      tw = Math.round(tw * cap);
      th = Math.round(th * cap);
    }
    return { tw, th, scale: tw / sw };
  }

  function applySharpen(ctx, w, h, amount = 0.45) {
    if (!ctx || w < 16 || h < 16) return;
    const src = document.createElement('canvas');
    src.width = w;
    src.height = h;
    const sctx = src.getContext('2d');
    sctx.drawImage(ctx.canvas, 0, 0);

    const blur = document.createElement('canvas');
    blur.width = w;
    blur.height = h;
    const bctx = blur.getContext('2d');
    bctx.filter = 'blur(1.4px)';
    bctx.drawImage(src, 0, 0);
    bctx.filter = 'none';

    const idSrc = sctx.getImageData(0, 0, w, h);
    const idBlur = bctx.getImageData(0, 0, w, h);
    const d = idSrc.data;
    const b = idBlur.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i]     = clamp255(d[i]     + amount * (d[i]     - b[i]));
      d[i + 1] = clamp255(d[i + 1] + amount * (d[i + 1] - b[i + 1]));
      d[i + 2] = clamp255(d[i + 2] + amount * (d[i + 2] - b[i + 2]));
    }
    ctx.putImageData(idSrc, 0, 0);
  }

  function clamp255(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v;
  }

  async function drawToCanvas(src, tw, th) {
    const out = document.createElement('canvas');
    out.width = tw;
    out.height = th;
    const ctx = out.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    if (typeof createImageBitmap === 'function') {
      try {
        const bm = await createImageBitmap(src, {
          resizeWidth: tw,
          resizeHeight: th,
          resizeQuality: 'high',
        });
        ctx.drawImage(bm, 0, 0, tw, th);
        if (bm.close) bm.close();
        applySharpen(ctx, tw, th);
        return out;
      } catch (_) { /* fallback abaixo */ }
    }

    let w = src.naturalWidth || src.videoWidth || tw;
    let h = src.naturalHeight || src.videoHeight || th;
    let step = document.createElement('canvas');
    step.width = w;
    step.height = h;
    step.getContext('2d').drawImage(src, 0, 0);

    while (w < tw || h < th) {
      const nw = Math.min(tw, Math.max(w + 1, Math.ceil(w * 1.5)));
      const nh = Math.min(th, Math.max(h + 1, Math.ceil(h * 1.5)));
      const next = document.createElement('canvas');
      next.width = nw;
      next.height = nh;
      const nctx = next.getContext('2d');
      nctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in nctx) nctx.imageSmoothingQuality = 'high';
      nctx.drawImage(step, 0, 0, w, h, 0, 0, nw, nh);
      step = next;
      w = nw;
      h = nh;
    }

    ctx.drawImage(step, 0, 0, w, h, 0, 0, tw, th);
    applySharpen(ctx, tw, th);
    return out;
  }

  function canvasToBlob(canvas) {
    return new Promise(resolve => {
      canvas.toBlob(b => resolve(b), 'image/jpeg', JPEG_QUALITY);
    });
  }

  function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Melhora uma foto se estiver abaixo da resolução ideal para cover-fit no export.
   * @returns {{ img, blob, url, enhanced?, meta? }}
   */
  async function enhancePhotoEntry(entry, exportW, exportH) {
    if (!entry?.img) return entry;
    const sw = entry.img.naturalWidth;
    const sh = entry.img.naturalHeight;
    const target = computeEnhanceTarget(sw, sh, exportW, exportH);
    if (!target) {
      return { ...entry, enhanced: false };
    }

    const canvas = await drawToCanvas(entry.img, target.tw, target.th);
    const blob = await canvasToBlob(canvas);
    if (!blob) return entry;

    if (entry.url) URL.revokeObjectURL(entry.url);
    const url = URL.createObjectURL(blob);
    const img = await loadImageFromUrl(url);
    img.dataset.vvEnhanced = '1';
    img.dataset.vvFrom = `${sw}x${sh}`;
    img.dataset.vvTo = `${target.tw}x${target.th}`;

    return {
      img,
      blob,
      url,
      enhanced: true,
      meta: { fromW: sw, fromH: sh, toW: target.tw, toH: target.th },
    };
  }

  async function enhanceBatch(entries, exportW, exportH, onProgress) {
    const out = [];
    let enhancedCount = 0;
    for (let i = 0; i < entries.length; i++) {
      if (onProgress) onProgress(i, entries.length, 'processing');
      const next = await enhancePhotoEntry(entries[i], exportW, exportH);
      if (next.enhanced) enhancedCount++;
      out.push(next);
    }
    if (onProgress) onProgress(entries.length, entries.length, 'done', enhancedCount);
    return { entries: out, enhancedCount };
  }

  global.VVEnhance = {
    MAX_LONG_SIDE,
    computeEnhanceTarget,
    applyFrameSharpen: applySharpen,
    enhancePhotoEntry,
    enhanceBatch,
  };
})(typeof window !== 'undefined' ? window : globalThis);
