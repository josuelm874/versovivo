// ════════════════════════════════════
//  FONTS LIST
// ════════════════════════════════════
const FONTS = [
  'Playfair Display','Lora','Cormorant Garamond','EB Garamond',
  'Libre Baskerville','Merriweather','Crimson Text','Spectral',
  'Bitter','PT Serif','Source Serif 4','Noto Serif',
  'Cinzel','Cinzel Decorative','Abril Fatface','Oswald',
  'Great Vibes','Dancing Script','Satisfy','Sacramento',
  'Pinyon Script','Alex Brush','Allura','Italianno',
  'Tangerine','Kaushan Script','Pacifico','Lobster',
  'Righteous','Fredoka One','Caveat','Indie Flower',
  'Shadows Into Light','Patrick Hand','Permanent Marker',
  'Amatic SC','Special Elite','Raleway','Josefin Sans',
  'Quicksand','Nunito','Poppins','Montserrat',
  'Exo 2','Ubuntu','Courier Prime','Share Tech Mono'
];

const PRESET_COLORS = [
  '#FFFFFF','#FFFDE7','#FFD700','#FFC0CB','#FF69B4',
  '#FF6B6B','#FF4500','#FF8C00','#32CD32','#00CED1',
  '#1E90FF','#8A2BE2','#C0C0C0','#000000'
];

const FONT_SIZE_MIN = 10;
const FONT_SIZE_MAX = 72;
const FONT_SIZE_EDIT_DEFAULT = 16;
const TEXT_BOX_PAD = 16;
const TEXT_LINE_HEIGHT = 1.4;
const FADE_MS   = 750;
const KEN_BURNS_ZOOM = 0.045;
const TRANS_IN_ZOOM  = 0.035;
const DB_NAME   = 'versovivo';
const DB_VER    = 1;
const LS_KEY    = 'versovivo-project';

const LAYOUT_TEMPLATES = [
  {
    id: 'verso-central',
    name: 'Verso Central',
    desc: 'Poema grande no centro — clássico e equilibrado',
    tbox: { show: true, lf: 0.08, tf: 0.28, wf: 0.84, hf: 0.44 },
    font: 'Playfair Display', align: 0, color: '#FFFFFF',
    bold: false, italic: false,
    textShadow: true, textStroke: false, boxBgOpacity: 0.25,
    placeholder: 'Seu verso aqui...',
  },
  {
    id: 'haiku-rodape',
    name: 'Haiku no Rodapé',
    desc: 'Três linhas compactas na base da tela',
    tbox: { show: true, lf: 0.1, tf: 0.72, wf: 0.8, hf: 0.22 },
    font: 'Cormorant Garamond', align: 0, color: '#FFFDE7',
    bold: false, italic: true,
    textShadow: true, textStroke: true, boxBgOpacity: 0.4,
    placeholder: 'Linha um\nLinha dois\nLinha três',
  },
  {
    id: 'citacao-lateral',
    name: 'Citação Lateral',
    desc: 'Texto à esquerda, estilo editorial',
    tbox: { show: true, lf: 0.06, tf: 0.2, wf: 0.52, hf: 0.55 },
    font: 'Libre Baskerville', align: 2, color: '#FFFFFF',
    bold: false, italic: true,
    textShadow: true, textStroke: false, boxBgOpacity: 0.15,
    placeholder: '"A poesia é o eco de um verso eterno..."',
  },
  {
    id: 'minimal-canto',
    name: 'Minimal',
    desc: 'Bloco discreto no canto inferior',
    tbox: { show: true, lf: 0.08, tf: 0.78, wf: 0.55, hf: 0.16 },
    font: 'Josefin Sans', align: 2, color: '#FFFFFF',
    bold: false, italic: false,
    textShadow: true, textStroke: false, boxBgOpacity: 0.35,
    placeholder: 'Uma linha.',
  },
  {
    id: 'dramatico',
    name: 'Dramático',
    desc: 'Impacto visual na parte superior',
    tbox: { show: true, lf: 0.06, tf: 0.12, wf: 0.88, hf: 0.35 },
    font: 'Cinzel', align: 0, color: '#FFD700',
    bold: true, italic: false,
    textShadow: true, textStroke: true, boxBgOpacity: 0.2,
    placeholder: 'TÍTULO DO POEMA',
  },
  {
    id: 'titulo-verso',
    name: 'Título + Verso',
    desc: 'Título no topo e poema na base',
    tbox: { show: true, lf: 0.08, tf: 0.62, wf: 0.84, hf: 0.28 },
    tbox2: { show: true, lf: 0.1, tf: 0.06, wf: 0.8, hf: 0.1 },
    font: 'Cormorant Garamond', align: 0, color: '#FFFFFF',
    bold: false, italic: true,
    textShadow: true, textStroke: false, boxBgOpacity: 0.3,
    placeholder: 'Corpo do poema...\nSegunda linha...',
    text2: 'Título do Poema',
    titleFont: 'Cinzel', titleBold: true, titleColor: '#FFD700', titleAlign: 0,
    tbox3: { show: true, lf: 0.55, tf: 0.90, wf: 0.38, hf: 0.07 },
    text3: '@seu_perfil',
    sigFont: 'Montserrat', sigBold: false, sigColor: '#FFFFFF', sigAlign: 2,
  },
];

// ════════════════════════════════════
//  STATE
// ════════════════════════════════════
const S = {
  mode: 'none',            // 'none' | 'images' | 'video'
  imgs: [], idx: 0, prevIdx: 0, fadeProgress: 1,
  holdT: 0, prevHoldT: 0,
  elapsed: 0, lastTs: 0,
  videoEl: null, videoReady: false,
  playing: true, speed: 2.0,
  duration: 20,              // duração total do vídeo exportado (segundos)
  playMs: 0,                 // posição na linha do tempo do slideshow (ms)
  slideClockMs: 0,           // relógio contínuo p/ crossfade (não salta no loop da duração)
  recording: false,
  text: '',
  font: 'Playfair Display',
  bold: false, italic: false, underline: false, strike: false,
  align: 0,
  color: '#FFFFFF',
  textShadow: false,
  textStroke: false,
  boxBgOpacity: 0,
  layoutId: '',
  audioVolume: 0.8,
  audioEnabled: false,
  aspectKey: '9:16',
  enhancePhotos: true,
  enhanceVideos: true,
  text2: '',
  titleFont: 'Cinzel',
  titleBold: true,
  titleItalic: false,
  titleAlign: 0,
  titleColor: '#FFD700',
  text3: '',
  sigFont: 'Montserrat',
  sigBold: false,
  sigItalic: false,
  sigAlign: 2,
  sigColor: '#FFFFFF',
};

// Text box state — positions as fractions of canvas size (0..1)
const TBOX = {
  show: false,
  editing: false,
  _editFs: 20,
  lf: 0.08, tf: 0.30,
  wf: 0.84, hf: 0.40,
  fontSize: 0, /* 0 = auto-fit; >0 = manual preview px */
  px: 0, py: 0, pw: 0, ph: 0,
  action: null,
  dir: null,
  sx: 0, sy: 0,
  slf: 0, stf: 0, swf: 0, shf: 0,
  _downX: 0, _downY: 0, _moved: false,
};

const TBOX2 = {
  show: false,
  editing: false,
  _editFs: 18,
  lf: 0.1, tf: 0.06,
  wf: 0.8, hf: 0.12,
  fontSize: 0,
  px: 0, py: 0, pw: 0, ph: 0,
  action: null,
  dir: null,
  sx: 0, sy: 0,
  slf: 0, stf: 0, swf: 0, shf: 0,
  _downX: 0, _downY: 0, _moved: false,
};

const TBOX3 = {
  show: false,
  editing: false,
  _editFs: 14,
  lf: 0.55, tf: 0.90,
  wf: 0.38, hf: 0.07,
  fontSize: 0,
  px: 0, py: 0, pw: 0, ph: 0,
  action: null,
  dir: null,
  sx: 0, sy: 0,
  slf: 0, stf: 0, swf: 0, shf: 0,
  _downX: 0, _downY: 0, _moved: false,
};

const FORMAT_PRESETS = {
  '9:16': { label: 'Vertical · Reels', rw: 1080, rh: 1920, aspect: 9 / 16 },
  '1:1':  { label: 'Quadrado · Feed', rw: 1080, rh: 1080, aspect: 1 },
  '16:9': { label: 'Horizontal · YouTube', rw: 1920, rh: 1080, aspect: 16 / 9 },
};

const BOX_DEFS = {
  main: {
    state: TBOX,
    elId: 'text-box',
    editId: 'tb-edit',
    tipId: 'tb-size-tip',
    getText: () => S.text,
    setText: v => { S.text = v; },
    style: () => ({
      text: S.text,
      font: S.font, bold: S.bold, italic: S.italic,
      align: S.align, color: S.color,
      textShadow: S.textShadow, textStroke: S.textStroke, boxBgOpacity: S.boxBgOpacity,
      underline: S.underline, strike: S.strike,
    }),
    isEditing: () => TBOX.editing,
    setEditing: v => { TBOX.editing = v; },
  },
  title: {
    state: TBOX2,
    elId: 'text-box-2',
    editId: 'tb-edit-2',
    tipId: 'tb-size-tip-2',
    getText: () => S.text2,
    setText: v => { S.text2 = v; },
    style: () => ({
      text: S.text2,
      font: S.titleFont, bold: S.titleBold, italic: S.titleItalic,
      align: S.titleAlign, color: S.titleColor,
      textShadow: S.textShadow, textStroke: S.textStroke,
      boxBgOpacity: S.boxBgOpacity * 0.85,
    }),
    isEditing: () => TBOX2.editing,
    setEditing: v => { TBOX2.editing = v; },
  },
  signature: {
    state: TBOX3,
    elId: 'text-box-3',
    editId: 'tb-edit-3',
    tipId: 'tb-size-tip-3',
    getText: () => S.text3,
    setText: v => { S.text3 = v; },
    style: () => ({
      text: S.text3,
      font: S.sigFont, bold: S.sigBold, italic: S.sigItalic,
      align: S.sigAlign, color: S.sigColor,
      textShadow: S.textShadow, textStroke: S.textStroke,
      boxBgOpacity: S.boxBgOpacity * 0.7,
      underline: false, strike: false,
    }),
    isEditing: () => TBOX3.editing,
    setEditing: v => { TBOX3.editing = v; },
  },
};

const STYLE_TARGET_LABELS = { main: 'Verso', title: 'Título', signature: 'Assinatura' };
let _bootFinish = null;
let _bootRaf = null;

const ALIGN_NAMES = ['center','right','left'];
const ALIGN_ICS   = ['☰','➡','⬅'];
const ALIGN_LBLS  = ['Centro','Direita','Esquerda'];

let _imageBlobs = [];
let _imgBlobUrls = [];
let _videoBlob = null;
let _videoFileName = '';
let _audioBlob = null;
let _audioFileName = '';
let _audioEl = null;
let _audioUrl = null;
let _tlDragFrom = null;
let _tlInsertAt = null;
let _tlScrubDragging = false;
let _imgPickAppend = false;
let _videoThumbDataUrl = null;
let _saveTimer = null;
let _editorOpen = false;

// ════════════════════════════════════
//  PERSISTENCE
// ════════════════════════════════════
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getProjectMeta() {
  return {
    mode: S.mode,
    speed: S.speed,
    duration: S.duration,
    text: S.text,
    font: S.font,
    bold: S.bold, italic: S.italic, underline: S.underline, strike: S.strike,
    align: S.align,
    color: S.color,
    textShadow: S.textShadow,
    textStroke: S.textStroke,
    boxBgOpacity: S.boxBgOpacity,
    layoutId: S.layoutId || '',
    audioVolume: S.audioVolume,
    audioEnabled: S.audioEnabled,
    audioName: _audioFileName || null,
    aspectKey: S.aspectKey || '9:16',
    enhancePhotos: S.enhancePhotos !== false,
    enhanceVideos: S.enhanceVideos !== false,
    text2: S.text2,
    titleFont: S.titleFont,
    titleBold: S.titleBold,
    titleItalic: S.titleItalic,
    titleAlign: S.titleAlign,
    titleColor: S.titleColor,
    tbox: {
      show: TBOX.show,
      lf: TBOX.lf, tf: TBOX.tf, wf: TBOX.wf, hf: TBOX.hf,
      fontSize: TBOX.fontSize || 0,
    },
    tbox2: {
      show: TBOX2.show,
      lf: TBOX2.lf, tf: TBOX2.tf, wf: TBOX2.wf, hf: TBOX2.hf,
      fontSize: TBOX2.fontSize || 0,
    },
    text3: S.text3,
    sigFont: S.sigFont,
    sigBold: S.sigBold,
    sigItalic: S.sigItalic,
    sigAlign: S.sigAlign,
    sigColor: S.sigColor,
    tbox3: {
      show: TBOX3.show,
      lf: TBOX3.lf, tf: TBOX3.tf, wf: TBOX3.wf, hf: TBOX3.hf,
      fontSize: TBOX3.fontSize || 0,
    },
    videoName: _videoFileName || null,
    imageCount: _imageBlobs.length,
    savedAt: Date.now(),
  };
}

function applyProjectMeta(meta) {
  if (!meta) return;
  S.speed = meta.speed ?? 2.0;
  S.duration = meta.duration ?? 20;
  S.text = meta.text ?? '';
  S.font = meta.font ?? 'Playfair Display';
  S.bold = !!meta.bold;
  S.italic = !!meta.italic;
  S.underline = !!meta.underline;
  S.strike = !!meta.strike;
  S.align = meta.align ?? 0;
  S.color = meta.color ?? '#FFFFFF';
  S.textShadow = !!meta.textShadow;
  S.textStroke = !!meta.textStroke;
  S.boxBgOpacity = meta.boxBgOpacity ?? 0;
  S.layoutId = meta.layoutId || '';
  S.audioVolume = meta.audioVolume ?? 0.8;
  S.audioEnabled = !!meta.audioEnabled;
  S.aspectKey = meta.aspectKey || '9:16';
  S.enhancePhotos = meta.enhancePhotos !== false;
  S.enhanceVideos = meta.enhanceVideos !== false;
  S.text2 = meta.text2 ?? '';
  S.titleFont = meta.titleFont ?? 'Cinzel';
  S.titleBold = meta.titleBold !== undefined ? !!meta.titleBold : true;
  S.titleItalic = !!meta.titleItalic;
  S.titleAlign = meta.titleAlign ?? 0;
  S.titleColor = meta.titleColor ?? '#FFD700';
  if (meta.tbox) {
    TBOX.show = !!meta.tbox.show;
    TBOX.lf = meta.tbox.lf ?? TBOX.lf;
    TBOX.tf = meta.tbox.tf ?? TBOX.tf;
    TBOX.wf = meta.tbox.wf ?? TBOX.wf;
    TBOX.hf = meta.tbox.hf ?? TBOX.hf;
    TBOX.fontSize = meta.tbox.fontSize ?? 0;
  }
  if (meta.tbox2) {
    TBOX2.show = !!meta.tbox2.show;
    TBOX2.lf = meta.tbox2.lf ?? TBOX2.lf;
    TBOX2.tf = meta.tbox2.tf ?? TBOX2.tf;
    TBOX2.wf = meta.tbox2.wf ?? TBOX2.wf;
    TBOX2.hf = meta.tbox2.hf ?? TBOX2.hf;
    TBOX2.fontSize = meta.tbox2.fontSize ?? 0;
  }
  S.text3 = meta.text3 ?? '';
  S.sigFont = meta.sigFont ?? 'Montserrat';
  S.sigBold = !!meta.sigBold;
  S.sigItalic = !!meta.sigItalic;
  S.sigAlign = meta.sigAlign ?? 2;
  S.sigColor = meta.sigColor ?? '#FFFFFF';
  if (meta.tbox3) {
    TBOX3.show = !!meta.tbox3.show;
    TBOX3.lf = meta.tbox3.lf ?? TBOX3.lf;
    TBOX3.tf = meta.tbox3.tf ?? TBOX3.tf;
    TBOX3.wf = meta.tbox3.wf ?? TBOX3.wf;
    TBOX3.hf = meta.tbox3.hf ?? TBOX3.hf;
    TBOX3.fontSize = meta.tbox3.fontSize ?? 0;
  }
  syncAspectUI();
  const durRange = document.getElementById('tl-img-duration');
  const durVal = document.getElementById('tl-img-duration-val');
  if (durRange) durRange.value = String(S.duration);
  if (durVal) durVal.textContent = S.duration + 's';
  ensureFontLoaded(S.font);
  ensureFontLoaded(S.titleFont);
  ensureFontLoaded(S.sigFont);
  syncTextStyleTargetUI();
  syncLegibilityUI();
  syncAudioUI();
  buildTemplatePanel();
}

function syncAlignUI() {
  const align = _textStyleTarget === 'title' ? S.titleAlign
    : _textStyleTarget === 'signature' ? S.sigAlign
    : S.align;
  document.getElementById('align-ic').textContent = ALIGN_ICS[align];
  document.getElementById('align-lbl').textContent = ALIGN_LBLS[align];
}

function markDirty() {
  if (!_editorOpen) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveProject, 700);
}

let _saveHintTimer = null;

function showSaveHint(text, state) {
  const hint = document.getElementById('save-hint');
  if (!hint) return;
  hint.textContent = text;
  hint.classList.remove('saving', 'err');
  if (state) hint.classList.add(state);
  hint.classList.add('on');
  clearTimeout(_saveHintTimer);
  if (text === 'Salvo' || text.startsWith('Erro')) {
    _saveHintTimer = setTimeout(() => {
      hint.classList.remove('on', 'saving', 'err');
      hint.textContent = 'Salvo';
    }, text.startsWith('Erro') ? 3200 : 1800);
  }
}

