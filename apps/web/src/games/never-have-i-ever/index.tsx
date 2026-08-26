import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { shuffle } from '@/lib/random';
import type { LocalGameProps } from '@/games/types';
import { NHIE_DECK } from './deck';

export default function NeverHaveIEver({ adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const deck = useMemo(() => {
    void seed; // reshuffling bumps the seed
    return shuffle(NHIE_DECK.filter((card) => adult || !card.adult));
  }, [adult, seed]);

  const card = deck[index];
  const finished = index >= deck.length;

  const advance = useCallback(() => {
    haptic('select');
    setDirection(1);
    setIndex((i) => i + 1);
  }, []);

  const back = useCallback(() => {
    if (index === 0) return;
    haptic('tap');
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index]);

  const reshuffle = useCallback(() => {
    haptic('success');
    setSeed((s) => s + 1);
    setIndex(0);
    setDirection(1);
  }, []);

  if (finished) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center">
        <span className="text-6xl" aria-hidden>
          🥂
        </span>
        <div>
          <h2 className="text-3xl">{t('game.deckDone')}</h2>
          <p className="mt-2 max-w-sm text-muted">{t('game.deckDoneDesc')}</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button variant="primary" size="lg" full glow onClick={reshuffle}>
            {t('game.reshuffle')}
          </Button>
          <Button variant="ghost" full onClick={onExit}>
            {t('game.otherGame')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[72dvh] flex-col">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>{t('game.roundOf', { current: index + 1, total: deck.length })}</span>
        {adult && <Chip tone="accent">{t('games.never-have-i-ever.spicyOn')}</Chip>}
      </div>

      {/* Progress rail */}
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet via-fuchsia to-amber"
          animate={{ width: `${((index + 1) / deck.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="relative flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.button
            key={card?.id ?? index}
            type="button"
            onClick={advance}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) advance();
              else if (info.offset.x > 70) back();
            }}
            initial={{ opacity: 0, scale: 0.92, x: direction * 60, rotate: direction * 3 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -direction * 90, rotate: -direction * 5 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="ring-glow glass flex min-h-[46dvh] w-full cursor-pointer flex-col justify-center gap-5 rounded-[2rem] px-7 py-10 text-left"
          >
            <span className="font-display text-sm uppercase tracking-[0.2em] text-fuchsia">
              {t('games.never-have-i-ever.cta')}
            </span>
            <p className="font-display text-[1.7rem] leading-snug text-balance">
              {card ? loc(card.text) : ''}
            </p>
            {card?.adult && <Chip tone="accent">18+</Chip>}
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button variant="ghost" size="lg" onClick={back} disabled={index === 0} aria-label="Previous">
          ←
        </Button>
        <Button variant="primary" size="lg" full glow onClick={advance}>
          {t('games.never-have-i-ever.nextCard')}
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted">{t('games.never-have-i-ever.rules')}</p>
    </div>
  );
}
