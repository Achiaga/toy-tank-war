export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Master volume
    this.masterGain.connect(this.ctx.destination);

    this.startEngineSound();
    this.startMusic();
  }

  playShoot() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime + 0.02;

    /* =========================
     1. Sharp transient "P"
  ========================= */
    const crackSize = Math.floor(this.ctx.sampleRate * 0.03);
    const crackBuffer = this.ctx.createBuffer(
      1,
      crackSize,
      this.ctx.sampleRate
    );
    const crackData = crackBuffer.getChannelData(0);

    for (let i = 0; i < crackSize; i++) {
      crackData[i] = Math.random() * 2 - 1;
    }

    const crack = this.ctx.createBufferSource();
    crack.buffer = crackBuffer;

    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = "highpass";
    crackFilter.frequency.setValueAtTime(1800, t);

    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(0.5, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.masterGain);
    crack.start(t);

    /* =========================
     2. Main low boom "UM"
  ========================= */
    const boomOsc = this.ctx.createOscillator();
    boomOsc.type = "sine";
    boomOsc.frequency.setValueAtTime(90, t);
    boomOsc.frequency.exponentialRampToValueAtTime(38, t + 0.08);

    const boomLowpass = this.ctx.createBiquadFilter();
    boomLowpass.type = "lowpass";
    boomLowpass.frequency.value = 220;

    const boomGain = this.ctx.createGain();
    boomGain.gain.setValueAtTime(0.8, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    boomOsc.connect(boomLowpass);
    boomLowpass.connect(boomGain);
    boomGain.connect(this.masterGain);
    boomOsc.start(t);
    boomOsc.stop(t + 0.3);

    /* =========================
     3. Sub punch (chest hit)
  ========================= */
    const subOsc = this.ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(55, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.2);

    /* =========================
     4. Low-mid body thud
  ========================= */
    const bodySize = Math.floor(this.ctx.sampleRate * 0.12);
    const bodyBuffer = this.ctx.createBuffer(1, bodySize, this.ctx.sampleRate);
    const bodyData = bodyBuffer.getChannelData(0);

    for (let i = 0; i < bodySize; i++) {
      bodyData[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const body = this.ctx.createBufferSource();
    body.buffer = bodyBuffer;

    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(500, t);
    bodyFilter.frequency.exponentialRampToValueAtTime(120, t + 0.15);

    const bodyGain = this.ctx.createGain();
    bodyGain.gain.setValueAtTime(0.4, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    body.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    body.start(t);
  }

  playExplosion() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Create noise buffer
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  startEngineSound() {
    if (!this.ctx) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 50;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.05; // Quiet idle

    // Lowpass filter to muffle it
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
  }

  updateEngine(speed) {
    if (!this.engineOsc) return;
    // Speed is roughly 0 to 0.2
    const targetFreq = 50 + speed * 800;
    this.engineOsc.frequency.setTargetAtTime(
      targetFreq,
      this.ctx.currentTime,
      0.1
    );
  }

  startMusic() {
    if (!this.ctx) return;
    // Just a simple bass drone for now
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 55; // A1

    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;

    // LFO for pulsing
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.5; // Slow pulse
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();
  }
}

export const audioManager = new AudioManager();