async function saveProject() {
  try {
    const meta = getProjectMeta();

    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');
      store.clear();
      if (S.mode === 'images' && _imageBlobs.length) {
        _imageBlobs.forEach((blob, i) => store.put(blob, 'img-' + i));
        store.put(_imageBlobs.length, 'img-count');
      } else if (S.mode === 'video' && _videoBlob) {
        store.put(_videoBlob, 'video');
        if (_videoFileName) store.put(_videoFileName, 'video-name');
      }
      if (_audioBlob) {
        store.put(_audioBlob, 'audio');
        if (_audioFileName) store.put(_audioFileName, 'audio-name');
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    localStorage.setItem(LS_KEY, JSON.stringify(meta));
    showSaveHint('Salvo');
    refreshHomeResume();
  } catch (err) {
    console.warn('Falha ao salvar projeto:', err);
    showSaveHint('Erro ao salvar', 'err');
  }
}

async function clearStoredProject() {
  localStorage.removeItem(LS_KEY);
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      tx.objectStore('blobs').clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (_) { /* ignore */ }
  refreshHomeResume();
}

function hasStoredProject() {
  return !!localStorage.getItem(LS_KEY);
}

function refreshHomeResume() {
  const el = document.getElementById('resume-proj');
  const sub = document.getElementById('resume-sub');
  if (!el || !sub) return;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) { el.classList.remove('on'); return; }
  try {
    const meta = JSON.parse(raw);
    el.classList.add('on');
    const when = meta.savedAt
      ? new Date(meta.savedAt).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
      : '';
    const detail = meta.mode === 'images'
      ? `${meta.imageCount || 0} imagem(ns)`
      : meta.videoName ? meta.videoName : 'vídeo';
    sub.textContent = `${detail}${when ? ' · ' + when : ''}`;
  } catch (_) {
    el.classList.remove('on');
  }
}

async function restoreProjectMedia() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return false;
  const meta = JSON.parse(raw);
  applyProjectMeta(meta);

  const db = await openDB();
  if (meta.mode === 'images') {
    const count = await new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readonly');
      const req = tx.objectStore('blobs').get('img-count');
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
    if (!count) return false;
    const blobs = [];
    for (let i = 0; i < count; i++) {
      const blob = await new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readonly');
        const req = tx.objectStore('blobs').get('img-' + i);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (blob) blobs.push(blob);
    }
    if (!blobs.length) return false;
    _imageBlobs = blobs;
    await loadImagesFromBlobs(blobs);
    return true;
  }

  if (meta.mode === 'video') {
    const blob = await new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readonly');
      const req = tx.objectStore('blobs').get('video');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const name = await new Promise(resolve => {
      const tx = db.transaction('blobs', 'readonly');
      const req = tx.objectStore('blobs').get('video-name');
      req.onsuccess = () => resolve(req.result || 'video');
      req.onerror = () => resolve('video');
    });
    if (!blob) return false;
    _videoBlob = blob;
    _videoFileName = name;
    await loadVideoFromBlob(blob, name);
    return true;
  }
  return false;
}

function loadImagesFromBlobs(blobs) {
  return new Promise(resolve => {
    if (!blobs.length) { resolve(); return; }
    if (S.videoEl) { S.videoEl.pause(); URL.revokeObjectURL(S.videoEl.src); S.videoEl = null; S.videoReady = false; }
    _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
    _imgBlobUrls = [];
    _videoBlob = null;
    _videoFileName = '';

    S.mode = 'images';
    S.imgs = []; S.idx = 0; S.prevIdx = 0; S.fadeProgress = 1; S.elapsed = 0;
    let done = 0, failed = 0;
    const arr = new Array(blobs.length);
    const total = blobs.length;

    blobs.forEach((blob, i) => {
      const img = new Image();
      const blobUrl = URL.createObjectURL(blob);
      _imgBlobUrls.push(blobUrl);
      img.onload = () => finishLoad(arr, i, img);
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        _imgBlobUrls = _imgBlobUrls.filter(u => u !== blobUrl);
        failed++;
        if (done + failed === total) finalizeImages(arr, failed);
      };
      img.src = blobUrl;
    });

    function finishLoad(arr, i, img) {
      arr[i] = img;
      done++;
      if (done + failed === total) finalizeImages(arr, failed);
    }

    function finalizeImages(arr, failed) {
      S.imgs = arr.filter(Boolean);
      if (!S.imgs.length) {
        resolve();
        return;
      }
      (async () => {
        if (S.enhancePhotos && globalThis.VVEnhance) {
          const paired = S.imgs.map((img, i) => ({
            img,
            blob: blobs[i],
            url: _imgBlobUrls[i],
          })).filter(p => p.img);
          try {
            const enhanced = await enhancePairedImages(paired);
            _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
            S.imgs = enhanced.map(p => p.img);
            _imageBlobs = enhanced.map(p => p.blob);
            _imgBlobUrls = enhanced.map(p => p.url);
          } catch (e) {
            console.error('[VersoVivo] enhance restore:', e);
            _imageBlobs = blobs.slice(0, S.imgs.length);
          }
        } else {
          _imageBlobs = blobs.slice(0, S.imgs.length);
        }
        S.playing = true;
        updatePlayUI(true);
        document.getElementById('img-count').textContent =
          `· ${S.imgs.length} imagem${S.imgs.length > 1 ? 'ns' : ''}${failed ? ` (${failed} falhou)` : ''}`;
        updateDownloadBtn();
        if (TBOX.show || TBOX2.show || TBOX3.show) syncTextBox();
        rebuildTimeline();
        resolve();
      })();
    }
  });
}

function loadVideoFromBlob(blob, name) {
  return new Promise(resolve => {
    if (S.videoEl) { S.videoEl.pause(); URL.revokeObjectURL(S.videoEl.src); }
    _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
    _imgBlobUrls = [];
    _imageBlobs = [];
    S.imgs = []; S.idx = 0; S.elapsed = 0;
    S.mode = 'video'; S.videoReady = false;
    _videoBlob = blob;
    _videoFileName = name || 'video';

    const video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.dataset.fileName = _videoFileName;
    video.src = URL.createObjectURL(blob);
    video.oncanplay = () => {
      S.videoReady = true; S.playing = true;
      _videoThumbDataUrl = captureVideoThumb(video);
      video.play();
      document.getElementById('img-count').textContent = `· ${_videoFileName}`;
      updatePlayUI(true);
      updateDownloadBtn();
      if (TBOX.show || TBOX2.show || TBOX3.show) syncTextBox();
      rebuildTimeline();
      resolve();
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      S.videoEl = null; S.videoReady = false; S.mode = 'none';
      updateDownloadBtn();
      resolve();
    };
    S.videoEl = video;
  });
}

function updatePlayUI(playing) {
  document.getElementById('play-ic').textContent  = playing ? '⏸' : '▶';
  document.getElementById('play-lbl').textContent = playing ? 'Pausar' : 'Retomar';
  document.getElementById('play-tb').classList.toggle('on', !playing);
}

function updateDownloadBtn() {
  const hasMedia = S.mode === 'images' ? S.imgs.length > 0
                 : S.mode === 'video'  ? (S.videoEl && S.videoReady) : false;
  document.getElementById('dl-btn').disabled = !hasMedia;
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    const canShare = typeof navigator.share === 'function';
    shareBtn.classList.toggle('hidden', !canShare);
    shareBtn.disabled = !hasMedia;
  }
}

function getExportSize() {
  const p = FORMAT_PRESETS[S.aspectKey] || FORMAT_PRESETS['9:16'];
  return { rw: p.rw, rh: p.rh };
}

function syncAspectUI() {
  ['9:16', '1:1', '16:9'].forEach(k => {
    const id = k === '9:16' ? 'ar-916' : k === '1:1' ? 'ar-11' : 'ar-169';
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', S.aspectKey === k);
  });
}

const APP_SETTINGS_KEY = 'versovivo-settings';

function defaultAppSettings() {
  return { enhancePhotos: true, enhanceVideos: true };
}

function loadAppSettings() {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    const s = raw ? { ...defaultAppSettings(), ...JSON.parse(raw) } : defaultAppSettings();
    S.enhancePhotos = s.enhancePhotos !== false;
    S.enhanceVideos = s.enhanceVideos !== false;
  } catch (_) {
    const d = defaultAppSettings();
    S.enhancePhotos = d.enhancePhotos;
    S.enhanceVideos = d.enhanceVideos;
  }
}

function saveAppSettings() {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify({
      enhancePhotos: S.enhancePhotos !== false,
      enhanceVideos: S.enhanceVideos !== false,
    }));
  } catch (_) { /* quota */ }
}

function syncSettingsUI() {
  const p = document.getElementById('settings-enhance-photos');
  const v = document.getElementById('settings-enhance-videos');
  if (p) p.checked = S.enhancePhotos !== false;
  if (v) v.checked = S.enhanceVideos !== false;
}

function openSettings() {
  syncSettingsUI();
  const el = document.getElementById('settings');
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('on');
  el.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
  const el = document.getElementById('settings');
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('on');
  el.setAttribute('aria-hidden', 'true');
}

function onSettingsEnhanceChange() {
  const pEl = document.getElementById('settings-enhance-photos');
  const vEl = document.getElementById('settings-enhance-videos');
  S.enhancePhotos = pEl ? pEl.checked : true;
  S.enhanceVideos = vEl ? vEl.checked : true;
  saveAppSettings();
  markDirty();
  if (S.enhancePhotos && S.mode === 'images' && S.imgs.length) {
    reEnhanceAllImages().catch(console.error);
  }
}

function maybeSharpenVideoFrame(tctx, w, h, src) {
  if (!S.enhanceVideos || !globalThis.VVEnhance?.applyFrameSharpen || !src) return;
  const sw = src.videoWidth || 0;
  const sh = src.videoHeight || 0;
  if (!sw || !sh) return;
  const { rw, rh } = getExportSize();
  if (!VVEnhance.computeEnhanceTarget(sw, sh, rw, rh)) return;
  VVEnhance.applyFrameSharpen(tctx, w, h, 0.42);
}

function syncEnhanceUI() {
  syncSettingsUI();
}

function showEnhanceProgress(msg, pct) {
  const ov = document.getElementById('rec-ov');
  const sub = document.getElementById('rec-sub');
  const fill = document.getElementById('rec-fill');
  const title = ov?.querySelector('.rec-title');
  if (title) title.textContent = 'Melhorando fotos...';
  if (sub) sub.textContent = msg;
  if (fill) fill.style.width = (pct ?? 0) + '%';
  ov?.classList.add('on');
}

function hideEnhanceProgress() {
  const ov = document.getElementById('rec-ov');
  const title = ov?.querySelector('.rec-title');
  if (title) title.textContent = 'Gerando seu vídeo...';
  ov?.classList.remove('on');
  document.getElementById('rec-fill').style.width = '0%';
}

async function enhancePairedImages(paired) {
  if (!S.enhancePhotos || !globalThis.VVEnhance || !paired.length) return paired;
  const { rw, rh } = getExportSize();
  showEnhanceProgress('Analisando resolução...', 5);
  const { entries, enhancedCount } = await VVEnhance.enhanceBatch(
    paired,
    rw,
    rh,
    (i, total) => {
      const pct = total ? Math.round(((i + 1) / total) * 100) : 100;
      showEnhanceProgress(`Melhorando foto ${Math.min(i + 1, total)}/${total}...`, pct);
    }
  );
  hideEnhanceProgress();
  return entries;
}

async function reEnhanceAllImages() {
  if (!S.imgs.length || !globalThis.VVEnhance) return;
  const paired = S.imgs.map((img, i) => ({
    img,
    blob: _imageBlobs[i],
    url: _imgBlobUrls[i],
  }));
  const enhanced = await enhancePairedImages(paired);
  _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
  S.imgs = enhanced.map(p => p.img);
  _imageBlobs = enhanced.map(p => p.blob);
  _imgBlobUrls = enhanced.map(p => p.url);
  markDirty();
  rebuildTimeline();
}

function setAspect(key) {
  if (!FORMAT_PRESETS[key]) return;
  const prev = S.aspectKey;
  S.aspectKey = key;
  syncAspectUI();
  resizeCanvas();
  markDirty();
  closePanels();
  if (prev !== key && S.enhancePhotos && S.mode === 'images' && S.imgs.length) {
    reEnhanceAllImages().catch(console.error);
  }
}

function hideAllTextBoxes() {
  document.getElementById('text-box').style.display = 'none';
  document.getElementById('text-box-2').style.display = 'none';
  document.getElementById('text-box-3').style.display = 'none';
}

function showVisibleTextBoxes() {
  document.getElementById('text-box').style.display = '';
  document.getElementById('text-box-2').style.display = '';
  document.getElementById('text-box-3').style.display = '';
  syncTextBox();
}

function hasEditorContent() {
  return S.mode !== 'none' || S.text.trim() || S.text2.trim() || S.text3.trim()
    || TBOX.show || TBOX2.show || TBOX3.show;
}

function resetEditorState() {
  if (S.videoEl) { S.videoEl.pause(); URL.revokeObjectURL(S.videoEl.src); }
  _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
  _imgBlobUrls = [];
  _imageBlobs = [];
  _videoBlob = null;
  _videoFileName = '';
  _videoThumbDataUrl = null;
  S.mode = 'none';
  S.imgs = []; S.idx = 0; S.prevIdx = 0; S.fadeProgress = 1;
  S.elapsed = 0; S.playMs = 0; S.slideClockMs = 0; S.videoEl = null; S.videoReady = false;
  S.playing = true; S.text = '';
  S.font = 'Playfair Display';
  S.bold = false; S.italic = false; S.underline = false; S.strike = false;
  S.align = 0; S.color = '#FFFFFF';
  S.textShadow = false; S.textStroke = false; S.boxBgOpacity = 0;
  S.layoutId = '';
  S.aspectKey = '9:16';
  loadAppSettings();
  S.text2 = '';
  S.titleFont = 'Cinzel';
  S.titleBold = true;
  S.titleItalic = false;
  S.titleAlign = 0;
  S.titleColor = '#FFD700';
  S.text3 = '';
  S.sigFont = 'Montserrat';
  S.sigBold = false;
  S.sigItalic = false;
  S.sigAlign = 2;
  S.sigColor = '#FFFFFF';
  S.audioVolume = 0.8;
  S.audioEnabled = false;
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  if (_audioUrl) URL.revokeObjectURL(_audioUrl);
  _audioUrl = null; _audioBlob = null; _audioFileName = '';
  TBOX.show = false; TBOX.editing = false;
  TBOX.lf = 0.08; TBOX.tf = 0.28; TBOX.wf = 0.84; TBOX.hf = 0.14;
  TBOX.fontSize = 0;
  TBOX2.show = false; TBOX2.editing = false;
  TBOX2.lf = 0.1; TBOX2.tf = 0.06; TBOX2.wf = 0.8; TBOX2.hf = 0.12;
  TBOX2.fontSize = 0;
  TBOX3.show = false; TBOX3.editing = false;
  TBOX3.lf = 0.55; TBOX3.tf = 0.90; TBOX3.wf = 0.38; TBOX3.hf = 0.07;
  TBOX3.fontSize = 0;
  _textStyleTarget = 'main';
  document.getElementById('img-count').textContent = '';
  document.getElementById('text-box').classList.remove('visible', 'editing');
  document.getElementById('text-box-2').classList.remove('visible', 'editing');
  document.getElementById('text-box-3').classList.remove('visible', 'editing');
  syncAspectUI();
  document.getElementById('sub-tb').classList.remove('on');
  document.getElementById('text-tb').classList.remove('on');
  document.getElementById('audio-tb').classList.remove('on');
  rebuildTimeline();
  syncAudioUI();
  updateDownloadBtn();
}

async function startNewProject() {
  if (hasStoredProject() && !confirm('Iniciar um projeto novo? O rascunho salvo será apagado.')) return;
  await clearStoredProject();
  resetEditorState();
  openEditor(false);
}

async function goHome() {
  if (!_tutActive && hasEditorContent()) {
    if (!confirm('Voltar ao início? Seu progresso será salvo antes de sair.')) return;
  }
  if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null; }
  if (TBOX.editing || TBOX2.editing || TBOX3.editing) exitAnyEditMode();
  closePanels();
  showSaveHint('Salvando…', 'saving');
  await saveProject();
  _editorOpen = false;
  if (_audioEl) _audioEl.pause();
  document.getElementById('editor').classList.remove('on');
  document.getElementById('home').classList.add('on');
  refreshHomeResume();
}

// ════════════════════════════════════
//  LEGIBILITY
// ════════════════════════════════════
function syncLegibilityUI() {
  document.getElementById('leg-shadow').classList.toggle('on', S.textShadow);
  document.getElementById('leg-stroke').classList.toggle('on', S.textStroke);
  const pct = Math.round(S.boxBgOpacity * 100);
  document.getElementById('box-bg-range').value = pct;
  document.getElementById('box-bg-val').textContent = pct + '%';
}

function toggleLeg(key) {
  S[key] = !S[key];
  syncLegibilityUI();
  syncTextBox();
  markDirty();
}

function onBoxBgChange(v) {
  S.boxBgOpacity = parseInt(v, 10) / 100;
  document.getElementById('box-bg-val').textContent = v + '%';
  syncTextBox();
  markDirty();
}

function applyLegPreset(which) {
  if (which === 'light') {
    S.textShadow = true;
    S.textStroke = true;
    S.boxBgOpacity = 0.35;
  } else if (which === 'dark') {
    S.textShadow = true;
    S.textStroke = false;
    S.boxBgOpacity = 0.25;
  } else {
    S.textShadow = false;
    S.textStroke = false;
    S.boxBgOpacity = 0;
  }
  syncLegibilityUI();
  syncTextBox();
  markDirty();
}


