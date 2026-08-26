import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@piccolo/shared';

interface SettingsState {
  locale: Locale;
  /** 18+ decks unlocked on this device. Never synced anywhere. */
  adultUnlocked: boolean;
  haptics: boolean;
  sound: boolean;
  /** False until the user has seen the language picker once. */
  onboarded: boolean;
  setLocale: (locale: Locale) => void;
  setAdultUnlocked: (value: boolean) => void;
  setHaptics: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setOnboarded: (value: boolean) => void;
  reset: () => void;
}

function initialLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.split('-')[0]?.toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      locale: initialLocale(),
      adultUnlocked: false,
      haptics: true,
      sound: true,
      onboarded: false,
      setLocale: (locale) => set({ locale }),
      setAdultUnlocked: (adultUnlocked) => set({ adultUnlocked }),
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setOnboarded: (onboarded) => set({ onboarded }),
      reset: () =>
        set({
          locale: initialLocale(),
          adultUnlocked: false,
          haptics: true,
          sound: true,
          onboarded: false,
        }),
    }),
    { name: 'piccolo.settings', version: 1 },
  ),
);
