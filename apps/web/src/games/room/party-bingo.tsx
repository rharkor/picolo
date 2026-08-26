import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BingoPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { sfx } from '@/games/_kit/audio';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, VoteBars } from './ui';

const SIZE = 4;
const CELLS = SIZE * SIZE;

const LINES: number[][] = (() => {
  const out: number[][] = [];
  for (let r = 0; r < SIZE; r += 1) out.push(Array.from({ length: SIZE }, (_, c) => r * SIZE + c));
  for (let c = 0; c < SIZE; c += 1) out.push(Array.from({ length: SIZE }, (_, r) => r * SIZE + c));
  out.push(Array.from({ length: SIZE }, (_, i) => i * SIZE + i));
  out.push(Array.from({ length: SIZE }, (_, i) => i * SIZE + (SIZE - 1 - i)));
  return out;
})();

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as BingoPublic | null;
  if (pub?.kind !== 'bingo') return null;

  const rows = pub.lines
    .map((row) => {
      const player = state.players.find((p) => p.id === row.id);
      return {
        id: row.id,
        label: `${player?.avatar ?? ''} ${player?.name ?? ''}${row.full ? ' 🏆' : ''}`,
        votes: row.lines,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  return (
    <HostStage
      kicker={t('games.party-bingo.roomKicker')}
      title={t('games.party-bingo.roomTitle')}
      subtitle={t('games.party-bingo.roomNote')}
      footer={
        canDrive ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="surface" size="lg" full onClick={() => action('redeal')}>
              {t('games.party-bingo.redeal')}
            </Button>
            <Button variant="surface" size="lg" full onClick={() => action('finish')}>
              {t('room.game.finalScores')}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <VoteBars rows={rows} highlight={pub.lines.filter((r) => r.full).map((r) => r.id)} />
        <ul className="flex flex-col gap-1.5">
          {pub.claims
            .slice()
            .reverse()
            .map((claim, i) => {
              const player = state.players.find((p) => p.id === claim.id);
              return (
                <motion.li
                  key={`${claim.id}-${claim.at}-${i}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-white/5 px-4 py-2 text-sm"
                >
                  {t('games.party-bingo.claimed', {
                    name: player?.name ?? '',
                    n: claim.lines,
                  })}
                </motion.li>
              );
            })}
        </ul>
      </div>
    </HostStage>
  );
}

export function Phone({ privateState, action }: RoomViewProps) {
  const { t } = useI18n();
  const grid = ((privateState as { grid?: string[] } | null)?.grid ?? []).slice(0, CELLS);
  const [marked, setMarked] = useState<boolean[]>(() => Array(CELLS).fill(false));
  const [claimed, setClaimed] = useState(0);

  // A redeal hands out a different grid; the ticks belong to the old one.
  const signature = grid.join('|');
  useEffect(() => {
    setMarked(Array(CELLS).fill(false));
    setClaimed(0);
  }, [signature]);

  const done = useMemo(
    () => LINES.filter((line) => line.every((i) => marked[i] === true)),
    [marked],
  );
  const inLine = useMemo(() => new Set(done.flat()), [done]);
  const full = grid.length === CELLS && marked.every(Boolean);

  useEffect(() => {
    if (done.length > claimed) {
      setClaimed(done.length);
      sfx.good();
      haptic('success');
      action('claim', { lines: done.length, full });
    }
  }, [action, claimed, done.length, full]);

  const toggle = useCallback((index: number) => {
    haptic('tap');
    setMarked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  if (grid.length === 0) {
    return (
      <PhonePanel
        kicker={t('games.party-bingo.roomKicker')}
        hint={t('games.party-bingo.waitingGrid')}
      />
    );
  }

  return (
    <PhonePanel
      kicker={t('games.party-bingo.roomKicker')}
      title={
        done.length > 0
          ? t('games.party-bingo.bingo', { n: done.length })
          : t('games.party-bingo.yourGrid')
      }
      hint={t('games.party-bingo.tapWhenItHappens')}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {grid.map((text, index) => {
          const on = marked[index] === true;
          return (
            <motion.button
              key={`${text}-${index}`}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(index)}
              aria-pressed={on}
              className={cn(
                'flex min-h-[4.5rem] items-center justify-center rounded-xl p-1.5 text-center text-[0.6rem] font-semibold leading-tight',
                on
                  ? inLine.has(index)
                    ? 'bg-gradient-to-br from-fuchsia to-amber text-ink'
                    : 'bg-gradient-to-br from-violet to-fuchsia text-white'
                  : 'glass text-muted',
              )}
            >
              <span className={cn(on && 'line-through decoration-1')}>{text}</span>
            </motion.button>
          );
        })}
      </div>
    </PhonePanel>
  );
}