// ════════════════════════════════════
//  LAYOUT TEMPLATES
// ════════════════════════════════════
function ensureFontLoaded(fontName) {
  const key = fontName.replace(/\s+/g, '-');
  if (document.querySelector(`link[data-vv-font="${key}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.vvFont = key;
  link.href = 'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(fontName).replace(/%20/g, '+') + '&display=swap';
  document.head.appendChild(link);
}

async function ensureExportFontsLoaded() {
  const fonts = new Set();
  Object.keys(BOX_DEFS).forEach(key => {
    const def = BOX_DEFS[key];
    const st = def.style();
    if (def.state.show && st.text.trim()) fonts.add(st.font);
  });
  fonts.forEach(f => ensureFontLoaded(f));
  if (document.fonts && document.fonts.load) {
    await Promise.all([...fonts].map(f =>
      document.fonts.load(`16px "${f}"`).catch(() => {})
    ));
    await document.fonts.ready;
  }
}

function buildTemplatePanel() {
  const grid = document.getElementById('tpl-grid');
  if (!grid) return;
  grid.innerHTML = '';
  LAYOUT_TEMPLATES.forEach(tpl => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tpl-card' + (S.layoutId === tpl.id ? ' sel' : '');
    card.innerHTML =
      `<div class="tpl-preview" data-layout="${tpl.id}"></div>` +
      `<div class="tpl-info"><h4>${tpl.name}</h4><p>${tpl.desc}</p></div>`;
    card.onclick = () => applyLayoutTemplate(tpl.id);
    grid.appendChild(card);
  });
}

function applyLayoutTemplate(id) {
  const tpl = LAYOUT_TEMPLATES.find(t => t.id === id);
  if (!tpl) return;
  closePanels();
  ensureFontLoaded(tpl.font);

  S.layoutId = id;
  S.font = tpl.font;
  S.align = tpl.align;
  S.color = tpl.color;
  S.bold = !!tpl.bold;
  S.italic = !!tpl.italic;
  S.textShadow = !!tpl.textShadow;
  S.textStroke = !!tpl.textStroke;
  S.boxBgOpacity = tpl.boxBgOpacity ?? 0;

  TBOX.show = tpl.tbox.show;
  TBOX.lf = tpl.tbox.lf;
  TBOX.tf = tpl.tbox.tf;
  TBOX.wf = tpl.tbox.wf;
  TBOX.hf = tpl.tbox.hf;

  TBOX2.show = false;
  TBOX3.show = false;

  if (tpl.tbox2) {
    TBOX2.show = tpl.tbox2.show;
    TBOX2.lf = tpl.tbox2.lf;
    TBOX2.tf = tpl.tbox2.tf;
    TBOX2.wf = tpl.tbox2.wf;
    TBOX2.hf = tpl.tbox2.hf;
    if (tpl.titleFont) S.titleFont = tpl.titleFont;
    if (tpl.titleBold !== undefined) S.titleBold = tpl.titleBold;
    if (tpl.titleColor) S.titleColor = tpl.titleColor;
    if (tpl.titleAlign !== undefined) S.titleAlign = tpl.titleAlign;
    if (tpl.text2 && !S.text2.trim()) S.text2 = tpl.text2;
  }

  if (tpl.tbox3) {
    TBOX3.show = tpl.tbox3.show;
    TBOX3.lf = tpl.tbox3.lf;
    TBOX3.tf = tpl.tbox3.tf;
    TBOX3.wf = tpl.tbox3.wf;
    TBOX3.hf = tpl.tbox3.hf;
    if (tpl.sigFont) S.sigFont = tpl.sigFont;
    if (tpl.sigBold !== undefined) S.sigBold = tpl.sigBold;
    if (tpl.sigColor) S.sigColor = tpl.sigColor;
    if (tpl.sigAlign !== undefined) S.sigAlign = tpl.sigAlign;
    if (tpl.text3 && !S.text3.trim()) S.text3 = tpl.text3;
    ensureFontLoaded(S.sigFont);
  }

  if (!S.text.trim() && tpl.placeholder) S.text = tpl.placeholder;

  syncFmtUI();
  syncLegibilityUI();
  syncTextBox();
  buildTemplatePanel();

  document.getElementById('sub-tb').classList.add('on');
  document.getElementById('text-tb').classList.add('on');

  if (TBOX.editing) updateEditStyleFor(BOX_DEFS.main);
  if (TBOX2.editing) updateEditStyleFor(BOX_DEFS.title);
  if (TBOX3.editing) updateEditStyleFor(BOX_DEFS.signature);
  markDirty();
}

// ════════════════════════════════════
//  TIMELINE NLE (CapCut / DaVinci style)
// ════════════════════════════════════
const TL_PX_PER_SEC = 52;
let _tlCanvasW = 600;
let _tlSeekBound = false;
let _imgScrubBound = false;

function formatTimelineTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function formatClipTimecode(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 30);
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

function getTimelineDuration() {
  if (S.mode === 'images' && S.imgs.length) return S.duration;
  if (S.mode === 'video' && S.videoEl && S.videoReady && isFinite(S.videoEl.duration))
    return S.videoEl.duration;
  return 0;
}

function getTimelinePlayheadSec() {
  if (S.mode === 'images' && S.imgs.length) return getSlideshowTimelinePos().current;
  if (S.mode === 'video' && S.videoEl && S.videoReady) return S.videoEl.currentTime || 0;
  return 0;
}

function onImgInputChange(input) {
  loadImages(input.files, _imgPickAppend);
  _imgPickAppend = false;
  input.value = '';
}

function pickImagesAppend() {
  _imgPickAppend = true;
  document.getElementById('img-input').click();
}

function captureVideoThumb(video) {
  try {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 136;
    const x = c.getContext('2d');
    x.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.72);
  } catch (_) {
    return null;
  }
}

function getSlideshowTimelinePos() {
  const total = Math.max(0.001, S.duration);
  const current = Math.min(total, S.playMs / 1000);
  return { current, total, ratio: Math.min(1, current / total) };
}

function syncSlideshowFromPlayMs() {
  if (!S.imgs.length) return;
  const slideMs = S.speed * 1000;
  const clockMs = S.recording ? S.playMs : S.slideClockMs;
  const fade = getSlideFadeState(clockMs, S.imgs.length, slideMs);
  S.idx = fade.idx;
  S.prevIdx = fade.prevIdx;
  S.fadeProgress = fade.fadeT;
  S.holdT = fade.holdT ?? 0;
  S.prevHoldT = fade.prevHoldT ?? fade.holdT ?? 0;
  S.elapsed = clockMs % slideMs;
}

function updateTimelineProgress() {
  if (S.mode !== 'video') return;
  const playhead = document.getElementById('tl-playhead');
  if (!playhead) return;
  const dur = getTimelineDuration();
  const sec = getTimelinePlayheadSec();
  const x = dur > 0 ? (sec / dur) * _tlCanvasW : 0;
  playhead.style.left = x + 'px';
}

function updateImagesTimelineProgress() {
  if (S.mode !== 'images' || !S.imgs.length) return;
  const { current, total, ratio } = getSlideshowTimelinePos();
  const fill = document.getElementById('tl-img-progress-fill');
  const knob = document.getElementById('tl-img-progress-knob');
  const bar = document.getElementById('tl-img-progress');
  const curEl = document.getElementById('tl-img-time-cur');
  const totEl = document.getElementById('tl-img-time-total');
  const pct = Math.round(ratio * 100);
  if (fill) fill.style.width = pct + '%';
  if (knob) knob.style.left = pct + '%';
  if (bar) bar.setAttribute('aria-valuenow', String(pct));
  if (curEl) curEl.textContent = formatTimelineTime(current);
  if (totEl) totEl.textContent = formatTimelineTime(total);
}

function setupImagesTimelineSeek() {
  const bar = document.getElementById('tl-img-progress');
  if (!bar || _imgScrubBound) return;
  _imgScrubBound = true;

  const seekFromClientX = clientX => {
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTimelineSec(ratio * S.duration);
    updateImagesTimelineProgress();
  };

  bar.addEventListener('pointerdown', e => {
    e.preventDefault();
    bar.setPointerCapture(e.pointerId);
    _tlScrubDragging = true;
    seekFromClientX(e.clientX);
  });
  bar.addEventListener('pointermove', e => {
    if (_tlScrubDragging) seekFromClientX(e.clientX);
  });
  const endScrub = e => {
    _tlScrubDragging = false;
    bar.releasePointerCapture?.(e.pointerId);
  };
  bar.addEventListener('pointerup', endScrub);
  bar.addEventListener('pointercancel', endScrub);
}

function seekTimelineSec(sec) {
  const dur = getTimelineDuration();
  sec = Math.max(0, Math.min(dur, sec));
  if (S.mode === 'images' && S.imgs.length) {
    S.playMs = sec * 1000;
    S.slideClockMs = sec * 1000;
    syncSlideshowFromPlayMs();
    updateTimelineActive();
    updateImagesTimelineProgress();
    markDirty();
  } else if (S.mode === 'video' && S.videoEl && S.videoReady) {
    S.videoEl.currentTime = sec;
    if (S.playing) S.videoEl.play().catch(() => {});
  }
  updateTimelineProgress();
}

function seekTimelineFromClientX(clientX) {
  const scroll = document.getElementById('tl-scroll');
  if (!scroll) return;
  const rect = scroll.getBoundingClientRect();
  const x = clientX - rect.left + scroll.scrollLeft;
  const dur = getTimelineDuration();
  if (dur <= 0 || _tlCanvasW <= 0) return;
  seekTimelineSec((x / _tlCanvasW) * dur);
}

function setupTimelineSeek() {
  const scroll = document.getElementById('tl-scroll');
  if (!scroll || _tlSeekBound) return;
  _tlSeekBound = true;

  const onDown = e => {
    if (e.target.closest('.tl-clip, .tl-del')) return;
    _tlScrubDragging = true;
    scroll.setPointerCapture(e.pointerId);
    seekTimelineFromClientX(e.clientX);
  };
  const onMove = e => {
    if (_tlScrubDragging) seekTimelineFromClientX(e.clientX);
  };
  const onUp = e => {
    _tlScrubDragging = false;
    scroll.releasePointerCapture?.(e.pointerId);
  };

  scroll.addEventListener('pointerdown', onDown);
  scroll.addEventListener('pointermove', onMove);
  scroll.addEventListener('pointerup', onUp);
  scroll.addEventListener('pointercancel', onUp);
}

function buildTimelineRuler(totalSec, widthPx) {
  const ruler = document.getElementById('tl-ruler');
  if (!ruler) return;
  ruler.style.width = widthPx + 'px';
  ruler.innerHTML = '';
  const major = totalSec > 90 ? 15 : totalSec > 45 ? 10 : 5;
  for (let t = 0; t <= totalSec + 0.01; t += major) {
    const mark = document.createElement('div');
    mark.className = 'tl-ruler-mark';
    mark.style.left = (t * TL_PX_PER_SEC) + 'px';
    mark.textContent = formatTimelineTime(t);
    ruler.appendChild(mark);
  }
  for (let t = major / 2; t < totalSec; t += major) {
    const minor = document.createElement('div');
    minor.className = 'tl-ruler-mark minor';
    minor.style.left = (t * TL_PX_PER_SEC) + 'px';
    ruler.appendChild(minor);
  }
}

function createFilmstrip(src, widthPx) {
  const strip = document.createElement('div');
  strip.className = 'tl-filmstrip';
  const frameW = 46;
  const count = Math.max(1, Math.ceil(widthPx / frameW));
  for (let n = 0; n < count; n++) {
    const img = document.createElement('img');
    img.className = 'tl-strip-frame';
    img.src = src;
    img.alt = '';
    img.draggable = false;
    strip.appendChild(img);
  }
  return strip;
}

function attachClipDrag(item, i) {
  item.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.tl-del')) return;
    e.stopPropagation();
    e.preventDefault();

    let dragging = false;
    const sx = e.clientX;
    const sy = e.clientY;

    const onMove = ev => {
      if (!dragging) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        dragging = true;
        _tlDragFrom = i;
        item.classList.add('dragging');
        item.setPointerCapture(ev.pointerId);
      }
      showTimelineInsertLine(ev.clientX);
    };

    const onUp = ev => {
      item.releasePointerCapture?.(ev.pointerId);
      item.classList.remove('dragging');
      if (dragging && _tlInsertAt !== null) reorderSlideTo(i, _tlInsertAt);
      else if (!dragging) goToSlide(i);
      hideTimelineInsertLine();
      _tlDragFrom = null;
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

function buildImageMediaClip(img, i, durSec) {
  const w = Math.max(48, Math.round(durSec * TL_PX_PER_SEC));
  const item = document.createElement('div');
  item.className = 'tl-clip' + (i === S.idx ? ' sel' : '');
  item.style.width = w + 'px';
  item.dataset.idx = String(i);

  item.appendChild(createFilmstrip(img.src, w));
  const shade = document.createElement('div');
  shade.className = 'tl-clip-shade';
  item.appendChild(shade);

  const tag = document.createElement('div');
  tag.className = 'tl-clip-tag';
  tag.textContent = `IMG_${String(i + 1).padStart(2, '0')}  ${formatClipTimecode(durSec)}`;
  item.appendChild(tag);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'tl-del';
  del.textContent = '×';
  del.title = 'Remover clip';
  del.onclick = ev => { ev.stopPropagation(); removeSlide(i); };
  item.appendChild(del);

  attachClipDrag(item, i);
  return item;
}

function buildVideoMediaClip(durSec) {
  const w = Math.max(120, Math.round(durSec * TL_PX_PER_SEC));
  const item = document.createElement('div');
  item.className = 'tl-clip sel';
  item.style.width = w + 'px';
  item.dataset.idx = '0';

  const src = _videoThumbDataUrl || '';
  if (src) item.appendChild(createFilmstrip(src, w));
  const shade = document.createElement('div');
  shade.className = 'tl-clip-shade';
  item.appendChild(shade);

  const tag = document.createElement('div');
  tag.className = 'tl-clip-tag';
  const base = (_videoFileName || 'VIDEO').replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase();
  tag.textContent = `${base}  ${formatClipTimecode(durSec)}`;
  item.appendChild(tag);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'tl-del';
  del.textContent = '×';
  del.title = 'Apagar vídeo';
  del.onclick = ev => { ev.stopPropagation(); clearUploadedVideo(); };
  item.appendChild(del);
  return item;
}

function buildTextTrack(totalSec, widthPx) {
  const row = document.getElementById('tl-row-text');
  const side = document.getElementById('tl-side-text');
  if (!row) return;
  row.innerHTML = '';
  row.style.width = widthPx + 'px';

  const blocks = [];
  if (TBOX.show && S.text.trim()) {
    blocks.push({ ic: 'T', txt: S.text.trim(), color: '#7c2d12' });
  }
  if (TBOX2.show && S.text2.trim()) {
    blocks.push({ ic: 'Aa', txt: S.text2.trim(), color: '#713f12' });
  }
  if (TBOX3.show && S.text3.trim()) {
    blocks.push({ ic: '@', txt: S.text3.trim(), color: '#831843' });
  }

  if (!blocks.length) {
    row.classList.add('hidden');
    side?.classList.add('hidden');
    return;
  }

  row.classList.remove('hidden');
  side?.classList.remove('hidden');

  const slice = widthPx / blocks.length;
  blocks.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'tl-tclip';
    el.style.width = slice + 'px';
    el.style.left = (i * slice) + 'px';
    if (b.color) el.style.background = `linear-gradient(180deg, ${b.color}, #3f1d0a)`;
    el.innerHTML = `<span class="tl-tclip-ic">${b.ic}</span><span class="tl-tclip-txt"></span>`;
    el.querySelector('.tl-tclip-txt').textContent = b.txt;
    row.appendChild(el);
  });
}

async function buildAudioTrack(totalSec, widthPx) {
  const row = document.getElementById('tl-row-audio');
  const side = document.getElementById('tl-side-audio');
  if (!row) return;
  row.innerHTML = '';
  row.style.width = widthPx + 'px';

  if (!_audioBlob || !S.audioEnabled) {
    row.classList.add('hidden');
    side?.classList.add('hidden');
    return;
  }

  row.classList.remove('hidden');
  side?.classList.remove('hidden');

  const block = document.createElement('div');
  block.className = 'tl-audio-block';
  block.style.width = widthPx + 'px';
  const canvas = document.createElement('canvas');
  canvas.height = 36;
  canvas.width = Math.min(widthPx, 2400);
  block.appendChild(canvas);
  row.appendChild(block);

  drawAudioWaveform(canvas, _audioBlob, totalSec);
}

async function drawAudioWaveform(canvas, blob, totalSec) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(0, 0, w, h);

  const drawBars = () => {
    ctx.fillStyle = 'rgba(96,165,250,.85)';
    for (let x = 0; x < w; x += 3) {
      const amp = 0.15 + Math.abs(Math.sin(x * 0.07) * Math.cos(x * 0.013)) * 0.75;
      const bh = amp * (h * 0.85);
      ctx.fillRect(x, (h - bh) / 2, 2, bh);
    }
  };

  try {
    const ab = await blob.arrayBuffer();
    const actx = new AudioContext();
    const buf = await actx.decodeAudioData(ab.slice(0));
    actx.close();
    const data = buf.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / w));
    ctx.fillStyle = 'rgba(96,165,250,.9)';
    for (let x = 0; x < w; x++) {
      let min = 1, max = -1;
      const start = x * step;
      for (let i = 0; i < step && start + i < data.length; i++) {
        const v = data[start + i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const bh = Math.max(2, (max - min) * h * 0.9);
      ctx.fillRect(x, (h - bh) / 2, 1, bh);
    }
  } catch (_) {
    drawBars();
  }
}

function showTimelineInsertLine(clientX) {
  if (S.mode !== 'images') return;
  const media = document.getElementById('tl-img-track');
  const line = document.getElementById('tl-img-insert');
  if (!media || !line) return;

  const clips = [...media.querySelectorAll('.tl-slide:not(.dragging)')];
  let insertAt = S.imgs.length;
  let x = media.offsetWidth - 2;

  for (let i = 0; i < clips.length; i++) {
    const idx = parseInt(clips[i].dataset.idx, 10);
    const r = clips[i].getBoundingClientRect();
    const mid = r.left + r.width / 2;
    if (clientX < mid) {
      insertAt = idx;
      x = clips[i].offsetLeft;
      break;
    }
    if (i === clips.length - 1 && clientX >= mid) {
      insertAt = idx + 1;
      x = clips[i].offsetLeft + clips[i].offsetWidth;
    }
  }

  insertAt = Math.max(0, Math.min(S.imgs.length, insertAt));
  _tlInsertAt = insertAt;
  line.style.left = x + 'px';
  line.classList.add('on');
}

function hideTimelineInsertLine() {
  _tlInsertAt = null;
  document.getElementById('tl-img-insert')?.classList.remove('on');
  document.getElementById('tl-insert')?.classList.remove('on');
}

function removeVideoClip() {
  if (!confirm('Apagar o vídeo importado?')) return;
  clearUploadedVideo(false);
}

function clearUploadedVideo(confirmFirst = true) {
  const hasVideo = S.mode === 'video' || S.videoEl || _videoBlob;
  if (!hasVideo) return;
  if (confirmFirst && !confirm('Apagar o vídeo importado?')) return;
  if (S.videoEl) {
    S.videoEl.pause();
    URL.revokeObjectURL(S.videoEl.src);
    S.videoEl = null;
  }
  _videoBlob = null;
  _videoFileName = '';
  _videoThumbDataUrl = null;
  S.videoReady = false;
  S.mode = 'none';
  S.playMs = 0;
  S.slideClockMs = 0;
  document.getElementById('img-count').textContent = '';
  rebuildTimeline();
  updateDownloadBtn();
  markDirty();
}

