import type { Locale, Player } from '@piccolo/shared';

/**
 * Actor id used when the big screen itself sends an action. The host screen has
 * no player seat unless somebody took one, but it still has to be able to drive
 * a game — "next round", "reveal", "skip".
 */
export const HOST_ACTOR = '__host__';

/**
 * Server-side contract for a multi-device ("room") game.
 *
 * A registered game is a *singleton*: one object serves every room on the
 * instance, so it must never keep state on itself. Everything a game remembers
 * goes through `setState` (server-only) or `setPublic` (broadcast), both of
 * which are stored per room.
 */
export interface RoomGameContext {
  players: Player[];
  locale: Locale;
  /** Whether the room was opened with the 18+ decks unlocked. */
  adultUnlocked: boolean;
  /** Replace the public state broadcast to every connection. */
  setPublic: (state: unknown) => void;
  /** Game-owned server state. Never leaves the server. */
  getState: <T>() => T | undefined;
  setState: (state: unknown) => void;
  /** Send a private payload to one player (secret role, hand of cards…). */
  sendPrivate: (playerId: string, payload: unknown) => void;
  /** Fire a transient event (sound, animation, toast) at everyone. */
  emit: (event: string, payload?: unknown) => void;
  /** Mutate a player's running score. */
  addScore: (playerId: string, delta: number) => void;
  /**
   * Run `fn` later with a fresh context. Cancelled automatically when the game
   * stops, so a game never has to track its own handles.
   */
  schedule: (ms: number, fn: (ctx: RoomGameContext) => void) => void;
  /** Drop every pending `schedule` for this room. */
  cancelTimers: () => void;
  /** Move the room to the results phase. */
  finish: () => void;
}

export interface RoomGame {
  id: string;
  minPlayers: number;
  maxPlayers: number | null;
  /** Called once when the host starts the game. */
  start(ctx: RoomGameContext): void;
  /** Called for every `game:action` message. `playerId` may be HOST_ACTOR. */
  action(ctx: RoomGameContext, playerId: string, action: string, payload: unknown): void;
  /** Called when a player joins or drops mid-game. */
  playersChanged?(ctx: RoomGameContext): void;
  /** Called on cleanup so the game can release anything it holds. */
  stop?(ctx: RoomGameContext): void;
}

export const ROOM_GAMES = new Map<string, RoomGame>();

export function registerRoomGame(game: RoomGame): void {
  ROOM_GAMES.set(game.id, game);
}

export function getRoomGame(id: string): RoomGame | undefined {
  return ROOM_GAMES.get(id);
}
