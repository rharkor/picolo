import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ROOM_CODE_LENGTH, isValidRoomCode, normalizeRoomCode } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { useRoom, useSelfPlayer } from '@/net/room';
import { AVATARS } from '@/store/party';
import { useSettings } from '@/store/settings';

export function JoinRoom() {
  const { code: codeParam } = useParams();
  const { t, tRaw } = useI18n();
  const locale = useSettings((s) => s.locale);
  const { status, state, error, join, resume, leave, clearError } = useRoom();
  const self = useSelfPlayer();

  const [code, setCode] = useState(normalizeRoomCode(codeParam ?? ''));
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  // A phone that reloads mid-party gets its seat back automatically. Only a
  // player seat, and only in the room this link points at.
  useEffect(() => {
    if (status === 'idle') resume('player', codeParam);
  }, [status, resume, codeParam]);

  const connected = Boolean(state) && (status === 'open' || status === 'reconnecting');

  if (connected && state) {
    return (
      <Screen>
        <TopBar
          title={state.code}
          back={false}
          right={
            <Button variant="ghost" size="sm" onClick={leave}>
              {t('room.leave')}
            </Button>
          }
        />

        {status === 'reconnecting' && (
          <p className="mb-4 rounded-2xl border border-amber/30 bg-amber/10 p-3 text-center text-sm text-amber">
            {t('room.reconnecting')}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass ring-glow flex flex-col items-center gap-3 rounded-card p-8 text-center"
        >
          <span className="text-5xl" aria-hidden>
            {self?.avatar ?? '🎉'}
          </span>
          <h2 className="text-2xl">{t('room.joined')}</h2>
          {self && <p className="text-muted">{t('room.youAre', { name: self.name })}</p>}
          {self?.isHost && <Chip tone="accent">★ {t('room.hostTitle')}</Chip>}
        </motion.div>

        <p className="mt-6 text-center text-sm text-muted">{t('room.waitingForHost')}</p>

        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {state.players.map((player) => (
            <li
              key={player.id}
              className={cn(
                'flex items-center gap-1.5 rounded-pill bg-white/5 py-1.5 pl-2 pr-3 text-sm',
                !player.connected && 'opacity-50',
              )}
            >
              <span aria-hidden>{player.avatar}</span>
              <span className="font-semibold">{player.name}</span>
            </li>
          ))}
        </ul>
      </Screen>
    );
  }

  const canJoin = isValidRoomCode(code) && name.trim().length > 0;

  return (
    <Screen>
      <TopBar title={t('room.joinTitle')} subtitle={t('room.joinSubtitle')} />

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
        {t('room.codeLabel')}
      </label>
      <input
        value={code}
        onChange={(e) => {
          setCode(normalizeRoomCode(e.target.value));
          clearError();
        }}
        placeholder={t('room.codePlaceholder')}
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        maxLength={ROOM_CODE_LENGTH}
        className="glass w-full rounded-2xl px-4 py-4 text-center font-display text-4xl tracking-[0.4em] uppercase outline-none placeholder:text-muted/40 focus:border-fuchsia/50"
      />

      <label className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {t('room.yourName')}
      </label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clearError();
        }}
        maxLength={16}
        autoComplete="off"
        className="glass w-full rounded-2xl px-4 py-3 text-base outline-none focus:border-fuchsia/50"
      />

      <label className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {t('room.yourAvatar')}
      </label>
      <div className="grid grid-cols-8 gap-2">
        {AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              haptic('tap');
              setAvatar(emoji);
            }}
            aria-pressed={avatar === emoji}
            className={cn(
              'grid aspect-square place-items-center rounded-xl text-xl transition-colors',
              avatar === emoji ? 'bg-gradient-to-br from-violet to-fuchsia' : 'bg-white/5',
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose">{tRaw(`room.errors.${error}`)}</p>}

      <Button
        className="mt-6"
        variant="primary"
        size="xl"
        full
        glow
        disabled={!canJoin || status === 'connecting'}
        onClick={() => join(code, name, avatar, locale)}
      >
        {status === 'connecting' ? t('room.connecting') : t('room.joinCta')}
      </Button>
    </Screen>
  );
}
