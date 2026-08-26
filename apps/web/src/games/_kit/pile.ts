import { useCallback, useEffect, useRef, useState } from 'react';
import { shuffle } from '@/lib/random';

/** Anything that can be hidden behind the 18+ switch. */
export interface Gated {
  adult: boolean;
}

export interface Pile<T> {
  /** The card currently face up, or undefined before the first draw. */
  card: T | undefined;
  /** 1-based position inside the current lap. 0 before the first draw. */
  position: number;
  size: number;
  /** How many times the pile has been exhausted and reshuffled. */
  lap: number;
  draw: () => void;
  /** Step back one card. No-op at the start of a lap. */
  back: () => void;
  /** Shuffle and start over, without counting a lap. */
  reset: () => void;
}

interface Inner<T> {
  cards: T[];
  i: number;
  lap: number;
}

/**
 * A shuffled pile with a cursor.
 *
 * Every game in here needs the same thing: hand out cards in a random order,
 * never repeat one until the deck has been through, and keep going all night.
 * Running dry reshuffles instead of ending the game — a party does not stop
 * because a deck did.
 *
 * `primed` decides whether the first card is already face up (a deck you read
 * straight away) or whether the game has to call `draw()` first (a deck you
 * pull from between rounds).
 */
export function usePile<T extends Gated>(
  source: readonly T[],
  adult: boolean,
  primed = true,
): Pile<T> {
  const build = useCallback(
    (): Inner<T> => ({
      cards: shuffle(source.filter((c) => adult || !c.adult)),
      i: primed ? 0 : -1,
      lap: 0,
    }),
    [source, adult, primed],
  );

  const [state, setState] = useState<Inner<T>>(build);

  // Flipping 18+ in another tab has to rebuild the pile rather than leave
  // spicy cards sitting in a deck that is now supposed to be tame.
  const builtFor = useRef(adult);
  useEffect(() => {
    if (builtFor.current === adult) return;
    builtFor.current = adult;
    setState(build());
  }, [adult, build]);

  const draw = useCallback(() => {
    setState((s) => {
      const next = s.i + 1;
      if (next < s.cards.length) return { ...s, i: next };
      // Reshuffling with the just-seen card moved out of first place, so the
      // deck never hands you the same prompt twice in a row.
      const reshuffled = shuffle(s.cards);
      const last = s.cards[s.i];
      if (reshuffled.length > 1 && last && reshuffled[0] === last) {
        const swap = reshuffled[1] as T;
        reshuffled[1] = reshuffled[0] as T;
        reshuffled[0] = swap;
      }
      return { cards: reshuffled, i: 0, lap: s.lap + 1 };
    });
  }, []);

  const back = useCallback(() => {
    setState((s) => (s.i > 0 ? { ...s, i: s.i - 1 } : s));
  }, []);

  const reset = useCallback(() => setState(build()), [build]);

  return {
    card: state.i >= 0 ? state.cards[state.i] : undefined,
    position: state.i + 1,
    size: state.cards.length,
    lap: state.lap,
    draw,
    back,
    reset,
  };
}

/**
 * Draws `count` distinct cards in one go — bingo grids, word sets, quiz rounds.
 * Falls back to repeats only if the filtered deck is smaller than `count`.
 */
export function dealFrom<T extends Gated>(
  source: readonly T[],
  adult: boolean,
  count: number,
): T[] {
  const pool = shuffle(source.filter((c) => adult || !c.adult));
  if (pool.length === 0) return [];
  const out: T[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(pool[i % pool.length] as T);
  }
  return out;
}
