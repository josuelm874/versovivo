# VersoVivo — Relatório de QA (pré-publicação)

Data: 2026-10-06 · Build: 1.0 (versionCode 1) · targetSdk 36 · minSdk 24

## 1. Resultado resumido

| Item | Evidência | Estado |
|---|---|---|
| Testes unitários (`npm test`) | todos passaram (smoke, enhance) | OK |
| Playwright (`npx playwright test`) | 43/43 na execução final (2,9 min). Execuções intermediárias tiveram 1–2 falhas intermitentes, em testes diferentes; ver §3 | OK |
| Cenários QA (`e2e/qa-scenarios.spec.js`, 29 testes) | mídia extrema, textos hostis, persistência corrompida, 300 interações, offline, 6 viewports, acessibilidade | OK |
| Release APK + AAB assinados | `apksigner verify`: Verifies (v2); package `app.versovivo.editor`, targetSdk 36, permissão só INTERNET | OK |
| Lint Android | 0 erros, 17 avisos | OK |
| Voltar (Android 16, aparelho real) | editor → início; início → sai do app; confirmado por log nativo (`callback fired`, `js=true/false`, `moveTaskToBack=true`) | OK |
| **Teste final "gold" no aparelho (S10)** | **100/100 EXCELENTE** — 9:16, 4 fotos, 20 s, wipe, filtro quente, escurecer 30%, texto legível, música: H.264 ok 15/15 · 1080×1920 10/10 · 19,95 s 10/10 · 29,8 fps, 0 travas 15/15 · 0 quadros pretos/congelados 10/10 · SSIM 0,985 15/15 · contraste 6,5:1 10/10 · áudio −17,5 LUFS 10/10 · 43,1 MB 5/5 (`docs/relatorio/S10-gold-completo.json`) | OK |

### Matriz de exportação no aparelho (Xiaomi, Android 16)

| Cenário | Nota |
|---|---|
| S1 slideshow básico | 100 |
| S2 | 85* |
| S3 | 89–93* |
| S4 | 100 |
| S5 | 100 |
| S6 vídeo + música + filtro | 81 (BOM) |
| S6a vídeo + música, sem filtro | 79 (BOM) |
| S6b vídeo + filtro, sem música | 95 |
| S7 vídeo paisagem | 95 |
| S8 60 s, 8 fotos, música | 97 |
| S9 sincronia A/V | −5 ms (alvo ±40) |
| **S10 gold** | **100** |

\* Notas reduzidas por fragilidade da métrica SSIM em quadros de transição; SSIM tolerante (±2 quadros) deu 0,95–0,99 nos quadros estáticos.

## 2. Defeitos encontrados e corrigidos

1. Importar só arquivos inválidos apagava as imagens atuais (perda de dados) — destruição adiada para após validação.
2. Miniaturas quebradas após retomar projeto (blob URLs revogadas) — miniaturas em canvas.
3. Offline falhava (pré-cache redirecionado `/index.html`) — `cacheShell` no service worker.
4. Link remoto do Google Fonts quebrava fontes offline — removido (fontes locais).
5. Alvos de toque < 44 px e fontes < 11 px — CSS corrigido.
6. Exportação de slideshow ~3% mais longa e deriva A/V — laço por relógio real (S1: 12,00 s, 29,9 fps; A/V −5 ms).
7. targetSdk 34 bloqueia publicação na Play — migrado para 36 (Gradle 8.11.1, AGP 8.9.1).
8. Android 16 (Voltar preditivo) fechava o app no editor — `OnBackPressedCallback` que chama `window.vvHandleBack()` (fecha painel / sai da edição / volta ao início; senão `moveTaskToBack`). A abordagem por histórico do WebView foi descartada.
9. Vídeo + música a ~22–25 fps — tentativa com `requestVideoFrameCallback` revertida (regressão); limitação mantida (§3).
10. "Novo poema" podia não abrir o editor se o IndexedDB demorasse a limpar — `clearStoredProject` com limite de 2 s.

## 3. Riscos conhecidos / limitações

- **Vídeo (clipe) + música no celular**: 79–81 (BOM), ~25 fps, por disputa de decodificação do aparelho. Slideshow com música (o caso principal) fica em 97–100. Uma tentativa com `requestVideoFrameCallback` piorou (S6 gravou só 3,1 s) e foi revertida para o laço anterior.
- **Falhas intermitentes no Playwright** (suíte completa, 3 execuções com 1–2 falhas em testes diferentes, todas passando isoladas): hipótese principal era `clearStoredProject` aguardando o IndexedDB sem limite de tempo, o que travaria "Novo poema". Foi corrigido (timeout de 2 s + `onabort`); a execução seguinte passou 43/43. Uma só execução limpa não prova a causa; monitorar.
- Testes de Voltar automatizados (`scripts/qa/device-nav.mjs`) acusam falha no último passo por artefatos do harness (diálogos aceitos via CDP); o fluxo real foi verificado com toques e log nativo.
- Testado em um único aparelho (Xiaomi, Android 16). Recomenda-se ao menos um aparelho Samsung/Android 12–13 antes do lançamento amplo.
- Fontes não empacotadas (painel de fontes do Google) precisam de internet; offline a exportação usa fallback.

## 4. Checklist Play Store

- [x] targetSdk 36 (exigido a partir de 2026-08-31), minSdk 24
- [x] APK/AAB sem bibliotecas nativas próprias (compatível com páginas de 16 KB)
- [x] Apenas permissão INTERNET; `allowBackup=false`
- [x] Assinatura de release configurada (keystore local fora do repositório: `~/.versovivo-release.jks`; `android/keystore.properties` ignorado no git). **Guarde backup do keystore: perdê-lo impede atualizações.**
- [x] AAB gerado (`android/app/build/outputs/bundle/release/app-release.aab`)
- [ ] Política de privacidade (URL), formulário Data Safety, ficha da loja, capturas de tela
- [ ] Teste fechado de 14 dias, se conta pessoal nova
