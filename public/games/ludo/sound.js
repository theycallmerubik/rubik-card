/**
 * Ludo (منچ / Ludo) - Web Audio API Synthesizer Sound Engine
 * Procedural synthesis without external audio files.
 * Universal setting: rubik_card_sound (true/false).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LudoSoundEngine = factory();
    root.ludoSound = new root.LudoSoundEngine();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class LudoSoundEngine {
    constructor() {
      this.ctx = null;
      let muted = false;
      try {
        const stored = localStorage.getItem('rubik_card_sound');
        if (stored !== null) muted = (stored === 'false');
      } catch (_) {}
      this._muted = muted;
    }

    _initCtx() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    isMuted() {
      return this._muted;
    }

    setMuted(m) {
      this._muted = Boolean(m);
      try {
        localStorage.setItem('rubik_card_sound', this._muted ? 'false' : 'true');
      } catch (_) {}
    }

    toggleMute() {
      this.setMuted(!this._muted);
      return this._muted;
    }

    playClick() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      } catch (_) {}
    }

    playDiceRoll() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // 4 rapid wooden tumbling clicks
        for (let i = 0; i < 4; i++) {
          const clickTime = t + i * 0.06;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140 + Math.random() * 80, clickTime);
          gain.gain.setValueAtTime(0.18 - i * 0.03, clickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.035);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(clickTime);
          osc.stop(clickTime + 0.035);
        }
      } catch (_) {}
    }

    playTokenMove() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(680, t + 0.06);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
      } catch (_) {}
    }

    playTokenExitYard() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Joyful ascending 3-note arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const startTime = t + idx * 0.07;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.12);
        });
      } catch (_) {}
    }

    playTokenCapture() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Punchy kick and descend
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      } catch (_) {}
    }

    playTokenHome() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Shimmering chime
        [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
          const startTime = t + idx * 0.05;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
      } catch (_) {}
    }

    playVictory() {
      if (this._muted) return;
      this._initCtx();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Grand victory fanfare
        const notes = [
          { f: 523.25, d: 0.12, w: 0 },
          { f: 659.25, d: 0.12, w: 0.12 },
          { f: 783.99, d: 0.16, w: 0.24 },
          { f: 1046.50, d: 0.45, w: 0.40 }
        ];
        notes.forEach(n => {
          const startTime = t + n.w;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + n.d);
        });
      } catch (_) {}
    }
  }

  return LudoSoundEngine;
});
