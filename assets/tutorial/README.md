# Assets do tutorial VersoVivo

Imagens padrão usadas pelo tutorial interativo quando o usuário ainda não carregou mídia.

## Arquivos

| Arquivo | Uso |
|---------|-----|
| `demo-1.jpg` | Slideshow demo — cena 1 |
| `demo-2.jpg` | Slideshow demo — cena 2 |
| `demo-3.jpg` | Slideshow demo — cena 3 |

## Regenerar

```bash
npm run tutorial-assets
```

## Substituir por seus arquivos

Mantenha os **mesmos nomes** (`demo-1.jpg`, etc.) ou edite a lista `TUTORIAL_DEMO_IMAGES` em `js/versovivo.js`.

**Recomendado:** arquivos locais nesta pasta (funciona offline, PWA e testes reproduzíveis). Links da internet quebram com CORS, mudanças de URL ou uso sem conexão.
