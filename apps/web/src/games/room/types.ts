import type { ComponentType } from 'react';
import type { Player, RoomState } from '@piccolo/shared';

/** What every multi-device view gets, whether it renders on the TV or a phone. */
export interface RoomViewProps {
  state: RoomState;
  /** The player this device holds a seat for. Null on a screen-only host. */
  self: Player | null;
  /** Latest `game:private` payload for this device. */
  privateState: unknown;
  action: (action: string, payload?: unknown) => void;
  /** Latest fire-and-forget event, with a counter so repeats still fire. */
  event: { event: string; payload?: unknown; seq: number } | null;
  /** True when this device is also allowed to drive the game forward. */
  canDrive: boolean;
}

export type RoomView = ComponentType<RoomViewProps>;