function clearAllImages(skipConfirm = false) {
  if (S.mode !== 'images' || !S.imgs.length) return;
  const n = S.imgs.length;
  const msg = n === 1
    ? 'Apagar a imagem importada?'
    : `Apagar todas as ${n} imagens importadas?`;
  if (!skipConfirm && !confirm(msg)) return;
  _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
  _imgBlobUrls = [];
  _imageBlobs = [];
  S.imgs = [];
  S.mode = 'none';
  S.idx = 0;
  S.prevIdx = 0;
  S.playMs = 0;
  S.slideClockMs = 0;
  S.fadeProgress = 1;
  document.getElementById('img-count').textContent = '';
  rebuildTimeline();
  updateDownloadBtn();
  markDirty();
}

function buildImageSlideClip(img, i) {
  const item = document.createElement('div');
  item.className = 'tl-slide' + (i === S.idx ? ' sel' : '');
  item.dataset.idx = String(i);

  const thumb = document.createElement('img');
  thumb.className = 'tl-slide-thumb';
  thumb.alt = 'Imagem ' + (i + 1);
  thumb.src = img.src;
  thumb.draggable = false;

  const foot = document.createElement('div');
  foot.className = 'tl-slide-foot';
  const num = document.createElement('span');
  num.className = 'tl-slide-num';
  num.textContent = i + 1;
  const dur = document.createElement('span');
  dur.className = 'tl-slide-dur';
  dur.textContent = S.speed.toFixed(1).replace('.0', '') + 's';
  foot.appendChild(num);
  foot.appendChild(dur);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'tl-del';
  del.textContent = '×';
  del.title = 'Apagar imagem';
  del.onclick = ev => { ev.stopPropagation(); removeSlide(i); };

  item.appendChild(thumb);
  item.appendChild(foot);
  item.appendChild(del);
  attachClipDrag(item, i);
  return item;
}

function syncImagesTimelineUI() {
  const durSec = S.duration;
  const totalEl = document.getElementById('tl-img-total');
  const valEl = document.getElementById('tl-img-speed-val');
  const range = document.getElementById('tl-img-speed');
  const durVal = document.getElementById('tl-img-duration-val');
  const durRange = document.getElementById('tl-img-duration');
  const n = S.imgs.length;

  if (totalEl) {
    totalEl.textContent = n
      ? `Vídeo: ${formatTimelineTime(durSec)} · ${n} imagem${n > 1 ? 'ns' : ''} · ${S.speed.toFixed(1)}s cada`
      : 'Vídeo: 0:00';
  }
  if (durVal) durVal.textContent = durSec + 's';
  if (durRange) durRange.value = String(durSec);
  if (valEl) valEl.textContent = S.speed.toFixed(1) + 's';
  if (range) range.value = String(Math.round(S.speed * 10));

  document.querySelectorAll('#tl-img-track .tl-slide-dur').forEach(el => {
    el.textContent = S.speed.toFixed(1).replace('.0', '') + 's';
  });
  updateImagesTimelineProgress();
}

function onProjectDurationChange(v) {
  S.duration = Math.max(5, Math.min(120, parseInt(v, 10) || 20));
  if (S.playMs > S.duration * 1000) S.playMs = 0;
  syncImagesTimelineUI();
  syncSlideshowFromPlayMs();
  updateImagesTimelineProgress();
  markDirty();
}

function onTimelineSpeedChange(v) {
  onSpeedChange(v);
}

