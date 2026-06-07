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
   * Slideshow de imagens: um frame a cada 1/FPS com tempo real — evita perda por rAF descontrolado.
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
    const totalFrames = Math.max(1, Math.ceil(totalMs / frameMs));

    for (let f = 0; f < totalFrames; f++) {
      if (shouldStop && shouldStop()) break;
      const elapsed = Math.min(Math.max(0, totalMs - 1), f * frameMs);
      const fade = getFadeAt(elapsed);
      renderFrame(rctx, RW, RH, fade);
      const pct = ((f + 1) / totalFrames) * 100;
      if (report) {
        report(
          pct,
          `Gravando slideshow · ${Math.round(pct)}% · frame ${f + 1}/${totalFrames}`
        );
      }
      await new Promise(r => setTimeout(r, frameMs));
    }
  }

  global.VVExport = {
    EXPORT_FPS,
    AUDIO_BITS_PER_SECOND,
    configureExportCanvas,
    getExportVideoBitrate,
    seekVideoTo,
    renderFrameAccurateLoop,
    renderSlideshowFrameAccurateLoop,
  };
})(typeof window !== 'undefined' ? window : globalThis);
