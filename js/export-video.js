/**
 * VersoVivo — export frame-accurate (vídeo e slideshow) + helpers de qualidade.
 * Carregado antes do script principal; expõe VVExport no window.
 */
(function (global) {
  'use strict';

  const EXPORT_FPS = 30;
  const AUDIO_BITS_PER_SECOND = 192_000;

  function configureExportCanvas(ctx) {
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
  }

  /** Bitrate de vídeo proporcional à resolução (~10 Mbps por megapixel, limitado). */
  function getExportVideoBitrate(rw, rh) {
    const megapixels = (rw * rh) / 1_000_000;
    const raw = Math.round(megapixels * 10_000_000);
    return Math.min(32_000_000, Math.max(14_000_000, raw));
  }

  function seekVideoTo(video, sec) {
    return new Promise(resolve => {
      if (!video || !isFinite(sec)) {
        resolve();
        return;
      }
      const dur = video.duration;
      const max = dur && isFinite(dur) && dur > 0 ? dur : sec;
      const target = Math.max(0, Math.min(max - 0.001, sec));
      if (Math.abs(video.currentTime - target) < 0.002) {
        resolve();
        return;
      }
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        video.removeEventListener('seeked', onSeeked);
        clearTimeout(fallback);
        resolve();
      };
      const onSeeked = () => finish();
      video.addEventListener('seeked', onSeeked);
      try {
        video.currentTime = target;
      } catch (_) {
        finish();
        return;
      }
      const fallback = setTimeout(finish, 1200);
    });
  }

  /**
   * Grava cada frame seekando o vídeo — WYSIWYG independente de playback real-time.
   */
  async function renderFrameAccurateLoop(opts) {
    const {
      video,
      rctx, RW, RH,
      totalMs,
      renderFrame,
      report,
      shouldStop,
    } = opts;

    if (!video) return;

    video.pause();

    const frameMs = 1000 / EXPORT_FPS;
    const videoSec = video.duration && isFinite(video.duration) && video.duration > 0
      ? video.duration
      : totalMs / 1000;
    const exportMs = Math.min(totalMs, videoSec * 1000);
    const totalFrames = Math.max(1, Math.ceil(exportMs / frameMs));

    for (let f = 0; f < totalFrames; f++) {
      if (shouldStop && shouldStop()) break;
      const t = Math.min(videoSec - 0.001, (f * frameMs) / 1000);
      await seekVideoTo(video, t);
      renderFrame(rctx, RW, RH);
      const pct = ((f + 1) / totalFrames) * 100;
      if (report) {
        report(
          pct,
          `Gravando vídeo · ${Math.round(pct)}% · frame ${f + 1}/${totalFrames}`
        );
      }
      await new Promise(r => setTimeout(r, frameMs));
    }
  }

  /**
   * Mede quanto custa um seek. Em celulares (decoder de hardware) cada seek leva centenas de ms:
   * gravar quadro-a-quadro com MediaRecorder (relógio de parede) geraria um vídeo longo e com poucos fps.
   */
  async function probeSeekMs(video, samples = 4) {
    if (!video) return 0;
    video.pause();
    const dur = video.duration && isFinite(video.duration) ? video.duration : 1;
    const base = Math.min(0.3, dur / 4);
    const t0 = performance.now();
    for (let k = 1; k <= samples; k++) {
      await seekVideoTo(video, base + k * 0.13);
    }
    const avg = (performance.now() - t0) / samples;
    await seekVideoTo(video, 0);
    return avg;
  }

  /** Grava reproduzindo o vídeo em tempo real (duração e fps corretos mesmo com seek lento). */
  async function renderRealtimeLoop(opts) {
    const { video, rctx, RW, RH, totalMs, renderFrame, report, shouldStop } = opts;
    if (!video) return;
    const videoSec = video.duration && isFinite(video.duration) && video.duration > 0
      ? video.duration : totalMs / 1000;
    const exportMs = Math.min(totalMs, videoSec * 1000);
    await seekVideoTo(video, 0);
    try { await video.play(); } catch (_) { /* autoplay bloqueado: segue com o quadro atual */ }
    const start = performance.now();
    await new Promise(resolve => {
      const step = () => {
        const el = performance.now() - start;
        if ((shouldStop && shouldStop()) || video.ended || video.currentTime >= videoSec - 0.03 || el > exportMs + 4000) {
          resolve();
          return;
        }
        renderFrame(rctx, RW, RH);
        const pct = Math.min(100, (video.currentTime / videoSec) * 100);
        if (report) report(pct, `Gravando vídeo · ${Math.round(pct)}% (tempo real)`);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    video.pause();
  }

  /**
   * Slideshow de imagens. O MediaRecorder grava em relógio real, então o CONTEÚDO também segue o relógio real:
   * o tempo do quadro = tempo decorrido (não "índice × 33 ms"). Assim a duração do arquivo é exatamente a configurada,
   * não há câmera lenta quando o aparelho renderiza devagar (quadros são pulados, nunca atrasam a linha do tempo)
   * e o áudio (também em tempo real) fica em sincronia.
   */
  async function renderSlideshowFrameAccurateLoop(opts) {
    const {
      totalMs,
      getFadeAt,
      rctx, RW, RH,
      renderFrame,
      report,
      shouldStop,
    } = opts;

    const frameMs = 1000 / EXPORT_FPS;
    const t0 = performance.now();
    let f = 0;
    for (;;) {
      if (shouldStop && shouldStop()) break;
      const now = performance.now() - t0;
      if (now >= totalMs) break;
      const elapsed = Math.min(Math.max(0, totalMs - 1), now);
      renderFrame(rctx, RW, RH, getFadeAt(elapsed));
      f++;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      if (report) {
        report(pct, `Gravando slideshow · ${Math.round(pct)}% · ${(elapsed / 1000).toFixed(1)}s de ${(totalMs / 1000).toFixed(0)}s`);
      }
      // dorme até o próximo limite de quadro (se atrasado, segue direto: quadros são pulados, o tempo não)
      const next = (Math.floor((performance.now() - t0) / frameMs) + 1) * frameMs;
      const wait = next - (performance.now() - t0);
      await new Promise(r => setTimeout(r, Math.max(0, wait)));
    }
  }

  global.VVExport = {
    EXPORT_FPS,
    AUDIO_BITS_PER_SECOND,
    configureExportCanvas,
    getExportVideoBitrate,
    seekVideoTo,
    renderFrameAccurateLoop,
    probeSeekMs,
    renderRealtimeLoop,
    renderSlideshowFrameAccurateLoop,
  };
})(typeof window !== 'undefined' ? window : globalThis);
