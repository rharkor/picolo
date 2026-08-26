import type { LocalGameProps } from '@/games/types';
import { TruthDareGame } from '@/games/truth-or-dare/game';
import { SPICY_DARES, SPICY_TRUTHS } from './deck';

export default function TruthOrDareSpicy(props: LocalGameProps) {
  return (
    <TruthDareGame
      {...props}
      truths={SPICY_TRUTHS}
      dares={SPICY_DARES}
      ns="truth-or-dare-spicy"
    />
  );
}
