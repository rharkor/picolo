import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { useFuse } from '@/games/_kit/fuse';
import { usePile } from '@/games/_kit/pile';
import { GameFrame, NeedPlayers, PlayerPicker, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { SYLLABLES } from './deck';

/** Between twelve and forty seconds. Never shown, never guessable. */
const MIN_MS = 12_000;
const MAX_MS = 40_000;
const SIPS = 3;

type Phase = 'ready' | 'live' | 'blown';

export default function BombParty({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(SYLLABLES, adult);
  const [phase, setPhase] = useState<Phase>('ready');
  const [sips, setSips] = useState<Record<string, number>>({});
  const [round, setRound] = useState(0);

  const fuse = useFuse(MIN_MS, MAX_MS, () => setPhase('blown'));

  const light = useCallback(() => {
    haptic('select');
    setPhase('live');
    fuse.light();
  }, [fuse]);

  const nextRound = useCallback(() => {
    haptic('select');
    setRound((n) => n + 1);
    setPhase('ready');
    pile.draw();
  }, [pile]);

  const blame = useCallback(
    (id: string) => {
      haptic('fail');
      setSips((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + SIPS }));
      nextRound();
    },
    [nextRound],
  );

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="💣"
        message={t('games.bomb-party.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const syllable = pile.card ? loc(pile.card.text) : '';

  return (
    <GameFrame
      status={t('game.round', { n: round + 1 })}
      chips={<Chip tone="warn">{t('games.bomb-party.stake', { n: SIPS })}</Chip>}
      hint={t('games.bomb-party.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        phase === 'ready' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={light}>
              💣 {t('games.bomb-party.light')}
            </Button>
            <Button variant="ghost" size="sm" full onClick={pile.draw}>
              {t('games.bomb-party.otherSyllable')}
            </Button>
          </>
        ) : phase === 'blown' ? (
          <Button variant="ghost" size="sm" full onClick={nextRound}>
            {t('games.bomb-party.skipTally')}
          </Button>
        ) : (
          <Button
            variant="danger"
            size="lg"
            full
            onClick={() => {
              fuse.snuff();
              setPhase('ready');
            }}
          >
            {t('games.bomb-party.defuse')}
          </Button>
        )
      }
    >
      {phase !== 'blown' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.span
            className="text-7xl"
            aria-hidden
            animate={
              fuse.lit
                ? { scale: [1, 1.16, 1], rotate: [0, -6, 6, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={
              fuse.lit
                ? { duration: Math.max(0.16, 0.6 - fuse.heat * 0.42), repeat: Infinity }
                : { duration: 0.2 }
            }
          >
            💣
          </motion.span>
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-rose">
              {t('games.bomb-party.syllable')}
            </p>
            <p className="mt-1 font-display text-6xl leading-none tracking-[0.1em] text-gradient">
              {syllable}
            </p>
          </div>
          <p className="max-w-xs text-center text-muted text-balance">
            {fuse.lit ? t('games.bomb-party.passIt') : t('games.bomb-party.readyNote')}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex flex-1 flex-col gap-4"
        >
          <div className="text-center">
            <span className="text-6xl" aria-hidden>
              💥
            </span>
            <p className="mt-2 font-display text-4xl leading-none text-rose">
              {t('games.bomb-party.boom')}
            </p>
            <p className="mt-2 text-sm text-muted text-balance">
              {t('games.bomb-party.whoHeldIt', { n: SIPS })}
            </p>
          </div>
          <PlayerPicker players={players} selected={[]} onToggle={blame} />
        </motion.div>
      )}
    </GameFrame>
  );
}
