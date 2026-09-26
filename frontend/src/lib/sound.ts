// Minimal WebAudio blip synth for UI sounds (no asset files needed).
// `configure()` is driven by the theme (soundsEnabled + volume) — the gain of
// every blip scales with the in-OS volume so the tray slider genuinely affects
// these sounds, and level 0 / sounds-off behaves as mute.
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
  g.gain.setValueAtTime(gain * sound.volume, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sound = {
  enabled: false,
  volume: 1, // 0..1
  /** Sync from theme: mute when sounds are off or volume is 0. */
  configure(enable: boolean, level: number): void {
    const on = enable && level > 0;
    this.enabled = on;
    this.volume = Math.min(1, Math.max(0, level / 100));
  },
  open() { if (this.enabled) blip(660, 0.09, 'sine'); },
  close() { if (this.enabled) blip(440, 0.08, 'sine'); },
  minimize() { if (this.enabled) blip(520, 0.07, 'triangle'); },
  click() { if (this.enabled) blip(880, 0.04, 'sine', 0.03); },
  error() { if (this.enabled) { blip(220, 0.15, 'sawtooth', 0.05); } },
};