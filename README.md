# steph vieira — redesign

Site estático (HTML + CSS + JS), sem build.

- `index.html` — conteúdo e estrutura
- `css/style.css` — identidade visual (tokens no `:root`)
- `js/main.js` — animações: GSAP + ScrollTrigger 3.12.5 e Lenis 1.1.13, servidos de `js/vendor/`
- `fonts/` — fontes WOFF2 e respectivas licenças
- `img/`, `media/`, `lojinha/img/` — imagens e vídeos baixados do site original
- `img/steph-ilustracao.jpg` — ilustração usada na transição de pixels da hero (função `createMorph` em `js/main.js`)

Prévia: https://steph-vieira-redesign.vercel.app

Para rodar local: `python -m http.server 5178` na pasta e abrir http://localhost:5178
