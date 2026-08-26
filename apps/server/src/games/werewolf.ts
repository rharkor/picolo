import type { WerewolfPublic } from '@piccolo/shared';
import { activeIds, countVotes, shuffle, topVoted } from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Werewolf with no narrator and no cards. Roles land on phones, the night
 * happens silently in everyone's hands, and the screen only ever announces what
 * the whole table is allowed to know.
 *
 * Deliberately short: one wolf kill and one vote per round, no doctor, no
 * cupid. A round takes about three minutes, which is the only version people
 * actually play twice.
 */
type Role = 'wolf' | 'seer' | 'villager';

interface State {
  round: number;
  phase: WerewolfPublic['phase'];
  roles: Record<string, Role>;
  out: string[];
  ready: string[];
  /** Night: wolf id -> target, plus the seer's inspection. */
  kills: Record<string, string>;
  inspected: Record<string, string>;
  votes: Record<string, string>;
  /** Everything the seer has learned, kept so a re-deal cannot erase it. */
  seerLog: { name: string; isWolf: boolean }[];
  killed?: string | null;
  ejected?: string;
  ejectedRole?: Role;
  outcome?: 'village' | 'wolves';
}

function wolfCount(players: number): number {
  if (players <= 7) return 1;
  if (players <= 11) return 2;
  return 3;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function aliveIds(ctx: RoomGameContext, state: State): string[] {
  return ctx.players.filter((p) => !state.out.includes(p.id)).map((p) => p.id);
}

function roleHolders(ctx: RoomGameContext, state: State, role: Role): string[] {
  return aliveIds(ctx, state).filter((id) => state.roles[id] === role);
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: WerewolfPublic = {
    kind: 'werewolf',
    round: state.round,
    phase: state.phase,
    ready: state.ready,
    acted: [...Object.keys(state.kills), ...Object.keys(state.inspected)],
    voted: Object.keys(state.votes),
    out: state.out,
  };
  if (state.killed !== undefined) pub.killed = state.killed;
  if (state.ejected) pub.ejected = state.ejected;
  if (state.ejectedRole) pub.ejectedRole = state.ejectedRole;
  if (state.phase === 'voting' || state.phase === 'reveal') {
    const counts = countVotes(state.votes);
    pub.results = aliveIds(ctx, state)
      .concat(state.ejected ? [state.ejected] : [])
      .filter((id, i, list) => list.indexOf(id) === i)
      .map((id) => ({ id, votes: counts[id] ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
  }
  if (state.phase === 'over') {
    pub.outcome = state.outcome;
    pub.reveal = ctx.players.map((player) => ({
      id: player.id,
      role: state.roles[player.id] ?? 'villager',
    }));
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

function dealPrivate(ctx: RoomGameContext, state: State): void {
  const wolves = ctx.players
    .filter((p) => state.roles[p.id] === 'wolf')
    .map((p) => p.id);
  for (const player of ctx.players) {
    const role = state.roles[player.id] ?? 'villager';
    ctx.sendPrivate(player.id, {
      role,
      out: state.out.includes(player.id),
      // Wolves know each other. Nobody else knows anything.
      ...(role === 'wolf' ? { wolves } : {}),
      ...(role === 'seer' ? { seerLog: state.seerLog } : {}),
    });
  }
}

function checkWin(ctx: RoomGameContext, state: State): State {
  const alive = aliveIds(ctx, state);
  const wolves = alive.filter((id) => state.roles[id] === 'wolf');
  if (wolves.length === 0) return { ...state, phase: 'over', outcome: 'village' };
  if (wolves.length >= alive.length - wolves.length) {
    return { ...state, phase: 'over', outcome: 'wolves' };
  }
  return state;
}

function award(ctx: RoomGameContext, state: State, outcome: 'village' | 'wolves'): void {
  for (const player of ctx.players) {
    const role = state.roles[player.id] ?? 'villager';
    const won = outcome === 'wolves' ? role === 'wolf' : role !== 'wolf';
    if (won) ctx.addScore(player.id, role === 'wolf' ? 3 : 1);
  }
}

function deal(ctx: RoomGameContext, previous?: State): void {
  const seats = shuffle(ctx.players.map((p) => p.id));
  const wolves = wolfCount(seats.length);
  const roles: Record<string, Role> = {};
  seats.forEach((id, i) => {
    if (i < wolves) roles[id] = 'wolf';
    else if (i === wolves) roles[id] = 'seer';
    else roles[id] = 'villager';
  });
  const state: State = {
    round: (previous?.round ?? 0) + 1,
    phase: 'peeking',
    roles,
    out: [],
    ready: [],
    kills: {},
    inspected: {},
    votes: {},
    seerLog: [],
  };
  dealPrivate(ctx, state);
  publish(ctx, state);
}

/** Night is over once every living wolf and the seer, if alive, have acted. */
function nightDone(ctx: RoomGameContext, state: State): boolean {
  const wolves = roleHolders(ctx, state, 'wolf');
  const seers = roleHolders(ctx, state, 'seer');
  const live = activeIds(ctx);
  const wolvesIn = wolves
    .filter((id) => live.includes(id))
    .every((id) => state.kills[id] !== undefined);
  const seerIn = seers
    .filter((id) => live.includes(id))
    .every((id) => state.inspected[id] !== undefined);
  return wolvesIn && seerIn;
}

function dawn(ctx: RoomGameContext, state: State): State {
  const target = topVoted(countVotes(state.kills));
  const killed = target[0] ?? null;
  const next: State = {
    ...state,
    phase: 'day',
    out: killed ? [...state.out, killed] : state.out,
    killed,
    kills: {},
    inspected: {},
  };
  ctx.emit('reveal');
  const settled = checkWin(ctx, next);
  if (settled.phase === 'over' && settled.outcome) award(ctx, settled, settled.outcome);
  dealPrivate(ctx, settled);
  return settled;
}

function resolveVote(ctx: RoomGameContext, state: State): State {
  const top = topVoted(countVotes(state.votes));
  if (top.length !== 1) {
    return { ...state, phase: 'reveal', ejected: undefined, ejectedRole: undefined };
  }
  const ejected = top[0] as string;
  const next: State = {
    ...state,
    phase: 'reveal',
    out: [...state.out, ejected],
    ejected,
    ejectedRole: state.roles[ejected] ?? 'villager',
  };
  ctx.emit('reveal');
  const settled = checkWin(ctx, next);
  if (settled.phase === 'over' && settled.outcome) award(ctx, settled, settled.outcome);
  dealPrivate(ctx, settled);
  return settled;
}

export const werewolf: RoomGame = {
  id: 'werewolf-express',
  minPlayers: 5,
  maxPlayers: 16,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;
    const target = typeof payload === 'string' ? payload : '';

    if (action === 'ready' && state.phase === 'peeking' && actor !== HOST_ACTOR) {
      const ready = state.ready.includes(actor) ? state.ready : [...state.ready, actor];
      const next: State = { ...state, ready };
      if (activeIds(ctx).every((id) => ready.includes(id))) next.phase = 'night';
      publish(ctx, next);
      return;
    }

    if (action === 'kill' && state.phase === 'night' && state.roles[actor] === 'wolf') {
      if (state.out.includes(actor) || !aliveIds(ctx, state).includes(target)) return;
      // Wolves cannot eat each other; keeps a two-wolf night honest.
      if (state.roles[target] === 'wolf') return;
      const kills = { ...state.kills, [actor]: target };
      const next: State = { ...state, kills };
      publish(ctx, nightDone(ctx, next) ? dawn(ctx, next) : next);
      return;
    }

    if (action === 'inspect' && state.phase === 'night' && state.roles[actor] === 'seer') {
      if (state.out.includes(actor) || !aliveIds(ctx, state).includes(target)) return;
      if (state.inspected[actor]) return;
      const inspected = { ...state.inspected, [actor]: target };
      const name = ctx.players.find((p) => p.id === target)?.name ?? '';
      const next: State = {
        ...state,
        inspected,
        seerLog: [...state.seerLog, { name, isWolf: state.roles[target] === 'wolf' }],
      };
      dealPrivate(ctx, next);
      publish(ctx, nightDone(ctx, next) ? dawn(ctx, next) : next);
      return;
    }

    if (action === 'to-vote' && state.phase === 'day' && driver(ctx, actor)) {
      publish(ctx, { ...state, phase: 'voting', votes: {}, killed: undefined });
      return;
    }

    if (action === 'vote' && state.phase === 'voting' && actor !== HOST_ACTOR) {
      if (state.out.includes(actor) || !aliveIds(ctx, state).includes(target)) return;
      const votes = { ...state.votes, [actor]: target };
      const next: State = { ...state, votes };
      const waiting = aliveIds(ctx, next).filter((id) => activeIds(ctx).includes(id));
      publish(
        ctx,
        waiting.every((id) => votes[id] !== undefined) ? resolveVote(ctx, next) : next,
      );
      return;
    }

    if (action === 'force' && driver(ctx, actor)) {
      if (state.phase === 'night') {
        publish(ctx, dawn(ctx, state));
        return;
      }
      if (state.phase === 'voting') {
        publish(ctx, resolveVote(ctx, state));
        return;
      }
    }

    if (action === 'next' && state.phase === 'reveal' && driver(ctx, actor)) {
      publish(ctx, {
        ...state,
        phase: 'night',
        votes: {},
        kills: {},
        inspected: {},
        round: state.round + 1,
        ejected: undefined,
        ejectedRole: undefined,
        killed: undefined,
      });
      return;
    }

    if (action === 'again' && state.phase === 'over' && driver(ctx, actor)) {
      deal(ctx, state);
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) ctx.finish();
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    dealPrivate(ctx, state);
    publish(ctx, state);
  },
};
