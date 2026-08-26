import type { RankPublic } from '@piccolo/shared';
import { RANK_SETS } from './decks/rank.js';
import {
  activeIds,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Rank five things privately, then score for agreeing with the room. The point
 * is the argument afterwards, so the consensus is computed the boring way —
 * mean position — and shown in full.
 */
const PERFECT_BONUS = 3;

interface State {
  cursor: DeckCursor;
  round: number;
  phase: 'ranking' | 'reveal';
  title: string;
  items: string[];
  /** playerId -> item indices, best first. */
  submissions: Record<string, number[]>;
  consensus: number[];
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

/** Item indices sorted by their mean position across every submitted ranking. */
function consensusOf(state: State): number[] {
  const totals = state.items.map((_, index) => {
    const ranks = Object.values(state.submissions).map((order) => {
      const at = order.indexOf(index);
      return at === -1 ? state.items.length : at;
    });
    const mean = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;
    return { index, mean };
  });
  return totals.sort((a, b) => a.mean - b.mean).map((row) => row.index);
}

function scoreOf(order: number[], consensus: number[]): number {
  let hits = 0;
  consensus.forEach((item, position) => {
    if (order[position] === item) hits += 1;
  });
  return hits + (hits === consensus.length ? PERFECT_BONUS : 0);
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: RankPublic = {
    kind: 'rank',
    round: state.round,
    phase: state.phase,
    title: state.title,
    items: state.items,
    submitted: Object.keys(state.submissions),
  };
  if (state.phase === 'reveal') {
    pub.consensus = state.consensus;
    pub.scores = Object.entries(state.submissions).map(([id, order]) => ({
      id,
      points: scoreOf(order, state.consensus),
    }));
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function reveal(ctx: RoomGameContext, state: State): State {
  const consensus = consensusOf(state);
  const next: State = { ...state, phase: 'reveal', consensus };
  for (const [id, order] of Object.entries(state.submissions)) {
    ctx.addScore(id, scoreOf(order, consensus));
  }
  ctx.emit('reveal');
  return next;
}

function deal(ctx: RoomGameContext, previous?: State): void {
  const cursor = previous?.cursor ?? newCursor(RANK_SETS, ctx.adultUnlocked);
  const { card, cursor: moved } = nextCard(RANK_SETS, cursor);
  publish(ctx, {
    cursor: moved,
    round: (previous?.round ?? 0) + 1,
    phase: 'ranking',
    title: card ? localize(card.title, ctx.locale) : '',
    items: card ? card.items.map((item) => localize(item, ctx.locale)) : [],
    submissions: {},
    consensus: [],
  });
}

export const rankIt: RoomGame = {
  id: 'rank-it',
  minPlayers: 3,
  maxPlayers: 12,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'submit' && state.phase === 'ranking' && actor !== HOST_ACTOR) {
      if (!Array.isArray(payload)) return;
      const order = payload.filter((value): value is number => typeof value === 'number');
      // Reject anything that is not a clean permutation, rather than trying to
      // repair it — a malformed ranking would silently skew the consensus.
      const valid =
        order.length === state.items.length && new Set(order).size === state.items.length &&
        order.every((index) => index >= 0 && index < state.items.length);
      if (!valid) return;
      const submissions = { ...state.submissions, [actor]: order };
      let next: State = { ...state, submissions };
      if (everyoneIn(ctx, submissions)) next = reveal(ctx, next);
      publish(ctx, next);
      return;
    }

    if (action === 'force' && state.phase === 'ranking' && driver(ctx, actor)) {
      if (Object.keys(state.submissions).length === 0) return;
      publish(ctx, reveal(ctx, state));
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
    if (!state || state.phase !== 'ranking') return;
    const live = activeIds(ctx);
    const submissions = Object.fromEntries(
      Object.entries(state.submissions).filter(([id]) => live.includes(id)),
    );
    let next: State = { ...state, submissions };
    if (everyoneIn(ctx, submissions)) next = reveal(ctx, next);
    publish(ctx, next);
  },
};
