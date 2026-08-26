import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { GameFrame, PlayerPicker, Tally, TimerBar } from '@/games/_kit/ui';
import { useCountdown, useSecondTicks } from '@/games/_kit/timer';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { CATEGORY_DECK } from './deck';

const CLOCKS = [3, 5, 8] as const;
const SIPS = 3;

/**
 * A shot clock, not a turn tracker: the app has no idea whose turn it is and
 * does not need to. One giant button resets the clock, and the only thing worth
 * recording is who ran out of time.
 */
type Phase = 'ready' | 'running' | 'timeout';

export default function Categories({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(CATEGORY_DECK, adult);
  const [phase, setPhase] = useState<Phase>('ready');
  const [clock, setClock] = useState<number>(5);
  const [chain, setChain] = useState(0);
  const [best, setBest] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  const timeUp = useCallback(() => {
    haptic('fail');
    sfx.bad();
    setPhase('timeout');
    setBest((b) => Math.max(b, chain));
  }, [chain]);

  const timer = useCountdown(clock * 1000, timeUp);
  useSecondTicks(timer.left, timer.running, (second) => {
    if (second > 0 && second <= 3) sfx.countdown(false);
  });

  const startRound = useCallback(() => {
    primeAudio();
    haptic('select');
    setChain(0);
    setPhase('running');
    timer.start(clock * 1000);
  }, [clock, timer]);

  const gotOne = useCallback(() => {
    haptic('tap');
    sfx.tick();
    setChain((n) => n + 1);
    timer.start(clock * 1000);
  }, [clock, timer]);

  const blame = useCallback(
    (id: string) => {
      haptic('fail');
      setSips((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + SIPS }));
      setPhase('ready');
      setChain(0);
      pile.draw();
    },
    [pile],
  );

  const nextCategory = useCallback(() => {
    haptic('select');
    setPhase('ready');
    setChain(0);
    pile.draw();
  }, [pile]);

  const category = pile.card ? loc(pile.card.text) : '';
  const seconds = Math.ceil(timer.left / 1000);

  return (
    <GameFrame
      status={t('games.categories.chain', { n: chain })}
      chips={
        <>
          {best > 0 && <Chip tone="warn">🏆 {best}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={t('games.categories.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        phase === 'ready' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={startRound}>
              ⏱️ {t('games.categories.start', { n: clock })}
            </Button>
            <Button variant="ghost" size="sm" full onClick={nextCategory}>
              {t('games.categories.otherCategory')}
            </Button>
          </>
        ) : phase === 'timeout' ? (
          <Button variant="surface" size="lg" full onClick={nextCategory}>
            {t('games.categories.nobodyFailed')}
          </Button>
        ) : undefined
      }
    >
      {phase === 'ready' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">
            {t('games.categories.theme')}
          </span>
          <motion.p
            key={pile.card?.id ?? 'none'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="font-display text-4xl leading-tight text-gradient text-balance"
          >
            {category}
          </motion.p>
          <div className="flex items-center gap-2">
            {CLOCKS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  haptic('tap');
                  setClock(value);
                }}
                aria-pressed={clock === value}
                className={cn(
                  'rounded-pill px-4 py-2 text-sm font-semibold transition-colors',
                  clock === value
                    ? 'bg-gradient-to-r from-violet to-fuchsia text-white'
                    : 'bg-white/5 text-muted',
                )}
              >
                {value}s
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="flex flex-1 flex-col">
          <p className="text-center font-display text-2xl leading-tight text-balance">{category}</p>
          <div className="mt-4">
            <TimerBar progress={timer.progress} seconds={seconds} />
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={gotOne}
            className="ring-glow glass mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-[2rem]"
          >
            <span className="font-display text-6xl leading-none text-gradient">{chain}</span>
            <span className="font-display text-lg uppercase tracking-[0.2em] text-muted">
              {t('games.categories.tapNext')}
            </span>
          </motion.button>
        </div>
      )}

      {phase === 'timeout' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col gap-4"
        >
          <div className="text-center">
            <p className="font-display text-4xl text-rose">{t('games.categories.timeUp')}</p>
            <p className="mt-1 text-muted">{t('games.categories.chainEnded', { n: chain })}</p>
          </div>
          {players.length === 0 ? (
            <button type="button" onClick={onExit} className="text-center text-xs text-fuchsia">
              {t('game.addPlayersHint')}
            </button>
          ) : (
            <>
              <p className="text-center text-sm text-muted">
                {t('games.categories.whoBlanked', { n: SIPS })}
              </p>
              <PlayerPicker players={players} selected={[]} onToggle={blame} />
            </>
          )}
        </motion.div>
      )}
    </GameFrame>
  );
}
