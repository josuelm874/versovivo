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
- Slideshow com **fade crossfade** entre imagens (600 ms)
- Escrever poema em caixa arrastável/redimensionável sobre o canvas
- **Segunda caixa de texto** para título ou autor (template Título + Verso)
- Ajustar fonte, tamanho (auto-fit), alinhamento, cor e formatação
- **Legibilidade:** sombra, contorno e fundo semitransparente na caixa
- Controlar velocidade do slideshow (0,1s – 10s por imagem)
- **Proporção do vídeo:** 9:16 (720×1280), 1:1 (1080×1080), 16:9 (1280×720)
- Exportar vídeo (MP4 preferencial, WebM fallback) @ 30 fps, ~12 Mbps
- **Compartilhar** via Web Share API (mobile / browsers compatíveis)
- **Salvar e continuar** projeto automaticamente (localStorage + IndexedDB)
- Voltar ao início com confirmação
- **Templates de layout** (6 presets poéticos)
- **Timeline** de slides: miniaturas, clique, reordenar e remover
- **Música de fundo** no preview e no vídeo exportado
- **Boot skippable** + **PWA offline** (manifest + service worker)

### Estado atual (Fase 3 — jun/2026)

**Projeto completo** conforme planejamento original (Fases 1–3).

| Fase | Entregas |
|------|----------|
| **1** | Legibilidade, crossfade, persistência, navegação |
| **2** | Templates, timeline, música no export |
| **3** | Boot skippable, PWA, proporções, título+verso, Web Share |

---

## 2. Como acessar e usar

Não precisa de instalação. Abra diretamente no navegador:

```bash
# Opção 1: Abrir diretamente
# Duplo clique em index.html

# Opção 2: Via servidor local (recomendado — necessário para PWA e Share)
npx serve .
# Acesse: http://localhost:3000
```

> O **service worker** só registra em contexto seguro (HTTPS ou `localhost`).

### Fluxo de uso

```
1. Boot → animação "VersoVivo" (ou "Pular intro →" + lembrar preferência)
2. Home → "Continuar projeto" (se houver rascunho) ou "Novo Projeto +"
3. Editor → carregue imagens ou vídeo + escreva poema (e título, se quiser)
4. Ajuste → proporção, layout, timeline, fontes, legibilidade, velocidade, música
5. Exportar → "Baixar Vídeo" ou "↗ Compartilhar" (quando disponível)
6. Início → botão "← Início" (salva automaticamente antes de sair)
```

### Instalar como app (PWA)

Com servidor local ou HTTPS, o navegador pode oferecer **Adicionar à tela inicial**. O app abre em modo standalone com cache offline de `index.html`, manifest e ícone.

---

## 3. Estrutura de arquivos

```
versovivo/
│
├── index.html           # Sistema completo (HTML + CSS + JavaScript)
├── manifest.webmanifest # Metadados PWA (nome, tema, ícone)
├── sw.js                # Service worker — cache offline v3
├── icons/
│   └── icon.svg         # Ícone do app
└── PROJETO.md           # Este arquivo
```

> O editor continua em um único HTML por portabilidade; PWA adiciona arquivos mínimos ao redor.

---

## 4. Arquitetura e funcionamento

### Camadas do editor

```
┌─────────────────────────────────────┐
│  <canvas id="cv">                   │  ← Imagens/vídeo + texto (export)
│  <div id="cv-overlay">              │  ← Caixas de texto interativas
│    <div id="text-box">              │  ← Poema (main)
│    <div id="text-box-2">            │  ← Título (title)
└─────────────────────────────────────┘
```

### Estado principal (`S`)

| Campo | Função |
|-------|--------|
| `mode` | `'none'` \| `'images'` \| `'video'` |
| `imgs`, `idx`, `prevIdx`, `fadeProgress` | Slideshow + crossfade |
| `speed` | Segundos por imagem |
| `text`, `font`, `color`, formatação | Poema (caixa principal) |
| `text2`, `titleFont`, `titleColor`, … | Título (segunda caixa) |
| `aspectKey` | `'9:16'` \| `'1:1'` \| `'16:9'` |
| `textShadow`, `textStroke`, `boxBgOpacity` | Legibilidade |
| `recording` | Bloqueia `tick()` durante export |

### Caixas de texto (`TBOX` / `TBOX2`)

Posição e tamanho em **frações** (0–1) do canvas — escalam do preview para a resolução de export sem recalcular manualmente. Definições unificadas em `BOX_DEFS.main` e `BOX_DEFS.title`.

