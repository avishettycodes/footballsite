/**
 * Tiny WebAudio blip generator. No files, no fetch, a click is an oscillator.
 *
 * TWO THINGS THIS FILE LEARNED FROM A REAL DEVICE, both of which made it silent.
 *
 * 1. THE SUSPEND LATCH. An AudioContext created or suspended outside a user gesture
 *    stays suspended, and its clock stays frozen at zero, so every note scheduled
 *    against currentTime piles up at t=0 and nothing is ever heard again. Calling
 *    resume() from a setTimeout does not help, because the browser only honours it
 *    from inside a gesture. The old version only ever resumed from two buttons on the
 *    way into a run, so anything that suspended the context after that killed audio
 *    for the rest of the session. Reloading straight onto the results screen did it,
 *    because the heartbeat fires from an interval with no gesture behind it, and on a
 *    phone so does any call, app switch or screen lock. The fix is armAudio(): every
 *    gesture anywhere on the page resumes, forever, not just the two entry buttons.
 *
 * 2. A PHONE SPEAKER IS NOT A SPEAKER. It gives you almost nothing below about 500Hz.
 *    The landing thunk was a 150Hz sawtooth under a 70Hz sine, and the heartbeat was
 *    90Hz, so on a phone those two were not quiet, they were absent. Every sound now
 *    has to carry at least one voice that reaches a small speaker, which is what
 *    reachesASmallSpeaker() below means and what verify:audio enforces.
 *
 * Sounds are DATA rather than code so the verifier can read the same numbers the game
 * plays. See scripts/verify-audio.ts.
 */

export type Voice = {
  /** Starting frequency in Hz. */
  freq: number;
  /** Optional glide target. This is what turns a beep into a thunk or a slide. */
  to?: number;
  /** Seconds. */
  duration: number;
  /** Peak linear gain, before the decay envelope. */
  gain: number;
  type: OscillatorType;
  /** Offset from the start of the sound, in seconds. */
  delay?: number;
};

/**
 * How far above its fundamental a waveform still puts real energy. A sine is only its
 * fundamental, so it lives or dies there. A square or a sawtooth drops off as 1/n, so
 * its third harmonic is loud enough to carry the note even when a small speaker throws
 * the fundamental away. That is why the heartbeat is a sawtooth now instead of a sine.
 */
const HARMONIC_REACH: Record<string, number> = {
  sine: 1, triangle: 1.5, square: 3, sawtooth: 3, custom: 1,
};

/** Below this, a phone speaker is not going to move any air for you. */
export const SMALL_SPEAKER_HZ = 500;
/** Below this, a note is technically playing and practically not there. */
export const MIN_USEFUL_GAIN = 0.1;

/** Does this one voice survive being played through a phone? */
export function reachesASmallSpeaker(v: Voice): boolean {
  const top = Math.max(v.freq, v.to ?? v.freq) * (HARMONIC_REACH[v.type] ?? 1);
  return top >= SMALL_SPEAKER_HZ && v.gain >= MIN_USEFUL_GAIN;
}

// --- the sounds ------------------------------------------------------------------

/**
 * The reel passing a franchise. Pitch rises as it slows, like a real wheel. A square
 * wave up here puts its harmonics straight through the band a phone is best at, which
 * is most of why this is now audible at a gain only twice the old one.
 */
export const tickVoices = (progress: number): Voice[] => [
  { freq: 880 + progress * 520, duration: 0.03, gain: 0.11, type: 'square' },
];

/**
 * Hard landing. The sawtooth drop from 460 is the part a phone can actually play, and
 * the 90Hz sine under it is the part you feel on anything with a real woofer.
 */
export const THUNK: Voice[] = [
  { freq: 460, to: 150, duration: 0.22, gain: 0.3, type: 'sawtooth' },
  { freq: 90, duration: 0.32, gain: 0.24, type: 'sine' },
];

/** Attribute locked into the build sheet. */
export const LOCK: Voice[] = [
  { freq: 1046, duration: 0.05, gain: 0.16, type: 'square' },
  { freq: 1568, duration: 0.09, gain: 0.13, type: 'square', delay: 0.055 },
];

