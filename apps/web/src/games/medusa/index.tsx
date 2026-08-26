import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { GameFrame, NeedPlayers, PlayerPicker, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';

/**
 * Nothing to read, nothing to hide: this game is a countdown and a scoreboard.
 * The phone sits in the middle, calls "heads up", and then records who got
 * caught looking.
 */
type Phase = 'down' | 'counting' | 'up';

export default function Medusa({ players, onExit }: LocalGameProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('down');
  const [tick, setTick] = useState(3);
  const [caught, setCaught] = useState<string[]>([]);
  const [shots, setShots] = useState<Record<string, number>>({});
  const [round, setRound] = useState(0);

  const countdown = useCallback((from: number) => {
    setTick(from);
    if (from === 0) {
      haptic('heavy');
      sfx.reveal();
      setPhase('up');
      return;
    }
    haptic('tap');
    sfx.countdown(false);
    window.setTimeout(() => countdown(from - 1), 900);
  }, []);

  const headsUp = useCallback(() => {
    primeAudio();
    setCaught([]);
    setPhase('counting');
    countdown(3);
  }, [countdown]);

  const settle = useCallback(() => {
    haptic(caught.length > 0 ? 'fail' : 'success');
    if (caught.length > 0) sfx.bad();
    setShots((prev) => {
      const next = { ...prev };
      for (const id of caught) next[id] = (next[id] ?? 0) + 1;
      return next;
    });
    setRound((n) => n + 1);
    setCaught([]);
    setPhase('down');
  }, [caught]);

  if (players.length < 4) {
    return (
      <NeedPlayers
        emoji="🐍"
        message={t('games.medusa.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  return (
    <GameFrame
      status={t('game.round', { n: round + 1 })}
      chips={
        Object.values(shots).reduce((a, b) => a + b, 0) > 0 ? (
          <Chip tone="accent">🥃 {Object.values(shots).reduce((a, b) => a + b, 0)}</Chip>
        ) : undefined
      }
      hint={t('games.medusa.rules')}
      footer={<Tally players={players} values={shots} unit={t('games.medusa.shotsUnit')} />}
      actions={
        phase === 'down' ? (
          <Button variant="primary" size="xl" full glow onClick={headsUp}>
            👇 {t('games.medusa.headsDown')}
          </Button>
        ) : phase === 'up' ? (
          <Button variant="primary" size="xl" full glow onClick={settle}>
            {caught.length > 0
              ? t('games.medusa.theyDrink', { n: caught.length })
              : t('games.medusa.nobodyCaught')}
          </Button>
        ) : undefined
      }
    >
      {phase === 'down' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🐍
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.medusa.ready')}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.medusa.readyNote')}</p>
        </div>
      )}

      {phase === 'counting' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <motion.p
            key={tick}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="font-display text-[7rem] leading-none text-gradient"
          >
            {tick}
          </motion.p>
          <p className="text-muted">{t('games.medusa.keepThemDown')}</p>
        </div>
      )}

      {phase === 'up' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col gap-4"
        >
          <p className="text-center font-display text-4xl leading-none text-rose">
            {t('games.medusa.headsUp')}
          </p>
          <p className="text-center text-sm text-muted text-balance">
            {t('games.medusa.whoLocked')}
          </p>
          <PlayerPicker
            players={players}
            selected={caught}
            onToggle={(id) =>
              setCaught((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
          />
        </motion.div>
      )}
    </GameFrame>
  );
}
