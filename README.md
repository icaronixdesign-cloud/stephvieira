# steph vieira — redesign

Site estático (HTML + CSS + JS), sem build.

- `index.html` — conteúdo e estrutura
- `css/style.css` — identidade visual (tokens no `:root`)
- `js/main.js` — animações: GSAP + ScrollTrigger 3.12.5 e Lenis 1.1.13, servidos de `js/vendor/`
- `fonts/` — fontes WOFF2 e respectivas licenças
- `img/`, `media/`, `lojinha/img/` — imagens e vídeos baixados do site original
- `img/steph-ilustracao.jpg` — ilustração usada na transição de pixels da hero (função `createMorph` em `js/main.js`)

## Galeria + KengaZ

A seção `#galeria` é um pin só (bloco GALERIA em `js/main.js`): o título "steph trampante por aí"
anda pro lado e entra a capa das KengaZ (`#kengaz`), o trilho sobe como scroll comum, a frase
"e não para por aí" para no meio e a câmera atravessa ela até o túnel
de fotos. Em retrato/celular os vídeos ganham um painel próprio. Sem motion (reduced motion) tudo
fica em coluna.

- `img/kengaz-squad.webp` / `-960.webp` — foto do squad no painel da Twitch (Gamescom Latam),
  recortada do fundo com rembg (`birefnet-portrait`), com a base e as laterais dissolvendo
  direto no alfa.
- `img/kz_v1.jpg`…`kz_v3.jpg` — capas dos 3 vídeos mais recentes do canal youtube.com/@askengaz
  (snapshot de 20/11/2026; trocar a imagem, o link, o título e a data no `index.html` quando sair vídeo novo).

Prévia: https://steph-vieira-redesign.vercel.app

Para rodar local: `python -m http.server 5178` na pasta e abrir http://localhost:5178
