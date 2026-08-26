import type { LocalGameProps } from '@/games/types';
import { DARES, TRUTHS } from './deck';
import { TruthDareGame } from './game';

export default function TruthOrDare(props: LocalGameProps) {
  return <TruthDareGame {...props} truths={TRUTHS} dares={DARES} ns="truth-or-dare" />;
}
