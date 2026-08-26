import { motion, useAnimationControls } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { CardFace, GameFrame, NeedPlayers, Tally } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { randInt } from '@/lib/random';
import type { PartyPlayer } from '@/store/party';
import { ROULETTE_DECK } from './deck';

const SEGMENT_FILL = [
  'var(--color-violet)',
  'var(--color-fuchsia)',
  'var(--color-amber)',
  'var(--color-cyan)',
  'var(--color-rose)',
  'var(--color-lime)',
  'var(--color-orange)',
  'var(--color-indigo)',
];

/** Degrees are measured clockwise from twelve o'clock, where the pointer sits. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slice(cx: number, cy: number, r: number, from: number, to: number): string {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export default function ShotRoulette({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(ROULETTE_DECK, adult, false);
  const controls = useAnimationControls();
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<PartyPlayer | null>(null);
  const [angle, setAngle] = useState(0);
  const [hits, setHits] = useState<Record<string, number>>({});

  const spin = useCallback(async () => {
    if (spinning || players.length === 0) return;
    primeAudio();
    haptic('heavy');
    setSpinning(true);
    setLanded(null);

    // Pick the winner first, then solve for the angle that lands on them. Doing
    // it the other way round means rounding decides who drinks.
    const index = randInt(0, players.length - 1);
    const step = 360 / players.length;
    const jitter = (Math.random() - 0.5) * step * 0.7;
    const turns = randInt(4, 6);
    const target = angle + turns * 360 + (360 - ((index + 0.5) * step + (angle % 360))) + jitter;

    await controls.start({
      rotate: target,
      transition: { duration: 3.4, ease: [0.16, 1, 0.24, 1] },
    });

    setAngle(target);
    const winner = players[index];
    if (winner) {
      setLanded(winner);
      setHits((prev) => ({ ...prev, [winner.id]: (prev[winner.id] ?? 0) + 1 }));
    }
    pile.draw();
    haptic('fail');
    sfx.boom();
    setSpinning(false);
  }, [angle, controls, pile, players, spinning]);

  if (players.length < 2) {
    return (
      <NeedPlayers
        emoji="🎯"
        message={t('games.shot-roulette.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const step = 360 / players.length;
  const card = pile.card;

  return (
    <GameFrame
      status={t('games.shot-roulette.spins', { n: Object.values(hits).reduce((a, b) => a + b, 0) })}
      chips={adult ? <Chip tone="accent">18+</Chip> : undefined}
      hint={t('games.shot-roulette.rules')}
      footer={<Tally players={players} values={hits} unit={t('games.shot-roulette.hitsUnit')} />}
      actions={
        <Button variant="primary" size="xl" full glow disabled={spinning} onClick={() => void spin()}>
          🎯 {spinning ? t('games.shot-roulette.spinning') : t('games.shot-roulette.spin')}
        </Button>
      }
    >
      <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
        {/* Pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-amber" />
        </div>
        <motion.div animate={controls} className="h-full w-full" style={{ rotate: 0 }}>
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_0_40px_rgba(233,53,161,0.35)]">
            {players.map((player, i) => {
              const from = i * step;
              const to = (i + 1) * step;
              const mid = polar(100, 100, 62, from + step / 2);
              return (
                <g key={player.id}>
                  <path
                    d={slice(100, 100, 96, from, to)}
                    fill={SEGMENT_FILL[i % SEGMENT_FILL.length]}
                    fillOpacity={0.85}
                    stroke="rgba(8,7,13,0.6)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={mid.x}
                    y={mid.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={players.length > 10 ? 8 : 10}
                    fill="#0d0b14"
                    fontWeight="700"
                    transform={`rotate(${from + step / 2} ${mid.x} ${mid.y})`}
                  >
                    {player.name.slice(0, 9)}
                  </text>
                </g>
              );
            })}
            <circle cx={100} cy={100} r={14} fill="var(--color-ink)" stroke="rgba(255,255,255,0.15)" />
          </svg>
        </motion.div>
      </div>

      {landed && card ? (
        <motion.div
          key={`${landed.id}-${card.id}`}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="mt-5 flex flex-col"
        >
          <CardFace
            kicker={`🎯 ${landed.avatar} ${landed.name}`}
            tone="text-rose"
            text={loc(card.text)}
            adult={card.adult}
            size="md"
            className="flex-none py-6"
          />
        </motion.div>
      ) : (
        <p className="mt-5 text-center text-muted text-balance">
          {spinning ? t('games.shot-roulette.spinning') : t('games.shot-roulette.readyNote')}
        </p>
      )}
    </GameFrame>
  );
}
