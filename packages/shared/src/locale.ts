export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Any piece of user-facing content that exists in both languages. */
export type LocalizedText = Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Picks the best matching locale from an Accept-Language style string. */
export function negotiateLocale(header: string | undefined | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase() ?? '';
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function t(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text[DEFAULT_LOCALE];
}
