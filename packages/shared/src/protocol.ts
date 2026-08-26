import type { Locale } from './locale.js';

/** Wire protocol version — bump on breaking changes, the client refuses a mismatch. */
export const PROTOCOL_VERSION = 1;

export type Role = 'host' | 'player';

export interface Player {
  id: string;
  name: string;
  /** Emoji avatar chosen at join time. */
  avatar: string;
  connected: boolean;
  /** Cumulative score across the session, games decide what it means. */
  score: number;
  isHost: boolean;
}

export type RoomPhase = 'lobby' | 'briefing' | 'playing' | 'results';

export interface RoomState {
  code: string;
  phase: RoomPhase;
  gameId: string | null;
  locale: Locale;
  players: Player[];
  maxPlayers: number;
  adultUnlocked: boolean;
  /** Opaque, game-owned public state broadcast to everyone. */
  public: unknown;
  createdAt: number;
}

// --------------------------------------------------------------- client → server

export type ClientMessage =
  | { t: 'host:create'; locale: Locale; adultUnlocked: boolean }
  /**
   * Reclaim an existing host screen after a reload or a laptop waking up.
   * `seatToken` also takes back the player seat that screen was holding.
   */
  | { t: 'host:resume'; code: string; token: string; seatToken?: string }
  /** The host screen wants to play as well, on this same connection. */
  | { t: 'host:play'; name: string; avatar: string }
  /** …and changed its mind: back to being only a screen. */
  | { t: 'host:unplay' }
  | { t: 'player:join'; code: string; name: string; avatar: string; locale: Locale; token?: string }
  | { t: 'room:select-game'; gameId: string | null }
  | { t: 'room:start' }
  | { t: 'room:end' }
  | { t: 'room:kick'; playerId: string }
  | { t: 'room:set-locale'; locale: Locale }
  | { t: 'game:action'; action: string; payload?: unknown }
  | { t: 'ping' };

// --------------------------------------------------------------- server → client

export type ServerErrorCode =
  | 'room-not-found'
  | 'room-full'
  | 'name-taken'
  | 'bad-request'
  | 'not-host'
  | 'game-unknown'
  | 'protocol-mismatch'
  | 'rate-limited';

export type ServerMessage =
  | { t: 'welcome'; version: number; role: Role; selfId: string; token: string; state: RoomState }
  | { t: 'room:state'; state: RoomState }
  /**
   * The player seat this connection owns, if any. Sent to a host screen that
   * takes one or gives it up; `playerId: null` means "screen only".
   */
  | { t: 'seat'; playerId: string | null; token: string | null }
  /** Private per-player payload (your secret role, your cards…). */
  | { t: 'game:private'; payload: unknown }
  /** Fire-and-forget event for animations, sounds, toasts. */
  | { t: 'game:event'; event: string; payload?: unknown }
  | { t: 'error'; code: ServerErrorCode; message: string }
  | { t: 'pong' };

export function encode(msg: ClientMessage | ServerMessage): string {
  return JSON.stringify(msg);
}

export function decode<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
