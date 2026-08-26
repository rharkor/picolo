import { lazy } from 'react';
import type { LocalGame } from './types';

/**
 * Pass-the-phone games that are actually implemented. The catalogue in
 * @piccolo/shared lists everything planned; a game becomes playable the moment
 * it appears here. Add one entry per game — code-split so the bundle stays
 * small no matter how long the list gets.
 */
export const LOCAL_GAMES: Record<string, LocalGame> = {
  'la-tabuses': lazy(() => import('./la-tabuses/index')) as unknown as LocalGame,
  'never-have-i-ever': lazy(() => import('./never-have-i-ever/index')) as unknown as LocalGame,
  'truth-or-dare': lazy(() => import('./truth-or-dare/index')) as unknown as LocalGame,
};

export function hasLocalGame(id: string): boolean {
  return id in LOCAL_GAMES;
}
