import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { TapRacePublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, VoteBars } from './ui';

/** Live counts arrive as events; the published list is the final word. */
function useLiveTaps(pub: TapRacePublic | null, event: RoomViewProps['event']) {
  const [live, setLive] = useState<Record<string, number>>({});
  const seq = useRef(0);
  const phase = pub?.phase;

  useEffect(() => {
    if (phase !== 'running') setLive({});
  }, [phase]);

  useEffect(() => {
    if (!event || event.seq === seq.current) return;
    seq.current = event.seq;
    if (event.event === 'go') setLive({});
    if (event.event === 'taps') {
      const payload = event.payload as { id: string; count: number } | undefined;
      if (payload) setLive((prev) => ({ ...prev, [payload.id]: payload.count }));
    }
  }, [event]);

  return live;
}

export function Host({ state, event, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TapRacePublic | null;
  const live = useLiveTaps(pub?.kind === 'tap-race' ? pub : null, event);
  if (pub?.kind !== 'tap-race') return null;

  const rows = state.players.map((player) => ({
    id: player.id,
    label: `${player.avatar} ${player.name}`,
    votes:
      pub.phase === 'running'
        ? (live[player.id] ?? 0)
        : (pub.taps.find((row) => row.id === player.id)?.count ?? 0),
  }));
  const winner = state.players.find((p) => p.id === pub.winner);
  const loser = state.players.find((p) => p.id === pub.loser);
  const best = Math.max(0, ...rows.map((r) => r.votes));
  const worst = Math.min(...rows.map((r) => r.votes));

  return (
    <HostStage
      kicker={t('games.tap-battle.roomKicker')}
      title={
        pub.phase === 'running'
          ? t('games.tap-battle.tapNow')
          : pub.phase === 'reveal'
            ? t('games.tap-battle.winnerIs', { name: winner?.name ?? '' })
            : t('games.tap-battle.readyTitle')
      }
      subtitle={
        pub.phase === 'reveal' && loser && rows.length > 1
          ? t('games.tap-battle.loserDrinks', {
              name: loser.name,
              n: Math.max(1, best - worst),
            })
          : undefined
      }
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'running' ? undefined : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" size="xl" full glow onClick={() => action('go')}>
                👍 {pub.phase === 'reveal' ? t('game.again') : t('room.game.startRound')}
              </Button>
              {pub.phase === 'reveal' && (
                <Button variant="surface" size="lg" full onClick={() => action('finish')}>
                  {t('room.game.finalScores')}
                </Button>
              )}
            </div>
          )
        ) : undefined
      }
    >
      <VoteBars
        rows={[...rows].sort((a, b) => b.votes - a.votes)}
        highlight={pub.winner ? [pub.winner] : []}
      />
    </HostStage>
  );
}

export function Phone({ state, self, event, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as TapRacePublic | null;
  const [count, setCount] = useState(0);
  const sent = useRef(0);
  const phase = pub?.kind === 'tap-race' ? pub.phase : 'ready';

  useEffect(() => {
    if (phase === 'running') {
      setCount(0);
      sent.current = 0;
    }
  }, [phase, event?.seq]);

  // Batched: five updates a second is enough for the bars and a fraction of the
  // traffic of one message per tap.
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = setInterval(() => {
      setCount((current) => {
        if (current > sent.current) {
          sent.current = current;
          action('taps', current);
        }
        return current;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [action, phase]);

  if (pub?.kind !== 'tap-race') return null;
  const mine = pub.taps.find((row) => row.id === self?.id)?.count ?? 0;

  if (phase !== 'running') {
    return (
      <PhonePanel
        kicker={t('games.tap-battle.roomKicker')}
        title={
          phase === 'reveal'
            ? t('games.tap-battle.youScored', { n: mine })
            : t('games.tap-battle.waitForGo')
        }
        hint={t('room.game.lookUp')}
      />
    );
  }

  return (
    <PhonePanel kicker={t('games.tap-battle.roomKicker')} hint={t('games.tap-battle.bothThumbs')}>
      <motion.button
        type="button"
        onPointerDown={() => {
          haptic('tap');
          setCount((n) => n + 1);
        }}
        whileTap={{ scale: 0.98 }}
        className="ring-glow flex flex-1 select-none flex-col items-center justify-center gap-1 rounded-[2rem] bg-gradient-to-br from-lime/30 to-cyan/15"
      >
        <span className="font-display text-[5rem] leading-none tabular-nums text-gradient">
          {count}
        </span>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-muted">
          {t('games.tap-battle.tapTap')}
        </span>
      </motion.button>
    </PhonePanel>
  );
}
