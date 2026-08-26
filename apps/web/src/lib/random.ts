/** Fisher–Yates, returns a new array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

export function pick<T>(input: readonly T[]): T | undefined {
  if (input.length === 0) return undefined;
  return input[Math.floor(Math.random() * input.length)];
}

/** Random integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
