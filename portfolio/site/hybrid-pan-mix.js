/* JavaScript port of Source/mixer/HybridPanMix.cpp from github.com/kritanduwal/HybirdPan, itself an offline port of
   hybridPanMix.m. Takes N mono tracks plus a pan position per track and renders three stereo mixes of the same
   material (HYBD, ICLD-only, ICTD-only), LUFS-matches them to the median of the three and applies a shared
   -1 dBFS peak safety gain. Whole signals, double precision, non-causal Lagrange interpolator, as in the C++. */
(function () {
  const EPS = 2.220446049250313e-16;

  function biquad(b0, b1, b2, a1, a2) {
    return x => {
      const y = new Float64Array(x.length);
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let n = 0; n < x.length; n++) {
        const out = b0 * x[n] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = x[n];
        y2 = y1; y1 = out;
        y[n] = out;
      }
      return y;
    };
  }

  // 2nd-order sections; q = 1/sqrt(2) gives MATLAB's butter(2, fc/(fs/2)).
  function lowpass(fc, fs, q = Math.SQRT1_2) {
    const K = Math.tan(Math.PI * fc / fs), a0 = 1 + K / q + K * K;
    return biquad(K * K / a0, 2 * K * K / a0, K * K / a0, 2 * (K * K - 1) / a0, (1 - K / q + K * K) / a0);
  }
  function highpass(fc, fs, q = Math.SQRT1_2) {
    const K = Math.tan(Math.PI * fc / fs), a0 = 1 + K / q + K * K;
    return biquad(1 / a0, -2 / a0, 1 / a0, 2 * (K * K - 1) / a0, (1 - K / q + K * K) / a0);
  }

  // K-weighting stage 1: high shelf at ~1681 Hz, +4 dB (BS.1770).
  function kWeightingStage1(fs) {
    const f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
    const K = Math.tan(Math.PI * f0 / fs), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
    const a0 = 1 + K / Q + K * K;
    return biquad((Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0,
      2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0);
  }
  // K-weighting stage 2: RLB high-pass at ~38 Hz (BS.1770).
  function kWeightingStage2(fs) {
    const f0 = 38.13547087602444, Q = 0.5003270373238773;
    const K = Math.tan(Math.PI * f0 / fs), a0 = 1 + K / Q + K * K;
    return biquad(1 / a0, -2 / a0, 1 / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0);
  }

  // Lagrange-3 fractional delay of D >= 0 samples; output length == input length.
  function fractionalDelay(x, D) {
    const N = x.length, intD = Math.floor(D), d = D - intD;
    const h0 = -d * (d - 1) * (d - 2) / 6;          // x(n - intD + 1)
    const h1 = (d + 1) * (d - 1) * (d - 2) / 2;     // x(n - intD)
    const h2 = -(d + 1) * d * (d - 2) / 2;          // x(n - intD - 1)
    const h3 = (d + 1) * d * (d - 1) / 6;           // x(n - intD - 2)
    const at = i => (i >= 0 && i < N) ? x[i] : 0;   // same as MATLAB's xPad = [zeros(intD + 2, 1); x; 0]
    const y = new Float64Array(N);
    for (let n = 0; n < N; n++)
      y[n] = h0 * at(n - intD + 1) + h1 * at(n - intD) + h2 * at(n - intD - 1) + h3 * at(n - intD - 2);
    return y;
  }

  // Integrated loudness (simplified ITU-R BS.1770, as in the MATLAB).
  function integratedLUFS(mix, fs) {
    const s1 = kWeightingStage1(fs), s2 = kWeightingStage2(fs);
    const kL = s2(s1(mix.left)), kR = s2(s1(mix.right));

    // Mean-square in 400 ms blocks with 75% overlap.
    const N = kL.length, blockLen = Math.round(0.4 * fs), hopLen = Math.round(0.1 * fs);
    const nBlocks = N >= blockLen ? Math.floor((N - blockLen) / hopLen) + 1 : 0;
    if (nBlocks <= 0) return -70; // silence / too short

    const cumulative = new Float64Array(N + 1);
    for (let i = 0; i < N; i++) cumulative[i + 1] = cumulative[i] + kL[i] * kL[i] + kR[i] * kR[i];
    const blockMS = new Float64Array(nBlocks);
    for (let b = 0; b < nBlocks; b++) blockMS[b] = (cumulative[b * hopLen + blockLen] - cumulative[b * hopLen]) / blockLen;

    const toLUFS = ms => -0.691 + 10 * Math.log10(ms + EPS);
    const gatedMean = gate => {
      let sum = 0, count = 0;
      for (const ms of blockMS) if (toLUFS(ms) > -70 && toLUFS(ms) > gate) { sum += ms; count++; }
      return count ? sum / count : null;
    };

    // Absolute gate at -70 LUFS, then relative gate 10 LU below the ungated mean.
    const absMean = gatedMean(-70);
    if (absMean == null) return -70;
    const ungated = toLUFS(absMean), relMean = gatedMean(ungated - 10);
    return relMean == null ? ungated : toLUFS(relMean);
  }

  function addScaled(dst, src, gain) { for (let i = 0; i < dst.length; i++) dst[i] += gain * src[i]; }
  function scale(m, gain) { for (const ch of [m.left, m.right]) for (let i = 0; i < ch.length; i++) ch[i] *= gain; }
  function peak(m) {
    let p = 0;
    for (const ch of [m.left, m.right]) for (let i = 0; i < ch.length; i++) { const a = Math.abs(ch[i]); if (a > p) p = a; }
    return p;
  }

  /* tracks: array of Float64Array, all at sample rate fs (shorter ones are zero-padded to the longest).
     options: { mode: 'freqsplit' | 'broadband', crossoverHz, maxICTDms, gainsDb } */
  function render(tracks, pans, fs, options = {}) {
    const mode = options.mode || 'freqsplit', crossoverHz = options.crossoverHz || 700;
    const maxICTDms = options.maxICTDms == null ? 0.3 : options.maxICTDms, gainsDb = options.gainsDb || [];
    const Lmax = Math.max(0, ...tracks.map(t => t.length));
    const maxICTDsamples = maxICTDms * 1e-3 * fs, invSqrt2 = Math.SQRT1_2;
    const blank = () => ({ left: new Float64Array(Lmax), right: new Float64Array(Lmax) });
    const hybd = blank(), icld = blank(), ictd = blank(), perTrack = [];

    // 2nd-order Butterworth low/high split, as in the MATLAB.
    const lp = lowpass(crossoverHz, fs), hp = highpass(crossoverHz, fs);

    tracks.forEach((track, k) => {
      const gainDb = gainsDb[k] || 0, gain = Math.pow(10, gainDb / 20);
      const x = new Float64Array(Lmax);
      for (let i = 0; i < track.length; i++) x[i] = track[i] * gain;
      const pan = Math.max(-1, Math.min(1, pans[k] || 0));

      // ICLD via constant-power pan law: pan [-1,+1] -> theta [0, pi/2].
      const theta = (pan + 1) * Math.PI / 4, gL = Math.cos(theta), gR = Math.sin(theta);

      // ICTD: the contralateral channel is delayed, linearly in |pan|.
      const delaySamples = Math.abs(pan) * maxICTDsamples;
      const leftDelayed = pan > 0; // source on the right -> delay L

      // ICLD-only: gain only, no delay.
      addScaled(icld.left, x, gL);
      addScaled(icld.right, x, gR);

      // ICTD-only: equal level on both channels, delay on the contralateral one.
      const xDelayed = delaySamples > 0 ? fractionalDelay(x, delaySamples) : x;
      addScaled(ictd.left, leftDelayed ? xDelayed : x, invSqrt2);
      addScaled(ictd.right, leftDelayed ? x : xDelayed, invSqrt2);

      if (mode === 'broadband') {
        // ICLD + ICTD applied broadband (matches Duwal et al. 2025).
        addScaled(hybd.left, leftDelayed ? xDelayed : x, gL);
        addScaled(hybd.right, leftDelayed ? x : xDelayed, gR);
      } else {
        // Freqsplit: ICTD below the crossover, ICLD above it.
        const xLow = lp(x), xHigh = hp(x);
        const xLowDelayed = delaySamples > 0 ? fractionalDelay(xLow, delaySamples) : xLow;
        addScaled(hybd.left, leftDelayed ? xLowDelayed : xLow, invSqrt2);
        addScaled(hybd.right, leftDelayed ? xLow : xLowDelayed, invSqrt2);
        addScaled(hybd.left, xHigh, gL);
        addScaled(hybd.right, xHigh, gR);
      }

      // Diagnostics for the per-track table.
      const sign = Math.sign(pan);
      perTrack.push({
        pan, gainDb,
        icldDb: pan === 0 ? 0 : sign * 20 * Math.log10(Math.max(gL, gR) / Math.max(Math.min(gL, gR), EPS)),
        ictdSamples: delaySamples * sign,
        ictdMs: delaySamples / fs * 1e3 * sign,
      });
    });

    // LUFS-match the three mixes to their median loudness.
    const lufsH = integratedLUFS(hybd, fs), lufsL = integratedLUFS(icld, fs), lufsT = integratedLUFS(ictd, fs);
    let target = [lufsH, lufsL, lufsT].sort((a, b) => a - b)[1];
    scale(hybd, Math.pow(10, (target - lufsH) / 20));
    scale(icld, Math.pow(10, (target - lufsL) / 20));
    scale(ictd, Math.pow(10, (target - lufsT) / 20));

    // Peak safety: if any mix exceeds -1 dBFS, scale all three equally.
    const peakAll = Math.max(peak(hybd), peak(icld), peak(ictd)), targetPeak = Math.pow(10, -1 / 20);
    if (peakAll > targetPeak) {
      const safety = targetPeak / peakAll;
      scale(hybd, safety); scale(icld, safety); scale(ictd, safety);
      target += 20 * Math.log10(safety);
    }

    return { hybd, icld, ictd, info: { mode, crossoverHz, perTrack,
      lufsHYBD: integratedLUFS(hybd, fs), lufsICLD: integratedLUFS(icld, fs), lufsICTD: integratedLUFS(ictd, fs), lufsTarget: target } };
  }

  const api = { render, lowpass, highpass, fractionalDelay, integratedLUFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.HybridPanMix = api;
})();
