import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GAME_CATALOGUE } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { QrCode } from '@/components/QrCode';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import { fetchConfig, joinUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { useRoom, useSelfPlayer } from '@/net/room';
import { AVATARS } from '@/store/party';
import { useSettings } from '@/store/settings';

export function HostRoom() {
  const { t, tRaw, loc } = useI18n();
  const locale = useSettings((s) => s.locale);
  const adultUnlocked = useSettings((s) => s.adultUnlocked);
  const [params] = useSearchParams();
  const preselected = params.get('game');

  const { status, state, error, host, resume, send, leave, takeSeat, leaveSeat, clearError } =
    useRoom();
  const seat = useSelfPlayer();
  const [publicUrl, setPublicUrl] = useState('');
  const [seatName, setSeatName] = useState('');
  const [seatAvatar, setSeatAvatar] = useState<string>(AVATARS[0]);

  useEffect(() => {
    void fetchConfig().then((config) => setPublicUrl(config?.publicUrl ?? ''));
  }, []);

  // Reclaim the previous room if this screen was reloaded, otherwise open one.
  useEffect(() => {
    if (status !== 'idle') return;
    if (!resume('host')) host(locale, adultUnlocked);
  }, [status, resume, host, locale, adultUnlocked]);

  useEffect(() => {
    if (state && preselected && state.gameId !== preselected) {
      send({ t: 'room:select-game', gameId: preselected });
    }
  }, [state, preselected, send]);

  const roomGames = useMemo(
    () =>
      GAME_CATALOGUE.filter(
        (g) => g.modes.includes('room') && g.status === 'ready' && (adultUnlocked || !g.adult),
      ),
    [adultUnlocked],
  );

  if (!state) {
    return (
      <Screen>
        <TopBar title={t('room.hostTitle')} />
        <p className="py-24 text-center text-muted">
          {error ? tRaw(`room.errors.${error}`) : t('room.creating')}
        </p>
        {error && (
          <Button full variant="primary" onClick={() => host(locale, adultUnlocked)}>
            {t('common.retry')}
          </Button>
        )}
      </Screen>
    );
  }

  const seatError = error === 'name-taken' || error === 'room-full' ? error : null;
  const url = joinUrl(state.code, publicUrl);
  const selected = state.gameId ? GAME_CATALOGUE.find((g) => g.id === state.gameId) : undefined;

  return (
    <Screen wide>
      <TopBar
        title={t('room.hostTitle')}
        subtitle={t('room.playersIn', { count: state.players.length, max: state.maxPlayers })}
        right={
          <Button variant="ghost" size="sm" onClick={leave}>
            {t('common.close')}
          </Button>
        }
      />

      {status === 'reconnecting' && (
        <p className="mb-4 rounded-2xl border border-amber/30 bg-amber/10 p-3 text-center text-sm text-amber">
          {t('room.reconnecting')}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="glass ring-glow flex flex-col items-center gap-4 rounded-card p-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {t('room.codeLabel')}
          </span>
          <p className="font-display text-6xl tracking-[0.25em] text-gradient">{state.code}</p>
          <QrCode value={url} size={200} />
          <div className="text-center text-sm text-muted">
            <p>{t('room.joinAt')}</p>
            <p className="font-mono text-text">{url.replace(/^https?:\/\//, '')}</p>
          </div>
          <p className="text-center text-xs text-muted">{t('room.scanHint')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <section className="glass rounded-card p-5">
            <h2 className="mb-3 text-lg">{t('room.lobby')}</h2>
            {state.players.length === 0 ? (
              <p className="text-sm text-muted">{t('room.waitingForPlayers')}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                <AnimatePresence initial={false}>
                  {state.players.map((player) => (
                    <motion.li
                      key={player.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex items-center gap-2 rounded-pill bg-white/5 py-1.5 pl-2 pr-3"
                    >
                      <span className="text-xl" aria-hidden>
                        {player.avatar}
                      </span>
                      <span className="font-display font-semibold">{player.name}</span>
                      {player.isHost && <Chip tone="accent">★</Chip>}
                      {!player.connected && <Chip tone="warn">…</Chip>}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
            <div className="mt-4 border-t border-line pt-4">
              {seat ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {seat.avatar}
                  </span>
                  <p className="min-w-0 flex-1 text-sm">
                    {t('room.seatedAs', { name: seat.name })}
                  </p>
                  <Button variant="ghost" size="sm" onClick={leaveSeat}>
                    {t('room.leaveSeat')}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="font-display text-sm font-semibold">{t('room.seatTitle')}</p>
                  <p className="mt-0.5 text-xs text-muted">{t('room.seatBody')}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      value={seatName}
                      onChange={(e) => {
                        setSeatName(e.target.value);
                        clearError();
                      }}
                      maxLength={16}
                      autoComplete="off"
                      placeholder={t('room.yourName')}
                      aria-label={t('room.yourName')}
                      className="glass min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-base outline-none focus:border-fuchsia/50"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      disabled={seatName.trim().length === 0}
                      onClick={() => takeSeat(seatName.trim(), seatAvatar)}
                    >
                      {t('room.takeSeat')}
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-8 gap-1.5">
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          haptic('tap');
                          setSeatAvatar(emoji);
                        }}
                        aria-pressed={seatAvatar === emoji}
                        className={cn(
                          'grid aspect-square place-items-center rounded-xl text-lg transition-colors',
                          seatAvatar === emoji
                            ? 'bg-gradient-to-br from-violet to-fuchsia'
                            : 'bg-white/5',
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {seatError && (
                    <p className="mt-2 text-sm text-rose">{tRaw(`room.errors.${seatError}`)}</p>
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">
              {seat ? t('room.hostIsScreenPlaying') : t('room.hostIsScreen')}
            </p>
          </section>

          <section className="glass rounded-card p-5">
            <h2 className="mb-3 text-lg">{t('room.pickGame')}</h2>
            {roomGames.length === 0 ? (
              <p className="text-sm text-muted">{t('room.noRoomGames')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roomGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => send({ t: 'room:select-game', gameId: game.id })}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                      state.gameId === game.id
                        ? 'bg-gradient-to-r from-violet to-fuchsia text-white'
                        : 'bg-white/5 text-muted hover:text-text'
                    }`}
                  >
                    {game.emoji} {loc(game.title)}
                  </button>
                ))}
              </div>
            )}

            <Button
              className="mt-4"
              variant="primary"
              size="lg"
              full
              glow
              disabled={
                !selected ||
                state.players.length < (selected?.minPlayers ?? 99) ||
                state.phase === 'playing'
              }
              onClick={() => send({ t: 'room:start' })}
            >
              {t('room.startGame')}
            </Button>
            {error && !seatError && (
              <p className="mt-2 text-sm text-rose">{tRaw(`room.errors.${error}`)}</p>
            )}
          </section>
        </div>
      </div>
    </Screen>
  );
}
