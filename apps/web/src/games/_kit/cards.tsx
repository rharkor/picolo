import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { shuffle } from '@/lib/random';

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Rank = (typeof RANKS)[number];

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
}

export const isRed = (suit: Suit): boolean => suit === '♥' || suit === '♦';

/** A → 1 … K → 13, for higher/lower comparisons. */
export function value(rank: Rank): number {
  return RANKS.indexOf(rank) + 1;
}

export function fullDeck(): PlayingCard[] {
  const out: PlayingCard[] = [];
  for (const suit of SUITS) for (const rank of RANKS) out.push({ suit, rank });
  return shuffle(out);
}

export function cardKey(card: PlayingCard): string {
  return `${card.rank}${card.suit}`;
}

/** A single card face. `size` is a Tailwind text scale for the rank. */
export function CardFront({
  card,
  className,
  size = 'text-5xl',
}: {
  card: PlayingCard;
  className?: string;
  size?: string;
}) {
  return (
    <div
      className={cn(
        'flex aspect-[2/3] select-none flex-col items-center justify-center gap-1 rounded-2xl bg-white shadow-lg',
        isRed(card.suit) ? 'text-rose-600' : 'text-neutral-900',
        className,
      )}
      style={{ color: isRed(card.suit) ? '#d61f4e' : '#14121c' }}
    >
      <span className={cn('font-display font-bold leading-none', size)}>{card.rank}</span>
      <span className={cn('leading-none', size)}>{card.suit}</span>
    </div>
  );
}

/** Face-down card, for the bus and any other reveal-one-at-a-time row. */
export function CardBack({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex aspect-[2/3] items-center justify-center rounded-2xl border border-white/10',
        'bg-[repeating-linear-gradient(45deg,var(--color-violet)_0_6px,var(--color-ink-2)_6px_12px)] opacity-80',
        className,
      )}
    />
  );
}

/** Card that flips in when it changes. */
export function FlippingCard({
  card,
  className,
  size,
}: {
  card: PlayingCard;
  className?: string;
  size?: string;
}) {
  return (
    <motion.div
      key={cardKey(card)}
      initial={{ rotateY: -90, opacity: 0, scale: 0.9 }}
      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      style={{ transformPerspective: 900 }}
      className={className}
    >
      <CardFront card={card} size={size} />
    </motion.div>
  );
}
