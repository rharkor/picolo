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

/** Joins two halves of a pair into one reviewable line, in both languages. */
function join(a: LocalizedText, b: LocalizedText, separator: string): LocalizedText {
  return {
    en: `${a.en} ${separator} ${b.en}`,
    fr: `${a.fr} ${separator} ${b.fr}`,
  };
}

function prefix(tag: string, text: LocalizedText): LocalizedText {
  return { en: `[${tag}] ${text.en}`, fr: `[${tag}] ${text.fr}` };
}

/**
 * Every game's content, for the /admin review page.
 *
 * Dynamic imports on purpose: decks stay in their own chunks exactly as the
 * play registry keeps them, so opening the review page costs nothing until you
 * expand a game. A game missing from this map has no deck to read — it is
 * either pure logic (Fingers, Waterfall, the skill games) or not built yet.
 */
export const GAME_CONTENT: Record<string, () => Promise<ContentSection[]>> = {
  'piccolo-classic': async () => {
    const { CLASSIC_DECK } = await import('./piccolo-classic/deck');
    return [
      {
        key: 'mixed',
        rows: CLASSIC_DECK.map((card) => ({
          id: card.id,
          text: prefix(card.kind, card.text),
          adult: card.adult,
          intensity: card.intensity,
          needsPlayer: card.text.en.includes('{player'),
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
  'truth-or-dare-spicy': async () => {
    const { SPICY_TRUTHS, SPICY_DARES } = await import('./truth-or-dare-spicy/deck');
    return [
      { key: 'truths', rows: fromDeck(SPICY_TRUTHS) },
      { key: 'dares', rows: fromDeck(SPICY_DARES) },
    ];
  },
  'sip-or-spill': async () => {
    const { SIP_DECK } = await import('./sip-or-spill/deck');
    return [{ key: 'questions', rows: fromDeck(SIP_DECK) }];
  },
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
  'most-likely-to': async () => {
    const { MLT_DECK } = await import('./most-likely-to/deck');
    return [{ key: 'deck', rows: fromDeck(MLT_DECK) }];
  },
  'would-you-rather': async () => {
    const { DILEMMAS } = await import('./would-you-rather/deck');
    return [
      {
        key: 'dilemmas',
        rows: DILEMMAS.map((d) => ({
          id: d.id,
          text: join(d.a, d.b, '·'),
          adult: d.adult,
          intensity: d.intensity,
        })),
      },
    ];
  },
  paranoia: async () => {
    const { PARANOIA_DECK } = await import('./paranoia/deck');
    return [{ key: 'questions', rows: fromDeck(PARANOIA_DECK) }];
  },
  'two-truths-a-lie': async () => {
    const { THEME_DECK } = await import('./two-truths-a-lie/deck');
    return [{ key: 'themes', rows: fromDeck(THEME_DECK) }];
  },
  'mr-white': async () => {
    const { WORD_PAIRS } = await import('./mr-white/deck');
    return [
      {
        key: 'words',
        rows: WORD_PAIRS.map((p) => ({
          id: p.id,
          text: join(p.a, p.b, '/'),
          adult: p.adult,
          intensity: p.intensity,
        })),
      },
    ];
  },
  'shot-roulette': async () => {
    const { ROULETTE_DECK } = await import('./shot-roulette/deck');
    return [{ key: 'penalties', rows: fromDeck(ROULETTE_DECK) }];
  },
  'kings-cup': async () => {
    const { KINGS_RULES } = await import('./kings-cup/deck');
    return [
      {
        key: 'rules',
        rows: KINGS_RULES.map((rule) => ({
          id: rule.id,
          text: join(prefix(rule.rank, rule.title), rule.text, '—'),
          adult: rule.adult,
          intensity: rule.intensity,
        })),
      },
    ];
  },
  categories: async () => {
    const { CATEGORY_DECK } = await import('./categories/deck');
    return [{ key: 'categories', rows: fromDeck(CATEGORY_DECK) }];
  },
  'cheers-governor': async () => {
    const { GOVERNOR_RULES } = await import('./cheers-governor/deck');
    return [{ key: 'rules', rows: fromDeck(GOVERNOR_RULES) }];
  },
  'party-bingo': async () => {
    const { BINGO_DECK } = await import('./party-bingo/deck');
    return [{ key: 'grid', rows: fromDeck(BINGO_DECK) }];
  },
  'hot-seat': async () => {
    const { HOT_SEAT_DECK } = await import('./hot-seat/deck');
    return [{ key: 'questions', rows: fromDeck(HOT_SEAT_DECK) }];
  },
  'dirty-charades': async () => {
    const { CHARADES_DECK } = await import('./dirty-charades/deck');
    return [{ key: 'prompts', rows: fromDeck(CHARADES_DECK) }];
  },
  'bomb-party': async () => {
    const { SYLLABLES } = await import('./bomb-party/deck');
    return [{ key: 'syllables', rows: fromDeck(SYLLABLES) }];
  },
  'hot-potato': async () => {
    const { POTATO_DECK } = await import('./hot-potato/deck');
    return [{ key: 'penalties', rows: fromDeck(POTATO_DECK) }];
  },
};

export function hasContent(id: string): boolean {
  return id in GAME_CONTENT;
}
