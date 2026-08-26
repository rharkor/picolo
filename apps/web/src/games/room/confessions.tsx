import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { AuthorPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PickPlayer, PlayerDots, Waiting } from './ui';

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as AuthorPublic | null;
  if (pub?.kind !== 'author') return null;

  const name = (id: string | undefined) => {
    const player = state.players.find((p) => p.id === id);
    return player ? `${player.avatar} ${player.name}` : '';
  };
  const done = pub.phase === 'writing' ? pub.submitted : pub.guessed;
  const waiting = state.players.filter((p) => p.connected && !done.includes(p.id));

  return (
    <HostStage
      kicker={t('games.confessions.roomKicker')}
      title={pub.phase === 'writing' ? pub.prompt : (pub.entry ?? '')}
      chips={
        pub.phase === 'writing' ? (
          <Chip tone="accent">🕯️</Chip>
        ) : (
          <Chip tone="warn">
            {pub.index} / {pub.total}
          </Chip>
        )
      }
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
              {pub.index >= pub.total
                ? t('games.confessions.finish')
                : t('games.confessions.nextConfession')}
            </Button>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('room.game.revealNow')}
            </Button>
          )
        ) : undefined
      }
    >
      {pub.phase === 'reveal' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <p className="font-display text-4xl text-gradient text-balance md:text-5xl">
            {t('games.confessions.itWas', { name: name(pub.author) })}
          </p>
          {(pub.correct?.length ?? 0) > 0 ? (
            <p className="text-lg text-muted text-balance">
              {t('games.confessions.gotIt', {
                names: (pub.correct ?? []).map((id) => name(id)).join(' · '),
              })}
            </p>
          ) : (
            <p className="text-lg text-lime text-balance">{t('games.confessions.nobodyGotIt')}</p>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <PlayerDots players={state.players} done={done} />
          <Waiting
            label={t('room.game.waitingFor', {
              n: waiting.length,
              names: waiting.map((p) => p.name).join(', '),
            })}
          />
        </div>
      )}
    </HostStage>
  );
}

export function Phone({ state, self, privateState, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as AuthorPublic | null;
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const index = pub?.kind === 'author' ? pub.index : 0;

  useEffect(() => setPicked(null), [index]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    haptic('select');
    action('submit', text);
  }, [action, draft]);

  const guess = useCallback(
    (id: string) => {
      haptic('select');
      setPicked(id);
      action('guess', id);
    },
    [action],
  );

  if (pub?.kind !== 'author') return null;
  const me = self?.id ?? '';

  if (pub.phase === 'writing') {
    if (pub.submitted.includes(me)) {
      return (
        <PhonePanel kicker={t('games.confessions.roomKicker')} hint={t('room.game.sent')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.confessions.roomKicker')}
        title={pub.prompt}
        hint={t('games.confessions.writeHint')}
      >
        <div className="flex flex-col gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={180}
            rows={4}
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

  // The server tells the author privately, so a reload cannot lose track of it.
  const isMine = (privateState as { yours?: boolean } | null)?.yours === true;

  if (pub.phase === 'reveal') {
    const author = state.players.find((p) => p.id === pub.author);
    return (
      <PhonePanel kicker={t('games.confessions.roomKicker')} hint={t('room.game.lookUp')}>
        <p className="text-center font-display text-3xl text-gradient">
          {author ? `${author.avatar} ${author.name}` : ''}
        </p>
      </PhonePanel>
    );
  }

  if (isMine) {
    return (
      <PhonePanel
        kicker={t('games.confessions.roomKicker')}
        title={t('games.confessions.thisIsYours')}
        hint={t('games.confessions.keepQuiet')}
      >
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  if (pub.guessed.includes(me)) {
    return (
      <PhonePanel kicker={t('games.confessions.roomKicker')} hint={t('room.game.voteLocked')}>
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.confessions.roomKicker')}
      title={pub.entry ?? ''}
      hint={t('games.confessions.whoWroteIt')}
    >
      <PickPlayer
        players={state.players}
        selected={picked}
        onPick={guess}
        disabledIds={me ? [me] : []}
      />
    </PhonePanel>
  );
}
