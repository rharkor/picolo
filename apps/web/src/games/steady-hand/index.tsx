import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { at, label } from '@/games/_kit/players';
import { GameFrame, Tally } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { randInt } from '@/lib/random';

const W = 100;
const H = 150;

interface Point {
  x: number;
  y: number;
}

/** A zigzag corridor. More corners and a narrower gap on every level. */
function buildWire(level: number): Point[] {
  const corners = 3 + Math.min(level, 6);
  const gap = (H - 20) / corners;
  const points: Point[] = [];
  for (let i = 0; i <= corners; i += 1) {
    const left = i % 2 === 0;
    points.push({
      x: left ? randInt(12, 24) : randInt(76, 88),
      y: 10 + i * gap,
    });
  }
  return points;
}

function toPath(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/** Shortest distance from a point to a polyline, in viewBox units. */
function distanceTo(points: Point[], px: number, py: number): number {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy || 1;
    const tRaw = ((px - a.x) * dx + (py - a.y) * dy) / lengthSq;
    const t = Math.max(0, Math.min(1, tRaw));
    const cx = a.x + t * dx;
    const cy = a.y + t * dy;
    best = Math.min(best, Math.hypot(px - cx, py - cy));
  }
  return best;
}

type Phase = 'ready' | 'tracing' | 'won' | 'lost';

export default function SteadyHand({ players }: LocalGameProps) {
  const { t } = useI18n();
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>('ready');
  const [seed, setSeed] = useState(0);
  const [dot, setDot] = useState<Point | null>(null);
  const [turn, setTurn] = useState(0);
  const [best, setBest] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});

  const wire = useMemo(() => {
    void seed; // a new wire on every attempt
    return buildWire(level);
  }, [level, seed]);

  const tolerance = Math.max(3.4, 9 - level * 0.7);
  const start = wire[0];
  const end = wire[wire.length - 1];
  const player = at(players, turn);

  const fail = useCallback(() => {
    haptic('fail');
    sfx.bad();
    if (player) {
      setSips((prev) => ({ ...prev, [player.id]: (prev[player.id] ?? 0) + level }));
    }
    setPhase('lost');
    setDot(null);
  }, [level, player]);

  const succeed = useCallback(() => {
    haptic('success');
    sfx.good();
    setBest((b) => Math.max(b, level));
    setPhase('won');
    setDot(null);
  }, [level]);

  /** Maps a pointer event onto viewBox coordinates. */
  const locate = useCallback((event: React.PointerEvent<SVGSVGElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * W,
      y: ((event.clientY - box.top) / box.height) * H,
    };
  }, []);

  const onDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (phase !== 'ready' && phase !== 'lost' && phase !== 'won') return;
      const point = locate(event);
      if (!start || Math.hypot(point.x - start.x, point.y - start.y) > tolerance * 2) return;
      primeAudio();
      haptic('select');
      event.currentTarget.setPointerCapture(event.pointerId);
      setDot(point);
      setPhase('tracing');
    },
    [locate, phase, start, tolerance],
  );

  const onMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (phase !== 'tracing') return;
      const point = locate(event);
      setDot(point);
      if (distanceTo(wire, point.x, point.y) > tolerance) {
        fail();
        return;
      }
      if (end && Math.hypot(point.x - end.x, point.y - end.y) < tolerance) succeed();
    },
    [end, fail, locate, phase, succeed, tolerance, wire],
  );

  const onUp = useCallback(() => {
    if (phase === 'tracing') fail();
  }, [fail, phase]);

  const nextLevel = useCallback(() => {
    haptic('select');
    setLevel((n) => n + 1);
    setSeed((s) => s + 1);
    setTurn((n) => n + 1);
    setPhase('ready');
  }, []);

  const retry = useCallback(() => {
    haptic('select');
    setSeed((s) => s + 1);
    setTurn((n) => n + 1);
    setPhase('ready');
  }, []);

  const reset = useCallback(() => {
    haptic('select');
    setLevel(1);
    setSeed((s) => s + 1);
    setPhase('ready');
  }, []);

  return (
    <GameFrame
      status={t('games.steady-hand.level', { n: level })}
      chips={
        <>
          {best > 0 && <Chip tone="warn">🏆 {best}</Chip>}
          {level > 1 && (
            <button type="button" onClick={reset}>
              <Chip>↺</Chip>
            </button>
          )}
        </>
      }
      hint={t('games.steady-hand.rules')}
      actions={
        phase === 'won' ? (
          <Button variant="primary" size="xl" full glow onClick={nextLevel}>
            {t('games.steady-hand.harder')}
          </Button>
        ) : phase === 'lost' ? (
          <Button variant="primary" size="xl" full glow onClick={retry}>
            {t('games.steady-hand.retry')}
          </Button>
        ) : undefined
      }
      footer={<Tally players={players} values={sips} />}
    >
      <div className="mb-3 text-center">
        <p className="font-display text-2xl leading-tight text-gradient">
          {label(player, t('game.anyone'))}
        </p>
        <p className="text-xs text-muted">
          {phase === 'tracing'
            ? t('games.steady-hand.keepGoing')
            : phase === 'won'
              ? t('games.steady-hand.clean')
              : phase === 'lost'
                ? t('games.steady-hand.touched', { n: level })
                : t('games.steady-hand.startAtGreen')}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={cn(
            'h-full max-h-[58dvh] w-full touch-none select-none rounded-[2rem] transition-colors',
            phase === 'lost' ? 'bg-rose/10' : phase === 'won' ? 'bg-lime/10' : 'bg-white/[0.03]',
          )}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <path
            d={toPath(wire)}
            stroke="currentColor"
            className="text-violet/25"
            strokeWidth={tolerance * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={toPath(wire)}
            stroke="currentColor"
            className="text-violet"
            strokeWidth={0.7}
            strokeDasharray="2 2"
            fill="none"
          />
          {start && <circle cx={start.x} cy={start.y} r={tolerance * 0.9} fill="var(--color-lime)" fillOpacity={0.8} />}
          {end && <circle cx={end.x} cy={end.y} r={tolerance * 0.9} fill="var(--color-amber)" fillOpacity={0.8} />}
          {dot && (
            <circle cx={dot.x} cy={dot.y} r={2.4} fill="var(--color-text)" />
          )}
        </svg>
      </div>

      {phase === 'won' && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center font-display text-lg text-lime"
        >
          {t('games.steady-hand.passed', { n: level })}
        </motion.p>
      )}
    </GameFrame>
  );
}
