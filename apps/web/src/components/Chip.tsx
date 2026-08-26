import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Chip({
  children,
  className,
  tone = 'muted',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'muted' | 'accent' | 'warn';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider',
        tone === 'muted' && 'bg-white/5 text-muted',
        tone === 'accent' && 'bg-fuchsia/15 text-fuchsia',
        tone === 'warn' && 'bg-amber/15 text-amber',
        className,
      )}
    >
      {children}
    </span>
  );
}
