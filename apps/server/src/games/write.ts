import type { WritePublic } from '@piccolo/shared';
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
import type { FillCard } from './decks/punchline.js';
import type { TriviaFactCard } from './decks/liar.js';

/**
 * Write something on your phone, then vote on what everyone wrote. Punchline
 * scores the funniest; Liar Liar hides one true answer among the inventions and
 * scores you for finding it. Same three phases either way.
 */
type Mode = 'funniest' | 'find-truth';

interface Entry {
  id: string;
  text: string;
  /** null marks the real answer in find-truth mode. */
  author: string | null;
}

interface WriteState {
  cursor: DeckCursor;
  round: number;
  phase: 'writing' | 'voting' | 'reveal';
  prompt: string;
  truth?: string;
  submissions: Record<string, string>;
  entries: Entry[];
  votes: Record<string, string>;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

export function createWriteGame(config: {
  id: string;
  mode: Mode;
  minPlayers: number;
  maxPlayers: number | null;
  deck: readonly (FillCard | TriviaFactCard)[];
}): RoomGame {
  const { id, mode, minPlayers, maxPlayers, deck } = config;

  function publish(ctx: RoomGameContext, state: WriteState): void {
    const pub: WritePublic = {
      kind: 'write',
      round: state.round,
      phase: state.phase,
      prompt: state.prompt,
      submitted: Object.keys(state.submissions),
      voted: Object.keys(state.votes),
    };

    if (state.phase === 'voting' || state.phase === 'reveal') {
      const counts: Record<string, number> = {};
      for (const entryId of Object.values(state.votes)) {
        counts[entryId] = (counts[entryId] ?? 0) + 1;
      }
      pub.entries = state.entries.map((entry) => ({
        id: entry.id,
        text: entry.text,
        // Authors stay hidden while people are still voting.
        ...(state.phase === 'reveal'
          ? {
              author: entry.author ?? undefined,
              votes: counts[entry.id] ?? 0,
              correct: mode === 'find-truth' ? entry.author === null : undefined,
            }
          : {}),
      }));
    }

    if (state.phase === 'voting') {
      // Tell each author which entry is theirs: the ballot is anonymous, but a
      // phone still has to grey out your own line rather than reject the tap.
      for (const entry of state.entries) {
        if (entry.author) ctx.sendPrivate(entry.author, { mine: entry.id });
      }
    }

    if (state.phase === 'reveal') {
      if (state.truth) pub.truth = state.truth;
      const counts: Record<string, number> = {};
      for (const entryId of Object.values(state.votes)) {
        counts[entryId] = (counts[entryId] ?? 0) + 1;
      }
      const best = Math.max(0, ...Object.values(counts));
      pub.winners =
        best === 0
          ? []
          : state.entries
              .filter((entry) => (counts[entry.id] ?? 0) === best && entry.author)
              .map((entry) => entry.author as string);
    }

    ctx.setState(state);
    ctx.setPublic(pub);
  }

  function deal(ctx: RoomGameContext, previous?: WriteState): void {
    const cursor = previous?.cursor ?? newCursor(deck, ctx.adultUnlocked);
    const { card, cursor: moved } = nextCard(deck, cursor);
    const prompt = card
      ? localize('question' in card ? card.question : card.text, ctx.locale)
      : '';
    const truth =
      card && 'answer' in card ? localize(card.answer, ctx.locale) : undefined;
    publish(ctx, {
      cursor: moved,
      round: (previous?.round ?? 0) + 1,
      phase: 'writing',
      prompt,
      ...(truth ? { truth } : {}),
      submissions: {},
      entries: [],
      votes: {},
    });
  }

  /** Builds the shuffled ballot once everybody has written something. */
  function toVoting(state: WriteState): WriteState {
    const written: Entry[] = Object.entries(state.submissions).map(([author, text], i) => ({
      id: `e${i}`,
      text,
      author,
    }));
    if (mode === 'find-truth' && state.truth) {
      written.push({ id: 'truth', text: state.truth, author: null });
    }
    return { ...state, phase: 'voting', entries: shuffle(written) };
  }

  function score(ctx: RoomGameContext, state: WriteState): void {
    for (const [voter, entryId] of Object.entries(state.votes)) {
      const entry = state.entries.find((e) => e.id === entryId);
      if (!entry) continue;
      if (mode === 'find-truth') {
        if (entry.author === null) ctx.addScore(voter, 2);
        else ctx.addScore(entry.author, 1);
      } else if (entry.author) {
        ctx.addScore(entry.author, 1);
      }
    }
  }

  return {
    id,
    minPlayers,
    maxPlayers,
    start: (ctx) => deal(ctx),
    action: (ctx, actor, action, payload) => {
      const state = ctx.getState<WriteState>();
      if (!state) return;

      if (action === 'submit' && state.phase === 'writing' && actor !== HOST_ACTOR) {
        const text = cleanText(payload, 140);
        if (!text) return;
        const submissions = { ...state.submissions, [actor]: text };
        let next: WriteState = { ...state, submissions };
        if (everyoneIn(ctx, submissions)) next = toVoting(next);
        publish(ctx, next);
        return;
      }

      if (action === 'vote' && state.phase === 'voting' && actor !== HOST_ACTOR) {
        const entryId = typeof payload === 'string' ? payload : '';
        const entry = state.entries.find((e) => e.id === entryId);
        // You cannot vote for your own line — that is the only rule worth
        // enforcing on the server here.
        if (!entry || entry.author === actor) return;
        const votes = { ...state.votes, [actor]: entryId };
        const next: WriteState = { ...state, votes };
        if (everyoneIn(ctx, votes)) {
          next.phase = 'reveal';
          score(ctx, next);
          ctx.emit('reveal');
        }
        publish(ctx, next);
        return;
      }

      if (action === 'force' && driver(ctx, actor)) {
        if (state.phase === 'writing' && Object.keys(state.submissions).length >= 2) {
          publish(ctx, toVoting(state));
          return;
        }
        if (state.phase === 'voting') {
          const next: WriteState = { ...state, phase: 'reveal' };
          score(ctx, next);
          publish(ctx, next);
          return;
        }
      }

      if (action === 'next' && driver(ctx, actor)) {
        deal(ctx, state);
      }
    },
    playersChanged: (ctx) => {
      const state = ctx.getState<WriteState>();
      if (!state) return;
      const live = activeIds(ctx);
      if (state.phase === 'writing') {
        const submissions = Object.fromEntries(
          Object.entries(state.submissions).filter(([author]) => live.includes(author)),
        );
        let next: WriteState = { ...state, submissions };
        if (everyoneIn(ctx, submissions)) next = toVoting(next);
        publish(ctx, next);
        return;
      }
      if (state.phase === 'voting') {
        const votes = Object.fromEntries(
          Object.entries(state.votes).filter(([voter]) => live.includes(voter)),
        );
        const next: WriteState = { ...state, votes };
        if (everyoneIn(ctx, votes)) {
          next.phase = 'reveal';
          score(ctx, next);
        }
        publish(ctx, next);
      }
    },
  };
}
