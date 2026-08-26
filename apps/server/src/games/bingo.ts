import type { BingoPublic } from '@piccolo/shared';
import { BINGO_SQUARES } from './decks/bingo.js';
import { localize, shuffle } from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';

/**
 * A private grid per phone, ticked off over the course of a whole party.
 *
 * Marks stay on the phone that made them: the server never needs to know which
 * squares you ticked, only that you are claiming a line. There is nothing to
 * cheat *for* in party bingo, so trusting the claim is the right trade for not
 * shipping sixteen booleans per player per tap.
 */
const CELLS = 16;

interface State {
  grids: Record<string, string[]>;
  lines: Record<string, { lines: number; full: boolean }>;
  claims: { id: string; lines: number; at: number }[];
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

function publish(ctx: RoomGameContext, state: State): void {
  const pub: BingoPublic = {
    kind: 'bingo',
    lines: ctx.players.map((player) => ({
      id: player.id,
      lines: state.lines[player.id]?.lines ?? 0,
      full: state.lines[player.id]?.full ?? false,
    })),
    claims: state.claims.slice(-12),
  };
  ctx.setState(state);
  ctx.setPublic(pub);
}

function gridFor(ctx: RoomGameContext): string[] {
  const pool = shuffle(BINGO_SQUARES.filter((card) => ctx.adultUnlocked || !card.adult));
  return Array.from({ length: CELLS }, (_, i) =>
    localize((pool[i % Math.max(pool.length, 1)] ?? pool[0])?.text ?? { en: '', fr: '' }, ctx.locale),
  );
}

function deal(ctx: RoomGameContext): void {
  const grids: Record<string, string[]> = {};
  for (const player of ctx.players) grids[player.id] = gridFor(ctx);
  const state: State = { grids, lines: {}, claims: [] };
  for (const player of ctx.players) {
    ctx.sendPrivate(player.id, { grid: grids[player.id] ?? [] });
  }
  publish(ctx, state);
}

export const bingo: RoomGame = {
  id: 'party-bingo',
  minPlayers: 2,
  maxPlayers: 16,

  start: (ctx) => deal(ctx),

  action: (ctx, actor, action, payload) => {
    const state = ctx.getState<State>();
    if (!state) return;

    if (action === 'claim' && actor !== HOST_ACTOR) {
      const body = payload as { lines?: unknown; full?: unknown } | undefined;
      const lines = typeof body?.lines === 'number' ? Math.max(0, Math.min(10, body.lines)) : 0;
      const full = body?.full === true;
      const before = state.lines[actor]?.lines ?? 0;
      if (lines <= before) return;
      ctx.addScore(actor, lines - before);
      const next: State = {
        ...state,
        lines: { ...state.lines, [actor]: { lines, full } },
        claims: [...state.claims, { id: actor, lines, at: Date.now() }],
      };
      ctx.emit('bingo', { id: actor, lines, full });
      publish(ctx, next);
      return;
    }

    if (action === 'redeal' && driver(ctx, actor)) {
      deal(ctx);
      return;
    }

    if (action === 'finish' && driver(ctx, actor)) ctx.finish();
  },

  playersChanged: (ctx) => {
    const state = ctx.getState<State>();
    if (!state) return;
    const grids = { ...state.grids };
    // A phone that joined late, or reloaded, needs a grid of its own.
    for (const player of ctx.players) {
      grids[player.id] ??= gridFor(ctx);
      ctx.sendPrivate(player.id, { grid: grids[player.id] ?? [] });
    }
    publish(ctx, { ...state, grids });
  },
};
