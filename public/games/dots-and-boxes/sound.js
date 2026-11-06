/**
 * Dots and Boxes (نقطه و خط) - Web Audio Procedural Sound Engine
 * Synthesizes tactile drawing taps, box captures, combo chords, and victory fanfares.
 * Zero external audio files required.
 */

class DotsSoundEngine {
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

  // Tactile Line Draw Sound (smooth resonant click/plop)
  playLine(player = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = player === 1 ? 440 : 520;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // Box Captured Chime (bright ascending dual tone)
  playBox(player = 1, combo = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freq1 = (player === 1 ? 523.25 : 587.33) * (combo > 1 ? 1.25 : 1.0); // C5 / D5
      const freq2 = (player === 1 ? 659.25 : 739.99) * (combo > 1 ? 1.25 : 1.0); // E5 / F#5
      const freq3 = (player === 1 ? 783.99 : 880.00) * (combo > 1 ? 1.25 : 1.0); // G5 / A5

      const notes = [freq1, freq2, freq3];
      notes.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.07);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.24);
      });
    } catch (_) {}
  }

  // Victory Fanfare (Triumphant brassy arpeggio)
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // C Major arpeggio -> C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.22, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (idx === 3 ? 0.7 : 0.35));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + (idx === 3 ? 0.75 : 0.4));
      });
    } catch (_) {}
  }

  // Defeat / Draw Chime
  playDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    } catch (_) {}
  }

  // Button Tap
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

// Global instance
window.dotsSound = new DotsSoundEngine();
