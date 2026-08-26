function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  port: int(process.env.PORT, 8080),
  host: process.env.HOST ?? '0.0.0.0',
  publicUrl: process.env.PUBLIC_URL ?? '',
  roomMaxPlayers: int(process.env.ROOM_MAX_PLAYERS, 16),
  roomIdleTimeoutMs: int(process.env.ROOM_IDLE_TIMEOUT_MINUTES, 90) * 60_000,
  allowAdultContent: bool(process.env.ALLOW_ADULT_CONTENT, true),
  instancePassword: process.env.INSTANCE_PASSWORD ?? '',
  /** Unlocks the /admin content review page. Empty = no admin page at all. */
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  isProd: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
