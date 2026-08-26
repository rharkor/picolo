import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { at } from '@/games/_kit/players';
import { GameFrame } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { randInt } from '@/lib/random';

const WINS_NEEDED = 3;
const LOSER_SIPS = 3;

type Phase = 'ready' | 'arming' | 'go' | 'result';
type Side = 'top' | 'bottom';

/**
 * Two thumbs, one screen. The wait is deliberately random between one and five
 * seconds so there is nothing to anticipate, and jumping the gun loses the
 * round outright — otherwise both players just mash.
 */
export default function ReactionDuel({ players }: LocalGameProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('ready');
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const [wins, setWins] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<Side | null>(null);
  const [jumped, setJumped] = useState(false);
  const [reaction, setReaction] = useState<number | null>(null);

  const armed = useRef(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const top = at(players, pair[0]);
  const bottom = at(players, pair[1]);
  const nameFor = (side: Side) =>
    side === 'top'
      ? (top?.name ?? t('games.reaction-duel.playerOne'))
      : (bottom?.name ?? t('games.reaction-duel.playerTwo'));

  const arm = useCallback(() => {
    primeAudio();
    haptic('select');
    setWinner(null);
    setJumped(false);
    setReaction(null);
    setPhase('arming');
    timer.current = window.setTimeout(() => {
      armed.current = performance.now();
      haptic('heavy');
      sfx.reveal();
      setPhase('go');
    }, randInt(1200, 5000));
  }, []);

  const hit = useCallback(
    (side: Side) => {
      if (phase === 'arming') {
        if (timer.current !== null) window.clearTimeout(timer.current);
        haptic('fail');
        sfx.bad();
        setJumped(true);
        // Jumping the gun hands the round to the other thumb.
        const other: Side = side === 'top' ? 'bottom' : 'top';
        setWinner(other);
        setWins(([a, b]) => (other === 'top' ? [a + 1, b] : [a, b + 1]));
        setPhase('result');
        return;
      }
      if (phase !== 'go') return;
      haptic('success');
      sfx.good();
      setReaction(Math.round(performance.now() - armed.current));
      setWinner(side);
      setWins(([a, b]) => (side === 'top' ? [a + 1, b] : [a, b + 1]));
      setPhase('result');
    },
    [phase],
  );

  const reset = useCallback(() => {
    haptic('select');
    setWins([0, 0]);
    setWinner(null);
    setJumped(false);
    setReaction(null);
    setPhase('ready');
  }, []);

  const rotate = useCallback(() => {
    haptic('tap');
    setPair(([, b]) => [b, (b + 1) % Math.max(players.length, 2)]);
    reset();
  }, [players.length, reset]);

  const matchOver = wins[0] >= WINS_NEEDED || wins[1] >= WINS_NEEDED;
  const champion: Side | null = matchOver ? (wins[0] >= WINS_NEEDED ? 'top' : 'bottom') : null;

  const half = (side: Side) => {
    const isWinner = winner === side;
    const live = phase === 'go';
    return (
      <motion.button
        type="button"
        onPointerDown={() => hit(side)}
        disabled={phase === 'ready' || phase === 'result'}
        whileTap={{ scale: 0.995 }}
        className={cn(
          'relative flex flex-1 select-none flex-col items-center justify-center gap-1 rounded-[2rem] transition-colors',
          side === 'top' ? 'rotate-180' : '',
          live
            ? 'bg-gradient-to-br from-lime to-cyan text-ink'
            : phase === 'result'
              ? isWinner
                ? 'bg-gradient-to-br from-violet to-fuchsia text-white'
                : 'glass text-muted'
              : 'glass text-muted',
        )}
      >
        <span className="font-display text-2xl font-bold">{nameFor(side)}</span>
        <span className="font-display text-4xl tabular-nums">
          {side === 'top' ? wins[0] : wins[1]}
        </span>
        {live && (
          <span className="font-display text-sm uppercase tracking-[0.3em]">
            {t('games.reaction-duel.tapNow')}
          </span>
        )}
        {phase === 'arming' && (
          <span className="font-display text-xs uppercase tracking-[0.25em]">
            {t('games.reaction-duel.wait')}
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <GameFrame
      status={t('games.reaction-duel.firstTo', { n: WINS_NEEDED })}
      chips={
        <>
          {reaction !== null && <Chip tone="warn">{reaction} ms</Chip>}
          {players.length > 2 && (
            <button type="button" onClick={rotate}>
              <Chip>🔁</Chip>
            </button>
          )}
        </>
      }
      hint={t('games.reaction-duel.rules')}
      actions={
        matchOver ? (
          <Button variant="primary" size="xl" full glow onClick={reset}>
            {t('games.reaction-duel.rematch')}
          </Button>
        ) : phase === 'ready' || phase === 'result' ? (
          <Button variant="primary" size="xl" full glow onClick={arm}>
            {phase === 'ready'
              ? t('games.reaction-duel.start')
              : t('games.reaction-duel.nextRound')}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-1 flex-col gap-2">
        {half('top')}
        <div className="flex min-h-10 items-center justify-center text-center">
          {phase === 'result' && winner && (
            <motion.p
              key={`${wins[0]}-${wins[1]}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-display text-lg"
            >
              {jumped
                ? t('games.reaction-duel.jumped', {
                    loser: nameFor(winner === 'top' ? 'bottom' : 'top'),
                  })
                : t('games.reaction-duel.won', { name: nameFor(winner), ms: reaction ?? 0 })}
            </motion.p>
          )}
          {phase === 'arming' && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-muted">
              {t('games.reaction-duel.steady')}
            </p>
          )}
          {phase === 'go' && (
            <p className="font-display text-lg text-lime">{t('games.reaction-duel.now')}</p>
          )}
        </div>
        {half('bottom')}
      </div>

      {matchOver && champion && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center font-display text-xl text-gradient"
        >
          {t('games.reaction-duel.matchOver', {
            winner: nameFor(champion),
            loser: nameFor(champion === 'top' ? 'bottom' : 'top'),
            n: LOSER_SIPS,
          })}
        </motion.p>
      )}
    </GameFrame>
  );
}
