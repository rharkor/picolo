function read<T>(store: Storage, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(store: Storage, key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** localStorage that never throws (private mode, disabled storage, quota). */
export function load<T>(key: string, fallback: T): T {
  return read(localStorage, key, fallback);
}

export function save(key: string, value: unknown): void {
  write(localStorage, key, value);
}

/**
 * Same, on sessionStorage: scoped to one tab.
 *
 * Anything tied to a live connection belongs here — two tabs of the same
 * browser must be able to hold different seats in the same room (a host screen
 * and a phone, say), which localStorage cannot express.
 */
export function loadSession<T>(key: string, fallback: T): T {
  return read(sessionStorage, key, fallback);
}

export function saveSession(key: string, value: unknown): void {
  write(sessionStorage, key, value);
}
