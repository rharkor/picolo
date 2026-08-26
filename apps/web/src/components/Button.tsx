import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';

type Variant = 'primary' | 'surface' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-violet via-fuchsia to-rose text-white shadow-[0_10px_40px_-12px_var(--color-fuchsia)]',
  surface: 'glass text-text hover:bg-surface-2/80',
  outline: 'border border-line bg-transparent text-text hover:bg-surface/60',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface/50',
  danger: 'bg-rose/15 text-rose border border-rose/30 hover:bg-rose/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] rounded-2xl gap-2',
  lg: 'h-14 px-6 text-lg rounded-2xl gap-2.5',
  xl: 'h-16 px-7 text-xl rounded-3xl gap-3',
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  glow?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'surface',
  size = 'md',
  full = false,
  glow = false,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'inline-flex select-none items-center justify-center font-display font-semibold',
        'transition-colors disabled:pointer-events-none disabled:opacity-40',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        glow && 'ring-glow',
        className,
      )}
      onClick={(e) => {
        haptic('tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
