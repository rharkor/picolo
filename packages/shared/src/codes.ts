/** Room codes: 4 chars, no vowels (avoids accidental words), no lookalikes (0/O, 1/I). */
const ALPHABET = 'BCDFGHJKLMNPQRSTVWXYZ23456789';
export const ROOM_CODE_LENGTH = 4;

export function generateRoomCode(random: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return out;
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(input: string): boolean {
  const code = normalizeRoomCode(input);
  return code.length === ROOM_CODE_LENGTH && [...code].every((c) => ALPHABET.includes(c));
}
