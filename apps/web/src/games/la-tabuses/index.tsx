import { motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { haptic } from '@/lib/haptics';
import { shuffle } from '@/lib/random';
import type { PartyPlayer } from '@/store/party';
import { CHALLENGES, QUESTIONS, type Challenge, type Question } from './deck';

/** Sips handed out when a bluff is called, either way. */
const PENALTY = 3;

/**
 * Two decks, two jobs for the app.
 *
 * Quiz: the auction happens out loud, so the app is only a card holder — the
 * question, whose turn it is to open, and the answer on demand. Tapping a
 * stepper up to 8849 is nobody's idea of a party.
 *
 * Challenges: the table still needs someone to record whether the feat
 * actually happened, so that deck keeps the bid / raise / call flow.
 */
type Variant = 'quiz' | 'feats';
type Phase = 'pick' | 'ask' | 'answer' | 'reveal' | 'bid' | 'decide' | 'resolve';
type Card = Question | Challenge;

const isQuestion = (card: Card): card is Question => 'answer' in card;

export default function LaTabuses({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();

  const [variant, setVariant] = useState<Variant | null>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [round, setRound] = useState(0);
  const [card, setCard] = useState<Card | null>(null);
  const [bidderIndex, setBidderIndex] = useState(0);
  const [challengerIndex, setChallengerIndex] = useState(0);
  const [bid, setBid] = useState(0);
  const [floor, setFloor] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  // Shuffled once per deck choice and walked with a cursor, so no card repeats
  // until the whole deck has been through.
  const deck = useRef<Card[]>([]);
  const cursor = useRef(0);

  const takeCard = useCallback((): Card | null => {
    if (deck.current.length === 0) return null;
    if (cursor.current >= deck.current.length) cursor.current = 0;
    const next = deck.current[cursor.current] ?? null;
    cursor.current += 1;
    return next;
  }, []);

  const at = useCallback(
    (index: number): PartyPlayer | undefined =>
      players.length > 0 ? players[((index % players.length) + players.length) % players.length] : undefined,
    [players],
  );

  const chooseVariant = useCallback(
    (next: Variant) => {
      haptic('select');
      deck.current = shuffle(
        (next === 'quiz' ? (QUESTIONS as Card[]) : (CHALLENGES as Card[])).filter(
          (c) => adult || !c.adult,
        ),
      );
      cursor.current = 0;
      setVariant(next);
      setRound(0);
      setSips({});
      if (next === 'quiz') {
        setCard(takeCard());
        setPhase('ask');
      } else {
        setCard(null);
        setPhase('reveal');
      }
    },
    [adult, takeCard],
  );

  // ------------------------------------------------------------------- quiz

  const nextQuestion = useCallback(() => {
    haptic('select');
    setRound((r) => r + 1);
    setCard(takeCard());
    setPhase('ask');
  }, [takeCard]);

  const showAnswer = useCallback(() => {
    haptic('heavy');
    setPhase('answer');
  }, []);

  // -------------------------------------------------------------- challenges

  const startRound = useCallback(() => {
    const next = takeCard();
    if (!next) return;
    haptic('select');
    // Each round opens with a different player, so nobody is always first.
    setCard(next);
    setBidderIndex(round % Math.max(players.length, 1));
    setBid(next.start);
    setFloor(next.start);
    setPhase('bid');
  }, [players.length, round, takeCard]);

  const commitBid = useCallback(() => {
    haptic('select');
    setChallengerIndex(bidderIndex + 1);
    setPhase('decide');
  }, [bidderIndex]);

  const raise = useCallback(() => {
    haptic('tap');
    // The floor is the lowest legal bid, so a raise has to clear the last one.
    setBidderIndex(challengerIndex);
    setFloor(bid + 1);
    setBid(bid + 1);
    setPhase('bid');
  }, [bid, challengerIndex]);

  const settle = useCallback(
    (bidderSucceeded: boolean) => {
      haptic(bidderSucceeded ? 'success' : 'fail');
      const loser = bidderSucceeded ? at(challengerIndex) : at(bidderIndex);
      if (loser) {
        setSips((prev) => ({ ...prev, [loser.id]: (prev[loser.id] ?? 0) + PENALTY }));
      }
      setRound((r) => r + 1);
      setCard(null);
      setPhase('reveal');
    },
    [at, bidderIndex, challengerIndex],
  );

  if (players.length < 2) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 text-center">
        <span className="text-5xl" aria-hidden>
          🙄
        </span>
        <p className="max-w-xs text-muted">{t('games.la-tabuses.needPlayers')}</p>
        <Button variant="primary" size="lg" onClick={onExit}>
          {t('game.otherGame')}
        </Button>
      </div>
    );
  }

  if (phase === 'pick' || !variant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[68dvh] flex-col justify-center gap-4"
      >
        <p className="text-center font-display text-2xl leading-tight text-gradient">
          {t('games.la-tabuses.pickTitle')}
        </p>

        <button
          type="button"
          onClick={() => chooseVariant('quiz')}
          className="ring-glow glass rounded-[2rem] px-6 py-6 text-left"
        >
          <span className="text-4xl" aria-hidden>
            🔢
          </span>
          <p className="mt-3 font-display text-xl">{t('games.la-tabuses.quizTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('games.la-tabuses.quizDesc')}</p>
        </button>

        <button
          type="button"
          onClick={() => chooseVariant('feats')}
          className="glass rounded-[2rem] px-6 py-6 text-left"
        >
          <span className="text-4xl" aria-hidden>
            💪
          </span>
          <p className="mt-3 font-display text-xl">{t('games.la-tabuses.featsTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('games.la-tabuses.featsDesc')}</p>
        </button>
      </motion.div>
    );
  }

  const quiz = variant === 'quiz';
  const unit = card ? loc(card.unit) : '';
  const prompt = card ? (isQuestion(card) ? loc(card.prompt) : loc(card.feat)) : '';

  return (
    <div className="flex min-h-[72dvh] flex-col">
      <div className="mb-5 flex items-center justify-between text-sm text-muted">
        <span>{t('games.la-tabuses.round', { n: round + 1 })}</span>
        <span className="flex items-center gap-1.5">
          <Chip tone="warn">
            {quiz ? t('games.la-tabuses.modeQuiz') : t('games.la-tabuses.modeFeats')}
          </Chip>
          <Chip>{t('games.la-tabuses.penalty', { n: PENALTY })}</Chip>
        </span>
      </div>

      {card && quiz && (
        <motion.div
          key={`quiz-${round}-${phase}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          <div className="ring-glow glass flex flex-1 flex-col justify-center gap-5 rounded-[2rem] px-7 py-8">
            <div>
              <span className="font-display text-xs uppercase tracking-[0.2em] text-amber">
                {t('games.la-tabuses.question')}
              </span>
              <p className="mt-2 font-display text-2xl leading-snug text-balance">{prompt}</p>
              {card.adult && <Chip tone="accent" className="mt-3">18+</Chip>}
            </div>

            {phase === 'ask' ? (
              <p className="text-center text-lg text-muted text-balance">
                {t('games.la-tabuses.opensBidding', { name: at(round)?.name ?? '' })}
              </p>
            ) : (
              <div className="text-center">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-amber">
                  {t('games.la-tabuses.answerIs')}
                </p>
                <p className="mt-1 font-display text-6xl leading-none text-gradient">
                  {isQuestion(card) ? card.answer : ''}
                </p>
                <p className="text-lg text-muted">{unit}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {phase === 'ask' && (
              <Button variant="primary" size="xl" full glow onClick={showAnswer}>
                👀 {t('games.la-tabuses.showAnswer')}
              </Button>
            )}
            <Button
              variant={phase === 'answer' ? 'primary' : 'surface'}
              size={phase === 'answer' ? 'xl' : 'lg'}
              full
              glow={phase === 'answer'}
              onClick={nextQuestion}
            >
              {t('games.la-tabuses.nextQuestion')}
            </Button>
          </div>
        </motion.div>
      )}

      {!quiz && phase === 'reveal' && (
        <motion.div
          key={`reveal-${round}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-5xl" aria-hidden>
              🙄
            </span>
            <p className="font-display text-3xl leading-tight text-gradient">
              {t('games.la-tabuses.nextRound')}
            </p>
            <p className="max-w-xs text-muted">
              {t('games.la-tabuses.opener', { name: at(round)?.name ?? '' })}
            </p>
          </div>
          <Button variant="primary" size="xl" full glow onClick={startRound}>
            {t('games.la-tabuses.drawCard')}
          </Button>
        </motion.div>
      )}

      {card && !quiz && phase === 'bid' && (
        <motion.div
          key={`bid-${round}-${bidderIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="flex flex-1 flex-col"
        >
          <div className="ring-glow glass flex flex-1 flex-col justify-center gap-6 rounded-[2rem] px-7 py-8">
            <div>
              <span className="font-display text-xs uppercase tracking-[0.2em] text-amber">
                {t('games.la-tabuses.challenge')}
              </span>
              <p className="mt-2 font-display text-2xl leading-snug text-balance">{prompt}</p>
              {card.adult && <Chip tone="accent" className="mt-3">18+</Chip>}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted">
                {t('games.la-tabuses.bidderIs', { name: at(bidderIndex)?.name ?? '' })}
              </p>
              <p className="mt-1 font-display text-6xl leading-none text-gradient">{bid}</p>
              <p className="text-lg text-muted">{unit}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBid((b) => Math.max(floor, b - 1))}
                disabled={bid <= floor}
                aria-label="-1"
              >
                −1
              </Button>
              <Button variant="outline" size="lg" onClick={() => setBid((b) => b + 1)} aria-label="+1">
                +1
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBid((b) => b + card.step)}
                aria-label={`+${card.step}`}
              >
                +{card.step}
              </Button>
            </div>
          </div>

          <Button className="mt-5" variant="primary" size="xl" full glow onClick={commitBid}>
            {t('games.la-tabuses.commit', { n: bid, unit })}
          </Button>
        </motion.div>
      )}

      {card && !quiz && phase === 'decide' && (
        <motion.div
          key={`decide-${round}-${challengerIndex}-${bid}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          <div className="glass flex flex-1 flex-col justify-center gap-4 rounded-[2rem] px-7 py-8 text-center">
            <p className="text-sm text-muted">{prompt}</p>
            <p className="font-display text-xl leading-snug text-balance">
              {t('games.la-tabuses.claim', { name: at(bidderIndex)?.name ?? '', n: bid, unit })}
            </p>
            <p className="mt-2 font-display text-2xl text-amber">
              {t('games.la-tabuses.yourCall', { name: at(challengerIndex)?.name ?? '' })}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="surface" size="lg" full onClick={raise}>
              {t('games.la-tabuses.raise')}
            </Button>
            <Button variant="primary" size="xl" full glow onClick={() => setPhase('resolve')}>
              🙄 {t('games.la-tabuses.callIt')}
            </Button>
          </div>
        </motion.div>
      )}

      {card && !quiz && phase === 'resolve' && (
        <motion.div
          key={`resolve-${round}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="flex flex-1 flex-col"
        >
          <div className="ring-glow glass flex flex-1 flex-col justify-center gap-4 rounded-[2rem] px-7 py-8 text-center">
            <span className="text-4xl" aria-hidden>
              👀
            </span>
            <p className="font-display text-2xl leading-snug text-balance">
              {t('games.la-tabuses.proveIt', { name: at(bidderIndex)?.name ?? '', n: bid, unit })}
            </p>
            <p className="text-sm text-muted">
              {t('games.la-tabuses.stakes', {
                bidder: at(bidderIndex)?.name ?? '',
                challenger: at(challengerIndex)?.name ?? '',
                n: PENALTY,
              })}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="surface" size="lg" full onClick={() => settle(true)}>
              💪 {t('games.la-tabuses.didIt')}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => settle(false)}>
              😵 {t('games.la-tabuses.failed')}
            </Button>
          </div>
        </motion.div>
      )}

      {Object.keys(sips).length > 0 && (
        <ul className="mt-5 flex flex-wrap justify-center gap-1.5">
          {players
            .filter((p) => (sips[p.id] ?? 0) > 0)
            .sort((a, b) => (sips[b.id] ?? 0) - (sips[a.id] ?? 0))
            .map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-1.5 rounded-pill bg-white/5 py-1 pl-2 pr-2.5 text-xs"
              >
                <span aria-hidden>{p.avatar}</span>
                <span className="font-semibold">{p.name}</span>
                <span className="text-muted">{sips[p.id]}</span>
              </li>
            ))}
        </ul>
      )}

      <p className="mt-4 text-center text-xs text-muted">
        {quiz ? t('games.la-tabuses.hintQuiz') : t('games.la-tabuses.hintFeats')}
      </p>

      <Button className="mt-2" variant="ghost" size="sm" full onClick={() => setPhase('pick')}>
        {t('games.la-tabuses.changeMode')}
      </Button>
    </div>
  );
}
