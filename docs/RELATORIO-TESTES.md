# Relatório — VersoVivo no Android (APK) · 2026-10-04

**Aparelho:** Xiaomi 2311DRK48G · Android 16 · WebView 153 · 1220×2712 · 4G/Wi‑Fi
**App:** `app.versovivo.editor` (Capacitor 6, APK debug ≈ 3,9 MB, 100 % offline)
**Materiais da web:** fotos Unsplash (via picsum.photos), vídeo Big Buck Bunny 720p/10 s (CC BY 3.0), música SoundHelix — ver `test-media/CREDITS.md`.

## O que foi feito

1. **APK**: o PWA foi empacotado com Capacitor (`scripts/apk.ps1` = build + sync + Gradle + `adb install` + lançar).
2. **Salvar/compartilhar nativo**: a WebView Android não baixa `blob:`; o MP4 é gravado em cache (em blocos de 3 MB) e abre a folha de compartilhar do Android (Drive, WhatsApp, Instagram, Quick Share…). O botão **Compartilhar** passou a aparecer no app.
3. **Painel ✨ Efeitos** (novo): transições (Suave, Deslizar, Zoom, Cortina), 6 filtros de cor, *Escurecer fundo* 0–60 % (legibilidade do texto) e liga/desliga do zoom lento. Vale para preview **e** export, é salvo no projeto e entrou no tutorial (agora 51 passos).
4. **Correções achadas nos testes no aparelho**
   | # | Problema encontrado no celular | Correção |
   |---|---|---|
   | 1 | "4 **imagemns**" (plural errado em 4 lugares) | `imagem/imagens` |
   | 2 | Cancelar a folha de compartilhar mostrava "Erro ao gerar vídeo: Share canceled" | cancelamento tratado como normal |
   | 3 | **Export de vídeo (modo vídeo) durava 4 min e saía com 8:12 min / 0,61 fps** (seek do decodificador do celular ≈ 1 s/quadro, gravado em relógio real) | sonda a velocidade de seek; se lento, grava reproduzindo em tempo real → **10,04 s** |
   | 4 | Nitidez por quadro em JS custava 82 ms a 1080×1920 → 4,2 fps | desligada no modo tempo real → **23,8 fps** |
   | 5 | Teclado ficava aberto ao abrir um painel | `blur()` ao abrir painel |
   | 6 | Barra superior apertada (contador cortado) em telas ≤ 440 px | modo compacto até 440 px |

## Resultados medidos no aparelho

| Teste | Resultado |
|---|---|
| Instalação + abertura | OK (Android 16, `INSTALL_FAILED_USER_RESTRICTED` resolvido ativando "Instalar via USB") |
| 4 fotos 1080×1920 → slideshow 20 s com poema | **MP4 H.264 1080×1920, 20,65 s, 50,9 MB, ~21–30 s de render**; texto nítido |
| + Deslizar / Vintage / Escurecer 30 % | efeitos presentes no MP4 exportado (`fx-frames.png`) |
| Vídeo 720p + música + poema + filtro Quente | **10,04 s, H.264 1080×1920 + Opus 192 kbps, 23,8 fps, ~29 s** (antes: 8:12 min) |
| Filtro P&B | pixel R=G=B=119 (neutro) |
| Escurecer 60 % | luminância média 147 → 59 |
| Salvar → folha de compartilhar | OK (`04-share-sheet.png`), cancelar sem erro (`07-final-after-cancel.png`) |

Imagens: `relatorio/sheet_transitions.png`, `sheet_filters.png`, `fx-frames.png`, `video-frames2.png`, `06-fx-panel.png`.

## Testes automatizados
`npm test` (smoke + enhance) ✔ · `npx playwright test` 9/9 ✔ (inclui novo teste do painel Efeitos e tutorial completo).
No aparelho: `scripts/device-test.mjs`, `device-video-test.mjs`, `device-fx.mjs` (via `adb forward` + CDP da WebView).

## Pendências / próximos passos sugeridos
- Export de vídeo em tempo real não aplica a nitidez por quadro (qualidade ligeiramente mais macia que no desktop).
- Áudio original do vídeo importado não entra no export (só a música) — comportamento herdado.
- MP4 de 20 s sai com ~51 MB (bitrate 20 Mbps); oferecer "qualidade: Média" reduziria p/ ~15 MB.
- APK está assinado com chave debug; para publicar na Play Store gerar *release* + keystore.
