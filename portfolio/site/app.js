/* Portfolio site. Each HTML page is a shell with <main data-page="...">; this file renders it from data.js.
   Includes the synced A/B audio player and the live panning demo. */
(function () {
  const D = window.PORTFOLIO, META = window.AUDIO_META || {};
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) n.append(k);
    return n;
  };
  const ICON = {
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
  };
  const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ---------------------------------------------------------------- player
  // All versions in a set play at once; only the selected one is audible, so switching keeps your place.
  const players = [];
  const USE_WEB_AUDIO = location.protocol.startsWith('http') && !!(window.AudioContext || window.webkitAudioContext);
  let sharedCtx;
  const audioContext = () => sharedCtx || (sharedCtx = new (window.AudioContext || window.webkitAudioContext)());
  class Player {
    constructor(set) {
      this.set = set;
      this.clips = set.clips.filter(c => META[c.id]);
      this.active = set.start != null ? set.start : (this.clips.length > 1 ? 1 : 0); // open on the processed version
      this.audios = null;
      this.playing = false;
      this.match = set.match !== false; // level-matched unless the set opts out
      this.build();
      players.push(this);
    }
    get meta() { return META[this.clips[this.active].id]; }
    build() {
      this.btn = el('button', { class: 'play', 'aria-label': 'Play ' + this.set.title, html: ICON.play, onclick: () => this.toggle() });
      this.time = el('span', { class: 'p-time' }, '0:00 / ' + fmt(this.meta.dur));
      this.canvas = el('canvas', { class: 'wave', role: 'slider', tabindex: '0', 'aria-label': 'Seek', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0',
        onclick: e => this.seek((e.clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth),
        onkeydown: e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); this.seek(this.pos() + (e.key === 'ArrowRight' ? 0.05 : -0.05)); }
        } });
      this.root = el('div', { class: 'player' },
        el('div', { class: 'p-head' }, this.btn,
          el('div', {}, el('div', { class: 'p-title' }, this.set.title), this.set.note ? el('div', { class: 'p-note' }, this.set.note) : null),
          this.time),
        this.canvas);
      if (this.clips.length > 1) {
        this.tabs = this.clips.map((c, i) => el('button', { 'aria-pressed': String(i === this.active), onclick: () => this.select(i) },
          el('span', { class: 'key' }, String(i + 1)), c.label));
        const box = el('input', { type: 'checkbox', onchange: e => { this.match = e.target.checked; this.applyGains(); } });
        box.checked = this.match;
        this.root.append(el('div', { class: 'ab', role: 'group', 'aria-label': 'Version' }, this.tabs,
          el('label', { class: 'match', title: 'Plays every version at the same RMS level' }, box, 'Level-match')));
        this.root.addEventListener('keydown', e => {
          const i = parseInt(e.key, 10) - 1;
          if (i >= 0 && i < this.clips.length) this.select(i);
        });
      }
      new ResizeObserver(() => this.draw()).observe(this.canvas);
    }
    // Two playback engines.
    //  - Web Audio (when the page is served over http): every version is decoded into memory and all of them
    //    start on the same audio-clock tick, so they stay sample-aligned and switching is only a gain change.
    //  - Media elements (when opened as a local file, where fetch is blocked): one <audio> per version, kept
    //    within a few milliseconds of each other by resync().
    url(c) {
      // the query string changes whenever a clip is re-cut, so browsers never mix an old cached version with a new one
      const m = META[c.id];
      return 'audio/' + c.id + '.wav?v=' + encodeURIComponent(m.dur + '_' + m.rms + '_' + m.peaks.slice(0, 8).join(''));
    }
    async load() {
      if (this.ready) return;
      if (!this.loading) this.loading = (async () => {
        if (USE_WEB_AUDIO) {
          try {
            const ctx = audioContext();
            this.buffers = await Promise.all(this.clips.map(c =>
              fetch(this.url(c)).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b))));
            this.nodes = this.clips.map(() => { const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination); return g; });
            this.offset = 0;
          } catch (e) { this.buffers = null; }
        }
        if (!this.buffers) {
          this.audios = this.clips.map(c => { const a = new Audio(this.url(c)); a.preload = 'auto'; return a; });
          this.audios[0].addEventListener('ended', () => this.stop(true));
        }
        this.ready = true;
        this.applyGains();
      })();
      this.root.classList.add('is-loading');
      await this.loading;
      this.root.classList.remove('is-loading');
    }
    gains() {
      if (!this.match) return this.clips.map(() => 1);
      const rms = this.clips.map(c => META[c.id].rms), floor = Math.min(...rms);
      return rms.map(r => Math.pow(10, (floor - r) / 20));
    }
    applyGains() {
      if (!this.ready) return;
      const g = this.gains();
      if (this.buffers) {
        const t = audioContext().currentTime;
        this.nodes.forEach((n, i) => n.gain.setTargetAtTime(i === this.active ? g[i] : 0, t, 0.004)); // short ramp, no click
      } else {
        this.audios.forEach((a, i) => { a.volume = i === this.active ? g[i] : 0; });
      }
    }
    select(i) {
      this.active = i;
      this.tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(i === j)));
      this.applyGains();
      this.draw();
    }
    // Media-element engine only: pull the silent versions back onto the audible one.
    resync(tolerance) {
      if (!this.audios) return;
      const t = this.audios[this.active].currentTime;
      this.audios.forEach((a, j) => { if (j !== this.active && Math.abs(a.currentTime - t) > tolerance) a.currentTime = t; });
    }
    // Web Audio engine: start every version at the same instant, from the same offset.
    startSources() {
      const ctx = audioContext(), at = ctx.currentTime + 0.03;
      this.sources = this.buffers.map((b, i) => {
        const s = ctx.createBufferSource();
        s.buffer = b;
        s.connect(this.nodes[i]);
        s.start(at, Math.min(this.offset, b.duration - 0.01));
        return s;
      });
      this.startedAt = at - this.offset;
    }
    stopSources() {
      (this.sources || []).forEach(s => { try { s.stop(); } catch (e) { /* already stopped */ } s.disconnect(); });
      this.sources = null;
    }
    toggle() { this.playing ? this.stop(false) : this.play(); }
    async play() {
      players.forEach(p => p !== this && p.playing && p.stop(false));
      if (window.PanDemo) window.PanDemo.stop();
      if (USE_WEB_AUDIO) audioContext().resume(); // must happen inside the click
      this.playing = true;
      this.btn.innerHTML = ICON.pause;
      this.root.classList.add('is-playing');
      await this.load();
      if (!this.playing) return; // stopped while loading
      if (this.buffers) this.startSources();
      else {
        const t = this.audios[this.active].currentTime;
        this.audios.forEach(a => { a.currentTime = t; a.play().catch(() => {}); });
      }
      let last = 0;
      const tick = now => {
        if (!this.playing) return;
        if (this.buffers && this.pos() >= 1) return this.stop(true);
        if (now - last > 400) { last = now; this.resync(0.012); }
        this.draw();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    stop(rewind) {
      if (this.buffers) {
        this.offset = rewind ? 0 : Math.min(this.pos(), 0.999) * this.meta.dur;
        this.stopSources();
      } else if (this.audios) {
        this.audios.forEach(a => { a.pause(); if (rewind) a.currentTime = 0; });
      }
      this.playing = false;
      this.btn.innerHTML = ICON.play;
      this.root.classList.remove('is-playing');
      this.draw();
    }
    pos() {
      if (this.buffers) return (this.sources ? audioContext().currentTime - this.startedAt : this.offset) / this.meta.dur;
      return this.audios ? this.audios[this.active].currentTime / this.meta.dur : 0;
    }
    async seek(f) {
      await this.load();
      const t = Math.max(0, Math.min(0.999, f)) * this.meta.dur;
      if (this.buffers) {
        this.offset = t;
        if (this.playing) { this.stopSources(); this.startSources(); }
      } else {
        this.audios.forEach(a => { a.currentTime = t; });
      }
      this.draw();
    }
    draw() {
      const c = this.canvas, dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
      if (!w) return;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext('2d'), peaks = this.meta.peaks, f = Math.max(0, Math.min(1, this.pos()));
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const top = Math.max(...peaks, 1), step = w / peaks.length, bar = Math.max(1, step - 1);
      const played = css('--accent'), rest = css('--wave');
      peaks.forEach((p, i) => {
        const bh = Math.max(1.5, (p / top) * (h - 4));
        g.fillStyle = i / peaks.length < f ? played : rest;
        g.fillRect(i * step, (h - bh) / 2, bar, bh);
      });
      this.time.textContent = fmt(f * this.meta.dur) + ' / ' + fmt(this.meta.dur);
      c.setAttribute('aria-valuenow', String(Math.round(f * 100)));
    }
  }
  // An audio list entry is either a set of clips or { heading } to label the sets that follow.
  const playerFor = set => set.heading ? el('h3', { class: 'audio-head' }, set.heading) : new Player(set).root;

  // ---------------------------------------------------------------- hybrid pan demo
  // A browser sketch of the plugin's three panning laws. The plugin uses a Lagrange-3 fractional delay;
  // here a Web Audio DelayNode stands in for it.
  function panDemo() {
    let ctx, src, gL, gR, dL, dR, buffer, playing = false;
    const state = { mode: 'HYBD', pan: 0.5, max: 0.3 };
    const btn = el('button', { class: 'play', 'aria-label': 'Play panning demo', html: ICON.play, onclick: toggle });
    const modes = ['ICLD', 'ICTD', 'HYBD'].map(m => el('button', { 'aria-pressed': String(m === state.mode), onclick: () => { state.mode = m; sync(); } }, m));
    const panOut = el('output'), maxOut = el('output'), lvl = el('b'), tim = el('b');
    const pan = el('input', { type: 'range', min: '-1', max: '1', step: '0.01', value: String(state.pan), id: 'pan', oninput: e => { state.pan = +e.target.value; sync(); } });
    const max = el('input', { type: 'range', min: '0', max: '2', step: '0.05', value: String(state.max), id: 'maxictd', oninput: e => { state.max = +e.target.value; sync(); } });
    const root = el('div', { class: 'demo' },
      el('div', { class: 'p-head' }, btn, el('div', {}, el('h4', {}, 'Live demo: three ways to pan'),
        el('p', {}, 'Level only, time only, or both. Listen for how the image and its depth change. Headphones or well-placed speakers.'))),
      el('div', { class: 'ab', role: 'group', 'aria-label': 'Panning law' }, modes),
      el('div', { class: 'row' }, el('label', { for: 'pan' }, 'Pan'), pan, panOut),
      el('div', { class: 'row' }, el('label', { for: 'maxictd' }, 'Max ICTD'), max, maxOut),
      el('div', { class: 'readout' }, el('div', {}, 'Level difference', lvl), el('div', {}, 'Time difference', tim)));

    function law() {
      const p = state.pan, useL = state.mode !== 'ICTD', useT = state.mode !== 'ICLD';
      const theta = (p + 1) * Math.PI / 4;
      const l = useL ? Math.cos(theta) : Math.SQRT1_2, r = useL ? Math.sin(theta) : Math.SQRT1_2;
      const dt = useT ? Math.abs(p) * state.max / 1000 : 0; // seconds, applied to the far channel
      return { l, r, delayL: p > 0 ? dt : 0, delayR: p < 0 ? dt : 0, dt };
    }
    function sync() {
      modes.forEach(b => b.setAttribute('aria-pressed', String(b.textContent === state.mode)));
      const k = law();
      panOut.textContent = state.pan === 0 ? 'C' : Math.round(Math.abs(state.pan) * 100) + (state.pan < 0 ? ' L' : ' R');
      maxOut.textContent = state.max.toFixed(2) + ' ms';
      const db = 20 * Math.log10(Math.max(k.r, 1e-4) / Math.max(k.l, 1e-4));
      lvl.textContent = Math.abs(db) > 60 ? (db > 0 ? '+∞ dB' : '-∞ dB') : (db >= 0 ? '+' : '') + db.toFixed(1) + ' dB';
      tim.textContent = (k.dt * 1000).toFixed(2) + ' ms';
      if (!ctx) return;
      const t = ctx.currentTime;
      gL.gain.setTargetAtTime(k.l, t, 0.02); gR.gain.setTargetAtTime(k.r, t, 0.02);
      dL.delayTime.setTargetAtTime(k.delayL, t, 0.02); dR.delayTime.setTargetAtTime(k.delayR, t, 0.02);
    }
    async function start() {
      players.forEach(p => p.playing && p.stop(false));
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const bin = atob(window.DEMO_CLIP), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        buffer = await ctx.decodeAudioData(bytes.buffer);
        gL = ctx.createGain(); gR = ctx.createGain();
        dL = ctx.createDelay(0.01); dR = ctx.createDelay(0.01);
        const merge = ctx.createChannelMerger(2);
        gL.connect(dL).connect(merge, 0, 0); gR.connect(dR).connect(merge, 0, 1);
        merge.connect(ctx.destination);
      }
      await ctx.resume();
      src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
      src.connect(gL); src.connect(gR); src.start();
      playing = true; btn.innerHTML = ICON.pause; sync();
    }
    function stop() { if (!playing) return; src.stop(); playing = false; btn.innerHTML = ICON.play; }
    function toggle() { playing ? stop() : start(); }
    window.PanDemo = { stop };
    sync();
    return root;
  }

  // ---------------------------------------------------------------- shared pieces
  const P = D.person;
  const byId = Object.fromEntries(D.projects.map(p => [p.id, p]));
  const catLabel = Object.fromEntries(D.categories.map(c => [c.id, c.label]));
  const pageOf = p => D.pages.find(pg => pg.cats && pg.cats.includes(p.cat));
  const hrefOf = p => pageOf(p).file + '#' + p.id;
  const ext = (label, href, cls) => el('a', { class: 'btn' + (cls ? ' ' + cls : ''), href, target: '_blank', rel: 'noopener' }, label);
  const pageHead = pg => el('section', { class: 'page-head' }, el('h1', {}, pg.heading), el('p', { class: 'lede' }, pg.intro));
  // credit text, with any URL in it made clickable
  const credit = text => el('p', { class: 'credit' }, text.split(/(https?:\/\/[^\s]+)/).map(part =>
    /^https?:\/\//.test(part) ? el('a', { href: part, target: '_blank', rel: 'noopener' }, part.replace(/^https?:\/\//, '').replace(/\/$/, '')) : part));
  const figure = im => el('figure', {},
    el('a', { href: 'img/' + im.src, target: '_blank', rel: 'noopener' }, el('img', { src: 'img/' + im.src, alt: im.cap, loading: 'lazy' })),
    el('figcaption', {}, im.cap));

  function projectArticle(p) {
    const imgs = p.images || [];
    const text = el('div', {},
      el('div', { class: 'meta' }, (p.kind || catLabel[p.cat]) + ' · ' + p.period),
      el('h2', {}, p.title),
      el('p', { class: 'role' }, p.role),
      el('p', { class: 'summary' }, p.summary),
      el('ul', {}, p.points.map(t => el('li', {}, t))),
      p.extra ? el('p', { class: 'extra' }, p.extra) : null,
      el('div', { class: 'tags' }, p.stack.map(s => el('span', { class: 'tag' }, s))),
      el('div', { class: 'links' },
        (p.links || []).map(l => ext(l.label, l.href)),
        (p.docs || []).map(d => ext(d.label, 'docs/' + d.file))),
      p.table ? el('div', { class: 'tablewrap' }, el('h3', {}, p.table.title), el('table', {},
        el('thead', {}, el('tr', {}, p.table.head.map(h => el('th', {}, h)))),
        el('tbody', {}, p.table.rows.map(r => el('tr', {}, r.map(c => el('td', {}, c))))))) : null);
    const media = el('div', { class: 'media' },
      p.demo === 'hybrid-pan' ? panDemo() : null,
      (p.audio || []).map(playerFor),
      p.credit ? credit(p.credit) : null,
      imgs.slice(0, 1).map(figure),
      imgs.length > 1 ? el('div', { class: 'gallery' }, imgs.slice(1).map(figure)) : null);
    return el('article', { class: 'project', id: p.id }, text, media);
  }

  // Compact card for coursework projects (no media).
  const miniCard = p => el('article', { class: 'mini', id: p.id },
    el('div', { class: 'meta' }, p.period),
    el('h3', {}, p.title),
    el('p', { class: 'role' }, p.role),
    el('p', {}, p.summary),
    el('ul', {}, p.points.map(t => el('li', {}, t))),
    el('div', { class: 'tags' }, p.stack.map(s => el('span', { class: 'tag' }, s))));

  // ---------------------------------------------------------------- pages
  // append that accepts nested arrays and skips empty values
  const put = (node, ...kids) => { for (const k of kids.flat(Infinity)) if (k != null && k !== false) node.append(k); };
  const render = {
    home(main) {
      const areas = D.pages.filter(pg => pg.cats);
      put(main, 
        el('section', { class: 'hero' },
          el('p', { class: 'eyebrow' }, 'Audio engineering · DSP · spatial audio'),
          el('h1', {}, P.tagline + '.'),
          el('p', { class: 'lede' }, P.intro),
          el('div', { class: 'cta' },
            el('a', { class: 'btn primary', href: 'listen.html' }, 'Listen to the work'),
            ext('Church acoustics web app', P.links.church), ext('AES paper', P.links.aes), ext('GitHub', P.links.github))),
        el('section', { class: 'band' },
          el('div', { class: 'band-head' }, el('h2', {}, 'Start by listening'), el('a', { href: 'listen.html' }, 'All audio →')),
          el('div', { class: 'players' },
            playerFor(byId['samba-funk'].audio[0]), playerFor(byId['ir-modeling'].audio[0]), playerFor(byId['mastering'].audio[0]))),
        el('section', { class: 'band' },
          el('h2', {}, 'The work'),
          el('div', { class: 'cards' }, areas.map(pg => el('a', { class: 'card', href: pg.file },
            el('h3', {}, pg.heading),
            el('p', {}, pg.intro),
            el('ul', {}, D.projects.filter(p => pg.cats.includes(p.cat) && p.cat !== 'cs').map(p => el('li', {}, p.short))),
            el('span', { class: 'more' }, 'Open ' + pg.nav + ' →'))))),
        el('section', { class: 'band contact' },
          el('h2', {}, 'Contact'),
          el('p', { class: 'lede' }, 'Open to technical roles in audio, media and audio software.'),
          el('div', { class: 'cta' }, el('a', { class: 'btn primary', href: 'mailto:' + P.email }, P.email), ext('LinkedIn', P.links.linkedin), el('a', { class: 'btn', href: 'about.html' }, 'About me'))));
    },

    listen(main, pg) {
      const groups = [
        { id: 'recordings', title: 'Recordings and mixes', projects: ['samba-funk', 'studio-ops'] },
        { id: 'mastering', title: 'Mastering', projects: ['mastering'] },
        { id: 'mixing', title: 'Mixing coursework: technique studies', projects: ['mix-techniques'] },
        { id: 'dsp', title: 'DSP I wrote', projects: ['matlab-dsp'], extra: el('p', { class: 'sub' }, 'There is also a ', el('a', { href: 'dsp.html#hybrid-pan' }, 'live panning demo'), ' of my Hybrid Pan plugin on the DSP page.') },
        { id: 'spaces', title: 'Rooms and hardware, measured', projects: ['aural-heritage', 'ir-modeling'] },
      ];
      put(main, pageHead(pg),
        el('nav', { class: 'toc', 'aria-label': 'On this page' }, groups.map(g => el('a', { class: 'chip', href: '#' + g.id }, g.title))),
        groups.map(g => el('section', { class: 'band', id: g.id },
          el('h2', {}, g.title), g.extra,
          g.projects.map(id => byId[id]).map(p => el('div', { class: 'listen-block' },
            el('div', { class: 'band-head' }, el('h3', {}, p.short), el('a', { href: hrefOf(p) }, 'Read the case study →')),
            el('div', { class: 'players' }, p.audio.map(playerFor)),
            p.credit ? credit(p.credit) : null)))));
    },

    category(main, pg) {
      const all = D.projects.filter(p => pg.cats.includes(p.cat));
      const full = all.filter(p => p.cat !== 'cs'), mini = all.filter(p => p.cat === 'cs');
      put(main, pageHead(pg),
        el('nav', { class: 'toc', 'aria-label': 'On this page' },
          full.map(p => el('a', { class: 'chip', href: '#' + p.id }, p.short)),
          mini.length ? el('a', { class: 'chip', href: '#foundations' }, catLabel.cs) : null),
        el('div', { class: 'projects' }, full.map(projectArticle)),
        mini.length ? el('section', { class: 'band', id: 'foundations' },
          el('h2', {}, catLabel.cs),
          el('p', { class: 'sub' }, 'Undergraduate work at UT Arlington and Green River College. Less glamorous than a plugin, but it is why I am comfortable anywhere between a microcontroller and a web app.'),
          el('div', { class: 'minis' }, mini.map(miniCard))) : null);
    },

    about(main) {
      put(main, 
        el('section', { class: 'page-head about' },
          el('img', { class: 'portrait', src: 'img/headshot.jpg', alt: 'Kritan Duwal' }),
          el('h1', {}, 'About'),
          el('p', { class: 'lede' }, 'I came to audio through code. After a computer science degree and three years building financial software, I went back to school to study how sound actually works: signal processing, acoustics, perception, and the craft of recording.'),
          el('p', { class: 'lede' }, 'That mix is what I bring to a team. I can sit at a console and get a good recording, take a measurement and know whether to trust it, and then write the tool that turns it into something other people can use.'),
          el('div', { class: 'cta' }, el('a', { class: 'btn primary', href: 'mailto:' + P.email }, P.email), ext('LinkedIn', P.links.linkedin), ext('GitHub', P.links.github))),
        el('section', { class: 'band about-grid' },
          el('div', {},
            el('h2', {}, 'Experience'),
            D.experience.map(x => el('div', { class: 'row-item' },
              el('b', {}, x.title + ', ' + x.org.split(',')[0]), el('span', {}, x.dates),
              el('ul', {}, x.bullets.filter(b => !b.alt).map(b => el('li', {}, b.text))))),
            el('h2', { style: 'margin-top:40px' }, 'Education'),
            P.education.map(e => el('div', { class: 'row-item' }, el('b', {}, e.degree), el('span', {}, e.school + ' · ' + e.dates), el('p', { class: 'courses' }, e.courses)))),
          el('div', {},
            el('h2', {}, 'Skills'),
            D.skillBank.filter(s => !['Soft skills', 'Data'].includes(s.group)).map(s => el('p', { class: 'skill' }, el('b', {}, s.group), s.items)))));
    },
  };

  const main = $('main'), page = D.pages.find(pg => pg.id === main.dataset.page);
  (render[page.id] || render.category)(main, page);
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();
