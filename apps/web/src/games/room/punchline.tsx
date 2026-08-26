import type { RoomViewProps } from './types';
import { WriteHost, WritePhone } from './write';

export function Host(props: RoomViewProps) {
  return <WriteHost {...props} ns="punchline" />;
}

export function Phone(props: RoomViewProps) {
  return <WritePhone {...props} ns="punchline" />;
}
