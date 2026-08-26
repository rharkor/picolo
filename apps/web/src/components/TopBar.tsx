import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function TopBar({
  title,
  subtitle,
  back = true,
  onBack,
  right,
  className,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  /** Where the arrow goes. Defaults to one step back through history. */
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'safe-t sticky top-0 z-40 -mx-5 mb-4 flex items-center gap-3 px-5 pb-3 pt-3',
        'bg-gradient-to-b from-ink via-ink/85 to-transparent backdrop-blur-sm',
        className,
      )}
    >
      {back && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="Back"
          className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition-colors hover:bg-surface-2"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-xl leading-tight">{title}</h1>}
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
