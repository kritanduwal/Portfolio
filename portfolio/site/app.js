/* Portfolio site. Each HTML page is a shell with <main data-page="...">; this file renders it from data.js.
   Includes the synced A/B audio player and the Hybrid Pan mixer. */
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
      this.clips = set.clips.filter(c => c.meta || META[c.id]); // a clip rendered in the page carries its own meta and buffer
      this.active = set.start != null ? set.start : (this.clips.length > 1 ? 1 : 0); // open on the processed version
      this.audios = null;
      this.playing = false;
      this.match = set.match !== false; // level-matched unless the set opts out
      this.rendered = this.clips.length > 0 && this.clips.every(c => c.buffer);
      this.build();
      players.push(this);
    }
    get meta() { const c = this.clips[this.active]; return c.meta || META[c.id]; }
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
          this.set.matched ? el('span', { class: 'match' }, this.set.matched) : el('label', { class: 'match', title: 'Plays every version at the same RMS level' }, box, 'Level-match')));
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
        if (this.rendered) this.buffers = this.clips.map(c => c.buffer);
        else if (USE_WEB_AUDIO) {
          try {
            const ctx = audioContext();
            this.buffers = await Promise.all(this.clips.map(c =>
              fetch(this.url(c)).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b))));
          } catch (e) { this.buffers = null; }
        }
        if (this.buffers) {
          const ctx = audioContext();
          this.nodes = this.clips.map(() => { const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination); return g; });
          this.offset = 0;
        } else {
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
      if (USE_WEB_AUDIO || this.rendered) audioContext().resume(); // must happen inside the click
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

  // ---------------------------------------------------------------- hybrid pan mixer
  // The Hybrid Pan Mixer app, in the browser. Sources at the left, center and right positions are rendered as ICLD,
  // ICTD and HYBD mixes by hybrid-pan-mix.js (a port of the app's renderer) and played back through the A/B player.
  // Not ported: the coherence, phase and spectrum plots. Files are decoded at the audio context's sample rate.
  function panMixer(cfg) {
    const MAX_SECONDS = 60; // per file; the render runs on the main thread
    const state = { mode: 'freqsplit', crossover: 700, maxICTD: 0.3 };
    const positions = [['LEFT', -1], ['CENTER', 0], ['RIGHT', 1]].map(([name, pan]) => ({ name, pan,
      tracks: cfg.stems.filter(s => s.pos === name && META[s.id]).map(s => ({ label: s.label, url: 'audio/' + s.id + '.wav' })) }));
    let player, urls = [];

    const status = el('p', { class: 'mx-status', role: 'status' });
    const say = t => { status.textContent = t; };
    const results = el('div', { class: 'mx-results' });
    const renderBtn = el('button', { class: 'btn primary', onclick: render }, 'Render mixes');
    const modes = [['freqsplit', 'Freqsplit'], ['broadband', 'Broadband']].map(([id, label]) =>
      el('button', { 'aria-pressed': String(id === state.mode), onclick: () => { state.mode = id; sync(); } }, label));
    const xOut = el('output'), maxOut = el('output');
    const xover = el('input', { type: 'range', min: '100', max: '2000', step: '10', value: String(state.crossover), id: 'mx-xover', oninput: e => { state.crossover = +e.target.value; sync(); } });
    const max = el('input', { type: 'range', min: '0.01', max: '2', step: '0.01', value: String(state.maxICTD), id: 'mx-maxictd', oninput: e => { state.maxICTD = +e.target.value; sync(); } });
    const panText = p => p === 0 ? 'C' : Math.round(Math.abs(p) * 100) + (p < 0 ? ' L' : ' R');

    positions.forEach(p => {
      const id = 'mx-pan-' + p.name.toLowerCase();
      p.list = el('ul', { class: 'mx-files' });
      p.out = el('output');
      const input = el('input', { type: 'file', accept: 'audio/*', multiple: '', hidden: '', onchange: async e => { const files = [...e.target.files]; e.target.value = ''; await addFiles(p, files); } });
      p.root = el('div', { class: 'mx-pos' },
        el('div', { class: 'mx-pos-head' }, el('b', {}, p.name),
          el('button', { class: 'mx-btn', onclick: () => input.click() }, 'Add files'),
          el('button', { class: 'mx-btn', onclick: () => { p.tracks = []; sync(); } }, 'Clear'), input),
        el('div', { class: 'row' }, el('label', { for: id }, 'Pan'),
          el('input', { type: 'range', min: '-1', max: '1', step: '0.01', value: String(p.pan), id, oninput: e => { p.pan = +e.target.value; sync(); } }), p.out),
        p.list);
    });

    const root = el('div', { class: 'demo mixer' },
      el('h4', {}, 'Hybrid Pan Mixer, in your browser'),
      el('p', {}, 'The same sources rendered three ways: level differences only (ICLD), time differences only (ICTD), and the hybrid. The stems below are loaded for you, or add your own files. Headphones or well-placed speakers.'),
      positions.map(p => p.root),
      el('div', { class: 'ab', role: 'group', 'aria-label': 'HYBD mode' }, el('span', { class: 'mx-cap' }, 'HYBD mode'), modes),
      el('div', { class: 'row' }, el('label', { for: 'mx-xover' }, 'Crossover'), xover, xOut),
      el('div', { class: 'row' }, el('label', { for: 'mx-maxictd' }, 'Max ICTD'), max, maxOut),
      el('div', { class: 'mx-go' }, renderBtn, status),
      results,
      cfg.credit ? credit(cfg.credit) : null);

    function sync() {
      modes.forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0) === (state.mode === 'freqsplit'))));
      xover.disabled = state.mode !== 'freqsplit';
      xOut.textContent = state.mode === 'freqsplit' ? state.crossover + ' Hz' : 'n/a';
      maxOut.textContent = state.maxICTD.toFixed(2) + ' ms';
      positions.forEach(p => {
        p.out.textContent = panText(p.pan);
        p.list.replaceChildren(...(p.tracks.length ? p.tracks.map(t => el('li', {}, t.label)) : [el('li', { class: 'none' }, 'No files')]));
      });
    }

    // Each position takes mono sources, so stereo files are summed to mono, as in the app.
    function toMono(b) {
      const n = Math.min(b.length, Math.round(MAX_SECONDS * b.sampleRate)), x = new Float64Array(n), l = b.getChannelData(0);
      if (b.numberOfChannels === 1) x.set(l.subarray(0, n));
      else { const r = b.getChannelData(1); for (let i = 0; i < n; i++) x[i] = 0.5 * (l[i] + r[i]); }
      return x;
    }
    async function addFiles(p, files) {
      const skipped = [];
      for (const f of files) {
        try {
          const b = await audioContext().decodeAudioData(await f.arrayBuffer());
          if (b.numberOfChannels > 2) throw new Error('only mono and stereo files are supported');
          p.tracks.push({ label: f.name + (b.duration > MAX_SECONDS ? ' (first ' + MAX_SECONDS + ' s)' : ''), data: toMono(b) });
        } catch (e) { skipped.push(f.name); }
      }
      say(skipped.length ? 'Could not read ' + skipped.join(', ') + '.' : '');
      sync();
    }

    async function render() {
      const all = positions.flatMap(p => p.tracks.map(t => ({ t, p })));
      if (!all.length) return say('Add at least one audio file first.');
      const ctx = audioContext();
      renderBtn.disabled = true;
      try {
        say('Loading audio…');
        await Promise.all(all.map(async ({ t }) => {
          if (t.data) return;
          const res = await fetch(t.url);
          if (!res.ok) throw new Error(t.url);
          t.data = toMono(await ctx.decodeAudioData(await res.arrayBuffer()));
        }));
      } catch (e) {
        renderBtn.disabled = false;
        return say(USE_WEB_AUDIO ? 'Could not load the stems.' : 'The built-in stems only load when the site is served over http. Clear them and add your own files, or run npm start.');
      }
      say('Rendering…');
      await new Promise(r => setTimeout(r, 30)); // let the status paint before the main thread is busy
      const fs = ctx.sampleRate, t0 = performance.now();
      const r = window.HybridPanMix.render(all.map(a => a.t.data), all.map(a => a.p.pan), fs,
        { mode: state.mode, crossoverHz: state.crossover, maxICTDms: state.maxICTD });
      show(r, all, fs);
      renderBtn.disabled = false;
      say('Rendered ' + all.length + ' track' + (all.length > 1 ? 's' : '') + ' at ' + fs + ' Hz in ' + Math.round(performance.now() - t0) + ' ms.');
    }

    // 24-bit stereo WAV, the format the app writes.
    function wav(m, fs) {
      const n = m.left.length, v = new DataView(new ArrayBuffer(44 + n * 6));
      const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      str(0, 'RIFF'); v.setUint32(4, 36 + n * 6, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
      v.setUint32(24, fs, true); v.setUint32(28, fs * 6, true); v.setUint16(32, 6, true); v.setUint16(34, 24, true); str(36, 'data'); v.setUint32(40, n * 6, true);
      for (let i = 0, o = 44; i < n; i++) for (const ch of [m.left, m.right]) {
        const s = Math.max(-8388608, Math.min(8388607, Math.round(ch[i] * 8388607)));
        v.setUint8(o++, s & 255); v.setUint8(o++, (s >> 8) & 255); v.setUint8(o++, (s >> 16) & 255);
      }
      return new Blob([v.buffer], { type: 'audio/wav' });
    }

    // Goniometer over the half second around the loudest 50 ms of the HYBD mix, rotated so mono points up.
    function goniometers(mixes, fs) {
      const H = mixes[2].mix, N = H.left.length, win = Math.min(N, Math.round(0.05 * fs)), seg = Math.min(N, Math.round(0.5 * fs));
      let sum = 0, best = -1, end = win;
      for (let i = 0; i < N; i++) {
        sum += H.left[i] * H.left[i] + H.right[i] * H.right[i];
        if (i >= win) sum -= H.left[i - win] * H.left[i - win] + H.right[i - win] * H.right[i - win];
        if (i >= win - 1 && sum > best) { best = sum; end = i; }
      }
      const start = Math.max(0, Math.min(N - seg, end - (seg >> 1)));
      const cells = mixes.map(({ label, mix }) => {
        const canvas = el('canvas', { role: 'img', 'aria-label': 'Goniometer of the ' + label + ' mix' });
        return { canvas, mix, root: el('figure', {}, canvas, el('figcaption', {}, label)) };
      });
      const draw = () => cells.forEach(({ canvas, mix }) => {
        const w = canvas.clientWidth, dpr = window.devicePixelRatio || 1;
        if (!w) return;
        canvas.width = canvas.height = Math.round(w * dpr);
        const g = canvas.getContext('2d'), step = Math.max(1, Math.floor(seg / 6000));
        let lim = 0;
        for (let i = start; i < start + seg; i++) lim = Math.max(lim, Math.abs(mix.left[i]), Math.abs(mix.right[i]));
        lim = lim * 1.1 || 1;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, w);
        g.strokeStyle = css('--line');
        g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.stroke();
        g.fillStyle = css('--accent');
        g.globalAlpha = 0.55;
        for (let i = start; i < start + seg; i += step) {
          const l = mix.left[i], r = mix.right[i];
          g.fillRect(w / 2 + (l - r) * Math.SQRT1_2 / lim * w / 2 - 0.5, w / 2 - (l + r) * Math.SQRT1_2 / lim * w / 2 - 0.5, 1.2, 1.2);
        }
        g.globalAlpha = 1;
      });
      const box = el('div', { class: 'mx-gonio' }, cells.map(c => c.root));
      new ResizeObserver(draw).observe(box);
      return el('div', { class: 'tablewrap' }, el('h3', {}, 'Goniometers (side across, mid up)'), box);
    }

    function show(r, all, fs) {
      const ctx = audioContext(), info = r.info, active = player ? player.active : 2;
      if (player) {
        player.stop(false);
        (player.nodes || []).forEach(n => n.disconnect());
        players.splice(players.indexOf(player), 1);
      }
      urls.forEach(u => URL.revokeObjectURL(u));
      const mixes = [['ICLD', r.icld], ['ICTD', r.ictd], ['HYBD', r.hybd]].map(([label, mix]) => ({ label, mix }));
      const clips = mixes.map(({ label, mix }) => {
        const n = mix.left.length, buffer = ctx.createBuffer(2, n, fs), peaks = new Array(240).fill(0);
        buffer.copyToChannel(Float32Array.from(mix.left), 0);
        buffer.copyToChannel(Float32Array.from(mix.right), 1);
        for (let i = 0; i < n; i++) { const b = Math.floor(i * 240 / n), a = Math.max(Math.abs(mix.left[i]), Math.abs(mix.right[i])); if (a > peaks[b]) peaks[b] = a; }
        return { id: label, label, buffer, meta: { dur: n / fs, peaks: peaks.map(p => Math.round(p * 100)) } };
      });
      player = new Player({ title: 'Rendered mixes', start: active, match: false, matched: 'LUFS-matched', clips,
        note: (info.mode === 'freqsplit' ? 'HYBD: time difference below ' + info.crossoverHz + ' Hz, level difference above.' : 'HYBD: level and time difference across the whole band.')
          + ' All three at ' + info.lufsTarget.toFixed(1) + ' LUFS.' });
      urls = mixes.map(m => URL.createObjectURL(wav(m.mix, fs)));
      const db = v => Math.abs(v) > 120 ? (v > 0 ? '+∞' : '-∞') : (v > 0 ? '+' : '') + v.toFixed(1);
      results.replaceChildren(player.root,
        el('div', { class: 'links' }, mixes.map((m, i) => el('a', { class: 'btn', href: urls[i], download: 'output_' + m.label + '.wav' }, m.label + ' .wav'))),
        el('div', { class: 'tablewrap' }, el('h3', {}, 'Per-track parameters'), el('table', {},
          el('thead', {}, el('tr', {}, ['Track', 'Pan', 'ICLD (dB)', 'ICTD (ms)'].map(h => el('th', {}, h)))),
          el('tbody', {}, all.map((a, k) => { const t = info.perTrack[k]; return el('tr', {}, [a.t.label, panText(t.pan), db(t.icldDb), (t.ictdMs > 0 ? '+' : '') + t.ictdMs.toFixed(3)].map(c => el('td', {}, c))); })))),
        goniometers(mixes, fs));
    }

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
      p.mixer && window.HybridPanMix ? panMixer(p.mixer) : null,
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
        { id: 'dsp', title: 'DSP I wrote', projects: ['matlab-dsp'], extra: el('p', { class: 'sub' }, 'You can also render level, time and hybrid panned mixes yourself in the ', el('a', { href: 'dsp.html#hybrid-pan' }, 'Hybrid Pan mixer'), ' on the DSP page.') },
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