function rebuildImagesTimeline() {
  const track = document.getElementById('tl-img-track');
  if (!track) return;
  track.innerHTML = '';
  S.imgs.forEach((img, i) => track.appendChild(buildImageSlideClip(img, i)));
  setupImagesTimelineSeek();
  syncImagesTimelineUI();
  updateImagesTimelineProgress();
  requestAnimationFrame(() => {
    track.querySelector('.tl-slide.sel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

function rebuildVideoTimeline() {
  const canvas = document.getElementById('tl-canvas');
  const media = document.getElementById('tl-row-media');
  const vidName = document.getElementById('tl-vid-name');
  if (!canvas || !media) return;

  if (vidName) vidName.textContent = _videoFileName || '';

  setupTimelineSeek();

  const totalSec = getTimelineDuration();
  const scroll = document.getElementById('tl-scroll');
  const viewW = scroll ? scroll.clientWidth : 600;
  _tlCanvasW = Math.max(viewW, Math.ceil(totalSec * TL_PX_PER_SEC) + 48);
  canvas.style.width = _tlCanvasW + 'px';

  buildTimelineRuler(totalSec, _tlCanvasW);
  buildTextTrack(totalSec, _tlCanvasW);
  buildAudioTrack(totalSec, _tlCanvasW);

  media.innerHTML = '';
  media.style.width = _tlCanvasW + 'px';
  media.appendChild(buildVideoMediaClip(totalSec));

  updateTimelineProgress();
}

function syncTimelineVisibility(hasImages, hasVideo) {
  const bar = document.getElementById('timeline-bar');
  const nle = document.getElementById('tl-nle');
  const imgPanel = document.getElementById('tl-images');
  if (!bar || !nle || !imgPanel) return;

  if (!hasImages && !hasVideo) {
    bar.classList.remove('on', 'mode-images', 'mode-video');
    nle.classList.add('hidden');
    imgPanel.classList.add('hidden');
    nle.setAttribute('aria-hidden', 'true');
    imgPanel.setAttribute('aria-hidden', 'true');
    return;
  }

  bar.classList.add('on');

  if (hasImages) {
    bar.classList.add('mode-images');
    bar.classList.remove('mode-video');
    imgPanel.classList.remove('hidden');
    imgPanel.setAttribute('aria-hidden', 'false');
    nle.classList.add('hidden');
    nle.setAttribute('aria-hidden', 'true');
  } else {
    bar.classList.add('mode-video');
    bar.classList.remove('mode-images');
    nle.classList.remove('hidden');
    nle.setAttribute('aria-hidden', 'false');
    imgPanel.classList.add('hidden');
    imgPanel.setAttribute('aria-hidden', 'true');
  }
}

function rebuildTimeline() {
  const bar = document.getElementById('timeline-bar');
  const nle = document.getElementById('tl-nle');
  const imgPanel = document.getElementById('tl-images');
  if (!bar) return;

  const hasImages = S.mode === 'images' && S.imgs.length > 0;
  const hasVideo = S.mode === 'video' && S.videoEl && S.videoReady;

  if (!hasImages && !hasVideo) {
    syncTimelineVisibility(false, false);
    document.getElementById('tl-img-track') && (document.getElementById('tl-img-track').innerHTML = '');
    document.getElementById('tl-row-media') && (document.getElementById('tl-row-media').innerHTML = '');
    return;
  }

  syncTimelineVisibility(hasImages, hasVideo);

  if (hasImages) rebuildImagesTimeline();
  else rebuildVideoTimeline();
}

function updateTimelineActive() {
  if (S.mode === 'images') {
    document.querySelectorAll('#tl-img-track .tl-slide').forEach(el => {
      el.classList.toggle('sel', parseInt(el.dataset.idx, 10) === S.idx);
    });
  } else if (S.mode === 'video') {
    document.querySelectorAll('#tl-row-media .tl-clip').forEach(el => {
      el.classList.toggle('sel', parseInt(el.dataset.idx, 10) === S.idx);
    });
    updateTimelineProgress();
  }
}

function goToSlide(i) {
  if (S.mode !== 'images' || i < 0 || i >= S.imgs.length) return;
  S.playMs = i * S.speed * 1000;
  S.slideClockMs = S.playMs;
  syncSlideshowFromPlayMs();
  updateTimelineActive();
  markDirty();
}

function reorderSlideTo(from, insertAt) {
  if (S.mode !== 'images' || from === insertAt) return;
  let to = insertAt;
  if (from < to) to--;
  if (to === from || to < 0 || to >= S.imgs.length) return;

  const move = arr => {
    const x = arr.splice(from, 1)[0];
    arr.splice(to, 0, x);
  };
  move(S.imgs);
  move(_imageBlobs);
  move(_imgBlobUrls);

  syncSlideshowFromPlayMs();
  rebuildTimeline();
  markDirty();
}

function reorderSlide(from, to) {
  reorderSlideTo(from, to > from ? to + 1 : to);
}

function removeSlide(i) {
  if (S.mode !== 'images' || i < 0 || i >= S.imgs.length) return;
  if (S.imgs.length === 1) {
    if (!confirm('Apagar a imagem importada?')) return;
    clearAllImages(true);
    return;
  }

  URL.revokeObjectURL(_imgBlobUrls[i]);
  S.imgs.splice(i, 1);
  _imageBlobs.splice(i, 1);
  _imgBlobUrls.splice(i, 1);

  syncSlideshowFromPlayMs();
  document.getElementById('img-count').textContent =
    `· ${S.imgs.length} imagem${S.imgs.length > 1 ? 'ns' : ''}`;
  rebuildTimeline();
  markDirty();
}

// ════════════════════════════════════
//  BACKGROUND MUSIC
// ════════════════════════════════════
function syncAudioUI() {
  const el = document.getElementById('aud-file');
  const btn = document.getElementById('audio-tb');
  const pct = Math.round(S.audioVolume * 100);
  if (document.getElementById('aud-vol-range')) {
    document.getElementById('aud-vol-range').value = pct;
    document.getElementById('aud-vol-val').textContent = pct + '%';
  }
  if (el) {
    if (_audioFileName) {
      el.textContent = '♫ ' + _audioFileName;
      el.classList.add('on');
    } else {
      el.textContent = 'Nenhuma música selecionada';
      el.classList.remove('on');
    }
  }
  if (btn) btn.classList.toggle('on', S.audioEnabled && !!_audioBlob);
}

function pickAudio() {
  document.getElementById('audio-input').click();
}

function attachAudioElement(blob, name) {
  if (_audioEl) {
    _audioEl.pause();
    if (_audioUrl) URL.revokeObjectURL(_audioUrl);
  }
  _audioBlob = blob;
  _audioFileName = name || 'audio';
  _audioUrl = URL.createObjectURL(blob);
  _audioEl = new Audio(_audioUrl);
  _audioEl.loop = true;
  _audioEl.volume = S.audioVolume;
  S.audioEnabled = true;
  syncAudioUI();
  if (S.playing && _editorOpen) _audioEl.play().catch(() => {});
  if (document.getElementById('timeline-bar')?.classList.contains('on')) rebuildTimeline();
}

function loadAudio(file) {
  if (!file) return;
  attachAudioElement(file, file.name);
  markDirty();
}

function loadAudioFromBlob(blob, name) {
  if (!blob) return;
  attachAudioElement(blob, name || 'audio');
}

async function restoreProjectAudio() {
  try {
    const db = await openDB();
    const blob = await new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readonly');
      const req = tx.objectStore('blobs').get('audio');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const name = await new Promise(resolve => {
      const tx = db.transaction('blobs', 'readonly');
      const req = tx.objectStore('blobs').get('audio-name');
      req.onsuccess = () => resolve(req.result || 'audio');
      req.onerror = () => resolve('audio');
    });
    if (blob) {
      loadAudioFromBlob(blob, name);
      S.audioEnabled = true;
      syncAudioUI();
    }
  } catch (err) {
    console.warn('Falha ao restaurar áudio:', err);
  }
}

function removeAudio() {
  if (_audioEl) {
    _audioEl.pause();
    _audioEl = null;
  }
  if (_audioUrl) URL.revokeObjectURL(_audioUrl);
  _audioUrl = null;
  _audioBlob = null;
  _audioFileName = '';
  S.audioEnabled = false;
  syncAudioUI();
  markDirty();
}

function onAudioVolumeChange(v) {
  S.audioVolume = parseInt(v, 10) / 100;
  document.getElementById('aud-vol-val').textContent = v + '%';
  if (_audioEl) _audioEl.volume = S.audioVolume;
  markDirty();
}

function syncAudioPlayback() {
  if (!_audioEl || !S.audioEnabled) return;
  if (S.playing) _audioEl.play().catch(() => {});
  else _audioEl.pause();
}

// ════════════════════════════════════
//  BOOT ANIMATION — iPhone "Hello" canvas writing effect
// ════════════════════════════════════
function finishBoot() {
  const bootEl = document.getElementById('boot');
  if (_bootRaf) cancelAnimationFrame(_bootRaf);
  _bootRaf = null;
  if (bootEl) bootEl.style.display = 'none';
  document.getElementById('home').classList.add('on');
  refreshHomeResume();
  removeLegacySpeedUI();
}

function skipBoot() {
  const remember = document.getElementById('boot-skip-check');
  if (remember && remember.checked) localStorage.setItem('versovivo-skip-boot', '1');
  finishBoot();
}

(function bootHello() {
  const bootEl  = document.getElementById('boot');
  const skipBtn = document.getElementById('boot-skip');
  const rememberEl = document.getElementById('boot-remember');

  if (localStorage.getItem('versovivo-skip-boot') === '1') {
    finishBoot();
    return;
  }

  const WORD        = 'VersoVivo';
  const FONT_FAMILY = "'Sacramento', cursive";
  const WRITE_START = 0.25;
  const WRITE_DUR   = 2.0;
  const HOLD_DUR    = 0.55;
  const FADE_DUR    = 0.55;
  const SUB_IN_AT   = 1.9;
  const SUB_IN_DUR  = 0.45;
  const TOTAL       = WRITE_START + WRITE_DUR + HOLD_DUR + FADE_DUR + 0.15;
  const SKIP_AT     = 0.8;

  const subEl   = document.getElementById('boot-sub');
  const bCv     = document.getElementById('boot-canvas');
  const bCtx    = bCv.getContext('2d');
  let startTime = null;

  function resize() {
    bCv.width  = bootEl.offsetWidth  || window.innerWidth;
    bCv.height = bootEl.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function writeEase(t) {
    const s = t * t * (3 - 2 * t);
    const undulate = 0.018 * Math.sin(t * Math.PI * 5);
    return Math.min(1, Math.max(0, s + undulate));
  }

  function drawFrame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;

    if (elapsed >= SKIP_AT) {
      if (skipBtn) skipBtn.classList.add('on');
      if (rememberEl) rememberEl.classList.add('on');
    }

    const W = bCv.width, H = bCv.height;
    bCtx.clearRect(0, 0, W, H);
    bCtx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg').trim() || '#09090F';
    bCtx.fillRect(0, 0, W, H);

    const writeRaw = (elapsed - WRITE_START) / WRITE_DUR;
    const writeT   = Math.min(1, Math.max(0, writeRaw));
    const progress = writeEase(writeT);

    if (writeT > 0) {
      const fontSize = Math.min(W * 0.18, H * 0.22, 120);
      bCtx.font = `${fontSize}px ${FONT_FAMILY}`;
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      const cx = W / 2, cy = H / 2;
      const fullW = bCtx.measureText(WORD).width;
      bCtx.save();
      bCtx.beginPath();
      bCtx.rect(cx - fullW * 0.55, 0, fullW * 1.1 * progress, H);
      bCtx.clip();
      const grad = bCtx.createLinearGradient(cx - fullW / 2, 0, cx + fullW / 2, 0);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(0.5, '#e879f9');
      grad.addColorStop(1, '#f472b6');
      bCtx.fillStyle = grad;
      bCtx.fillText(WORD, cx, cy);
      bCtx.restore();
    }

    if (writeT > 0 && writeT < 1) {
      const fontSize = Math.min(W * 0.18, H * 0.22, 120);
      bCtx.font = `${fontSize}px ${FONT_FAMILY}`;
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      const cx = W / 2, cy = H / 2;
      const fullW = bCtx.measureText(WORD).width;
      const penX = (cx - fullW * 0.55) + fullW * 1.1 * progress;
      const arcOffset = Math.sin(progress * Math.PI) * (fontSize * 0.08);
      const penY = cy - arcOffset;
      const halo = bCtx.createRadialGradient(penX, penY, 0, penX, penY, fontSize * 0.55);
      halo.addColorStop(0, 'rgba(232, 121, 249, 0.22)');
      halo.addColorStop(1, 'rgba(192, 132, 252, 0)');
      bCtx.beginPath();
      bCtx.arc(penX, penY, fontSize * 0.55, 0, Math.PI * 2);
      bCtx.fillStyle = halo;
      bCtx.fill();
    }

    const subProgress = Math.min(1, Math.max(0, (elapsed - SUB_IN_AT) / SUB_IN_DUR));
    if (subEl) {
      subEl.style.opacity = subProgress;
      subEl.style.transform = `translateY(${(1 - subProgress) * 10}px)`;
      subEl.style.top = (H / 2 + Math.min(W * 0.18, H * 0.22, 120) * 0.85) + 'px';
    }

    const fadeStart = WRITE_START + WRITE_DUR + HOLD_DUR;
    const fadeT = Math.min(1, Math.max(0, (elapsed - fadeStart) / FADE_DUR));
    if (fadeT > 0) {
      bCtx.globalAlpha = fadeT;
      bCtx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg').trim() || '#09090F';
      bCtx.fillRect(0, 0, W, H);
      bCtx.globalAlpha = 1;
      if (subEl) subEl.style.opacity = Math.max(0, subProgress - fadeT);
    }

    if (elapsed >= TOTAL) {
      finishBoot();
      return;
    }

    _bootRaf = requestAnimationFrame(drawFrame);
  }

  document.fonts.ready.then(() => {
    _bootRaf = requestAnimationFrame(drawFrame);
  });
})();

// ════════════════════════════════════
//  CANVAS SETUP
// ════════════════════════════════════
const cv  = document.getElementById('cv');
const ctx = cv.getContext('2d');

let _rafId = null; // referência global para o loop principal

function removeLegacySpeedUI() {
  document.querySelectorAll('[data-tut="velocidade"]').forEach(el => el.remove());
  document.querySelectorAll('button.tb').forEach(btn => {
    const lbl = btn.querySelector('.tb-lbl');
    if (lbl && lbl.textContent.trim() === 'Velocidade') btn.remove();
  });
  document.getElementById('sp')?.remove();
}

function openEditor(resume = false) {
  removeLegacySpeedUI();
  document.getElementById('home').classList.remove('on');
  document.getElementById('editor').classList.add('on');
  _editorOpen = true;
  resizeCanvas();
  initTextBoxEvents();
  if (_rafId !== null) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(tick);

  if (resume) {
    restoreProjectMedia().then(() => {
      syncTextBox();
      syncLegibilityUI();
      syncTextStyleTargetUI();
      syncEnhanceUI();
      updateDownloadBtn();
      rebuildTimeline();
      restoreProjectAudio();
    });
  } else {
    syncLegibilityUI();
    syncAudioUI();
    syncTextStyleTargetUI();
    syncEnhanceUI();
    buildTemplatePanel();
    updateDownloadBtn();
  }
}

function resizeCanvas() {
  const area = document.getElementById('canvas-area');
  const aw = area.clientWidth  - 20;
  const ah = area.clientHeight - 20;
  const ar = (FORMAT_PRESETS[S.aspectKey] || FORMAT_PRESETS['9:16']).aspect;
  let cw, ch;
  if (ar <= 1) {
    ch = ah;
    cw = ch * ar;
    if (cw > aw) { cw = aw; ch = cw / ar; }
  } else {
    cw = aw;
    ch = cw / ar;
    if (ch > ah) { ch = ah; cw = ch * ar; }
  }
  cv.width  = Math.floor(cw);
  cv.height = Math.floor(ch);
  syncTextBox();
  draw();
}

window.addEventListener('resize', () => {
  if (document.getElementById('editor').classList.contains('on')) {
    resizeCanvas();
    if (document.getElementById('timeline-bar')?.classList.contains('on')) rebuildTimeline();
  }
});

// ════════════════════════════════════
//  ANIMATION LOOP
// ════════════════════════════════════
function tick(ts) {
  const dt = S.lastTs ? Math.min(ts - S.lastTs, 400) : 0;
  S.lastTs = ts;

  // Não modifica S.idx durante a gravação — recLoop assume controle exclusivo
  if (!S.recording && S.playing && S.mode === 'images' && S.imgs.length > 0) {
    S.playMs += dt;
    S.slideClockMs += dt;
    const totalMs = S.duration * 1000;
    if (S.playMs >= totalMs) S.playMs -= totalMs;
    syncSlideshowFromPlayMs();
  }

  draw();
  if (S.mode === 'images' && S.imgs.length) {
    updateTimelineActive();
    updateImagesTimelineProgress();
  } else if (S.mode === 'video' && S.videoEl && S.videoReady) updateTimelineProgress();
  _rafId = requestAnimationFrame(tick);
}

function draw() {
  const w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#09090F';
  ctx.fillRect(0, 0, w, h);

  const hasMedia = S.mode === 'images' ? S.imgs.length > 0
                 : S.mode === 'video'  ? (S.videoEl && S.videoReady) : false;
  document.getElementById('cv-hint').style.display = hasMedia ? 'none' : 'flex';

  drawMedia(ctx, w, h);
  drawAllTextLayers(ctx, w, h, true);
}

/** Posição da caixa no canvas — sempre frações (WYSIWYG entre preview e export). */
function textBoxRect(box, w, h) {
  const lf = Math.max(0, Math.min(1 - box.wf, box.lf));
  const tf = Math.max(0, Math.min(1 - box.hf, box.tf));
  return {
    bx: lf * w,
    by: tf * h,
    bw: box.wf * w,
    bh: box.hf * h,
  };
}

function drawAllTextLayers(tctx, w, h, preview) {
  ['title', 'main', 'signature'].forEach(key => {
    const def = BOX_DEFS[key];
    const box = def.state;
    const st = def.style();
    if (!box.show || !st.text.trim() || box.editing && preview) return;
    const { bx, by, bw, bh } = textBoxRect(box, w, h);
    const fs = resolveRenderFontSize(def, box, bw, bh, preview, tctx, st);
    if (fs > 0) drawTextTo(tctx, bx, by, bw, bh, TEXT_BOX_PAD, fs, st);
  });
}

// ════════════════════════════════════
//  SHARED RENDER HELPERS
// ════════════════════════════════════

// Draw one media source cover-fit into context (optional Ken Burns zoom ≥ 1)
function drawMediaSource(tctx, w, h, src, zoom = 1) {
  if (!src) return;
  const sw = src.naturalWidth  || src.videoWidth  || 1;
  const sh = src.naturalHeight || src.videoHeight || 1;
  const ir = sw / sh, cr = w / h;
  let dw, dh, dx, dy;
  if (ir > cr) { dh = h; dw = dh * ir; dx = (w - dw) / 2; dy = 0; }
  else         { dw = w; dh = dw / ir; dx = 0;             dy = (h - dh) / 2; }
  if (zoom !== 1) {
    const cx = w * 0.5, cy = h * 0.5;
    dw *= zoom; dh *= zoom;
    dx = cx - dw * 0.5;
    dy = cy - dh * 0.5;
  }
  tctx.save();
  tctx.beginPath(); tctx.rect(0, 0, w, h); tctx.clip();
  const prevSmooth = tctx.imageSmoothingEnabled;
  const prevQuality = tctx.imageSmoothingQuality;
  tctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in tctx) tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(src, dx, dy, dw, dh);
  if ('imageSmoothingQuality' in tctx) tctx.imageSmoothingQuality = prevQuality;
  tctx.imageSmoothingEnabled = prevSmooth;
  tctx.restore();
}

function easeInOutCubic(t) {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getSlideFadeMs(slideMs) {
  return Math.min(FADE_MS, slideMs * 0.38);
}

function slideHoldT(pos, slideMs) {
  return ((pos % slideMs) + slideMs) % slideMs / slideMs;
}

// Slide fade state — imagens repetem em loop; fade proporcional à velocidade
function getSlideFadeState(elapsedMs, imgCount, slideMs) {
  if (imgCount <= 0) return { idx: 0, prevIdx: 0, fadeT: 1, holdT: 0, prevHoldT: 0 };
  if (imgCount === 1) {
    const holdT = slideHoldT(elapsedMs, slideMs);
    return { idx: 0, prevIdx: 0, fadeT: 1, holdT, prevHoldT: holdT };
  }
  const cycleMs = imgCount * slideMs;
  const pos = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
  const idx = Math.floor(pos / slideMs);
  const within = pos - idx * slideMs;
  const fadeMs = getSlideFadeMs(slideMs);
  const holdT = within / slideMs;

  if (within < fadeMs) {
    const prevIdx = idx === 0 ? imgCount - 1 : idx - 1;
    const rawT = within / fadeMs;
    const prevPos = prevIdx * slideMs + slideMs - fadeMs * 0.5;
    return {
      idx,
      prevIdx,
      fadeT: easeInOutCubic(rawT),
      holdT: holdT * easeInOutCubic(rawT),
      prevHoldT: Math.min(1, slideHoldT(prevPos, slideMs) + 0.12),
    };
  }
  return { idx, prevIdx: idx, fadeT: 1, holdT, prevHoldT: holdT };
}

/** Alias mantido para export e testes — usa apenas o crossfade por slide. */
function getPlaybackFadeState(playMs, totalMs, imgCount, slideMs) {
  return getSlideFadeState(playMs, imgCount, slideMs);
}

function drawSlideLayer(tctx, w, h, src, holdT, alpha, incoming) {
  if (!src || alpha <= 0.004) return;
  let zoom = 1 + KEN_BURNS_ZOOM * Math.max(0, Math.min(1, holdT));
  if (incoming) zoom += TRANS_IN_ZOOM * (1 - Math.max(0, Math.min(1, holdT)));
  else zoom += KEN_BURNS_ZOOM * 0.35;
  tctx.save();
  tctx.globalAlpha = alpha;
  drawMediaSource(tctx, w, h, src, zoom);
  tctx.restore();
}

function drawSlideTransition(tctx, w, h, cur, prev, fadeT, holdT, prevHoldT) {
  const t = fadeT;
  if (t <= 0.004) {
    drawSlideLayer(tctx, w, h, prev || cur, prevHoldT, 1, false);
    return;
  }
  if (t >= 0.996) {
    drawSlideLayer(tctx, w, h, cur, holdT, 1, true);
    return;
  }
  drawSlideLayer(tctx, w, h, prev, prevHoldT, 1 - t, false);
  drawSlideLayer(tctx, w, h, cur, holdT, t, true);
}

// Draw the current media (image slideshow or video) with optional crossfade
function drawMedia(tctx, w, h, opts = {}) {
  const idx     = opts.idx     !== undefined ? opts.idx     : S.idx;
  const prevIdx = opts.prevIdx !== undefined ? opts.prevIdx : S.prevIdx;
  const fadeT   = opts.fadeT   !== undefined ? opts.fadeT   : S.fadeProgress;
  const holdT   = opts.holdT   !== undefined ? opts.holdT   : (S.holdT ?? 0);
  const prevHoldT = opts.prevHoldT !== undefined ? opts.prevHoldT : (S.prevHoldT ?? holdT);

  if (S.mode === 'images' && S.imgs.length > 0) {
    const cur = S.imgs[idx];
    const prev = S.imgs[prevIdx];
    if (fadeT < 0.999 && prev && prev !== cur) {
      drawSlideTransition(tctx, w, h, cur, prev, fadeT, holdT, prevHoldT);
    } else if (fadeT < 0.999 && prev && prev === cur) {
      drawSlideTransition(tctx, w, h, cur, prev, fadeT, holdT, prevHoldT);
    } else {
      drawSlideLayer(tctx, w, h, cur, holdT, 1, true);
    }
    return;
  }

  if (S.mode === 'video' && S.videoEl && S.videoReady) {
    drawMediaSource(tctx, w, h, S.videoEl);
    maybeSharpenVideoFrame(tctx, w, h, S.videoEl);
  }
}

// Draw text into any canvas context at explicit pixel coords
function drawTextTo(tctx, bx, by, bw, bh, pad, fs, st) {
  st = st || BOX_DEFS.main.style();
  const fStr = (st.italic ? 'italic ' : '') + (st.bold ? 'bold ' : '') +
               `${fs}px '${st.font}', Georgia, serif`;
  tctx.save();
  tctx.beginPath(); tctx.rect(bx, by, bw, bh); tctx.clip();

  if (st.boxBgOpacity > 0) {
    tctx.fillStyle = `rgba(0,0,0,${st.boxBgOpacity})`;
    const r = Math.min(12, bw * 0.04);
    tctx.beginPath();
    if (tctx.roundRect) tctx.roundRect(bx, by, bw, bh, r);
    else tctx.rect(bx, by, bw, bh);
    tctx.fill();
  }

  tctx.font = fStr;
  tctx.textAlign = ALIGN_NAMES[st.align];
  tctx.textBaseline = 'alphabetic';
  tctx.fillStyle = st.color;

  if (st.textShadow) {
    tctx.shadowColor = 'rgba(0,0,0,0.75)';
    tctx.shadowBlur = Math.max(4, fs * 0.12);
    tctx.shadowOffsetX = Math.max(1, fs * 0.03);
    tctx.shadowOffsetY = Math.max(1, fs * 0.03);
  } else {
    tctx.shadowColor = 'transparent';
    tctx.shadowBlur = 0;
  }

  const maxW = bw - pad * 2;
  const lh = fs * 1.4;
  const lines = wrapLines(tctx, st.text, maxW);
  const totalH = lines.length * lh;
  let y = by + (bh - totalH) / 2 + fs * 0.82;
  const x = ALIGN_NAMES[st.align] === 'center' ? bx + bw / 2
           : ALIGN_NAMES[st.align] === 'right' ? bx + bw - pad : bx + pad;
  const strokeW = st.textStroke ? Math.max(1.5, fs / 18) : 0;

  for (const line of lines) {
    if (line) {
      if (strokeW > 0) {
        tctx.shadowColor = 'transparent';
        tctx.shadowBlur = 0;
        tctx.lineWidth = strokeW;
        tctx.strokeStyle = st.textShadow ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)';
        tctx.strokeText(line, x, y);
        if (st.textShadow) {
          tctx.shadowColor = 'rgba(0,0,0,0.75)';
          tctx.shadowBlur = Math.max(4, fs * 0.12);
          tctx.shadowOffsetX = Math.max(1, fs * 0.03);
          tctx.shadowOffsetY = Math.max(1, fs * 0.03);
        }
      }
      tctx.fillText(line, x, y);
      if (st.underline || st.strike) {
        tctx.shadowColor = 'transparent';
        tctx.shadowBlur = 0;
        const lw = tctx.measureText(line).width;
        const lx = ALIGN_NAMES[st.align] === 'center' ? x - lw / 2
                 : ALIGN_NAMES[st.align] === 'right' ? x - lw : x;
        tctx.strokeStyle = st.color;
        tctx.lineWidth = Math.max(1.5, fs / 24);
        if (st.underline) {
          tctx.beginPath();
          tctx.moveTo(lx, y + fs * 0.14); tctx.lineTo(lx + lw, y + fs * 0.14); tctx.stroke();
        }
        if (st.strike) {
          tctx.beginPath();
          tctx.moveTo(lx, y - fs * 0.35); tctx.lineTo(lx + lw, y - fs * 0.35); tctx.stroke();
        }
      }
    }
    y += lh;
  }
  tctx.restore();
}

// ════════════════════════════════════
//  TEXT BOX — SYNC, EDIT, EVENTS
// ════════════════════════════════════
let _eventsInited = false;
let _activeBoxDef = null;
let _textStyleTarget = 'main'; // 'main' | 'title' | 'signature'

function syncTextStyleTargetUI() {
  const hint = document.getElementById('text-target-hint');
  const label = STYLE_TARGET_LABELS[_textStyleTarget] || 'Verso';
  if (hint) hint.textContent = label;
  ['fp', 'fmt', 'cp', 'ts'].forEach(id => {
    const el = document.getElementById('panel-target-' + id);
    if (el) el.textContent = label;
  });
  syncAlignUI();
  syncFmtUI();
  syncFontSizeUI();
}

function syncFmtUI() {
  const target = _textStyleTarget;
  const isMain = target === 'main';
  document.getElementById('fmt-bold').classList.toggle('on',
    target === 'title' ? S.titleBold : target === 'signature' ? S.sigBold : S.bold);
  document.getElementById('fmt-italic').classList.toggle('on',
    target === 'title' ? S.titleItalic : target === 'signature' ? S.sigItalic : S.italic);
  document.getElementById('fmt-under').classList.toggle('on', isMain && S.underline);
  document.getElementById('fmt-strike').classList.toggle('on', isMain && S.strike);
  document.getElementById('fmt-under').classList.toggle('disabled', !isMain);
  document.getElementById('fmt-strike').classList.toggle('disabled', !isMain);
}

function getActiveBoxDef() {
  return BOX_DEFS[_textStyleTarget] || BOX_DEFS.main;
}

function clampFontSize(fs) {
  return Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Math.round(fs)));
}

function resolveEditFontSize(def) {
  const box = def.state;
  if (box.fontSize > 0) return box.fontSize;
  const st = def.style();
  const text = def.getText().trim();
  const pw = Math.max(40, box.pw || 160);
  const ph = Math.max(32, box.ph || 72);
  if (!text) return FONT_SIZE_EDIT_DEFAULT;
  const fit = calcFitFontSize(text, st.font, st.bold, st.italic, pw, ph);
  const cap = Math.max(FONT_SIZE_MIN, Math.round(ph * 0.32));
  return clampFontSize(Math.min(fit, cap));
}

function resolveRenderFontSize(def, box, bw, bh, preview, tctx, st) {
  const refPh = box.ph > 0 ? box.ph : Math.max(1, box.hf * cv.height);

  if (box.fontSize > 0) {
    if (Math.abs(bh - refPh) < 0.5) return box.fontSize;
    return clampFontSize(box.fontSize * (bh / refPh));
  }

  const text = (st.text || '').trim();
  if (!text) return FONT_SIZE_EDIT_DEFAULT;
  const fit = calcFitFontSize(text, st.font, st.bold, st.italic, bw, bh, tctx);
  const cap = Math.max(FONT_SIZE_MIN, Math.round(bh * 0.32));
  return clampFontSize(Math.min(fit, cap));
}

function syncFontSizeUI() {
  const def = getActiveBoxDef();
  const box = def.state;
  const auto = box.fontSize <= 0;
  const valEl = document.getElementById('text-fs-val');
  const range = document.getElementById('text-fs-range');
  const autoBtn = document.getElementById('fs-mode-auto');
  const manualBtn = document.getElementById('fs-mode-manual');
  const previewFs = resolveEditFontSize(def);
  if (valEl) valEl.textContent = auto ? 'Auto' : previewFs + 'px';
  if (range) {
    range.disabled = auto;
    range.value = auto ? previewFs : box.fontSize;
  }
  if (autoBtn) autoBtn.classList.toggle('on', auto);
  if (manualBtn) manualBtn.classList.toggle('on', !auto);
}

function setTextFontSizeAuto() {
  const def = getActiveBoxDef();
  def.state.fontSize = 0;
  if (def.isEditing()) {
    def.state._editFs = resolveEditFontSize(def);
    updateEditStyleFor(def);
  }
  syncFontSizeUI();
  syncTextBox();
  markDirty();
}

function enableTextFontSizeManual() {
  const def = getActiveBoxDef();
  if (def.state.fontSize <= 0) {
    def.state.fontSize = resolveEditFontSize(def);
  }
  onTextFontSizeChange(def.state.fontSize);
}

function onTextFontSizeChange(v) {
  const def = getActiveBoxDef();
  const fs = clampFontSize(parseInt(v, 10) || FONT_SIZE_EDIT_DEFAULT);
  def.state.fontSize = fs;
  def.state._editFs = fs;
  syncFontSizeUI();
  if (def.isEditing()) updateEditStyleFor(def);
  syncTextBox();
  if (def.isEditing()) growTextBoxIfNeeded(def);
  markDirty();
}

function bumpTextFontSize(delta) {
  const def = getActiveBoxDef();
  const base = def.state.fontSize > 0 ? def.state.fontSize : resolveEditFontSize(def);
  onTextFontSizeChange(base + delta);
}

function measureTextBlockHeight(text, font, bold, italic, innerWidth, fontSize, mctx) {
  if (!text || !text.trim()) return fontSize * TEXT_LINE_HEIGHT;
  mctx = mctx || ctx;
  mctx.save();
  mctx.font = (italic ? 'italic ' : '') + (bold ? 'bold ' : '') +
    `${fontSize}px '${font}', Georgia, serif`;
  const lines = wrapLines(mctx, text, innerWidth);
  mctx.restore();
  return lines.length * fontSize * TEXT_LINE_HEIGHT;
}

function measureTextInBox(def, text, pw, ph) {
  const box = def.state;
  const st = def.style();
  const fs = box._editFs || resolveEditFontSize(def);
  const innerW = Math.max(10, pw - TEXT_BOX_PAD * 2);
  const innerH = Math.max(10, ph - TEXT_BOX_PAD * 2);
  const contentH = measureTextBlockHeight(text, st.font, st.bold, st.italic, innerW, fs);
  const neededPh = contentH + TEXT_BOX_PAD * 2 + 2;
  return { fs, innerH, contentH, neededPh, fits: contentH <= innerH + 1 };
}

/** Cresce a caixa só quando o texto não cabe no espaço atual — pelo mínimo necessário. */
function growTextBoxIfNeeded(def) {
  const box = def.state;
  const ta = document.getElementById(def.editId);
  if (!ta || !def.isEditing()) return;

  const ov = document.getElementById('cv-overlay');
  const H = ov?.offsetHeight || 0;
  if (!H || !box.pw || !box.ph) return;

  const maxHf = Math.max(0.06, 1 - box.tf - 0.02);
  let guard = 0;

  while (guard++ < 5) {
    const m = measureTextInBox(def, ta.value, box.pw, box.ph);
    if (m.fits) break;

    const maxPh = maxHf * H;
    const nextPh = Math.min(Math.ceil(m.neededPh), maxPh);
    if (nextPh <= box.ph + 0.5) break;

    box.hf = nextPh / H;
    syncTextBoxFor(def);
    if (box.fontSize <= 0) {
      box._editFs = resolveEditFontSize(def);
      updateEditStyleFor(def);
    }
  }
}

function syncTextBoxFor(def) {
  const box = def.state;
  const tb = document.getElementById(def.elId);
  const ov = document.getElementById('cv-overlay');
  if (!box.show) {
    tb.classList.remove('visible');
    return;
  }
  tb.classList.add('visible');
  const W = ov.offsetWidth, H = ov.offsetHeight;
  box.lf = Math.max(0, Math.min(1 - box.wf, box.lf));
  box.tf = Math.max(0, Math.min(1 - box.hf, box.tf));
  const px = box.lf * W, py = box.tf * H, pw = box.wf * W, ph = box.hf * H;
  box.px = px; box.py = py; box.pw = pw; box.ph = ph;
  tb.style.left = px + 'px';
  tb.style.top = py + 'px';
  tb.style.width = pw + 'px';
  tb.style.height = ph + 'px';
  const st = def.style();
  tb.style.background = st.boxBgOpacity > 0 ? `rgba(0,0,0,${st.boxBgOpacity})` : 'transparent';
  tb.style.borderRadius = st.boxBgOpacity > 0 ? '8px' : '';
  if (def.isEditing()) updateEditStyleFor(def);
}

function syncTextBox() {
  syncTextBoxFor(BOX_DEFS.main);
  syncTextBoxFor(BOX_DEFS.title);
  syncTextBoxFor(BOX_DEFS.signature);
}

function updateEditStyleFor(def) {
  const ta = document.getElementById(def.editId);
  const box = def.state;
  const st = def.style();
  if (!ta) return;
  const fs = def.isEditing() ? (box._editFs || resolveEditFontSize(def)) : resolveEditFontSize(def);
  box._editFs = fs;
  ta.style.height = box.ph + 'px';
  ta.style.color = st.color;
  ta.style.fontFamily = `'${st.font}', Georgia, serif`;
  ta.style.fontSize = fs + 'px';
  ta.style.fontWeight = st.bold ? 'bold' : 'normal';
  ta.style.fontStyle = st.italic ? 'italic' : 'normal';
  ta.style.textAlign = ALIGN_NAMES[st.align];
  if (def === BOX_DEFS.main) {
    ta.style.textDecoration = [S.underline && 'underline', S.strike && 'line-through'].filter(Boolean).join(' ') || 'none';
  } else {
    ta.style.textDecoration = 'none';
  }
  ta.style.textShadow = st.textShadow ? '0 2px 8px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.6)' : 'none';
}

function exitAnyEditMode() {
  if (TBOX.editing) exitEditMode('main');
  if (TBOX2.editing) exitEditMode('title');
  if (TBOX3.editing) exitEditMode('signature');
}

function enterEditMode(key) {
  const def = BOX_DEFS[key];
  if (def.isEditing()) return;
  exitAnyEditMode();
  _textStyleTarget = key;
  syncTextStyleTargetUI();
  def.setEditing(true);
  const box = def.state;
  box._editFs = resolveEditFontSize(def);
  const ta = document.getElementById(def.editId);
  const tb = document.getElementById(def.elId);
  ta.value = def.getText();
  syncTextBox();
  ta.classList.add('on');
  tb.classList.add('editing');
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  });
}

