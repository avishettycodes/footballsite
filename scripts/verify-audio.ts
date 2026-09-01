/**
 * AUDIO CHECK, done without hearing anything.
 *
 * A tester reported hearing nothing at all with the sound on or off. Diagnosing that on
 * a laptop is hopeless, because on a laptop it worked. Two separate causes turned up,
 * and this script exists so neither can come back quietly.
 *
 *   THE SUSPEND LATCH. An AudioContext created or suspended without a user gesture
 *   behind it stays suspended and its clock stays frozen at zero. Every note scheduled
 *   against currentTime then queues at zero rather than playing. This drives the real
 *   module against a fake WebAudio and asserts the recovery path: nothing is created at
 *   import time, notes are dropped rather than queued while the clock is frozen, a
 *   gesture anywhere on the page resumes, and playback works after that.
 *
 *   PHONE SPEAKER REACH. A phone gives you almost nothing below 500Hz, so a 70Hz sine
 *   is not a quiet sound, it is no sound. Every sound the game can play has to carry at
 *   least one voice that reaches a small speaker at a gain you would notice.
 *
 *   THE IPHONE MUTE SWITCH. Both of the above were verified in desktop Chrome, which
 *   does not have one, and the tester still heard nothing. iOS silences a page's audio
 *   outright when the ringer switch is off unless the page says its audio is the point.
 *   So: navigator.audioSession must be set to playback where it exists, a silent looping
 *   media element must carry the older devices that have no such API, and neither may
 *   happen before a gesture or while the sound is switched off, since claiming that
 *   session stops whatever else the phone was playing.
 *
 * None of these checks listens to anything. They all fail loudly.
 */

type Rec = { kind: string; detail: string };
const events: Rec[] = [];
const listeners = new Map<string, ((e?: unknown) => void)[]>();

class FakeParam {
  constructor(private label: string, public value = 0) {}
  setValueAtTime(v: number, t: number) { events.push({ kind: 'param', detail: `${this.label}=${v}@${t.toFixed(3)}` }); return this; }
  exponentialRampToValueAtTime(v: number, t: number) { events.push({ kind: 'param', detail: `${this.label}->${v}@${t.toFixed(3)}` }); return this; }
}
class FakeNode {
  constructor(public kind: string) {}
  connect(dest: { kind: string }) { events.push({ kind: 'connect', detail: `${this.kind}->${dest.kind}` }); return dest; }
}
class FakeOsc extends FakeNode {
  type = 'sine';
  frequency = new FakeParam('freq');
  constructor() { super('osc'); }
  start(t = 0) { events.push({ kind: 'start', detail: `${this.type}@${t.toFixed(3)}` }); }
  stop(t = 0) { events.push({ kind: 'stop', detail: `@${t.toFixed(3)}` }); }
}

let created = 0;
const instances: FakeCtx[] = [];
class FakeCtx {
  state = 'suspended';
  /** Frozen while suspended, exactly like the real thing. That is the whole bug. */
  currentTime = 0;
  destination = new FakeNode('destination');
  onstatechange: (() => void) | null = null;
  constructor() { created++; instances.push(this); }
  createOscillator() { return new FakeOsc(); }
  createGain() { const g = new FakeNode('gain') as FakeNode & { gain: FakeParam }; g.gain = new FakeParam('gain'); return g; }
  resume() { this.state = 'running'; this.currentTime = 1.5; this.onstatechange?.(); return Promise.resolve(); }
  suspend() { this.state = 'suspended'; this.onstatechange?.(); return Promise.resolve(); }
}

/** iOS 16.4+ exposes this. Starts as auto, exactly like a real page. */
const fakeSession = { type: 'auto' };
Object.defineProperty(globalThis, 'navigator', {
  value: { audioSession: fakeSession }, configurable: true, writable: true,
});

/** The pre-16.4 lever: a silent looping media element. */
const played: FakeAudio[] = [];
class FakeAudio {
  loop = false;
  attrs: Record<string, string> = {};
  playCount = 0;
  constructor(public src: string) {}
  setAttribute(k: string, v: string) { this.attrs[k] = v; }
  play() { this.playCount++; played.push(this); return Promise.resolve(); }
}

