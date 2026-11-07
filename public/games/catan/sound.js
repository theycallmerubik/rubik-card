/**
 * Catan (کاتان) - Web Audio Procedural Sound Engine
 * Synthesizes tactile dice rolls, resource chimes, building construction,
 * robber movements, and victory fanfares.
 * Universal sound preference persisted via 'rubik_card_sound'.
 */

class CatanSoundEngine {
  constructor() {
    this.ctx = null;
    const saved = localStorage.getItem('rubik_card_sound');
    this.muted = saved === 'false';
  }

  init() {
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

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('rubik_card_sound', (!this.muted).toString());
      localStorage.setItem('hokm_sound_enabled', (!this.muted).toString());
      localStorage.setItem('uno_sound_enabled', (!this.muted).toString());
    } catch (_) {}
    return this.muted;
  }

  setMuted(m) {
    this.muted = !!m;
    try {
      localStorage.setItem('rubik_card_sound', (!this.muted).toString());
      localStorage.setItem('hokm_sound_enabled', (!this.muted).toString());
      localStorage.setItem('uno_sound_enabled', (!this.muted).toString());
    } catch (_) {}
  }

  // Realistic 2d6 Dice Roll Rattle & Drop
  playDiceRoll() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 4 rapid click/clack bounces followed by settling thud
      [0, 0.05, 0.11, 0.18, 0.26].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const freq = idx === 4 ? 120 : (240 + Math.random() * 180);
        osc.frequency.setValueAtTime(freq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.04);

        gain.gain.setValueAtTime(idx === 4 ? 0.35 : 0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + (idx === 4 ? 0.08 : 0.04));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch (_) {}
  }

  // Cheerful Resource Collection Chime
  playResource() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
      notes.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.06);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    } catch (_) {}
  }

  // Road Construction Tap
  playBuildRoad() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // Settlement Construction (Wooden & Stone Chime)
  playBuildSettlement() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.32);
      });
    } catch (_) {}
  }

  // City Construction (Majestic Bell & Cathedral Resonance)
  playBuildCity() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A Major chord
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.8 : 0.4));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + (idx === 3 ? 0.85 : 0.45));
      });
    } catch (_) {}
  }

  // Robber Horn & Dramatic Swoosh
  playRobber() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }

  // Development Card Purchase / Play
  playDevCard() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (_) {}
  }

  // Triumphant Victory Fanfare (10 Victory Points Reached)
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.9 : 0.4));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + (idx === 3 ? 1.0 : 0.45));
      });
    } catch (_) {}
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }
}

if (typeof window !== 'undefined') {
  window.CatanSoundEngine = CatanSoundEngine;
  window.catanSound = new CatanSoundEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatanSoundEngine;
}
if (typeof globalThis !== 'undefined') {
  globalThis.CatanSoundEngine = CatanSoundEngine;
}