### Loops de renderização

- **`tick()`** — preview contínuo via `requestAnimationFrame`
- **`recLoop()`** — export offscreen; controla índice e fade independentemente
- **`drawAllTextLayers()`** — desenha título e verso no preview e no export

---

## 5. Funcionalidades detalhadas

### Boot

- Escrita animada "VersoVivo" (fonte Sacramento, gradiente roxo→rosa)
- Subtítulo "Poesia em Movimento"
- **Pular intro →** após ~0,8 s; checkbox **Pular intro sempre** (`versovivo-skip-boot`)

### Home

- **Continuar projeto** — aparece se existir rascunho salvo (data + resumo)
- **Novo Projeto +** — limpa rascunho após confirmação

### Editor — Topbar

- Marca VersoVivo + contador de mídia
- Indicador "Salvo" (flash verde após autosave)
- **← Início** — volta à home (confirma se há conteúdo)
- **Baixar Vídeo** — desabilitado até carregar mídia
- **↗ Compartilhar** — visível quando `navigator.share` existe (tipicamente mobile)

### Editor — Toolbar

| Botão | Ação |
|-------|------|
| Pausar/Retomar | Slideshow ou vídeo de fundo |
| Imagens | Upload múltiplo |
| Vídeo | Upload vídeo loop mudo |
| Velocidade | 0,1s – 10s por slide |
| Proporção | 9:16, 1:1, 16:9 |
| Layout | 6 templates |
| Música | Upload de áudio, volume, loop no export |
| Texto → sub-menu | Caixa, **Título**, Fontes, Formato, Alinhamento, Cor, Legível |

### Painel Proporção (`#ar`)

| Preset | Resolução export | Uso |
|--------|------------------|-----|
| 9:16 | 720×1280 | Reels, Shorts, Stories |
| 1:1 | 1080×1080 | Feed Instagram |
| 16:9 | 1280×720 | YouTube, apresentações |

### Painel Layout (`#tp`)

| Template | Uso |
|----------|-----|
| Verso Central | Poema grande no centro |
| Haiku no Rodapé | 3 linhas na base |
| Citação Lateral | Texto à esquerda, editorial |
| Minimal | Bloco discreto no canto |
| Dramático | Título impactante no topo |
| **Título + Verso** | Duas caixas: título no topo, poema na base |

### Timeline (`#timeline-bar`)

Visível apenas no modo **imagens**. Permite clicar, reordenar (drag) e remover slides.

### Painel Música (`#ap`)

Upload, volume, preview loop; áudio mixado no export via `AudioContext`.

### Exportação e compartilhamento

- Resolução conforme `FORMAT_PRESETS[S.aspectKey]`
- Crossfade e **ambas as caixas de texto** incluídos no vídeo
- **`exportVideoBlob()`** — núcleo reutilizado por download e share
- **`startDownload()`** — dispara download do arquivo
- **`shareVideo()`** — `navigator.share({ files: [...] })` quando suportado
- Overlay de progresso durante gravação

---

## 6. Persistência de projetos

| Camada | Armazena |
|--------|----------|
| `localStorage` (`versovivo-project`) | Metadados: texto, título, fontes, layout, áudio, TBOX, TBOX2, `aspectKey`, velocidade, modo |
| `IndexedDB` (`versovivo` / store `blobs`) | Blobs de imagens, vídeo **e música** |

- **Autosave** debounced (~700 ms) após alterações
- **Restaurar** via "Continuar projeto" na home
- **Limpar** ao criar "Novo Projeto" (com confirmação)

---

## 7. Tecnologias utilizadas

| Tecnologia | Função |
|------------|--------|
| HTML5 Canvas | Mídia, texto, boot animation |
| CSS3 | UI dark theme roxo/rosa |
| JavaScript Vanilla | Estado, interação, export |
| Google Fonts | Playfair Display, Sacramento + 40 fontes poéticas |
| File API | Upload local |
| MediaRecorder + AudioContext | Export vídeo com trilha opcional |
| Web Share API | Compartilhar arquivo de vídeo |
| Service Worker + Manifest | PWA offline |
| IndexedDB + localStorage | Persistência |

### Paleta

```css
--bg: #09090F;
--primary: #8B5CF6;
--second: #EC4899;
--grad: linear-gradient(135deg, #8B5CF6, #EC4899);
```

---

## 8. Guia educativo — entenda cada parte

### Por que frações no `TBOX`?

Se a caixa está a 50% da largura no preview, ela continua a 50% no export — qualquer que seja 720×1280 ou 1080×1080. Coordenadas relativas evitam bugs de escala.

