# Design "Tinta & Papel" — VersoVivo

Direção aprovada pelo usuário em 2026-10-04 (tema escuro com superfícies de pergaminho).

## Pesquisa (resumo)
Pinterest (exige login — só mural visível): papel bege com texto de máquina de escrever, manuscritos antigos, fotos P&B granuladas com rabiscos de tinta, muito branco. Web: poesia visual = papel texturizado + tipografia serifada + identidade consistente; apps editoriais usam serifa de destaque + corpo sóbrio em tom quente; paleta dark academia = bordô, creme, dourado.

## Tokens
| Token | Valor |
|---|---|
| bg / surface / card | `#14110F` / `#1B1714` / `#221C18` |
| border / muted | `#3A3027` / `#8C7F6E` |
| text (pergaminho) | `#EFE6D6` |
| primary (ouro antigo) / second (vinho) | `#C9A66B` / `#8E2A33` |

## Tipografia
Cormorant Garamond (títulos, itálico poético) · EB Garamond (corpo) · Sacramento (assinaturas) · Playfair mantido p/ texto do vídeo. Todas self-hosted (`assets/fonts`, offline no APK).

## Linguagem
Grão de papel e vinheta sutis; hairlines douradas; florão como divisor; rótulos em versalete espaçado; ícones de traço fino; cantos pequenos (6–10 px); sliders de fio com losango; microtexto poético ("Novo poema", "Gerando seu poema…").

## Escopo
Boot, início, topbar, toolbar, painéis, timeline, overlay de export, configurações, tutorial. **Fora de escopo:** logo/ícone do app, canvas e arquivo de vídeo exportado.

## Verificação
`npm test`, Playwright, capturas no Xiaomi (antes/depois), contraste ≥ 4.5:1 no texto principal.
