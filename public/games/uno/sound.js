/**
 * Lightweight Synthesized Web Audio Sound Effects for UNO.
 * Zero external audio files, works offline, instant response.
 */

class UnoSoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.loadSetting();
  }

  loadSetting() {
    try {
      const saved = localStorage.getItem('uno_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch (e) {
      // LocalStorage might be restricted
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('uno_sound_enabled', this.enabled);
    } catch (e) {}
    if (this.enabled) {
      this.initCtx();
      this.playCardPlay();
    }
    return this.enabled;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playNoise(duration = 0.08, gainVal = 0.06) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  playCardPlay() {
    this.playNoise(0.07, 0.08);
    this.playTone(480, 'triangle', 0.09, 0.07);
  }

  playCardDraw() {
    this.playNoise(0.09, 0.05);
    this.playTone(320, 'sine', 0.1, 0.05);
  }

  playActionWhoosh() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playAttackPenalty() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    [440, 370, 311, 261].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.1, 0.08), i * 70);
    });
  }

  playUnoCall() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Bright fanfare for UNO shout
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.12), i * 100);
    });
  }

  playNotification() {
    this.playTone(880, 'sine', 0.12, 0.08);
    setTimeout(() => this.playTone(1320, 'sine', 0.2, 0.07), 80);
  }

  playChatNotification() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } catch (e) {}
  }

  playError() {
    this.playTone(180, 'sawtooth', 0.14, 0.07);
  }

  playWinFanfare() {
    if (!this.enabled) return;
    const melody = [
      { f: 523.25, d: 0.12, g: 0.1 },
      { f: 659.25, d: 0.12, g: 0.1 },
      { f: 783.99, d: 0.14, g: 0.12 },
      { f: 1046.50, d: 0.35, g: 0.15 }
    ];

    melody.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, note.g);
      }, index * 120);
    });
  }
}

// Global instance for browser
if (typeof window !== 'undefined') {
  window.UnoSound = new UnoSoundEngine();
}
