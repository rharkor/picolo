export type ClassValue = string | false | null | undefined;

/** Tiny classname joiner — no need for clsx at this size. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
