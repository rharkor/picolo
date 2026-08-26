import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  PROTOCOL_VERSION,
  decode,
  encode,
  isLocale,
  isValidRoomCode,
  type ClientMessage,
  type ServerErrorCode,
  type ServerMessage,
} from '@piccolo/shared';
import { env } from './env.js';
import { rooms, type Connection, type Room } from './rooms.js';

const HEARTBEAT_MS = 30_000;
const RATE_WINDOW_MS = 1_000;
const RATE_MAX_MESSAGES = 30;
const MAX_MESSAGE_BYTES = 64 * 1024;

interface Wire extends Connection {
  socket: WebSocket;
  windowStart: number;
  windowCount: number;
}

function fail(conn: Connection, code: ServerErrorCode, message: string): void {
  conn.send({ t: 'error', code, message });
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, 16);
}

function sanitizeAvatar(raw: unknown): string {
  return typeof raw === 'string' && raw.length > 0 && raw.length <= 8 ? raw : '🙂';
}

export function attachWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_MESSAGE_BYTES });

  const heartbeat = setInterval(() => {
    for (const client of wss.clients) {
      const wire = (client as WebSocket & { _wire?: Wire })._wire;
      if (wire && !wire.alive) {
        client.terminate();
        continue;
      }
      if (wire) wire.alive = false;
      client.ping();
    }
  }, HEARTBEAT_MS);
  heartbeat.unref?.();

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (socket: WebSocket) => {
    const wire: Wire = {
      id: randomUUID(),
      role: 'player',
      playerId: null,
      roomCode: null,
      alive: true,
      socket,
      windowStart: Date.now(),
      windowCount: 0,
      send(msg) {
        if (socket.readyState === socket.OPEN) socket.send(encode(msg));
      },
      close() {
        socket.close();
      },
    };
    (socket as WebSocket & { _wire?: Wire })._wire = wire;

    socket.on('pong', () => {
      wire.alive = true;
    });

    socket.on('message', (raw) => {
      const now = Date.now();
      if (now - wire.windowStart > RATE_WINDOW_MS) {
        wire.windowStart = now;
        wire.windowCount = 0;
      }
      wire.windowCount += 1;
      if (wire.windowCount > RATE_MAX_MESSAGES) {
        fail(wire, 'rate-limited', 'Slow down.');
        return;
      }

      const msg = decode<ClientMessage>(raw.toString());
      if (!msg || typeof msg.t !== 'string') {
        fail(wire, 'bad-request', 'Malformed message.');
        return;
      }
      handle(wire, msg);
    });

    socket.on('close', () => {
      const room = wire.roomCode ? rooms.get(wire.roomCode) : undefined;
      if (!room) return;
      room.detach(wire);
      room.notifyPlayersChanged();
      room.sync();
    });

    socket.on('error', () => socket.terminate());
  });

  return wss;
}

function currentRoom(conn: Connection): Room | undefined {
  return conn.roomCode ? rooms.get(conn.roomCode) : undefined;
}

