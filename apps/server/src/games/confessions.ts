import type { AuthorPublic } from '@piccolo/shared';
import { CONFESSION_PROMPTS } from './decks/confessions.js';
import {
  activeIds,
  cleanText,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  shuffle,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Everybody writes one confession, then the room works through them one at a
 * time guessing who wrote each. Getting it right is a point; getting away with
 * yours is worth two, which is what keeps people honest enough to be
 * interesting.
 */
const GUESS_POINTS = 1;
const HIDDEN_POINTS = 2;

interface Entry {
  author: string;
  text: string;
}

interface State {
  cursor: DeckCursor;
  prompt: string;
  phase: 'writing' | 'guessing' | 'reveal';
  submissions: Record<string, string>;
  /** Shuffled once, then walked in order. */
  entries: Entry[];
  index: number;
  /** guesser -> suspected author, for the entry on screen. */
  guesses: Record<string, string>;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function publish(ctx: RoomGameContext, state: State): void {
  const entry = state.entries[state.index];
  const pub: AuthorPublic = {
    kind: 'author',
    index: state.index + 1,
    total: state.entries.length,
    phase: state.phase,
    prompt: state.prompt,
    submitted: Object.keys(state.submissions),
    guessed: Object.keys(state.guesses),
  };
  if (entry && state.phase !== 'writing') {
    pub.entry = entry.text;
    // Whoever wrote the confession on screen is told so privately, so a phone
    // that reloaded mid-round still knows to keep quiet.
    for (const player of ctx.players) {
      ctx.sendPrivate(player.id, { yours: player.id === entry.author });
    }
    if (state.phase === 'reveal') {
      pub.author = entry.author;
      pub.correct = Object.entries(state.guesses)
        .filter(([, suspect]) => suspect === entry.author)
        .map(([guesser]) => guesser);
    }
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function score(ctx: RoomGameContext, state: State): void {
  const entry = state.entries[state.index];
  if (!entry) return;
  const right = Object.entries(state.guesses).filter(([, suspect]) => suspect === entry.author);
  for (const [guesser] of right) ctx.addScore(guesser, GUESS_POINTS);
  if (right.length === 0) ctx.addScore(entry.author, HIDDEN_POINTS);
}

export const confessions: RoomGame = {
  id: 'confessions',
  minPlayers: 4,
  maxPlayers: 12,

  start: (ctx) => {
    const cursor = newCursor(CONFESSION_PROMPTS, ctx.adultUnlocked);
    const { card, cursor: moved } = nextCard(CONFESSION_PROMPTS, cursor);
    publish(ctx, {
      cursor: moved,
      prompt: card ? localize(card.text, ctx.locale) : '',
      phase: 'writing',
      submissions: {},
      entries: [],
      index: 0,
      guesses: {},
    });
  },

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'submit' && state.phase === 'writing' && actor !== HOST_ACTOR) {
      const text = cleanText(payload, 180);
      if (!text) return;
      const submissions = { ...state.submissions, [actor]: text };
      const next: State = { ...state, submissions };
      if (everyoneIn(ctx, submissions)) {
        next.entries = shuffle(
          Object.entries(submissions).map(([author, value]) => ({ author, text: value })),
        );
        next.phase = 'guessing';
      }
      publish(ctx, next);
      return;
    }

    if (action === 'guess' && state.phase === 'guessing' && actor !== HOST_ACTOR) {
      const suspect = typeof payload === 'string' ? payload : '';
      if (!ctx.players.some((p) => p.id === suspect)) return;
      const entry = state.entries[state.index];
      // The author cannot vote on their own confession.
      if (!entry || entry.author === actor) return;
      const guesses = { ...state.guesses, [actor]: suspect };
      const next: State = { ...state, guesses };
      if (everyoneIn(ctx, guesses, [entry.author])) {
        next.phase = 'reveal';
        score(ctx, next);
        ctx.emit('reveal');
      }
      publish(ctx, next);
      return;
    }

    if (action === 'force' && driver(ctx, actor)) {
      if (state.phase === 'writing' && Object.keys(state.submissions).length >= 3) {
        publish(ctx, {
          ...state,
          entries: shuffle(
            Object.entries(state.submissions).map(([author, value]) => ({ author, text: value })),
          ),
          phase: 'guessing',
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
      if (state.index + 1 >= state.entries.length) {
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
        Object.entries(state.submissions).filter(([author]) => live.includes(author)),
      );
      publish(ctx, { ...state, submissions });
      return;
    }
    if (state.phase === 'guessing') {
      const entry = state.entries[state.index];
      const guesses = Object.fromEntries(
        Object.entries(state.guesses).filter(([guesser]) => live.includes(guesser)),
      );
      const next: State = { ...state, guesses };
      if (entry && everyoneIn(ctx, guesses, [entry.author])) {
        next.phase = 'reveal';
        score(ctx, next);
      }
      publish(ctx, next);
    }
  },
};
