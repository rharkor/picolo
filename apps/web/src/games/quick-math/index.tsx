import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { useCountdown } from '@/games/_kit/timer';
import { at, label } from '@/games/_kit/players';
import { GameFrame, Tally, TimerBar } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { randInt, shuffle } from '@/lib/random';

interface Sum {
  text: string;
  answer: number;
  options: number[];
}

/** Harder sums and less time on every streak step. */
function makeSum(streak: number): Sum {
  const tier = Math.min(4, Math.floor(streak / 3));
  let a: number;
  let b: number;
  let text: string;
  let answer: number;

  switch (tier) {
    case 0:
      a = randInt(2, 12);
      b = randInt(2, 12);
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    case 1:
      a = randInt(10, 40);
      b = randInt(2, 19);
      answer = a - b;
      text = `${a} − ${b}`;
      break;
    case 2:
      a = randInt(3, 9);
      b = randInt(3, 9);
      answer = a * b;
      text = `${a} × ${b}`;
      break;
    case 3:
      a = randInt(12, 45);
      b = randInt(12, 45);
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    default:
      a = randInt(4, 13);
      b = randInt(4, 13);
      answer = a * b;
      text = `${a} × ${b}`;
  }

  // Distractors sit close enough to hurt but never collide with the answer.
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const drift = randInt(1, Math.max(3, Math.round(answer * 0.2)));
    const candidate = answer + (Math.random() < 0.5 ? -drift : drift);
    if (candidate !== answer && candidate >= 0) wrong.add(candidate);
  }

  return { text, answer, options: shuffle([answer, ...wrong]) };
}

function timeFor(streak: number): number {
  return Math.max(2600, 6000 - streak * 220);
}

type Phase = 'ready' | 'live' | 'right' | 'wrong';

export default function QuickMath({ players }: LocalGameProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('ready');
  const [sum, setSum] = useState<Sum | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [turn, setTurn] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  const player = at(players, turn);

  const missed = useCallback(() => {
    haptic('fail');
    sfx.bad();
    setBest((b) => Math.max(b, streak));
    if (player) setSips((prev) => ({ ...prev, [player.id]: (prev[player.id] ?? 0) + 2 }));
    setStreak(0);
    setPhase('wrong');
  }, [player, streak]);

  const timer = useCountdown(timeFor(0), missed);

  const ask = useCallback(
    (nextStreak: number) => {
      primeAudio();
      setSum(makeSum(nextStreak));
      setPhase('live');
      timer.start(timeFor(nextStreak));
    },
    [timer],
  );

  const answer = useCallback(
    (value: number) => {
      if (!sum || phase !== 'live') return;
      timer.stop();
      if (value === sum.answer) {
        haptic('success');
        sfx.good();
        const next = streak + 1;
        setStreak(next);
        setBest((b) => Math.max(b, next));
        setPhase('right');
        return;
      }
      missed();
    },
    [missed, phase, streak, sum, timer],
  );

  const next = useCallback(() => {
    haptic('select');
    setTurn((n) => n + 1);
    ask(phase === 'right' ? streak : 0);
  }, [ask, phase, streak]);

  return (
    <GameFrame
      status={t('games.quick-math.streak', { n: streak })}
      chips={best > 0 ? <Chip tone="warn">🏆 {best}</Chip> : undefined}
      hint={t('games.quick-math.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        phase === 'ready' ? (
          <Button variant="primary" size="xl" full glow onClick={() => ask(0)}>
            ➗ {t('games.quick-math.start')}
          </Button>
        ) : phase === 'live' ? undefined : (
          <Button variant="primary" size="xl" full glow onClick={next}>
            {t('games.quick-math.nextPlayer')}
          </Button>
        )
      }
    >
      <div className="mb-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {t('games.quick-math.onTheClock')}
        </span>
        <p className="font-display text-2xl leading-tight text-gradient">
          {label(player, t('game.anyone'))}
        </p>
      </div>

      {phase === 'ready' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            ➗
          </span>
          <p className="max-w-xs text-muted text-balance">{t('games.quick-math.readyNote')}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {phase === 'live' && (
            <TimerBar progress={timer.progress} seconds={Math.ceil(timer.left / 1000)} />
          )}
          <motion.p
            key={sum?.text ?? ''}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mt-6 text-center font-display text-6xl leading-none tabular-nums',
              phase === 'wrong' ? 'text-rose' : 'text-gradient',
            )}
          >
            {sum?.text}
          </motion.p>

          <div className="mt-8 grid grid-cols-2 gap-2.5">
            {sum?.options.map((option) => {
              const isAnswer = option === sum.answer;
              const revealed = phase !== 'live';
              return (
                <Button
                  key={option}
                  variant={revealed && isAnswer ? 'primary' : 'surface'}
                  size="xl"
                  disabled={revealed}
                  onClick={() => answer(option)}
                  className="tabular-nums"
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {phase === 'right' && (
            <p className="mt-5 text-center font-display text-xl text-lime">
              {t('games.quick-math.correct', { n: streak })}
            </p>
          )}
          {phase === 'wrong' && (
            <p className="mt-5 text-center font-display text-xl text-rose text-balance">
              {t('games.quick-math.missed', { name: player?.name ?? '', n: 2 })}
            </p>
          )}
        </div>
      )}
    </GameFrame>
  );
}
