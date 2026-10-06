# VersoVivo — Relatório de QA (pré-publicação)

Data: 2026-10-06 · Build: 1.0 (versionCode 1) · targetSdk 36 · minSdk 24

## 1. Resultado resumido

| Item | Evidência | Estado |
|---|---|---|
| Testes unitários (`npm test`) | todos passaram (smoke, enhance) | OK |
| Playwright (`npx playwright test`) | 43/43 na reexecução limpa; 1ª execução teve 2 falhas intermitentes (`#editor` não abriu após clique em "novo projeto"), ambas passaram isoladas (7/7) e na reexecução completa | OK, com 1 flake observado |
| Cenários QA (`e2e/qa-scenarios.spec.js`, 29 testes) | mídia extrema, textos hostis, persistência corrompida, 300 interações, offline, 6 viewports, acessibilidade | OK |
| Release APK assinado | `apksigner verify`: Verifies (v2); package `app.versovivo.editor`, targetSdk 36, permissão só INTERNET | OK |
| Lint Android | 0 erros, 17 avisos | OK |
| Matriz de exportação no aparelho (Xiaomi) | S1 100 · S2 85* · S3 89–93* · S4 100 · S5 100 · S6 85 · S7 95 · S8 97 · S9 sincronia A/V −5 ms | ver pendências |

\* Notas de S2/S3 reduzidas por fragilidade da métrica SSIM em quadros de transição; reanálise tolerante (±2 quadros) deu SSIM 0,95–0,99 nos quadros estáticos.

## 2. Defeitos encontrados e corrigidos

1. Importar só arquivos inválidos apagava as imagens atuais (perda de dados) — destruição adiada para após validação.
2. Miniaturas quebradas após retomar projeto (blob URLs revogadas) — miniaturas em canvas.
3. Offline falhava (pré-cache redirecionado `/index.html`) — `cacheShell` no service worker.
4. Link remoto do Google Fonts quebrava fontes offline — removido (fontes locais).
5. Alvos de toque < 44 px e fontes < 11 px — CSS corrigido.
6. Exportação de slideshow ~3% mais longa e deriva A/V — laço por relógio real (S1: 12,00 s, 29,9 fps; A/V −5 ms).
7. targetSdk 34 bloqueia publicação na Play — migrado para 36 (Gradle 8.11.1, AGP 8.9.1).
8. Android 16 (Voltar preditivo) fechava o app no editor — `OnBackPressedCallback` + pilha de histórico.
9. Vídeo + música a 22 fps — laço com `requestVideoFrameCallback`.

## 3. Pendências / riscos conhecidos (não verificados nesta rodada)

- **Aparelho desconectado** durante a conclusão (`adb devices` vazio). Não revalidados no aparelho: correção do item 9 (S6/S6a/S6b/S7), Voltar na tela inicial.
- **Voltar na tela inicial**: após abrir o editor e voltar pelo botão ←, o 1º Voltar não sai do app (o 2º sai). Causa raiz não encontrada; comportamento intermitente. Não bloqueia uso, mas deve ser reavaliado.
- Teste "gold" final (vídeo completo 9:16 com 4+ fotos, texto, efeitos, música) ainda não executado.
- Flake de abertura do editor sob carga no Playwright (1 ocorrência, 2 testes).
- APK de depuração no aparelho ainda é `debuggable`; o release não é.

## 4. Checklist Play Store

- [x] targetSdk 36 (exigido a partir de 2026-08-31), minSdk 24
- [x] APK/AAB sem bibliotecas nativas próprias (compatível com páginas de 16 KB)
- [x] Apenas permissão INTERNET; `allowBackup=false`
- [x] Assinatura de release configurada (keystore local fora do repositório: `~/.versovivo-release.jks`; `android/keystore.properties` ignorado no git). **Guarde backup do keystore: perdê-lo impede atualizações.**
- [ ] Gerar AAB (`gradlew bundleRelease`) para envio à Play
- [ ] Política de privacidade (URL), formulário Data Safety, ficha da loja, capturas de tela
- [ ] Teste fechado de 14 dias, se conta pessoal nova
