import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shuffle } from '@/lib/random';

export interface PartyPlayer {
  id: string;
  name: string;
  avatar: string;
}

export const AVATARS = [
  '🍻', '🦊', '🐙', '🦖', '👽', '🐸', '🦩', '🐝',
  '🍑', '🌵', '🎃', '🦄', '🐧', '🦉', '🍕', '👻',
] as const;

interface PartyState {
  players: PartyPlayer[];
  add: (name: string) => boolean;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  cycleAvatar: (id: string) => void;
  shuffleOrder: () => void;
  clear: () => void;
}

function newId(): string {
  return crypto.randomUUID();
}

export const useParty = create<PartyState>()(
  persist(
    (set, get) => ({
      players: [],
      add: (rawName) => {
        const name = rawName.replace(/\s+/g, ' ').trim().slice(0, 16);
        if (!name) return false;
        const taken = get().players.some((p) => p.name.toLowerCase() === name.toLowerCase());
        if (taken) return false;
        const used = new Set(get().players.map((p) => p.avatar));
        const avatar = AVATARS.find((a) => !used.has(a)) ?? AVATARS[0];
        set({ players: [...get().players, { id: newId(), name, avatar }] });
        return true;
      },
      remove: (id) => set({ players: get().players.filter((p) => p.id !== id) }),
      rename: (id, name) =>
        set({
          players: get().players.map((p) => (p.id === id ? { ...p, name: name.slice(0, 16) } : p)),
        }),
      cycleAvatar: (id) =>
        set({
          players: get().players.map((p) => {
            if (p.id !== id) return p;
            const i = AVATARS.indexOf(p.avatar as (typeof AVATARS)[number]);
            const next = AVATARS[(i + 1) % AVATARS.length] ?? AVATARS[0];
            return { ...p, avatar: next };
          }),
        }),
      shuffleOrder: () => set({ players: shuffle(get().players) }),
      clear: () => set({ players: [] }),
    }),
    { name: 'piccolo.party', version: 1 },
  ),
);
