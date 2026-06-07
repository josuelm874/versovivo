# VersoVivo

> Editor visual para criação de vídeos poéticos — combine imagens com poemas e exporte como vídeo animado.

---

## Índice

1. [O que é este sistema](#1-o-que-é-este-sistema)
2. [Como acessar e usar](#2-como-acessar-e-usar)
3. [Estrutura de arquivos](#3-estrutura-de-arquivos)
4. [Arquitetura e funcionamento](#4-arquitetura-e-funcionamento)
5. [Funcionalidades detalhadas](#5-funcionalidades-detalhadas)
6. [Persistência de projetos](#6-persistência-de-projetos)
7. [Tecnologias utilizadas](#7-tecnologias-utilizadas)
8. [Guia educativo — entenda cada parte](#8-guia-educativo--entenda-cada-parte)
9. [Como dar continuidade ao projeto](#9-como-dar-continuidade-ao-projeto)

---

## 1. O que é este sistema

O **VersoVivo** é um editor visual de vídeos poéticos que roda diretamente no navegador. O usuário carrega imagens (ou um vídeo de fundo), escreve ou cola um poema, ajusta tipografia e legibilidade, e exporta um vídeo com transições suaves em **9:16**, **1:1** ou **16:9**.

**Em linguagem simples:** você escolhe suas fotos, digita seu poema, ajusta como o texto aparece sobre as imagens, e baixa ou compartilha um vídeo pronto para Reels, Shorts, feed ou YouTube.

### O que ele faz

- Importar múltiplas imagens **ou** um vídeo de fundo
- Slideshow com **fade crossfade** entre imagens + Ken Burns suave
- **Três caixas de texto:** verso, título e assinatura (@)
- Ajustar fonte, tamanho (auto-fit), alinhamento, cor e formatação por caixa
- **Legibilidade:** sombra, contorno e fundo semitransparente
- Duração total do vídeo (5–120 s) + tempo por imagem na timeline
- **Proporção do vídeo:** 9:16 (720×1280), 1:1 (1080×1080), 16:9 (1280×720)
- Exportar vídeo (MP4 preferencial, WebM fallback) @ 30 fps, ~12 Mbps
- **Compartilhar** via Web Share API (mobile / browsers compatíveis)
- **Salvar e continuar** projeto automaticamente (IndexedDB + localStorage)
- **Tutorial guiado** (15+ passos) na home
- **Boot skippable** + **PWA offline** (manifest + service worker v6)

### Estado atual (jun/2026)

| Fase | Entregas |
|------|----------|
| **1** | Legibilidade, crossfade, persistência, navegação |
| **2** | Templates, timeline, música no export |
| **3** | Boot skippable, PWA, proporções, título+verso, Web Share |
| **3.1** | Assinatura (@), barra de progresso, save atômico, WYSIWYG export |
| **3.2** | Export vídeo frame-accurate, SW v7, ícones PNG, smoke tests, módulo export |
| **3.3** | JS extraído para `js/versovivo.js`, SW v8, Playwright E2E |

---

## 2. Como acessar e usar

```bash
# Recomendado — PWA, Share e service worker
npx serve .
# Acesse: http://localhost:3000

# Testes
npm test              # smoke estático (js/versovivo.js)
npm run test:e2e      # Playwright (home + editor)
```

> O **service worker** só registra em contexto seguro (HTTPS ou `localhost`).

### Fluxo de uso

```
1. Boot → animação "VersoVivo" (ou "Pular intro →")
2. Home → "Continuar projeto" ou "Novo Projeto +"
3. Editor → imagens ou vídeo + verso / título / assinatura
4. Ajuste → proporção, layout, timeline, fontes, legibilidade, música
5. Exportar → "Baixar Vídeo" ou "↗ Compartilhar"
6. Início → "← Início" (aguarda save antes de sair)
```

---

## 3. Estrutura de arquivos

```
versovivo/
├── index.html              # HTML + CSS (~2.150 linhas)
├── js/
│   ├── versovivo.js        # App principal (~3.750 linhas)
│   └── export-video.js     # Export frame-accurate — VVExport
├── e2e/                    # Playwright: home.spec.js, editor.spec.js
├── tests/smoke.mjs         # Testes estáticos: npm test
├── scripts/
│   ├── extract-main.mjs    # Extrai JS inline → versovivo.js
│   └── generate-icons.mjs  # Gera PNG: npm run icons
├── playwright.config.js
├── package.json            # test, test:e2e, icons, extract
├── manifest.webmanifest    # Metadados PWA + ícones PNG
├── sw.js                   # Service worker — cache offline v8
├── icons/icon.svg          # Ícone do app
└── PROJETO.md              # Este arquivo
```

---

## 4. Arquitetura e funcionamento

### Camadas do editor

```
┌─────────────────────────────────────┐
│  <canvas id="cv">                   │  ← Mídia + texto (export WYSIWYG)
│  <div id="cv-overlay">              │  ← Caixas interativas
│    <div id="text-box">              │  ← Verso (main)
│    <div id="text-box-2">            │  ← Título (title)
│    <div id="text-box-3">            │  ← Assinatura @ (signature)
└─────────────────────────────────────┘
```

### Caixas de texto (`BOX_DEFS`)

| Chave | Estado | Conteúdo típico |
|-------|--------|-----------------|
| `main` | `TBOX` / `S.text` | Poema |
| `title` | `TBOX2` / `S.text2` | Título ou autor |
| `signature` | `TBOX3` / `S.text3` | @sua_conta |

Posição em **frações** (0–1) — preview e export usam a mesma matemática.

### Loops de renderização

- **`tick()`** — preview contínuo; slideshow usa `getPlaybackFadeState` (inclui fade no fim do loop)
- **`recLoop()`** — export; usa o mesmo `getPlaybackFadeState` para WYSIWYG
- **`drawAllTextLayers()`** — título → verso → assinatura

---

## 5. Funcionalidades detalhadas

### Toolbar — sub-menu Texto

| Botão | Ação |
|-------|------|
| Verso | Caixa principal do poema |
| Título | Segunda caixa (dourada) |
| **Assinatura** | Terceira caixa (@, rosa) |
| Fontes / Tamanho / Formato / Alinhamento / Cor | Aplicam à caixa selecionada (`_textStyleTarget`) |

Clicar ou arrastar uma caixa **seleciona** qual caixa recebe os estilos.

### Timeline — modo imagens

- Miniaturas reordenáveis (drag)
- **Barra de progresso** scrubável (navega nos segundos do vídeo)
- Sliders: duração total + tempo por imagem

### Timeline — modo vídeo (NLE)

- Ruler, playhead, faixas de texto e áudio

### Exportação

- `ensureExportFontsLoaded()` antes de gravar — fontes corretas no arquivo
- Slideshow: duração = `S.duration`; fade de loop idêntico ao preview (`getPlaybackFadeState`)
- **Vídeo:** `js/export-video.js` — seek frame-a-frame @ 30 fps (WYSIWYG sem drift de playback)
- Áudio mixado via `AudioContext` quando habilitado

### Testes e build

```bash
npm test          # smoke tests estáticos (14 checks)
npm run icons     # regenera icon-192.png e icon-512.png do SVG
```

---

## 6. Persistência de projetos

| Camada | Armazena |
|--------|----------|
| **IndexedDB** (primeiro) | Blobs: imagens, vídeo, áudio |
| **localStorage** (depois) | Metadados: textos, estilos, `tbox`×3, layout, aspecto |

Ordem **IDB → localStorage** evita rascunho órfão se o save de blobs falhar.

- Autosave debounced (~700 ms)
- `goHome()` **await saveProject()** + indicador "Salvando…"
- Erro de save: flash vermelho "Erro ao salvar"

---

## 7. Tecnologias utilizadas

HTML5 Canvas, CSS3, JavaScript vanilla, Google Fonts, File API, MediaRecorder, Web Audio, Web Share API, Service Worker v6, IndexedDB + localStorage.

---

## 8. Guia educativo

### Por que frações no `TBOX`?

50% da largura no preview = 50% no export 720×1280 ou 1080×1080. Coordenadas relativas = WYSIWYG.

### `BOX_DEFS` como strategy pattern

Uma definição por caixa; funções genéricas (`syncTextBoxFor`, `enterEditMode`, `drawAllTextLayers`) iteram sobre elas. Adicionar caixa = registrar objeto + HTML.

### Save atômico (client-side)

Sem servidor, "atomicidade" = **não anunciar sucesso antes dos blobs estarem seguros**. Gravar IndexedDB primeiro; só então atualizar o ponteiro leve no localStorage.

---

## 9. Referência rápida no código

| Recurso | Buscar em `index.html` |
|---------|------------------------|
| Três caixas | `BOX_DEFS`, `TBOX3`, `createOrEditSignatureBox` |
| Save seguro | `saveProject()`, `showSaveHint()` |
| Fontes no export | `ensureExportFontsLoaded()` |
| Progresso imagens | `updateImagesTimelineProgress()`, `#tl-img-progress` |
| Fade loop unificado | `getPlaybackFadeState()` (preview + export) |
| Templates | `applyLayoutTemplate()` — reseta TBOX2/TBOX3 |
| Export vídeo frame-accurate | `js/export-video.js`, `VVExport.renderFrameAccurateLoop` |
| Smoke tests | `tests/smoke.mjs`, `npm test` |
| PWA | `sw.js` v7 (sem reload forçado no activate) |

---

*Documento atualizado em junho de 2026 — VersoVivo 3.2*
