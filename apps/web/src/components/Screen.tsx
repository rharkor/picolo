import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Page wrapper: safe-area padding, max width, and a soft enter animation. */
export function Screen({
  children,
  className,
  wide = false,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  padded?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mx-auto w-full',
        wide ? 'max-w-6xl' : 'max-w-xl',
        padded && 'px-5 pb-28 pt-4',
        className,
      )}
    >
      {children}
    </motion.main>
  );
}
