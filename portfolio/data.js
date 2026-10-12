// Single source of truth for the portfolio site, the portfolio PDF and the career bank.
// Edit here, then run:  node build/build.js
(function (root) {
  const OD = 'C:/Users/dkrit/OneDrive - Belmont University';
  const CL = 'C:/Users/dkrit/Downloads/Classes';
  const Y = OD + '/Yamaha DSP Internship Portfolio';

  const person = {
    name: 'Kritan Duwal',
    tagline: 'Audio engineer who writes the software',
    intro: 'M.S. Audio Engineering on top of a B.S. in Computer Science and three years as a software engineer. I measure rooms, build DSP and web-audio tools, and record and mix music.',
    email: 'duwalkritan@gmail.com',
    links: {
      github: 'https://github.com/kritanduwal',
      linkedin: 'https://www.linkedin.com/in/kritan-duwal-187470192',
      church: 'https://churchauralheritage.org/',
      aes: 'https://aes.org/publications/elibrary-page/?id=23064',
      hackmd: 'https://hackmd.io/fL3Zv8akQouU-4J3hNnYWQ',
      drive: 'https://drive.google.com/drive/folders/1Ucw4KT0bRMEp5DH_w00oNcUvbg_aJ2Ux?usp=sharing',
    },
    education: [
      { school: 'Belmont University, Nashville, TN', degree: 'M.S. Audio Engineering, GPA 4.0', dates: 'Aug 2024 - May 2026', courses: 'Audio Signal Processing, Digital Audio, Deep Learning, Auditory Perception, Acoustics, Mastering, Mixing, Critical Listening, Research Methods' },
      { school: 'University of Texas at Arlington', degree: 'B.S. Computer Science, cum laude (GPA 3.64)', dates: 'Aug 2018 - May 2021', courses: 'Software Development, Machine Learning, Artificial Intelligence, Operating Systems, Databases' },
    ],
  };

  const categories = [
    { id: 'research', label: 'Research & spatial audio' },
    { id: 'dsp', label: 'DSP & plugins' },
    { id: 'measure', label: 'Measurement & acoustics' },
    { id: 'studio', label: 'Recording, mixing, mastering' },
    { id: 'ml', label: 'Machine learning' },
    { id: 'software', label: 'Software engineering' },
    { id: 'cs', label: 'Computer science foundations' },
  ];

  // kind: optional label shown above a project's title in place of its category name.
  // audio: sets of clips that play in sync and can be switched A/B. Clip ids are files in site/audio.
  // Level-match is on by default; set match: false to open a set at its true levels (the mastering sets).
  const projects = [
    {
      id: 'aural-heritage', cat: 'research', onResume: true, featured: true,
      title: 'Aural Heritage: hear a historic church from where you stand',
      short: 'Aural Heritage web app',
      period: 'Jun 2025 - present', role: 'Research Assistant, Belmont University (Dr. Doyuen Ko)',
      summary: 'I measured impulse responses in historic US churches, then built churchauralheritage.org: pick a church, click a measured listening position inside its 360° photo, and any audio plays back in the real acoustics of that spot.',
      points: [
        'On-site measurement with Room EQ Wizard, omnidirectional and first-order ambisonic microphones, and calibrated loudspeaker excitation at multiple positions per room.',
        'Real-time convolution in the browser with the Web Audio API. Nothing is simulated: you hear the measured building.',
        'Head-tracked binaural pipeline: A-format ambisonic IRs are converted to B-format and decoded to binaural with HRTFs; the sound field rotates with the 360° view.',
        'Binaural and stereo renders are loudness-matched with an ITU-R BS.1770 LUFS measurement.',
        'Plain HTML/CSS/JavaScript with no build step, deployed on Netlify, with a Node test suite covering the audio graph, room data and UI.',
      ],
      stack: ['JavaScript', 'Web Audio API', 'Ambisonics', 'HRTF / binaural', 'ITU-R BS.1770', 'Room EQ Wizard', 'Node test runner', 'Netlify'],
      images: [{ src: 'aural-app.jpg', cap: 'The web app: a 360° view with clickable measured positions.' }, { src: 'church-pano.jpg', cap: '360° capture of a measured church interior.' }],
      audio: [{
        title: 'Walk the room: nine measured positions in First Presbyterian Church, KY', start: 0,
        note: 'Convolved with the measured impulse responses. Headphones recommended.',
        clips: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ id: 'fpc_p' + n, label: 'R' + n })),
      }],
      links: [{ label: 'Open the live app', href: 'https://churchauralheritage.org/' }],
      evidence: [OD + '/AuralHeritageProject', OD + '/AuralHeritageProject/README.md', OD + '/FPC convolved audio outputs', Y + '/06 Aural Heritage - Church Convolution Demo'],
    },
    {
      id: 'aes-paper', cat: 'research', onResume: true, featured: true,
      title: 'Two is Better Than One: time- and level-based panning',
      short: 'AES 159th Convention paper',
      period: 'Apr 2025 - Oct 2025', role: 'Co-authored with Austin Arias, Dr. Wesley A. Bulla and Dr. Song Hui Chon',
      summary: 'A listening study on whether combining inter-channel time difference (ICTD) with level difference (ICLD) improves stereo panning. Presented as a peer-reviewed Express Paper at the 159th AES Convention, Long Beach, October 2025.',
      points: [
        'Thirty stimuli built from ten multitrack recordings, panned with ICLD, ICTD or both (HYBD).',
        'Listeners rated width, depth, externalization and envelopment in counterbalanced pairs, on headphones and on loudspeakers.',
        'On headphones, depth was rated significantly higher for the hybrid technique.',
        'On loudspeakers, listeners strongly preferred the hybrid and preferred against level-only panning.',
      ],
      stack: ['Experimental design', 'Listening tests', 'Statistics', 'Spatial audio', 'Technical writing'],
      images: [{ src: 'aes-depth.jpg', cap: 'Mean depth scores per comparison (headphone condition).' }, { src: 'aes-ui.jpg', cap: 'The web interface listeners used to rate each pair.' }, { src: 'aes-room.jpg', cap: 'Loudspeaker listening setup.' }],
      links: [{ label: 'Paper in the AES E-Library', href: 'https://aes.org/publications/elibrary-page/?id=23064' }],
      evidence: [OD + '/Semester 2 - 2025 Spring/AES 2025 Paper', OD + '/Semester 2 - 2025 Spring/AES 2025 Paper/AES-159th-Convention-Express-Paper-Version-8.pdf', OD + '/Semester 2 - 2025 Spring/AES 2025 Paper/Stuff/Spark Presentation.pptx'],
    },
    {
      id: 'hybrid-pan', cat: 'dsp', onResume: true, featured: true,
      title: 'Hybrid Pan: the paper, as a real-time plugin',
      short: 'Hybrid Pan JUCE plugin (C++)',
      period: '2026', role: 'Developer',
      summary: 'A C++17 / JUCE port of the three panning laws from the AES paper, built as VST3, AU and Standalone, plus an offline mixer app that renders the same sources as ICLD, ICTD and hybrid mixes for comparison.',
      points: [
        'ICLD is a constant-power level pan; ICTD delays the far channel by a sub-sample amount; HYBD combines them, across the whole band or split at a crossover (time below, level above).',
        'Streaming third-order Lagrange fractional delay on a ring buffer. The offline MATLAB reads one sample ahead, so the plugin runs a constant one-sample latency and reports it to the host for delay compensation.',
        'Second-order Butterworth crossover (juce::dsp::IIR) with both bands always computed, so mode switches are click-free.',
        'Parameters through APVTS with 20 ms smoothing. Panning math and interpolator verified numerically against the MATLAB reference.',
        'Hybrid Pan Mixer, a second build target: sources placed left, center and right are rendered as three mixes, matched to the same integrated loudness (BS.1770) for blind A/B/C listening, with goniometer, coherence and inter-channel phase plots. The portfolio site runs a JavaScript port of its renderer.',
      ],
      stack: ['C++17', 'JUCE', 'CMake', 'VST3 / AU', 'Fractional delay', 'IIR filters', 'MATLAB'],
      mixer: {
        stems: [
          { id: 'mix_gtr', label: 'Acoustic guitar', pos: 'LEFT' },
          { id: 'mix_bass', label: 'Bass', pos: 'CENTER' }, { id: 'mix_vox', label: 'Lead vocal', pos: 'CENTER' }, { id: 'mix_drums', label: 'Drums (room mic)', pos: 'CENTER' },
          { id: 'mix_rhodes', label: 'Rhodes', pos: 'RIGHT' },
        ],
        credit: 'Default stems: Ghostly Beard, "Upper Hand", multitrack from https://www.cambridge-mt.com/ms3/mtk/ and used for educational purposes. The performances are not mine.',
      },
      links: [{ label: 'GitHub', href: 'https://github.com/kritanduwal/HybirdPan' }],
      evidence: [Y + '/01 JUCE Plugins (C++)/Hybrid Pan (VST3)', Y + '/01 JUCE Plugins (C++)/Hybrid Pan (VST3)/README.md', OD + '/C++/HybirdPan', Y + '/01 JUCE Plugins (C++)/Multi-Effects Plugin (in progress)'],
      extra: 'Also in progress: a JUCE multi-effects plugin (phaser, chorus, overdrive, ladder filter) with a user-reorderable chain passed to the audio thread through a lock-free FIFO.',
    },
    {
      id: 'matlab-dsp', cat: 'dsp', onResume: true,
      title: 'DSP effects and synthesis, written from the difference equation up',
      short: 'MATLAB DSP effects',
      period: 'Aug 2025 - May 2026', role: 'Graduate coursework (Digital Audio, Audio Signal Processing)',
      summary: 'Effects, oscillators and analysis tools implemented in MATLAB without toolbox shortcuts. Each one ships with a test script and before/after audio.',
      points: [
        'Transistor-style clipper with memory: the threshold sags the longer the signal stays in saturation, giving a sloped clip rather than a flat one.',
        'Mid-side distortion (hard clip on the mid channel only, so a drum bus keeps its width), three-path parallel distortion, and an asymmetric waveshaper.',
        'Aural exciter, stereo echo with feedback and square-law panning, wavetable and phase-accumulator synthesis, ring modulation, a self-oscillating IIR sine oscillator.',
        'Pitch detection by autocorrelation and zero-crossing rate; a hand-written DFT, inverse DFT and spectrogram.',
        'Ambisonics: A-format to B-format encoding from tetrahedral IRs, and B-format sound-field rotation for head tracking.',
      ],
      stack: ['MATLAB', 'Nonlinear processing', 'FIR / IIR design', 'Synthesis', 'DFT', 'Ambisonics'],
      audio: [
        { title: 'Bass DI through my transistor clipper', note: 'The third option is a real LA-3A hardware print of the same take, for comparison.',
          clips: [{ id: 'bass_di', label: 'Dry DI' }, { id: 'bass_fx', label: 'My clipper' }, { id: 'bass_la3a', label: 'LA-3A hardware' }] },
        { title: 'Mid-side distortion on a drum bus', clips: [{ id: 'drums_dry', label: 'Dry' }, { id: 'drums_ms', label: 'Mid-only hard clip' }] },
        { title: 'Acoustic guitar: parallel distortion and stereo echo', clips: [{ id: 'gtr_dry', label: 'Dry' }, { id: 'gtr_par', label: 'Parallel distortion' }, { id: 'gtr_echo', label: 'Stereo echo' }] },
      ],
      evidence: [Y + '/02 MATLAB DSP Effects', OD + '/Semester 3 - 2025 Fall/AET 5410 Digital Audio', OD + '/Semester 4 - 2026 Spring/AET 5420 Audio Signal Processing'],
    },
    {
      id: 'ir-modeling', cat: 'dsp', onResume: true, featured: true,
      title: 'Can an impulse response stand in for the hardware?',
      short: 'IR-based system modeling',
      period: 'Spring 2026', role: 'Team project with Austin Arias and Sihyeon Park',
      summary: 'We measured plugins, a GML 8200 hardware EQ and a church, modeled each from its impulse response, and null-tested the model against the real thing.',
      points: [
        'Plugins: captured the IRs of a Pro Tools EQ and delay, then compared convolution against the plugin output.',
        'Hardware: measured a GML 8200 parametric EQ with a sine sweep, estimated its transfer function by spectral division and Tikhonov-regularized deconvolution, and aligned by cross-correlation.',
        'Room: applied the same method to an impulse response measured in a church.',
      ],
      stack: ['MATLAB', 'Deconvolution', 'Tikhonov regularization', 'Cross-correlation', 'Null testing', 'Pro Tools'],
      images: [{ src: 'null-test.jpg', cap: 'Null test: measured output, convolved model, and the residual.' }, { src: 'ir-plot.jpg', cap: 'Measured impulse response, time domain.' }],
      audio: [
        { title: 'Real GML 8200 against its model', note: 'Switch between the hardware print and the convolution model.',
          clips: [{ id: 'vocal_dry', label: 'Dry vocal' }, { id: 'vocal_hw', label: 'Real GML 8200' }, { id: 'vocal_model', label: 'IR model' }] },
        { title: 'The same vocal placed in two measured churches', clips: [{ id: 'vocal_dry', label: 'Dry vocal' }, { id: 'vocal_church', label: 'Church Street UMC' }, { id: 'vocal_ccc', label: 'Christ Church Cathedral' }] },
      ],
      docs: [{ label: 'Read the report (PDF)', file: 'ir-system-modeling-report.pdf' }],
      evidence: [Y + '/03 IR-Based System Modeling (Hardware EQ, Room)', OD + '/Semester 4 - 2026 Spring/AET 5420 Audio Signal Processing/Project'],
    },
    {
      id: 'ap-measurement', cat: 'measure', onResume: true,
      title: 'Bench-testing audio interfaces on an Audio Precision AP2700',
      short: 'Audio Precision measurement',
      period: 'Apr 2025', role: 'Acoustics coursework (Dr. Doyuen Ko)',
      summary: 'Measured two Focusrite Scarlett interfaces (2i2 and 2i4) and compared the results with the published specifications.',
      points: [
        'Frequency response, THD+N, inter-channel phase at 100 Hz, 1 kHz and 10 kHz, crosstalk and signal-to-noise ratio.',
        'The 2i4 measured 0.0032% THD+N; crosstalk at 1 kHz was -80.5 and -81.7 dB.',
      ],
      stack: ['Audio Precision AP2700', 'THD+N', 'Crosstalk', 'Frequency response', 'Technical reporting'],
      images: [{ src: 'ap-freq.jpg', cap: 'Frequency response sweep, both channels.' }],
      docs: [{ label: 'Read the report (PDF)', file: 'audio-precision-measurement-report.pdf' }],
      evidence: [Y + '/04 Audio Precision Measurement', OD + '/Semester 2 - 2025 Spring/AET 5010 Acoustics/Audio electronic device measurement'],
    },
    {
      id: 'room-acoustics', cat: 'measure', onResume: false,
      title: 'Measuring an arena: Curb Event Center',
      short: 'Arena room-acoustic measurement',
      period: 'Mar 2025', role: 'Team project with Shannon Binkowski and Sihyeon Park',
      summary: 'A room-acoustic survey of a 245 × 215 × 58 ft arena: a Sabine reverberation estimate from surface materials, then measurements at seven positions to compare against it.',
      points: [
        'Estimated RT60 from room dimensions and absorption coefficients for each surface.',
        'Measured impulse responses, frequency responses, reverberation times and waterfall plots at seven receiver positions.',
      ],
      stack: ['Room EQ Wizard', 'RT60 / Sabine', 'Impulse responses', 'Waterfall analysis'],
      images: [{ src: 'arena.jpg', cap: 'Curb Event Center, Belmont University.' }, { src: 'arena-waterfall.jpg', cap: 'Waterfall plot at one receiver position.' }, { src: 'arena-plan.jpg', cap: 'Source and receiver positions on the floor plan.' }, { src: 'arena-freq.jpg', cap: 'Frequency responses at the seven positions.' }, { src: 'arena-rt.jpg', cap: 'Reverberation time by frequency band.' }],
      docs: [{ label: 'Read the report (PDF)', file: 'room-acoustic-measurement-report.pdf' }],
      evidence: [OD + '/Semester 2 - 2025 Spring/AET 5010 Acoustics/Room Acoustic Measurement & Analysis Report'],
    },
    {
      id: 'samba-funk', cat: 'studio', kind: 'Recording and mixing', onResume: true, featured: true,
      title: 'Samba Funk: a session I recorded, edited and mixed',
      short: 'Samba Funk (AES Student Recording Competition)',
      period: 'Recorded Oct 2024, mixed Feb - Apr 2026', role: 'Recording, editing and mix engineer (supervised by Dr. Wesley A. Bulla)',
      summary: 'The Belmont School of Music Faculty Jazz Quartet, tracked on an SSL Origin in Robert E. Mulloy Studio A at 48 kHz / 24-bit. Submitted to the AES Student Recording Competition, Nashville 2026 (Category 2: Studio Recording). I also made a Dolby Atmos 7.1.2 mix.',
      points: [
        'Glyn Johns overheads (two U87s equidistant from the snare), FET U47 on kick, C12 VR on acoustic bass, three-mic grand piano, guitar on DI plus an isolated SM57 amp.',
        'Clean, direct capture with no processing on the way in, to leave every tonal decision for the mix.',
        'Mix: notch EQ around 500 Hz to clear low-mid build-up, gentle compression on kick and bass, Chow Tape Model on the mix bus, and the guitar run through a hardware Teletronix LA-2A.',
        'The lesson I kept: I first edited all the bleed out of the drums, then put it back. For this vintage jazz feel, a little spill is part of the sound.',
      ],
      stack: ['SSL Origin', 'Pro Tools', 'Microphone technique', 'Teletronix LA-2A', 'Tape saturation', 'Dolby Atmos 7.1.2'],
      images: [{ src: 'samba-control-room.jpg', cap: 'Robert E. Mulloy Studio A, from the control room.' }, { src: 'samba-layout.jpg', cap: 'Session layout: who sat where, and why.' }, { src: 'samba-eq.jpg', cap: 'Notch filtering around 500 Hz on guitar amp and kick.' }, { src: 'samba-edit.jpg', cap: 'The aggressive drum edit I made first, then threw away.' }, { src: 'samba-tape.jpg', cap: 'Chow Tape Model settings on the mix bus.' }],
      table: { title: 'Microphone list', head: ['Source', 'Microphone', 'Pattern'], rows: [
        ['Kick (in)', 'Neumann FET U47', 'Cardioid'], ['Snare top', 'Shure SM81', 'Cardioid'], ['Snare bottom', 'Shure SM81', 'Cardioid'], ['Hi-hat', 'Neumann KM-84', 'Cardioid'],
        ['Hi tom', 'AKG 414', 'Hypercardioid'], ['Low tom', 'AKG 414', 'Hypercardioid'], ['Overhead 1 (over snare)', 'Neumann U87', 'Cardioid'], ['Overhead 2 (by low tom)', 'Neumann U87', 'Cardioid'],
        ['Percussion', 'Sony C48', 'Cardioid'], ['Acoustic bass', 'AKG C12 VR', 'Cardioid'], ['Piano low', 'Neumann U87', 'Cardioid'], ['Piano mid', 'AKG 480 / CK61-ULS', 'Cardioid'],
        ['Piano high', 'AKG 480 / CK61-ULS', 'Cardioid'], ['Guitar amp', 'Shure SM57', 'Cardioid'], ['Guitar DI', 'Countryman DI', '-'],
      ] },
      audio: [
        { title: 'Samba Funk, final stereo mix (90-second excerpt)', note: 'Composed by Paulo Olivera. Performed by the Belmont University School of Music Faculty Jazz Quartet. Unreleased recording.', clips: [{ id: 'samba_master', label: 'Final mix' }] },
        { heading: 'Mix decisions from this session, before and after' },
        { title: 'Tape saturation on the mix bus', note: 'Chow Tape Model on the master fader: "Solid Tape II" preset with saturation at 0.90.',
          clips: [{ id: 'tape_raw', label: 'Raw' }, { id: 'tape_proc', label: 'Tape' }] },
        { title: 'Guitar through a hardware LA-2A', note: 'Guitar amp and DI tracks printed through a Teletronix LA-2A at 5 to 7 dB of peak reduction, then swapped in for the originals.',
          clips: [{ id: 'la2a_raw', label: 'Raw' }, { id: 'la2a_proc', label: 'LA-2A' }] },
        { title: 'Percussion EQ', note: 'High-pass at 600 Hz to clear everything below the instrument, and a 4.6 dB lift at 10 kHz for brightness.',
          clips: [{ id: 'perc_raw', label: 'Raw' }, { id: 'perc_proc', label: 'EQ' }] },
      ],
      docs: [{ label: 'Recording and mixing documentation (PDF)', file: 'samba-funk-documentation.pdf' }],
      evidence: [OD + '/AES Student Recording Submission', OD + '/837099-Kritan Duwal-Cat2', OD + '/Semester 4 - 2026 Spring/AET 5895 Mixing/Final Mix', OD + '/Semester 4 - 2026 Spring/AET 5895 Mixing/Assignment 12', Y + '/05 Recording and Mixing'],
    },
    {
      id: 'mix-techniques', cat: 'studio', kind: 'Mixing coursework', onResume: true,
      title: 'Mixing coursework: one technique at a time',
      short: 'Mixing coursework (technique studies)',
      period: 'Spring 2026', role: 'Graduate mixing course (AET 5895)',
      summary: 'Technique studies from my mixing course. Each one applies a single technique to a 30-second section of a multitrack, bounced raw and processed, so you can hear exactly what that one decision did. These are exercises, separate from the Samba Funk session above.',
      points: [
        'Each example is documented in a written mix log: session edits, fader and pan positions, and plugin settings.',
        'Covers level balance, EQ, compression, saturation and sample layering.',
      ],
      stack: ['Pro Tools', 'Compression', 'EQ', 'Saturation', 'Sample reinforcement', 'Balance'],
      audio: [
        { title: 'Volume balance from faders alone', note: 'Ghostly Beard, "Upper Hand". All faders pulled down, tracks sorted into loud, normal and quiet groups, then brought up to peak targets for each group. No EQ or compression.',
          clips: [{ id: 'vol_raw', label: 'Raw' }, { id: 'vol_proc', label: 'Balanced' }] },
        { title: 'Separating two electric guitars with EQ', note: 'Fytakyte, "Dumber By The Minute". Guitars panned hard left and right, both high-passed at 100 Hz, then a 6 dB bell at 3 kHz on one and 4 kHz on the other so each has its own presence band.',
          clips: [{ id: 'egtr_raw', label: 'Raw' }, { id: 'egtr_proc', label: 'EQ' }] },
        { title: 'Heavy vocals: EQ, then two compressors', note: 'The Bright Star Alliance, "Error 404". Lead and backing vocal: high-pass at 100 Hz, 3 dB off at 150 Hz, 6 dB lift at 1.5 kHz, 3 dB shelf at 8 kHz. Then a channel-strip compressor at 8:1 (9 to 12 dB of reduction), then a BF-76 at 4:1 (20 to 25 dB).',
          clips: [{ id: 'scr_raw', label: 'Raw' }, { id: 'scr_eq', label: 'EQ' }, { id: 'scr_c1', label: 'Comp 1' }, { id: 'scr_c2', label: 'Comp 2' }] },
        { title: 'Three flavors of saturation on a vocal', note: 'simplemachine, "#Follow Me". Lead vocal and two doubles bussed to one aux, with a different saturator on the aux each time: Pro Tools Lo-Fi (saturation 11), Heatwave (drive 80), Magma Lil Tube (drive 10, high sensitivity).',
          clips: [{ id: 'sat_raw', label: 'Raw' }, { id: 'sat_lofi', label: 'Lo-Fi' }, { id: 'sat_heat', label: 'Heatwave' }, { id: 'sat_magma', label: 'Lil Tube' }] },
        { title: 'Sample reinforcement on drums', note: 'Pandemia eRock, "Macaco Regresso". Drum samples layered under the recorded drums to add impact and consistency without replacing the performance.',
          clips: [{ id: 'smp_raw', label: 'Raw' }, { id: 'smp_proc', label: 'Reinforced' }] },
      ],
      credit: 'Multitracks were taken from https://www.cambridge-mt.com/ms3/mtk/ and are used for educational purposes. The performances are not mine.',
      evidence: [OD + '/Semester 4 - 2026 Spring/AET 5895 Mixing', OD + '/Pro Tools Storage', Y + '/05 Recording and Mixing/Processing Before-After'],
    },
    {
      id: 'mastering', cat: 'studio', kind: 'Mastering', onResume: true,
      title: 'Mastering: two Nashville rock tracks, plus tape and restoration',
      short: 'Mastering, tape transfer, restoration',
      period: 'Spring 2025', role: 'Mastering engineer (Audio Mastering and Applied Critical Listening)',
      summary: 'Mastered "Nowhere to Go" (Velvet Mirage) and "Shudder" (Sour Tooth) in Steinberg WaveLab over several feedback rounds, and delivered main, instrumental, a cappella and TV versions as WAV, FLAC and AAC.',
      points: [
        'Chain: resonance control and tonal EQ (Pro-Q3), multiband dynamics (Pro-MB), harmonic excitation (Ozone Exciter), limiting with true-peak control (Ozone Maximizer); outboard NSEQ-2 through the patch bay in one round.',
        'Analog transfer: 30 ips two-track stereo tape on a Studer A80 to 96 kHz / 24-bit.',
        'Restoration with iZotope RX: de-hum, spectral de-noise and de-click on archival recordings.',
      ],
      stack: ['Steinberg WaveLab', 'FabFilter Pro-Q3 / Pro-MB', 'iZotope Ozone', 'iZotope RX', 'Studer A80', 'Loudness normalization'],
      audio: [
        { title: '"Nowhere to Go" - Velvet Mirage', note: 'Level-match is off here so you hear the loudness the master adds. Tick it to compare tone and dynamics alone.', match: false,
          clips: [{ id: 'mst_g3_mix', label: 'Mix' }, { id: 'mst_g3_master', label: 'My master' }] },
        { title: '"Shudder" - Sour Tooth', match: false, clips: [{ id: 'mst_g11_mix', label: 'Mix' }, { id: 'mst_g11_master', label: 'My master' }] },
        { title: 'The delivery set for "Nowhere to Go"', note: 'Every version went through the same chain and was rendered separately.', start: 0, match: false,
          clips: [{ id: 'mst_g3_master', label: 'Main' }, { id: 'mst_g3_inst', label: 'Instrumental' }, { id: 'mst_g3_acap', label: 'A cappella' }, { id: 'mst_g3_tv', label: 'TV track' }] },
      ],
      credit: 'Songs by Nashville bands Velvet Mirage and Sour Tooth, produced and mixed by Belmont students. The mastering is my work.',
      evidence: [OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Final Delivery', OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Final Project - Report', OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Analog Transfer Project', OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Restoration Project'],
    },
    {
      id: 'studio-ops', cat: 'studio', kind: 'Console sessions', onResume: true,
      title: 'Mixing through a console with outboard gear',
      short: 'Studio sessions (Columbia Studio A, Mulloy Studio A)',
      period: 'Fall 2024', role: 'Engineer in a student team; later Graduate Assistant for the same course',
      summary: 'Ensemble sessions mixed through the console with Neve preamps and outboard gear: dbx 160 and 1176LN compressors, a plate reverb, a Lexicon reverb unit and a Yamaha SPX900 effects unit. A year later I was the Graduate Assistant for the course, giving hands-on instruction to six graduate students.',
      points: ['All processing was applied during mixing, after the tracks were recorded: clean-up edits in the DAW first, then console EQ, outboard compression and hardware reverb on the console.'],
      stack: ['Large-format console', 'Neve preamps', 'dbx 160', '1176LN', 'Plate reverb', 'Lexicon reverb', 'Yamaha SPX900', 'Signal flow', 'Pro Tools'],
      audio: [
        { title: 'Session mix: "Scarified" (40-second excerpt)', clips: [{ id: 'ops_scarified', label: 'Mix' }] },
        { title: 'Session mix: "Potato Head Groove" (40-second excerpt)', clips: [{ id: 'ops_potato', label: 'Mix' }] },
        { title: 'Session mix: "Jet City Woman" (40-second excerpt)', clips: [{ id: 'ops_jetcity', label: 'Mix' }] },
      ],
      credit: 'Student ensemble sessions performing covers; group mixes from Columbia Studio A and Robert E. Mulloy Studio A.',
      evidence: [OD + '/Semester 1 - 2024 Fall/AET 5030 Studio Systems', OD + '/Semester 1 - 2024 Fall/AET 5030 Studio Systems/Mix Review Assessment'],
    },
    {
      id: 'headphone-study', cat: 'research', onResume: false, site: false, // career bank only
      title: 'Do headphones change how well you learn to hear?',
      short: 'Headphone ear-training study',
      period: 'Fall 2024', role: 'Co-author with Karlon Dockery',
      summary: 'Twenty-one students identified resonances across octave bands from 125 Hz to 8 kHz on three headphones (Sony MDR-7506, Heavys H1H, Beyerdynamic DT 770).',
      points: [
        'Designed the listening test and stimuli; analyzed the results with a three-way ANOVA (headphone, test order, frequency).',
        'Frequency and test order mattered; headphone type overall did not, though the DT 770 was more accurate at high frequencies.',
      ],
      stack: ['Listening test design', 'ANOVA', 'Technical ear training'],
      docs: [{ label: 'Read the paper (PDF)', file: 'headphone-ear-training-study.pdf' }],
      evidence: [OD + '/Semester 1 - 2024 Fall/AET 5050 Critical Listening', OD + '/Semester 1 - 2024 Fall/AET 5500 Research Methods'],
    },
    {
      id: 'gen-audio', cat: 'ml', onResume: true,
      title: 'Steering a generative audio model with musical guidance',
      short: 'Guidance-based generative audio',
      period: 'Aug 2025 - Dec 2025', role: 'Team of 15 (Dr. Scott Hawley, Deep Learning and AI Ethics)',
      summary: 'A flow model for audio generation built on Stable Audio Open, an open-source text-to-audio latent diffusion model, with guidance that targets chord, melody and beat.',
      points: [
        'Implemented guidance mechanisms that steer generation toward musically coherent output.',
        'Separately, for the class leaderboard: a ResNet convolutional VAE with a 4×4 spatial latent, plus a flow-matching model trained in that latent space (PyTorch).',
      ],
      stack: ['PyTorch', 'Latent diffusion', 'Flow matching', 'VAE', 'Hugging Face', 'Weights & Biases'],
      links: [{ label: 'Project write-up', href: 'https://hackmd.io/fL3Zv8akQouU-4J3hNnYWQ' }],
      evidence: [CL + '/DLAIE', CL + '/DLAIE/Colab Notebooks', OD + '/Semester 3 - 2025 Fall/AET 5990 DLAIE'],
    },
    {
      id: 'first-command', cat: 'software', onResume: true,
      title: 'Three years shipping financial software',
      short: 'Software Engineer, First Command',
      period: 'Jul 2021 - Jun 2024', role: 'Software Engineer, First Command Financial Services, Fort Worth, TX',
      summary: 'Event-driven back-end services, a planning web app, and large data migrations, in an Agile release train.',
      points: [
        '.NET Core Azure Functions with Azure Service Bus triggers for asynchronous, event-driven processing.',
        'An Angular (TypeScript) application that helps financial professionals plan and generate client recommendations.',
        'SQL to filter and migrate 600k+ records with data integrity intact.',
        '"Ninja Coder" award for leading testing that delivered zero defects in User Acceptance Testing.',
      ],
      stack: ['C# / .NET Core', 'Azure Functions', 'Azure Service Bus', 'Angular', 'TypeScript', 'SQL', 'Azure DevOps', 'NUnit', 'Selenium', 'Terraform'],
      evidence: [OD + '/Resumes'],
    },
    {
      id: 'lifefit', cat: 'software', onResume: false,
      title: 'LifeFit: wearable data for insurance quoting',
      short: 'LifeFit (UTA senior design, State Farm)',
      period: 'Aug 2020 - May 2021', role: 'Team of four (Dr. Chris McMurrough), sponsored by State Farm',
      summary: 'A proof-of-concept Android app exploring health-based insurance quoting from Fitbit data, built over eight Scrum sprints and shown at UTA Innovation Day 2021.',
      points: [
        'Health-status classifiers in scikit-learn (MLPClassifier) and XGBoost, with feature scaling, a train/test split and saved models (joblib).',
        'A generator for synthetic wearable data (age, calories, steps, distance, floors, heart rate, sleep score) to train on before real data existed.',
        'A scoring script that loads the trained model and scores user data pulled from Amazon S3 (boto3).',
        'Team system: Android app in Java (Retrofit, AWS S3 / Cognito SDK, Fitbit sync, charts) and a Flask API with MongoDB, Redis, Docker and Nginx.',
        'Full design record: project charter, architectural and detailed design specifications, sprint plans, reviews and burndowns.',
      ],
      stack: ['Python', 'scikit-learn', 'XGBoost', 'pandas / NumPy', 'AWS S3 (boto3)', 'Android (Java)', 'Flask', 'Scrum'],
      evidence: [CL + '/LifeFit/training data', CL + '/LifeFit/Fit_App_Statefarm-main', CL + '/LifeFit/api_ml_admin', CL + '/UTA Classes/Final Deliverables', CL + '/UTA Classes/Innovation Day - Poster.pptx'],
      caveat: 'The API repository history shows teammates as committers; the ML scripts in "training data" match the resume claim. Confirm which parts you wrote before quoting the Android or Flask work as your own.',
    },
    {
      id: 'power-bi', cat: 'software', onResume: true,
      title: 'Assessment dashboards for the Provost and Deans',
      short: 'Data Analyst, Belmont',
      period: 'May 2025 - Aug 2025', role: 'Data Analyst, Belmont University',
      summary: 'Power BI dashboards showing program assessment metrics and longitudinal trends, built while managing two student workers.',
      points: ['Reviewed data models for sound logic and long-term maintainability.'],
      stack: ['Power BI', 'Data modeling', 'Team supervision'],
      evidence: [OD + '/Student assessment'],
    },
  ];

  // ---------- Undergraduate coursework (UT Arlington, Green River College) ----------
  projects.push(
    {
      id: 'os-c', cat: 'cs', onResume: false,
      title: 'Operating systems, built in C',
      short: 'OS projects in C (shell, threads, paging, FAT32)',
      period: 'Spring 2020', role: 'UT Arlington, CSE 3320 Operating Systems',
      summary: 'Four systems programs in C that each rebuild a piece of an operating system.',
      points: [
        'A Unix shell with fork / exec / wait process control and command history.',
        'A multithreaded synchronization problem solved with pthreads, mutexes and condition variables.',
        'A page-replacement simulator comparing FIFO, LRU, MFU and Optimal.',
        'A user-space FAT32 reader: open an image and run info, stat, ls, cd, read and get against it by parsing the boot sector and FAT chains.',
      ],
      stack: ['C', 'POSIX', 'pthreads', 'Process control', 'File systems (FAT32)', 'Virtual memory'],
      evidence: [CL + '/UTA Classes/2020 Spring/CSE 3320 - Operating Systems'],
    },
    {
      id: 'graphics', cat: 'cs', onResume: false,
      title: 'A 3D graphics pipeline from matrices up',
      short: '3D graphics pipeline in C',
      period: 'Fall 2020', role: 'UT Arlington, CSE 4303 Computer Graphics',
      summary: 'A software rendering pipeline written in C across six assignments, with a Python viewer.',
      points: [
        'Matrix and transform library with unit tests; Euler-angle rotation.',
        'Perspective and parallel projection, line clipping, back-face culling.',
        'Bezier surface patches.',
      ],
      stack: ['C', 'Linear algebra', 'Transforms', 'Clipping / culling', 'Bezier surfaces', 'Python'],
      evidence: [CL + '/UTA Classes/2020 Fall/CSE 4303 Computer Graphics'],
    },
    {
      id: 'compilers', cat: 'cs', onResume: false,
      title: 'Lexers and parsers with flex and bison',
      short: 'Compiler front ends (flex / bison)',
      period: 'Spring 2021', role: 'UT Arlington, CSE 4305 Compilers',
      summary: 'Reentrant lexers and an LR parser for a small teaching language, plus a calculator with a symbol table.',
      points: ['Token definitions and lexer states in flex; grammar, AST nodes and semantic context in bison and C.'],
      stack: ['C', 'flex', 'bison', 'Grammars', 'ASTs', 'Symbol tables', 'Make'],
      evidence: [CL + '/UTA Classes/2021 Spring/CSE 4305 Compilers'],
    },
    {
      id: 'ml-scratch', cat: 'cs', onResume: false,
      title: 'Machine learning algorithms, implemented by hand',
      short: 'ML from scratch (Python / NumPy)',
      period: 'Fall 2020', role: 'UT Arlington, CSE 4309 Machine Learning',
      summary: 'Eight classic algorithms written in Python and NumPy without ML libraries.',
      points: [
        'Naive Bayes, linear regression, a neural network trained with backpropagation, decision trees, k-nearest neighbors, k-means, and value iteration for Markov decision processes.',
      ],
      stack: ['Python', 'NumPy', 'pandas', 'Supervised learning', 'Clustering', 'Reinforcement learning (MDP)'],
      evidence: [CL + '/UTA Classes/2020 Fall/CSE 4309 Machine Learning'],
    },
    {
      id: 'vision', cat: 'cs', onResume: false,
      title: 'Computer vision in MATLAB',
      short: 'Computer vision (MATLAB)',
      period: 'Spring 2021', role: 'UT Arlington, CSE 4310 Computer Vision',
      summary: 'Eight MATLAB assignments covering detection, segmentation, feature extraction, calibration and recognition. The same signal-processing habits I now use on audio.',
      points: [
        'Motion-based person detection and speed estimation from video frames; colour and morphology-based segmentation.',
        'Canny edges, oriented Hough transform, multiscale template matching (SSD and normalized correlation).',
        'Digit recognition with chamfer distance, PCA, HOG and shape-context features on MNIST.',
        'Camera calibration and 3D point estimation; gesture recognition with dynamic time warping and motion energy images.',
      ],
      stack: ['MATLAB', 'Image filtering', 'Hough transform', 'PCA', 'HOG', 'Dynamic time warping', 'Camera calibration'],
      evidence: [CL + '/UTA Classes/2021 Spring/CSE 4310 Computer Vision'],
    },
    {
      id: 'ai-search', cat: 'cs', onResume: false,
      title: 'Search, game play and logic',
      short: 'AI: search, minimax, logic (Java)',
      period: 'Spring 2020', role: 'UT Arlington, CSE 4308 Artificial Intelligence',
      summary: 'Classical AI in Java and Python.',
      points: [
        'Route finding between cities with a priority-queue graph search.',
        'A Connect Four player using depth-limited minimax with alpha-beta pruning.',
        'Propositional-logic entailment checking (extending instructor base code), and probabilistic inference exercises.',
      ],
      stack: ['Java', 'Python', 'Graph search', 'Minimax / alpha-beta', 'Propositional logic', 'Bayesian reasoning'],
      evidence: [CL + '/UTA Classes/2020 Spring/CSE 4308 - Artificial Intelligence'],
    },
    {
      id: 'networks', cat: 'cs', onResume: false,
      title: 'A web server and a routing simulator',
      short: 'Networking in Java (HTTP server, distance vector)',
      period: 'Fall 2020', role: 'UT Arlington, CSE 4344 Computer Networks',
      summary: 'Two socket-level projects in Java.',
      points: [
        'An HTTP server on raw sockets with request and response handlers, serving 200, 301 and 404 responses.',
        'A distance-vector routing simulator that steps a router network to a stable state and reacts to link-cost changes.',
      ],
      stack: ['Java', 'Sockets', 'HTTP', 'Distance-vector routing'],
      evidence: [CL + '/UTA Classes/2020 Fall/CSE 4344 Computer Networks'],
    },
    {
      id: 'android-db', cat: 'cs', onResume: false,
      title: 'Android apps and database projects',
      short: 'Android (Java, Firebase) and SQL / PHP projects',
      period: 'Fall 2019 - Spring 2020', role: 'UT Arlington, CSE 3310 Software Engineering and CSE 3330 Database Systems (team projects)',
      summary: 'A home-services ordering app for Android, and relational database projects with a PHP front end.',
      points: [
        'Android app in Java with user and vendor registration and login (Firebase Authentication), orders and order history (Firebase Realtime Database, SQLite).',
        'Software engineering record: requirements analysis, UML (context, login, order history), and a test plan.',
        'Database design from EER diagram to SQL schema, with PHP pages to insert, display and delete records.',
      ],
      stack: ['Java', 'Android', 'Firebase', 'SQLite', 'SQL', 'PHP', 'UML', 'Requirements analysis'],
      evidence: [CL + '/Academics/UTA Classes/CSE 3310 - Fundamental of SE', CL + '/Academics/UTA Classes/CSE 3310', CL + '/UTA Classes/2020 Spring/CSE 3330 - Database Systems', CL + '/UTA Classes/Other/SMS'],
      caveat: 'Team projects. The "Dataset" subfolder in Database Systems contains another group\'s files.',
    },
    {
      id: 'low-level', cat: 'cs', onResume: false,
      title: 'Close to the hardware: assembly, algorithms, embedded labs',
      short: 'ARM assembly, C algorithms, embedded labs',
      period: '2018 - 2019', role: 'UT Arlington, CSE 2312, CSE 2320, CSE 1320, CSE 2100',
      summary: 'The low-level groundwork: how code becomes instructions, and how software talks to hardware.',
      points: [
        'ARM assembly: bit reversal, endian reversal, recursive routines, and calling assembly from C.',
        'Algorithms and data structures in C: linked lists, sorting, dynamic programming (edit distance), graphs (Prim\'s minimum spanning tree).',
        'Embedded labs: Raspberry Pi setup, Git, Teensy / Arduino with analog-to-digital conversion and PWM, and a GUI controlling an LED and potentiometer.',
      ],
      stack: ['ARM assembly', 'C', 'Data structures', 'Dynamic programming', 'Raspberry Pi', 'Teensy / Arduino', 'ADC / PWM', 'Git'],
      evidence: [CL + '/Academics/UTA Classes/CSE 2312 Computer Organizations and Assembly', CL + '/Academics/UTA Classes/CSE 2320', CL + '/Academics/UTA Classes/CSE 1320 Intermediate programming C', CL + '/Academics/UTA Classes/CSE 2100 Pracical skiils'],
    },
    {
      id: 'oop', cat: 'cs', onResume: false,
      title: 'Object-oriented programming in C++ and Java',
      short: 'OOP in C++ (MavMart) and Java',
      period: '2017 - 2019', role: 'UT Arlington CSE 1325; Green River College CS 131 / 141 / 145',
      summary: 'MavMart, a store manager in C++ with a model-view-controller split, GTK dialogs, unit tests for each class, a UML model and Scrum tracking; plus earlier Java and C++ coursework.',
      points: [
        'C++: classes for products, orders and the store, a controller and view, Makefile build, per-class test programs.',
        'Java: linked lists, a binary-tree "20 Questions" game, a critter simulation, basic GUIs.',
        'Also: programming-language labs in Java, C and Python (recursive directory size, an RPN evaluator), MATLAB for engineering problem solving, R for economics, linear programming with Excel Solver.',
      ],
      stack: ['C++', 'Java', 'GTK', 'MVC', 'UML', 'Unit testing', 'Make', 'Python', 'R', 'Excel Solver'],
      evidence: [CL + '/drive-download-20210216T225427Z-001', CL + '/Academics/UTA Classes/CSE 1325 Object Oriented Programming C++', CL + '/Academics/GRC Spring 2018 (C++ and Java code)', CL + '/Academics/GRC Classes', CL + '/UTA Classes/2020 Spring/CSE 3302 - Programming Languages', CL + '/r programs'],
    },
  );

  // ---------- Career bank: resume building blocks, tagged by target role ----------
  const targets = [
    { id: 'dsp', label: 'Audio DSP / plugin developer',
      summary: 'Audio engineer and software developer with an M.S. in Audio Engineering (4.0) and three years of professional software experience. I design and implement DSP in C++ (JUCE) and MATLAB, from fractional delays and filters to nonlinear effects, and verify it by measurement and by ear.',
      lead: ['hybrid-pan', 'matlab-dsp', 'ir-modeling', 'aural-heritage', 'aes-paper', 'ap-measurement'],
      skills: ['C++ (JUCE), MATLAB, Python, JavaScript', 'Filter design, fractional delay, nonlinear processing, convolution / deconvolution, ambisonics', 'Audio Precision, Room EQ Wizard, null testing', 'Git, CMake, unit testing, CI/CD', 'Critical listening; Pro Tools'],
      keywords: ['DSP', 'JUCE', 'VST3', 'real-time audio', 'C++17', 'MATLAB', 'filters', 'latency compensation', 'APVTS'] },
    { id: 'audiosw', label: 'Audio software / web audio / tools engineer',
      summary: 'Software engineer (three years in .NET, Angular and Azure) turned audio engineer (M.S., 4.0). I build audio tools people use: a public web app that convolves and binaurally renders measured church acoustics in real time, a JUCE plugin, and analysis scripts.',
      lead: ['aural-heritage', 'hybrid-pan', 'first-command', 'ir-modeling', 'matlab-dsp', 'gen-audio'],
      skills: ['JavaScript / TypeScript (Web Audio API, Angular), C++ (JUCE), C#, Python, MATLAB', 'Real-time convolution, ambisonics, HRTF binaural, LUFS metering', 'REST APIs, Azure Functions, Service Bus, SQL', 'Git, Azure DevOps, CI/CD, Terraform, TDD, NUnit, Selenium', 'Pro Tools, WaveLab, critical listening'],
      keywords: ['Web Audio API', 'spatial audio', 'binaural', 'full-stack', 'TypeScript', 'cloud', 'testing'] },
    { id: 'studio', label: 'Recording / mixing / mastering engineer',
      summary: 'Recording and mix engineer with an M.S. in Audio Engineering (4.0). Experienced on SSL consoles in Columbia Studio A and Mulloy Studio A, in hybrid analog/digital mixing in Pro Tools, in mastering with WaveLab, and in immersive (Dolby Atmos 7.1.2) mixing. Former Graduate Assistant teaching studio operations.',
      lead: ['samba-funk', 'mix-techniques', 'mastering', 'studio-ops', 'aes-paper', 'aural-heritage'],
      skills: ['Recording: close and stereo miking (ORTF, NOS, XY, AB, Blumlein, Glyn Johns), SSL Origin, signal flow, session documentation', 'Mixing: Pro Tools editing, routing and automation; outboard (LA-2A, 1176, dbx 160); Dolby Atmos 7.1.2', 'Mastering: WaveLab, EQ, multiband dynamics, limiting, loudness normalization, deliverables (WAV / FLAC / AAC)', 'Restoration and transfer: iZotope RX, Studer A80 tape transfer', 'Critical listening; teaching and client communication'],
      keywords: ['Pro Tools', 'SSL', 'tracking', 'mixing', 'mastering', 'Atmos', 'critical listening', 'studio operations'] },
    { id: 'research', label: 'Acoustics / spatial audio / perception research',
      summary: 'Audio researcher with a peer-reviewed AES convention paper on stereophonic panning and ongoing work measuring and auralizing historic church acoustics. I design listening tests, run acoustic measurements, analyze the data, and build the software that presents the result.',
      lead: ['aes-paper', 'aural-heritage', 'headphone-study', 'room-acoustics', 'ir-modeling', 'ap-measurement'],
      skills: ['Listening test design, counterbalancing, ANOVA, technical writing', 'Impulse response measurement (REW, sine sweep), ambisonics, HRTF binaural, RT60', 'Audio Precision AP2700 electroacoustic measurement', 'MATLAB, Python, JavaScript', 'Critical listening'],
      keywords: ['psychoacoustics', 'spatial audio', 'room acoustics', 'impulse response', 'auralization', 'listening tests', 'AES'] },
    { id: 'ml', label: 'Machine learning / generative audio',
      summary: 'Computer scientist and audio engineer working on machine learning for audio. Built guidance mechanisms for a flow model on Stable Audio Open, trained VAE and flow-matching models in PyTorch, and shipped production software for three years.',
      lead: ['gen-audio', 'aural-heritage', 'matlab-dsp', 'lifefit', 'first-command', 'aes-paper'],
      skills: ['PyTorch, Hugging Face, Weights & Biases, scikit-learn, XGBoost', 'Latent diffusion, flow matching, VAEs, guidance', 'Python, MATLAB, C++, JavaScript', 'Audio DSP and perceptual evaluation', 'Git, CI/CD, cloud (Azure)'],
      keywords: ['PyTorch', 'generative audio', 'diffusion', 'flow matching', 'Stable Audio Open', 'MIR'] },
    { id: 'swe', label: 'Software engineer (general)',
      summary: 'Software engineer with three years building event-driven .NET services on Azure and Angular applications in a regulated financial environment, recognized for zero-defect UAT delivery. Recently completed an M.S. (4.0) with a public, tested JavaScript application and a C++ plugin.',
      lead: ['first-command', 'aural-heritage', 'hybrid-pan', 'lifefit', 'power-bi', 'gen-audio'],
      skills: ['C#, TypeScript (Angular), JavaScript, Python, Java, C++, C', '.NET Core, Azure Functions, Service Bus, Spring Boot, REST and SOAP services', 'SQL, SOQL, KQL', 'Git, Azure DevOps, CI/CD, Terraform, Agile / SAFe, TDD, NUnit, Selenium', 'Release and rollback procedures'],
      keywords: ['.NET', 'Azure', 'Angular', 'event-driven', 'SQL', 'testing', 'Agile'] },
    { id: 'embedded', label: 'Embedded audio / systems / firmware',
      summary: 'Audio engineer and C / C++ programmer. I write real-time DSP in C++ (JUCE) with attention to latency and click-free parameter changes, and my computer science degree covered the layers underneath: operating systems in C, ARM assembly, and microcontroller labs.',
      lead: ['hybrid-pan', 'matlab-dsp', 'os-c', 'low-level', 'ir-modeling', 'ap-measurement'],
      skills: ['C, C++ (JUCE), ARM assembly, MATLAB, Python', 'Real-time DSP: filters, fractional delay, nonlinear processing, lock-free parameter passing', 'Systems: POSIX processes and threads, file systems, memory management', 'Hardware: Audio Precision AP2700, Teensy / Arduino (ADC, PWM), Raspberry Pi', 'Git, CMake, Make, unit testing'],
      keywords: ['embedded', 'firmware', 'C', 'real-time', 'DSP', 'ARM', 'RTOS concepts', 'fixed latency'] },
    { id: 'data', label: 'Data / BI analyst',
      summary: 'Analyst and engineer who delivered Power BI dashboards to a university Provost and Deans, migrated 600k+ records in SQL, and ran statistical analyses (ANOVA) for published research.',
      lead: ['power-bi', 'first-command', 'headphone-study', 'aes-paper', 'lifefit'],
      skills: ['Power BI, data modeling', 'SQL, SOQL, KQL', 'Python (scikit-learn, XGBoost), MATLAB, R', 'Statistics: ANOVA, experimental design', 'Stakeholder reporting; supervising student workers'],
      keywords: ['Power BI', 'SQL', 'dashboards', 'statistics', 'data migration'] },
  ];

  // Bullets: t = targets they suit. Wording follows the current resume; "alt" bullets are extra angles backed by the files.
  const experience = [
    { id: 'ra', title: 'Research Assistant', org: 'Belmont University, Nashville, TN', dates: 'June 2025 - present', project: 'aural-heritage', bullets: [
      { t: ['research', 'dsp', 'audiosw', 'studio'], text: 'Under the supervision of Dr. Doyuen Ko, took acoustic measurements to capture impulse responses (IRs) of historically significant churches in the US using Room EQ Wizard (REW), omnidirectional and ambisonic microphones, with calibrated loudspeaker excitation across multiple spatial positions.' },
      { t: ['audiosw', 'swe', 'dsp', 'research', 'ml'], text: 'Developed an interactive web application (churchauralheritage.org) using JavaScript to visualize 360° imagery of church interiors and perform real-time convolution of captured IRs with audio samples.' },
      { t: ['dsp', 'audiosw', 'research'], text: 'Created a head-tracked binaural rendering pipeline that converts A-format ambisonic IRs to B-format and decodes them to binaural in real time with HRTFs in the Web Audio API; the soundfield rotates with the 360° view, and binaural and stereo renders are loudness-matched using ITU-R BS.1770 LUFS measurement.' },
      { t: ['swe', 'audiosw'], alt: true, text: 'Wrote a dependency-free Node test suite that exercises the real audio-graph, room-data and UI code against test doubles for the DOM and Web Audio, and deployed the static site on Netlify.' },
      { t: ['dsp', 'audiosw'], alt: true, text: 'Built command-line tools for A-format to B-format conversion and BS.1770 loudness measurement for the impulse-response library.' },
    ] },
    { id: 'ga', title: 'Graduate Assistant', org: 'Belmont University, Nashville, TN', dates: 'August 2025 - Dec 2025', project: 'studio-ops', bullets: [
      { t: ['studio', 'research', 'audiosw'], text: 'Supported six graduate students in a Studio Systems and Operations course, providing hands-on instruction in recording techniques and operation of a Solid State Logic (SSL) console.' },
      { t: ['studio', 'dsp'], text: 'Engineered and mixed high-quality music recordings (24-bit/48 kHz) in Columbia Studio A and Robert E. Mulloy Studio A.' },
    ] },
    { id: 'da', title: 'Data Analyst', org: 'Belmont University, Nashville, TN', dates: 'May 2025 - August 2025', project: 'power-bi', bullets: [
      { t: ['data', 'swe', 'audiosw', 'ml'], text: 'Delivered Power BI dashboards for the Provost and Deans while independently managing two student workers.' },
      { t: ['data'], alt: true, text: 'Supervised two student workers in reviewing Power BI data models to ensure robust logic, flexibility and sustainability of dashboards for long-term academic assessment reporting.' },
      { t: ['data'], alt: true, text: 'Visualized program assessment metrics and longitudinal trends to support data-driven decisions.' },
    ] },
    { id: 'fc', title: 'Software Engineer', org: 'First Command Financial Services Inc., Fort Worth, TX', dates: 'July 2021 - June 2024', project: 'first-command', bullets: [
      { t: ['swe', 'audiosw', 'ml', 'dsp'], text: 'Designed and implemented .NET Core Azure Functions with Azure Service Bus triggers to handle asynchronous, event-driven processing, enabling reliable message handling and automated workflow execution.' },
      { t: ['swe', 'audiosw'], text: 'Built an Angular (TypeScript) web application to help financial professionals efficiently plan and generate client recommendations.' },
      { t: ['swe', 'data', 'ml'], text: 'Optimized and executed SQL queries to filter and migrate 600k+ records, ensuring data integrity and seamless transitions.' },
      { t: ['swe', 'audiosw', 'dsp', 'data'], text: 'Recognized with "Ninja Coder" award for leading rigorous testing initiatives, establishing high-quality standards, and delivering zero defects during User Acceptance Testing (UAT).' },
    ] },
  ];

  const projectBullets = [
    { project: 'aes-paper', heading: 'Research Project: Stereophonic Panning Techniques Study (under Dr. Song Hui Chon and Dr. Wesley A. Bulla) - Belmont University', dates: 'April 2025 - Oct 2025', bullets: [
      { t: ['research', 'dsp', 'studio', 'audiosw', 'ml', 'data'], text: 'Co-authored an academic paper (AES E-Library 23064) investigating the perceptual impact of Inter-Channel Time Difference (ICTD), Inter-Channel Level Difference (ICLD), and hybrid panning techniques on spatial audio perception and listener preference.' },
      { t: ['research', 'dsp', 'studio', 'audiosw'], text: 'Presented findings at the 159th Audio Engineering Society Convention in Long Beach, CA (October 2025) as a peer-reviewed Express Paper.' },
      { t: ['research', 'data'], alt: true, text: 'Prepared thirty stimuli from ten multitrack recordings and ran counterbalanced paired-comparison tests on headphones and loudspeakers; hybrid panning scored significantly higher for depth and was strongly preferred on loudspeakers.' },
    ] },
    { project: 'gen-audio', heading: 'Guidance-Based Generative Audio Model (under Dr. Scott Hawley) - Belmont University', dates: 'August 2025 - Dec 2025', bullets: [
      { t: ['ml', 'dsp', 'audiosw', 'swe', 'research'], text: 'Contributed to a 15-member team to build a flow model for audio generation leveraging Stable Audio Open, an open-source text-to-audio latent diffusion model.' },
      { t: ['ml', 'dsp', 'audiosw', 'research'], text: 'Implemented guidance mechanisms targeting musical features like chord, melody, and beat to steer audio generation toward stylistically coherent outputs.' },
      { t: ['ml'], alt: true, text: 'Trained a ResNet convolutional VAE and a latent flow-matching model in PyTorch for a class leaderboard.' },
    ] },
    { project: 'hybrid-pan', heading: 'Hybrid Pan: real-time stereo panner plugin (C++ / JUCE)', dates: '2026', bullets: [
      { t: ['dsp', 'audiosw', 'swe'], alt: true, text: 'Ported the three panning laws from my AES paper to a real-time C++17 / JUCE plugin (VST3, AU, Standalone) with a streaming third-order Lagrange fractional delay and a Butterworth crossover.' },
      { t: ['dsp', 'audiosw'], alt: true, text: 'Made the offline MATLAB interpolator causal with a constant one-sample latency reported to the host, and verified the panning math and interpolator numerically against the MATLAB reference.' },
    ] },
    { project: 'ir-modeling', heading: 'Linear System Modeling using Impulse Responses (team project) - Belmont University', dates: 'Spring 2026', bullets: [
      { t: ['dsp', 'research', 'audiosw'], alt: true, text: 'Modeled a GML 8200 hardware EQ from sine-sweep measurements using spectral division and Tikhonov-regularized deconvolution in MATLAB, aligned by cross-correlation and validated with null tests against the hardware.' },
    ] },
    { project: 'ap-measurement', heading: 'Electroacoustic measurement (Audio Precision AP2700)', dates: 'April 2025', bullets: [
      { t: ['dsp', 'research', 'studio'], alt: true, text: 'Measured frequency response, THD+N, inter-channel phase, crosstalk and SNR of two audio interfaces on an Audio Precision AP2700 and compared the results with manufacturer specifications.' },
    ] },
    { project: 'samba-funk', heading: 'Samba Funk - AES Student Recording Competition entry (Category 2: Studio Recording)', dates: 'Oct 2024 - April 2026', bullets: [
      { t: ['studio'], alt: true, text: 'Recorded, edited and mixed a jazz quartet on an SSL Origin (48 kHz / 24-bit) using Glyn Johns overheads and isolated booths; mixed in Pro Tools with a hardware LA-2A and tape emulation, and produced a Dolby Atmos 7.1.2 mix.' },
    ] },
    { project: 'mastering', heading: 'Mastering, analog transfer and restoration', dates: 'Spring 2025', bullets: [
      { t: ['studio'], alt: true, text: 'Mastered two rock tracks in WaveLab across multiple revision rounds and delivered main, instrumental, a cappella and TV versions in WAV, FLAC and AAC; transferred 30 ips analog tape on a Studer A80 and restored archival audio with iZotope RX.' },
    ] },
    { project: 'lifefit', heading: 'LifeFit Android App (under Dr. Chris McMurrough) - UT Arlington / State Farm Insurance', dates: 'August 2020 - May 2021', bullets: [
      { t: ['swe', 'ml', 'data'], alt: true, text: 'Collaborated with a team of four to develop a proof-of-concept application for State Farm exploring health-based insurance quoting using wearable data from Fitbit.' },
      { t: ['ml', 'data', 'swe'], alt: true, text: 'Built and evaluated machine learning models using scikit-learn and XGBoost to predict and score individual health outcomes based on aggregated data.' },
    ] },
  ];

  projectBullets.push(
    { project: 'os-c', heading: 'Operating Systems projects (C) - UT Arlington', dates: 'Spring 2020', bullets: [
      { t: ['embedded', 'swe', 'dsp'], alt: true, text: 'Implemented a Unix shell, a pthreads synchronization solution, a page-replacement simulator (FIFO, LRU, MFU, Optimal) and a user-space FAT32 file-system reader in C.' },
    ] },
    { project: 'low-level', heading: 'Computer Organization, Algorithms and Embedded labs - UT Arlington', dates: '2018 - 2019', bullets: [
      { t: ['embedded', 'dsp'], alt: true, text: 'Wrote ARM assembly routines called from C, and completed microcontroller labs on a Teensy covering analog-to-digital conversion and PWM.' },
      { t: ['swe', 'embedded'], alt: true, text: 'Implemented core data structures and algorithms in C, including dynamic-programming edit distance and Prim\'s minimum spanning tree.' },
    ] },
    { project: 'graphics', heading: '3D graphics pipeline (C) - UT Arlington', dates: 'Fall 2020', bullets: [
      { t: ['swe', 'embedded', 'dsp'], alt: true, text: 'Built a software 3D pipeline in C: a tested matrix and transform library, projection, clipping, back-face culling and Bezier patches.' },
    ] },
    { project: 'ml-scratch', heading: 'Machine Learning coursework - UT Arlington', dates: 'Fall 2020', bullets: [
      { t: ['ml', 'data'], alt: true, text: 'Implemented Naive Bayes, linear regression, a backpropagation neural network, decision trees, k-NN, k-means and value iteration from scratch in Python and NumPy.' },
    ] },
    { project: 'vision', heading: 'Computer Vision coursework (MATLAB) - UT Arlington', dates: 'Spring 2021', bullets: [
      { t: ['ml', 'dsp', 'research'], alt: true, text: 'Implemented edge detection, Hough transforms, template matching, PCA and HOG features, camera calibration and DTW gesture recognition in MATLAB.' },
    ] },
    { project: 'compilers', heading: 'Compilers coursework - UT Arlington', dates: 'Spring 2021', bullets: [
      { t: ['swe', 'embedded'], alt: true, text: 'Built reentrant lexers and an LR parser with AST construction for a small language using flex, bison and C.' },
    ] },
    { project: 'networks', heading: 'Computer Networks projects (Java) - UT Arlington', dates: 'Fall 2020', bullets: [
      { t: ['swe', 'audiosw'], alt: true, text: 'Wrote an HTTP server on raw sockets and a distance-vector routing simulator in Java.' },
    ] },
    { project: 'android-db', heading: 'Android and database team projects - UT Arlington', dates: 'Fall 2019 - Spring 2020', bullets: [
      { t: ['swe'], alt: true, text: 'Developed an Android home-services app in Java with Firebase Authentication and Realtime Database in a team, with requirements, UML and a test plan.' },
      { t: ['swe', 'data'], alt: true, text: 'Designed a relational database from EER diagram to SQL schema and built PHP pages to manage its records.' },
    ] },
  );
  const lf = projectBullets.find(x => x.project === 'lifefit');
  lf.bullets.push({ t: ['ml', 'data', 'swe'], alt: true, text: 'Trained and compared MLP and XGBoost health-status classifiers on generated wearable data, and wrote a scoring script that reads user data from Amazon S3.' });

  const skillBank = [
    { group: 'Programming languages', items: 'MATLAB, Python, JavaScript, TypeScript (Angular), C#, Java, C++ (JUCE), C' },
    { group: 'Audio DSP', items: 'Filter design (FIR / IIR), fractional delay, nonlinear effects, convolution and deconvolution, ambisonics (A/B-format), HRTF binaural, LUFS (ITU-R BS.1770), Web Audio API' },
    { group: 'Measurement', items: 'Room EQ Wizard, impulse responses, sine sweeps, Audio Precision AP2700, RT60, null testing' },
    { group: 'Backend & API development', items: 'Spring Boot (REST & SOAP services), REST APIs, SOAP web services, object-oriented design, .NET Core, Azure Functions, Service Bus' },
    { group: 'Machine learning', items: 'PyTorch, Hugging Face, Weights & Biases, scikit-learn, XGBoost' },
    { group: 'DevOps & practices', items: 'Git, Azure DevOps, CI/CD pipelines, Terraform, Agile / SAFe Scrum (PI Planning), TDD, NUnit, Selenium' },
    { group: 'Database query languages', items: 'SQL, SOQL (Salesforce), KQL (log and telemetry analytics)' },
    { group: 'Recording', items: 'Close and stereo miking: ORTF, NOS, XY, AB spaced pairs, Blumlein; SSL consoles' },
    { group: 'Mixing', items: 'Hybrid analog/digital workflows; Avid Pro Tools editing, routing and automation; Dolby Atmos 7.1.2' },
    { group: 'Mastering', items: 'Steinberg WaveLab: EQ, multiband dynamics, limiting, loudness normalization, distribution-ready masters; iZotope RX restoration' },
    { group: 'Data', items: 'Power BI, ANOVA, experimental design, pandas, NumPy, R, Excel Solver (linear programming)' },
    { group: 'Systems programming', items: 'C, POSIX processes (fork / exec / wait), pthreads (mutexes, condition variables), FAT32, page replacement, ARM assembly, Make' },
    { group: 'Embedded', items: 'Teensy / Arduino (ADC, PWM), Raspberry Pi (Raspbian), C and assembly interop' },
    { group: 'Mobile and web', items: 'Android (Java), Firebase Authentication and Realtime Database, SQLite, Retrofit, PHP, HTML / CSS' },
    { group: 'Cloud and data stores', items: 'Azure (Functions, Service Bus), AWS S3 (boto3), MongoDB, Redis, Docker, Nginx (team project exposure)' },
    { group: 'Compilers and languages', items: 'flex, bison, grammars, ASTs' },
    { group: 'Computer vision and classical ML', items: 'MATLAB image processing, Hough transform, PCA, HOG, DTW; Naive Bayes, decision trees, k-NN, k-means, neural networks from scratch' },
    { group: 'Graphics and networking', items: '3D transforms, projection, clipping, Bezier surfaces; sockets, HTTP, distance-vector routing' },
    { group: 'Software design', items: 'OOP in C++ and Java, MVC, UML, requirements analysis, test plans, Scrum sprints' },
    { group: 'Soft skills', items: 'Critical listening, team collaboration, teaching, release cycle and rollback procedures, adaptability' },
    { group: 'Languages', items: 'English, Nepali, Hindi, Japanese' },
  ];

  // Other material found in the folders that is not on the site but may be useful for a specific application.
  const archive = [
    { what: 'Resumes, CVs, cover letters, job tracker', path: OD + '/Resumes' },
    { what: 'Existing Yamaha DSP internship portfolio (curated folder + overview PDF)', path: Y },
    { what: 'Pro Tools sessions (Samba Funk, mixing assignments, FPC)', path: OD + '/Pro Tools Storage' },
    { what: 'Auditory Perception: research précis and project specification', path: OD + '/Semester 2 - 2025 Spring/AET 5230 Auditory Perception and Hearing Science' },
    { what: 'Mastering listening journals and listening-system review', path: OD + '/Semester 2 - 2025 Spring/AET 5070 Mastering & Evaluation/Listening Journal' },
    { what: 'Acoustics literature reviews (control rooms, halls, room parameters)', path: OD + '/Semester 2 - 2025 Spring/AET 5010 Acoustics' },
    { what: 'Pole-zero EQ GUI and biquad calculator (MATLAB)', path: OD + '/Semester 4 - 2026 Spring/AET 5420 Audio Signal Processing/PoleZeroEQ' },
    { what: 'UTA coursework: AI assignments, operating systems, databases, senior design', path: CL + '/Academics/UTA Classes' },
    { what: 'UTA senior design deliverables and Innovation Day poster', path: CL + '/UTA Classes' },
    { what: 'Green River College coursework (C++, Java)', path: CL + '/Academics/GRC Classes' },
    { what: 'R programs (economics coursework)', path: CL + '/r programs' },
  ];

  // Bullets that suit DSP roles also suit embedded audio roles.
  [...experience, ...projectBullets].forEach(x => x.bullets.forEach(b => {
    if (b.t.includes('dsp') && !b.t.includes('embedded')) b.t.push('embedded');
  }));

  // Site pages. "cats" lists the project categories shown on that page.
  const pages = [
    { id: 'home', file: 'index.html', nav: 'Home', title: 'Kritan Duwal - Audio engineering and audio software' },
    { id: 'listen', file: 'listen.html', nav: 'Listen', title: 'Listen - Kritan Duwal',
      heading: 'Listen', intro: 'All the audio in one place. Every player switches between versions in sync, so you can A/B without losing your place. Press 1-4 to switch while a player has focus. Headphones help.' },
    { id: 'research', file: 'research.html', nav: 'Research', title: 'Research and spatial audio - Kritan Duwal', cats: ['research'],
      heading: 'Research and spatial audio', intro: 'Two projects about how sound occupies a space. Aural Heritage captures the measured acoustics of historic churches and lets you listen from any position in the room. The AES paper is a peer-reviewed listening study on whether panning with time as well as level makes a difference in listener preference.' },
    { id: 'dsp', file: 'dsp.html', nav: 'DSP & measurement', title: 'DSP, plugins and measurement - Kritan Duwal', cats: ['dsp', 'measure'],
      heading: 'DSP, plugins and measurement', intro: 'Signal processing I wrote, and the measurements that tell me whether it works: a real-time plugin, effects built from difference equations, hardware modeled from its impulse response, and bench and room measurements.' },
    { id: 'studio', file: 'studio.html', nav: 'Studio', title: 'Recording, mixing and mastering - Kritan Duwal', cats: ['studio'],
      heading: 'Recording, mixing and mastering', intro: 'Four separate pieces of work. Samba Funk is a session I recorded and mixed, shown from microphone choice to final mix. The mixing coursework isolates one technique at a time on multitracks from the Cambridge Music Technology library. The mastering project takes other engineers\' mixes to delivery. The console sessions are group mixes through outboard gear.' },
    { id: 'software', file: 'software.html', nav: 'Software & ML', title: 'Software and machine learning - Kritan Duwal', cats: ['ml', 'software', 'cs'],
      heading: 'Software and machine learning', intro: 'Three years as a professional software engineer, machine learning for audio, and the computer science underneath.' },
    { id: 'about', file: 'about.html', nav: 'About', title: 'About - Kritan Duwal' },
  ];

  const data = { person, categories, pages, projects, targets, experience, projectBullets, skillBank, archive };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.PORTFOLIO = data;
})(typeof window !== 'undefined' ? window : globalThis);
