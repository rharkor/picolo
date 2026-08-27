import type { ImpostorPublic } from '@piccolo/shared';
import { IMPOSTOR_PAIRS } from './decks/impostor.js';
import {
  activeIds,
  countVotes,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  shuffle,
  topVoted,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Mr White for a room full of phones. Same rules as the pass-the-phone edition,
 * but nobody has to hand a device around: each phone holds its own word, and the
 * screen holds the clue order and the vote.
 */
type Role = 'civilian' | 'undercover' | 'white';

interface State {
  cursor: DeckCursor;
  round: number;
  phase: ImpostorPublic['phase'];
  roles: Record<string, Role>;
  words: { civilian: string; undercover: string };
  clueOrder: string[];
  ready: string[];
  votes: Record<string, string>;
  out: string[];
  ejected?: string;
  ejectedRole?: Role;
  tie?: boolean;
  outcome?: 'civilians' | 'impostors';
}

/** The usual split for a table of this size. */
function split(count: number): { undercovers: number; whites: number } {
  if (count <= 4) return { undercovers: 1, whites: 0 };
  if (count <= 6) return { undercovers: 1, whites: 1 };
  if (count <= 9) return { undercovers: 2, whites: 1 };
  return { undercovers: 2, whites: 2 };
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

/**
 * Mr White has nothing to say before he has heard a real clue, so the lineup is
 * rotated until somebody who actually holds a word leads off. A rotation rather
 * than a reshuffle: the running order the table has already seen stays intact,
 * and it keeps working in later rounds once the original leader is voted out.
 */
function clueLineup(state: State): string[] {
  const list = state.clueOrder.filter((id) => !state.out.includes(id));
  const lead = list.findIndex((id) => (state.roles[id] ?? 'civilian') !== 'white');
  if (lead <= 0) return list;
  return [...list.slice(lead), ...list.slice(0, lead)];
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: ImpostorPublic = {
    kind: 'impostor',
    round: state.round,
    phase: state.phase,
    clueOrder: clueLineup(state),
    ready: state.ready,
    voted: Object.keys(state.votes),
    out: state.out,
  };
  if (state.phase === 'voting' || state.phase === 'reveal') {
    const counts = countVotes(state.votes);
    pub.results = ctx.players
      .filter((p) => !state.out.includes(p.id) || p.id === state.ejected)
      .map((p) => ({ id: p.id, votes: counts[p.id] ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
  }
  if (state.phase === 'reveal' || state.phase === 'over') {
    if (state.ejected) pub.ejected = state.ejected;
    if (state.ejectedRole) pub.ejectedRole = state.ejectedRole;
    if (state.tie) pub.tie = true;
    if (state.ejectedRole === 'white' && !state.outcome) pub.whiteGuess = true;
  }
  if (state.phase === 'over') {
    pub.outcome = state.outcome;
    pub.words = state.words;
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function dealPrivate(ctx: RoomGameContext, state: State): void {
  for (const player of ctx.players) {
    const role = state.roles[player.id] ?? 'civilian';
    ctx.sendPrivate(player.id, {
      role,
      word:
        role === 'white' ? null : role === 'undercover' ? state.words.undercover : state.words.civilian,
      out: state.out.includes(player.id),
    });
  }
}

function deal(ctx: RoomGameContext, previous?: State): void {
  const cursor = previous?.cursor ?? newCursor(IMPOSTOR_PAIRS, ctx.adultUnlocked);
  const { card, cursor: moved } = nextCard(IMPOSTOR_PAIRS, cursor);
  // Which half the civilians get flips every deal, so a repeated pair does not
  // play out the same way.
  const flip = Math.random() < 0.5;
  const words = card
    ? {
        civilian: localize(flip ? card.b : card.a, ctx.locale),
        undercover: localize(flip ? card.a : card.b, ctx.locale),
      }
    : { civilian: '', undercover: '' };

  const seats = shuffle(ctx.players.map((p) => p.id));
  const { undercovers, whites } = split(seats.length);
  const roles: Record<string, Role> = {};
  seats.forEach((id, i) => {
    if (i < whites) roles[id] = 'white';
    else if (i < whites + undercovers) roles[id] = 'undercover';
    else roles[id] = 'civilian';
  });

  const state: State = {
    cursor: moved,
    round: (previous?.round ?? 0) + 1,
    phase: 'peeking',
    roles,
    words,
    // Clue order is its own shuffle: starting with an impostor every time would
    // be a tell.
    clueOrder: shuffle(seats),
    ready: [],
    votes: {},
    out: [],
  };
  dealPrivate(ctx, state);
  publish(ctx, state);
}

function alive(ctx: RoomGameContext, state: State): string[] {
  return ctx.players.filter((p) => !state.out.includes(p.id)).map((p) => p.id);
}

function checkWin(ctx: RoomGameContext, state: State): State {
  const remaining = alive(ctx, state);
  const impostors = remaining.filter((id) => (state.roles[id] ?? 'civilian') !== 'civilian');
  const civilians = remaining.length - impostors.length;
  if (impostors.length === 0) return { ...state, phase: 'over', outcome: 'civilians' };
  if (civilians <= impostors.length) return { ...state, phase: 'over', outcome: 'impostors' };
  return state;
}

function award(ctx: RoomGameContext, state: State, outcome: 'civilians' | 'impostors'): void {
  for (const player of ctx.players) {
    const role = state.roles[player.id] ?? 'civilian';
    const won = outcome === 'civilians' ? role === 'civilian' : role !== 'civilian';
    if (won) ctx.addScore(player.id, role === 'civilian' ? 1 : 2);
  }
}

export const impostor: RoomGame = {
  id: 'impostor',
  minPlayers: 4,
  maxPlayers: 12,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'ready' && state.phase === 'peeking' && actor !== HOST_ACTOR) {
      const ready = state.ready.includes(actor) ? state.ready : [...state.ready, actor];
      const next: State = { ...state, ready };
      if (activeIds(ctx).every((id) => ready.includes(id))) next.phase = 'clues';
      publish(ctx, next);
      return;
    }

    if (action === 'to-vote' && state.phase === 'clues' && driver(ctx, actor)) {
      publish(ctx, { ...state, phase: 'voting', votes: {} });
      return;
    }

    if (action === 'vote' && state.phase === 'voting' && actor !== HOST_ACTOR) {
      if (state.out.includes(actor)) return;
      const target = typeof payload === 'string' ? payload : '';
      if (!alive(ctx, state).includes(target)) return;
      const votes = { ...state.votes, [actor]: target };
      let next: State = { ...state, votes };
      if (everyoneIn(ctx, votes, state.out)) next = resolveVote(ctx, next);
      publish(ctx, next);
      return;
    }

    if (action === 'force' && state.phase === 'voting' && driver(ctx, actor)) {
      publish(ctx, resolveVote(ctx, state));
      return;
    }

    // The table judges Mr White's guess out loud; the screen only records it.
    if (action === 'white-right' && driver(ctx, actor) && state.phase === 'reveal') {
      const next: State = { ...state, phase: 'over', outcome: 'impostors' };
      award(ctx, next, 'impostors');
      publish(ctx, next);
      return;
    }

    if (action === 'white-wrong' && driver(ctx, actor) && state.phase === 'reveal') {
      const next = checkWin(ctx, { ...state, ejectedRole: undefined });
      if (next.phase === 'over' && next.outcome) award(ctx, next, next.outcome);
      publish(ctx, next.phase === 'over' ? next : { ...next, phase: 'clues', votes: {} });
      return;
    }

    if (action === 'next' && state.phase === 'reveal' && driver(ctx, actor)) {
      publish(ctx, { ...state, phase: 'clues', votes: {}, ejected: undefined, ejectedRole: undefined, tie: undefined });
      return;
    }

    if (action === 'again' && state.phase === 'over' && driver(ctx, actor)) {
      deal(ctx, state);
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) {
      ctx.finish();
    }
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    // A phone that reloads has lost its word — hand it back.
    dealPrivate(ctx, state);
    publish(ctx, state);
  },
};

function resolveVote(ctx: RoomGameContext, state: State): State {
  const counts = countVotes(state.votes);
  const top = topVoted(counts);
  if (top.length !== 1) {
    return { ...state, phase: 'reveal', tie: true, ejected: undefined, ejectedRole: undefined };
  }
  const ejected = top[0] as string;
  const role = state.roles[ejected] ?? 'civilian';
  const next: State = {
    ...state,
    phase: 'reveal',
    out: [...state.out, ejected],
    ejected,
    ejectedRole: role,
    tie: undefined,
  };
  ctx.emit('reveal');
  // Mr White gets one shot at the word before the win check runs.
  if (role === 'white') return next;
  const settled = checkWin(ctx, next);
  if (settled.phase === 'over' && settled.outcome) award(ctx, settled, settled.outcome);
  return settled;
}
