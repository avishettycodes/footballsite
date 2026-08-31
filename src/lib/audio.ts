/**
 * Tiny WebAudio blip generator. No files, no fetch — a click is an oscillator.
 * Created lazily on the first user gesture so autoplay policy never blocks it.
 */
let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq: number, duration: number, gain: number, type: OscillatorType = 'square') {
  const ac = context();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

/** The reel passing a franchise. Pitch rises slightly as it slows, like a real wheel. */
export const tick = (progress: number) => blip(760 + progress * 340, 0.028, 0.05);
/** Hard landing. */
export const thunk = () => { blip(150, 0.20, 0.16, 'sawtooth'); blip(70, 0.30, 0.12, 'sine'); };
/** Attribute locked into the build sheet. */
export const lock = () => { blip(880, 0.06, 0.09); setTimeout(() => blip(1320, 0.10, 0.08), 55); };
export const primeAudio = () => { context(); };

/** Slow suspense pulse while the ring is being decided. */
export const heartbeat = (i: number) => blip(90 + i * 6, 0.14, 0.10, 'sine');
/** Ring won. */
export const fanfare = () => {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.24, 0.10, 'triangle'), i * 110));
};
/** Ring lost. */
export const deflate = () => {
  [330, 262, 208, 156].forEach((f, i) => setTimeout(() => blip(f, 0.30, 0.09, 'sine'), i * 150));
};
