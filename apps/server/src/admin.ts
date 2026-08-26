import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { env } from './env.js';

/**
 * Password gate for the /admin content review page.
 *
 * Sessions live in memory: a restart logs the reviewer out, which is the right
 * trade for a self-hosted box with no database. Note that this guards the
 * review *page*, not the card text itself — pass-the-phone decks ship inside
 * the browser bundle so games work offline, so anyone can read them from
 * devtools regardless. The gate is here to keep the page out of guests' way.
 */
const SESSION_TTL_MS = 8 * 60 * 60_000;
const ATTEMPT_WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;

/** token -> expiry timestamp */
const sessions = new Map<string, number>();
/** client ip -> failed attempts inside the current window */
const attempts = new Map<string, { count: number; windowStart: number }>();

function prune(now: number): void {
  for (const [token, expires] of sessions) if (expires <= now) sessions.delete(token);
  for (const [ip, record] of attempts) {
    if (now - record.windowStart > ATTEMPT_WINDOW_MS) attempts.delete(ip);
  }
}

/** Hash both sides first so the compare is timing-safe even on unequal lengths. */
function sameSecret(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function bearer(req: FastifyRequest): string {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function isValidSession(token: string, now: number): boolean {
  if (!token) return false;
  const expires = sessions.get(token);
  if (expires === undefined) return false;
  if (expires <= now) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function registerAdminRoutes(app: FastifyInstance): void {
  app.post<{ Body: { password?: unknown } }>('/api/admin/login', async (req, reply) => {
    const now = Date.now();
    prune(now);

    if (!env.adminPassword) return reply.code(503).send({ error: 'admin-disabled' });

    const ip = req.ip;
    const record = attempts.get(ip);
    if (record && record.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((ATTEMPT_WINDOW_MS - (now - record.windowStart)) / 1000);
      return reply.code(429).header('retry-after', retryAfter).send({ error: 'rate-limited' });
    }

    const given = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!given || !sameSecret(given, env.adminPassword)) {
      attempts.set(ip, {
        count: (record?.count ?? 0) + 1,
        windowStart: record?.windowStart ?? now,
      });
      req.log.warn({ ip }, 'admin login failed');
      return reply.code(401).send({ error: 'bad-password' });
    }

    attempts.delete(ip);
    const token = randomBytes(32).toString('base64url');
    sessions.set(token, now + SESSION_TTL_MS);
    req.log.info({ ip }, 'admin login');
    return { token, expiresIn: Math.round(SESSION_TTL_MS / 1000) };
  });

  /** Lets a reloaded page reuse a stored token instead of asking again. */
  app.get('/api/admin/session', async (req, reply) => {
    const now = Date.now();
    prune(now);
    if (!env.adminPassword) return reply.code(503).send({ error: 'admin-disabled' });
    if (!isValidSession(bearer(req), now)) return reply.code(401).send({ error: 'unauthorized' });
    return { ok: true };
  });

  app.post('/api/admin/logout', async (req) => {
    sessions.delete(bearer(req));
    return { ok: true };
  });
}