/** Slow suspense pulse while the ring is being decided. */
export const heartbeatVoices = (i: number): Voice[] => [
  { freq: 300 + i * 18, to: 140, duration: 0.15, gain: 0.16, type: 'sawtooth' },
];

/** Ring won. */
export const FANFARE: Voice[] = [523, 659, 784, 1047].map((freq, i) => ({
  freq, duration: 0.26, gain: 0.2, type: 'triangle' as OscillatorType, delay: i * 0.11,
}));

/** Ring lost. A sawtooth so the bottom two notes still land on a phone. */
export const DEFLATE: Voice[] = [494, 392, 330, 262].map((freq, i) => ({
  freq, duration: 0.3, gain: 0.18, type: 'sawtooth' as OscillatorType, delay: i * 0.15,
}));

/** Everything the game can play, for the verifier to walk. */
export const ALL_SOUNDS: Record<string, Voice[]> = {
  tick: [...tickVoices(0), ...tickVoices(1)],
  thunk: THUNK,
  lock: LOCK,
  heartbeat: [...heartbeatVoices(0), ...heartbeatVoices(6)],
  fanfare: FANFARE,
  deflate: DEFLATE,
};

// --- the engine ------------------------------------------------------------------

let ctx: AudioContext | null = null;
let armed = false;
const watchers = new Set<() => void>();

function audioCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
    null
  );
}

function notify() {
  for (const fn of watchers) fn();
}

/**
 * Creates the context if it does not exist yet. ONLY call this from a path with a user
 * gesture behind it. Creating one anywhere else is what latches it suspended for good.
 */
function open(): AudioContext | null {
  if (!ctx) {
    const Ctor = audioCtor();
    if (!Ctor) return null;
    ctx = new Ctor();
    ctx.onstatechange = notify;
  }
  return ctx;
}

/**
 * Resume, from inside a real gesture. Safe to call on every tap for the life of the
 * page, since it does nothing once the context is already running.
 */
export function unlock() {
  const ac = open();
  if (ac && ac.state !== 'running') void ac.resume().then(notify, notify);
  notify();
}

/**
 * Listen for a gesture ANYWHERE, for the whole session. This is the actual fix for the
 * suspend latch. The listeners are permanent on purpose. A phone can suspend the
 * context at any moment and the next tap has to be able to bring it back.
 */
export function armAudio() {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  for (const type of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  // Coming back from a background tab or a locked screen. Resume what already exists,
  // but never create one here, because there is no gesture behind this event.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx && ctx.state !== 'running') void ctx.resume().then(notify, notify);
  });
}

/** Whether a sound played right now would actually be heard. */
export function audioState(): 'ready' | 'blocked' | 'unavailable' {
  if (!audioCtor()) return 'unavailable';
  if (!ctx) return 'blocked';
  return ctx.state === 'running' ? 'ready' : 'blocked';
}

export function subscribeAudio(fn: () => void): () => void {
  watchers.add(fn);
  return () => { watchers.delete(fn); };
}

/**
 * Schedules a whole sound on the audio clock in one go.
 *
 * Nothing is scheduled unless the context is genuinely running. A frozen clock does not
 * delay a note, it queues it at zero, so a suspended context would otherwise collect
 * every tick of a spin and fire them all as one bang the moment it woke up.
 */
export function play(voices: Voice[]) {
  const ac = ctx;
  if (!ac || ac.state !== 'running') return;

  for (const v of voices) {
    const at = ac.currentTime + (v.delay ?? 0);
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = v.type;
    osc.frequency.setValueAtTime(v.freq, at);
    if (v.to) osc.frequency.exponentialRampToValueAtTime(v.to, at + v.duration);
    amp.gain.setValueAtTime(v.gain, at);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + v.duration);
    osc.connect(amp).connect(ac.destination);
    osc.start(at);
    osc.stop(at + v.duration);
  }
}

export const tick = (progress: number) => play(tickVoices(progress));
export const thunk = () => play(THUNK);
export const lock = () => play(LOCK);
export const heartbeat = (i: number) => play(heartbeatVoices(i));
export const fanfare = () => play(FANFARE);
export const deflate = () => play(DEFLATE);

/** Kept for the buttons that open a run. armAudio() covers everything after that. */
export const primeAudio = () => { armAudio(); unlock(); };

armAudio();
