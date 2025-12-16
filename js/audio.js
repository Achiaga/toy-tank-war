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
    console.log("playShoot called, ctx.state:", this.ctx?.state); // Check console

    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime + 0.03; // Safer buffer

    // Noise burst (sharper attack)
    const noiseBufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(
      1,
      noiseBufferSize,
      this.ctx.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.8;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noiseGain.linearRampToValueAtTime(0, t + 0.1);

    // Lowpass for "zap"
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(1500, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    // Main pew tone (sawtooth + detune for laser vibe)
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1200, t); // Higher, punchier start
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);
    osc.detune.setValueAtTime(0, t);
    osc.detune.linearRampToValueAtTime(-20, t + 0.25); // Slight pitch drop

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.02); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    gain.linearRampToValueAtTime(0, t + 0.3); // Clean tail

    // Filter sweep (key for "pew" feel)
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    filter.Q.setValueAtTime(1, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);

    // Cleanup (prevents leaks on rapid fire)
    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
      filter.disconnect();
      noise.disconnect();
      noiseGain.disconnect();
      noiseFilter.disconnect();
    }, 350);
    console.log("Pew scheduled at", t);
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
