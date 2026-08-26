import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx, tone } from '@/games/_kit/audio';
import { at, label } from '@/games/_kit/players';
import { GameFrame, NeedPlayers, Tally } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { randInt } from '@/lib/random';

const PADS = [
  { emoji: '🍒', freq: 392, on: 'from-rose to-fuchsia' },
  { emoji: '🍋', freq: 494, on: 'from-amber to-orange' },
  { emoji: '🫐', freq: 587, on: 'from-cyan to-indigo' },
  { emoji: '🍇', freq: 659, on: 'from-violet to-fuchsia' },
] as const;

type Phase = 'idle' | 'watch' | 'repeat' | 'extend' | 'fail';

/**
 * Repeat the chain, then add one link and hand the phone on. The chain belongs
 * to the table, not to a player, so a long night builds one absurd sequence
 * everybody is invested in.
 */
export default function MemoryChain({ players, onExit }: LocalGameProps) {
  const { t } = useI18n();
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [flash, setFlash] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [turn, setTurn] = useState(0);
  const [best, setBest] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const player = at(players, turn);

  const playback = useCallback(
    (chain: number[]) => {
      clearTimers();
      setPhase('watch');
      setCursor(0);
      chain.forEach((pad, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setFlash(pad);
            tone({ freq: PADS[pad]?.freq ?? 440, duration: 0.18, type: 'triangle' });
            haptic('tap');
          }, i * 620),
        );
        timers.current.push(window.setTimeout(() => setFlash(null), i * 620 + 380));
      });
      timers.current.push(
        window.setTimeout(() => setPhase('repeat'), chain.length * 620 + 220),
      );
    },
    [clearTimers],
  );

  const beginChain = useCallback(() => {
    primeAudio();
    haptic('select');
    const first = [randInt(0, PADS.length - 1)];
    setSequence(first);
    playback(first);
  }, [playback]);

  const restart = useCallback(() => {
    clearTimers();
    setSequence([]);
    setPhase('idle');
    setCursor(0);
    setFlash(null);
  }, [clearTimers]);

  const press = useCallback(
    (pad: number) => {
      if (phase === 'repeat') {
        tone({ freq: PADS[pad]?.freq ?? 440, duration: 0.14, type: 'triangle' });
        if (sequence[cursor] !== pad) {
          haptic('fail');
          sfx.bad();
          setBest((b) => Math.max(b, sequence.length));
          if (player) {
            setSips((prev) => ({
              ...prev,
              [player.id]: (prev[player.id] ?? 0) + Math.max(1, sequence.length),
            }));
          }
          setPhase('fail');
          return;
        }
        haptic('tap');
        if (cursor + 1 >= sequence.length) {
          setCursor(0);
          setPhase('extend');
          return;
        }
        setCursor((n) => n + 1);
        return;
      }

      if (phase === 'extend') {
        haptic('success');
        sfx.good();
        const grown = [...sequence, pad];
        setSequence(grown);
        setBest((b) => Math.max(b, grown.length));
        setTurn((n) => n + 1);
        timers.current.push(window.setTimeout(() => playback(grown), 700));
      }
    },
    [cursor, phase, playback, player, sequence],
  );

  if (players.length < 2) {
    return (
      <NeedPlayers
        emoji="🧠"
        message={t('games.memory-chain.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  return (
    <GameFrame
      status={t('games.memory-chain.chainLength', { n: sequence.length })}
      chips={best > 0 ? <Chip tone="warn">🏆 {best}</Chip> : undefined}
      hint={t('games.memory-chain.rules')}
      footer={<Tally players={players} values={sips} />}
      actions={
        phase === 'idle' ? (
          <Button variant="primary" size="xl" full glow onClick={beginChain}>
            🧠 {t('games.memory-chain.start')}
          </Button>
        ) : phase === 'fail' ? (
          <Button variant="primary" size="xl" full glow onClick={beginChain}>
            {t('games.memory-chain.newChain')}
          </Button>
        ) : phase === 'watch' ? (
          <Button variant="ghost" size="sm" full onClick={restart}>
            {t('game.restart')}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" full onClick={() => playback(sequence)}>
            {t('games.memory-chain.replay')}
          </Button>
        )
      }
    >
      <div className="mb-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {phase === 'watch'
            ? t('games.memory-chain.watch')
            : phase === 'repeat'
              ? t('games.memory-chain.repeat', { n: cursor + 1, total: sequence.length })
              : phase === 'extend'
                ? t('games.memory-chain.addOne')
                : phase === 'fail'
                  ? t('games.memory-chain.broke')
                  : t('games.memory-chain.readyNote')}
        </span>
        <p className="font-display text-2xl leading-tight text-gradient">
          {label(player, t('game.anyone'))}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-2.5">
        {PADS.map((pad, i) => {
          const active = flash === i;
          const usable = phase === 'repeat' || phase === 'extend';
          return (
            <motion.button
              key={pad.emoji}
              type="button"
              disabled={!usable}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => press(i)}
              className={cn(
                'flex items-center justify-center rounded-[1.75rem] text-5xl transition-all duration-150',
                active
                  ? `bg-gradient-to-br ${pad.on} scale-[1.03] shadow-[0_0_60px_-10px_currentColor]`
                  : 'glass',
                !usable && !active && 'opacity-60',
              )}
            >
              <span aria-hidden>{pad.emoji}</span>
            </motion.button>
          );
        })}
      </div>

      {phase === 'fail' && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center font-display text-lg text-rose text-balance"
        >
          {t('games.memory-chain.failed', {
            name: player?.name ?? '',
            n: Math.max(1, sequence.length),
          })}
        </motion.p>
      )}
    </GameFrame>
  );
}
