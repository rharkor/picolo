import { useCallback, useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptics';
import { randInt } from '@/lib/random';
import { primeAudio, sfx } from './audio';

export interface Fuse {
  lit: boolean;
  /** 0 → 1, only for the visuals. Never shown as a number: not knowing is the game. */
  heat: number;
  light: () => void;
  snuff: () => void;
}

/**
 * A timer whose length nobody is allowed to see. Ticks accelerate from roughly
 * two a second to seven, so the room can hear how close it is without the phone
 * ever telling anyone how long is left.
 *
 * Each tick reschedules itself against a wall-clock deadline rather than
 * counting fixed intervals, so a backgrounded tab comes back already exploded
 * instead of politely waiting.
 */
export function useFuse(min: number, max: number, onBlow: () => void): Fuse {
  const [lit, setLit] = useState(false);
  const [heat, setHeat] = useState(0);
  const timer = useRef<number | null>(null);
  const blow = useRef(onBlow);
  blow.current = onBlow;

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const light = useCallback(() => {
    primeAudio();
    clear();
    const span = randInt(min, max);
    const deadline = performance.now() + span;
    setLit(true);
    setHeat(0);

    const beat = () => {
      const left = deadline - performance.now();
      if (left <= 0) {
        clear();
        setLit(false);
        setHeat(1);
        haptic('heavy');
        sfx.boom();
        blow.current();
        return;
      }
      const progress = 1 - left / span;
      setHeat(progress);
      sfx.fuse(progress);
      haptic('tap');
      timer.current = window.setTimeout(beat, 520 - progress * 380);
    };
    beat();
  }, [clear, max, min]);

  const snuff = useCallback(() => {
    clear();
    setLit(false);
    setHeat(0);
  }, [clear]);

  return { lit, heat, light, snuff };
}
