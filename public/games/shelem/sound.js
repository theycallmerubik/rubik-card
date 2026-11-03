/**
 * Lightweight Synthesized Web Audio Sound Effects for Hokm.
 * Zero external audio files, works offline, instant response.
 */

class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.loadSetting();
  }

  loadSetting() {
    try {
      const saved = localStorage.getItem('hokm_sound_enabled');
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
      localStorage.setItem('hokm_sound_enabled', this.enabled);
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

  // Card slide / deal sound (crisp filtered noise burst)
  playDeal() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // Card played onto table
  playCardPlay() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  // Hokm card slammed onto table (visceral wood smash + sharp card crack)
  playHokmSlam() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Sharp Card Snap / Crack (high-velocity paper slap)
      const noiseLen = Math.floor(this.ctx.sampleRate * 0.045);
      const noiseBuffer = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(2600, now);
      snapFilter.Q.setValueAtTime(2.2, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.55, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      noiseSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Heavy Wood Table Body Thump (deep hollow cabinet resonance)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(185, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.28);

      subGain.gain.setValueAtTime(0.75, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.28);

      // 3. Mid Knuckle / Impact Whack (hard punch)
      const midOsc = this.ctx.createOscillator();
      const midGain = this.ctx.createGain();
      midOsc.type = 'triangle';
      midOsc.frequency.setValueAtTime(520, now);
      midOsc.frequency.exponentialRampToValueAtTime(65, now + 0.09);

      midGain.gain.setValueAtTime(0.5, now);
      midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      midOsc.connect(midGain);
      midGain.connect(this.ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + 0.09);
    } catch (e) {}
  }

  // Trick won (cheerful chime)
  playTrickWin() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, 0.12);
      }, idx * 60);
    });
  }

  // Hokm selected (royal fanfare)
  playHokmFanfare() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.15);
      }, idx * 80);
    });
  }

  // Game Victory
  playVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.5, 0.2);
      }, idx * 110);
    });
  }

  // Kot / Big event
  playKot() {
    if (!this.enabled) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.35, 0.08);
      }, idx * 70);
    });
  }

  // Chat notification chime (pleasant 2-tone chime)
  playChatNotification() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Note 1: 587.33 Hz (D5)
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

      // Note 2: 880 Hz (A5)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.09);
      gain2.gain.setValueAtTime(0.14, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.28);
    } catch (e) {}
  }

  // Alias methods for compatibility
  playCardSlide() {
    this.playCardPlay();
  }

  playTableKnock() {
    this.playHokmSlam();
  }

  playFanfare() {
    this.playHokmFanfare();
  }

  playNotification() {
    this.playChatNotification();
  }

  isSoundEnabled() {
    return this.enabled;
  }

  toggleSound() {
    return this.toggle();
  }
}

// Global instances
window.soundEngine = new SoundEngine();
window.HokmSound = window.soundEngine;
