import type { RoomViewProps } from './types';
import { PeoplePollHost, PeoplePollPhone } from './poll';

export function Host(props: RoomViewProps) {
  return <PeoplePollHost {...props} ns="who-in-the-room" kicker={false} />;
}

export function Phone(props: RoomViewProps) {
  return <PeoplePollPhone {...props} ns="who-in-the-room" />;
}
