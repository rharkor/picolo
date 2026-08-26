import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { DeckCard, LocalGameProps } from '@/games/types';
import { haptic } from '@/lib/haptics';
import { pick, shuffle } from '@/lib/random';
import type { PartyPlayer } from '@/store/party';
import { DARES, TRUTHS } from './deck';

type Kind = 'truth' | 'dare';


interface Drawn {
  kind: Kind;
  text: string;
  adult: boolean;
}

/** Two independent shuffled piles with cursors, reshuffled when exhausted. */
interface Piles {
  truth: DeckCard[];
  dare: DeckCard[];
  ti: number;
  di: number;
}

function buildPiles(adult: boolean): Piles {
  const keep = (card: DeckCard) => adult || !card.adult;
  return { truth: shuffle(TRUTHS.filter(keep)), dare: shuffle(DARES.filter(keep)), ti: 0, di: 0 };
}

/** Swaps {player} for someone other than whoever is currently on the spot. */
function resolveTarget(
  text: string,
  current: PartyPlayer | undefined,
  players: PartyPlayer[],
  fallback: string,
): string {
  if (!text.includes('{player}')) return text;
  const others = players.filter((p) => p.id !== current?.id);
  const target = pick(others)?.name ?? fallback;
  return text.replaceAll('{player}', target);
}

export default function TruthOrDare({ players, adult, onExit }: LocalGameProps) {
  const { t, loc, locale } = useI18n();
  const [turn, setTurn] = useState(0);
  const [drawn, setDrawn] = useState<Drawn | null>(null);
  const [chickened, setChickened] = useState(0);
  const piles = useRef<Piles>(buildPiles(adult));

  // Toggling 18+ in another tab should rebuild the piles, not corrupt them.
  useEffect(() => {
    piles.current = buildPiles(adult);
  }, [adult]);

  const current = players.length > 0 ? players[turn % players.length] : undefined;

  const choose = useCallback(
    (kind: Kind) => {
      haptic('select');
      const p = piles.current;
      const deck = kind === 'truth' ? p.truth : p.dare;
      const cursor = kind === 'truth' ? p.ti : p.di;

      // Ran out: reshuffle the same pile and start over.
      if (cursor >= deck.length) {
        const reshuffled = shuffle(deck);
        if (kind === 'truth') {
          p.truth = reshuffled;
          p.ti = 1;
        } else {
          p.dare = reshuffled;
          p.di = 1;
        }
        const first = reshuffled[0];
        if (!first) return;
        setDrawn({
          kind,
          adult: first.adult,
          text: resolveTarget(
            loc(first.text),
            current,
            players,
            NEIGHBOUR[locale as Locale] ?? NEIGHBOUR.en,
          ),
        });
        return;
      }

      const card = deck[cursor];
      if (!card) return;
      if (kind === 'truth') p.ti += 1;
      else p.di += 1;
      setDrawn({
        kind,
        adult: card.adult,
        text: resolveTarget(
          loc(card.text),
          current,
          players,
          NEIGHBOUR[locale as Locale] ?? NEIGHBOUR.en,
        ),
      });
    },
    [current, loc, locale, players],
  );

  const nextTurn = useCallback((didChicken: boolean) => {
    haptic(didChicken ? 'fail' : 'success');
    if (didChicken) setChickened((c) => c + 1);
    setDrawn(null);
    setTurn((tn) => tn + 1);
  }, []);

  const onTheSpot = current ? `${current.avatar} ${current.name}` : t('games.truth-or-dare.anyone');

  return (
    <div className="flex min-h-[72dvh] flex-col">
      <div className="mb-5 flex items-center justify-between text-sm text-muted">
        <span>{t('games.truth-or-dare.round', { n: turn + 1 })}</span>
        {chickened > 0 && <Chip tone="warn">🐔 {chickened}</Chip>}
      </div>

      {/*
        Deliberately no <AnimatePresence mode="wait"> here: it holds the
        incoming child back until the outgoing one finishes exiting, so a
        starved frame loop (backgrounded tab, phone locking mid-round) would
        leave the player staring at nothing. Keyed enter animations only.
      */}
      {!drawn ? (
          <motion.div
            key={`choose-${turn}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {t('games.truth-or-dare.turnOf')}
              </span>
              <p className="font-display text-4xl leading-tight text-gradient">{onTheSpot}</p>
              <p className="mt-2 text-muted">{t('games.truth-or-dare.pick')}</p>
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
                {t('games.truth-or-dare.truth')}
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
                {t('games.truth-or-dare.dare')}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`card-${turn}-${drawn.kind}`}
            initial={{ opacity: 0, rotateY: -75, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            style={{ transformPerspective: 1000 }}
            className="flex flex-1 flex-col"
          >
            <div className="ring-glow glass flex flex-1 flex-col justify-center gap-5 rounded-[2rem] px-7 py-10">
              <div className="flex items-center gap-2">
                <span
                  className={`font-display text-sm uppercase tracking-[0.2em] ${
                    drawn.kind === 'truth' ? 'text-cyan' : 'text-rose'
                  }`}
                >
                  {drawn.kind === 'truth'
                    ? t('games.truth-or-dare.truth')
                    : t('games.truth-or-dare.dare')}
                </span>
                {drawn.adult && <Chip tone="accent">18+</Chip>}
              </div>
              <p className="font-display text-[1.6rem] leading-snug text-balance">{drawn.text}</p>
              {current && (
                <p className="text-sm text-muted">
                  {current.avatar} {current.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button variant="primary" size="lg" full glow onClick={() => nextTurn(false)}>
                {t('games.truth-or-dare.done')}
              </Button>
              <Button variant="danger" size="lg" full onClick={() => nextTurn(true)}>
                🐔 {t('games.truth-or-dare.chicken')}
              </Button>
            </div>
          </motion.div>
        )}


      <p className="mt-4 text-center text-xs text-muted">{t('games.truth-or-dare.rules')}</p>
      {players.length === 0 && (
        <button type="button" onClick={onExit} className="mt-2 text-center text-xs text-fuchsia">
          {t('games.truth-or-dare.addPlayers')}
        </button>
      )}
    </div>
  );
}

/** Used when the party list cannot supply a second name for a {player} card. */
const NEIGHBOUR: Record<Locale, string> = {
  en: 'the player on your left',
  fr: 'le joueur à ta gauche',
};