function exitEditMode(key) {
  const def = BOX_DEFS[key];
  if (!def.isEditing()) return;
  def.setEditing(false);
  const ta = document.getElementById(def.editId);
  const tb = document.getElementById(def.elId);
  def.setText(ta.value);
  ta.classList.remove('on');
  tb.classList.remove('editing');
  if (!def.getText().trim()) def.state.show = false;
  syncTextBox();
  if (document.getElementById('timeline-bar')?.classList.contains('on')) rebuildTimeline();
  markDirty();
}

function onTboxInput(key) {
  const def = BOX_DEFS[key];
  const ta = document.getElementById(def.editId);
  def.setText(ta.value);
  growTextBoxIfNeeded(def);
  markDirty();
}

function registerTextBoxEvents(def, key) {
  const tb = document.getElementById(def.elId);
  const ta = document.getElementById(def.editId);
  ta.addEventListener('mousedown', e => e.stopPropagation());
  ta.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  ta.addEventListener('input', () => onTboxInput(key));
  ta.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); exitEditMode(key); }
  });

  function startAction(clientX, clientY, target) {
    const box = def.state;
    if (_textStyleTarget !== key) {
      _textStyleTarget = key;
      syncTextStyleTargetUI();
    }
    const isHandle = target.classList.contains('rh');
    if (def.isEditing() && !isHandle) return;
    if (isHandle) {
      if (def.isEditing()) exitEditMode(key);
      box.action = 'resize';
      box.dir = target.dataset.dir;
    } else {
      box.action = 'drag';
      box._downX = clientX;
      box._downY = clientY;
      box._moved = false;
    }
    box.sx = clientX; box.sy = clientY;
    box.slf = box.lf; box.stf = box.tf;
    box.swf = box.wf; box.shf = box.hf;
    _activeBoxDef = def;
  }

  function moveAction(clientX, clientY) {
    if (!_activeBoxDef || _activeBoxDef !== def) return;
    const box = def.state;
    if (!box.action) return;
    if (box.action === 'drag' && !box._moved) {
      if (Math.abs(clientX - box._downX) > 4 || Math.abs(clientY - box._downY) > 4) box._moved = true;
    }
    const ov = document.getElementById('cv-overlay');
    const W = ov.offsetWidth, H = ov.offsetHeight;
    const dx = (clientX - box.sx) / W, dy = (clientY - box.sy) / H;
    const MIN = 0.06;
    if (box.action === 'drag') {
      if (!box._moved) return;
      box.lf = Math.max(0, Math.min(1 - box.wf, box.slf + dx));
      box.tf = Math.max(0, Math.min(1 - box.hf, box.stf + dy));
    } else {
      const d = box.dir;
      if (d.includes('e')) box.wf = Math.max(MIN, Math.min(1 - box.slf, box.swf + dx));
      if (d.includes('s')) box.hf = Math.max(MIN, Math.min(1 - box.stf, box.shf + dy));
      if (d.includes('w')) {
        const nw = Math.max(MIN, box.swf - dx);
        const nl = box.slf + box.swf - nw;
        if (nl >= 0) { box.wf = nw; box.lf = nl; }
      }
      if (d.includes('n')) {
        const nh = Math.max(MIN, box.shf - dy);
        const nt = box.stf + box.shf - nh;
        if (nt >= 0) { box.hf = nh; box.tf = nt; }
      }
      const tip = document.getElementById(def.tipId);
      if (tip) {
        tip.textContent = `${Math.round(box.wf * W)} × ${Math.round(box.hf * H)}`;
        tip.classList.add('on');
      }
    }
    syncTextBox();
    markDirty();
  }

  function endAction() {
    if (_activeBoxDef !== def) return;
    const box = def.state;
    if (box.action === 'drag' && !box._moved) enterEditMode(key);
    if (def.isEditing()) {
      if (def.state.fontSize <= 0) def.state._editFs = resolveEditFontSize(def);
      updateEditStyleFor(def);
    }
    box.action = null;
    box._moved = false;
    const tip = document.getElementById(def.tipId);
    if (tip) tip.classList.remove('on');
    _activeBoxDef = null;
  }

  tb.addEventListener('mousedown', e => { e.preventDefault(); startAction(e.clientX, e.clientY, e.target); });
  tb.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    startAction(t.clientX, t.clientY, e.target);
  }, { passive: false });

  document.addEventListener('mousemove', e => moveAction(e.clientX, e.clientY));
  document.addEventListener('mouseup', endAction);
  document.addEventListener('touchmove', e => {
    if (!_activeBoxDef || _activeBoxDef !== def || !def.state.action) return;
    e.preventDefault();
    const t = e.touches[0];
    moveAction(t.clientX, t.clientY);
  }, { passive: false });
  document.addEventListener('touchend', endAction);
}

function initTextBoxEvents() {
  if (_eventsInited) return;
  _eventsInited = true;
  document.addEventListener('pointerdown', e => {
    if (TBOX.editing && !document.getElementById('text-box').contains(e.target)) exitEditMode('main');
    if (TBOX2.editing && !document.getElementById('text-box-2').contains(e.target)) exitEditMode('title');
    if (TBOX3.editing && !document.getElementById('text-box-3').contains(e.target)) exitEditMode('signature');
  }, true);
  registerTextBoxEvents(BOX_DEFS.main, 'main');
  registerTextBoxEvents(BOX_DEFS.title, 'title');
  registerTextBoxEvents(BOX_DEFS.signature, 'signature');
}

function toggleTextMenu() {
  const btn = document.getElementById('text-tb');
  const subTb = document.getElementById('sub-tb');
  const on = !subTb.classList.contains('on');
  subTb.classList.toggle('on', on);
  btn.classList.toggle('on', on);
}

function createOrEditTextBox() {
  closePanels();
  _textStyleTarget = 'main';
  syncTextStyleTargetUI();
  if (!TBOX.show) {
    TBOX.show = true;
    TBOX.lf = 0.08; TBOX.tf = 0.28;
    TBOX.wf = 0.84; TBOX.hf = 0.14;
    if (!S.text.trim()) S.text = '';
    syncTextBox();
    markDirty();
  }
  enterEditMode('main');
}

function createOrEditTitleBox() {
  closePanels();
  _textStyleTarget = 'title';
  syncTextStyleTargetUI();
  ensureFontLoaded(S.titleFont);
  if (!TBOX2.show) {
    TBOX2.show = true;
    TBOX2.lf = 0.1; TBOX2.tf = 0.06;
    TBOX2.wf = 0.8; TBOX2.hf = 0.12;
    if (!S.text2.trim()) S.text2 = '';
    syncTextBox();
    markDirty();
  }
  document.getElementById('sub-tb').classList.add('on');
  document.getElementById('text-tb').classList.add('on');
  enterEditMode('title');
}

function createOrEditSignatureBox() {
  closePanels();
  _textStyleTarget = 'signature';
  syncTextStyleTargetUI();
  ensureFontLoaded(S.sigFont);
  if (!TBOX3.show) {
    TBOX3.show = true;
    TBOX3.lf = 0.55; TBOX3.tf = 0.90;
    TBOX3.wf = 0.38; TBOX3.hf = 0.07;
    if (!S.text3.trim()) S.text3 = '';
    syncTextBox();
    markDirty();
  }
  document.getElementById('sub-tb').classList.add('on');
  document.getElementById('text-tb').classList.add('on');
  enterEditMode('signature');
}

function wrapLines(ctx, text, maxW) {
  const result = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { result.push(''); continue; }
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        result.push(line.trimEnd());
        line = word;
      } else line = test;
    }
    // Palavra única mais larga que a caixa: deixa passar (canvas vai clipar)
    if (line) result.push(line.trimEnd());
  }
  return result;
}

// ════════════════════════════════════
//  FONT SIZE AUTO-FIT (binary search)
// ════════════════════════════════════
function calcFitFontSize(text, font, bold, italic, boxPxW, boxPxH, mctx) {
  mctx = mctx || ctx;
  const pad = 16;
  const mw  = boxPxW - pad * 2;
  const mh  = boxPxH - pad * 2;
  if (mw <= 10 || mh <= 10 || !text.trim()) return 12;

  function measureH(size) {
    mctx.save();
    mctx.font = (italic ? 'italic ' : '') + (bold ? 'bold ' : '') +
               `${size}px '${font}', Georgia, serif`;
    const count = wrapLines(mctx, text, mw).length;
    mctx.restore();
    return count * size * 1.4;
  }

  let lo = 6, hi = Math.min(mw, mh) * 0.85;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (measureH(mid) <= mh) lo = mid; else hi = mid;
  }
  return Math.max(6, Math.floor(lo * 0.95));
}

// ════════════════════════════════════
//  CONTROLS
// ════════════════════════════════════
function togglePlay() {
  S.playing = !S.playing;
  if (S.mode === 'video' && S.videoEl) {
    if (S.playing) S.videoEl.play(); else S.videoEl.pause();
  }
  syncAudioPlayback();
  updatePlayUI(S.playing);
}

function pickImages() {
  _imgPickAppend = false;
  document.getElementById('img-input').click();
}

function loadImages(files, append = false) {
  if (!files || !files.length) return;

  if (append && S.mode === 'images' && S.imgs.length) {
    appendImages(Array.from(files));
    return;
  }

  _imageBlobs = Array.from(files);
  if (S.videoEl) { S.videoEl.pause(); URL.revokeObjectURL(S.videoEl.src); S.videoEl = null; S.videoReady = false; }
  _videoBlob = null;
  _videoFileName = '';
  _videoThumbDataUrl = null;

  _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
  _imgBlobUrls = [];

  S.mode = 'images';
  S.imgs = []; S.idx = 0; S.prevIdx = 0; S.fadeProgress = 1; S.elapsed = 0; S.playMs = 0; S.slideClockMs = 0;
  loadImageFilesIntoSlideshow(Array.from(files), 0);
}

function appendImages(files) {
  if (S.videoEl) {
    if (!confirm('Adicionar imagens substituirá o vídeo atual. Continuar?')) return;
    S.videoEl.pause();
    URL.revokeObjectURL(S.videoEl.src);
    S.videoEl = null;
    S.videoReady = false;
    _videoBlob = null;
    _videoFileName = '';
    _videoThumbDataUrl = null;
  }
  S.mode = 'images';
  loadImageFilesIntoSlideshow(files, S.imgs.length);
}

function loadImageFilesIntoSlideshow(files, startIndex) {
  const append = startIndex > 0;
  let done = 0;
  let failed = 0;
  const pending = files.length;
  const newImgs = new Array(pending);
  const newBlobs = Array.from(files);
  const newUrls = new Array(pending);

  let finishing = false;

  files.forEach((f, i) => {
    const blobUrl = URL.createObjectURL(f);
    newUrls[i] = blobUrl;
    const img = new Image();

    const finish = async () => {
      if (done + failed < pending || finishing) return;
      finishing = true;
      let paired = [];
      for (let j = 0; j < pending; j++) {
        if (newImgs[j]) paired.push({ img: newImgs[j], blob: newBlobs[j], url: newUrls[j] });
        else if (newUrls[j]) URL.revokeObjectURL(newUrls[j]);
      }
      try {
        paired = await enhancePairedImages(paired);
      } catch (e) {
        console.error('[VersoVivo] enhance:', e);
      }
      completeImageImport(paired, failed, append);
    };

    img.onload = () => {
      newImgs[i] = img;
      done++;
      finish();
    };
    img.onerror = () => {
      newImgs[i] = null;
      failed++;
      finish();
    };
    img.src = blobUrl;
  });
}

function completeImageImport(paired, failed, append) {
  if (!paired.length) {
    alert('Nenhuma imagem pôde ser carregada. Verifique os arquivos selecionados.');
    return;
  }

  if (append) {
    paired.forEach(p => {
      S.imgs.push(p.img);
      _imageBlobs.push(p.blob);
      _imgBlobUrls.push(p.url);
    });
  } else {
    S.imgs = paired.map(p => p.img);
    _imageBlobs = paired.map(p => p.blob);
    _imgBlobUrls = paired.map(p => p.url);
    S.idx = 0;
    S.prevIdx = 0;
    S.fadeProgress = 1;
    S.elapsed = 0;
    S.playMs = 0;
  S.slideClockMs = 0;
  }

  if (append && S.idx >= S.imgs.length) S.idx = S.imgs.length - 1;

  S.playing = true;
  updatePlayUI(true);
  document.getElementById('img-count').textContent =
    `· ${S.imgs.length} imagem${S.imgs.length > 1 ? 'ns' : ''}${failed ? ` (${failed} falhou)` : ''}`;
  updateDownloadBtn();
  markDirty();
  rebuildTimeline();
}

function pickVideo() { document.getElementById('video-input').click(); }

function loadVideo(file) {
  if (!file) return;
  if (S.videoEl) { S.videoEl.pause(); URL.revokeObjectURL(S.videoEl.src); }
  _imgBlobUrls.forEach(u => URL.revokeObjectURL(u));
  _imgBlobUrls = [];
  _imageBlobs = [];
  _videoBlob = file;
  _videoFileName = file.name;
  S.imgs = []; S.idx = 0; S.elapsed = 0;
  S.mode = 'video'; S.videoReady = false;
  const video = document.createElement('video');
  video.muted = true; video.loop = true; video.playsInline = true;
  video.dataset.fileName = file.name;
  video.src = URL.createObjectURL(file);
  video.oncanplay = () => {
    S.videoReady = true; S.playing = true;
    _videoThumbDataUrl = captureVideoThumb(video);
    video.play();
    document.getElementById('img-count').textContent = `· ${file.name}`;
    updatePlayUI(true);
    updateDownloadBtn();
    markDirty();
    rebuildTimeline();
  };
  video.onerror = () => {
    URL.revokeObjectURL(video.src);
    S.videoEl = null; S.videoReady = false; S.mode = 'none';
    alert('Não foi possível carregar o vídeo. Verifique se o formato é suportado pelo seu navegador.');
  };
  S.videoEl = video;
}

