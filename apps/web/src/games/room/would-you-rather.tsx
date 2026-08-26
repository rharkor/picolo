import type { RoomViewProps } from './types';
import { OptionPollHost, OptionPollPhone } from './poll';

export function Host(props: RoomViewProps) {
  return <OptionPollHost {...props} ns="would-you-rather" />;
}

export function Phone(props: RoomViewProps) {
  return <OptionPollPhone {...props} ns="would-you-rather" />;
}
