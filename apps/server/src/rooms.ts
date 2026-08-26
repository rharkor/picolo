import { randomUUID } from 'node:crypto';
import {
  DEFAULT_LOCALE,
  generateRoomCode,
  normalizeRoomCode,
  type Locale,
  type Player,
  type RoomPhase,
  type RoomState,
  type Role,
  type ServerErrorCode,
  type ServerMessage,
} from '@piccolo/shared';
import { env } from './env.js';
import { getRoomGame, type RoomGame, type RoomGameContext } from './games/registry.js';

export interface Connection {
  id: string;
  role: Role;
  /** Set for role === 'player'. */
  playerId: string | null;
  roomCode: string | null;
  alive: boolean;
  send(msg: ServerMessage): void;
  close(): void;
}

interface PlayerRecord extends Player {
  /** Reconnect secret, never broadcast. */
  token: string;
}

const MAX_NAME_LENGTH = 16;

export class Room {
  readonly code: string;
  readonly createdAt = Date.now();
  /** Lets the big screen reclaim the room after a reload. Never broadcast. */
  readonly hostToken = randomUUID();
  phase: RoomPhase = 'lobby';
  gameId: string | null = null;
  locale: Locale = DEFAULT_LOCALE;
  adultUnlocked = false;
  publicState: unknown = null;
  lastActivity = Date.now();

  private readonly players = new Map<string, PlayerRecord>();
  private readonly connections = new Set<Connection>();
  private game: RoomGame | null = null;

  constructor(code: string) {
    this.code = code;
  }

  // ---------------------------------------------------------------- players

  get playerList(): Player[] {
    return [...this.players.values()].map(({ token: _token, ...p }) => p);
  }

  get connectionCount(): number {
    return this.connections.size;
  }

  get isEmpty(): boolean {
    return this.connections.size === 0;
  }

  findByToken(token: string): PlayerRecord | undefined {
    return [...this.players.values()].find((p) => p.token === token);
  }

  hasName(name: string): boolean {
    const wanted = name.trim().toLowerCase();
    return [...this.players.values()].some((p) => p.name.toLowerCase() === wanted);
  }

  addPlayer(name: string, avatar: string): PlayerRecord {
    const isFirst = this.players.size === 0;
    const player: PlayerRecord = {
      id: randomUUID(),
      name: name.trim().slice(0, MAX_NAME_LENGTH),
      avatar,
      connected: true,
      score: 0,
      isHost: isFirst,
      token: randomUUID(),
    };
    this.players.set(player.id, player);
    return player;
  }

  getPlayer(id: string | null): PlayerRecord | undefined {
    return id ? this.players.get(id) : undefined;
  }

  removePlayer(id: string): void {
    const wasHost = this.players.get(id)?.isHost ?? false;
    this.players.delete(id);
    if (wasHost) {
      const next = this.players.values().next();
      if (!next.done) next.value.isHost = true;
    }
  }

  /**
   * Detach a player id from whatever connection was driving it, and tell that
   * connection its seat is gone. Used when a player is kicked — a host screen
   * that was also playing keeps its screen, it just stops being a player.
   */
  releaseSeat(playerId: string): void {
    for (const conn of this.connections) {
      if (conn.playerId !== playerId) continue;
      conn.playerId = null;
      conn.send({ t: 'seat', playerId: null, token: null });
    }
  }

  setConnected(playerId: string, connected: boolean): void {
    const p = this.players.get(playerId);
    if (p) p.connected = connected;
  }

  /** A connection allowed to drive the room: the big screen, or the lead phone. */
  canControl(conn: Connection): boolean {
    if (conn.role === 'host') return true;
    return this.getPlayer(conn.playerId)?.isHost ?? false;
  }

  // ------------------------------------------------------------ connections

  attach(conn: Connection): void {
    this.connections.add(conn);
    conn.roomCode = this.code;
  }

  detach(conn: Connection): void {
    this.connections.delete(conn);
    if (conn.playerId) this.setConnected(conn.playerId, false);
  }