const fakeWindow = {
  AudioContext: FakeCtx,
  addEventListener(type: string, fn: (e?: unknown) => void) {
    (listeners.get(type) ?? listeners.set(type, []).get(type)!).push(fn);
  },
};
(globalThis as unknown as { window: unknown }).window = fakeWindow;
(globalThis as unknown as { document: unknown }).document = {
  hidden: false,
  addEventListener(type: string, fn: (e?: unknown) => void) {
    (listeners.get(type) ?? listeners.set(type, []).get(type)!).push(fn);
  },
};
const fire = (type: string) => (listeners.get(type) ?? []).forEach((fn) => fn());

const audio = await import('../src/lib/audio');

type Check = { name: string; ok: boolean; note: string };
const checks: Check[] = [];
const check = (name: string, ok: boolean, note = '') => checks.push({ name, ok, note });

// 1. Importing the module must not create a context. Creating one outside a gesture is
//    exactly what latches it suspended for the rest of the session.
check('import creates no AudioContext', created === 0, `${created} created at import`);

// 2. Arming happens at import, so a gesture ANYWHERE can rescue the context later.
//    The old version only resumed from two buttons on the way into a run.
const armedOn = ['pointerdown', 'touchend', 'keydown'].filter((t) => (listeners.get(t) ?? []).length);
check('gesture listeners armed at import', armedOn.length === 3, `armed on: ${armedOn.join(', ') || 'nothing'}`);
check('resumes when the tab comes back', (listeners.get('visibilitychange') ?? []).length === 1,
  `${(listeners.get('visibilitychange') ?? []).length} visibilitychange listeners`);

// 3. Before any gesture there is no context, so nothing may be scheduled. A frozen clock
//    does not delay a note, it queues it at zero and fires the lot on resume.
events.length = 0;
audio.thunk(); audio.tick(0.5); audio.lock(); audio.heartbeat(0);
check('silent before a gesture, and drops rather than queues',
  events.filter((e) => e.kind === 'start').length === 0,
  `${events.filter((e) => e.kind === 'start').length} notes queued against a frozen clock`);
check('still no context without a gesture', created === 0, `${created} created`);

check('no audio session claimed before a gesture', fakeSession.type === 'auto',
  `session is ${fakeSession.type} with nothing tapped yet`);

// 3b. Sound off means no context and no session at all. Claiming the playback session
//     stops whatever else the phone is playing, and doing that to somebody who turned
//     the sound off would be worse than the silence this file is here to fix.
audio.setSoundEnabled(false);
fire('pointerdown');
check('a tap with the sound off opens nothing', created === 0, `${created} created`);
check('a tap with the sound off claims no session', fakeSession.type === 'auto',
  `session is ${fakeSession.type}`);
audio.setSoundEnabled(true);

// 4. A tap anywhere on the page opens and resumes it.
fire('pointerdown');
check('a tap anywhere opens the context', created === 1, `${created} created`);
check('audioState is ready after a tap', audio.audioState() === 'ready', `state: ${audio.audioState()}`);
check('the gesture declares a playback session', fakeSession.type === 'playback',
  `session is now ${fakeSession.type}`);
check('no media element where the session API exists', played.length === 0,
  `${played.length} silent elements playing for no reason`);

// 5. Now every sound has to actually reach the destination.
for (const [name, voices] of Object.entries(audio.ALL_SOUNDS)) {
  events.length = 0;
  audio.play(voices);
  const starts = events.filter((e) => e.kind === 'start').length;
  const toDest = events.filter((e) => e.detail === 'gain->destination').length;
  check(`${name} reaches the speakers`, starts === voices.length && toDest === voices.length,
    `${starts}/${voices.length} started, ${toDest}/${voices.length} connected out`);
}

// 6. The phone case. Every sound needs a voice a small speaker can actually reproduce.
for (const [name, voices] of Object.entries(audio.ALL_SOUNDS)) {
  const carriers = voices.filter(audio.reachesASmallSpeaker);
  check(`${name} survives a phone speaker`, carriers.length > 0,
    carriers.length
      ? `${carriers.length}/${voices.length} voices carry`
      : `every voice is under ${audio.SMALL_SPEAKER_HZ}Hz of reach or below ${audio.MIN_USEFUL_GAIN} gain`);
}

