import type { ComponentType } from 'react';
import type { GameMeta, Intensity, LocalizedText } from '@piccolo/shared';
import type { PartyPlayer } from '@/store/party';

/** Props every pass-the-phone game receives from the play screen. */
export interface LocalGameProps {
  meta: GameMeta;
  players: PartyPlayer[];
  /** True when the 18+ decks are unlocked on this device. */
  adult: boolean;
  onExit: () => void;
}

export type LocalGame = ComponentType<LocalGameProps>;

/** One prompt in a card-based deck. */
export interface DeckCard {
  id: string;
  text: LocalizedText;
  adult: boolean;
  intensity: Intensity;
  /**
   * Set when the card names a player — the engine substitutes {player} with a
   * random name from the party.
   */
  needsPlayer?: boolean;
}
