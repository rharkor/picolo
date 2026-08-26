import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { WritePublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PlayerDots, Waiting } from './ui';

/**
 * Punchline and Liar Liar share this: a prompt on the television, a keyboard on
 * every phone, then a ballot. The only difference on screen is whether one of
 * the entries is the truth.
 */

export function WriteHost({ state, action, canDrive, ns }: RoomViewProps & { ns: string }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as WritePublic | null;
  if (pub?.kind !== 'write') return null;

  const name = (id: string | undefined) => state.players.find((p) => p.id === id)?.name ?? '';
  const waiting = state.players.filter(
    (p) => p.connected && !(pub.phase === 'writing' ? pub.submitted : pub.voted).includes(p.id),
  );

  return (
    <HostStage
      kicker={tRaw(`games.${ns}.roomKicker`)}
      title={pub.prompt}
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
              {t('room.game.nextPrompt')}
            </Button>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('room.game.revealNow')}
            </Button>
          )
        ) : undefined
      }
    >
      {pub.phase === 'writing' ? (
        <div className="flex flex-col items-center gap-6">
          <PlayerDots players={state.players} done={pub.submitted} />
          <Waiting
            label={t('room.game.waitingFor', {
              n: waiting.length,
              names: waiting.map((p) => p.name).join(', '),
            })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {(pub.entries ?? []).map((entry, i) => {
              const won = pub.winners?.includes(entry.author ?? '') ?? false;
              return (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-5 py-3.5',
                    entry.correct
                      ? 'bg-gradient-to-r from-lime/30 to-transparent'
                      : won
                        ? 'bg-gradient-to-r from-fuchsia/25 to-transparent'
                        : 'bg-white/5',
                  )}
                >
                  <span className="w-6 shrink-0 font-display text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1 font-display text-lg md:text-2xl">
                    {entry.text}
                  </span>
                  {pub.phase === 'reveal' && (
                    <span className="shrink-0 text-sm text-muted">
                      {entry.correct
                        ? t('room.game.theTruth')
                        : `${name(entry.author)} · ${entry.votes ?? 0}`}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
          {pub.phase === 'voting' && (
            <>
              <PlayerDots players={state.players} done={pub.voted} />
              <Waiting
                label={t('room.game.waitingFor', {
                  n: waiting.length,
                  names: waiting.map((p) => p.name).join(', '),
                })}
              />
            </>
          )}
          {pub.phase === 'reveal' && (pub.winners?.length ?? 0) > 0 && (
            <p className="text-center font-display text-2xl text-gradient text-balance">
              {tRaw(`games.${ns}.roomVerdict`, {
                names: (pub.winners ?? []).map((id) => name(id)).join(' · '),
              })}
            </p>
          )}
        </div>
      )}
    </HostStage>
  );
}

export function WritePhone({ state, self, privateState, action, ns }: RoomViewProps & { ns: string }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as WritePublic | null;
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const round = pub?.kind === 'write' ? pub.round : 0;

  // A fresh prompt clears whatever was left in the box.
  useEffect(() => {
    setDraft('');
    setPicked(null);
  }, [round]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    haptic('select');
    action('submit', text);
  }, [action, draft]);

  const vote = useCallback(
    (entryId: string) => {
      haptic('select');
      setPicked(entryId);
      action('vote', entryId);
    },
    [action],
  );

  if (pub?.kind !== 'write') return null;
  const mine = self?.id ?? '';
  const myEntry = (privateState as { mine?: string } | null)?.mine;

  if (pub.phase === 'writing') {
    if (pub.submitted.includes(mine)) {
      return (
        <PhonePanel kicker={tRaw(`games.${ns}.roomKicker`)} title={pub.prompt} hint={t('room.game.sent')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={tRaw(`games.${ns}.roomKicker`)}
        title={pub.prompt}
        hint={tRaw(`games.${ns}.roomWriteHint`)}
      >
        <div className="flex flex-col gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={140}
            rows={3}
            placeholder={t('room.game.writeHere')}
            aria-label={t('room.game.writeHere')}
            className="glass w-full resize-none rounded-2xl px-4 py-3 text-base outline-none focus:border-fuchsia/50"
          />
          <Button
            variant="primary"
            size="lg"
            full
            glow
            disabled={draft.trim().length === 0}
            onClick={send}
          >
            {t('room.game.submit')}
          </Button>
        </div>
      </PhonePanel>
    );
  }

  if (pub.phase === 'voting') {
    if (pub.voted.includes(mine)) {
      return (
        <PhonePanel kicker={tRaw(`games.${ns}.roomKicker`)} hint={t('room.game.voteLocked')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={tRaw(`games.${ns}.roomKicker`)}
        title={pub.prompt}
        hint={tRaw(`games.${ns}.roomVoteHint`)}
      >
        <div className="flex flex-col gap-2">
          {(pub.entries ?? []).map((entry, i) => {
            const isMine = entry.id === myEntry;
            return (
              <button
                key={entry.id}
                type="button"
                disabled={isMine}
                onClick={() => vote(entry.id)}
                className={cn(
                  'glass flex items-start gap-3 rounded-2xl px-4 py-3 text-left',
                  picked === entry.id && 'ring-glow',
                  isMine && 'pointer-events-none opacity-40',
                )}
              >
                <span className="w-5 shrink-0 font-display text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1 font-display">{entry.text}</span>
                {isMine && (
                  <span className="shrink-0 text-xs text-muted">{t('room.game.yours')}</span>
                )}
              </button>
            );
          })}
        </div>
      </PhonePanel>
    );
  }

  return (
    <PhonePanel kicker={tRaw(`games.${ns}.roomKicker`)} hint={t('room.game.lookUp')}>
      <Waiting label={t('room.game.lookUp')} />
    </PhonePanel>
  );
}
