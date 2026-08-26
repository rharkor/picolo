import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { useStopwatch } from '@/games/_kit/timer';
import { GameFrame, NeedPlayers, Standings } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';

/**
 * The rule is that you cannot stop before the person to your left, so the only
 * thing worth automating is the clock and the queue. Everyone taps their own
 * name as they come up for air, in order, and the app keeps the times.
 */
type Phase = 'ready' | 'pouring' | 'done';

export default function Waterfall({ players, onExit }: LocalGameProps) {
  const { t } = useI18n();
  const watch = useStopwatch();
  const [phase, setPhase] = useState<Phase>('ready');
  const [stopped, setStopped] = useState<number[]>([]);
  const [rounds, setRounds] = useState(0);

  const start = useCallback(() => {
    primeAudio();
    haptic('heavy');
    sfx.reveal();
    setStopped([]);
    setPhase('pouring');
    watch.start();
  }, [watch]);

  const stopNext = useCallback(() => {
    const elapsed = watch.ms;
    haptic('tap');
    sfx.tick();
    setStopped((prev) => {
      const next = [...prev, elapsed];
      if (next.length >= players.length) {
        watch.stop();
        sfx.good();
        setPhase('done');
        setRounds((n) => n + 1);
      }
      return next;
    });
  }, [players.length, watch]);

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="🌊"
        message={t('games.waterfall.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const nextIndex = stopped.length;
  const nextPlayer = players[nextIndex];
  const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  return (
    <GameFrame
      status={
        phase === 'pouring'
          ? t('games.waterfall.stillGoing', { n: players.length - stopped.length })
          : t('game.round', { n: rounds + 1 })
      }
      chips={phase === 'pouring' ? <Chip tone="warn">{seconds(watch.ms)}</Chip> : undefined}
      hint={t('games.waterfall.rules')}
      actions={
        phase === 'ready' ? (
          <Button variant="primary" size="xl" full glow onClick={start}>
            🌊 {t('games.waterfall.start')}
          </Button>
        ) : phase === 'pouring' ? (
          <Button variant="primary" size="xl" full glow onClick={stopNext}>
            {t('games.waterfall.stopFor', { name: nextPlayer?.name ?? '' })}
          </Button>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={start}>
            {t('games.waterfall.again')}
          </Button>
        )
      }
    >
      {phase === 'ready' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🌊
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.waterfall.leadIs', { name: players[0]?.name ?? '' })}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.waterfall.readyNote')}</p>
        </div>
      )}

      {phase === 'pouring' && (
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-center font-display text-6xl tabular-nums text-gradient">
            {seconds(watch.ms)}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {players.map((player, i) => {
              const time = stopped[i];
              const isNext = i === nextIndex;
              return (
                <li
                  key={player.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-2.5',
                    time !== undefined
                      ? 'bg-white/5 text-muted'
                      : isNext
                        ? 'ring-glow bg-gradient-to-r from-cyan/25 to-transparent'
                        : 'bg-white/[0.03]',
                  )}
                >
                  <span aria-hidden>{player.avatar}</span>
                  <span className="min-w-0 flex-1 truncate font-display font-semibold">
                    {player.name}
                  </span>
                  <span className="shrink-0 font-display text-sm tabular-nums">
                    {time !== undefined ? seconds(time) : isNext ? t('games.waterfall.youNext') : '…'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col justify-center gap-4"
        >
          <p className="text-center font-display text-2xl text-gradient">
            {t('games.waterfall.results')}
          </p>
          <Standings
            rows={players
              .map((player, i) => ({
                id: player.id,
                label: `${player.avatar} ${player.name}`,
                value: seconds(stopped[i] ?? 0),
                raw: stopped[i] ?? 0,
              }))
              .sort((a, b) => b.raw - a.raw)
              .map((row, i) => ({ ...row, highlight: i === 0 }))}
          />
        </motion.div>
      )}
    </GameFrame>
  );
}
