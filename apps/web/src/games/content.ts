import type { Intensity, LocalizedText } from '@piccolo/shared';
import type { DeckCard } from '@/games/types';

/** Numbers a bidding card carries, shown as chips next to the text. */
export interface ContentNumbers {
  /** Quiz cards only: the truth a bid is measured against. */
  answer?: number;
  start: number;
  step: number;
  unit: LocalizedText;
}

/** One reviewable line, flattened from whatever deck shape it came from. */
export interface ContentRow {
  id: string;
  text: LocalizedText;
  adult: boolean;
  intensity: Intensity;
  /** The card names someone: the engine swaps {player} for a party member. */
  needsPlayer?: boolean;
  numbers?: ContentNumbers;
}

export interface ContentSection {
  /** Label key under `admin.sections` in the dictionary. */
  key: string;
  rows: ContentRow[];
}

function fromDeck(cards: DeckCard[]): ContentRow[] {
  return cards.map(({ id, text, adult, intensity, needsPlayer }) => ({
    id,
    text,
    adult,
    intensity,
    needsPlayer,
  }));
}

/**
 * Every game's content, for the /admin review page.
 *
 * Dynamic imports on purpose: decks stay in their own chunks exactly as the
 * play registry keeps them, so opening the review page costs nothing until you
 * expand a game. A game missing from this map has no deck to read — it is
 * either pure logic or not built yet.
 */
export const GAME_CONTENT: Record<string, () => Promise<ContentSection[]>> = {
  'la-tabuses': async () => {
    const { CHALLENGES, QUESTIONS } = await import('./la-tabuses/deck');
    return [
      {
        key: 'quiz',
        rows: QUESTIONS.map((q) => ({
          id: q.id,
          text: q.prompt,
          adult: q.adult,
          intensity: q.intensity,
          numbers: { answer: q.answer, start: q.start, step: q.step, unit: q.unit },
        })),
      },
      {
        key: 'challenges',
        rows: CHALLENGES.map((c) => ({
          id: c.id,
          text: c.feat,
          adult: c.adult,
          intensity: c.intensity,
          numbers: { start: c.start, step: c.step, unit: c.unit },
        })),
      },
    ];
  },
  'never-have-i-ever': async () => {
    const { NHIE_DECK } = await import('./never-have-i-ever/deck');
    return [{ key: 'deck', rows: fromDeck(NHIE_DECK) }];
  },
  'truth-or-dare': async () => {
    const { TRUTHS, DARES } = await import('./truth-or-dare/deck');
    return [
      { key: 'truths', rows: fromDeck(TRUTHS) },
      { key: 'dares', rows: fromDeck(DARES) },
    ];
  },
};

export function hasContent(id: string): boolean {
  return id in GAME_CONTENT;
}
