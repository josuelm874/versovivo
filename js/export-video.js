/**
 * VersoVivo — export frame-accurate para modo vídeo.
 * Carregado antes do script principal; expõe VVExport no window.
 */
(function (global) {
  'use strict';

  const EXPORT_FPS = 30;

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

  global.VVExport = { EXPORT_FPS, seekVideoTo, renderFrameAccurateLoop };
})(typeof window !== 'undefined' ? window : globalThis);