function onSpeedChange(v) {
  S.speed = parseFloat((v / 10).toFixed(1));
  syncImagesTimelineUI();
  markDirty();
}

function cycleAlign() {
  if (_textStyleTarget === 'title') {
    S.titleAlign = (S.titleAlign + 1) % 3;
  } else if (_textStyleTarget === 'signature') {
    S.sigAlign = (S.sigAlign + 1) % 3;
  } else {
    S.align = (S.align + 1) % 3;
  }
  syncAlignUI();
  syncTextBox();
  const def = getActiveBoxDef();
  if (def.isEditing()) updateEditStyleFor(def);
  markDirty();
}

function toggleFmt(type) {
  if (_textStyleTarget === 'title') {
    if (type === 'bold') S.titleBold = !S.titleBold;
    else if (type === 'italic') S.titleItalic = !S.titleItalic;
    else return;
  } else if (_textStyleTarget === 'signature') {
    if (type === 'bold') S.sigBold = !S.sigBold;
    else if (type === 'italic') S.sigItalic = !S.sigItalic;
    else return;
  } else {
    S[type] = !S[type];
  }
  syncFmtUI();
  syncTextBox();
  const def = getActiveBoxDef();
  if (def.isEditing()) {
    if (def.state.fontSize <= 0) def.state._editFs = resolveEditFontSize(def);
    updateEditStyleFor(def);
    growTextBoxIfNeeded(def);
  }
  markDirty();
}

function setColor(hex) {
  if (_textStyleTarget === 'title') S.titleColor = hex;
  else if (_textStyleTarget === 'signature') S.sigColor = hex;
  else S.color = hex;
  const current = _textStyleTarget === 'title' ? S.titleColor
    : _textStyleTarget === 'signature' ? S.sigColor
    : S.color;
  document.getElementById('custom-color').value = current;
  document.querySelectorAll('.color-dot').forEach(d => {
    d.classList.toggle('sel', d.dataset.color === hex);
  });
  syncTextBox();
  const def = getActiveBoxDef();
  if (def.isEditing()) updateEditStyleFor(def);
  markDirty();
}

// ════════════════════════════════════
//  PANELS
// ════════════════════════════════════
function openPanel(id) {
  closePanels();
  document.getElementById('ov').classList.add('on');
  document.getElementById(id).classList.add('on');
  if (id === 'fp') buildFontPanel();
  if (id === 'cp') buildColorPanel();
  if (id === 'ts') syncFontSizeUI();
  if (id === 'lp') syncLegibilityUI();
  if (id === 'tp') buildTemplatePanel();
  if (id === 'ap') syncAudioUI();
  if (id === 'ar') syncAspectUI();
}

function closePanels() {
  document.querySelectorAll('.panel.on').forEach(p => p.classList.remove('on'));
  document.getElementById('ov').classList.remove('on');
}

// ─── Font panel ───────────────────
let fontsLoaded = false;
let allFontItems = [];

function buildFontPanel() {
  if (!fontsLoaded) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' +
      FONTS.map(f => encodeURIComponent(f).replace(/%20/g, '+')).join('&family=') +
      '&display=swap';
    document.head.appendChild(link);
    fontsLoaded = true;
  }

  const target = _textStyleTarget;
  const currentFont = target === 'title' ? S.titleFont
    : target === 'signature' ? S.sigFont
    : S.font;
  const grid    = document.getElementById('font-grid');
  const rawPreview = target === 'title'
    ? (S.text2 ? S.text2.replace(/\n/g, ' ').substring(0, 42).trim() : 'Título do poema')
    : target === 'signature'
    ? (S.text3 ? S.text3.replace(/\n/g, ' ').substring(0, 42).trim() : '@sua_conta')
    : (S.text ? S.text.replace(/\n/g, ' ').substring(0, 42).trim() : 'Poesia que vive...');

  grid.innerHTML = '';
  allFontItems   = [];

  FONTS.forEach(f => {
    const div = document.createElement('div');
    div.className = 'font-item' + (currentFont === f ? ' sel' : '');

    const nmEl = document.createElement('div');
    nmEl.className = 'font-nm';
    nmEl.textContent = f;

    const pvEl = document.createElement('div');
    pvEl.className = 'font-pv';
    pvEl.style.fontFamily = `'${f}', serif`;
    pvEl.textContent = rawPreview;

    div.appendChild(nmEl);
    div.appendChild(pvEl);
    div.onclick = () => {
      if (target === 'title') S.titleFont = f;
      else if (target === 'signature') S.sigFont = f;
      else S.font = f;
      ensureFontLoaded(f);
      closePanels();
      const active = getActiveBoxDef();
      if (active.isEditing() && active.state.fontSize <= 0) {
        active.state._editFs = resolveEditFontSize(active);
        updateEditStyleFor(active);
      }
      syncTextBox();
      markDirty();
    };
    grid.appendChild(div);
    allFontItems.push({ el: div, name: f.toLowerCase() });
  });
}

function filterFonts(q) {
  const term = q.toLowerCase().trim();
  allFontItems.forEach(({ el, name }) => {
    el.style.display = (!term || name.includes(term)) ? '' : 'none';
  });
}

// ─── Color panel ──────────────────
function buildColorPanel() {
  const current = _textStyleTarget === 'title' ? S.titleColor
    : _textStyleTarget === 'signature' ? S.sigColor
    : S.color;
  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';
  PRESET_COLORS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'color-dot' + (current === c ? ' sel' : '');
    d.style.background = c;
    d.style.border = c === '#000000' ? '2px solid #444' : '';
    d.dataset.color = c;
    d.onclick = () => setColor(c);
    grid.appendChild(d);
  });
  document.getElementById('custom-color').value = current;
}

// ════════════════════════════════════
//  DOWNLOAD / SHARE — export dinâmico por proporção
// ════════════════════════════════════

// Render one frame to any canvas context at any resolution
function renderFrame(tctx, tw, th, mediaOpts) {
  if (globalThis.VVExport?.configureExportCanvas) {
    VVExport.configureExportCanvas(tctx);
  }
  tctx.clearRect(0, 0, tw, th);
  tctx.fillStyle = '#09090F';
  tctx.fillRect(0, 0, tw, th);
  drawMedia(tctx, tw, th, mediaOpts || {});
  drawAllTextLayers(tctx, tw, th, false);
}

async function exportVideoBlob(onProgress) {
  const hasMedia = S.mode === 'images' ? S.imgs.length > 0
                 : S.mode === 'video'  ? (S.videoEl && S.videoReady) : false;
  if (!hasMedia) throw new Error('Adicione imagens ou um vídeo ao projeto primeiro!');

  await ensureExportFontsLoaded();

  const { rw: RW, rh: RH } = getExportSize();
  const rc   = document.createElement('canvas');
  rc.width   = RW; rc.height = RH;
  const rctx = rc.getContext('2d', { alpha: false });
  if (VVExport?.configureExportCanvas) VVExport.configureExportCanvas(rctx);

  const TYPES = [
    'video/mp4;codecs=avc1.640028',
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mime = TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
  const ext  = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  const videoBps = VVExport?.getExportVideoBitrate
    ? VVExport.getExportVideoBitrate(RW, RH)
    : 18_000_000;
  const audioBps = VVExport?.AUDIO_BITS_PER_SECOND ?? 192_000;
  const exportFps = VVExport?.EXPORT_FPS ?? 30;

  const report = (pct, msg) => {
    if (onProgress) onProgress({ pct: Math.min(100, pct), sub: msg });
  };

  const canvasStream = rc.captureStream(exportFps);
  let recordStream = canvasStream;
  let recAudioCleanup = null;

  if (_audioBlob && S.audioEnabled) {
    report(0, 'Preparando áudio...');
    const actx = new AudioContext();
    await actx.resume();
    const dest = actx.createMediaStreamDestination();
    const exportAudio = new Audio();
    exportAudio.src = URL.createObjectURL(_audioBlob);
    exportAudio.loop = true;
    await new Promise((resolve, reject) => {
      exportAudio.addEventListener('canplaythrough', resolve, { once: true });
      exportAudio.addEventListener('error', () => reject(new Error('Falha ao carregar áudio')), { once: true });
    });
    const srcNode = actx.createMediaElementSource(exportAudio);
    const gain = actx.createGain();
    gain.gain.value = S.audioVolume;
    srcNode.connect(gain);
    gain.connect(dest);
    await exportAudio.play();
    recordStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);
    recAudioCleanup = () => {
      exportAudio.pause();
      URL.revokeObjectURL(exportAudio.src);
      actx.close();
    };
  }

  report(0, `Renderizando ${RW}×${RH} · ${Math.round(videoBps / 1_000_000)} Mbps · ${ext.toUpperCase()}...`);

  const recOpts = {
    videoBitsPerSecond: videoBps,
    audioBitsPerSecond: audioBps,
  };
  if (mime) recOpts.mimeType = mime;

  const rec    = new MediaRecorder(recordStream, recOpts);
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const videoDuration = S.videoEl?.duration;
  const total = S.mode === 'images'
    ? S.duration * 1000
    : (videoDuration && isFinite(videoDuration) && videoDuration > 0)
      ? videoDuration * 1000
      : 10000;

  let recRunning  = true;
  const slideMs = S.speed * 1000;
  const totalMs = S.mode === 'images' ? S.duration * 1000 : total;

  rec.start(250);

  if (S.mode === 'images' && globalThis.VVExport?.renderSlideshowFrameAccurateLoop) {
    await VVExport.renderSlideshowFrameAccurateLoop({
      totalMs,
      getFadeAt: elapsed => getSlideFadeState(elapsed, S.imgs.length, slideMs),
      rctx, RW, RH,
      renderFrame,
      report: (pct, msg) => report(Math.min(100, pct), msg),
      shouldStop: () => !recRunning,
    });
  } else if (S.mode === 'images') {
    throw new Error('Módulo js/export-video.js desatualizado. Recarregue a página (Ctrl+Shift+R).');
  } else if (S.mode === 'video' && S.videoEl && globalThis.VVExport) {
    await VVExport.renderFrameAccurateLoop({
      video: S.videoEl,
      rctx, RW, RH,
      totalMs: total,
      renderFrame,
      report: (pct, msg) => report(Math.min(100, pct), msg),
      shouldStop: () => !recRunning,
    });
  } else if (S.mode === 'video' && S.videoEl) {
    throw new Error('Módulo js/export-video.js não carregou. Recarregue a página (Ctrl+Shift+R).');
  }

  recRunning = false;
  rec.stop();
  recordStream.getTracks().forEach(t => t.stop());
  if (recAudioCleanup) recAudioCleanup();
  await new Promise(r => { rec.addEventListener('stop', r, { once: true }); });

  report(100, 'Finalizando arquivo...');
  await new Promise(r => setTimeout(r, 300));

  const blob = new Blob(chunks, { type: mime || 'video/webm' });
  return { blob, ext, mime, rw: RW, rh: RH };
}

function beginExportUI() {
  const ov = document.getElementById('rec-ov');
  const bar = document.getElementById('rec-fill');
  ov.classList.add('on');
  bar.style.width = '0%';

  if (TBOX.editing || TBOX2.editing || TBOX3.editing) exitAnyEditMode();
  hideAllTextBoxes();
  if (_audioEl) _audioEl.pause();

  return {
    wasPlaying: S.playing,
    wasIdx: S.idx,
    wasPrevIdx: S.prevIdx,
    wasFade: S.fadeProgress,
    wasElapsed: S.elapsed,
    wasPlayMs: S.playMs,
    wasVideoTime: S.mode === 'video' && S.videoEl ? S.videoEl.currentTime : 0,
  };
}

function endExportUI(saved) {
  S.recording = false;
  document.getElementById('rec-ov').classList.remove('on');
  S.playing  = saved.wasPlaying;
  S.idx      = saved.wasIdx;
  S.prevIdx  = saved.wasPrevIdx;
  S.fadeProgress = saved.wasFade;
  S.elapsed  = saved.wasElapsed;
  S.playMs   = saved.wasPlayMs ?? 0;
  syncSlideshowFromPlayMs();
  if (S.mode === 'video' && S.videoEl) {
    if (saved.wasVideoTime != null && isFinite(saved.wasVideoTime)) {
      S.videoEl.currentTime = saved.wasVideoTime;
    }
    if (saved.wasPlaying) S.videoEl.play().catch(() => {});
    else S.videoEl.pause();
  }
  syncAudioPlayback();
  updateTimelineActive();
  updateImagesTimelineProgress();
  showVisibleTextBoxes();
  updateDownloadBtn();
}

