export interface ServerConfig {
  protocolVersion: number;
  locales: string[];
  publicUrl: string;
  roomMaxPlayers: number;
  allowAdultContent: boolean;
  /** An ADMIN_PASSWORD is set, so /admin can be unlocked. */
  adminEnabled: boolean;
}

export async function fetchConfig(): Promise<ServerConfig | null> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return null;
    return (await res.json()) as ServerConfig;
  } catch {
    return null;
  }
}

export interface RoomProbe {
  code: string;
  phase: string;
  gameId: string | null;
  players: number;
  maxPlayers: number;
}

export async function probeRoom(code: string): Promise<RoomProbe | null> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    return (await res.json()) as RoomProbe;
  } catch {
    return null;
  }
}

// --- admin review page -----------------------------------------------------

/** Why the review page could not be unlocked. `offline` covers a dead server. */
export type AdminError = 'bad-password' | 'rate-limited' | 'admin-disabled' | 'offline';

export async function adminLogin(
  password: string,
): Promise<{ token: string } | { error: AdminError }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const { token } = (await res.json()) as { token: string };
      return { token };
    }
    if (res.status === 429) return { error: 'rate-limited' };
    if (res.status === 503) return { error: 'admin-disabled' };
    return { error: 'bad-password' };
  } catch {
    return { error: 'offline' };
  }
}

/** True when a stored token is still good, so a reload skips the password. */
export async function adminSession(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/session', {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminLogout(token: string): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
  } catch {
    /* the token expires on its own anyway */
  }
}

/** The URL friends type on their phones to join. */
export function joinUrl(code: string, publicUrl: string): string {
  const base = publicUrl || window.location.origin;
  return `${base.replace(/\/$/, '')}/join/${code}`;
}
