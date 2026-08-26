import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, Stepper, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';

const LOSER_SIPS = 5;
const WRONG_SIPS = 1;

/**
 * Hands go on the glass, the caller guesses how many stay. Guess right and you
 * are out — being out is the good ending. The app only tracks who is still in,
 * because counting fingers is what the table is for.
 */
type Phase = 'call' | 'count' | 'result';

export default function Fingers({ players, onExit }: LocalGameProps) {
  const { t } = useI18n();
  const [out, setOut] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>('call');
  const [guess, setGuess] = useState(1);
  const [actual, setActual] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  const active = players.filter((p) => !out.includes(p.id));
  const caller = at(active, turn);
  const correct = phase === 'result' && guess === actual;

  const lockGuess = useCallback(() => {
    haptic('select');
    sfx.select();
    setActual(0);
    setPhase('count');
  }, []);

  const reveal = useCallback(() => {
    const hit = guess === actual;
    haptic(hit ? 'success' : 'fail');
    if (hit) sfx.good();
    else {
      sfx.bad();
      if (caller) {
        setSips((prev) => ({ ...prev, [caller.id]: (prev[caller.id] ?? 0) + WRONG_SIPS }));
      }
    }
    setPhase('result');
  }, [actual, caller, guess]);

  const nextRound = useCallback(() => {
    haptic('select');
    if (correct && caller) {
      const remaining = active.filter((p) => p.id !== caller.id);
      setOut((prev) => [...prev, caller.id]);
      if (remaining.length === 1) {
        const last = remaining[0];
        if (last) {
          setSips((prev) => ({ ...prev, [last.id]: (prev[last.id] ?? 0) + LOSER_SIPS }));
        }
      }
      // Removing the caller shifts everyone down, so the turn index stays put.
    } else {
      setTurn((n) => n + 1);
    }
    setGuess(1);
    setActual(0);
    setPhase('call');
  }, [active, caller, correct]);

  const restart = useCallback(() => {
    haptic('success');
    setOut([]);
    setTurn(0);
    setGuess(1);
    setActual(0);
    setPhase('call');
  }, []);

  if (players.length < 3) {
    return (
      <NeedPlayers
        emoji="🖐️"
        message={t('games.fingers.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const finished = active.length <= 1;
  const survivor = active[0];

  return (
    <GameFrame
      status={t('games.fingers.stillIn', { n: active.length, total: players.length })}
      chips={out.length > 0 ? <Chip tone="warn">✌️ {out.length}</Chip> : undefined}
      hint={t('games.fingers.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        finished ? (
          <Button variant="primary" size="xl" full glow onClick={restart}>
            {t('game.restart')}
          </Button>
        ) : phase === 'call' ? (
          <Button variant="primary" size="xl" full glow onClick={lockGuess}>
            {t('games.fingers.lockIn', { n: guess })}
          </Button>
        ) : phase === 'count' ? (
          <Button variant="primary" size="xl" full glow onClick={reveal}>
            {t('games.fingers.compare')}
          </Button>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={nextRound}>
            {t('games.fingers.nextCaller')}
          </Button>
        )
      }
    >
      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🥴
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.fingers.lastOne', { name: survivor?.name ?? '' })}
          </p>
          <p className="font-display text-xl text-rose">
            {t('games.fingers.finalSips', { n: LOSER_SIPS })}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t('games.fingers.callerIs')}
            </span>
            <p className="font-display text-3xl leading-tight text-gradient">
              {label(caller, t('game.anyone'))}
            </p>
          </div>

          {phase === 'call' && (
            <>
              <p className="text-center text-muted text-balance">
                {t('games.fingers.callPrompt', { n: active.length })}
              </p>
              <Stepper
                value={guess}
                min={0}
                max={active.length}
                onChange={setGuess}
                unit={t('games.fingers.handsUnit')}
              />
            </>
          )}

          {phase === 'count' && (
            <>
              <p className="text-center text-muted text-balance">
                {t('games.fingers.countPrompt')}
              </p>
              <Stepper
                value={actual}
                min={0}
                max={active.length}
                onChange={setActual}
                unit={t('games.fingers.handsUnit')}
              />
              <p className="text-center text-sm text-muted">
                {t('games.fingers.calledIt', { n: guess })}
              </p>
            </>
          )}

          {phase === 'result' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="font-display text-6xl leading-none tabular-nums text-gradient">
                {actual}
              </p>
              <p className="text-muted">{t('games.fingers.calledIt', { n: guess })}</p>
              <p
                className={`mt-2 font-display text-2xl ${correct ? 'text-lime' : 'text-rose'}`}
              >
                {correct
                  ? t('games.fingers.escaped', { name: caller?.name ?? '' })
                  : t('games.fingers.stayed', { name: caller?.name ?? '', n: WRONG_SIPS })}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </GameFrame>
  );
}
