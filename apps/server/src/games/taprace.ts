import type { TapRacePublic } from '@piccolo/shared';
import { activeIds } from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * Everyone taps at once for five seconds.
 *
 * Phones report a running total a few times a second rather than one message
 * per tap, and those updates go out as events so the room is not rebroadcasting
 * its whole state forty times a second. The authoritative counts are published
 * once, at the end.
 */
const WINDOW_MS = 5_000;

interface State {
  round: number;
  phase: 'ready' | 'running' | 'reveal';
  counts: Record<string, number>;
  deadline: number;
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function publish(ctx: RoomGameContext, state: State): void {
  const rows = ctx.players.map((player) => ({
    id: player.id,
    count: state.counts[player.id] ?? 0,
  }));
  const pub: TapRacePublic = {
    kind: 'tap-race',
    round: state.round,
    phase: state.phase,
    taps: rows,
  };
  if (state.phase === 'running') pub.endsIn = Math.max(0, state.deadline - Date.now());
  if (state.phase === 'reveal') {
    const ranked = [...rows].sort((a, b) => b.count - a.count);
    pub.winner = ranked[0]?.id;
    pub.loser = ranked[ranked.length - 1]?.id;
  }
  ctx.setState(state);
  ctx.setPublic(pub);
}

export const tapRace: RoomGame = {
  id: 'tap-battle',
  minPlayers: 2,
  maxPlayers: 8,

  start: (ctx) => publish(ctx, { round: 1, phase: 'ready', counts: {}, deadline: 0 }),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'go' && state.phase !== 'running' && driver(ctx, actor)) {
      const next: State = {
        round: state.phase === 'reveal' ? state.round + 1 : state.round,
        phase: 'running',
        counts: {},
        deadline: Date.now() + WINDOW_MS,
      };
      ctx.emit('go', { endsIn: WINDOW_MS });
      publish(ctx, next);
      ctx.schedule(WINDOW_MS + 400, (fresh) => {
        const current = fresh.getState<State>();
        if (!current || current.phase !== 'running') return;
        const ranked = Object.entries(current.counts).sort((a, b) => b[1] - a[1]);
        const best = ranked[0];
        if (best) fresh.addScore(best[0], 1);
        publish(fresh, { ...current, phase: 'reveal' });
      });
      return;
    }

    if (action === 'taps' && state.phase === 'running' && actor !== HOST_ACTOR) {
      const count = typeof payload === 'number' ? Math.max(0, Math.round(payload)) : 0;
      // Monotonic: a late packet must never lower somebody's score.
      const current = state.counts[actor] ?? 0;
      if (count <= current) return;
      ctx.setState({ ...state, counts: { ...state.counts, [actor]: count } });
      ctx.emit('taps', { id: actor, count });
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) ctx.finish();
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    const live = activeIds(ctx);
    publish(ctx, {
      ...state,
      counts: Object.fromEntries(Object.entries(state.counts).filter(([id]) => live.includes(id))),
    });
  },

  stop: (ctx) => ctx.cancelTimers(),
};
