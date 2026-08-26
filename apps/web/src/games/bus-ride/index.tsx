import { motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import {
  CardBack,
  CardFront,
  SUITS,
  fullDeck,
  isRed,
  value,
  type PlayingCard,
  type Suit,
} from '@/games/_kit/cards';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, Standings } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { pick } from '@/lib/random';

/** Four questions, then somebody rides. */
type Phase = 'quiz' | 'verdict' | 'bus' | 'free';

const BUS_LENGTH = 5;
/** Sips owed when the bus turns over a face card. */
const FACE_COST: Record<string, number> = { J: 1, Q: 2, K: 3, A: 4 };

export default function BusRide({ players, onExit }: LocalGameProps) {
  const { t, tRaw } = useI18n();

  // The shoe lives in a ref: it is only ever touched by a tap, and nothing on
  // screen depends on how many cards are left.
  const shoe = useRef<PlayingCard[]>(fullDeck());
  const take = useCallback((count: number): PlayingCard[] => {
    if (shoe.current.length < count) shoe.current = fullDeck();
    return shoe.current.splice(0, count);
  }, []);

  const [phase, setPhase] = useState<Phase>('quiz');
  const [seat, setSeat] = useState(0);
  const [step, setStep] = useState(0);
  const [hand, setHand] = useState<PlayingCard[]>([]);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [wrong, setWrong] = useState<Record<string, number>>({});
  const [rider, setRider] = useState<string | null>(null);
  const [bus, setBus] = useState<PlayingCard[]>([]);
  const [busAt, setBusAt] = useState(0);
  const [restarts, setRestarts] = useState(0);

  const player = at(players, seat);

  const judge = useCallback(
    (card: PlayingCard, guess: string): boolean => {
      const [first, second] = hand;
      switch (step) {
        case 0:
          return guess === (isRed(card.suit) ? 'red' : 'black');
        case 1: {
          if (!first) return false;
          const diff = value(card.rank) - value(first.rank);
          if (diff === 0) return false; // a tie always loses
          return guess === (diff > 0 ? 'higher' : 'lower');
        }
        case 2: {
          if (!first || !second) return false;
          const lo = Math.min(value(first.rank), value(second.rank));
          const hi = Math.max(value(first.rank), value(second.rank));
          const v = value(card.rank);
          if (v === lo || v === hi) return false; // landing on a bound loses
          return guess === (v > lo && v < hi ? 'inside' : 'outside');
        }
        default:
          return guess === card.suit;
      }
    },
    [hand, step],
  );

  const answer = useCallback(
    (guess: string) => {
      const [card] = take(1);
      if (!card || !player) return;
      const ok = judge(card, guess);
      haptic(ok ? 'success' : 'fail');
      if (ok) sfx.good();
      else sfx.bad();
      setHand((prev) => [...prev, card]);
      setLastOk(ok);
      if (!ok) {
        setWrong((prev) => ({ ...prev, [player.id]: (prev[player.id] ?? 0) + step + 1 }));
      }
      setStep((s) => s + 1);
    },
    [judge, player, step, take],
  );

  const nextSeat = useCallback(() => {
    haptic('select');
    setHand([]);
    setStep(0);
    setLastOk(null);
    if (seat + 1 >= players.length) {
      setPhase('verdict');
      return;
    }
    setSeat((s) => s + 1);
  }, [players.length, seat]);

  const startBus = useCallback(
    (id: string) => {
      haptic('heavy');
      setRider(id);
      setBus(take(BUS_LENGTH));
      setBusAt(0);
      setRestarts(0);
      setPhase('bus');
    },
    [take],
  );

  const flip = useCallback(() => {
    const card = bus[busAt];
    if (!card) return;
    const cost = FACE_COST[card.rank];
    if (cost) {
      haptic('fail');
      sfx.bad();
      setRestarts((n) => n + 1);
      setBusAt(0);
      // A fresh row, so the rider cannot memorise their way out.
      setBus(take(BUS_LENGTH));
      return;
    }
    haptic('tap');
    sfx.tick();
    if (busAt + 1 >= BUS_LENGTH) {
      sfx.good();
      setPhase('free');
      setBusAt(BUS_LENGTH);
      return;
    }
    setBusAt((n) => n + 1);
  }, [bus, busAt, take]);

  const restartGame = useCallback(() => {
    haptic('success');
    shoe.current = fullDeck();
    setPhase('quiz');
    setSeat(0);
    setStep(0);
    setHand([]);
    setLastOk(null);
    setWrong({});
    setRider(null);
    setBus([]);
    setBusAt(0);
    setRestarts(0);
  }, []);

  if (players.length < 2) {
    return (
      <NeedPlayers
        emoji="🚌"
        message={t('games.bus-ride.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const standings = players
    .map((p) => ({
      id: p.id,
      label: `${p.avatar} ${p.name}`,
      value: wrong[p.id] ?? 0,
    }))
    .sort((a, b) => b.value - a.value);
  const worst = standings[0]?.value ?? 0;
  const tied = standings.filter((row) => row.value === worst);
  const riderName = players.find((p) => p.id === rider);

  const QUESTIONS: { key: string; options: { value: string; label: string }[] }[] = [
    {
      key: 'redBlack',
      options: [
        { value: 'red', label: `🔴 ${t('games.bus-ride.red')}` },
        { value: 'black', label: `⚫ ${t('games.bus-ride.black')}` },
      ],
    },
    {
      key: 'higherLower',
      options: [
        { value: 'higher', label: `⬆️ ${t('games.bus-ride.higher')}` },
        { value: 'lower', label: `⬇️ ${t('games.bus-ride.lower')}` },
      ],
    },
    {
      key: 'insideOutside',
      options: [
        { value: 'inside', label: `↔️ ${t('games.bus-ride.inside')}` },
        { value: 'outside', label: `⤢ ${t('games.bus-ride.outside')}` },
      ],
    },
    {
      key: 'suit',
      options: SUITS.map((suit: Suit) => ({ value: suit, label: suit })),
    },
  ];
  const question = QUESTIONS[step];

  return (
    <GameFrame
      status={
        phase === 'quiz'
          ? t('games.bus-ride.seatOf', { current: seat + 1, total: players.length })
          : phase === 'bus'
            ? t('games.bus-ride.onTheBus', { name: riderName?.name ?? '' })
            : t('games.bus-ride.title')
      }
      chips={
        phase === 'bus' && restarts > 0 ? <Chip tone="accent">🔁 {restarts}</Chip> : undefined
      }
      hint={t('games.bus-ride.rules')}
      actions={
        phase === 'quiz' && step >= 4 ? (
          <Button variant="primary" size="xl" full glow onClick={nextSeat}>
            {seat + 1 >= players.length
              ? t('games.bus-ride.seeWhoRides')
              : t('games.bus-ride.nextSeat')}
          </Button>
        ) : phase === 'verdict' ? (
          <>
            {tied.length === 1 ? (
              <Button
                variant="primary"
                size="xl"
                full
                glow
                onClick={() => startBus(tied[0]?.id ?? '')}
              >
                🚌 {t('games.bus-ride.rides', { name: tied[0]?.label ?? '' })}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="xl"
                full
                glow
                onClick={() => startBus(pick(tied)?.id ?? '')}
              >
                🎲 {t('games.bus-ride.drawLots')}
              </Button>
            )}
            <Button variant="ghost" size="sm" full onClick={restartGame}>
              {t('game.restart')}
            </Button>
          </>
        ) : phase === 'bus' ? (
          <Button variant="primary" size="xl" full glow onClick={flip}>
            {t('games.bus-ride.flip')}
          </Button>
        ) : phase === 'free' ? (
          <Button variant="primary" size="xl" full glow onClick={restartGame}>
            {t('games.bus-ride.playAgain')}
          </Button>
        ) : undefined
      }
    >
      {phase === 'quiz' && (
        <div className="flex flex-1 flex-col">
          <p className="text-center font-display text-2xl text-gradient">
            {label(player, t('game.anyone'))}
          </p>

          <div className="mt-4 flex min-h-28 items-center justify-center gap-2">
            {hand.map((card, i) => (
              <motion.div
                key={`${card.rank}${card.suit}-${i}`}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{ transformPerspective: 800 }}
                className="w-14"
              >
                <CardFront card={card} size="text-2xl" />
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, 4 - hand.length) }).map((_, i) => (
              <CardBack key={`back-${i}`} className="w-14" />
            ))}
          </div>

          {lastOk !== null && (
            <motion.p
              key={`${step}-${String(lastOk)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'mt-3 text-center font-display text-xl',
                lastOk ? 'text-lime' : 'text-rose',
              )}
            >
              {lastOk
                ? t('games.bus-ride.correct')
                : t('games.bus-ride.wrong', { n: step })}
            </motion.p>
          )}

          {step < 4 && question && (
            <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
              <p className="text-center font-display text-lg text-muted">
                {tRaw(`games.bus-ride.${question.key}`)}
              </p>
              <div className={cn('grid gap-2', question.options.length > 2 ? 'grid-cols-4' : 'grid-cols-2')}>
                {question.options.map((option) => (
                  <Button
                    key={option.value}
                    variant="surface"
                    size="lg"
                    onClick={() => answer(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step >= 4 && (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="font-display text-3xl text-gradient">
                {t('games.bus-ride.seatDone', { n: wrong[player?.id ?? ''] ?? 0 })}
              </p>
            </div>
          )}
        </div>
      )}

      {phase === 'verdict' && (
        <div className="flex flex-1 flex-col justify-center gap-4">
          <p className="text-center font-display text-2xl leading-tight text-gradient">
            {t('games.bus-ride.tally')}
          </p>
          <Standings
            rows={standings.map((row, i) => ({ ...row, highlight: i === 0 }))}
            unit={t('game.sips')}
          />
          {tied.length > 1 && (
            <p className="text-center text-sm text-muted">
              {t('games.bus-ride.tie', { n: tied.length })}
            </p>
          )}
        </div>
      )}

      {(phase === 'bus' || phase === 'free') && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <span className="text-5xl" aria-hidden>
            🚌
          </span>
          <div className="flex items-end justify-center gap-2">
            {Array.from({ length: BUS_LENGTH }).map((_, i) => {
              const card = bus[i];
              const revealed = i < busAt;
              return (
                <div key={i} className={cn('w-14 transition-all', i === busAt && phase === 'bus' && 'scale-110')}>
                  {revealed && card ? (
                    <CardFront card={card} size="text-2xl" />
                  ) : (
                    <CardBack className={cn(i === busAt && phase === 'bus' && 'ring-glow')} />
                  )}
                </div>
              );
            })}
          </div>
          {phase === 'free' ? (
            <div className="text-center">
              <p className="font-display text-3xl text-gradient">
                {t('games.bus-ride.gotOff', { name: riderName?.name ?? '' })}
              </p>
              <p className="mt-1 text-muted">
                {t('games.bus-ride.rideSummary', { n: restarts })}
              </p>
            </div>
          ) : (
            <p className="max-w-xs text-center text-muted text-balance">
              {t('games.bus-ride.busNote')}
            </p>
          )}
        </div>
      )}
    </GameFrame>
  );
}
