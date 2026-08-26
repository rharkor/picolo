import { useSettings } from '@/store/settings';

type Pattern = 'tap' | 'select' | 'success' | 'fail' | 'heavy';

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  select: 14,
  success: [12, 40, 26],
  fail: [40, 60, 40],
  heavy: 45,
};

/** Fires a vibration when the phone supports it and the user left it enabled. */
export function haptic(pattern: Pattern = 'tap'): void {
  if (!useSettings.getState().haptics) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* Safari throws on some versions — a missing buzz is not worth crashing over. */
  }
}