// 7. The interruption a phone actually does to you: a call, an app switch, a lock.
//    Suspended again, the sounds must go quiet rather than pile up, and the next tap
//    anywhere has to bring them back. This is the case the old code could never recover
//    from, because it only ever resumed from the two buttons that start a run.
const live = instances[0];
await live.suspend();
events.length = 0;
audio.thunk(); audio.tick(0.5);
check('goes quiet when the phone suspends it',
  events.filter((e) => e.kind === 'start').length === 0,
  `${events.filter((e) => e.kind === 'start').length} notes queued against a frozen clock`);
check('audioState reports blocked while suspended', audio.audioState() === 'blocked', `state: ${audio.audioState()}`);

fire('touchend');
events.length = 0;
audio.thunk();
check('the next tap anywhere brings it back',
  events.filter((e) => e.kind === 'start').length === audio.ALL_SOUNDS.thunk.length,
  `state: ${audio.audioState()}, ${events.filter((e) => e.kind === 'start').length} notes`);
check('recovering reuses the one context', created === 1, `${created} contexts created in total`);

// 7b. THE INTERRUPTION SAFARI DOES NOT COME BACK FROM. An interrupted context can park
//     in a state resume() refuses to leave, and a context that will not come back is
//     worse than no context at all, because every later note is dropped against it. It
//     has to be thrown away so the next tap can build a fresh one.
await live.suspend();
live.resume = () => Promise.reject(new Error('interrupted'));
fire('pointerdown');
await new Promise((r) => setTimeout(r, 0));
check('a context that will not resume is thrown away', audio.audioState() === 'blocked',
  `state: ${audio.audioState()}`);

// 7c. THE OLDER IPHONE. No navigator.audioSession before Safari 16.4, so the only lever
//     is a silent looping media element played from inside the gesture, which moves the
//     page onto the media channel and takes WebAudio with it.
Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true, writable: true });
(globalThis as unknown as { Audio: unknown }).Audio = FakeAudio;
fire('touchend');
check('a dropped context is rebuilt by the next tap', created === 2, `${created} created in total`);
const silent = played[0];
check('older iOS gets a silent media element instead', played.length === 1 && silent?.playCount === 1,
  played.length ? `${played.length} element(s), played ${silent?.playCount} time(s)` : 'nothing playing');
check('that element is silence, looping, and inline',
  Boolean(silent) && silent.loop && silent.src.startsWith('data:audio/wav;base64,') && 'playsinline' in silent.attrs,
  silent ? `loop=${silent.loop} inline=${'playsinline' in silent.attrs} src=${silent.src.slice(0, 28)}...` : 'no element');

// 8. Sanity on the envelope: nothing may be scheduled with a zero or negative duration,
//    and an exponential ramp cannot target zero.
const badEnvelope = Object.entries(audio.ALL_SOUNDS).flatMap(([name, voices]) =>
  voices.filter((v) => v.duration <= 0 || v.gain <= 0 || v.freq <= 0 || (v.to !== undefined && v.to <= 0))
    .map((v) => `${name} ${JSON.stringify(v)}`),
);
check('every voice has a playable envelope', badEnvelope.length === 0, badEnvelope.join('; '));

console.log('GridironLab — audio\n');
let failed = 0;
for (const c of checks) {
  if (!c.ok) failed++;
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.note ? `  (${c.note})` : ''}`);
}

console.log('\nvoice table');
for (const [name, voices] of Object.entries(audio.ALL_SOUNDS)) {
  for (const v of voices) {
    console.log(
      `  ${name.padEnd(10)} ${String(v.freq).padStart(5)}Hz` +
      `${v.to ? ` -> ${String(v.to).padStart(4)}Hz` : '           '}` +
      ` ${v.type.padEnd(9)} gain ${v.gain.toFixed(2)}` +
      ` ${(v.duration * 1000).toFixed(0).padStart(4)}ms` +
      `  ${audio.reachesASmallSpeaker(v) ? 'carries on a phone' : 'body only'}`,
    );
  }
}

console.log(failed ? `\naudio: FAIL (${failed})` : '\naudio: PASS');
process.exit(failed ? 1 : 0);
