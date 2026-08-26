import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { RankPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PlayerDots, Waiting } from './ui';

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as RankPublic | null;
  if (pub?.kind !== 'rank') return null;

  const waiting = state.players.filter((p) => p.connected && !pub.submitted.includes(p.id));
  const order = pub.phase === 'reveal' ? (pub.consensus ?? []) : pub.items.map((_, i) => i);

  return (
    <HostStage
      kicker={t('games.rank-it.roomKicker')}
      title={pub.title}
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
                {t('games.rank-it.nextSet')}
              </Button>
              <Button variant="surface" size="lg" full onClick={() => action('finish')}>
                {t('room.game.finalScores')}
              </Button>
            </div>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('room.game.revealNow')}
            </Button>
          )
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <ol className="flex flex-col gap-2">
          {order.map((index, position) => (
            <motion.li
              key={index}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: position * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3"
            >
              <span className="w-6 shrink-0 font-display text-muted">{position + 1}</span>
              <span className="font-display text-xl md:text-2xl">{pub.items[index]}</span>
            </motion.li>
          ))}
        </ol>

        {pub.phase === 'ranking' ? (
          <>
            <PlayerDots players={state.players} done={pub.submitted} />
            <Waiting
              label={t('room.game.waitingFor', {
                n: waiting.length,
                names: waiting.map((p) => p.name).join(', '),
              })}
            />
          </>
        ) : (
          <p className="text-center font-display text-xl text-gradient text-balance">
            {(pub.scores ?? [])
              .sort((a, b) => b.points - a.points)
              .map((row) => {
                const player = state.players.find((p) => p.id === row.id);
                return `${player?.name ?? ''} +${row.points}`;
              })
              .join(' · ')}
          </p>
        )}
      </div>
    </HostStage>
  );
}

export function Phone({ state, self, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as RankPublic | null;
  const [order, setOrder] = useState<number[]>([]);
  const round = pub?.kind === 'rank' ? pub.round : 0;
  const size = pub?.kind === 'rank' ? pub.items.length : 0;

  // Arrows rather than drag-and-drop: a five-item list is quicker to nudge than
  // to drag on a phone, and it cannot be fumbled while scrolling.
  useEffect(() => {
    setOrder(Array.from({ length: size }, (_, i) => i));
  }, [round, size]);

  const move = useCallback((from: number, to: number) => {
    if (to < 0) return;
    haptic('tap');
    setOrder((prev) => {
      if (to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      if (item === undefined) return prev;
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    haptic('select');
    action('submit', order);
  }, [action, order]);

  if (pub?.kind !== 'rank') return null;
  const me = self?.id ?? '';

  if (pub.phase === 'reveal') {
    const mine = (pub.scores ?? []).find((row) => row.id === me);
    return (
      <PhonePanel
        kicker={t('games.rank-it.roomKicker')}
        title={t('games.rank-it.youScored', { n: mine?.points ?? 0 })}
        hint={t('room.game.lookUp')}
      />
    );
  }

  if (pub.submitted.includes(me)) {
    return (
      <PhonePanel kicker={t('games.rank-it.roomKicker')} hint={t('room.game.sent')}>
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.rank-it.roomKicker')}
      title={pub.title}
      hint={t('games.rank-it.orderHint')}
      footer={
        <Button variant="primary" size="xl" full glow onClick={submit}>
          {t('room.game.submit')}
        </Button>
      }
    >
      <ol className="flex flex-col gap-2">
        {order.map((index, position) => (
          <motion.li
            key={index}
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass flex items-center gap-2 rounded-2xl px-3 py-2.5"
          >
            <span className="w-5 shrink-0 font-display text-muted">{position + 1}</span>
            <span className="min-w-0 flex-1 font-display text-sm">{pub.items[index]}</span>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="outline"
                size="sm"
                aria-label={t('games.rank-it.moveUp')}
                disabled={position === 0}
                onClick={() => move(position, position - 1)}
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label={t('games.rank-it.moveDown')}
                disabled={position === order.length - 1}
                onClick={() => move(position, position + 1)}
              >
                ↓
              </Button>
            </div>
          </motion.li>
        ))}
      </ol>
    </PhonePanel>
  );
}