  broadcast(msg: ServerMessage): void {
    for (const conn of this.connections) conn.send(msg);
  }

  sendTo(playerId: string, msg: ServerMessage): void {
    for (const conn of this.connections) {
      if (conn.playerId === playerId) conn.send(msg);
    }
  }

  // ------------------------------------------------------------------ state

  snapshot(): RoomState {
    return {
      code: this.code,
      phase: this.phase,
      gameId: this.gameId,
      locale: this.locale,
      players: this.playerList,
      maxPlayers: env.roomMaxPlayers,
      adultUnlocked: this.adultUnlocked,
      public: this.publicState,
      createdAt: this.createdAt,
    };
  }

  sync(): void {
    this.lastActivity = Date.now();
    this.broadcast({ t: 'room:state', state: this.snapshot() });
  }

  // ------------------------------------------------------------------- game

  private context(): RoomGameContext {
    return {
      players: this.playerList,
      locale: this.locale,
      setPublic: (state) => {
        this.publicState = state;
        this.sync();
      },
      sendPrivate: (playerId, payload) => this.sendTo(playerId, { t: 'game:private', payload }),
      emit: (event, payload) => this.broadcast({ t: 'game:event', event, payload }),
      addScore: (playerId, delta) => {
        const p = this.players.get(playerId);
        if (p) p.score += delta;
      },
      finish: () => {
        this.phase = 'results';
        this.sync();
      },
    };
  }

  startGame(gameId: string): ServerErrorCode | null {
    const game = getRoomGame(gameId);
    if (!game) return 'game-unknown';
    if (this.players.size < game.minPlayers) return 'bad-request';
    this.stopGame();
    this.game = game;
    this.gameId = gameId;
    this.phase = 'playing';
    this.publicState = null;
    game.start(this.context());
    this.sync();
    return null;
  }

  handleAction(playerId: string, action: string, payload: unknown): void {
    if (!this.game) return;
    this.lastActivity = Date.now();
    this.game.action(this.context(), playerId, action, payload);
  }

  notifyPlayersChanged(): void {
    this.game?.playersChanged?.(this.context());
  }

  stopGame(): void {
    if (this.game) {
      this.game.stop?.(this.context());
      this.game = null;
    }
  }

  end(): void {
    this.stopGame();
    this.phase = 'lobby';
    this.publicState = null;
    for (const p of this.players.values()) p.score = 0;
    this.sync();
  }
}

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private gcTimer: NodeJS.Timeout | null = null;

  create(locale: Locale, adultUnlocked: boolean): Room {
    let code = generateRoomCode();
    let guard = 0;
    while (this.rooms.has(code) && guard < 50) {
      code = generateRoomCode();
      guard += 1;
    }
    const room = new Room(code);
    room.locale = locale;
    room.adultUnlocked = adultUnlocked && env.allowAdultContent;
    this.rooms.set(code, room);
    return room;
  }

  get(code: string): Room | undefined {
    return this.rooms.get(normalizeRoomCode(code));
  }

  destroy(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;
    room.stopGame();
    this.rooms.delete(code);
  }

  get size(): number {
    return this.rooms.size;
  }

  /** Drops rooms that are idle or have had no connection for a grace period. */
  startGarbageCollector(intervalMs = 60_000): void {
    if (this.gcTimer) return;
    this.gcTimer = setInterval(() => {
      const now = Date.now();
      for (const [code, room] of this.rooms) {
        const idle = now - room.lastActivity;
        const emptyTooLong = room.isEmpty && idle > 5 * 60_000;
        if (emptyTooLong || idle > env.roomIdleTimeoutMs) this.destroy(code);
      }
    }, intervalMs);
    this.gcTimer.unref?.();
  }

  stopGarbageCollector(): void {
    if (this.gcTimer) clearInterval(this.gcTimer);
    this.gcTimer = null;
  }
}

export const rooms = new RoomManager();
