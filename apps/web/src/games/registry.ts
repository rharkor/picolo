import { lazy } from 'react';
import type { LocalGame } from './types';

/**
 * Pass-the-phone games that are actually implemented. The catalogue in
 * @piccolo/shared lists everything planned; a game becomes playable the moment
 * it appears here. One entry per game — code-split so the bundle stays small no
 * matter how long the list gets.
 */
const load = (loader: () => Promise<unknown>): LocalGame =>
  lazy(loader as () => Promise<{ default: LocalGame }>);

export const LOCAL_GAMES: Record<string, LocalGame> = {
  // cards
  'piccolo-classic': load(() => import('./piccolo-classic/index')),
  'never-have-i-ever': load(() => import('./never-have-i-ever/index')),
  'truth-or-dare': load(() => import('./truth-or-dare/index')),
  'sip-or-spill': load(() => import('./sip-or-spill/index')),
  'la-tabuses': load(() => import('./la-tabuses/index')),

  // social
  'most-likely-to': load(() => import('./most-likely-to/index')),
  'would-you-rather': load(() => import('./would-you-rather/index')),
  paranoia: load(() => import('./paranoia/index')),
  'two-truths-a-lie': load(() => import('./two-truths-a-lie/index')),
  'mr-white': load(() => import('./mr-white/index')),

  // party
  'shot-roulette': load(() => import('./shot-roulette/index')),
  'kings-cup': load(() => import('./kings-cup/index')),
  'bus-ride': load(() => import('./bus-ride/index')),
  categories: load(() => import('./categories/index')),
  waterfall: load(() => import('./waterfall/index')),
  'cheers-governor': load(() => import('./cheers-governor/index')),
  fingers: load(() => import('./fingers/index')),
  medusa: load(() => import('./medusa/index')),
  'party-bingo': load(() => import('./party-bingo/index')),

  // spicy
  'hot-seat': load(() => import('./hot-seat/index')),
  'truth-or-dare-spicy': load(() => import('./truth-or-dare-spicy/index')),
  'dirty-charades': load(() => import('./dirty-charades/index')),

  // skill
  'reaction-duel': load(() => import('./reaction-duel/index')),
  'tap-battle': load(() => import('./tap-battle/index')),
  'memory-chain': load(() => import('./memory-chain/index')),
  'bomb-party': load(() => import('./bomb-party/index')),
  'hot-potato': load(() => import('./hot-potato/index')),
  'steady-hand': load(() => import('./steady-hand/index')),
  'quick-math': load(() => import('./quick-math/index')),
};

export function hasLocalGame(id: string): boolean {
  return id in LOCAL_GAMES;
}
