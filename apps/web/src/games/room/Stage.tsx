import { Suspense } from 'react';
import { getGame, type Player, type RoomState } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { useI18n } from '@/i18n';
import { ROOM_VIEWS } from './registry';
import { ScoreBoard } from './ui';

/**
 * Renders whichever half of a room game belongs on this device, plus the shared
 * bits around it: the end-of-game scoreboard and the host's way out. A game the
 * server knows but this client does not gets an honest message rather than a
 * blank screen.
 */
export function RoomStage({
  role,
  state,
  self,
  privateState,
  event,
  canDrive,
  action,
  onEnd,
}: {
  role: 'host' | 'phone';
  state: RoomState;
  self: Player | null;
  privateState: unknown;
  event: { event: string; payload?: unknown; seq: number } | null;
  canDrive: boolean;
  action: (action: string, payload?: unknown) => void;
  onEnd: () => void;
}) {
  const { t, loc } = useI18n();
  const meta = state.gameId ? getGame(state.gameId) : undefined;
  const views = state.gameId ? ROOM_VIEWS[state.gameId] : undefined;
  const View = views ? (role === 'host' ? views.host : views.phone) : null;

  if (state.phase === 'results') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-center font-display text-3xl text-gradient">
          {t('room.game.finalScores')}
        </h2>
        <ScoreBoard players={state.players} />
        {canDrive && (
          <Button variant="primary" size="xl" full glow onClick={onEnd}>
            {t('room.game.backToLobby')}
          </Button>
        )}
      </div>
    );
  }

  if (!View) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted text-balance">{t('room.game.viewMissing')}</p>
        {canDrive && (
          <Button variant="danger" onClick={onEnd}>
            {t('room.endGame')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {role === 'host' && meta && (
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg">
            {meta.emoji} {loc(meta.title)}
          </span>
          {canDrive && (
            <Button variant="ghost" size="sm" onClick={onEnd}>
              {t('room.endGame')}
            </Button>
          )}
        </div>
      )}

      <Suspense fallback={<p className="py-16 text-center text-muted">{t('common.loading')}</p>}>
        <View
          state={state}
          self={self}
          privateState={privateState}
          event={event}
          canDrive={canDrive}
          action={action}
        />
      </Suspense>

      {role === 'host' && state.players.some((p) => p.score !== 0) && (
        <ScoreBoard players={state.players} />
      )}
    </div>
  );
}
