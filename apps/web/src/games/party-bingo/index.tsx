import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { dealFrom } from '@/games/_kit/pile';
import { GameFrame } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { BINGO_DECK } from './deck';

const SIZE = 4;
const CELLS = SIZE * SIZE;
const LINE_SIPS = 3;

/** Rows, columns and both diagonals of a 4×4 grid, as index lists. */
const LINES: number[][] = (() => {
  const out: number[][] = [];
  for (let r = 0; r < SIZE; r += 1) out.push(Array.from({ length: SIZE }, (_, c) => r * SIZE + c));
  for (let c = 0; c < SIZE; c += 1) out.push(Array.from({ length: SIZE }, (_, r) => r * SIZE + c));
  out.push(Array.from({ length: SIZE }, (_, i) => i * SIZE + i));
  out.push(Array.from({ length: SIZE }, (_, i) => i * SIZE + (SIZE - 1 - i)));
  return out;
})();

/**
 * One shared grid for the whole table rather than a card each: this runs in the
 * background of a party for two hours, and a single phone left on the table is
 * the only version anyone actually keeps playing.
 */
export default function PartyBingo({ adult }: LocalGameProps) {
  const { t, loc } = useI18n();
  const [grid, setGrid] = useState(() => dealFrom(BINGO_DECK, adult, CELLS));
  const [marked, setMarked] = useState<boolean[]>(() => Array(CELLS).fill(false));

  const done = useMemo(
    () => LINES.filter((line) => line.every((i) => marked[i] === true)),
    [marked],
  );
  const inLine = useMemo(() => new Set(done.flat()), [done]);
  const full = marked.every(Boolean);

  const toggle = useCallback(
    (index: number) => {
      setMarked((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        const before = LINES.filter((line) => line.every((i) => prev[i] === true)).length;
        const after = LINES.filter((line) => line.every((i) => next[i] === true)).length;
        if (after > before) {
          haptic('success');
          sfx.good();
        } else {
          haptic('tap');
        }
        return next;
      });
    },
    [],
  );

  const newCard = useCallback(() => {
    haptic('select');
    setGrid(dealFrom(BINGO_DECK, adult, CELLS));
    setMarked(Array(CELLS).fill(false));
  }, [adult]);

  return (
    <GameFrame
      status={t('games.party-bingo.ticked', { n: marked.filter(Boolean).length, total: CELLS })}
      chips={
        <>
          {done.length > 0 && <Chip tone="warn">🎫 {done.length}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={t('games.party-bingo.rules')}
      actions={
        <Button variant={full ? 'primary' : 'ghost'} size={full ? 'xl' : 'sm'} full glow={full} onClick={newCard}>
          {full ? t('games.party-bingo.freshCard') : t('games.party-bingo.newCard')}
        </Button>
      }
    >
      <AnimatePresence initial={false}>
        {done.length > 0 && (
          <motion.div
            key={full ? 'full' : `lines-${done.length}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="ring-glow mb-4 rounded-2xl bg-gradient-to-r from-fuchsia/25 to-amber/15 px-4 py-3 text-center"
          >
            <p className="font-display text-lg">
              {full
                ? t('games.party-bingo.fullHouse')
                : t('games.party-bingo.bingo', { n: done.length })}
            </p>
            <p className="text-xs text-muted">
              {t('games.party-bingo.everyoneElse', { n: full ? LINE_SIPS * 2 : LINE_SIPS })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {grid.map((card, index) => {
          const on = marked[index] === true;
          return (
            <motion.button
              key={`${card.id}-${index}`}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(index)}
              aria-pressed={on}
              className={cn(
                'flex items-center justify-center rounded-xl p-1.5 text-center text-[0.6rem] leading-tight transition-colors',
                'min-h-[4.5rem] font-semibold',
                on
                  ? inLine.has(index)
                    ? 'bg-gradient-to-br from-fuchsia to-amber text-ink'
                    : 'bg-gradient-to-br from-violet to-fuchsia text-white'
                  : 'glass text-muted',
              )}
            >
              <span className={cn(on && 'line-through decoration-1')}>{loc(card.text)}</span>
            </motion.button>
          );
        })}
      </div>
    </GameFrame>
  );
}
