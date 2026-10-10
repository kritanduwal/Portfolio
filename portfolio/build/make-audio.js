// Cuts 16-bit WAV excerpts for the portfolio site and writes site/audio-meta.js
// (duration, RMS level and waveform peaks per clip). No dependencies.
//   node build/make-audio.js
const fs = require('fs');
const path = require('path');

const OD = 'C:/Users/dkrit/OneDrive - Belmont University';
const Y = OD + '/Yamaha DSP Internship Portfolio';
const BA = Y + '/05 Recording and Mixing/Processing Before-After';
const MIXING = OD + '/Semester 4 - 2026 Spring/AET 5895 Mixing';
const DSP = Y + '/02 MATLAB DSP Effects';
const IR = Y + '/03 IR-Based System Modeling (Hardware EQ, Room)/Audio';
const MST = OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Final Delivery/Duwal Final Project - Delivery/Duwal_Round 2_REV1';
const OPS = OD + '/Semester 1 - 2024 Fall/AET 5030 Studio Systems/StudioOps_44k16b_MIXES-FA24';
const PT = OD + '/Pro Tools Storage';
const OUT = path.join(__dirname, '..', 'site', 'audio');

// find the single file under dir whose path matches every regex
function find(dir, ...res) {
  const hits = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = d + '/' + e.name;
      if (e.isDirectory()) walk(p);
      else if (res.every(r => r.test(p))) hits.push(p);
    }
  })(dir);
  if (hits.length !== 1) throw new Error('expected 1 match, got ' + hits.length + ' for ' + res);
  return hits[0];
}