### Duas caixas com `BOX_DEFS`

Em vez de duplicar lógica de drag/resize/edit, cada caixa é um **objeto de configuração** (`main` / `title`) que aponta para estado (`TBOX` / `TBOX2`), IDs DOM e getters de estilo. Padrão **strategy/config object** — fácil adicionar uma terceira caixa no futuro.

### Export reutilizável

`exportVideoBlob(onProgress)` concentra gravação; `beginExportUI()` / `endExportUI()` cuidam do overlay e restauração de estado. Download e Share são **dois adapters** sobre o mesmo núcleo — evita divergência de bugs entre fluxos.

### PWA mínimo

O service worker cacheia só o shell (`index.html`, manifest, ícone). Fontes do Google e mídia do usuário continuam online ou locais — trade-off consciente: app instalável sem inflar o cache.

### Web Share no mobile

`navigator.share({ files: [File] })` abre o sheet nativo (WhatsApp, Drive, etc.). Nem todo desktop suporta arquivos; o botão só aparece quando `navigator.share` existe.

---

## 9. Como dar continuidade ao projeto

### Onde encontrar no código

| Recurso | Buscar em `index.html` |
|---------|------------------------|
| Cores / tema | `:root` no `<style>` |
| Boot skippable | `skipBoot()`, `finishBoot()`, `versovivo-skip-boot` |
| PWA | `manifest.webmanifest`, `sw.js`, registro no final do `<script>` |
| Proporção | `FORMAT_PRESETS`, `setAspect()`, `getExportSize()` |
| Dual text box | `BOX_DEFS`, `drawAllTextLayers()`, `#text-box-2` |
| Fade | `FADE_MS`, `getSlideFadeState()` |
| Legibilidade | `drawTextTo()`, painel `#lp` |
| Templates | `LAYOUT_TEMPLATES`, `applyLayoutTemplate()` |
| Timeline | `rebuildTimeline()`, `reorderSlide()` |
| Música | `loadAudio()`, `exportVideoBlob()` |
| Persistência | `saveProject()`, `restoreProjectMedia()` |
| Export / Share | `exportVideoBlob()`, `startDownload()`, `shareVideo()` |

### Melhorias opcionais (pós-plano)

- Efeito Ken Burns (pan/zoom suave nas imagens)
- Lazy-load de fontes (menos peso na primeira carga)
- Aviso de compatibilidade de codec por browser
- Modularizar o monolito em ES modules (se o projeto crescer)

---

## 10. Auditoria técnica (jun/2026)

### Front-end

| Aspecto | Avaliação |
|---------|-----------|
| UI visual | Forte — tema coeso, gradientes, painéis deslizantes |
| Responsividade | Canvas escala bem; toolbar pode apertar em telas muito estreitas |
| Duas caixas de texto | OK após `_textStyleTarget` — Fonte/Cor/Alinhamento seguem Verso ou Título |
| Acessibilidade | Parcial — `aria-label` nos botões principais; canvas ainda sem alternativa textual |
| Performance | ~3400 linhas em um arquivo; 40+ fontes carregadas sob demanda no painel |

### “Back-end” (camada de dados — sem servidor)

| Camada | Avaliação |
|--------|-----------|
| localStorage | Metadados leves; limite ~5 MB respeitado |
| IndexedDB | Blobs de mídia/áudio; store simples sem índices |
| Autosave | Debounce 700 ms — bom equilíbrio |
| PWA / SW | Cache v3 do shell; fontes Google ficam online |
| Segurança | 100% client-side; sem exposição de API |

### Dinâmica do produto

```
Boot (skippable) → Home (continuar/novo) → Editor → Export/Share
                      ↑__________________________|
                         autosave + IndexedDB
```

Fluxo coerente para o caso de uso (criar vídeo poético rápido no celular/desktop). Export e Share compartilham `exportVideoBlob()` — gravação idêntica nos dois caminhos.

### Correções aplicadas nesta auditoria

- Controles de texto contextuais (`_textStyleTarget`) para título vs verso
- Indicador visual “Verso / Título” na sub-toolbar
- Restore ao continuar projeto sempre sincroniza UI e botões
- `drawTextTo` usa estilo por caixa (underline/strike não vazam para título)
- `showVisibleTextBoxes()` restaura via `syncTextBox()` após export
- Meta tags PWA Apple + `aria-label` nos botões de ação

---

*Documento atualizado em junho de 2026 — VersoVivo Fase 3 + auditoria*
