import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { GameMeta } from '@piccolo/shared';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { ACCENT } from '@/lib/accents';
import { cn } from '@/lib/cn';

export function GameCard({ game }: { game: GameMeta }) {
  const { t, tRaw, loc } = useI18n();
  const accent = ACCENT[game.accent];
  const ready = game.status === 'ready';

  const players =
    game.maxPlayers === null
      ? t('game.playersNeeded', { min: game.minPlayers })
      : t('game.playersRange', { min: game.minPlayers, max: game.maxPlayers });

  return (
    <motion.div whileTap={{ scale: 0.985 }} className="h-full">
      <Link
        to={`/g/${game.id}`}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-card p-4',
          'glass transition-all duration-300',
          ready ? 'hover:border-white/20' : 'opacity-65',
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gradient-to-br blur-2xl transition-opacity duration-300',
            accent.grad,
            ready ? 'opacity-80 group-hover:opacity-100' : 'opacity-30',
          )}
        />

        <div className="relative mb-3 flex items-start justify-between gap-2">
          <span className="text-3xl leading-none" aria-hidden>
            {game.emoji}
          </span>
          <div className="flex flex-col items-end gap-1">
            {game.adult && <Chip tone="accent">18+</Chip>}
            {!ready && <Chip tone="warn">{t('common.soon')}</Chip>}
          </div>
        </div>

        <h3 className="relative text-lg leading-tight">{loc(game.title)}</h3>
        <p className="relative mt-1 line-clamp-2 text-sm text-muted">{loc(game.tagline)}</p>

        <div className="relative mt-auto flex flex-wrap items-center gap-1.5 pt-3 text-[0.7rem] text-muted">
          <span className={cn('h-1.5 w-1.5 rounded-full', accent.dot)} aria-hidden />
          <span className="font-semibold uppercase tracking-wider">
            {tRaw(`category.${game.category}`)}
          </span>
          <span aria-hidden>·</span>
          <span>{players}</span>
          <span aria-hidden>·</span>
          <span>
            {game.minutes[0]}–{game.minutes[1]} {t('common.min')}
          </span>
        </div>

        <div className="relative mt-2 flex gap-1.5">
          {game.modes.map((mode) => (
            <Chip key={mode}>{tRaw(`mode.${mode}Short`)}</Chip>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
