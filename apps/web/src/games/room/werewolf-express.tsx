import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { WerewolfPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PickPlayer, PlayerDots, Waiting } from './ui';

interface Secret {
  role: 'wolf' | 'seer' | 'villager';
  out: boolean;
  wolves?: string[];
  seerLog?: { name: string; isWolf: boolean }[];
}

const ROLE_EMOJI: Record<string, string> = { wolf: '🐺', seer: '🔮', villager: '🧑‍🌾' };

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t, tRaw } = useI18n();
  const pub = state.public as WerewolfPublic | null;
  if (pub?.kind !== 'werewolf') return null;

  const label = (id: string | undefined | null) => {
    const player = state.players.find((p) => p.id === id);
    return player ? `${player.avatar} ${player.name}` : '';
  };
  const alive = state.players.filter((p) => !pub.out.includes(p.id));
  const waiting = alive.filter(
    (p) =>
      p.connected &&
      !(pub.phase === 'peeking' ? pub.ready : pub.phase === 'voting' ? pub.voted : pub.acted).includes(
        p.id,
      ),
  );

  const title = () => {
    switch (pub.phase) {
      case 'peeking':
        return t('games.werewolf-express.checkRole');
      case 'night':
        return t('games.werewolf-express.nightFalls');
      case 'day':
        return pub.killed
          ? t('games.werewolf-express.wasEaten', { name: label(pub.killed) })
          : t('games.werewolf-express.nobodyDied');
      case 'voting':
        return t('games.werewolf-express.voteNow');
      case 'reveal':
        return pub.ejected
          ? t('games.werewolf-express.wasRole', {
              name: label(pub.ejected),
              role: tRaw(`games.werewolf-express.role.${pub.ejectedRole ?? 'villager'}`),
            })
          : t('games.werewolf-express.deadHeat');
      default:
        return pub.outcome === 'village'
          ? t('games.werewolf-express.villageWins')
          : t('games.werewolf-express.wolvesWin');
    }
  };

  const footer = () => {
    if (!canDrive) return undefined;
    if (pub.phase === 'day') {
      return (
        <Button variant="primary" size="xl" full glow onClick={() => action('to-vote')}>
          🗳️ {t('games.werewolf-express.toTheVote')}
        </Button>
      );
    }
    if (pub.phase === 'night' || pub.phase === 'voting') {
      return (
        <Button variant="surface" size="lg" full onClick={() => action('force')}>
          {t('room.game.revealNow')}
        </Button>
      );
    }
    if (pub.phase === 'reveal') {
      return (
        <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
          🌙 {t('games.werewolf-express.nextNight')}
        </Button>
      );
    }
    if (pub.phase === 'over') {
      return (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="primary" size="xl" full glow onClick={() => action('again')}>
            {t('games.werewolf-express.dealAgain')}
          </Button>
          <Button variant="surface" size="lg" full onClick={() => action('finish')}>
            {t('room.game.finalScores')}
          </Button>
        </div>
      );
    }
    return undefined;
  };

  return (
    <HostStage
      kicker={t('games.werewolf-express.roomKicker')}
      title={title()}
      subtitle={pub.phase === 'night' ? t('games.werewolf-express.nightNote') : undefined}
      chips={
        <>
          <Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>
          <Chip>
            🧑‍🌾 {alive.length}/{state.players.length}
          </Chip>
        </>
      }
      footer={footer()}
    >
      {pub.phase === 'over' ? (
        <ul className="flex flex-col gap-1.5">
          {(pub.reveal ?? []).map((row) => (
            <li
              key={row.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-5 py-3',
                row.role === 'wolf'
                  ? 'bg-gradient-to-r from-rose/25 to-transparent'
                  : 'bg-white/5',
              )}
            >
              <span aria-hidden>{ROLE_EMOJI[row.role] ?? '🧑‍🌾'}</span>
              <span className="min-w-0 flex-1 font-display text-xl">{label(row.id)}</span>
              <span className="text-sm text-muted">
                {tRaw(`games.werewolf-express.role.${row.role}`)}
              </span>
            </li>
          ))}
        </ul>
      ) : pub.phase === 'day' ? (
        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl" aria-hidden>
            ☀️
          </span>
          <p className="text-center text-lg text-muted text-balance">
            {t('games.werewolf-express.dayNote')}
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {alive.map((player) => (
              <li key={player.id} className="rounded-pill bg-white/5 px-3 py-1.5 font-display">
                {player.avatar} {player.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {pub.phase === 'night' && (
            <motion.span
              className="text-6xl"
              aria-hidden
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              🌙
            </motion.span>
          )}
          <PlayerDots
            players={alive}
            done={pub.phase === 'peeking' ? pub.ready : pub.phase === 'voting' ? pub.voted : pub.acted}
          />
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
  const { t, tRaw } = useI18n();
  const pub = state.public as WerewolfPublic | null;
  const secret = privateState as Secret | null;
  const [picked, setPicked] = useState<string | null>(null);
  const phase = pub?.kind === 'werewolf' ? pub.phase : '';
  const round = pub?.kind === 'werewolf' ? pub.round : 0;

  useEffect(() => setPicked(null), [phase, round]);

  const send = useCallback(
    (act: string, id: string) => {
      haptic('select');
      setPicked(id);
      action(act, id);
    },
    [action],
  );

  if (pub?.kind !== 'werewolf') return null;
  const me = self?.id ?? '';
  const role = secret?.role ?? 'villager';
  const isOut = pub.out.includes(me);
  const alive = state.players.filter((p) => !pub.out.includes(p.id));

  const roleCard = (
    <div className="ring-glow glass flex flex-col items-center gap-2 rounded-[2rem] px-6 py-7 text-center">
      <span className="text-5xl" aria-hidden>
        {ROLE_EMOJI[role] ?? '🧑‍🌾'}
      </span>
      <p className="font-display text-2xl text-gradient">
        {tRaw(`games.werewolf-express.youAre.${role}`)}
      </p>
      <p className="text-sm text-muted text-balance">
        {tRaw(`games.werewolf-express.brief.${role}`)}
      </p>
      {role === 'wolf' && (secret?.wolves?.length ?? 0) > 1 && (
        <p className="text-sm text-rose">
          {t('games.werewolf-express.yourPack', {
            names: (secret?.wolves ?? [])
              .filter((id) => id !== me)
              .map((id) => state.players.find((p) => p.id === id)?.name ?? '')
              .join(', '),
          })}
        </p>
      )}
      {(secret?.seerLog?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-1">
          {(secret?.seerLog ?? []).map((entry, i) => (
            <li
              key={`${entry.name}-${i}`}
              className={cn('font-display text-sm', entry.isWolf ? 'text-rose' : 'text-lime')}
            >
              {entry.isWolf
                ? t('games.werewolf-express.isWolf', { name: entry.name })
                : t('games.werewolf-express.notWolf', { name: entry.name })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (isOut) {
    return (
      <PhonePanel
        kicker={t('games.werewolf-express.roomKicker')}
        title={t('games.werewolf-express.youAreOut')}
        hint={t('games.werewolf-express.stayQuiet')}
      >
        {roleCard}
      </PhonePanel>
    );
  }

  if (pub.phase === 'peeking') {
    const ready = pub.ready.includes(me);
    return (
      <PhonePanel
        kicker={t('games.werewolf-express.roomKicker')}
        hint={ready ? t('room.game.waitingOthers') : t('games.werewolf-express.memorise')}
        footer={
          !ready ? (
            <Button
              variant="primary"
              size="xl"
              full
              glow
              onClick={() => {
                haptic('select');
                action('ready');
              }}
            >
              {t('games.werewolf-express.gotIt')}
            </Button>
          ) : undefined
        }
      >
        {roleCard}
      </PhonePanel>
    );
  }

  if (pub.phase === 'night') {
    const acted = pub.acted.includes(me);
    if (role === 'wolf' && !acted) {
      return (
        <PhonePanel
          kicker={t('games.werewolf-express.roomKicker')}
          title={t('games.werewolf-express.chooseVictim')}
          hint={t('games.werewolf-express.wolfHint')}
        >
          <PickPlayer
            players={alive}
            selected={picked}
            onPick={(id) => send('kill', id)}
            disabledIds={(secret?.wolves ?? []).concat(me)}
          />
        </PhonePanel>
      );
    }
    if (role === 'seer' && !acted) {
      return (
        <PhonePanel
          kicker={t('games.werewolf-express.roomKicker')}
          title={t('games.werewolf-express.chooseInspect')}
          hint={t('games.werewolf-express.seerHint')}
        >
          <PickPlayer
            players={alive}
            selected={picked}
            onPick={(id) => send('inspect', id)}
            disabledIds={[me]}
          />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.werewolf-express.roomKicker')}
        title={t('games.werewolf-express.nightFalls')}
        hint={t('games.werewolf-express.eyesClosed')}
      >
        {roleCard}
      </PhonePanel>
    );
  }

  if (pub.phase === 'voting') {
    if (pub.voted.includes(me)) {
      return (
        <PhonePanel kicker={t('games.werewolf-express.roomKicker')} hint={t('room.game.voteLocked')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.werewolf-express.roomKicker')}
        title={t('games.werewolf-express.voteNow')}
        hint={t('games.werewolf-express.voteHint')}
      >
        <PickPlayer
          players={alive}
          selected={picked}
          onPick={(id) => send('vote', id)}
          disabledIds={[me]}
        />
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.werewolf-express.roomKicker')}
      title={
        pub.phase === 'over'
          ? pub.outcome === 'village'
            ? t('games.werewolf-express.villageWins')
            : t('games.werewolf-express.wolvesWin')
          : t('games.werewolf-express.lookUpTitle')
      }
      hint={t('room.game.lookUp')}
    >
      {roleCard}
    </PhonePanel>
  );
}
