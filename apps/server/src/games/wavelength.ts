import type { WavelengthPublic } from '@piccolo/shared';
import { SPECTRUMS } from './decks/wavelength.js';
import {
  activeIds,
  cleanText,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * One player sees a hidden point on a spectrum and has to describe something
 * that sits exactly there. Everybody else drags a slider. The psychic scores
 * the average of what the room managed, so a clue that only one person
 * understands is worth almost nothing.
 */
const MIN_TARGET = 8;
const MAX_TARGET = 92;

interface State {
  cursor: DeckCursor;
  round: number;
  phase: 'clue' | 'guessing' | 'reveal';
  psychic: string;
  left: string;
  right: string;
  target: number;
  clue: string;
  guesses: Record<string, number>;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

/** Closer is worth more, and nothing beyond a third of the bar scores at all. */
function pointsFor(guess: number, target: number): number {
  const diff = Math.abs(guess - target);
  if (diff <= 4) return 4;
  if (diff <= 9) return 3;
  if (diff <= 18) return 2;
  if (diff <= 30) return 1;
  return 0;
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: WavelengthPublic = {
    kind: 'wavelength',
    round: state.round,
    phase: state.phase,
    left: state.left,
    right: state.right,
    psychic: state.psychic,
    guessed: Object.keys(state.guesses),
  };
  if (state.clue) pub.clue = state.clue;
  if (state.phase === 'reveal') {
    pub.target = state.target;
    pub.guesses = Object.entries(state.guesses).map(([id, value]) => ({
      id,
      value,
      points: pointsFor(value, state.target),
    }));
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function reveal(ctx: RoomGameContext, state: State): State {
  const next: State = { ...state, phase: 'reveal' };
  const scores = Object.entries(state.guesses).map(([id, value]) => ({
    id,
    points: pointsFor(value, state.target),
  }));
  for (const row of scores) ctx.addScore(row.id, row.points);
  if (scores.length > 0) {
    const average = scores.reduce((sum, row) => sum + row.points, 0) / scores.length;
    ctx.addScore(state.psychic, Math.round(average));
  }
  ctx.emit('reveal');
  return next;
}

function deal(ctx: RoomGameContext, previous?: State): void {
  const cursor = previous?.cursor ?? newCursor(SPECTRUMS, ctx.adultUnlocked);
  const { card, cursor: moved } = nextCard(SPECTRUMS, cursor);
  const order = ctx.players.map((p) => p.id);
  const round = (previous?.round ?? 0) + 1;
  const psychic = order[(round - 1) % Math.max(order.length, 1)] ?? '';
  const target = MIN_TARGET + Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1));

  const state: State = {
    cursor: moved,
    round,
    phase: 'clue',
    psychic,
    left: card ? localize(card.left, ctx.locale) : '',
    right: card ? localize(card.right, ctx.locale) : '',
    target,
    clue: '',
    guesses: {},
  };
  ctx.sendPrivate(psychic, { target, role: 'psychic' });
  for (const player of ctx.players) {
    if (player.id !== psychic) ctx.sendPrivate(player.id, { role: 'guesser' });
  }
  publish(ctx, state);
}

export const wavelength: RoomGame = {
  id: 'wavelength',
  minPlayers: 3,
  maxPlayers: 12,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'clue' && state.phase === 'clue' && actor === state.psychic) {
      const clue = cleanText(payload, 80);
      if (!clue) return;
      publish(ctx, { ...state, clue, phase: 'guessing' });
      return;
    }

    if (action === 'guess' && state.phase === 'guessing' && actor !== HOST_ACTOR) {
      if (actor === state.psychic) return;
      const value = typeof payload === 'number' ? Math.round(payload) : -1;
      if (value < 0 || value > 100) return;
      const guesses = { ...state.guesses, [actor]: value };
      let next: State = { ...state, guesses };
      if (everyoneIn(ctx, guesses, [state.psychic])) next = reveal(ctx, next);
      publish(ctx, next);
      return;
    }

    if (action === 'force' && driver(ctx, actor)) {
      if (state.phase === 'guessing') {
        publish(ctx, reveal(ctx, state));
        return;
      }
      // A psychic who has wandered off should not freeze the room.
      if (state.phase === 'clue') {
        publish(ctx, { ...state, clue: '…', phase: 'guessing' });
        return;
      }
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
    // Hand the target back to a psychic whose phone reloaded.
    ctx.sendPrivate(state.psychic, { target: state.target, role: 'psychic' });
    if (state.phase !== 'guessing') {
      publish(ctx, state);
      return;
    }
    const live = activeIds(ctx);
    const guesses = Object.fromEntries(
      Object.entries(state.guesses).filter(([id]) => live.includes(id)),
    );
    let next: State = { ...state, guesses };
    if (everyoneIn(ctx, guesses, [state.psychic])) next = reveal(ctx, next);
    publish(ctx, next);
  },
};
