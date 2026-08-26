import { timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { GAME_CATALOGUE, LOCALES, PROTOCOL_VERSION, isValidRoomCode } from '@piccolo/shared';
import { registerAdminRoutes } from './admin.js';
import { env } from './env.js';
// Side-effect import: registers every multi-device game.
import './games/index.js';
import { rooms } from './rooms.js';
import { attachWebSocketServer } from './ws.js';

const WEB_ROOT = fileURLToPath(new URL('../../web/dist', import.meta.url));

const app = Fastify({
  logger: env.isProd
    ? { level: 'info' }
    : { level: 'info', transport: { target: 'pino-pretty' } },
  trustProxy: true,
});

// --- optional instance-wide password ---------------------------------------
// A soft gate for a self-hosted box exposed to the internet: without the app
// shell a WebSocket connection is useless, so guarding HTTP is enough here.
if (env.instancePassword) {
  const expected = Buffer.from(`piccolo:${env.instancePassword}`).toString('base64');
  app.addHook('onRequest', async (req, reply) => {
    if (req.url === '/api/health') return;
    const header = req.headers.authorization ?? '';
    const given = header.startsWith('Basic ') ? header.slice(6) : '';
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && timingSafeEqual(a, b);
    if (!ok) {
      reply.header('WWW-Authenticate', 'Basic realm="Piccolo"').code(401).send('Unauthorized');
    }
  });
}

// --- api -------------------------------------------------------------------

app.get('/api/health', async () => ({
  ok: true,
  uptime: Math.round(process.uptime()),
  rooms: rooms.size,
}));

app.get('/api/config', async () => ({
  protocolVersion: PROTOCOL_VERSION,
  locales: LOCALES,
  publicUrl: env.publicUrl,
  roomMaxPlayers: env.roomMaxPlayers,
  allowAdultContent: env.allowAdultContent,
  adminEnabled: env.adminPassword !== '',
}));

/** The full catalogue, so the client never hardcodes it. */
app.get('/api/games', async () => ({ games: GAME_CATALOGUE }));

registerAdminRoutes(app);

/** Cheap existence probe so the join screen can validate a code before connecting. */
app.get<{ Params: { code: string } }>('/api/rooms/:code', async (req, reply) => {
  const { code } = req.params;
  if (!isValidRoomCode(code)) return reply.code(400).send({ error: 'bad-code' });
  const room = rooms.get(code);
  if (!room) return reply.code(404).send({ error: 'room-not-found' });
  return {
    code: room.code,
    phase: room.phase,
    gameId: room.gameId,
    players: room.playerList.length,
    maxPlayers: env.roomMaxPlayers,
  };
});

// --- static web app + SPA fallback ----------------------------------------

if (existsSync(WEB_ROOT)) {
  await app.register(fastifyStatic, { root: WEB_ROOT, index: ['index.html'], wildcard: false });
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/ws')) {
      return reply.code(404).send({ error: 'not-found' });
    }
    // Never hand index.html back for a missing hashed asset: a client holding a
    // stale index.html would get an HTML body where it expected JS, and fail
    // with an opaque MIME error instead of a plain 404 it can recover from.
    if (/^\/assets\//.test(req.url) || /\.[a-z0-9]+$/i.test(new URL(req.url, 'http://x').pathname)) {
      return reply.code(404).send({ error: 'not-found' });
    }
    return reply.type('text/html').sendFile('index.html');
  });

  // The shell must never be cached, or a redeploy leaves phones pointing at
  // asset filenames that no longer exist. Hashed assets are immutable.
  app.addHook('onSend', async (req, reply) => {
    // Only a successful asset response may be marked immutable. Stamping a
    // 404 as immutable would make the browser cache the miss for a year, so a
    // client that asked for a stale filename could never recover, even after
    // a redeploy fixed it.
    if (req.url.startsWith('/assets/') && reply.statusCode < 400) {
      reply.header('cache-control', 'public, max-age=31536000, immutable');
    } else if (reply.statusCode >= 400) {
      reply.header('cache-control', 'no-store');
    } else if (reply.getHeader('content-type')?.toString().includes('text/html')) {
      reply.header('cache-control', 'no-cache');
    }
  });
} else {
  app.log.warn(`web build not found at ${WEB_ROOT} — running API/WS only (dev mode)`);
}

// --- boot ------------------------------------------------------------------

await app.listen({ port: env.port, host: env.host });
attachWebSocketServer(app.server);
rooms.startGarbageCollector();
app.log.info(`piccolo ready — ws on /ws, ${GAME_CATALOGUE.length} games in catalogue`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    app.log.info(`${signal} received, shutting down`);
    rooms.stopGarbageCollector();
    await app.close();
    process.exit(0);
  });
}
