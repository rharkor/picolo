import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, isLocale, type Locale, type LocalizedText } from '@piccolo/shared';
import { useSettings } from '@/store/settings';
import { en, type Dictionary } from './en';
import { fr } from './fr';

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

/** Every dot-path that resolves to a string in the dictionary. */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;
export type Vars = Record<string, string | number>;

function resolve(dict: unknown, path: string): string | undefined {
  let node: unknown = dict;
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Typed lookup — a bad key is a compile error. */
  t: (key: TranslationKey, vars?: Vars) => string;
  /** Untyped lookup for runtime-built keys (game ids). Falls back to the key. */
  tRaw: (key: string, vars?: Vars) => string;
  /** Picks the right side of a bilingual content string. */
  loc: (text: LocalizedText) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSettings((s) => s.locale);
  const setLocale = useSettings((s) => s.setLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const tRaw = useCallback(
    (key: string, vars?: Vars) => {
      const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
      const hit = resolve(dict, key) ?? resolve(DICTIONARIES[DEFAULT_LOCALE], key);
      if (hit === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      return interpolate(hit, vars);
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => tRaw(key, vars),
      tRaw,
      loc: (text) => text[locale] ?? text[DEFAULT_LOCALE],
    }),
    [locale, setLocale, tRaw],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Best-effort locale from the browser, used the very first time someone lands. */
export function detectLocale(): Locale {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.split('-')[0]?.toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
