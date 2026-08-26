import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TriviaPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { sfx } from '@/games/_kit/audio';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PlayerDots, Waiting } from './ui';

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const TINTS = [
  'from-cyan/25 border-cyan/30',
  'from-amber/25 border-amber/30',
  'from-fuchsia/25 border-fuchsia/30',
  'from-lime/25 border-lime/30',
] as const;

/**
 * Counts down from whatever the server said was left when this state arrived.
 * Trusting the server's clock and only animating locally means a phone that was
 * asleep comes back with the right number rather than a stale one.
 */
function useDeadline(endsIn: number | undefined): number {
  const [left, setLeft] = useState(endsIn ?? 0);
  const deadline = useRef(0);

  useEffect(() => {
    if (endsIn === undefined) {
      setLeft(0);
      return;
    }
    deadline.current = performance.now() + endsIn;
    setLeft(endsIn);
    let frame = 0;
    const step = () => {
      const remaining = Math.max(0, deadline.current - performance.now());
      setLeft(remaining);
      if (remaining > 0) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [endsIn]);

  return left;
}

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TriviaPublic | null;
  const left = useDeadline(pub?.kind === 'trivia' ? pub.endsIn : undefined);
  if (pub?.kind !== 'trivia') return null;

  const seconds = Math.ceil(left / 1000);
  const gained = pub.gained ?? [];
  const right = gained.filter((row) => row.points > 0);

  return (
    <HostStage
      kicker={t('games.trivia-night.roomKicker')}
      title={pub.question}
      chips={
        <>
          <Chip tone="warn">
            {pub.round} / {pub.total}
          </Chip>
          {pub.phase === 'question' && <Chip tone="accent">{seconds}s</Chip>}
        </>
      }
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
              {pub.round >= pub.total
                ? t('room.game.finalScores')
                : t('games.trivia-night.nextQuestion')}
            </Button>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('room.game.revealNow')}
            </Button>
          )
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {pub.phase === 'question' && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime to-cyan transition-[width] duration-100"
              style={{ width: `${(left / 15000) * 100}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pub.options.map((option, i) => {
            const isCorrect = pub.phase === 'reveal' && pub.correct === i;
            const dimmed = pub.phase === 'reveal' && pub.correct !== i;
            return (
              <div
                key={option}
                className={cn(
                  'glass flex items-center gap-3 rounded-2xl bg-gradient-to-br to-transparent px-5 py-4',
                  TINTS[i % TINTS.length],
                  isCorrect && 'ring-glow',
                  dimmed && 'opacity-35',
                )}
              >
                <span className="font-display text-xl text-muted">{LETTERS[i]}</span>
                <span className="font-display text-xl md:text-2xl">{option}</span>
              </div>
            );
          })}
        </div>

        {pub.phase === 'question' ? (
          <PlayerDots players={state.players} done={pub.answered} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            {right.length === 0 ? (
              <p className="font-display text-2xl text-rose">
                {t('games.trivia-night.nobodyGotIt')}
              </p>
            ) : (
              <p className="font-display text-2xl text-gradient text-balance">
                {right
                  .map((row) => {
                    const player = state.players.find((p) => p.id === row.id);
                    return `${player?.name ?? ''} +${row.points}`;
                  })
                  .join(' · ')}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </HostStage>
  );
}

export function Phone({ state, self, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TriviaPublic | null;
  const [picked, setPicked] = useState<number | null>(null);
  const round = pub?.kind === 'trivia' ? pub.round : 0;
  const left = useDeadline(pub?.kind === 'trivia' ? pub.endsIn : undefined);

  useEffect(() => setPicked(null), [round]);

  const answer = useCallback(
    (index: number) => {
      haptic('select');
      setPicked(index);
      action('answer', index);
    },
    [action],
  );

  if (pub?.kind !== 'trivia') return null;
  const me = self?.id ?? '';
  const locked = pub.answered.includes(me);
  const mine = pub.gained?.find((row) => row.id === me);

  if (pub.phase === 'reveal') {
    const gotIt = (mine?.points ?? 0) > 0;
    return (
      <PhonePanel
        kicker={t('games.trivia-night.roomKicker')}
        title={
          gotIt
            ? t('games.trivia-night.correct', { n: mine?.points ?? 0 })
            : t('games.trivia-night.wrong')
        }
        hint={t('room.game.lookUp')}
      >
        <p className="text-center font-display text-3xl text-balance">
          {pub.options[pub.correct ?? 0]}
        </p>
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={`${t('games.trivia-night.roomKicker')} · ${Math.ceil(left / 1000)}s`}
      title={pub.question}
      hint={locked ? t('games.trivia-night.locked') : t('games.trivia-night.beFast')}
    >
      {locked ? (
        <Waiting label={t('room.game.waitingOthers')} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {pub.options.map((option, i) => (
            <motion.button
              key={option}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sfx.select();
                answer(i);
              }}
              className={cn(
                'glass flex items-center gap-3 rounded-2xl bg-gradient-to-br to-transparent px-4 py-4 text-left',
                TINTS[i % TINTS.length],
                picked === i && 'ring-glow',
              )}
            >
              <span className="font-display text-lg text-muted">{LETTERS[i]}</span>
              <span className="min-w-0 flex-1 font-display">{option}</span>
            </motion.button>
          ))}
        </div>
      )}
    </PhonePanel>
  );
}
