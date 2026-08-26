import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { FlippingCard, RANKS, fullDeck, type PlayingCard, type Rank } from '@/games/_kit/cards';
import { at, label } from '@/games/_kit/players';
import { GameFrame } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { pick } from '@/lib/random';
import { KINGS_RULES, type KingsRule } from './deck';

/** One rule per rank, redrawn every game. */
function rollRuleset(): Record<Rank, KingsRule> {
  const out = {} as Record<Rank, KingsRule>;
  for (const rank of RANKS) {
    const options = KINGS_RULES.filter((r) => r.rank === rank);
    const chosen = pick(options) ?? options[0];
    if (chosen) out[rank] = chosen;
  }
  return out;
}

export default function KingsCup({ players }: LocalGameProps) {
  const { t, loc } = useI18n();
  const [ruleset, setRuleset] = useState(rollRuleset);
  const [deck, setDeck] = useState<PlayingCard[]>(fullDeck);
  const [drawn, setDrawn] = useState<PlayingCard[]>([]);
  const [showRules, setShowRules] = useState(false);

  const card = drawn[drawn.length - 1];
  const kings = drawn.filter((c) => c.rank === 'K').length;
  const rule = card ? ruleset[card.rank] : undefined;
  const finalKing = card?.rank === 'K' && kings === 4;

  const draw = useCallback(() => {
    if (deck.length === 0) return;
    const next = deck[deck.length - 1];
    if (!next) return;
    const isFourth = next.rank === 'K' && drawn.filter((c) => c.rank === 'K').length === 3;
    haptic(isFourth ? 'heavy' : 'select');
    if (isFourth) sfx.boom();
    else sfx.select();
    setDeck((prev) => prev.slice(0, -1));
    setDrawn((prev) => [...prev, next]);
  }, [deck, drawn]);

  const reset = useCallback(() => {
    haptic('success');
    setRuleset(rollRuleset());
    setDeck(fullDeck());
    setDrawn([]);
  }, []);

  const dealer = at(players, drawn.length);
  const ruleList = useMemo(() => RANKS.map((rank) => ({ rank, rule: ruleset[rank] })), [ruleset]);

  return (
    <GameFrame
      status={t('games.kings-cup.left', { n: deck.length })}
      chips={
        <>
          <Chip tone={kings >= 3 ? 'accent' : 'warn'}>👑 {kings}/4</Chip>
          <button type="button" onClick={() => setShowRules((v) => !v)}>
            <Chip>📖</Chip>
          </button>
        </>
      }
      hint={t('games.kings-cup.rules')}
      actions={
        deck.length === 0 ? (
          <Button variant="primary" size="xl" full glow onClick={reset}>
            {t('games.kings-cup.newDeck')}
          </Button>
        ) : (
          <>
            <Button variant="primary" size="xl" full glow onClick={draw}>
              🃏 {t('games.kings-cup.draw')}
            </Button>
            {drawn.length > 0 && (
              <Button variant="ghost" size="sm" full onClick={reset}>
                {t('games.kings-cup.reshuffle')}
              </Button>
            )}
          </>
        )
      }
    >
      <AnimatePresence initial={false}>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="glass rounded-2xl p-4">
              <p className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-amber">
                {t('games.kings-cup.tonightsRules')}
              </p>
              <ul className="flex flex-col gap-1 text-sm">
                {ruleList.map(({ rank, rule: r }) => (
                  <li key={rank} className="flex gap-2">
                    <span className="w-7 shrink-0 font-display font-bold text-amber">{rank}</span>
                    <span className="text-muted">{r ? loc(r.title) : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!card ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            👑
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.kings-cup.ready')}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.kings-cup.readyNote')}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5">
          <FlippingCard card={card} className="w-28" />
          <motion.div
            key={`${card.rank}${card.suit}-rule`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass w-full rounded-[2rem] px-6 py-6 text-center ${finalKing ? 'ring-glow' : ''}`}
          >
            <p className="font-display text-xs uppercase tracking-[0.25em] text-amber">
              {rule ? loc(rule.title) : ''}
            </p>
            <p className="mt-2 font-display text-xl leading-snug text-balance">
              {rule ? loc(rule.text) : ''}
            </p>
            {finalKing && (
              <p className="mt-3 font-display text-2xl text-rose">
                {t('games.kings-cup.fourthKing')}
              </p>
            )}
            {dealer && (
              <p className="mt-3 text-xs text-muted">
                {t('games.kings-cup.nextUp', { name: label(dealer, '') })}
              </p>
            )}
          </motion.div>
        </div>
      )}

      {deck.length === 0 && (
        <p className="mt-4 text-center font-display text-lg text-amber">
          {t('games.kings-cup.deckDone')}
        </p>
      )}
    </GameFrame>
  );
}
