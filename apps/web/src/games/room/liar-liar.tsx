import type { RoomViewProps } from './types';
import { WriteHost, WritePhone } from './write';

export function Host(props: RoomViewProps) {
  return <WriteHost {...props} ns="liar-liar" />;
}

export function Phone(props: RoomViewProps) {
  return <WritePhone {...props} ns="liar-liar" />;
}
