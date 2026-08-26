import type { Locale, Player } from '@piccolo/shared';

/**
 * Server-side contract for a multi-device ("room") game.
 *
 * Games are added one at a time: drop a module in this folder that exports a
 * RoomGame and register it in ROOM_GAMES below. Pass-the-phone games need
 * nothing here — they run entirely in the browser.
 */
export interface RoomGameContext {
  players: Player[];
  locale: Locale;
  /** Replace the public state broadcast to every connection. */
  setPublic: (state: unknown) => void;
  /** Send a private payload to one player (secret role, hand of cards…). */
  sendPrivate: (playerId: string, payload: unknown) => void;
  /** Fire a transient event (sound, animation, toast) at everyone. */
  emit: (event: string, payload?: unknown) => void;
  /** Mutate a player's running score. */
  addScore: (playerId: string, delta: number) => void;
  /** Move the room to the results phase. */
  finish: () => void;
}

export interface RoomGame {
  id: string;
  minPlayers: number;
  maxPlayers: number | null;
  /** Called once when the host starts the game. */
  start(ctx: RoomGameContext): void;
  /** Called for every `game:action` message from a connection. */
  action(ctx: RoomGameContext, playerId: string, action: string, payload: unknown): void;
  /** Called when a player joins or drops mid-game. */
  playersChanged?(ctx: RoomGameContext): void;
  /** Called on cleanup so the game can clear timers. */
  stop?(ctx: RoomGameContext): void;
}

export const ROOM_GAMES = new Map<string, RoomGame>();

export function registerRoomGame(game: RoomGame): void {
  ROOM_GAMES.set(game.id, game);
}

export function getRoomGame(id: string): RoomGame | undefined {
  return ROOM_GAMES.get(id);
}