async function startDownload() {
  const btn = document.getElementById('dl-btn');
  const sub = document.getElementById('rec-sub');
  btn.disabled = true;
  S.recording = true;
  const saved = beginExportUI();

  try {
    const { blob, ext } = await exportVideoBlob(({ pct, sub: msg }) => {
      document.getElementById('rec-fill').style.width = pct + '%';
      if (msg) sub.textContent = msg;
    });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `VersoVivo_${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  } catch (err) {
    console.error(err);
    alert('Erro ao gerar vídeo:\n' + err.message);
  } finally {
    endExportUI(saved);
    btn.disabled = false;
  }
}

async function shareVideo() {
  if (typeof navigator.share !== 'function') {
    alert('Compartilhamento não disponível neste navegador.');
    return;
  }

  const btn = document.getElementById('share-btn');
  const sub = document.getElementById('rec-sub');
  btn.disabled = true;
  document.getElementById('dl-btn').disabled = true;
  S.recording = true;
  const saved = beginExportUI();

  try {
    const { blob, ext } = await exportVideoBlob(({ pct, sub: msg }) => {
      document.getElementById('rec-fill').style.width = pct + '%';
      if (msg) sub.textContent = msg;
    });
    const name = `VersoVivo_${new Date().toISOString().slice(0, 10)}.${ext}`;
    const file = new File([blob], name, { type: blob.type });
    const shareData = { files: [file], title: 'VersoVivo', text: 'Poesia em movimento' };
    if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
      throw new Error('Seu dispositivo não suporta compartilhar arquivos de vídeo.');
    }
    await navigator.share(shareData);
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      alert('Erro ao compartilhar:\n' + (err.message || err));
    }
  } finally {
    endExportUI(saved);
  }
}

if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=11').then((reg) => {
      reg.update();
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(err => {
      console.warn('Service worker não registrado:', err);
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}

// ════════════════════════════════════
//  TUTORIAL GUIADO
// ════════════════════════════════════
let _tutActive = false;
let _tutStep = 0;
let _tutResizeBound = false;

const TUTORIAL_DEMO_IMAGES = [
  'assets/tutorial/demo-1.jpg',
  'assets/tutorial/demo-2.jpg',
  'assets/tutorial/demo-3.jpg',
];

let _tutDemoLoaded = false;

/** Carrega imagens de exemplo locais para o tutorial (offline-safe). */
async function loadTutorialDemoAssets() {
  if (_tutDemoLoaded && S.imgs.length >= 3) return true;
  try {
    const blobs = await Promise.all(
      TUTORIAL_DEMO_IMAGES.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        return res.blob();
      })
    );
    _imageBlobs = blobs;
    await loadImagesFromBlobs(blobs);
    if (!S.text.trim()) {
      S.text = 'O vento leva versos\nque o coração escreve\nem silêncio.';
      TBOX.show = true;
    }
    if (!S.text2.trim()) {
      S.text2 = 'VersoVivo';
      TBOX2.show = true;
    }
    if (!S.text3.trim()) {
      S.text3 = '@seu_perfil';
      TBOX3.show = true;
    }
    applyLayoutTemplate('titulo-verso');
    syncTextBox();
    syncTextStyleTargetUI();
    syncLegibilityUI();
    _tutDemoLoaded = true;
    markDirty();
    return true;
  } catch (e) {
    console.warn('[VersoVivo tutorial] assets demo indisponíveis:', e);
    return false;
  }
}

const TUTORIAL_STEPS = [
  {
    screen: 'home',
    target: null,
    title: 'Bem-vindo ao VersoVivo',
    text: 'Este tour passa por todas as funções do editor — da tela inicial ao export final. Pule a qualquer momento com «Pular tutorial» ou tecla Esc.',
  },
  {
    screen: 'home',
    target: '#home-settings',
    title: '1 · Configurações',
    text: 'O botão ⚙ abre preferências globais. É o lugar certo para definir qualidade de imagens e vídeos antes de começar.',
  },
  {
    screen: 'home',
    target: '[data-tut="enhance-imagens"]',
    prepare: () => openSettings(),
    title: '2 · Melhorar imagens (padrão ligado)',
    text: 'Marcado por padrão: upscale local + nitidez quando a foto é menor que a resolução de export Full HD — sem site externo.',
  },
  {
    screen: 'home',
    target: '[data-tut="enhance-videos"]',
    prepare: () => openSettings(),
    title: '3 · Melhorar vídeos (padrão ligado)',
    text: 'Também ligado por padrão: aplica nitidez adaptativa em clipes com resolução abaixo do export. Ideal para vídeos de celular em 720p.',
  },
  {
    screen: 'home',
    target: '.new-proj',
    prepare: () => closeSettings(),
    title: '4 · Novo projeto',
    text: '«Novo Projeto +» abre o editor vazio. Se já existir rascunho salvo, o app pergunta antes de apagar.',
  },
  {
    screen: 'home',
    target: '#resume-proj',
    skipIf: () => !document.getElementById('resume-proj').classList.contains('on'),
    title: '5 · Continuar rascunho',
    text: '«Continuar projeto» restaura fotos, textos, layout e música do último save automático (IndexedDB + backup local).',
  },
  {
    screen: 'editor',
    target: '[data-tut="dica-canvas"]',
    skipIf: () => S.mode !== 'none' || S.imgs.length > 0,
    title: '5 · Canvas vazio',
    text: 'Sem mídia, esta dica lembra de importar imagens ou vídeo. Ela some assim que você adiciona conteúdo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="preview"]',
    prepare: () => loadTutorialDemoAssets(),
    title: '6 · Prévia ao vivo',
    text: 'Carregamos 3 imagens de exemplo de assets/tutorial/ para você ver o slideshow. A prévia é WYSIWYG — igual ao vídeo exportado.',
  },
  {
    screen: 'editor',
    target: '[data-tut="contador-imagens"]',
    skipIf: () => S.mode !== 'images' || !S.imgs.length,
    title: '7 · Contador de fotos',
    text: 'No topo, o contador mostra quantas imagens compõem o slideshow — útil em projetos longos.',
  },
  {
    screen: 'editor',
    target: '[data-tut="imagens"]',
    title: '8 · Importar fotos',
    text: '«Imagens» abre o seletor do sistema. Escolha uma ou várias fotos JPG/PNG/WebP. Elas substituem o vídeo se houver um carregado.',
  },
  {
    screen: 'editor',
    target: '[data-tut="video"]',
    title: '9 · Importar vídeo',
    text: '«Vídeo» usa um clipe como fundo em loop. O poema fica por cima. Trocar para fotos apaga o vídeo (e vice-versa).',
  },
  {
    screen: 'editor',
    target: '[data-tut="timeline"]',
    card: 'bottom',
    title: '10 · Linha do tempo (fotos)',
    text: 'Miniaturas mostram a ordem do slideshow. Arraste para reordenar; solte entre clips para inserir.',
  },
  {
    screen: 'editor',
    target: '[data-tut="adicionar-imagens"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'images',
    title: '11 · Adicionar mais fotos',
    text: 'O botão «+» abre o seletor de arquivos e acrescenta novas imagens ao final da sequência (sem apagar as existentes).',
  },
  {
    screen: 'editor',
    target: '[data-tut="apagar-imagens"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'images',
    title: '12 · Apagar todas as fotos',
    text: '«Apagar» remove todas as imagens da timeline de uma vez. O app pede confirmação antes de executar.',
  },
  {
    screen: 'editor',
    target: '[data-tut="timeline-video"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'video',
    title: '13 · Linha do tempo (vídeo)',
    text: 'Com vídeo importado, a timeline NLE mostra o clipe, régua de tempo e playhead — espelho da duração do arquivo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="apagar-video"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'video',
    title: '14 · Apagar vídeo',
    text: 'Remove o clipe importado e volta ao canvas vazio. Confirme apenas se quiser descartar o vídeo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="duracao"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'images',
    title: '15 · Duração total',
    text: 'Define quantos segundos dura o vídeo exportado (5–120 s). A barra de progresso embaixo segue essa duração.',
  },
  {
    screen: 'editor',
    target: '[data-tut="velocidade-img"]',
    card: 'bottom',
    skipIf: () => S.mode !== 'images',
    title: '16 · Tempo por imagem',
    text: 'Quanto tempo cada foto fica na tela antes do crossfade. Valores menores = slideshow mais rápido.',
  },
  {
    screen: 'editor',
    target: '#tl-img-progress',
    card: 'bottom',
    skipIf: () => S.mode !== 'images' || !S.imgs.length,
    title: '17 · Navegar no tempo',
    text: 'Arraste a barra de progresso para ir a qualquer ponto do vídeo. Útil para conferir um verso numa foto específica.',
  },
  {
    screen: 'editor',
    target: '[data-tut="play"]',
    title: '18 · Play / Pausa',
    text: 'Assista ao slideshow antes de exportar. Pausar congela a prévia; retomar continua de onde parou.',
  },
  {
    screen: 'editor',
    target: '[data-tut="editar-caixa"]',
    prepare: () => { createOrEditTextBox(); },
    title: '19 · Editar no canvas',
    text: 'Toque na caixa branca sobre a imagem para digitar. Arraste para mover; use as alças nos cantos e bordas para redimensionar.',
  },
  {
    screen: 'editor',
    target: '[data-tut="proporcao"]',
    prepare: () => openPanel('ar'),
    title: '20 · Proporção do vídeo',
    text: 'Escolha 9:16 (Reels/Shorts), 1:1 (feed quadrado) ou 16:9 (YouTube). O canvas redimensiona na hora.',
  },
  {
    screen: 'editor',
    target: '#ar',
    title: '21 · Formatos disponíveis',
    text: 'Cada botão muda a resolução de export em Full HD: 1080×1920, 1080×1080 ou 1920×1080. Feche o painel tocando fora ou no ✕.',
  },
  {
    screen: 'editor',
    target: '[data-tut="layout"]',
    prepare: () => { closePanels(); openPanel('tp'); },
    title: '22 · Modelos de layout',
    text: 'Templates posicionam verso, título e assinatura de uma vez — haiku, citação lateral, título+verso, etc.',
  },
  {
    screen: 'editor',
    target: '#tp',
    title: '23 · Aplicar template',
    text: 'Toque num modelo para aplicar fonte, cor, posição e legibilidade sugeridas. Você pode ajustar tudo depois.',
  },
  {
    screen: 'editor',
    target: '[data-tut="texto"]',
    prepare: () => closePanels(),
    title: '24 · Menu Texto',
    text: '«Texto» expande a barra com Verso, Título, Assinatura e estilos. Toque numa caixa no canvas para editar.',
  },
  {
    screen: 'editor',
    target: '[data-tut="menu-texto"]',
    prepare: () => { document.getElementById('sub-tb')?.classList.add('on'); document.getElementById('text-tb')?.classList.add('on'); },
    title: '25 · Barra de texto expandida',
    text: 'A faixa à direita de «Texto» concentra Verso, Título, Assinatura, fontes, tamanho, formato, alinhamento, cor e legibilidade.',
  },
  {
    screen: 'editor',
    target: '[data-tut="verso"]',
    title: '26 · Caixa Verso',
    text: 'Poema principal. Clique na caixa branca sobre a imagem ou use este botão para criar/editar. Enter quebra linha.',
  },
  {
    screen: 'editor',
    target: '[data-tut="titulo"]',
    title: '27 · Caixa Título',
    text: 'Nome do poema, autor ou epígrafe. Estilo independente do verso (fonte, cor, alinhamento).',
  },
  {
    screen: 'editor',
    target: '[data-tut="assinatura"]',
    title: '28 · Caixa Assinatura (@)',
    text: 'Seu @ do Instagram ou handle. Por padrão fica discreta no rodapé — ideal para crédito do autor.',
  },
  {
    screen: 'editor',
    target: '[data-tut="fontes"]',
    prepare: () => openPanel('fp'),
    title: '29 · Fontes',
    text: 'Mais de 40 fontes Google — serifadas para poesia clássica, script para assinaturas manuscritas. Aplica na caixa selecionada.',
  },
  {
    screen: 'editor',
    target: '[data-tut="pesquisa-fonte"]',
    title: '30 · Pesquisar fonte',
    text: 'Digite parte do nome para filtrar a lista — útil quando há muitas opções no grid.',
  },
  {
    screen: 'editor',
    target: '[data-tut="grade-fontes"]',
    title: '31 · Grade de fontes',
    text: 'Toque numa amostra para aplicar à caixa ativa (Verso, Título ou Assinatura). O indicador no topo do painel mostra qual caixa está selecionada.',
  },
  {
    screen: 'editor',
    target: '[data-tut="tamanho"]',
    prepare: () => openPanel('ts'),
    title: '32 · Tamanho da fonte',
    text: 'Abre o painel de tamanho. Modo Automático encolhe o texto para caber na caixa; Manual libera controle fino.',
  },
  {
    screen: 'editor',
    target: '[data-tut="tamanho-detalhes"]',
    title: '33 · Auto vs Manual + slider',
    text: '«Automático» ajusta ao redimensionar a caixa. «Manual» habilita o slider e os botões A− / A+ para pixels exatos.',
  },
  {
    screen: 'editor',
    target: '[data-tut="formato"]',
    prepare: () => openPanel('fmt'),
    title: '34 · Formatação',
    text: 'Negrito, itálico, sublinhado e tachado — por caixa de texto. O preview e o export usam o mesmo estilo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="formato-detalhes"]',
    title: '35 · Estilos individuais',
    text: 'Cada botão alterna um estilo: N (negrito), I (itálico), S (sublinhado), T (tachado). Combine à vontade.',
  },
  {
    screen: 'editor',
    target: '[data-tut="alinhamento"]',
    prepare: () => closePanels(),
    title: '36 · Alinhamento',
    text: 'Alterna esquerda, centro e direita dentro da caixa selecionada. O ícone muda a cada toque.',
  },
  {
    screen: 'editor',
    target: '[data-tut="cores"]',
    prepare: () => openPanel('cp'),
    title: '37 · Cor do texto',
    text: 'Paleta rápida + seletor personalizado. Escolha contraste com o fundo — combine com «Legibilidade» se precisar.',
  },
  {
    screen: 'editor',
    target: '[data-tut="paleta-cores"]',
    title: '38 · Paleta rápida',
    text: 'Toque numa cor predefinida para aplicar instantaneamente à caixa ativa.',
  },
  {
    screen: 'editor',
    target: '[data-tut="cor-personalizada"]',
    title: '39 · Cor personalizada',
    text: 'Use o seletor nativo do sistema para qualquer tom — ideal para combinar com a identidade visual do seu perfil.',
  },
  {
    screen: 'editor',
    target: '[data-tut="legibilidade"]',
    prepare: () => openPanel('lp'),
    title: '40 · Legibilidade',
    text: 'Sombra, contorno e fundo semitransparente ajudam a ler sobre fotos claras ou escuras.',
  },
  {
    screen: 'editor',
    target: '[data-tut="leg-presets"]',
    title: '41 · Presets de legibilidade',
    text: '«Foto clara», «Foto escura» ou «Limpar» aplicam combinações sugeridas de sombra, contorno e fundo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="leg-sombra"]',
    title: '42 · Sombra no texto',
    text: 'Ativa sombra suave atrás das letras — melhora leitura sobre fundos claros ou com textura.',
  },
  {
    screen: 'editor',
    target: '[data-tut="leg-contorno"]',
    title: '43 · Contorno no texto',
    text: 'Desenha borda ao redor dos glifos — excelente sobre fotos muito claras ou com alto contraste.',
  },
  {
    screen: 'editor',
    target: '[data-tut="leg-fundo"]',
    title: '44 · Fundo da caixa',
    text: 'Slider de 0–80% adiciona retângulo semitransparente atrás do texto, como uma placa escura.',
  },
  {
    screen: 'editor',
    target: '[data-tut="musica"]',
    prepare: () => openPanel('ap'),
    title: '45 · Música de fundo',
    text: 'Opcional. Escolha um áudio do aparelho; ajuste volume e ative/desative. Entra mixada no vídeo exportado.',
  },
  {
    screen: 'editor',
    target: '[data-tut="musica-arquivo"]',
    title: '46 · Escolher / remover áudio',
    text: '«Escolher arquivo» importa MP3/WAV etc.; «Remover» limpa a trilha. O nome do arquivo aparece abaixo.',
  },
  {
    screen: 'editor',
    target: '[data-tut="musica-volume"]',
    title: '47 · Volume da música',
    text: 'Controla o mix no export (0–100%). A trilha repete em loop se for mais curta que o slideshow.',
  },
  {
    screen: 'editor',
    target: '[data-tut="salvar"]',
    prepare: () => closePanels(),
    title: '48 · Salvamento automático',
    text: '«Salvo» / «Salvando…» indica persistência. Projetos vão ao IndexedDB primeiro; localStorage é backup leve de metadados.',
  },
  {
    screen: 'editor',
    target: '[data-tut="baixar"]',
    title: '49 · Baixar vídeo',
    text: 'Gera MP4 (ou WebM se o navegador não suportar H.264). Export em Full HD @ 30 fps com bitrate adaptativo. Com «Melhorar qualidade» ligado, fotos e vídeos baixos são otimizados.',
  },
  {
    screen: 'editor',
    target: '[data-tut="compartilhar"]',
    skipIf: () => document.getElementById('share-btn').classList.contains('hidden'),
    title: '50 · Compartilhar',
    text: 'Em mobile/browsers compatíveis, envia direto para WhatsApp, Instagram etc. via Web Share API — sem salvar na galeria antes.',
  },
  {
    screen: 'editor',
    target: '[data-tut="inicio"]',
    title: '51 · Voltar ao início',
    text: '«← Início» salva o rascunho e volta à home. Se houver conteúdo, o app confirma antes de sair.',
  },
  {
    screen: 'home',
    target: '#home-settings',
    title: '52 · Configurações e tutorial',
    text: 'Pronto! Use ⚙ para qualidade de mídia e «?» para rever este guia. Substitua assets/tutorial/demo-*.jpg pelos seus arquivos para um demo personalizado.',
  },
];

function tutorialVisibleCount() {
  return TUTORIAL_STEPS.filter(s => !s.skipIf || !s.skipIf()).length;
}

function tutorialStepIndex(stepIdx) {
  let n = 0;
  for (let i = 0; i <= stepIdx; i++) {
    if (TUTORIAL_STEPS[i].skipIf && TUTORIAL_STEPS[i].skipIf()) continue;
    n++;
  }
  return n;
}

function findTutorialStep(delta) {
  let i = _tutStep + delta;
  while (i >= 0 && i < TUTORIAL_STEPS.length) {
    const step = TUTORIAL_STEPS[i];
    if (!step.skipIf || !step.skipIf()) return i;
    i += delta;
  }
  return delta > 0 ? TUTORIAL_STEPS.length : -1;
}

function openEditorForTutorial() {
  if (document.getElementById('editor').classList.contains('on')) return;
  document.getElementById('home').classList.remove('on');
  document.getElementById('editor').classList.add('on');
  _editorOpen = true;
  resizeCanvas();
  initTextBoxEvents();
  if (_rafId !== null) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(tick);
  syncLegibilityUI();
  syncAudioUI();
  syncTextStyleTargetUI();
  buildTemplatePanel();
  updateDownloadBtn();
  rebuildTimeline();
}

function showHomeForTutorial() {
  if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null; }
  closePanels();
  closeSettings();
  if (typeof exitAnyEditMode === 'function' && (TBOX.editing || TBOX2.editing || TBOX3.editing)) exitAnyEditMode();
  document.getElementById('sub-tb')?.classList.remove('on');
  document.getElementById('text-tb')?.classList.remove('on');
  _editorOpen = false;
  document.getElementById('editor').classList.remove('on');
  document.getElementById('home').classList.add('on');
  refreshHomeResume();
}

function resolveTutorialTarget(step) {
  if (!step.target) return null;
  const el = document.querySelector(step.target);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  return el;
}

function positionTutorialUi(step, targetEl) {
  const spot = document.getElementById('tut-spot');
  const dim = document.getElementById('tut-dim');
  const card = document.getElementById('tut-card');
  if (!spot || !dim || !card) return;

  if (targetEl) {
    dim.classList.remove('on');
    spot.classList.add('on');
    const pad = 10;
    const r = targetEl.getBoundingClientRect();
    spot.style.top = (r.top - pad) + 'px';
    spot.style.left = (r.left - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';
  } else {
    spot.classList.remove('on');
    dim.classList.add('on');
  }

  requestAnimationFrame(() => {
    const pad = 16;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;

    if (step.card === 'bottom' || !targetEl) {
      card.style.top = Math.max(pad, window.innerHeight - ch - pad - (step.card === 'bottom' ? 8 : 0)) + 'px';
      card.style.left = Math.max(pad, (window.innerWidth - cw) / 2) + 'px';
      return;
    }

    const r = targetEl.getBoundingClientRect();
    let top = r.bottom + pad;
    let left = r.left + r.width / 2 - cw / 2;

    if (top + ch > window.innerHeight - pad) top = r.top - ch - pad;
    if (top < pad) top = pad;
    left = Math.max(pad, Math.min(left, window.innerWidth - cw - pad));

    card.style.top = top + 'px';
    card.style.left = left + 'px';
  });
}

async function renderTutorialStep() {
  const step = TUTORIAL_STEPS[_tutStep];
  if (!step) return;

  closePanels();
  closeSettings();
  if (step.screen === 'home') showHomeForTutorial();
  else openEditorForTutorial();

  if (step.prepare) await step.prepare();

  document.getElementById('tut-title').textContent = step.title;
  document.getElementById('tut-text').textContent = step.text;
  document.getElementById('tut-progress').textContent =
    `Passo ${tutorialStepIndex(_tutStep)} de ${tutorialVisibleCount()}`;

  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.disabled = findTutorialStep(-1) < 0;
  if (nextBtn) {
    const isLast = findTutorialStep(1) >= TUTORIAL_STEPS.length;
    nextBtn.textContent = isLast ? 'Concluir ✓' : 'Próximo →';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetEl = resolveTutorialTarget(step);
      positionTutorialUi(step, targetEl);
    });
  });
}

function bindTutorialResize() {
  if (_tutResizeBound) return;
  _tutResizeBound = true;
  window.addEventListener('resize', () => {
    if (!_tutActive) return;
    renderTutorialStep();
  });
}

function startTutorial() {
  _tutActive = true;
  _tutStep = 0;
  while (_tutStep < TUTORIAL_STEPS.length && TUTORIAL_STEPS[_tutStep].skipIf?.()) _tutStep++;

  const tut = document.getElementById('tutorial');
  tut.classList.remove('hidden');
  tut.classList.add('on');
  tut.setAttribute('aria-hidden', 'false');
  bindTutorialResize();
  renderTutorialStep().catch(console.error);
}

function endTutorial() {
  _tutActive = false;
  const tut = document.getElementById('tutorial');
  tut.classList.add('hidden');
  tut.classList.remove('on');
  tut.setAttribute('aria-hidden', 'true');
  document.getElementById('tut-spot')?.classList.remove('on');
  document.getElementById('tut-dim')?.classList.remove('on');
}

function skipTutorial() {
  endTutorial();
}

function tutorialNext() {
  const next = findTutorialStep(1);
  if (next >= TUTORIAL_STEPS.length) {
    endTutorial();
    return;
  }
  _tutStep = next;
  renderTutorialStep().catch(console.error);
}

function tutorialPrev() {
  const prev = findTutorialStep(-1);
  if (prev < 0) return;
  _tutStep = prev;
  renderTutorialStep().catch(console.error);
}

document.addEventListener('keydown', e => {
  if (!_tutActive) return;
  if (e.key === 'Escape') { skipTutorial(); return; }
  if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); tutorialNext(); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); tutorialPrev(); }
});

loadAppSettings();

