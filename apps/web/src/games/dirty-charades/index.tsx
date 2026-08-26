import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, Standings, TimerBar, TurnBanner } from '@/games/_kit/ui';
import { useCountdown, useSecondTicks } from '@/games/_kit/timer';
import { haptic } from '@/lib/haptics';
import { CHARADES_DECK } from './deck';

const SECONDS = 60;

/**
 * The actor holds the phone facing themselves for the whole round, the way
 * every charades app does it: one handoff at the start, none after. Skips cost
 * the actor a sip, so nobody scrolls to an easy card.
 */
type Phase = 'ready' | 'live' | 'over';

export default function DirtyCharades({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(CHARADES_DECK, adult, false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [turn, setTurn] = useState(0);
  const [got, setGot] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [board, setBoard] = useState<{ id: string; label: string; value: number }[]>([]);

  const actor = at(players, turn);

  const finish = useCallback(() => {
    haptic('heavy');
    sfx.boom();
    setPhase('over');
  }, []);

  const timer = useCountdown(SECONDS * 1000, finish);
  useSecondTicks(timer.left, timer.running, (second) => {
    if (second > 0 && second <= 5) sfx.countdown(second === 1);
  });

  const start = useCallback(() => {
    primeAudio();
    haptic('select');
    setGot(0);
    setSkipped(0);
    setPhase('live');
    pile.draw();
    timer.start(SECONDS * 1000);
  }, [pile, timer]);

  const resolve = useCallback(
    (guessed: boolean) => {
      haptic(guessed ? 'success' : 'fail');
      if (guessed) {
        sfx.good();
        setGot((n) => n + 1);
      } else {
        sfx.bad();
        setSkipped((n) => n + 1);
      }
      pile.draw();
    },
    [pile],
  );

  const nextActor = useCallback(() => {
    haptic('select');
    if (actor) {
      setBoard((prev) => {
        const without = prev.filter((row) => row.id !== actor.id);
        const previous = prev.find((row) => row.id === actor.id)?.value ?? 0;
        return [...without, { id: actor.id, label: `${actor.avatar} ${actor.name}`, value: previous + got }]
          .sort((a, b) => b.value - a.value);
      });
    }
    setTurn((n) => n + 1);
    setPhase('ready');
  }, [actor, got]);

  if (players.length < 4) {
    return (
      <NeedPlayers
        emoji="🙊"
        message={t('games.dirty-charades.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const card = pile.card;
  const seconds = Math.ceil(timer.left / 1000);

  return (
    <GameFrame
      status={t('game.round', { n: turn + 1 })}
      chips={
        <>
          {phase === 'live' && <Chip tone="warn">✅ {got}</Chip>}
          {phase === 'live' && skipped > 0 && <Chip tone="accent">⤵️ {skipped}</Chip>}
        </>
      }
      hint={t('games.dirty-charades.rules')}
      actions={
        phase === 'ready' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={start}>
              🙊 {t('games.dirty-charades.start', { n: SECONDS })}
            </Button>
            <Button variant="ghost" size="sm" full onClick={() => setTurn((n) => n + 1)}>
              {t('games.dirty-charades.someoneElse')}
            </Button>
          </>
        ) : phase === 'live' ? (
          <>
            <Button variant="primary" size="lg" full glow onClick={() => resolve(true)}>
              ✅ {t('games.dirty-charades.guessed')}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => resolve(false)}>
              ⤵️ {t('games.dirty-charades.skip')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={nextActor}>
            {t('games.dirty-charades.nextActor')}
          </Button>
        )
      }
    >
      {phase === 'ready' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <span className="text-6xl" aria-hidden>
            🙊
          </span>
          <TurnBanner
            kicker={t('games.dirty-charades.actorIs')}
            name={label(actor, t('game.anyone'))}
            note={t('games.dirty-charades.brief')}
          />
          {board.length > 0 && (
            <div className="w-full">
              <Standings rows={board} unit={t('game.points')} />
            </div>
          )}
        </div>
      )}

      {phase === 'live' && (
        <div className="flex flex-1 flex-col">
          <TimerBar progress={timer.progress} seconds={seconds} />
          <motion.div
            key={card?.id ?? 'none'}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="ring-glow glass mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] px-6 py-8 text-center"
          >
            <span className="font-display text-xs uppercase tracking-[0.25em] text-fuchsia">
              {t('games.dirty-charades.mimeThis')}
            </span>
            <p className="font-display text-3xl leading-tight text-balance">
              {card ? loc(card.text) : ''}
            </p>
            {card?.adult && <Chip tone="accent">18+</Chip>}
          </motion.div>
        </div>
      )}

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <span className="text-6xl" aria-hidden>
            ⏰
          </span>
          <p className="font-display text-4xl leading-tight text-gradient">
            {t('games.dirty-charades.scored', { n: got })}
          </p>
          {skipped > 0 && (
            <p className="font-display text-xl text-rose">
              {t('games.dirty-charades.penalty', { name: actor?.name ?? '', n: skipped })}
            </p>
          )}
        </motion.div>
      )}
    </GameFrame>
  );
}