function handle(conn: Wire, msg: ClientMessage): void {
  switch (msg.t) {
    case 'ping':
      conn.send({ t: 'pong' });
      return;

    case 'host:create': {
      const locale = isLocale(msg.locale) ? msg.locale : 'en';
      const room = rooms.create(locale, Boolean(msg.adultUnlocked));
      conn.role = 'host';
      conn.playerId = null;
      room.attach(conn);
      conn.send({
        t: 'welcome',
        version: PROTOCOL_VERSION,
        role: 'host',
        selfId: conn.id,
        token: room.hostToken,
        state: room.snapshot(),
      });
      return;
    }

    case 'host:resume': {
      const room = rooms.get(msg.code ?? '');
      if (!room || room.hostToken !== msg.token) {
        fail(conn, 'room-not-found', 'That room is gone.');
        return;
      }
      conn.role = 'host';
      conn.playerId = null;
      room.attach(conn);
      // A screen that was also playing gets its seat back with the same token.
      const seat = msg.seatToken ? room.findByToken(msg.seatToken) : undefined;
      if (seat) {
        conn.playerId = seat.id;
        room.setConnected(seat.id, true);
      }
      conn.send({
        t: 'welcome',
        version: PROTOCOL_VERSION,
        role: 'host',
        selfId: conn.id,
        token: room.hostToken,
        state: room.snapshot(),
      });
      // Always report the seat, so a client holding a stale one lets go of it.
      conn.send({ t: 'seat', playerId: seat?.id ?? null, token: seat?.token ?? null });
      room.notifyPlayersChanged();
      room.sync();
      return;
    }

    case 'host:play': {
      const room = currentRoom(conn);
      if (!room) return fail(conn, 'room-not-found', 'Not in a room.');
      if (conn.role !== 'host') return fail(conn, 'bad-request', 'Only a screen can take a seat.');
      if (conn.playerId) return fail(conn, 'bad-request', 'This screen already has a seat.');

      const name = sanitizeName(msg.name);
      if (name.length < 1) return fail(conn, 'bad-request', 'Pick a name.');
      if (room.playerList.length >= env.roomMaxPlayers) {
        return fail(conn, 'room-full', 'This room is full.');
      }
      if (room.hasName(name)) return fail(conn, 'name-taken', 'Someone already took that name.');

      const player = room.addPlayer(name, sanitizeAvatar(msg.avatar));
      conn.playerId = player.id;
      conn.send({ t: 'seat', playerId: player.id, token: player.token });
      room.notifyPlayersChanged();
      room.sync();
      return;
    }

    case 'host:unplay': {
      const room = currentRoom(conn);
      if (!room || !conn.playerId) return;
      if (conn.role !== 'host') return fail(conn, 'bad-request', 'Only a screen can drop a seat.');
      room.removePlayer(conn.playerId);
      conn.playerId = null;
      conn.send({ t: 'seat', playerId: null, token: null });
      room.notifyPlayersChanged();
      room.sync();
      return;
    }

    case 'player:join': {
      if (!isValidRoomCode(msg.code ?? '')) {
        fail(conn, 'room-not-found', 'That code does not look right.');
        return;
      }
      const room = rooms.get(msg.code);
      if (!room) {
        fail(conn, 'room-not-found', 'No room with that code.');
        return;
      }

      // Reconnect path: same token gets the same player back, score intact.
      const existing = msg.token ? room.findByToken(msg.token) : undefined;
      if (existing) {
        conn.role = 'player';
        conn.playerId = existing.id;
        room.attach(conn);
        room.setConnected(existing.id, true);
        conn.send({
          t: 'welcome',
          version: PROTOCOL_VERSION,
          role: 'player',
          selfId: existing.id,
          token: existing.token,
          state: room.snapshot(),
        });
        room.notifyPlayersChanged();
        room.sync();
        return;
      }

      const name = sanitizeName(msg.name);
      if (name.length < 1) {
        fail(conn, 'bad-request', 'Pick a name.');
        return;
      }
      if (room.playerList.length >= env.roomMaxPlayers) {
        fail(conn, 'room-full', 'This room is full.');
        return;
      }
      if (room.hasName(name)) {
        fail(conn, 'name-taken', 'Someone already took that name.');
        return;
      }

      const player = room.addPlayer(name, sanitizeAvatar(msg.avatar));
      conn.role = 'player';
      conn.playerId = player.id;
      room.attach(conn);
      conn.send({
        t: 'welcome',
        version: PROTOCOL_VERSION,
        role: 'player',
        selfId: player.id,
        token: player.token,
        state: room.snapshot(),
      });
      room.notifyPlayersChanged();
      room.sync();
      return;
    }

    case 'room:select-game': {
      const room = currentRoom(conn);
      if (!room) return fail(conn, 'room-not-found', 'Not in a room.');
      if (!room.canControl(conn)) return fail(conn, 'not-host', 'Only the host can do that.');
      room.gameId = typeof msg.gameId === 'string' ? msg.gameId : null;
      room.phase = room.gameId ? 'briefing' : 'lobby';
      room.sync();
      return;
    }

    case 'room:start': {
      const room = currentRoom(conn);
      if (!room) return fail(conn, 'room-not-found', 'Not in a room.');
      if (!room.canControl(conn)) return fail(conn, 'not-host', 'Only the host can start.');
      if (!room.gameId) return fail(conn, 'bad-request', 'No game selected.');
      const err = room.startGame(room.gameId);
      if (err) fail(conn, err, 'Cannot start this game right now.');
      return;
    }

    case 'room:end': {
      const room = currentRoom(conn);
      if (!room) return;
      if (!room.canControl(conn)) return fail(conn, 'not-host', 'Only the host can do that.');
      room.end();
      return;
    }

    case 'room:kick': {
      const room = currentRoom(conn);
      if (!room) return;
      if (!room.canControl(conn)) return fail(conn, 'not-host', 'Only the host can do that.');
      if (typeof msg.playerId !== 'string') return;
      room.removePlayer(msg.playerId);
      // Otherwise the kicked connection keeps acting as that player.
      room.releaseSeat(msg.playerId);
      room.notifyPlayersChanged();
      room.sync();
      return;
    }

    case 'room:set-locale': {
      const room = currentRoom(conn);
      if (!room || !isLocale(msg.locale)) return;
      if (!room.canControl(conn)) return fail(conn, 'not-host', 'Only the host can do that.');
      room.locale = msg.locale;
      room.sync();
      return;
    }

    case 'game:action': {
      const room = currentRoom(conn);
      if (!room || !conn.playerId) return;
      if (typeof msg.action !== 'string') return;
      room.handleAction(conn.playerId, msg.action, msg.payload);
      return;
    }

    default:
      fail(conn, 'bad-request', 'Unknown message.');
  }
}
