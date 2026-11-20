/* =========================================================
   steph vieira — motion
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasLibs = !!(window.gsap && window.ScrollTrigger);
  const MOTION = !reduce && hasLibs;
  if (!MOTION) root.classList.remove('motion');

  let lenis = null;
  const clamp = (a, b, v) => Math.min(b, Math.max(a, v));

  /* ---------- split de texto (palavras / letras) ---------- */
  function split(el, mode = 'chars') {
    const words = [];
    const chars = [];
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            if (mode === 'chars') {
              Array.from(part).forEach(ch => {
                const c = document.createElement('span');
                c.className = 'c';
                c.textContent = ch;
                w.appendChild(c);
                chars.push(c);
              });
            } else {
              w.textContent = part;
            }
            frag.appendChild(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
    if (mode === 'chars' && !el.closest('[aria-hidden="true"]')) {
      el.setAttribute('aria-label', text);
      words.forEach(w => w.setAttribute('aria-hidden', 'true'));
    }
    return { words, chars };
  }

  /* ---------- toast + copiar e-mail ---------- */
  const toast = $('.toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2400);
  }
  const copyBtn = $('#copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const emailEl = $('#email');
      const email = emailEl.textContent.trim();
      const done = () => {
        copyBtn.textContent = 'copiado! ✦';
        showToast('e-mail copiado ✦ agora é só colar');
        setTimeout(() => { copyBtn.textContent = 'copiar e-mail'; }, 1800);
      };
      const fallback = () => {
        const r = document.createRange();
        r.selectNodeContents(emailEl);
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        copyBtn.textContent = 'selecionado, só copiar';
      };
      try { navigator.clipboard.writeText(email).then(done, fallback); } catch (e) { fallback(); }
    });
  }

  /* ---------- hot take digitando ---------- */
  function typewriter() {
    const el = $('.tw');
    if (!el) return;
    const takes = [
      '> só é cringe até dar certo.',
      '> tu tá deprimido porque não tá fazendo side quest, pô.',
      '> be cringe. be free.',
      '> videogame nunca foi o assunto. é a lente.',
      '> carregando hot take...'
    ];
    if (reduce) { el.textContent = takes[0]; return; }
    let i = -1;
    const type = (str, k) => {
      el.textContent = str.slice(0, k);
      if (k < str.length) setTimeout(() => type(str, k + 1), 34 + Math.random() * 46);
      else setTimeout(erase, 2600);
    };
    const erase = () => {
      const s = el.textContent;
      if (s.length > 2) { el.textContent = s.slice(0, -1); setTimeout(erase, 16); }
      else { i = (i + 1) % takes.length; setTimeout(() => type(takes[i], 2), 260); }
    };
    setTimeout(erase, 3200);
  }

  /* ---------- brilhinhos ---------- */
  const sparkCols = ['#ffd24a', '#ff4fa3', '#5fd8cc', '#ffffff'];
  $$('[data-sparkles]').forEach(sec => {
    for (let k = 0; k < 6; k++) {
      const s = document.createElement('span');
      s.className = 'spk';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = '✦';
      const edge = k % 2 ? 88 + Math.random() * 9 : 2 + Math.random() * 9;
      s.style.cssText = `left:${edge}%;top:${4 + Math.random() * 90}%;--c:${sparkCols[k % 4]};--s:${14 + Math.random() * 18}px;--d:${2 + Math.random() * 2.5}s;--dl:${-Math.random() * 3}s`;
      sec.prepend(s);
    }
  });

  /* ---------- menu mobile ---------- */
  const burger = $('.nav-burger');
  const menu = $('#menu');
  function openMenu() {
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    if (MOTION) gsap.fromTo('#menu nav a', { yPercent: 70, opacity: 0, rotation: 4 }, { yPercent: 0, opacity: 1, rotation: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out' });
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- âncoras ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { duration: 1.8 });
      else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- lightbox dos vídeos ---------- */
  const lb = $('.lb');
  if (lb && typeof lb.showModal === 'function') {
    const vid = $('video', lb);
    const cap = $('.lb-cap', lb);
    const cnt = $('.lb-count', lb);
    const figs = $$('.phone');
    let idx = 0;
    const show = i => {
      idx = (i + figs.length) % figs.length;
      const f = figs[idx];
      vid.pause();
      vid.poster = $('img', f).src;
      vid.src = f.dataset.video;
      cap.textContent = $('figcaption b', f).textContent;
      cnt.textContent = `${idx + 1} / ${figs.length}`;
      const p = vid.play();
      if (p && p.catch) p.catch(() => {});
    };
    figs.forEach((f, i) => $('.phone-btn', f).addEventListener('click', () => {
      if (!lb.open) lb.showModal();
      if (lenis) lenis.stop();
      show(i);
    }));
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    $('.lb-x', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      if (lenis) lenis.start();
    });
  } else if (lb) {
    $$('.phone').forEach(f => $('.phone-btn', f).addEventListener('click', () => window.open(f.dataset.video, '_blank', 'noopener')));
  }

  typewriter();

  /* =========================================================
     sem motion: layout estático e acessível
     ========================================================= */
  if (!MOTION) {
    const l = $('.loader');
    if (l) l.remove();
    return;
  }

  /* =========================================================
     MOTION
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const startHash = location.hash;
  window.scrollTo(0, 0);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.3 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  document.body.classList.add('is-loading');

  const vel = () => (lenis ? lenis.velocity || 0 : 0);
  const mm = gsap.matchMedia();

  /* ---------- marquee infinito com velocidade do scroll ---------- */
  function marquee(track, dirBase, baseSpeed) {
    const parent = track.parentElement;
    const unit = track.innerHTML;
    const n0 = track.children.length;
    let guard = 0;
    while (track.scrollWidth < innerWidth * 1.25 && guard++ < 8) track.insertAdjacentHTML('beforeend', unit);
    track.insertAdjacentHTML('beforeend', track.innerHTML);
    Array.from(track.children).forEach((c, i) => {
      if (i < n0) return;
      c.setAttribute('aria-hidden', 'true');
      $$('img', c).forEach(img => { img.alt = ''; });
    });
    let half = track.scrollWidth / 2;
    let x = 0;
    let dir = 1;
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(parent);
    addEventListener('resize', () => { half = track.scrollWidth / 2; });
    ScrollTrigger.addEventListener('refresh', () => { half = track.scrollWidth / 2; });
    gsap.ticker.add((t, dt) => {
      if (!visible || !half) return;
      const v = vel();
      if (Math.abs(v) > 0.4) dir = Math.sign(v);
      const speed = baseSpeed * (1 + Math.min(Math.abs(v) * 0.32, 7));
      x += dirBase * dir * speed * (dt / 1000);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
  }

  /* =========================================================
     MORPH — foto → ilustração, bloco a bloco (WebGL)
     ========================================================= */
  const MORPH_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uP;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  float p = uP;
  float bell = sin(3.14159265 * p);
  // mosaico: os pixels engrossam no meio da troca
  float cells = mix(900.0, 44.0, pow(bell, 0.8));
  vec2 uvM = (floor(vUv * cells) + 0.5) / cells;
  vec2 uv = mix(vUv, uvM, smoothstep(0.0, 0.08, bell));
  // ordem dos blocos: aleatória em duas escalas + varredura diagonal (de baixo pra cima)
  float N = 26.0;
  float coarse = hash(floor(vUv * N));
  float fine = hash(floor(vUv * N * 3.0) + 7.0);
  float sweep = vUv.y * 0.65 + vUv.x * 0.35;
  float th = mix(coarse, fine, 0.35) * 0.55 + sweep * 0.45;
  float t = p * 1.25 - 0.12;
  float m = step(th, t);
  // brilho rosa no bloco que acabou de virar, prévia menta no que está pra virar
  float flash = m * (1.0 - smoothstep(0.0, 0.09, t - th));
  float pre = (1.0 - m) * (1.0 - smoothstep(0.0, 0.06, th - t));
  // leve separação RGB na imagem nova durante a troca
  vec2 off = vec2(0.004 * bell, 0.0);
  vec3 b = vec3(texture2D(uB, uv + off).r, texture2D(uB, uv).g, texture2D(uB, uv - off).b);
  vec3 a = texture2D(uA, uv).rgb;
  vec3 col = mix(a, b, m);
  col = mix(col, floor(col * 6.0 + 0.5) / 6.0, bell * 0.3);
  col = mix(col, vec3(0.37, 0.85, 0.80), pre * 0.28);
  col += flash * vec3(1.0, 0.31, 0.64) * 0.42;
  gl_FragColor = vec4(col, 1.0);
}`;

  function createMorph(media, baseImg, srcB) {
    const imgB = new Image();
    imgB.decoding = 'async';
    imgB.src = srcB;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    const fallback = () => {
      imgB.className = 'hero-morph';
      imgB.alt = '';
      imgB.setAttribute('aria-hidden', 'true');
      media.insertBefore(imgB, baseImg.nextSibling);
      return { el: imgB, set(p) { imgB.style.opacity = String(p); }, size() {} };
    };
    if (!gl) return fallback();
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP * 0.5 + 0.5; gl_Position = vec4(aP, 0.0, 1.0); }');
    const fs = sh(gl.FRAGMENT_SHADER, MORPH_FRAG);
    if (!vs || !fs) return fallback();
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fallback();
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'aP');
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    const uP = gl.getUniformLocation(prog, 'uP');
    gl.uniform1i(gl.getUniformLocation(prog, 'uA'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'uB'), 1);
    const tex = (unit, im) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    };
    const state = { p: 0, ready: false };
    const draw = () => {
      if (!state.ready) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uP, state.p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    canvas.className = 'hero-morph';
    canvas.setAttribute('aria-hidden', 'true');
    media.insertBefore(canvas, baseImg.nextSibling);
    const loaded = im => (im.complete && im.naturalWidth ? Promise.resolve() : new Promise(r => {
      im.addEventListener('load', r, { once: true });
      im.addEventListener('error', r, { once: true });
    }));
    Promise.all([loaded(baseImg), loaded(imgB)]).then(() => {
      if (!baseImg.naturalWidth || !imgB.naturalWidth) return;
      try {
        tex(0, baseImg);
        tex(1, imgB);
      } catch (e) { return; }
      state.ready = true;
      draw();
      canvas.style.opacity = '1';
      baseImg.style.visibility = 'hidden';
    });
    return {
      el: canvas,
      set(p) { state.p = p; draw(); },
      size(w, h) {
        const d = Math.min(window.devicePixelRatio || 1, 2);
        const k = Math.min(1, 2048 / Math.max(w * d, h * d, 1));
        canvas.width = Math.max(2, Math.round(w * d * k));
        canvas.height = Math.max(2, Math.round(h * d * k));
        draw();
      }
    };
  }

  /* =========================================================
     HERO — card que vira tela cheia no scroll
     ========================================================= */
  const hero = (() => {
    const pin = $('.hero-pin');
    const media = $('.hero-media');
    const img = $('img', media);
    const frame = $('.hero-frame');
    const stick = $('.hero-stickers');
    const slot = $('.hero-slot');
    const morph = createMorph(media, img, media.dataset.morph || 'img/steph-ilustracao.jpg');
    const layers = [img, morph.el];
    const M = { p: 0 };
    const S = { intro: 0, zoom: 0, mx: 0, my: 0 };
    let R = { x: 0, y: 0, w: 1, h: 1 };
    let W = 1;
    let H = 1;
    let nw = 1000;
    let nh = 1000;

    const n1 = split($('.hn-1 .hn-in'), 'chars');
    const n2 = split($('.hn-2 .hn-in'), 'chars');
    const fA = split($('.hf-a'), 'chars');
    const fB = split($('.hf-b'), 'chars');

    function measure() {
      const p = pin.getBoundingClientRect();
      const r = slot.getBoundingClientRect();
      W = p.width;
      H = p.height;
      R = { x: r.left - p.left, y: r.top - p.top, w: r.width, h: r.height };
      if (img.naturalWidth) { nw = img.naturalWidth; nh = img.naturalHeight; }
      // a imagem ocupa o tamanho "cover" real (sem recorte do object-fit); quem recorta é o clip-path
      const fs = Math.max(W / nw, H / nh);
      const iw = nw * fs;
      const ih = nh * fs;
      layers.forEach(el => {
        el.style.width = `${iw}px`;
        el.style.height = `${ih}px`;
        el.style.left = `${(W - iw) / 2}px`;
        el.style.top = `${(H - ih) / 2}px`;
      });
      morph.size(iw, ih);
      render();
    }

    function render() {
      const z = S.zoom;
      const k = S.intro;
      const cx = R.x + R.w / 2 + S.mx;
      const cy = R.y + R.h / 2 + S.my;
      const cl = cx - R.w / 2;
      const cr = cx + R.w / 2;
      const cb = cy + R.h / 2;
      const ctFull = cy - R.h / 2;
      const ct = cb - R.h * k;
      // retângulo revelado (intro de baixo pra cima) → tela cheia
      const l = cl * (1 - z);
      const t = ct * (1 - z);
      const r = cr + (W - cr) * z;
      const b = cb + (H - cb) * z;
      const rad = 28 * (1 - z);
      media.style.clipPath = `inset(${t.toFixed(1)}px ${(W - r).toFixed(1)}px ${(H - b).toFixed(1)}px ${l.toFixed(1)}px round ${rad.toFixed(1)}px)`;
      // imagem: cover no card → cover na tela
      const fullS = Math.max(W / nw, H / nh);
      const cardS = Math.max(R.w / nw, R.h / nh);
      const ratio = cardS / fullS;
      const extra = 1 + 0.22 * (1 - k) + 0.05 * (1 - z);
      const s = (ratio + (1 - ratio) * z) * extra;
      const dx = (cx - W / 2) * (1 - z);
      const dy = (cy - H / 2) * (1 - z);
      const tf = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      layers.forEach(el => { el.style.transform = tf; });
      // moldura (segue o recorte) e adesivos (seguem o card inteiro)
      frame.style.transform = `translate3d(${l.toFixed(1)}px,${t.toFixed(1)}px,0)`;
      frame.style.width = `${(r - l).toFixed(1)}px`;
      frame.style.height = `${(b - t).toFixed(1)}px`;
      frame.style.borderRadius = `${rad.toFixed(1)}px`;
      const st = ctFull * (1 - z);
      stick.style.transform = `translate3d(${l.toFixed(1)}px,${st.toFixed(1)}px,0)`;
      stick.style.width = `${(r - l).toFixed(1)}px`;
      stick.style.height = `${(b - st).toFixed(1)}px`;
    }

    if (!img.complete) img.addEventListener('load', measure, { once: true });
    measure();
    addEventListener('resize', measure);

    // scroll: zoom até tela cheia
    const hn1 = $('.hn-1');
    const hn2 = $('.hn-2');
    const stks = $$('.hero-stickers .stk');
    const fly = [[-0.45, -0.35, -40], [-0.6, 0.05, -25], [0.6, 0.12, 30], [-0.2, 0.5, -15], [0.5, -0.5, 60]];
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=240%',
        pin: pin,
        scrub: 0.7,
        invalidateOnRefresh: true,
        onRefresh: measure
      }
    });
    tl.to(S, { zoom: 1, duration: 0.5, ease: 'power2.inOut', onUpdate: render }, 0)
      .to(hn1, { x: () => -(hn1.offsetLeft + hn1.offsetWidth + 80), rotation: -8, duration: 0.4, ease: 'power2.in' }, 0)
      .to(hn2, { x: () => pin.clientWidth - hn2.offsetLeft + 80, rotation: 8, duration: 0.4, ease: 'power2.in' }, 0)
      .to('.hero-copy', { y: -70, opacity: 0, duration: 0.2, ease: 'power1.in' }, 0)
      .to('.hero-scroll', { opacity: 0, duration: 0.08 }, 0)
      .to(frame, { opacity: 0, duration: 0.14 }, 0.04)
      // a foto vira a ilustração, bloco a bloco, enquanto termina de crescer
      .to(M, { p: 1, duration: 0.5, ease: 'none', onUpdate: () => morph.set(M.p) }, 0)
      .to('.hero-media-dots', { opacity: 0.22, duration: 0.2 }, 0.66)
      .to('.hero-media-shade', { opacity: 0.85, duration: 0.2 }, 0.7)
      .fromTo([...fA.chars, ...fB.chars], { yPercent: 120, rotation: i => ((i * 37) % 36) - 18, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, stagger: 0.014, duration: 0.24, ease: 'back.out(2)' }, 0.76)
      .to({}, { duration: 0.12 });
    stks.forEach((s, i) => {
      const f = fly[i] || [0, -0.5, 0];
      tl.to(s, { x: () => f[0] * innerWidth, y: () => f[1] * innerHeight, rotation: f[2], opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.01 * i);
    });

    // ponteiro: parallax suave
    if (fine) {
      const qmx = gsap.quickTo(S, 'mx', { duration: 1, ease: 'power3', onUpdate: render });
      const qmy = gsap.quickTo(S, 'my', { duration: 1, ease: 'power3', onUpdate: render });
      const a1 = gsap.quickTo('.hn-1 .hn-in', 'x', { duration: 1.1, ease: 'power3' });
      const b1 = gsap.quickTo('.hn-1 .hn-in', 'y', { duration: 1.1, ease: 'power3' });
      const a2 = gsap.quickTo('.hn-2 .hn-in', 'x', { duration: 1.1, ease: 'power3' });
      const b2 = gsap.quickTo('.hn-2 .hn-in', 'y', { duration: 1.1, ease: 'power3' });
      const stIn = $$('.hero-stickers .stk-in').map((el, i) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.9 + i * 0.1, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9 + i * 0.1, ease: 'power3' }),
        d: 18 + i * 7
      }));
      pin.addEventListener('pointermove', e => {
        if (S.zoom > 0.05) return;
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        qmx(nx * 26); qmy(ny * 20);
        a1(nx * -34); b1(ny * -18);
        a2(nx * 46); b2(ny * 22);
        stIn.forEach(o => { o.x(nx * o.d); o.y(ny * o.d); });
      });
    }

    function intro() {
      const it = gsap.timeline({ defaults: { ease: 'expo.out' } });
      it.to(S, { intro: 1, duration: 1.5, ease: 'expo.inOut', onUpdate: render }, 0)
        .from([...n1.chars, ...n2.chars], { yPercent: 115, rotation: () => gsap.utils.random(-22, 22), opacity: 0, duration: 1.2, stagger: 0.05, ease: 'back.out(1.7)' }, 0.25)
        .from('.hero-frame', { opacity: 0, duration: 0.6 }, 0.6)
        .from('.hero-stickers .stk-in', { scale: 0, rotation: -35, duration: 0.9, stagger: 0.09, ease: 'back.out(2.4)' }, 0.95)
        .from('.hero-copy > *', { y: 34, opacity: 0, duration: 1, stagger: 0.09 }, 0.75)
        .from('.hero-scroll', { opacity: 0, duration: 0.8 }, 1.2);
      return it;
    }

    return { intro, measure };
  })();

  /* ---------- faixas ---------- */
  $$('.band').forEach(b => marquee($('.band-track', b), b.classList.contains('band-ink') ? -1 : 1, 46));
  gsap.fromTo('.band-ink', { rotation: -6 }, { rotation: -2, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.band-sun', { rotation: 6 }, { rotation: 1.5, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* =========================================================
     MANIFESTO — palavras acendem com o scroll
     ========================================================= */
  (() => {
    const { words } = split($('.mf-text'), 'words');
    gsap.set(words, { opacity: 0.12 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=130%', pin: '.mf-pin', scrub: 0.5 }
    });
    words.forEach((w, i) => {
      tl.to(w, { opacity: 1, duration: 0.5, ease: 'none' }, i * 0.18);
      if (w.closest('.hl')) tl.to(w, { backgroundSize: '100% 38%', duration: 0.35, ease: 'power2.out' }, i * 0.18 + 0.2);
    });
    tl.from('.mf-sign', { y: 30, opacity: 0, duration: 0.6 }, '-=0.2');
  })();

  /* =========================================================
     QUEM É
     ========================================================= */
  gsap.from('.about-photo', { y: 120, rotation: -14, scale: 0.86, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.about-visual', start: 'top 82%' } });
  gsap.fromTo('.about-photo img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.about-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.about-tags .tag').forEach(t => {
    const sp = parseFloat(t.dataset.speed || 0.5);
    gsap.fromTo(t, { y: 90 * sp }, { y: -90 * sp, ease: 'none', scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(t.firstElementChild, { scale: 0, rotation: -25, duration: 0.9, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.about-visual', start: 'top 60%' }, delay: sp * 0.3 });
  });
  gsap.from('.fact', { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.facts', start: 'top 88%' } });

  /* =========================================================
     NÚMEROS — zoom out + preenchimento do contorno
     ========================================================= */
  (() => {
    const countUp = b => {
      if (b.dataset.done) return;
      b.dataset.done = '1';
      const m = (b.dataset.count || '').match(/^([+]?)([\d.,]+)(.*)$/);
      if (!m) return;
      const dec = (m[2].split(',')[1] || '').length;
      const v = parseFloat(m[2].replace(/\./g, '').replace(',', '.'));
      const o = { n: 0 };
      gsap.to(o, { n: v, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = m[1] + o.n.toFixed(dec).replace('.', ',') + m[3]; } });
    };
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.numbers', start: 'top top', end: '+=150%', pin: '.nb-pin', scrub: 0.6 }
    });
    tl.fromTo('.nb-num', { scale: 2.8 }, { scale: 1, duration: 0.5, ease: 'power3.out' }, 0)
      .to('.nb-num', { backgroundSize: '100% 100%', duration: 0.42, ease: 'none' }, 0.12)
      .from('.numbers .eyebrow', { opacity: 0, y: -20, duration: 0.15 }, 0.3)
      .from('.nb-sub', { y: 24, opacity: 0, duration: 0.15 }, 0.45)
      .from('.nb-cap', { y: 30, opacity: 0, duration: 0.18 }, 0.5)
      .call(() => $$('.nb-stats b').forEach(countUp), null, 0.56)
      .from('.nb-stats', { y: 60, opacity: 0, duration: 0.2, ease: 'power2.out' }, 0.58)
      .from('.nb-ctas', { y: 24, opacity: 0, duration: 0.15 }, 0.72)
      .to({}, { duration: 0.15 });
  })();

  /* =========================================================
     QUADROS — scroll horizontal
     ========================================================= */
  (() => {
    const pinEl = $('.q-pin');
    const track = $('.q-track');
    const cards = $$('.q-card');
    const count = $('.q-count');
    const bar = $('.q-bar i');
    const dist = () => Math.max(0, track.scrollWidth - pinEl.clientWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.quadros',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: pinEl,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: self => {
          bar.style.scale = `${self.progress} 1`;
          const n = clamp(1, cards.length, Math.round(self.progress * (cards.length + 1)));
          count.textContent = `${String(n).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        }
      }
    });
    cards.forEach(card => {
      gsap.from(card, { rotation: 7, yPercent: 14, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 105%', end: 'left 55%', scrub: true } });
      gsap.fromTo($('.q-thumb img', card), { xPercent: -10 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    // inclinação por velocidade
    const skew = cards.map(c => gsap.quickTo(c, 'skewX', { duration: 0.6, ease: 'power3' }));
    const st = tween.scrollTrigger;
    let last = 0;
    gsap.ticker.add(() => {
      const v = st.isActive ? clamp(-6, 6, -vel() * 0.22) : 0;
      if (Math.abs(v - last) < 0.01) return;
      last = v;
      skew.forEach(f => f(v));
    });
    gsap.from('.q-intro > *', { y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.quadros', start: 'top 70%' } });
  })();

  /* =========================================================
     VÍDEOS
     ========================================================= */
  gsap.from('.reel figure', { yPercent: 28, rotationX: -38, opacity: 0, stagger: 0.09, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.reel-grid', start: 'top 86%' } });
  mm.add('(min-width: 768px)', () => {
    const ys = [-50, 40, -90, 30, -60];
    $$('.reel').forEach((r, i) => gsap.fromTo(r, { y: -ys[i] * 0.6 }, { y: ys[i], ease: 'none', scrollTrigger: { trigger: '.reel-grid', start: 'top bottom', end: 'bottom top', scrub: true } }));
  });

  /* =========================================================
     PODCAST — zoom no scroll
     ========================================================= */
  gsap.fromTo('.pod-media', { scale: 0.74, rotation: -5 }, { scale: 1, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.pod-media', start: 'top 98%', end: 'center 55%', scrub: 0.6 } });
  gsap.fromTo('.pod-media-in img', { scale: 1.4 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.pod-media', start: 'top 98%', end: 'center 55%', scrub: 0.6 } });
  gsap.from('.pod-ill', { scale: 0, rotation: -120, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.pod-copy', start: 'top 82%' } });
  gsap.from('.pod-proof li', { y: 20, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.pod-proof', start: 'top 92%' } });

  /* =========================================================
     PUBLIS
     ========================================================= */
  gsap.from('.case', { y: 90, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.case', start: 'top 86%' } });
  gsap.fromTo('.phone', {
    xPercent: i => [108, 0, -108][i],
    yPercent: i => [8, -6, 8][i],
    rotation: i => [-11, 0, 11][i]
  }, {
    xPercent: 0, yPercent: 0, rotation: 0, ease: 'none',
    scrollTrigger: { trigger: '.case-phones', start: 'top 95%', end: 'top 42%', scrub: 0.6 }
  });
  gsap.to('.seal svg', { rotation: 360, ease: 'none', scrollTrigger: { trigger: '.case', start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
  gsap.from('.seal', { scale: 0, rotation: -90, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.case', start: 'top 70%' } });
  $$('.logo-row').forEach(r => marquee($('.logo-track', r), parseFloat(r.dataset.dir) || -1, 34));
  gsap.from('.brands-t', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.brands', start: 'top 88%' } });

  /* =========================================================
     GALERIA — túnel 3D
     ========================================================= */
  (() => {
    const stage = $('.gl-stage');
    const world = $('.gl-world');
    const items = $$('.gl-item');
    const head = $('.gl-head');
    const iEl = $('.gl-i');
    const capEl = $('.gl-cap');
    const N = items.length;
    const pat = [[-1, -0.2, -5], [0.95, 0.25, 4], [-0.35, 0.5, -2], [0.62, -0.5, 3], [-0.92, 0.42, 6], [0.82, -0.12, -4], [-0.58, -0.58, 2], [0.32, 0.56, -3], [-1, 0.06, 4], [1, -0.42, -5]];
    // brilhinhos espalhados no espaço
    const sparks = [];
    for (let k = 0; k < 26; k++) {
      const s = document.createElement('span');
      s.className = 'gl-spk';
      s.textContent = '✦';
      s.style.color = sparkCols[k % 3];
      world.appendChild(s);
      sparks.push({ el: s, rx: Math.random() * 2 - 1, ry: Math.random() * 2 - 1, rz: Math.random() });
    }
    let GAP = 700;
    let total = 1;
    const P = { p: 0 };
    const look = { rx: 0, ry: 0 };
    let current = -1;

    function layout() {
      const vw = innerWidth;
      const vh = innerHeight;
      const mobile = vw < 768;
      GAP = mobile ? 560 : 720;
      const SX = mobile ? vw * 0.2 : vw * 0.25;
      const SY = mobile ? vh * 0.14 : vh * 0.15;
      total = (N + 0.7) * GAP;
      items.forEach((it, i) => {
        const last = i === N - 1;
        // o último (a ilustração) termina centralizado, de frente, no fim do scroll
        const p = last ? [0, 0, 0] : pat[i % pat.length];
        it._z = last ? -total : -(i + 1) * GAP;
        it.style.transform = `translate3d(${(p[0] * SX).toFixed(1)}px,${(p[1] * SY).toFixed(1)}px,${it._z}px) rotate(${p[2]}deg)`;
      });
      sparks.forEach(s => {
        s._z = -s.rz * (N + 1) * GAP;
        s.el.style.transform = `translate3d(${(s.rx * vw * 0.55).toFixed(1)}px,${(s.ry * vh * 0.48).toFixed(1)}px,${s._z.toFixed(1)}px)`;
      });
      total = (N + 0.7) * GAP;
      render();
    }

    const fade = z => clamp(0, 1, (z + 4.3 * GAP) / (1.3 * GAP)) * (1 - clamp(0, 1, (z - 120) / 520));

    function render() {
      const cam = P.p * total;
      world.style.transform = `rotateX(${look.ry.toFixed(2)}deg) rotateY(${look.rx.toFixed(2)}deg) translate3d(0,0,${cam.toFixed(1)}px)`;
      let best = 1e9;
      let near = 0;
      const gate = clamp(0, 1, (P.p * N - 0.12) / 0.6);
      items.forEach((it, i) => {
        const z = it._z + cam;
        const o = fade(z) * gate;
        it.style.opacity = o.toFixed(3);
        it.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        const d = Math.abs(z - 160);
        if (d < best) { best = d; near = i; }
      });
      sparks.forEach(s => {
        const o = fade(s._z + cam);
        s.el.style.opacity = o.toFixed(3);
        s.el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      });
      const hp = clamp(0, 1, (P.p * N) / 1.1);
      head.style.opacity = (1 - hp).toFixed(3);
      head.style.transform = `scale(${(1 + hp * 1.6).toFixed(3)})`;
      head.style.visibility = hp >= 1 ? 'hidden' : 'visible';
      if (near !== current) {
        current = near;
        iEl.textContent = String(near + 1).padStart(2, '0');
        capEl.textContent = $('figcaption', items[near]).textContent;
      }
    }

    layout();
    gsap.to(P, {
      p: 1,
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: '.gallery',
        start: 'top top',
        end: () => '+=' + Math.round(N * innerHeight * 0.34),
        pin: '.gl-pin',
        scrub: 1,
        invalidateOnRefresh: true,
        onRefresh: layout
      }
    });
    // leve inclinação da câmera com o ponteiro
    if (fine) {
      const rx = gsap.quickTo(look, 'rx', { duration: 1.2, ease: 'power3', onUpdate: render });
      const ry = gsap.quickTo(look, 'ry', { duration: 1.2, ease: 'power3', onUpdate: render });
      stage.parentElement.addEventListener('pointermove', e => {
        rx((e.clientX / innerWidth - 0.5) * 7);
        ry((e.clientY / innerHeight - 0.5) * -5);
      });
    }
  })();

  /* =========================================================
     LOJINHA
     ========================================================= */
  gsap.from('.shop-card', { y: 90, rotation: 2, opacity: 0, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.shop-card', start: 'top 86%' } });
  gsap.from('.shop-items figure', { y: 90, rotation: i => [-30, 12, 34][i], opacity: 0, stagger: 0.1, duration: 1.1, ease: 'back.out(1.5)', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.shop-card', start: 'top 72%' } });
  gsap.from('.seal-sm', { scale: 0, rotation: -120, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.shop-card', start: 'top 60%' } });

  /* =========================================================
     CONTATO + RODAPÉ
     ========================================================= */
  (() => {
    const { chars } = split($('.ct-title'), 'chars');
    gsap.from(chars, { yPercent: 120, scale: 0.4, rotation: () => gsap.utils.random(-40, 40), opacity: 0, stagger: 0.05, duration: 1.3, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: '.ct-title', start: 'top 82%' } });
    gsap.from('.ct-ill', { x: 220, rotation: 50, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 55%' } });
    gsap.to('.ct-ill', { y: -80, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.ct-mail, .ct-agency', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.ct-mail', start: 'top 92%' } });
    gsap.from('.ct-social li', { y: 30, opacity: 0, rotation: () => gsap.utils.random(-12, 12), stagger: 0.05, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: '.ct-social', start: 'top 95%' } });
    const g = split($('.foot-giant'), 'chars');
    gsap.from(g.chars, { yPercent: 100, stagger: 0.03, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
  })();

  /* ---------- títulos com letras ---------- */
  $$('.split-chars').forEach(el => {
    if (el.classList.contains('ct-title')) return;
    const { chars } = split(el, 'chars');
    gsap.from(chars, { yPercent: 110, rotation: 10, opacity: 0, stagger: 0.022, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });

  /* ---------- revelar parágrafos ---------- */
  gsap.set('[data-reveal]', { y: 36, opacity: 0 });
  const reveal = els => gsap.to(els, { y: 0, opacity: 1, stagger: 0.08, duration: 1.1, ease: 'expo.out', overwrite: true });
  ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', onEnter: reveal, onEnterBack: reveal, onLeave: reveal });

  /* ---------- capítulos de cor ---------- */
  const night = $('.bg-night');
  const pink = $('.bg-pink');
  const stA = ScrollTrigger.create({ trigger: '#publis', start: 'top 85%', end: 'top 35%' });
  const stB = ScrollTrigger.create({ trigger: '#lojinha', start: 'top 95%', end: 'top 45%' });
  const stC = ScrollTrigger.create({ trigger: '#contato', start: 'top 92%', end: 'top 40%' });
  const chapters = () => {
    night.style.opacity = (stA.progress * (1 - stB.progress)).toFixed(3);
    pink.style.opacity = stC.progress.toFixed(3);
  };
  ScrollTrigger.addEventListener('refresh', chapters);

  /* ---------- holográfico reage ao scroll ---------- */
  gsap.to('.bg-holo', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1 } });

  /* ---------- nav, HUD e seção ativa ---------- */
  const nav = $('.nav');
  const hud = $('.hud');
  const hudSec = $('.hud-sec');
  const hudBar = $('.hud-bar i');
  const hudPct = $('.hud-pct');
  const navLinks = $$('.nav-links a[href^="#"]');
  const onScroll = () => {
    const y = lenis ? lenis.scroll : scrollY;
    const max = lenis ? lenis.limit : document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(0, 1, y / max) : 0;
    const dir = lenis ? lenis.direction : 0;
    nav.classList.toggle('is-hidden', dir === 1 && y > 320 && menu.hidden);
    hudBar.style.scale = `${p} 1`;
    hudPct.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`;
    chapters();
  };
  if (lenis) lenis.on('scroll', onScroll);
  else addEventListener('scroll', onScroll, { passive: true });

  $$('[data-sec]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: self => {
        if (!self.isActive) return;
        hudSec.textContent = sec.dataset.sec;
        hud.classList.toggle('is-off', sec.id === 'top');
        if (sec.id) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + sec.id));
        else if (sec.classList.contains('manifesto')) navLinks.forEach(a => a.classList.remove('is-active'));
      }
    });
  });

  /* ---------- cursor ---------- */
  if (fine) {
    root.classList.add('has-cursor');
    const cur = $('.cursor');
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    gsap.set(cur, { opacity: 0 });
    addEventListener('pointermove', e => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      if (cur._hidden !== false) { cur._hidden = false; gsap.to(cur, { opacity: 1, duration: 0.3 }); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { cur._hidden = true; gsap.to(cur, { opacity: 0, duration: 0.3 }); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      const h = e.target.closest('a, button');
      cur.classList.toggle('is-label', !!t);
      if (t) label.textContent = t.dataset.cursor;
      cur.classList.toggle('is-hover', !!h && !t);
    });
  }

  /* =========================================================
     LOADER → INTRO
     ========================================================= */
  function runLoader() {
    return new Promise(resolve => {
      const L = $('.loader');
      if (!L) { resolve(); return; }
      const lines = $$('.ld-line', L);
      const bar = $('.ld-bar span', L);
      const pct = $('.ld-pct span', L);
      const heroImg = $('.hero-media img');
      const o = { v: 0 };
      const setV = () => {
        pct.textContent = String(Math.round(o.v)).padStart(3, '0');
        bar.style.scale = `${o.v / 100} 1`;
      };
      const imgReady = heroImg.complete ? Promise.resolve() : new Promise(r => {
        heroImg.addEventListener('load', r, { once: true });
        heroImg.addEventListener('error', r, { once: true });
      });
      const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
      const ready = Promise.race([Promise.all([imgReady, fontsReady]), new Promise(r => setTimeout(r, 3800))]);
      const tl = gsap.timeline();
      tl.to(lines, { opacity: 1, duration: 0.01, stagger: 0.32 })
        .to(o, { v: 82, duration: 1.2, ease: 'power2.inOut', onUpdate: setV }, 0);
      Promise.all([ready, tl.then()]).then(() => {
        gsap.timeline({ onComplete: () => L.remove() })
          .to(o, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: setV })
          .to('.loader-win', { scale: 0.92, opacity: 0, duration: 0.45, ease: 'power3.in' }, '+=0.12')
          .to(L, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
          .add(resolve, '-=0.65');
      });
    });
  }

  runLoader().then(() => {
    document.body.classList.remove('is-loading');
    ScrollTrigger.refresh();
    hero.measure();
    const it = hero.intro();
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      if (lenis) lenis.start();
      if (startHash && startHash.length > 1 && startHash !== '#top') {
        const t = $(startHash);
        if (t && lenis) lenis.scrollTo(t, { duration: 1.6 });
      }
    };
    it.eventCallback('onComplete', go);
    setTimeout(go, 2200);
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
