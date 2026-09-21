// Minimal WebAudio blip synth for UI sounds (no asset files needed).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, duration = 0.08, type: OscillatorType = 'sine', gain = 0.04) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sound = {
  enabled: false,
  open() { if (this.enabled) blip(660, 0.09, 'sine'); },
  close() { if (this.enabled) blip(440, 0.08, 'sine'); },
  minimize() { if (this.enabled) blip(520, 0.07, 'triangle'); },
  click() { if (this.enabled) blip(880, 0.04, 'sine', 0.03); },
  error() { if (this.enabled) { blip(220, 0.15, 'sawtooth', 0.05); } },
};
