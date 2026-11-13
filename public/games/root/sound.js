/**
 * Root: Woodland Strategy - Web Audio Sound Synthesizer
 * Zero external audio files; 100% procedural sounds for dice, march, combat, crafting, cards.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RootSound = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;
  let enabled = true;

  try {
    enabled = localStorage.getItem('rubik_card_sound') !== 'false';
  } catch (e) {}

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function play(type) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'march') {
        // Double felt footstep
        [0, 0.08].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now + offset);
          osc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.06);
          gain.gain.setValueAtTime(0.08, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.06);
        });
      } else if (type === 'dice') {
        // Clattering dice roll
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.04;
          osc.type = 'square';
          osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.03);
        }
      } else if (type === 'battle') {
        // Metallic sword clash
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'craft') {
        // Warm mystical wood chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.05;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
      } else if (type === 'build') {
        // Heavy wooden hammer thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'turmoil') {
        // Dramatic low brass descent
        [320, 260, 200, 140].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.08;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.18);
        });
      } else if (type === 'victory') {
        // Grand fanfare
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.1;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.45);
        });
      }
    } catch (e) {}
  }

  return {
    play,
    toggleSound: function () {
      enabled = !enabled;
      try {
        localStorage.setItem('rubik_card_sound', enabled ? 'true' : 'false');
      } catch (e) {}
      return enabled;
    },
    isEnabled: function () {
      return enabled;
    }
  };
});
