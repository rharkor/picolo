import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { at, label } from '@/games/_kit/players';
import { CardFace, GameFrame, NeedPlayers, Standings, TimerBar, TurnBanner } from '@/games/_kit/ui';
import { useCountdown, useSecondTicks } from '@/games/_kit/timer';
import { haptic } from '@/lib/haptics';
import { HOT_SEAT_DECK } from './deck';

const SECONDS = 60;

/**
 * Sixty seconds, no pauses. The phone stays on the table facing the room: every
 * question is public, so there is nothing to hide and no reason to hand it
 * around. Only the dodges get counted.
 */
type Phase = 'ready' | 'live' | 'over';

export default function HotSeat({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(HOT_SEAT_DECK, adult, false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [turn, setTurn] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [dodged, setDodged] = useState(0);
  const [history, setHistory] = useState<{ id: string; label: string; value: string }[]>([]);

  const victim = at(players, turn);

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
    setAnswered(0);
    setDodged(0);
    setPhase('live');
    pile.draw();
    timer.start(SECONDS * 1000);
  }, [pile, timer]);

  const advance = useCallback(
    (didAnswer: boolean) => {
      haptic(didAnswer ? 'tap' : 'fail');
      if (didAnswer) {
        sfx.tick();
        setAnswered((n) => n + 1);
      } else {
        sfx.bad();
        setDodged((n) => n + 1);
      }
      pile.draw();
    },
    [pile],
  );

  const nextVictim = useCallback(() => {
    haptic('select');
    if (victim) {
      setHistory((prev) => [
        ...prev.filter((row) => row.id !== victim.id),
        {
          id: victim.id,
          label: `${victim.avatar} ${victim.name}`,
          value: `${answered} · 🫗 ${dodged}`,
        },
      ]);
    }
    setTurn((n) => n + 1);
    setPhase('ready');
  }, [answered, dodged, victim]);

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="🔥"
        message={t('games.hot-seat.needPlayers')}
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
          {phase === 'live' && <Chip tone="warn">✅ {answered}</Chip>}
          {phase === 'live' && dodged > 0 && <Chip tone="accent">🫗 {dodged}</Chip>}
        </>
      }
      hint={t('games.hot-seat.rules')}
      actions={
        phase === 'ready' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={start}>
              🔥 {t('games.hot-seat.start', { n: SECONDS })}
            </Button>
            <Button variant="ghost" size="sm" full onClick={() => setTurn((n) => n + 1)}>
              {t('games.hot-seat.someoneElse')}
            </Button>
          </>
        ) : phase === 'live' ? (
          <>
            <Button variant="primary" size="lg" full glow onClick={() => advance(true)}>
              {t('games.hot-seat.answered')}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => advance(false)}>
              🫗 {t('games.hot-seat.dodge')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={nextVictim}>
            {t('games.hot-seat.nextVictim')}
          </Button>
        )
      }
    >
      {phase === 'ready' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <span className="text-6xl" aria-hidden>
            🔥
          </span>
          <TurnBanner
            kicker={t('games.hot-seat.inTheSeat')}
            name={label(victim, t('game.anyone'))}
            note={t('games.hot-seat.brief', { n: SECONDS })}
          />
          {history.length > 0 && (
            <div className="w-full">
              <Standings rows={history} />
            </div>
          )}
        </div>
      )}

      {phase === 'live' && (
        <div className="flex flex-1 flex-col">
          <TimerBar progress={timer.progress} seconds={seconds} />
          <div className="mt-4 flex flex-1 flex-col">
            <motion.div
              key={card?.id ?? 'none'}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="flex flex-1 flex-col"
            >
              <CardFace
                kicker={t('games.hot-seat.question')}
                tone="text-rose"
                text={card ? loc(card.text) : ''}
                adult={card?.adult ?? false}
              >
                <p className="text-sm text-muted">
                  {victim ? `${victim.avatar} ${victim.name}` : ''}
                </p>
              </CardFace>
            </motion.div>
          </div>
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
            {t('games.hot-seat.survived', { name: victim?.name ?? '' })}
          </p>
          <p className="text-muted text-balance">
            {t('games.hot-seat.summary', { answered, dodged })}
          </p>
          {dodged > 0 && (
            <p className="font-display text-xl text-rose">
              {t('games.hot-seat.penalty', { n: dodged })}
            </p>
          )}
        </motion.div>
      )}
    </GameFrame>
  );
}
