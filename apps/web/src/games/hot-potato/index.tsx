import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { useFuse } from '@/games/_kit/fuse';
import { usePile } from '@/games/_kit/pile';
import { CardFace, GameFrame, NeedPlayers, PlayerPicker, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { POTATO_DECK } from './deck';

/**
 * Same hidden timer as Bomb Party, different payload: no syllable to think of,
 * just a card waiting for whoever is caught holding the phone. Shorter fuse,
 * because there is nothing to slow the pass down.
 */
const MIN_MS = 8_000;
const MAX_MS = 28_000;

type Phase = 'ready' | 'live' | 'caught';

export default function HotPotato({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(POTATO_DECK, adult, false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [caughtCount, setCaughtCount] = useState<Record<string, number>>({});

  const fuse = useFuse(MIN_MS, MAX_MS, () => {
    pile.draw();
    setPhase('caught');
  });

  const start = useCallback(() => {
    haptic('select');
    setPhase('live');
    fuse.light();
  }, [fuse]);

  const nextRound = useCallback(() => {
    haptic('select');
    setRound((n) => n + 1);
    setPhase('ready');
  }, []);

  const blame = useCallback(
    (id: string) => {
      haptic('tap');
      setCaughtCount((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      nextRound();
    },
    [nextRound],
  );

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="🥔"
        message={t('games.hot-potato.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const card = pile.card;

  return (
    <GameFrame
      status={t('game.round', { n: round + 1 })}
      chips={adult ? <Chip tone="accent">18+</Chip> : undefined}
      hint={t('games.hot-potato.rules')}
      footer={
        <Tally players={players} values={caughtCount} unit={t('games.hot-potato.caughtUnit')} />
      }
      actions={
        phase === 'ready' ? (
          <Button variant="primary" size="xl" full glow onClick={start}>
            🥔 {t('games.hot-potato.start')}
          </Button>
        ) : phase === 'live' ? (
          <Button
            variant="danger"
            size="lg"
            full
            onClick={() => {
              fuse.snuff();
              setPhase('ready');
            }}
          >
            {t('games.hot-potato.stopIt')}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" full onClick={nextRound}>
            {t('games.hot-potato.skipTally')}
          </Button>
        )
      }
    >
      {phase !== 'caught' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.span
            className="text-7xl"
            aria-hidden
            animate={fuse.lit ? { y: [0, -14, 0], rotate: [-8, 8, -8] } : { y: 0, rotate: 0 }}
            transition={
              fuse.lit
                ? { duration: Math.max(0.18, 0.55 - fuse.heat * 0.38), repeat: Infinity }
                : { duration: 0.2 }
            }
          >
            🥔
          </motion.span>
          <p className="max-w-xs text-center font-display text-xl text-balance">
            {fuse.lit ? t('games.hot-potato.passFast') : t('games.hot-potato.readyNote')}
          </p>
          {fuse.lit && (
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-orange"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: Math.max(0.2, 0.7 - fuse.heat * 0.45),
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex flex-1 flex-col gap-4"
        >
          <CardFace
            kicker={`🔥 ${t('games.hot-potato.caught')}`}
            tone="text-orange"
            text={card ? loc(card.text) : ''}
            adult={card?.adult ?? false}
            size="md"
            className="flex-none py-7"
          />
          <p className="text-center text-sm text-muted">{t('games.hot-potato.whoHadIt')}</p>
          <PlayerPicker players={players} selected={[]} onToggle={blame} />
        </motion.div>
      )}
    </GameFrame>
  );
}
