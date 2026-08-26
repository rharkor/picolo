import type { RoomViewProps } from './types';
import { PeoplePollHost, PeoplePollPhone } from './poll';

export function Host(props: RoomViewProps) {
  return <PeoplePollHost {...props} ns="most-likely-to" kicker={true} />;
}

export function Phone(props: RoomViewProps) {
  return <PeoplePollPhone {...props} ns="most-likely-to" />;
}
