import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { GameFrame, NeedPlayers, Stepper } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { GOVERNOR_RULES } from './deck';

const TARGET = 21;

interface NumberRule {
  number: number;
  text: string;
}

/**
 * The table counts out loud; the phone is the referee that remembers what 7
 * means now. Tapping is one thumb on the big number, which is all anyone can
 * manage by the third rule.
 */
type Phase = 'count' | 'newRule';

export default function CheersGovernor({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(GOVERNOR_RULES, adult);
  const [count, setCount] = useState(1);
  const [rules, setRules] = useState<NumberRule[]>([]);
  const [phase, setPhase] = useState<Phase>('count');
  const [ruleNumber, setRuleNumber] = useState(7);
  const [ruleText, setRuleText] = useState('');
  const [busts, setBusts] = useState(0);

  const ruleFor = useCallback(
    (n: number): NumberRule | undefined => rules.find((r) => r.number === n),
    [rules],
  );

  const bump = useCallback(() => {
    if (count >= TARGET) return;
    haptic('tap');
    const next = count + 1;
    if (next === TARGET) {
      haptic('heavy');
      sfx.boom();
      setCount(TARGET);
      setPhase('newRule');
      setRuleText('');
      return;
    }
    if (ruleFor(next)) sfx.select();
    else sfx.tick();
    setCount(next);
  }, [count, ruleFor]);

  const bust = useCallback(() => {
    haptic('fail');
    sfx.bad();
    setBusts((n) => n + 1);
    setCount(1);
  }, []);

  const addRule = useCallback(() => {
    const text = ruleText.trim() || (pile.card ? loc(pile.card.text) : '');
    if (!text) return;
    haptic('success');
    sfx.good();
    setRules((prev) => [...prev.filter((r) => r.number !== ruleNumber), { number: ruleNumber, text }]);
    setCount(1);
    setPhase('count');
    pile.draw();
  }, [loc, pile, ruleNumber, ruleText]);

  if (players.length < 4) {
    return (
      <NeedPlayers
        emoji="🎩"
        message={t('games.cheers-governor.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const active = ruleFor(count);

  return (
    <GameFrame
      status={t('games.cheers-governor.rulesInPlay', { n: rules.length })}
      chips={busts > 0 ? <Chip tone="warn">💥 {busts}</Chip> : undefined}
      hint={t('games.cheers-governor.rules')}
      actions={
        phase === 'count' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={bump}>
              {t('games.cheers-governor.nextNumber')}
            </Button>
            <Button variant="danger" size="lg" full onClick={bust}>
              💥 {t('games.cheers-governor.mistake')}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="xl"
            full
            glow
            disabled={!ruleText.trim() && !pile.card}
            onClick={addRule}
          >
            🎩 {t('games.cheers-governor.decree')}
          </Button>
        )
      }
    >
      {phase === 'count' ? (
        <div className="flex flex-1 flex-col">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={bump}
            className={cn(
              'glass flex flex-1 flex-col items-center justify-center gap-2 rounded-[2rem] px-6 py-8',
              active && 'ring-glow',
            )}
          >
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="font-display text-[6rem] leading-none text-gradient tabular-nums"
            >
              {count}
            </motion.span>
            {active ? (
              <span className="max-w-xs text-center font-display text-lg text-amber text-balance">
                {t('games.cheers-governor.insteadOf', { text: active.text })}
              </span>
            ) : (
              <span className="font-display text-sm uppercase tracking-[0.2em] text-muted">
                {t('games.cheers-governor.tapToCount')}
              </span>
            )}
          </motion.button>

          {rules.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
              <AnimatePresence initial={false}>
                {[...rules]
                  .sort((a, b) => a.number - b.number)
                  .map((rule) => (
                    <motion.li
                      key={rule.number}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 rounded-pill bg-white/5 py-1 pl-2 pr-2.5 text-xs"
                    >
                      <span className="font-display font-bold text-amber">{rule.number}</span>
                      <span className="text-muted">{rule.text}</span>
                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="text-center">
            <p className="font-display text-5xl leading-none text-gradient">{TARGET}</p>
            <p className="mt-2 font-display text-xl text-balance">
              {t('games.cheers-governor.reached')}
            </p>
            <p className="mt-1 text-sm text-muted text-balance">
              {t('games.cheers-governor.reachedNote')}
            </p>
          </div>

          <Stepper
            value={ruleNumber}
            min={1}
            max={TARGET - 1}
            onChange={setRuleNumber}
            unit={t('games.cheers-governor.numberUnit')}
          />

          <div>
            <input
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              maxLength={48}
              placeholder={pile.card ? loc(pile.card.text) : ''}
              aria-label={t('games.cheers-governor.rulePlaceholder')}
              className="glass w-full rounded-2xl px-4 py-3 text-base outline-none focus:border-fuchsia/50"
            />
            <button
              type="button"
              onClick={() => {
                haptic('tap');
                pile.draw();
              }}
              className="mt-2 w-full text-center text-xs text-fuchsia"
            >
              {t('games.cheers-governor.suggestAnother')}
            </button>
          </div>
        </div>
      )}
    </GameFrame>
  );
}
