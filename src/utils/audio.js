// Web Audio API Advanced Ambient & Frequency System for Zenith
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch (e) {
      console.warn('Chime error:', e);
    }
  }

  playClick() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  stopCurrentSound() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (err) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  playTrack(trackId) {
    this.init();
    if (this.isPlaying && this.currentTrack === trackId) {
      this.stopCurrentSound();
      return false;
    }

    this.stopCurrentSound();
    this.currentTrack = trackId;

    if (trackId === 'rain') {
      this.startRainOnly();
    } else if (trackId === '432hz') {
      // 432Hz kết hợp nhạc pad êm dịu
      this.startAmbientMusicWithTone(432, [216, 288, 324, 432]);
    } else if (trackId === '528hz') {
      // 528Hz Solfeggio kết hợp hợp âm dịu
      this.startAmbientMusicWithTone(528, [264, 330, 396, 528]);
    } else if (trackId === 'alpha') {
      // Sóng Alpha 10Hz kết hợp tiếng mưa & hợp âm Lofi
      this.startBinauralWithAmbient(432, 442);
    } else if (trackId === 'gamma') {
      // Sóng Gamma 40Hz Deep Work kết hợp tiếng sóng biển nhẹ
      this.startBinauralWithAmbient(200, 240);
    }

    this.isPlaying = true;
    return true;
  }

  // Tạo texture mưa/sóng biển nền nhẹ nhàng
  createBackgroundNoise(filterFreq = 650, gainVal = 0.04) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start();
    this.activeNodes.push(noiseNode, filter, gain);
  }

  startRainOnly() {
    this.createBackgroundNoise(750, 0.09);
  }

  // Tần số kết hợp hợp âm thiền ambient êm dịu (nhạc đệm mượt như spa/lofi)
  startAmbientMusicWithTone(mainFreq, chordFreqs) {
    const now = this.ctx.currentTime;

    // 1. Nhạc nền texture mềm
    this.createBackgroundNoise(500, 0.035);

    // 2. Tần số chính (êm, không chói tai)
    const mainOsc = this.ctx.createOscillator();
    mainOsc.type = 'sine';
    mainOsc.frequency.setValueAtTime(mainFreq, now);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(0.035, now + 1.5);

    mainOsc.connect(mainGain);
    mainGain.connect(this.ctx.destination);
    mainOsc.start(now);
    this.activeNodes.push(mainOsc, mainGain);

    // 3. Các nốt hợp âm dịu dàng (Harmonic Ambient Pad)
    chordFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass filter tạo cảm giác nhạc xa xăm mượt mà
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + idx * 60, now);

      // LFO tạo nhịp thở nhẹ (tremolo)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.008, now);
      lfo.connect(lfoGain);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 2);
      lfoGain.connect(gain.gain);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      lfo.start(now);
      this.activeNodes.push(osc, filter, gain, lfo, lfoGain);
    });
  }

  // Sóng não Binaural beats kết hợp nhạc nền
  startBinauralWithAmbient(freqL, freqR) {
    const now = this.ctx.currentTime;

    // 1. Nền mưa lofi khử tiếng ồn
    this.createBackgroundNoise(550, 0.04);

    // 2. Binaural Stereo Beats
    const merger = this.ctx.createChannelMerger(2);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(freqL, now);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(freqR, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 1.5);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.ctx.destination);

    oscL.start(now);
    oscR.start(now);
    this.activeNodes.push(oscL, oscR, merger, gain);
  }
}

export const sound = new SoundSystem();
