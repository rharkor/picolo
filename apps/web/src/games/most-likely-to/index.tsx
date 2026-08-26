import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { fillNames } from '@/games/_kit/players';
import { CardFace, GameFrame, PlayerPicker, SwipeCard, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { MLT_DECK } from './deck';

/** 3 → 2 → 1 → point, then the table argues about who won. */
type Phase = 'read' | 'counting' | 'tally';

const SIPS = 2;

export default function MostLikelyTo({ players, adult, onExit }: LocalGameProps) {
  const { t, loc, locale } = useI18n();
  const pile = usePile(MLT_DECK, adult);
  const [phase, setPhase] = useState<Phase>('read');
  const [tick, setTick] = useState(3);
  const [picked, setPicked] = useState<string[]>([]);
  const [sips, setSips] = useState<Record<string, number>>({});

  /**
   * A single chained timeout rather than an interval: the countdown is three
   * beats long and this way each beat owns its own sound.
   */
  const countdown = useCallback((from: number) => {
    setTick(from);
    if (from === 0) {
      haptic('heavy');
      sfx.countdown(true);
      window.setTimeout(() => setPhase('tally'), 550);
      return;
    }
    haptic('tap');
    sfx.countdown(false);
    window.setTimeout(() => countdown(from - 1), 750);
  }, []);

  const startCount = useCallback(() => {
    primeAudio();
    setPhase('counting');
    countdown(3);
  }, [countdown]);

  const nextCard = useCallback(() => {
    haptic('select');
    setPicked([]);
    setPhase('read');
    pile.draw();
  }, [pile]);

  const pour = useCallback(() => {
    if (picked.length === 0) {
      nextCard();
      return;
    }
    haptic('success');
    setSips((prev) => {
      const next = { ...prev };
      for (const id of picked) next[id] = (next[id] ?? 0) + SIPS;
      return next;
    });
    nextCard();
  }, [nextCard, picked]);

  const card = pile.card;
  const prompt = card ? fillNames(loc(card.text), players, locale) : '';

  return (
    <GameFrame
      status={t('game.cardOf', { current: pile.position, total: pile.size })}
      chips={
        <>
          {pile.lap > 0 && <Chip>{t('game.lap', { n: pile.lap + 1 })}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={t('games.most-likely-to.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        phase === 'read' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={startCount}>
              👉 {t('games.most-likely-to.point')}
            </Button>
            <Button variant="ghost" size="sm" full onClick={nextCard}>
              {t('game.skip')}
            </Button>
          </>
        ) : phase === 'tally' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={pour}>
              {picked.length > 0
                ? t('games.most-likely-to.drinks', { n: SIPS })
                : t('games.most-likely-to.noWinner')}
            </Button>
          </>
        ) : undefined
      }
    >
      {phase === 'counting' ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.p
            key={tick}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-[7rem] leading-none text-gradient"
          >
            {tick === 0 ? '👉' : tick}
          </motion.p>
          <p className="mt-4 text-muted">{t('games.most-likely-to.pointNow')}</p>
        </div>
      ) : phase === 'tally' ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="flex flex-1 flex-col gap-4"
        >
          <p className="text-center font-display text-xl leading-snug text-balance">{prompt}</p>
          <p className="text-center text-sm text-muted">{t('games.most-likely-to.whoWon')}</p>
          {players.length === 0 ? (
            <p className="text-center text-sm text-muted">{t('game.addPlayersHint')}</p>
          ) : (
            <PlayerPicker
              players={players}
              selected={picked}
              onToggle={(id) =>
                setPicked((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
            />
          )}
        </motion.div>
      ) : (
        <SwipeCard cardKey={card?.id ?? 'none'} onNext={nextCard} onBack={pile.back}>
          <CardFace
            kicker={t('games.most-likely-to.cta')}
            tone="text-amber"
            text={prompt}
            adult={card?.adult ?? false}
            onTap={startCount}
          />
        </SwipeCard>
      )}
      {players.length === 0 && phase === 'read' && (
        <button type="button" onClick={onExit} className="mt-3 text-center text-xs text-fuchsia">
          {t('game.addPlayersHint')}
        </button>
      )}
    </GameFrame>
  );
}
