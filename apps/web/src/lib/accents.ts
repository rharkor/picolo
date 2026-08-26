import type { GameMeta } from '@piccolo/shared';

type Accent = GameMeta['accent'];

/** Per-accent gradient + glow, kept in one place so cards stay consistent. */
export const ACCENT: Record<Accent, { grad: string; text: string; glow: string; dot: string }> = {
  violet: {
    grad: 'from-violet/30 to-indigo/10',
    text: 'text-violet',
    glow: 'shadow-[0_0_50px_-12px_var(--color-violet)]',
    dot: 'bg-violet',
  },
  fuchsia: {
    grad: 'from-fuchsia/30 to-rose/10',
    text: 'text-fuchsia',
    glow: 'shadow-[0_0_50px_-12px_var(--color-fuchsia)]',
    dot: 'bg-fuchsia',
  },
  amber: {
    grad: 'from-amber/30 to-orange/10',
    text: 'text-amber',
    glow: 'shadow-[0_0_50px_-12px_var(--color-amber)]',
    dot: 'bg-amber',
  },
  lime: {
    grad: 'from-lime/30 to-cyan/10',
    text: 'text-lime',
    glow: 'shadow-[0_0_50px_-12px_var(--color-lime)]',
    dot: 'bg-lime',
  },
  cyan: {
    grad: 'from-cyan/30 to-indigo/10',
    text: 'text-cyan',
    glow: 'shadow-[0_0_50px_-12px_var(--color-cyan)]',
    dot: 'bg-cyan',
  },
  rose: {
    grad: 'from-rose/30 to-fuchsia/10',
    text: 'text-rose',
    glow: 'shadow-[0_0_50px_-12px_var(--color-rose)]',
    dot: 'bg-rose',
  },
  orange: {
    grad: 'from-orange/30 to-amber/10',
    text: 'text-orange',
    glow: 'shadow-[0_0_50px_-12px_var(--color-orange)]',
    dot: 'bg-orange',
  },
  indigo: {
    grad: 'from-indigo/30 to-violet/10',
    text: 'text-indigo',
    glow: 'shadow-[0_0_50px_-12px_var(--color-indigo)]',
    dot: 'bg-indigo',
  },
};
