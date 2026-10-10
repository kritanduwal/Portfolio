// Measures how well the versions in each A/B set line up, by cross-correlating amplitude envelopes
// of the cut clips in site/audio against the first clip of the set.
//   node build/check-align.js            prints lag (ms) and correlation per clip
// A positive lag means the clip is LATE relative to the reference (its start should move later in the source).
const fs = require('fs');
const path = require('path');
const D = require('../data.js');
const AUDIO = path.join(__dirname, '..', 'site', 'audio');
const RATE = 2000;      // envelope sample rate
const MAX_LAG = 2.0;    // seconds searched either side

function envelope(id) {
  const b = fs.readFileSync(path.join(AUDIO, id + '.wav'));
  const ch = b.readUInt16LE(22), sr = b.readUInt32LE(24), n = (b.length - 44) / (2 * ch);
  const hop = sr / RATE, out = new Float32Array(Math.floor(n / hop));
  for (let k = 0; k < out.length; k++) {
    let sum = 0;
    const a = Math.floor(k * hop), z = Math.floor((k + 1) * hop);
    for (let i = a; i < z; i++) {
      let v = 0;
      for (let c = 0; c < ch; c++) v += b.readInt16LE(44 + (i * ch + c) * 2);
      sum += Math.abs(v);
    }
    out[k] = sum / (z - a);
  }
  // remove the slow trend so onsets dominate, not overall level
  const d = new Float32Array(out.length);
  for (let k = 1; k < out.length; k++) d[k] = Math.max(0, out[k] - out[k - 1]);
  return d;
}

function lag(ref, x) {
  const max = Math.round(MAX_LAG * RATE);
  let best = 0, bestV = -Infinity, e1 = 0, e2 = 0;
  for (const v of ref) e1 += v * v;
  for (const v of x) e2 += v * v;
  for (let l = -max; l <= max; l++) {
    let s = 0;
    const a = Math.max(0, -l), z = Math.min(ref.length, x.length - l);
    for (let i = a; i < z; i++) s += ref[i] * x[i + l];
    if (s > bestV) { bestV = s; best = l; }
  }
  return { ms: best / RATE * 1000, corr: bestV / Math.sqrt(e1 * e2 + 1e-9) };
}

const seen = new Set(), result = {};
for (const p of D.projects) for (const set of p.audio || []) {
  if (!set.clips || set.clips.length < 2) continue;
  const key = set.clips.map(c => c.id).join('|');
  if (seen.has(key)) continue;
  seen.add(key);
  const ref = envelope(set.clips[0].id);
  console.log('\n' + p.id + ' :: ' + set.title);
  for (const c of set.clips.slice(1)) {
    const r = lag(ref, envelope(c.id));
    result[c.id] = r;
    // Below about 0.5 the envelope match is too weak to trust in either direction (reverberant or heavily
    // processed material). Confirm those by comparing the source waveforms or file onsets before changing an offset.
    const weak = r.corr < 0.5;
    const flag = Math.abs(r.ms) > 2 ? (weak ? '  <-- differs, but WEAK match: verify another way' : '  <-- MISALIGNED') : (weak ? '  (weak match: not proof of alignment)' : '');
    console.log('  ' + c.id.padEnd(16) + (r.ms.toFixed(1) + ' ms').padStart(11) + '   corr ' + r.corr.toFixed(2) + '   vs ' + set.clips[0].id + flag);
  }
}
fs.writeFileSync(path.join(__dirname, 'align-report.json'), JSON.stringify(result, null, 1));
