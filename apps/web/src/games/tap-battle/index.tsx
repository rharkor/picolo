import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { useCountdown } from '@/games/_kit/timer';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, Standings, TimerBar } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';

const SECONDS = 5;

/** One player at a time, phone passed round. Nothing to hide, everything to lose. */
type Phase = 'ready' | 'tapping' | 'done' | 'results';

export default function TapBattle({ players, onExit }: LocalGameProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('ready');
  const [turn, setTurn] = useState(0);
  const [taps, setTaps] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const player = at(players, turn);

  const stop = useCallback(() => {
    haptic('heavy');
    sfx.good();
    setPhase('done');
  }, []);

  const timer = useCountdown(SECONDS * 1000, stop);

  const start = useCallback(() => {
    primeAudio();
    haptic('select');
    setTaps(0);
    setPhase('tapping');
    timer.start(SECONDS * 1000);
  }, [timer]);

  const tap = useCallback(() => {
    if (!timer.running) return;
    haptic('tap');
    setTaps((n) => n + 1);
  }, [timer.running]);

  const commit = useCallback(() => {
    haptic('select');
    if (player) setScores((prev) => ({ ...prev, [player.id]: taps }));
    if (turn + 1 >= players.length) {
      setPhase('results');
      return;
    }
    setTurn((n) => n + 1);
    setPhase('ready');
  }, [player, players.length, taps, turn]);

  const restart = useCallback(() => {
    haptic('success');
    setScores({});
    setTurn(0);
    setTaps(0);
    setPhase('ready');
  }, []);

  if (players.length < 2) {
    return (
      <NeedPlayers
        emoji="👍"
        message={t('games.tap-battle.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const rows = players
    .filter((p) => scores[p.id] !== undefined)
    .map((p) => ({ id: p.id, label: `${p.avatar} ${p.name}`, value: scores[p.id] ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const best = rows[0]?.value ?? 0;
  const worst = rows[rows.length - 1];

  return (
    <GameFrame
      status={
        phase === 'results'
          ? t('game.scores')
          : t('games.tap-battle.playerOf', { current: turn + 1, total: players.length })
      }
      chips={phase === 'tapping' ? <Chip tone="warn">{taps}</Chip> : undefined}
      hint={t('games.tap-battle.rules')}
      actions={
        phase === 'ready' ? (
          <Button variant="primary" size="xl" full glow onClick={start}>
            👍 {t('games.tap-battle.start', { n: SECONDS })}
          </Button>
        ) : phase === 'done' ? (
          <Button variant="primary" size="xl" full glow onClick={commit}>
            {turn + 1 >= players.length
              ? t('games.tap-battle.seeResults')
              : t('games.tap-battle.nextPlayer')}
          </Button>
        ) : phase === 'results' ? (
          <Button variant="primary" size="xl" full glow onClick={restart}>
            {t('game.restart')}
          </Button>
        ) : undefined
      }
    >
      {phase === 'ready' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            👍
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {label(player, t('game.anyone'))}
          </p>
          <p className="max-w-xs text-muted text-balance">
            {t('games.tap-battle.brief', { n: SECONDS })}
          </p>
          {rows.length > 0 && (
            <div className="w-full">
              <Standings rows={rows} unit={t('games.tap-battle.tapsUnit')} />
            </div>
          )}
        </div>
      )}

      {phase === 'tapping' && (
        <div className="flex flex-1 flex-col">
          <TimerBar progress={timer.progress} seconds={Math.ceil(timer.left / 1000)} />
          <motion.button
            type="button"
            onPointerDown={tap}
            whileTap={{ scale: 0.98 }}
            className="ring-glow mt-4 flex flex-1 select-none flex-col items-center justify-center gap-1 rounded-[2rem] bg-gradient-to-br from-lime/30 to-cyan/15"
          >
            <span className="font-display text-[5rem] leading-none tabular-nums text-gradient">
              {taps}
            </span>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-muted">
              {t('games.tap-battle.tapTap')}
            </span>
          </motion.button>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-[5rem] leading-none tabular-nums text-gradient">{taps}</p>
          <p className="text-muted">
            {t('games.tap-battle.scored', { name: player?.name ?? '', n: taps })}
          </p>
        </div>
      )}

      {phase === 'results' && (
        <div className="flex flex-1 flex-col justify-center gap-4">
          <Standings
            rows={rows.map((row, i) => ({ ...row, highlight: i === 0 }))}
            unit={t('games.tap-battle.tapsUnit')}
          />
          {worst && rows.length > 1 && (
            <p className="text-center font-display text-lg text-rose text-balance">
              {t('games.tap-battle.loserDrinks', {
                name: worst.label,
                n: Math.max(1, best - worst.value),
              })}
            </p>
          )}
        </div>
      )}
    </GameFrame>
  );
}
