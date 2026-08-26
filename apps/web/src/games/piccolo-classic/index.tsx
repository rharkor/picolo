import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { at, fillNames, label } from '@/games/_kit/players';
import { CardFace, GameFrame, SwipeCard } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { CLASSIC_DECK, type ClassicKind } from './deck';

/**
 * The endless deck. Three separate piles by intensity, and the night decides
 * which one it draws from: chill early, mostly party in the middle, mostly wild
 * once you are twenty cards deep. Keeping them as three piles rather than one
 * filtered deck means the escalation never runs out of cards at either end.
 */
const PILES = {
  chill: CLASSIC_DECK.filter((c) => c.intensity === 'chill'),
  party: CLASSIC_DECK.filter((c) => c.intensity === 'party'),
  wild: CLASSIC_DECK.filter((c) => c.intensity === 'wild'),
} as const;

type Source = keyof typeof PILES;

/** Cumulative weights per stage, in chill / party / wild order. */
const STAGES: { until: number; stage: string; weights: [number, number, number] }[] = [
  { until: 6, stage: 'warmup', weights: [0.6, 1, 1] },
  { until: 16, stage: 'party', weights: [0.15, 0.8, 1] },
  { until: Infinity, stage: 'chaos', weights: [0.05, 0.45, 1] },
];

const KIND_STYLE: Record<ClassicKind, { emoji: string; tone: string }> = {
  sip: { emoji: '🫗', tone: 'text-cyan' },
  give: { emoji: '🤝', tone: 'text-lime' },
  challenge: { emoji: '🔥', tone: 'text-rose' },
  rule: { emoji: '📜', tone: 'text-amber' },
  vote: { emoji: '👉', tone: 'text-orange' },
  duel: { emoji: '⚔️', tone: 'text-fuchsia' },
  group: { emoji: '🎉', tone: 'text-violet' },
  never: { emoji: '🙈', tone: 'text-indigo' },
};

interface ActiveRule {
  key: string;
  text: string;
}

export default function PiccoloClassic({ players, adult, onExit }: LocalGameProps) {
  const { t, tRaw, loc, locale } = useI18n();
  const chill = usePile(PILES.chill, adult, false);
  const party = usePile(PILES.party, adult, false);
  const wild = usePile(PILES.wild, adult, false);
  const piles = { chill, party, wild };

  const [round, setRound] = useState(0);
  const [source, setSource] = useState<Source | null>(null);
  const [rules, setRules] = useState<ActiveRule[]>([]);
  const [showRules, setShowRules] = useState(false);

  const stage = STAGES.find((s) => round < s.until) ?? STAGES[STAGES.length - 1];

  const draw = useCallback(() => {
    haptic('select');
    sfx.select();
    const [chillCut = 1, partyCut = 1] = stage?.weights ?? [];
    const roll = Math.random();
    const wanted: Source = roll < chillCut ? 'chill' : roll < partyCut ? 'party' : 'wild';
    // A pile can be empty once 18+ is off, so fall through to whatever is left.
    const order: Source[] = [wanted, 'party', 'chill', 'wild'];
    const picked = order.find((key) => piles[key].size > 0);
    if (!picked) return;
    piles[picked].draw();
    setSource(picked);
    setRound((n) => n + 1);
  }, [piles, stage]);

  const card = source ? piles[source].card : undefined;

  // Names are frozen per card: recomputing on every render would reshuffle who
  // the card is pointing at while the table is reading it out.
  const text = useMemo(() => {
    if (!card) return '';
    return fillNames(loc(card.text), players, locale, at(players, round - 1));
  }, [card, round, players, locale, loc]);

  const keepRule = useCallback(() => {
    if (!card) return;
    haptic('success');
    setRules((prev) => [...prev, { key: `${card.id}-${round}`, text }]);
    draw();
  }, [card, draw, round, text]);

  const liftRule = useCallback((key: string) => {
    haptic('tap');
    setRules((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const dealer = at(players, round - 1);
  const style = card ? KIND_STYLE[card.kind] : null;

  return (
    <GameFrame
      status={t('game.round', { n: round + (card ? 0 : 1) })}
      chips={
        <>
          <Chip tone={stage?.stage === 'chaos' ? 'accent' : 'warn'}>
            {tRaw(`games.piccolo-classic.stage.${stage?.stage ?? 'warmup'}`)}
          </Chip>
          <button type="button" onClick={() => setShowRules((v) => !v)}>
            <Chip>📜 {rules.length}</Chip>
          </button>
        </>
      }
      hint={t('games.piccolo-classic.rules')}
      actions={
        !card ? (
          <Button variant="primary" size="xl" full glow onClick={draw}>
            {t('games.piccolo-classic.deal')}
          </Button>
        ) : card.kind === 'rule' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={keepRule}>
              📜 {t('games.piccolo-classic.keepRule')}
            </Button>
            <Button variant="ghost" size="sm" full onClick={draw}>
              {t('games.piccolo-classic.skipRule')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={draw}>
            {t('games.piccolo-classic.nextCard')}
          </Button>
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
                {t('games.piccolo-classic.activeRules')}
              </p>
              {rules.length === 0 ? (
                <p className="text-sm text-muted">{t('games.piccolo-classic.noRules')}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {rules.map((rule) => (
                    <li key={rule.key} className="flex items-start gap-2 text-sm">
                      <span className="flex-1">{rule.text}</span>
                      <button
                        type="button"
                        onClick={() => liftRule(rule.key)}
                        className="shrink-0 rounded-pill bg-white/5 px-2 py-0.5 text-xs text-muted"
                      >
                        {t('games.piccolo-classic.lift')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!card ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🍸
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.piccolo-classic.ready')}
          </p>
          <p className="max-w-xs text-muted text-balance">
            {t('games.piccolo-classic.readyNote')}
          </p>
          {players.length === 0 && (
            <button type="button" onClick={onExit} className="text-xs text-fuchsia">
              {t('game.addPlayersHint')}
            </button>
          )}
        </div>
      ) : (
        <SwipeCard cardKey={`${card.id}-${round}`} onNext={draw}>
          <CardFace
            kicker={`${style?.emoji ?? ''} ${tRaw(`games.piccolo-classic.kind.${card.kind}`)}`}
            tone={cn(style?.tone)}
            text={text}
            adult={card.adult}
          >
            {dealer && (
              <p className="text-sm text-muted">
                {t('games.piccolo-classic.dealer', { name: label(dealer, '') })}
              </p>
            )}
          </CardFace>
        </SwipeCard>
      )}
    </GameFrame>
  );
}
