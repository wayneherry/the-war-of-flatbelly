// Web Audio API Native Synthesizer for The War of FlatBelly
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, duration = 0.12, type = 'sine') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Double whistle when work interval starts
  playGoWhistle() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 880, start: now, dur: 0.12 },
        { f: 1174, start: now + 0.14, dur: 0.35 },
      ].forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, note.start);
        gain.gain.setValueAtTime(0.3, note.start);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(note.start);
        osc.stop(note.start + note.dur);
      });
    } catch (e) {}
  }

  // Gentle rest chime
  playRestChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 659.25, start: now, dur: 0.2 },
        { f: 523.25, start: now + 0.18, dur: 0.4 },
      ].forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, note.start);
        gain.gain.setValueAtTime(0.25, note.start);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(note.start);
        osc.stop(note.start + note.dur);
      });
    } catch (e) {}
  }

  // Victory Medal Chime
  playMedalFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.09;
        const dur = 0.55;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {}
  }

  // Reward Redeem Sound
  playRedeemChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 784, start: now, dur: 0.1 },
        { f: 1046.5, start: now + 0.08, dur: 0.12 },
        { f: 1318.5, start: now + 0.16, dur: 0.35 }
      ].forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, note.start);
        gain.gain.setValueAtTime(0.28, note.start);
        gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(note.start);
        osc.stop(note.start + note.dur);
      });
    } catch (e) {}
  }
}

export const sound = new SoundFX();
