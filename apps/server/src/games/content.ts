import type { Intensity, LocalizedText } from '@piccolo/shared';
import { BINGO_SQUARES } from './decks/bingo.js';
import { CONFESSION_PROMPTS } from './decks/confessions.js';
import { DRAW_WORDS } from './decks/draw.js';
import { IMPOSTOR_PAIRS } from './decks/impostor.js';
import { RANK_SETS } from './decks/rank.js';
import { QUIZ } from './decks/trivia.js';
import { SPECTRUMS } from './decks/wavelength.js';
import { LIAR_FACTS } from './decks/liar.js';
import { DILEMMAS_ROOM, MOST_LIKELY_ROOM, SUPERLATIVES } from './decks/polls.js';
import { PUNCHLINES } from './decks/punchline.js';

/**
 * Room-game decks, flattened for the /admin review page.
 *
 * Multi-device content never reaches the browser during play — the server
 * localises a card and broadcasts only the resulting string — so the review
 * page fetches it from here instead of reading a bundle. Same shape as the
 * web-side `ContentSection` so one table renders both.
 */
export interface ContentRow {
  id: string;
  text: LocalizedText;
  adult: boolean;
  intensity: Intensity;
}

export interface ContentSection {
  key: string;
  rows: ContentRow[];
}

function pairs(
  cards: readonly { id: string; adult: boolean; intensity: Intensity; a: LocalizedText; b: LocalizedText }[],
  separator = '·',
): ContentRow[] {
  return cards.map((card) => ({
    id: card.id,
    adult: card.adult,
    intensity: card.intensity,
    text: {
      en: `${card.a.en} ${separator} ${card.b.en}`,
      fr: `${card.a.fr} ${separator} ${card.b.fr}`,
    },
  }));
}

function prompts(
  cards: readonly { id: string; adult: boolean; intensity: Intensity; text: LocalizedText }[],
): ContentRow[] {
  return cards.map(({ id, adult, intensity, text }) => ({ id, adult, intensity, text }));
}

export const ROOM_CONTENT: Record<string, ContentSection[]> = {
  'most-likely-to': [{ key: 'roomDeck', rows: prompts(MOST_LIKELY_ROOM) }],
  'who-in-the-room': [{ key: 'superlatives', rows: prompts(SUPERLATIVES) }],
  'would-you-rather': [{ key: 'roomDilemmas', rows: pairs(DILEMMAS_ROOM) }],
  punchline: [{ key: 'prompts', rows: prompts(PUNCHLINES) }],
  confessions: [{ key: 'prompts', rows: prompts(CONFESSION_PROMPTS) }],
  'party-bingo': [{ key: 'roomGrid', rows: prompts(BINGO_SQUARES) }],
  impostor: [{ key: 'words', rows: pairs(IMPOSTOR_PAIRS, '/') }],
  'draw-and-guess': [
    {
      key: 'words',
      rows: DRAW_WORDS.map((card) => ({
        id: card.id,
        adult: card.adult,
        intensity: card.intensity,
        text: card.word,
      })),
    },
  ],
  'rank-it': [
    {
      key: 'sets',
      rows: RANK_SETS.map((card) => ({
        id: card.id,
        adult: card.adult,
        intensity: card.intensity,
        text: {
          en: `${card.title.en} — ${card.items.map((item) => item.en).join(', ')}`,
          fr: `${card.title.fr} — ${card.items.map((item) => item.fr).join(', ')}`,
        },
      })),
    },
  ],
  wavelength: [
    {
      key: 'spectrums',
      rows: SPECTRUMS.map((card) => ({
        id: card.id,
        adult: card.adult,
        intensity: card.intensity,
        text: { en: `${card.left.en} ↔ ${card.right.en}`, fr: `${card.left.fr} ↔ ${card.right.fr}` },
      })),
    },
  ],
  'trivia-night': [
    {
      key: 'quiz',
      rows: QUIZ.map((card) => ({
        id: card.id,
        adult: card.adult,
        intensity: card.intensity,
        text: {
          en: `${card.question.en} → ${card.options[card.correct]?.en ?? ''}`,
          fr: `${card.question.fr} → ${card.options[card.correct]?.fr ?? ''}`,
        },
      })),
    },
  ],
  'liar-liar': [
    {
      key: 'quiz',
      rows: LIAR_FACTS.map((card) => ({
        id: card.id,
        adult: card.adult,
        intensity: card.intensity,
        text: {
          en: `${card.question.en} → ${card.answer.en}`,
          fr: `${card.question.fr} → ${card.answer.fr}`,
        },
      })),
    },
  ],
};
