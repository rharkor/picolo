import type { Locale } from '@piccolo/shared';
import { shuffle } from '@/lib/random';
import type { PartyPlayer } from '@/store/party';

/** Used when a card names someone but the party list cannot supply a name. */
export const NEIGHBOUR: Record<Locale, string> = {
  en: 'the player on your left',
  fr: 'le joueur à ta gauche',
};

const SOMEONE: Record<Locale, string> = {
  en: 'someone else',
  fr: 'quelqu’un d’autre',
};

/** Rotates through the party for any index, negative included. */
export function at(players: readonly PartyPlayer[], index: number): PartyPlayer | undefined {
  if (players.length === 0) return undefined;
  return players[((index % players.length) + players.length) % players.length];
}

export function label(player: PartyPlayer | undefined, fallback: string): string {
  return player ? `${player.avatar} ${player.name}` : fallback;
}

/**
 * Fills `{player}`, `{player2}` and `{player3}` with distinct party members,
 * never handing a card back to whoever is already on the spot.
 */
export function fillNames(
  text: string,
  players: readonly PartyPlayer[],
  locale: Locale,
  exclude?: PartyPlayer | undefined,
): string {
  if (!text.includes('{player')) return text;
  const pool = shuffle(players.filter((p) => p.id !== exclude?.id));
  const fallback = [NEIGHBOUR[locale] ?? NEIGHBOUR.en, SOMEONE[locale] ?? SOMEONE.en];
  let out = text;
  for (const [slot, token] of (['{player}', '{player2}', '{player3}'] as const).entries()) {
    if (!out.includes(token)) continue;
    const name = pool[slot]?.name ?? fallback[slot % fallback.length] ?? '';
    out = out.replaceAll(token, name);
  }
  return out;
}