// [id, source, start seconds, duration seconds]
const CLIPS = [
  ['samba_master', OD + '/AES Student Recording Submission/Duwal_FJQ_SambaFunk_44k16b_MASTER.wav', 20, 90],

  ['tape_raw', BA + '/Duwal_TapeSaturation_RAW_4416.wav', 4, 18],
  ['tape_proc', BA + '/Duwal_TapeSaturation_Processed_4416.wav', 4, 18],
  ['la2a_raw', BA + '/Duwal_GTRLA2A_Raw_4416.wav', 9, 18],
  ['la2a_proc', BA + '/Duwal_GTRLA2A_Processed_4416.wav', 9, 18],
  ['sat_raw', BA + '/Duwal_Saturation_RAW_4416.wav', 4, 18],
  ['sat_heat', BA + '/Duwal_Saturation_Heatwave_4416.wav', 4, 18],
  ['sat_lofi', BA + '/Duwal_Saturation_LoFi_4416.wav', 4, 18],
  ['sat_magma', BA + '/Duwal_Saturation_MagmaLilTube_4416.wav', 4, 18],
  ['scr_raw', BA + '/Duwal_Screamo_RAW_4416.wav', 4, 18],
  ['scr_c1', BA + '/Duwal_Screamo_Compression1_4416.wav', 4, 18],
  ['scr_c2', BA + '/Duwal_Screamo_Compression2_4416.wav', 4, 18],
  ['scr_eq', BA + '/Duwal_Screamo_EQ_4416.wav', 4, 18],
  ['perc_raw', MIXING + '/Assignment 10/Duwal_EQPerc2_Raw_4416.wav', 4, 18],
  ['perc_proc', MIXING + '/Assignment 10/Duwal_EQPerc2_Processed_4416.wav', 4, 18],
  ['smp_raw', MIXING + '/Week 1/DUWAL_SampleReinforcement_RAW_4416.wav', 4, 18],
  ['smp_proc', MIXING + '/Week 1/DUWAL_SampleReinforcement_PROCESSED_4416.wav', 4, 18],

  ['ops_scarified', OPS + '/GE_Scarified_CSA_MIX_01_44k16b.wav', 30, 40],
  ['ops_potato', OPS + '/RE_SatrianiPotatoHeadGroove_CSA_MIX__01_44k16b.wav', 40, 40],

  ['mst_g3_mix', find(MST, /G3_3370/, /\/audio\//, /DEMILLE_MSTMIX\.wav$/), 60, 30],
  ['mst_g3_master', find(MST, /G3_3370/, /\/renderings\//, /DEMILLE_MSTMIX_Round 2_REV1_MSTMIX_24b.*.wav$/), 60, 30],
  ['mst_g11_mix', find(MST, /G11_3370/, /\/audio\//, /JEFFERIS_MSTMIX\.wav$/), 60, 30],
  ['mst_g11_master', find(MST, /G11_3370/, /\/renderings\//, /JEFFERIS_MSTMIX_Round 2_REV1_MSTMIX_24b.*.wav$/), 60, 30],

  ['bass_di', DSP + '/Distortion - Transistor Clipping/BassDI.wav', 22, 14],
  ['bass_fx', DSP + '/Distortion - Transistor Clipping/effectOutBassDI.wav', 22, 14],
  ['bass_la3a', DSP + '/Distortion - Transistor Clipping/LA3APrint.wav', 22, 14],
  ['drums_dry', DSP + '/Distortion - Mid-Side, Parallel, Waveshaper/stereoDrums.wav', 0, 12],
  ['drums_ms', DSP + '/Distortion - Mid-Side, Parallel, Waveshaper/distDrums.wav', 0, 12],
  ['gtr_dry', DSP + '/Distortion - Mid-Side, Parallel, Waveshaper/AcGtr.wav', 0, 12],
  ['gtr_par', DSP + '/Distortion - Mid-Side, Parallel, Waveshaper/parallelDistOutput.wav', 0, 12],
  ['gtr_echo', DSP + '/Stereo Echo/test.wav', 0, 14],

  ['vocal_dry', IR + '/Vocal.wav', 0, 12],
  ['vocal_hw', IR + '/vocalHardwareEQ.wav', 0, 12],
  ['vocal_model', IR + '/convVocalHardwareEQ_reg.wav', 0, 12],
  ['vocal_church', IR + '/convR1.wav', 0, 13],

// ---- added for the multi-page site
  ...[1,2,3,4,5,6,7,8,9].map(n => ['fpc_p' + n, OD + '/FPC convolved audio outputs/R' + n + '.wav', 5, 20]),
  ['egtr_raw', PT + '/Dumber By The Minute - EQ Electric Guitars/Bounced Files/DUWAL_ElectricGuitarEQ_RAW_4416.wav', 4, 18],
  ['egtr_proc', PT + '/Dumber By The Minute - EQ Electric Guitars/Bounced Files/DUWAL_ElectricGuitarEQ_Processed_4416.wav', 4, 18],
  ['vol_raw', MIXING + '/Week 2/DUWAL_VolumeBalance_RAW_4416.wav', 4, 18],
  ['vol_proc', MIXING + '/Week 2/DUWAL_VolumeBalance_Processed_4416.wav', 4, 18],
  ['ops_jetcity', OPS + '/GE_JetCityWoman_CSA_MIX_01_44k16b.wav', 40, 40],
  ['mst_g3_inst', find(MST, /G3_3370/, /\/renderings\//, /INSTRUMENTAL_Round 2.*\.wav$/), 60, 30],
  ['mst_g3_acap', find(MST, /G3_3370/, /\/renderings\//, /ACAPELLA_Round 2.*\.wav$/), 60, 30],
  ['mst_g3_tv', find(MST, /G3_3370/, /\/renderings\//, /TVTRK_Round 2.*\.wav$/), 60, 30],
  ['vocal_ccc', OD + '/Semester 4 - 2026 Spring/AET 5420 Audio Signal Processing/other project files/R2ChristCathedral/vocalR2ChristCathedral.wav', 0, 13],
  ['wt_50', DSP + '/Synthesis/wavetable50Hz.wav', 0, 3],
  ['wt_100', DSP + '/Synthesis/wavetable100Hz.wav', 0, 3],
  ['wt_200', DSP + '/Synthesis/wavetable200Hz.wav', 0, 3],
];

// Seconds added to a clip's start so every version in an A/B set lines up with the others.
// Each value was confirmed by cross-correlating the source waveforms (correlation 0.6 or better).
// Envelope correlation alone is not enough for reverberant material: it gave false offsets for the church renders.
const OFFSETS = {
  // GML 8200 print starts 689 ms before the dry vocal; the vocal set starts 1 s in to leave room.
  vocal_dry: 1.0, vocal_model: 1.0, vocal_ccc: 1.0, vocal_church: 1.0064, vocal_hw: 0.3108,
  // LA3APrint.wav is a print of the second half of the DI: its time 0 is 19.0004 s into BassDI.wav.
  bass_la3a: -19.0004,
  tape_proc: 0.0087,
  // The nine church renders need no offset: all files are the same length and start within 17 ms of each other,
  // and those small differences are the real travel-time differences between positions.
};

function readHeader(fd) {
  const head = Buffer.alloc(12);
  fs.readSync(fd, head, 0, 12, 0);
  if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV');
  let pos = 12, fmt = null, data = null;
  const size = fs.fstatSync(fd).size;
  const ch = Buffer.alloc(8);
  while (pos + 8 <= size && !(fmt && data)) {
    fs.readSync(fd, ch, 0, 8, pos);
    const id = ch.toString('ascii', 0, 4), len = ch.readUInt32LE(4);
    if (id === 'fmt ') {
      const b = Buffer.alloc(len);
      fs.readSync(fd, b, 0, len, pos + 8);
      let tag = b.readUInt16LE(0);
      if (tag === 0xFFFE) tag = b.readUInt16LE(24); // WAVE_FORMAT_EXTENSIBLE
      fmt = { tag, ch: b.readUInt16LE(2), sr: b.readUInt32LE(4), bits: b.readUInt16LE(14) };
    } else if (id === 'data') {
      data = { off: pos + 8, len: Math.min(len, size - pos - 8) };
    }
    pos += 8 + len + (len & 1);
  }
  if (!fmt || !data) throw new Error('missing fmt/data chunk');
  return { fmt, data };
}

function sampleReader(fmt) {
  const { tag, bits } = fmt;
  if (tag === 1 && bits === 16) return (b, o) => b.readInt16LE(o) / 32768;
  if (tag === 1 && bits === 24) return (b, o) => b.readIntLE(o, 3) / 8388608;
  if (tag === 1 && bits === 32) return (b, o) => b.readInt32LE(o) / 2147483648;
  if (tag === 3 && bits === 32) return (b, o) => b.readFloatLE(o);
  if (tag === 3 && bits === 64) return (b, o) => b.readDoubleLE(o);
  throw new Error('unsupported format tag ' + tag + ' / ' + bits + ' bit');
}

function cut([id, src, start, dur]) {
  start += OFFSETS[id] || 0;
  const fd = fs.openSync(src, 'r');
  const { fmt, data } = readHeader(fd);
  const bps = fmt.bits / 8, frame = bps * fmt.ch;
  const total = Math.floor(data.len / frame);
  const first = Math.min(Math.floor(start * fmt.sr), Math.max(0, total - 1));
  const n = Math.min(Math.floor(dur * fmt.sr), total - first);
  const raw = Buffer.alloc(n * frame);
  fs.readSync(fd, raw, 0, raw.length, data.off + first * frame);
  fs.closeSync(fd);

  const read = sampleReader(fmt);
  const outCh = Math.min(fmt.ch, 2);
  const out = Buffer.alloc(44 + n * outCh * 2);
  const fadeIn = Math.floor(0.01 * fmt.sr), fadeOut = Math.floor(0.4 * fmt.sr);
  const BINS = 240, peaks = new Array(BINS).fill(0);
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (first > 0 && i < fadeIn) g = i / fadeIn;
    if (first + n < total && i > n - fadeOut) g = Math.min(g, (n - i) / fadeOut);
    for (let c = 0; c < outCh; c++) {
      const v = read(raw, i * frame + c * bps) * g;
      sumSq += v * v;
      const a = Math.abs(v), bin = Math.floor(i * BINS / n);
      if (a > peaks[bin]) peaks[bin] = a;
      out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + (i * outCh + c) * 2);
    }
  }
  out.write('RIFF', 0); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(outCh, 22);
  out.writeUInt32LE(fmt.sr, 24); out.writeUInt32LE(fmt.sr * outCh * 2, 28);
  out.writeUInt16LE(outCh * 2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(n * outCh * 2, 40);
  fs.writeFileSync(path.join(OUT, id + '.wav'), out);

  const rms = 10 * Math.log10(sumSq / (n * outCh) + 1e-12);
  return {
    dur: +(n / fmt.sr).toFixed(2), sr: fmt.sr, ch: outCh, srcBits: fmt.bits,
    rms: +rms.toFixed(2), peaks: peaks.map(p => Math.round(p * 100)),
  };
}

fs.mkdirSync(OUT, { recursive: true });
const meta = {};
for (const clip of CLIPS) {
  try {
    meta[clip[0]] = cut(clip);
    const m = meta[clip[0]];
    console.log(clip[0].padEnd(16), (m.dur + 's').padEnd(8), m.sr, m.ch + 'ch', 'src ' + m.srcBits + 'b', m.rms + ' dB');
  } catch (e) {
    console.log('FAILED', clip[0], e.message);
  }
}
fs.writeFileSync(path.join(OUT, '..', 'audio-meta.js'), 'window.AUDIO_META = ' + JSON.stringify(meta) + ';\n');
