import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { GameFrame } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { DILEMMAS } from './deck';

/**
 * Read both options, everyone points at once, then the table taps the side that
 * had fewer fingers on it. No per-player vote screen: pointing at a table is
 * faster than eight people tapping a phone, and the app only has to remember
 * who lost.
 */
type Phase = 'read' | 'split' | 'done';
type Side = 'a' | 'b';

const SIPS = 2;

export default function WouldYouRather({ adult }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(DILEMMAS, adult);
  const [phase, setPhase] = useState<Phase>('read');
  const [minority, setMinority] = useState<Side | null>(null);
  const [split, setSplit] = useState(0);

  const card = pile.card;

  const reveal = useCallback(() => {
    primeAudio();
    haptic('select');
    sfx.select();
    setPhase('split');
  }, []);

  const chooseMinority = useCallback((side: Side | null) => {
    haptic(side ? 'fail' : 'tap');
    if (side) sfx.bad();
    setMinority(side);
    setSplit((n) => n + 1);
    setPhase('done');
  }, []);

  const next = useCallback(() => {
    haptic('select');
    setMinority(null);
    setPhase('read');
    pile.draw();
  }, [pile]);

  const option = (side: Side) => {
    const text = card ? loc(side === 'a' ? card.a : card.b) : '';
    const isMinority = minority === side;
    const isMajority = minority !== null && !isMinority;
    return (
      <motion.button
        type="button"
        key={`${card?.id ?? 'none'}-${side}`}
        whileTap={{ scale: phase === 'split' ? 0.97 : 1 }}
        disabled={phase !== 'split'}
        onClick={() => chooseMinority(side)}
        initial={{ opacity: 0, y: side === 'a' ? -18 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className={cn(
          'glass relative flex flex-1 flex-col justify-center gap-2 rounded-[2rem] px-6 py-7 text-left transition-colors',
          side === 'a'
            ? 'border-cyan/25 bg-gradient-to-br from-cyan/15 to-transparent'
            : 'border-amber/25 bg-gradient-to-br from-amber/15 to-transparent',
          isMinority && 'ring-glow border-rose/50',
          isMajority && 'opacity-40',
        )}
      >
        <span
          className={cn(
            'font-display text-xs uppercase tracking-[0.25em]',
            side === 'a' ? 'text-cyan' : 'text-amber',
          )}
        >
          {side === 'a' ? t('games.would-you-rather.optionA') : t('games.would-you-rather.optionB')}
        </span>
        <p className="font-display text-[1.4rem] leading-snug text-balance">{text}</p>
        {isMinority && (
          <span className="font-display text-sm text-rose">
            {t('games.would-you-rather.theyDrink', { n: SIPS })}
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <GameFrame
      status={t('game.cardOf', { current: pile.position, total: pile.size })}
      chips={
        <>
          {split > 0 && <Chip tone="warn">{t('games.would-you-rather.solved', { n: split })}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={
        phase === 'split'
          ? t('games.would-you-rather.tapSmaller')
          : t('games.would-you-rather.rules')
      }
      actions={
        phase === 'read' ? (
          <Button variant="primary" size="xl" full glow onClick={reveal}>
            👉 {t('games.would-you-rather.pointNow')}
          </Button>
        ) : phase === 'split' ? (
          <Button variant="ghost" size="sm" full onClick={() => chooseMinority(null)}>
            {t('games.would-you-rather.evenSplit')}
          </Button>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={next}>
            {t('games.would-you-rather.nextDilemma')}
          </Button>
        )
      }
    >
      <p className="mb-4 text-center font-display text-lg text-muted">
        {t('games.would-you-rather.cta')}
      </p>
      <div className="flex flex-1 flex-col gap-3">
        {option('a')}
        <span className="text-center font-display text-sm uppercase tracking-[0.3em] text-muted">
          {t('common.or')}
        </span>
        {option('b')}
      </div>
      {phase === 'done' && minority === null && (
        <p className="mt-4 text-center font-display text-amber">
          {t('games.would-you-rather.everyoneDrinks')}
        </p>
      )}
    </GameFrame>
  );
}
