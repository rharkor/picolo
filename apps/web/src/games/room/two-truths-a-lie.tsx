import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { TrioPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PlayerDots, Waiting } from './ui';

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TrioPublic | null;
  if (pub?.kind !== 'trio') return null;

  const subject = state.players.find((p) => p.id === pub.subject);
  const done = pub.phase === 'writing' ? pub.submitted : pub.guessed;
  const waiting = state.players.filter(
    (p) => p.connected && p.id !== pub.subject && !done.includes(p.id),
  );

  return (
    <HostStage
      kicker={t('games.two-truths-a-lie.roomKicker')}
      title={
        pub.phase === 'writing'
          ? t('games.two-truths-a-lie.everyoneWrites')
          : t('games.two-truths-a-lie.aboutName', { name: subject?.name ?? '' })
      }
      chips={
        pub.phase === 'writing' ? undefined : (
          <Chip tone="warn">
            {pub.index} / {pub.total}
          </Chip>
        )
      }
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
              {pub.index >= pub.total
                ? t('room.game.finalScores')
                : t('games.two-truths-a-lie.nextPlayer')}
            </Button>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('room.game.revealNow')}
            </Button>
          )
        ) : undefined
      }
    >
      {pub.phase === 'writing' ? (
        <div className="flex flex-col items-center gap-6">
          <PlayerDots players={state.players} done={pub.submitted} />
          <Waiting
            label={t('room.game.waitingFor', {
              n: waiting.length,
              names: waiting.map((p) => p.name).join(', '),
            })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2">
            {(pub.statements ?? []).map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-5 py-3.5',
                  pub.phase === 'reveal' && pub.lie === i
                    ? 'bg-gradient-to-r from-rose/30 to-transparent'
                    : 'bg-white/5',
                )}
              >
                <span className="w-6 shrink-0 font-display text-muted">{i + 1}</span>
                <span className="font-display text-xl md:text-2xl">{line}</span>
                {pub.phase === 'reveal' && pub.lie === i && (
                  <span className="shrink-0 text-sm text-rose">
                    {t('games.two-truths-a-lie.theLie')}
                  </span>
                )}
              </motion.li>
            ))}
          </ol>
          {pub.phase === 'guessing' ? (
            <>
              <PlayerDots
                players={state.players.filter((p) => p.id !== pub.subject)}
                done={pub.guessed}
              />
              <Waiting
                label={t('room.game.waitingFor', {
                  n: waiting.length,
                  names: waiting.map((p) => p.name).join(', '),
                })}
              />
            </>
          ) : (
            <p className="text-center font-display text-xl text-gradient text-balance">
              {(pub.correct?.length ?? 0) === 0
                ? t('games.two-truths-a-lie.nobodyGotIt', { name: subject?.name ?? '' })
                : t('games.two-truths-a-lie.gotIt', {
                    names: (pub.correct ?? [])
                      .map((id) => state.players.find((p) => p.id === id)?.name ?? '')
                      .join(' · '),
                  })}
            </p>
          )}
        </div>
      )}
    </HostStage>
  );
}

export function Phone({ state, self, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TrioPublic | null;
  const [lines, setLines] = useState(['', '', '']);
  const [lie, setLie] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const index = pub?.kind === 'trio' ? pub.index : 0;

  useEffect(() => setPicked(null), [index]);

  const submit = useCallback(() => {
    if (lines.some((line) => line.trim().length === 0)) return;
    haptic('select');
    action('submit', { statements: lines.map((line) => line.trim()), lie });
  }, [action, lie, lines]);

  const guess = useCallback(
    (value: number) => {
      haptic('select');
      setPicked(value);
      action('guess', value);
    },
    [action],
  );

  if (pub?.kind !== 'trio') return null;
  const me = self?.id ?? '';

  if (pub.phase === 'writing') {
    if (pub.submitted.includes(me)) {
      return (
        <PhonePanel kicker={t('games.two-truths-a-lie.roomKicker')} hint={t('room.game.sent')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.two-truths-a-lie.roomKicker')}
        title={t('games.two-truths-a-lie.writeThree')}
        hint={t('games.two-truths-a-lie.markTheLie')}
        footer={
          <Button
            variant="primary"
            size="xl"
            full
            glow
            disabled={lines.some((line) => line.trim().length === 0)}
            onClick={submit}
          >
            {t('room.game.submit')}
          </Button>
        }
      >
        <div className="flex flex-col gap-2.5">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  haptic('tap');
                  setLie(i);
                }}
                aria-pressed={lie === i}
                className={cn(
                  'shrink-0 rounded-xl px-3 py-2 font-display text-sm font-semibold transition-colors',
                  lie === i ? 'bg-gradient-to-br from-rose to-fuchsia text-white' : 'bg-white/5 text-muted',
                )}
              >
                {lie === i ? t('games.two-truths-a-lie.lieTag') : t('games.two-truths-a-lie.trueTag')}
              </button>
              <input
                value={line}
                onChange={(e) =>
                  setLines((prev) => prev.map((value, index2) => (index2 === i ? e.target.value : value)))
                }
                maxLength={120}
                placeholder={t('games.two-truths-a-lie.statement', { n: i + 1 })}
                aria-label={t('games.two-truths-a-lie.statement', { n: i + 1 })}
                className="glass min-w-0 flex-1 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-fuchsia/50"
              />
            </div>
          ))}
        </div>
      </PhonePanel>
    );
  }

  if (pub.subject === me) {
    return (
      <PhonePanel
        kicker={t('games.two-truths-a-lie.roomKicker')}
        title={t('games.two-truths-a-lie.yourTurn')}
        hint={t('games.two-truths-a-lie.holdTheLine')}
      >
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  if (pub.phase === 'reveal') {
    return (
      <PhonePanel
        kicker={t('games.two-truths-a-lie.roomKicker')}
        title={
          (pub.correct ?? []).includes(me)
            ? t('games.two-truths-a-lie.youWereRight')
            : t('games.two-truths-a-lie.youWereFooled')
        }
        hint={t('room.game.lookUp')}
      />
    );
  }

  if (pub.guessed.includes(me)) {
    return (
      <PhonePanel kicker={t('games.two-truths-a-lie.roomKicker')} hint={t('room.game.voteLocked')}>
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.two-truths-a-lie.roomKicker')}
      title={t('games.two-truths-a-lie.whichIsTheLie')}
      hint={t('games.two-truths-a-lie.readOnScreen')}
    >
      <div className="flex flex-col gap-2.5">
        {(pub.statements ?? []).map((line, i) => (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => guess(i)}
            className={cn(
              'glass flex items-start gap-3 rounded-2xl px-4 py-3 text-left',
              picked === i && 'ring-glow',
            )}
          >
            <span className="w-5 shrink-0 font-display text-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 font-display text-sm">{line}</span>
          </motion.button>
        ))}
      </div>
    </PhonePanel>
  );
}
