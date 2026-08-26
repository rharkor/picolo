import { lazy } from 'react';
import type { RoomView } from './types';

interface RoomModule {
  Host: RoomView;
  Phone: RoomView;
}

/**
 * Multi-device games that are actually implemented. Each module exports a `Host`
 * view for the big screen and a `Phone` view for everyone else; both halves
 * live in one file and one chunk, because they are always needed together.
 */
const MODULES: Record<string, () => Promise<unknown>> = {
  'most-likely-to': () => import('./most-likely-to'),
  'would-you-rather': () => import('./would-you-rather'),
  'who-in-the-room': () => import('./who-in-the-room'),
  punchline: () => import('./punchline'),
  'liar-liar': () => import('./liar-liar'),
  confessions: () => import('./confessions'),
  impostor: () => import('./impostor'),
  'trivia-night': () => import('./trivia-night'),
  wavelength: () => import('./wavelength'),
  'rank-it': () => import('./rank-it'),
  'draw-and-guess': () => import('./draw-and-guess'),
  'werewolf-express': () => import('./werewolf-express'),
  'tap-battle': () => import('./tap-battle'),
  'party-bingo': () => import('./party-bingo'),
  'two-truths-a-lie': () => import('./two-truths-a-lie'),
};

function view(loader: () => Promise<unknown>, key: 'Host' | 'Phone'): RoomView {
  return lazy(async () => {
    const mod = (await loader()) as RoomModule;
    return { default: mod[key] };
  });
}

export const ROOM_VIEWS: Record<string, { host: RoomView; phone: RoomView }> = Object.fromEntries(
  Object.entries(MODULES).map(([id, loader]) => [
    id,
    { host: view(loader, 'Host'), phone: view(loader, 'Phone') },
  ]),
);

export function hasRoomView(id: string): boolean {
  return id in ROOM_VIEWS;
}
