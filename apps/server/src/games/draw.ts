import type { DrawPublic } from '@piccolo/shared';
import { DRAW_WORDS } from './decks/draw.js';
import { cleanText, localize, newCursor, nextCard, type DeckCursor } from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * The artist draws on their phone, the picture lands on the television, and
 * everybody else types guesses.
 *
 * Strokes travel as `game:event` rather than in the public state: broadcasting
 * the whole drawing on every stroke would resend the entire picture a hundred
 * times a round. The full list still lives in server state and is published on
 * every phase change, so a screen that reloads mid-round gets the drawing back.
 */
const WINDOW_MS = 90_000;
const MAX_STROKES = 240;
const MAX_POINTS = 400;
const GUESSER_POINTS = 3;
const ARTIST_POINTS = 2;
const MAX_GUESSES_SHOWN = 12;

interface State {
  cursor: DeckCursor;
  round: number;
  phase: 'drawing' | 'reveal';
  artist: string;
  word: string;
  strokes: number[][];
  guesses: { id: string; text: string; correct: boolean }[];
  deadline: number;
  winner?: string;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

/** Accent- and punctuation-insensitive, because typing on a phone is hard. */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: DrawPublic = {
    kind: 'draw',
    round: state.round,
    phase: state.phase,
    artist: state.artist,
    strokes: state.strokes,
    guesses: state.guesses.slice(-MAX_GUESSES_SHOWN),
  };
  if (state.phase === 'drawing') pub.endsIn = Math.max(0, state.deadline - Date.now());
  else {
    pub.word = state.word;
    if (state.winner) pub.winner = state.winner;
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function deal(ctx: RoomGameContext, previous?: State): void {
  const cursor = previous?.cursor ?? newCursor(DRAW_WORDS, ctx.adultUnlocked);
  const { card, cursor: moved } = nextCard(DRAW_WORDS, cursor);
  const order = ctx.players.map((p) => p.id);
  const round = (previous?.round ?? 0) + 1;
  const artist = order[(round - 1) % Math.max(order.length, 1)] ?? '';
  const state: State = {
    cursor: moved,
    round,
    phase: 'drawing',
    artist,
    word: card ? localize(card.word, ctx.locale) : '',
    strokes: [],
    guesses: [],
    deadline: Date.now() + WINDOW_MS,
  };
  ctx.sendPrivate(artist, { word: state.word, artist: true });
  for (const player of ctx.players) {
    if (player.id !== artist) ctx.sendPrivate(player.id, { artist: false });
  }
  publish(ctx, state);
  ctx.schedule(WINDOW_MS + 200, (fresh) => {
    const current = fresh.getState<State>();
    if (current && current.phase === 'drawing' && current.round === state.round) {
      publish(fresh, { ...current, phase: 'reveal' });
    }
  });
}

export const drawAndGuess: RoomGame = {
  id: 'draw-and-guess',
  minPlayers: 3,
  maxPlayers: 10,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'stroke' && state.phase === 'drawing' && actor === state.artist) {
      if (!Array.isArray(payload)) return;
      const points = payload
        .filter((value): value is number => typeof value === 'number')
        .slice(0, MAX_POINTS)
        .map((value) => Math.max(0, Math.min(1000, Math.round(value))));
      if (points.length < 2) return;
      if (state.strokes.length >= MAX_STROKES) return;
      ctx.setState({ ...state, strokes: [...state.strokes, points] });
      ctx.emit('stroke', points);
      return;
    }

    if (action === 'clear' && state.phase === 'drawing' && actor === state.artist) {
      ctx.setState({ ...state, strokes: [] });
      ctx.emit('clear');
      return;
    }

    if (action === 'guess' && state.phase === 'drawing' && actor !== HOST_ACTOR) {
      if (actor === state.artist) return;
      const text = cleanText(payload, 40);
      if (!text) return;
      const correct = normalise(text) === normalise(state.word);
      const guesses = [...state.guesses, { id: actor, text, correct }];
      if (!correct) {
        ctx.setState({ ...state, guesses });
        ctx.emit('guess', { id: actor, text });
        // Wrong guesses go out as events too: the board only needs the last few
        // and the screen keeps its own list.
        return;
      }
      ctx.cancelTimers();
      ctx.addScore(actor, GUESSER_POINTS);
      ctx.addScore(state.artist, ARTIST_POINTS);
      ctx.emit('reveal');
      publish(ctx, { ...state, guesses, phase: 'reveal', winner: actor });
      return;
    }

    if (action === 'force' && state.phase === 'drawing' && driver(ctx, actor)) {
      ctx.cancelTimers();
      publish(ctx, { ...state, phase: 'reveal' });
      return;
    }

    if (action === 'next' && state.phase === 'reveal' && driver(ctx, actor)) {
      deal(ctx, state);
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) ctx.finish();
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    // Give the artist their word back and everyone the drawing so far.
    ctx.sendPrivate(state.artist, { word: state.word, artist: true });
    publish(ctx, state);
  },

  stop: (ctx) => ctx.cancelTimers(),
};
