import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { DeckCard, LocalGameProps } from '@/games/types';
import { usePile } from '@/games/_kit/pile';
import { at, fillNames, label } from '@/games/_kit/players';
import { CardFace, GameFrame, TurnBanner } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';

type Kind = 'truth' | 'dare';

/**
 * Shared by the tame and the spicy edition. Same flow, different piles and a
 * different dictionary namespace, so one of them cannot drift from the other.
 */
export function TruthDareGame({
  players,
  adult,
  onExit,
  truths,
  dares,
  ns,
}: LocalGameProps & {
  truths: DeckCard[];
  dares: DeckCard[];
  ns: string;
}) {
  const { t, tRaw, loc, locale } = useI18n();
  const truthPile = usePile(truths, adult, false);
  const darePile = usePile(dares, adult, false);
  const [turn, setTurn] = useState(0);
  const [kind, setKind] = useState<Kind | null>(null);
  const [chickened, setChickened] = useState(0);

  const current = at(players, turn);
  const pile = kind === 'truth' ? truthPile : darePile;
  const card = kind ? pile.card : undefined;

  // Frozen per (card, turn) so the named player does not change while it is
  // being read out loud.
  const text = useMemo(() => {
    if (!card) return '';
    return fillNames(loc(card.text), players, locale, current);
  }, [card, players, locale, loc, current]);

  const choose = useCallback(
    (next: Kind) => {
      haptic('select');
      (next === 'truth' ? truthPile : darePile).draw();
      setKind(next);
    },
    [darePile, truthPile],
  );

  const nextTurn = useCallback((didChicken: boolean) => {
    haptic(didChicken ? 'fail' : 'success');
    if (didChicken) setChickened((c) => c + 1);
    setKind(null);
    setTurn((n) => n + 1);
  }, []);

  return (
    <GameFrame
      status={t('game.turn', { n: turn + 1 })}
      chips={
        <>
          {chickened > 0 && <Chip tone="warn">🐔 {chickened}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={tRaw(`games.${ns}.rules`)}
      actions={
        card ? (
          <>
            <Button variant="primary" size="lg" full glow onClick={() => nextTurn(false)}>
              {tRaw(`games.${ns}.done`)}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => nextTurn(true)}>
              🐔 {tRaw(`games.${ns}.chicken`)}
            </Button>
          </>
        ) : undefined
      }
    >
      {!card ? (
        <motion.div
          key={`choose-${turn}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col items-center justify-center">
            <TurnBanner
              kicker={tRaw(`games.${ns}.turnOf`)}
              name={label(current, tRaw(`games.${ns}.anyone`))}
              note={tRaw(`games.${ns}.pick`)}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => choose('truth')}
              className="glass flex flex-col items-center gap-2 rounded-[1.75rem] border-cyan/25 bg-gradient-to-b from-cyan/15 to-transparent py-8 font-display text-xl font-bold"
            >
              <span className="text-4xl" aria-hidden>
                💬
              </span>
              {tRaw(`games.${ns}.truth`)}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => choose('dare')}
              className="glass flex flex-col items-center gap-2 rounded-[1.75rem] border-rose/25 bg-gradient-to-b from-rose/15 to-transparent py-8 font-display text-xl font-bold"
            >
              <span className="text-4xl" aria-hidden>
                🔥
              </span>
              {tRaw(`games.${ns}.dare`)}
            </motion.button>
          </div>

          {players.length === 0 && (
            <button type="button" onClick={onExit} className="mt-3 text-center text-xs text-fuchsia">
              {t('game.addPlayersHint')}
            </button>
          )}
        </motion.div>
      ) : (
        /*
         * Deliberately no <AnimatePresence mode="wait">: it holds the incoming
         * child back until the outgoing one has finished exiting, so a starved
         * frame loop (backgrounded tab, phone locking mid-round) would leave
         * the player staring at nothing. Keyed enter animations only.
         */
        <motion.div
          key={`card-${turn}-${kind}`}
          initial={{ opacity: 0, rotateY: -75, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{ transformPerspective: 1000 }}
          className="flex flex-1 flex-col"
        >
          <CardFace
            kicker={kind === 'truth' ? tRaw(`games.${ns}.truth`) : tRaw(`games.${ns}.dare`)}
            tone={kind === 'truth' ? 'text-cyan' : 'text-rose'}
            text={text}
            adult={card.adult}
          >
            {current && (
              <p className="text-sm text-muted">
                {current.avatar} {current.name}
              </p>
            )}
          </CardFace>
        </motion.div>
      )}
    </GameFrame>
  );
}
