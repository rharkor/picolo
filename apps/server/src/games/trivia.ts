import type { TriviaPublic } from '@piccolo/shared';
import { QUIZ } from './decks/trivia.js';
import {
  activeIds,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  shuffle,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Buzzer trivia. Points are mostly speed: everyone who knows it gets the base,
 * and the difference between first and last is the interesting half. Fifteen
 * seconds is long enough to read four options on a phone and no longer.
 */
const ROUNDS = 10;
const WINDOW_MS = 15_000;
const BASE_POINTS = 500;
const SPEED_POINTS = 500;

interface State {
  cursor: DeckCursor;
  round: number;
  phase: 'question' | 'reveal' | 'over';
  question: string;
  options: string[];
  correct: number;
  /** playerId -> { picked, at } */
  answers: Record<string, { picked: number; at: number }>;
  deadline: number;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: TriviaPublic = {
    kind: 'trivia',
    round: state.round,
    total: ROUNDS,
    phase: state.phase,
    question: state.question,
    options: state.options,
    answered: Object.keys(state.answers),
  };
  if (state.phase === 'question') {
    pub.endsIn = Math.max(0, state.deadline - Date.now());
  } else {
    pub.correct = state.correct;
    pub.gained = ctx.players.map((player) => {
      const answer = state.answers[player.id];
      return {
        id: player.id,
        picked: answer ? answer.picked : null,
        points: answer && answer.picked === state.correct ? pointsFor(answer.at, state.deadline) : 0,
      };
    });
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

/** Full speed bonus for an instant answer, none for a last-second one. */
function pointsFor(at: number, deadline: number): number {
  const left = Math.max(0, deadline - at);
  return BASE_POINTS + Math.round((left / WINDOW_MS) * SPEED_POINTS);
}

function reveal(ctx: RoomGameContext, state: State): void {
  ctx.cancelTimers();
  const next: State = { ...state, phase: 'reveal' };
  for (const [id, answer] of Object.entries(state.answers)) {
    if (answer.picked === state.correct) ctx.addScore(id, pointsFor(answer.at, state.deadline));
  }
  ctx.emit('reveal');
  publish(ctx, next);
}

function ask(ctx: RoomGameContext, previous?: State): void {
  const cursor = previous?.cursor ?? newCursor(QUIZ, ctx.adultUnlocked);
  const { card, cursor: moved } = nextCard(QUIZ, cursor);
  if (!card) {
    ctx.finish();
    return;
  }
  // Shuffle the options so the right answer is never in a learnable position.
  const order = shuffle(card.options.map((_, i) => i));
  const state: State = {
    cursor: moved,
    round: (previous?.round ?? 0) + 1,
    phase: 'question',
    question: localize(card.question, ctx.locale),
    options: order.map((i) => localize(card.options[i] ?? { en: '', fr: '' }, ctx.locale)),
    correct: order.indexOf(card.correct),
    answers: {},
    deadline: Date.now() + WINDOW_MS,
  };
  publish(ctx, state);
  ctx.schedule(WINDOW_MS + 200, (fresh) => {
    const current = fresh.getState<State>();
    if (current && current.phase === 'question' && current.round === state.round) {
      reveal(fresh, current);
    }
  });
}

export const trivia: RoomGame = {
  id: 'trivia-night',
  minPlayers: 2,
  maxPlayers: 16,

  start: (ctx) => ask(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'answer' && state.phase === 'question' && actor !== HOST_ACTOR) {
      if (state.answers[actor]) return; // no changing your mind
      const picked = typeof payload === 'number' ? payload : -1;
      if (picked < 0 || picked >= state.options.length) return;
      const answers = { ...state.answers, [actor]: { picked, at: Date.now() } };
      const next: State = { ...state, answers };
      if (everyoneIn(ctx, answers)) {
        reveal(ctx, next);
        return;
      }
      publish(ctx, next);
      return;
    }

    if (action === 'force' && state.phase === 'question' && driver(ctx, actor)) {
      reveal(ctx, state);
      return;
    }

    if (action === 'next' && state.phase === 'reveal' && driver(ctx, actor)) {
      if (state.round >= ROUNDS) {
        ctx.finish();
        return;
      }
      ask(ctx, state);
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) ctx.finish();
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state || state.phase !== 'question') return;
    const live = activeIds(ctx);
    const answers = Object.fromEntries(
      Object.entries(state.answers).filter(([id]) => live.includes(id)),
    );
    const next: State = { ...state, answers };
    if (everyoneIn(ctx, answers)) {
      reveal(ctx, next);
      return;
    }
    publish(ctx, next);
  },

  stop: (ctx) => ctx.cancelTimers(),
};
