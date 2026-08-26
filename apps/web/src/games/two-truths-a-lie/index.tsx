import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { usePile } from '@/games/_kit/pile';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, PlayerPicker, Tally, TurnBanner } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { THEME_DECK } from './deck';

/** Wrong guessers drink two; a liar nobody catches is the one who drinks. */
const WRONG_SIPS = 2;
const CAUGHT_SIPS = 3;

type Phase = 'invent' | 'guess';

export default function TwoTruthsALie({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(THEME_DECK, adult);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>('invent');
  const [wrong, setWrong] = useState<string[]>([]);
  const [sips, setSips] = useState<Record<string, number>>({});
  const [caught, setCaught] = useState<Record<string, number>>({});

  const liar = at(players, turn);
  const guessers = players.filter((p) => p.id !== liar?.id);

  const resolve = useCallback(() => {
    const everyoneRight = wrong.length === 0;
    haptic(everyoneRight ? 'fail' : 'success');
    setSips((prev) => {
      const next = { ...prev };
      if (everyoneRight) {
        // Nobody bought it — the liar pays for a bad lie.
        if (liar) next[liar.id] = (next[liar.id] ?? 0) + CAUGHT_SIPS;
      } else {
        for (const id of wrong) next[id] = (next[id] ?? 0) + WRONG_SIPS;
      }
      return next;
    });
    if (!everyoneRight && liar) {
      setCaught((prev) => ({ ...prev, [liar.id]: (prev[liar.id] ?? 0) + wrong.length }));
    }
    setWrong([]);
    setTurn((n) => n + 1);
    setPhase('invent');
    pile.draw();
  }, [liar, pile, wrong]);

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="🤥"
        message={t('games.two-truths-a-lie.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  return (
    <GameFrame
      status={t('game.round', { n: turn + 1 })}
      chips={adult ? <Chip tone="accent">18+</Chip> : undefined}
      hint={t('games.two-truths-a-lie.rules')}
      footer={
        <>
          <Tally players={players} values={sips} />
          <Tally players={players} values={caught} unit={t('games.two-truths-a-lie.fooledUnit')} />
        </>
      }
      actions={
        phase === 'invent' ? (
          <>
            <Button
              variant="primary"
              size="xl"
              full
              glow
              onClick={() => {
                haptic('select');
                setPhase('guess');
              }}
            >
              {t('games.two-truths-a-lie.saidIt')}
            </Button>
            <Button variant="ghost" size="sm" full onClick={pile.draw}>
              {t('games.two-truths-a-lie.otherTheme')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={resolve}>
            {wrong.length === 0
              ? t('games.two-truths-a-lie.allRight', { name: liar?.name ?? '', n: CAUGHT_SIPS })
              : t('games.two-truths-a-lie.theyDrink', { count: wrong.length, n: WRONG_SIPS })}
          </Button>
        )
      }
    >
      <div className="mb-5">
        <TurnBanner
          kicker={t('games.two-truths-a-lie.liarIs')}
          name={label(liar, t('game.anyone'))}
        />
      </div>

      {phase === 'invent' ? (
        <motion.div
          key={`invent-${turn}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="ring-glow glass flex flex-1 flex-col justify-center gap-4 rounded-[2rem] px-7 py-8 text-center"
        >
          <span className="font-display text-xs uppercase tracking-[0.25em] text-lime">
            {t('games.two-truths-a-lie.theme')}
          </span>
          <p className="font-display text-3xl leading-snug text-balance">
            {pile.card ? loc(pile.card.text) : ''}
          </p>
          <p className="text-sm text-muted text-balance">
            {t('games.two-truths-a-lie.brief', { name: liar?.name ?? '' })}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={`guess-${turn}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col gap-3"
        >
          <p className="text-center text-sm text-muted text-balance">
            {t('games.two-truths-a-lie.tapWrong')}
          </p>
          <PlayerPicker
            players={guessers}
            selected={wrong}
            onToggle={(id) =>
              setWrong((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
            }
          />
        </motion.div>
      )}
    </GameFrame>
  );
}
