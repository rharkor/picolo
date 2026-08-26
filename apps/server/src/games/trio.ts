import type { TrioPublic } from '@piccolo/shared';
import { activeIds, cleanText, everyoneIn, shuffle } from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Two Truths & a Lie, multi-device. Everybody writes their three at once — the
 * pass-the-phone edition has to wait for one person at a time, which is the one
 * thing a room full of phones genuinely fixes.
 */
const GUESS_POINTS = 1;
const FOOLED_POINTS = 1;

interface Entry {
  statements: string[];
  lie: number;
}

interface State {
  phase: 'writing' | 'guessing' | 'reveal';
  submissions: Record<string, Entry>;
  /** Whose set is shown, in order. */
  order: string[];
  index: number;
  guesses: Record<string, number>;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function publish(ctx: RoomGameContext, state: State): void {
  const subject = state.order[state.index];
  const entry = subject ? state.submissions[subject] : undefined;
  const pub: TrioPublic = {
    kind: 'trio',
    phase: state.phase,
    index: state.index + 1,
    total: state.order.length,
    submitted: Object.keys(state.submissions),
    guessed: Object.keys(state.guesses),
  };
  if (subject && entry && state.phase !== 'writing') {
    pub.subject = subject;
    pub.statements = entry.statements;
    if (state.phase === 'reveal') {
      pub.lie = entry.lie;
      pub.correct = Object.entries(state.guesses)
        .filter(([, guess]) => guess === entry.lie)
        .map(([id]) => id);
    }
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function score(ctx: RoomGameContext, state: State): void {
  const subject = state.order[state.index];
  const entry = subject ? state.submissions[subject] : undefined;
  if (!subject || !entry) return;
  let fooled = 0;
  for (const [guesser, guess] of Object.entries(state.guesses)) {
    if (guess === entry.lie) ctx.addScore(guesser, GUESS_POINTS);
    else fooled += 1;
  }
  if (fooled > 0) ctx.addScore(subject, fooled * FOOLED_POINTS);
}

export const trio: RoomGame = {
  id: 'two-truths-a-lie',
  minPlayers: 3,
  maxPlayers: 12,

  start: (ctx) =>
    publish(ctx, { phase: 'writing', submissions: {}, order: [], index: 0, guesses: {} }),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'submit' && state.phase === 'writing' && actor !== HOST_ACTOR) {
      const body = payload as { statements?: unknown; lie?: unknown } | undefined;
      const raw = Array.isArray(body?.statements) ? body.statements : [];
      const statements = raw.map((value) => cleanText(value, 120)).filter(Boolean);
      const lie = typeof body?.lie === 'number' ? body.lie : -1;
      if (statements.length !== 3 || lie < 0 || lie > 2) return;
      const submissions = { ...state.submissions, [actor]: { statements, lie } };
      const next: State = { ...state, submissions };
      if (everyoneIn(ctx, submissions)) {
        next.order = shuffle(Object.keys(submissions));
        next.phase = 'guessing';
        next.index = 0;
      }
      publish(ctx, next);
      return;
    }

    if (action === 'guess' && state.phase === 'guessing' && actor !== HOST_ACTOR) {
      const subject = state.order[state.index];
      if (!subject || subject === actor) return;
      const guess = typeof payload === 'number' ? payload : -1;
      if (guess < 0 || guess > 2) return;
      const guesses = { ...state.guesses, [actor]: guess };
      const next: State = { ...state, guesses };
      if (everyoneIn(ctx, guesses, [subject])) {
        next.phase = 'reveal';
        score(ctx, next);
        ctx.emit('reveal');
      }
      publish(ctx, next);
      return;
    }

    if (action === 'force' && driver(ctx, actor)) {
      if (state.phase === 'writing' && Object.keys(state.submissions).length >= 2) {
        publish(ctx, {
          ...state,
          order: shuffle(Object.keys(state.submissions)),
          phase: 'guessing',
          index: 0,
        });
        return;
      }
      if (state.phase === 'guessing') {
        const next: State = { ...state, phase: 'reveal' };
        score(ctx, next);
        publish(ctx, next);
        return;
      }
    }

    if (action === 'next' && state.phase === 'reveal' && driver(ctx, actor)) {
      if (state.index + 1 >= state.order.length) {
        ctx.finish();
        return;
      }
      publish(ctx, { ...state, index: state.index + 1, guesses: {}, phase: 'guessing' });
    }
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    const live = activeIds(ctx);
    if (state.phase === 'writing') {
      const submissions = Object.fromEntries(
        Object.entries(state.submissions).filter(([id]) => live.includes(id)),
      );
      publish(ctx, { ...state, submissions });
      return;
    }
    if (state.phase === 'guessing') {
      const subject = state.order[state.index];
      const guesses = Object.fromEntries(
        Object.entries(state.guesses).filter(([id]) => live.includes(id)),
      );
      const next: State = { ...state, guesses };
      if (subject && everyoneIn(ctx, guesses, [subject])) {
        next.phase = 'reveal';
        score(ctx, next);
      }
      publish(ctx, next);
    }
  },
};
