import type { Intensity, Locale, LocalizedText, Player } from '@piccolo/shared';
import { t as pick } from '@piccolo/shared';
import type { RoomGameContext } from './registry.js';

/** Anything a room deck can hold. Mirrors the web-side `DeckCard`. */
export interface RoomCard {
  id: string;
  adult: boolean;
  intensity: Intensity;
}

export function localize(text: LocalizedText, locale: Locale): string {
  return pick(text, locale);
}

export function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

export function sample<T>(input: readonly T[]): T | undefined {
  if (input.length === 0) return undefined;
  return input[Math.floor(Math.random() * input.length)];
}

/**
 * A shuffled cursor over a deck, stored as ids so a game's state stays small
 * and JSON-serialisable. Wraps and reshuffles rather than ever running out.
 */
export interface DeckCursor {
  order: string[];
  at: number;
}

export function newCursor<T extends RoomCard>(deck: readonly T[], adultUnlocked: boolean): DeckCursor {
  const usable = deck.filter((card) => adultUnlocked || !card.adult);
  return { order: shuffle(usable).map((card) => card.id), at: 0 };
}

export function nextCard<T extends RoomCard>(
  deck: readonly T[],
  cursor: DeckCursor,
): { card: T | undefined; cursor: DeckCursor } {
  if (cursor.order.length === 0) return { card: undefined, cursor };
  const at = cursor.at >= cursor.order.length ? 0 : cursor.at;
  const id = cursor.order[at];
  const card = deck.find((c) => c.id === id);
  const nextAt = at + 1;
  return {
    card,
    cursor:
      nextAt >= cursor.order.length
        ? { order: shuffle(cursor.order), at: 0 }
        : { order: cursor.order, at: nextAt },
  };
}

/** Players who can currently act. A dropped phone must not stall a round. */
export function activePlayers(ctx: RoomGameContext): Player[] {
  return ctx.players.filter((p) => p.connected);
}

export function activeIds(ctx: RoomGameContext): string[] {
  return activePlayers(ctx).map((p) => p.id);
}

/** True once every connected player (minus `except`) appears in `submitted`. */
export function everyoneIn(
  ctx: RoomGameContext,
  submitted: Record<string, unknown>,
  except: readonly string[] = [],
): boolean {
  const waiting = activeIds(ctx).filter((id) => !except.includes(id));
  return waiting.length > 0 && waiting.every((id) => submitted[id] !== undefined);
}

export function countVotes(votes: Record<string, string>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const target of Object.values(votes)) {
    counts[target] = (counts[target] ?? 0) + 1;
  }
  return counts;
}

/** Every id tied for the most votes. Ties are a feature: they all drink. */
export function topVoted(counts: Record<string, number>): string[] {
  const best = Math.max(0, ...Object.values(counts));
  if (best === 0) return [];
  return Object.entries(counts)
    .filter(([, n]) => n === best)
    .map(([id]) => id);
}

/** The lead phone, or the big screen, may drive the game forward. */
export function canDrive(ctx: RoomGameContext, actor: string, hostActor: string): boolean {
  if (actor === hostActor) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

/** Trimmed, length-capped free text from a phone. Returns '' when unusable. */
export function cleanText(value: unknown, max = 120): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}
