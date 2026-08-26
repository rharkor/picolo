import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { PartyPlayer } from '@/store/party';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Shell every game sits in: a thin status line, a stretchy middle, the actions
 * pinned under it and a one-line reminder of the rules at the bottom. Games
 * only decide what goes in the middle.
 */
export function GameFrame({
  status,
  chips,
  children,
  actions,
  hint,
  footer,
}: {
  status?: ReactNode;
  chips?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  hint?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[72dvh] flex-col">
      {(status || chips) && (
        <div className="mb-4 flex min-h-7 items-center justify-between gap-2 text-sm text-muted">
          <span className="truncate">{status}</span>
          <span className="flex shrink-0 items-center gap-1.5">{chips}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
      {actions && <div className="mt-5 flex flex-col gap-2">{actions}</div>}
      {hint && <p className="mt-4 text-center text-xs leading-relaxed text-muted">{hint}</p>}
      {footer}
    </div>
  );
}

/** The glass card that holds a prompt. Tapping it is optional. */
export function CardFace({
  kicker,
  tone = 'text-fuchsia',
  text,
  adult = false,
  children,
  onTap,
  className,
  size = 'lg',
}: {
  kicker?: string;
  tone?: string;
  text?: string;
  adult?: boolean;
  children?: ReactNode;
  onTap?: () => void;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}) {
  const body = (
    <>
      {kicker && (
        <span className={cn('font-display text-sm uppercase tracking-[0.2em]', tone)}>
          {kicker}
        </span>
      )}
      {text && (
        <p
          className={cn(
            'font-display leading-snug text-balance',
            size === 'md' && 'text-xl',
            size === 'lg' && 'text-[1.7rem]',
            size === 'xl' && 'text-4xl',
          )}
        >
          {text}
        </p>
      )}
      {adult && <Chip tone="accent">18+</Chip>}
      {children}
    </>
  );

  const shell = cn(
    'ring-glow glass flex flex-1 flex-col justify-center gap-5 rounded-[2rem] px-7 py-9 text-left',
    className,
  );

  if (!onTap) return <div className={shell}>{body}</div>;
  return (
    <button type="button" onClick={onTap} className={cn(shell, 'cursor-pointer')}>
      {body}
    </button>
  );
}

/** Wraps a card so it flies in, and can be swiped forward or back. */
export function SwipeCard({
  cardKey,
  direction = 1,
  onNext,
  onBack,
  children,
}: {
  cardKey: string | number;
  direction?: number;
  onNext?: () => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      key={cardKey}
      drag={onNext || onBack ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.35}
      onDragEnd={(_, info) => {
        if (info.offset.x < -70) onNext?.();
        else if (info.offset.x > 70) onBack?.();
      }}
      initial={{ opacity: 0, scale: 0.93, x: direction * 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}

/** Thin gradient rail showing how far through the deck the table is. */
export function ProgressRail({ value }: { value: number }) {
  return (
    <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-violet via-fuchsia to-amber"
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  );
}

/** "On the spot — 🍕 Alex", the header most turn-based games want. */
export function TurnBanner({
  kicker,
  name,
  note,
}: {
  kicker: string;
  name: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{kicker}</span>
      <p className="font-display text-4xl leading-tight text-gradient">{name}</p>
      {note && <p className="mt-1 max-w-xs text-muted text-balance">{note}</p>}
    </div>
  );
}

/** Shown instead of the game when the party list is too short to run it. */
export function NeedPlayers({
  emoji,
  message,
  cta,
  onExit,
}: {
  emoji: string;
  message: string;
  cta: string;
  onExit: () => void;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <p className="max-w-xs text-muted text-balance">{message}</p>
      <Button variant="primary" size="lg" onClick={onExit}>
        {cta}
      </Button>
    </div>
  );
}

/** Running sip / point tally, sorted, hidden while everyone is still on zero. */
export function Tally({
  players,
  values,
  unit,
  ascending = false,
}: {
  players: readonly PartyPlayer[];
  values: Record<string, number>;
  unit?: string;
  ascending?: boolean;
}) {
  const rows = players
    .filter((p) => (values[p.id] ?? 0) !== 0)
    .sort((a, b) =>
      ascending
        ? (values[a.id] ?? 0) - (values[b.id] ?? 0)
        : (values[b.id] ?? 0) - (values[a.id] ?? 0),
    );
  if (rows.length === 0) return null;
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-1.5">
      {rows.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-1.5 rounded-pill bg-white/5 py-1 pl-2 pr-2.5 text-xs"
        >
          <span aria-hidden>{p.avatar}</span>
          <span className="font-semibold">{p.name}</span>
          <span className="text-muted">
            {values[p.id]}
            {unit ? ` ${unit}` : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tappable grid of party members. Games use it to record who drank, who got
 * caught, who voted for whom.
 */
export function PlayerPicker({
  players,
  selected,
  onToggle,
  disabled,
  columns = 2,
}: {
  players: readonly PartyPlayer[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  disabled?: readonly string[];
  columns?: 2 | 3;
}) {
  return (
    <div className={cn('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {players.map((p) => {
        const on = selected.includes(p.id);
        const off = disabled?.includes(p.id) ?? false;
        return (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={off}
            aria-pressed={on}
            onClick={() => {
              haptic('tap');
              onToggle(p.id);
            }}
            className={cn(
              'flex items-center gap-2 rounded-2xl px-3 py-3 text-left font-display font-semibold transition-colors',
              on
                ? 'bg-gradient-to-br from-violet to-fuchsia text-white'
                : 'glass text-text hover:bg-surface-2/80',
              off && 'pointer-events-none opacity-35',
            )}
          >
            <span className="text-xl" aria-hidden>
              {p.avatar}
            </span>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Big fat timer bar. Turns amber then rose as it runs out. */
export function TimerBar({ progress, seconds }: { progress: number; seconds?: number }) {
  const late = progress > 0.75;
  const critical = progress > 0.9;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-colors',
            critical ? 'bg-rose' : late ? 'bg-amber' : 'bg-gradient-to-r from-lime to-cyan',
          )}
          style={{ width: `${Math.max(0, 100 - progress * 100)}%` }}
        />
      </div>
      {seconds !== undefined && (
        <span
          className={cn(
            'w-10 shrink-0 text-right font-display text-lg tabular-nums',
            critical && 'text-rose',
          )}
        >
          {seconds}
        </span>
      )}
    </div>
  );
}

/** Big centred number, for scores, bids and countdowns. */
export function BigNumber({ value, unit }: { value: ReactNode; unit?: string }) {
  return (
    <div className="text-center">
      <motion.p
        key={String(value)}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className="font-display text-7xl leading-none text-gradient"
      >
        {value}
      </motion.p>
      {unit && <p className="mt-1 text-lg text-muted">{unit}</p>}
    </div>
  );
}

/** −/+ stepper around a value. */
export function Stepper({
  value,
  min = 0,
  max = 99,
  onChange,
  unit,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="lg"
        aria-label="-1"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </Button>
      <div className="min-w-24 text-center">
        <p className="font-display text-5xl leading-none tabular-nums">{value}</p>
        {unit && <p className="text-sm text-muted">{unit}</p>}
      </div>
      <Button
        variant="outline"
        size="lg"
        aria-label="+1"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </Button>
    </div>
  );
}

/** Results panel: the podium at the end of a skill round. */
export function Standings({
  rows,
  unit,
}: {
  rows: readonly { id: string; label: string; value: number | string; highlight?: boolean }[];
  unit?: string;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((row, i) => (
        <motion.li
          key={row.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.24, ease: EASE }}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3',
            row.highlight ? 'bg-gradient-to-r from-fuchsia/25 to-transparent' : 'bg-white/5',
          )}
        >
          <span className="w-5 shrink-0 font-display text-sm text-muted tabular-nums">{i + 1}</span>
          <span className="min-w-0 flex-1 truncate font-display font-semibold">{row.label}</span>
          <span className="shrink-0 font-display tabular-nums">
            {row.value}
            {unit ? ` ${unit}` : ''}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
