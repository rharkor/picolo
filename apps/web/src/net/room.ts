import { create } from 'zustand';
import {
  PROTOCOL_VERSION,
  decode,
  encode,
  normalizeRoomCode,
  type ClientMessage,
  type Locale,
  type RoomState,
  type Role,
  type ServerErrorCode,
  type ServerMessage,
} from '@piccolo/shared';
import { loadSession, saveSession } from '@/lib/storage';

type Status = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

/** What we replay after a drop, so a reload or a sleeping laptop is survivable. */
type Intent =
  | {
      kind: 'host';
      locale: Locale;
      adultUnlocked: boolean;
      code?: string;
      token?: string;
      /** Set when this screen is also playing. */
      seat?: { name: string; avatar: string; token: string };
    }
  | { kind: 'player'; code: string; name: string; avatar: string; locale: Locale; token?: string };

/**
 * Per tab, not per browser: on a laptop that hosts the room in one tab and
 * joins it in another, a shared key would make the phone tab reclaim the host
 * seat instead of joining as a player.
 */
const INTENT_KEY = 'piccolo.room.intent';
const PING_MS = 20_000;
const BACKOFF_MS = [500, 1_000, 2_000, 4_000, 8_000, 15_000];

interface RoomStore {
  status: Status;
  role: Role | null;
  selfId: string | null;
  /** Set when a host screen also holds a player seat on this connection. */
  seatId: string | null;
  state: RoomState | null;
  error: ServerErrorCode | null;
  /** Latest private payload sent just to this player by the running game. */
  privateState: unknown;
  /** Monotonic counter so components can react to repeated identical events. */
  lastEvent: { event: string; payload?: unknown; seq: number } | null;

  host: (locale: Locale, adultUnlocked: boolean) => void;
  join: (code: string, name: string, avatar: string, locale: Locale) => void;
  /** Host screen only: also play, from this very device. */
  takeSeat: (name: string, avatar: string) => void;
  /** Host screen only: hand the seat back and go back to being a screen. */
  leaveSeat: () => void;
  /**
   * Reconnect to the seat this tab last held. `kind` is what the calling screen
   * is willing to take back — a host screen must never resume into a player
   * seat, nor the reverse. `code` rejects a stale seat when a phone opens a
   * fresh join link for a different room.
   */
  resume: (kind: Intent['kind'], code?: string) => boolean;
  send: (msg: ClientMessage) => void;
  action: (action: string, payload?: unknown) => void;
  leave: () => void;
  clearError: () => void;
}

let socket: WebSocket | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let attempts = 0;
let intent: Intent | null = null;
/** Name and avatar of a seat we asked for, kept until the server confirms it. */
let pendingSeat: { name: string; avatar: string } | null = null;
let seq = 0;

function wsUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws`;
}

function clearTimers(): void {
  if (pingTimer) clearInterval(pingTimer);
  if (retryTimer) clearTimeout(retryTimer);
  pingTimer = null;
  retryTimer = null;
}

function teardown(): void {
  clearTimers();
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.close();
    socket = null;
  }
}

export const useRoom = create<RoomStore>((set, get) => {
  function announce(): void {
    if (!socket || socket.readyState !== WebSocket.OPEN || !intent) return;
    if (intent.kind === 'host') {
      socket.send(
        encode(
          intent.code && intent.token
            ? {
                t: 'host:resume',
                code: intent.code,
                token: intent.token,
                ...(intent.seat ? { seatToken: intent.seat.token } : {}),
              }
            : { t: 'host:create', locale: intent.locale, adultUnlocked: intent.adultUnlocked },
        ),
      );
    } else {
      socket.send(
        encode({
          t: 'player:join',
          code: intent.code,
          name: intent.name,
          avatar: intent.avatar,
          locale: intent.locale,
          ...(intent.token ? { token: intent.token } : {}),
        }),
      );
    }
  }

  function connect(): void {
    teardown();
    set({ status: attempts === 0 ? 'connecting' : 'reconnecting' });
    socket = new WebSocket(wsUrl());

    socket.onopen = () => {
      attempts = 0;
      announce();
      pingTimer = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(encode({ t: 'ping' }));
      }, PING_MS);
    };

    socket.onmessage = (ev) => {
      const msg = decode<ServerMessage>(String(ev.data));
      if (!msg) return;
      switch (msg.t) {
        case 'welcome': {
          if (msg.version !== PROTOCOL_VERSION) {
            set({ error: 'protocol-mismatch', status: 'closed' });
            teardown();
            return;
          }
          // Remember enough to reclaim this seat after a drop.
          if (intent?.kind === 'host') {
            intent = { ...intent, code: msg.state.code, token: msg.token };
          } else if (intent?.kind === 'player') {
            intent = { ...intent, token: msg.token };
          }
          if (intent) saveSession(INTENT_KEY, intent);
          set({
            status: 'open',
            role: msg.role,
            selfId: msg.selfId,
            state: msg.state,
            error: null,
          });
          return;
        }
        case 'room:state':
          set({ state: msg.state, status: 'open' });
          return;
        case 'seat': {
          set({ seatId: msg.playerId });
          if (intent?.kind === 'host') {
            intent =
              msg.playerId && msg.token && pendingSeat
                ? { ...intent, seat: { ...pendingSeat, token: msg.token } }
                : { ...intent, seat: undefined };
            saveSession(INTENT_KEY, intent);
          }
          return;
        }
        case 'game:private':
          set({ privateState: msg.payload });
          return;
        case 'game:event':
          seq += 1;
          set({ lastEvent: { event: msg.event, payload: msg.payload, seq } });
          return;
        case 'error': {
          // A dead room is always terminal. A taken name or a full room only is
          // when we never got in — a seated host screen just shows the error.
          const fatal =
            msg.code === 'room-not-found' ||
            ((msg.code === 'name-taken' || msg.code === 'room-full') && !get().state);
          if (fatal) {
            intent = null;
            saveSession(INTENT_KEY, null);
            teardown();
            set({
              error: msg.code,
              status: 'closed',
              state: null,
              role: null,
              selfId: null,
              seatId: null,
            });
            return;
          }
          set({ error: msg.code });
          return;
        }
        case 'pong':
          return;
      }
    };

    socket.onclose = () => {
      clearTimers();
      if (!intent) {
        set({ status: 'closed' });
        return;
      }
      const delay = BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)] ?? 15_000;
      attempts += 1;
      set({ status: 'reconnecting' });
      retryTimer = setTimeout(connect, delay);
    };

    socket.onerror = () => socket?.close();
  }

  return {
    status: 'idle',
    role: null,
    selfId: null,
    seatId: null,
    state: null,
    error: null,
    privateState: null,
    lastEvent: null,

    host: (locale, adultUnlocked) => {
      attempts = 0;
      pendingSeat = null;
      intent = { kind: 'host', locale, adultUnlocked };
      saveSession(INTENT_KEY, intent);
      set({ error: null, state: null, seatId: null });
      connect();
    },

    takeSeat: (name, avatar) => {
      pendingSeat = { name, avatar };
      set({ error: null });
      get().send({ t: 'host:play', name, avatar });
    },

    leaveSeat: () => {
      pendingSeat = null;
      get().send({ t: 'host:unplay' });
    },

    join: (code, name, avatar, locale) => {
      attempts = 0;
      pendingSeat = null;
      intent = { kind: 'player', code: code.toUpperCase(), name, avatar, locale };
      saveSession(INTENT_KEY, intent);
      set({ error: null, state: null, seatId: null });
      connect();
    },

    resume: (kind, code) => {
      const stored = loadSession<Intent | null>(INTENT_KEY, null);
      if (!stored || stored.kind !== kind) return false;
      pendingSeat = stored.kind === 'host' && stored.seat ? { ...stored.seat } : null;
      // Scanning a QR code for another room beats whatever we sat in before.
      if (code && stored.code !== normalizeRoomCode(code)) return false;
      attempts = 0;
      intent = stored;
      set({ error: null });
      connect();
      return true;
    },

    send: (msg) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(encode(msg));
    },

    action: (action, payload) => get().send({ t: 'game:action', action, payload }),

    leave: () => {
      intent = null;
      pendingSeat = null;
      saveSession(INTENT_KEY, null);
      attempts = 0;
      teardown();
      set({
        status: 'idle',
        role: null,
        selfId: null,
        seatId: null,
        state: null,
        error: null,
        privateState: null,
        lastEvent: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});

/**
 * The player record for this device: the phone's own seat, or the seat a host
 * screen took when it decided to play as well.
 */
export function useSelfPlayer() {
  return useRoom((s) => {
    const id = s.seatId ?? s.selfId;
    return s.state?.players.find((p) => p.id === id) ?? null;
  });
}
