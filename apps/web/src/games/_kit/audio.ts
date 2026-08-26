import { useSettings } from '@/store/settings';

/**
 * A couple of hundred bytes of WebAudio instead of sample files: the app has to
 * work with no internet and no cache, and a party only ever needs a tick, a
 * ding and a buzzer.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!useSettings.getState().sound) return null;
  if (typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    // iOS suspends the context whenever the phone locks or the tab blurs.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOptions {
  freq: number;
  /** Seconds. */
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  /** Slide to this frequency over the duration. */
  to?: number;
}

export function tone({ freq, duration = 0.08, type = 'sine', gain = 0.14, to }: ToneOptions): void {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + duration);
  // A short attack/release envelope: raw gates click audibly on phone speakers.
  vol.gain.setValueAtTime(0.0001, now);
  vol.gain.exponentialRampToValueAtTime(gain, now + 0.008);
  vol.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const sfx = {
  tick: () => tone({ freq: 880, duration: 0.04, type: 'square', gain: 0.07 }),
  /** Ticks faster and higher as `heat` goes 0 → 1. */
  fuse: (heat: number) =>
    tone({ freq: 500 + heat * 900, duration: 0.05, type: 'square', gain: 0.06 + heat * 0.08 }),
  select: () => tone({ freq: 660, duration: 0.06, type: 'triangle' }),
  good: () => {
    tone({ freq: 784, duration: 0.09, type: 'triangle' });
    setTimeout(() => tone({ freq: 1175, duration: 0.14, type: 'triangle' }), 80);
  },
  bad: () => tone({ freq: 220, duration: 0.32, type: 'sawtooth', gain: 0.12, to: 80 }),
  boom: () => {
    tone({ freq: 140, duration: 0.5, type: 'sawtooth', gain: 0.2, to: 40 });
    tone({ freq: 90, duration: 0.6, type: 'square', gain: 0.15, to: 30 });
  },
  reveal: () => tone({ freq: 300, duration: 0.28, type: 'sine', gain: 0.13, to: 900 }),
  countdown: (last: boolean) =>
    tone({ freq: last ? 1200 : 700, duration: last ? 0.22 : 0.09, type: 'triangle' }),
};

/**
 * Unlocks audio from inside a user gesture. Mobile browsers refuse to make a
 * sound until then, so games with a timer call this from their start button.
 */
export function primeAudio(): void {
  audio();
}
