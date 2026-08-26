import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { Player } from '@piccolo/shared';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';

/**
 * Big-screen layout. Everything is scaled for a television across the room:
 * one idea per screen, type large enough to read from a sofa, and the phones
 * carry anything that needs reading up close.
 */
export function HostStage({
  kicker,
  title,
  subtitle,
  children,
  footer,
  chips,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  chips?: ReactNode;
}) {
  return (
    <div className="flex min-h-[70dvh] flex-col gap-6">
      {(kicker || chips) && (
        <div className="flex items-center justify-between gap-3">
          {kicker && (
            <span className="font-display text-sm uppercase tracking-[0.3em] text-muted">
              {kicker}
            </span>
          )}
          <span className="flex items-center gap-2">{chips}</span>
        </div>
      )}
      {title && (
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-center font-display text-4xl leading-tight md:text-6xl"
        >
          {title}
        </motion.h2>
      )}
      {subtitle && <p className="text-center text-lg text-muted text-balance">{subtitle}</p>}
      {children && <div className="flex flex-1 flex-col justify-center">{children}</div>}
      {footer}
    </div>
  );
}

/** Phone-side wrapper: a title, a hint and whatever the player has to tap. */
export function PhonePanel({
  kicker,
  title,
  hint,
  children,
  footer,
}: {
  kicker?: string;
  title?: string;
  hint?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col gap-4">
      {kicker && (
        <span className="text-center font-display text-xs uppercase tracking-[0.25em] text-muted">
          {kicker}
        </span>
      )}
      {title && (
        <p className="text-center font-display text-2xl leading-snug text-balance">{title}</p>
      )}
      {hint && <p className="text-center text-sm text-muted text-balance">{hint}</p>}
      {children && <div className="flex flex-1 flex-col justify-center">{children}</div>}
      {footer}
    </div>
  );
}

/** "Waiting for 3 players…" with a soft pulse, used on both sides. */
export function Waiting({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-fuchsia"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <p className="text-muted text-balance">{label}</p>
    </div>
  );
}

/** Who has answered and who the room is still waiting on. */
export function PlayerDots({
  players,
  done,
}: {
  players: readonly Player[];
  done: readonly string[];
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {players.map((player) => {
        const ready = done.includes(player.id);
        return (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-1.5 rounded-pill py-1.5 pl-2 pr-3 text-sm transition-colors',
              ready ? 'bg-gradient-to-r from-lime/30 to-transparent' : 'bg-white/5 text-muted',
              !player.connected && 'opacity-40',
            )}
          >
            <span aria-hidden>{player.avatar}</span>
            <span className="font-display font-semibold">{player.name}</span>
            {ready && <span aria-hidden>✓</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal bars for a vote result. */
export function VoteBars({
  rows,
  highlight = [],
}: {
  rows: readonly { id: string; label: string; votes: number }[];
  highlight?: readonly string[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.votes));
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <motion.li
          key={row.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3"
        >
          <span className="w-32 shrink-0 truncate font-display font-semibold md:w-48 md:text-xl">
            {row.label}
          </span>
          <div className="h-7 flex-1 overflow-hidden rounded-pill bg-white/5">
            <motion.div
              className={cn(
                'h-full rounded-pill',
                highlight.includes(row.id)
                  ? 'bg-gradient-to-r from-fuchsia to-amber'
                  : 'bg-gradient-to-r from-violet/70 to-indigo/50',
              )}
              initial={{ width: 0 }}
              animate={{ width: `${(row.votes / max) * 100}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 24, delay: 0.1 + i * 0.06 }}
            />
          </div>
          <span className="w-7 shrink-0 text-right font-display tabular-nums md:text-xl">
            {row.votes}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

/** Session scoreboard, from `RoomState.players[].score`. */
export function ScoreBoard({ players, unit }: { players: readonly Player[]; unit?: string }) {
  const { t } = useI18n();
  const rows = [...players].sort((a, b) => b.score - a.score);
  const top = rows[0]?.score ?? 0;
  return (
    <div>
      <p className="mb-2 text-center font-display text-sm uppercase tracking-[0.25em] text-muted">
        {t('game.scores')}
      </p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((player, i) => (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-2.5',
              player.score === top && top > 0
                ? 'bg-gradient-to-r from-amber/25 to-transparent'
                : 'bg-white/5',
            )}
          >
            <span className="w-5 shrink-0 font-display text-sm text-muted tabular-nums">
              {i + 1}
            </span>
            <span aria-hidden>{player.avatar}</span>
            <span className="min-w-0 flex-1 truncate font-display font-semibold">
              {player.name}
            </span>
            {!player.connected && <Chip tone="warn">…</Chip>}
            <span className="shrink-0 font-display tabular-nums">
              {player.score}
              {unit ? ` ${unit}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tappable list of players, phone side. */
export function PickPlayer({
  players,
  selected,
  onPick,
  disabledIds = [],
}: {
  players: readonly Player[];
  selected: string | null;
  onPick: (id: string) => void;
  disabledIds?: readonly string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((player) => {
        const off = disabledIds.includes(player.id);
        return (
          <motion.button
            key={player.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={off}
            aria-pressed={selected === player.id}
            onClick={() => onPick(player.id)}
            className={cn(
              'flex items-center gap-2 rounded-2xl px-3 py-3 text-left font-display font-semibold transition-colors',
              selected === player.id
                ? 'bg-gradient-to-br from-violet to-fuchsia text-white'
                : 'glass text-text',
              off && 'pointer-events-none opacity-35',
            )}
          >
            <span className="text-xl" aria-hidden>
              {player.avatar}
            </span>
            <span className="min-w-0 flex-1 truncate">{player.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
