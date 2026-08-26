import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { ImpostorPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PickPlayer, PlayerDots, Waiting } from './ui';

interface Secret {
  role: 'civilian' | 'undercover' | 'white';
  word: string | null;
  out: boolean;
}

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t, tRaw } = useI18n();
  const pub = state.public as ImpostorPublic | null;
  if (pub?.kind !== 'impostor') return null;

  const label = (id: string | undefined) => {
    const player = state.players.find((p) => p.id === id);
    return player ? `${player.avatar} ${player.name}` : '';
  };
  const waiting = state.players.filter(
    (p) =>
      p.connected &&
      !pub.out.includes(p.id) &&
      !(pub.phase === 'peeking' ? pub.ready : pub.voted).includes(p.id),
  );

  const footer = () => {
    if (!canDrive) return undefined;
    if (pub.phase === 'clues') {
      return (
        <Button variant="primary" size="xl" full glow onClick={() => action('to-vote')}>
          🗳️ {t('games.impostor.toTheVote')}
        </Button>
      );
    }
    if (pub.phase === 'voting') {
      return (
        <Button variant="surface" size="lg" full onClick={() => action('force')}>
          {t('room.game.revealNow')}
        </Button>
      );
    }
    if (pub.phase === 'reveal') {
      if (pub.whiteGuess) {
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="primary" size="lg" full glow onClick={() => action('white-right')}>
              {t('games.impostor.whiteRight')}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => action('white-wrong')}>
              {t('games.impostor.whiteWrong')}
            </Button>
          </div>
        );
      }
      return (
        <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
          {t('games.impostor.keepGoing')}
        </Button>
      );
    }
    if (pub.phase === 'over') {
      return (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="primary" size="xl" full glow onClick={() => action('again')}>
            {t('games.impostor.dealAgain')}
          </Button>
          <Button variant="surface" size="lg" full onClick={() => action('finish')}>
            {t('room.game.finalScores')}
          </Button>
        </div>
      );
    }
    return undefined;
  };

  const title =
    pub.phase === 'peeking'
      ? t('games.impostor.checkYourWord')
      : pub.phase === 'clues'
        ? t('games.impostor.oneWordEach')
        : pub.phase === 'voting'
          ? t('games.impostor.voteNow')
          : pub.phase === 'reveal'
            ? pub.tie
              ? t('games.impostor.deadHeat')
              : t('games.impostor.wasRole', {
                  name: label(pub.ejected),
                  role: tRaw(`games.impostor.role.${pub.ejectedRole ?? 'civilian'}`),
                })
            : pub.outcome === 'civilians'
              ? t('games.impostor.civiliansWin')
              : t('games.impostor.impostorsWin');

  return (
    <HostStage
      kicker={t('games.impostor.roomKicker')}
      title={title}
      chips={
        <>
          <Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>
          <Chip>
            🙂 {state.players.length - pub.out.length}/{state.players.length}
          </Chip>
        </>
      }
      footer={footer()}
    >
      {pub.phase === 'clues' && (
        <ol className="flex flex-col gap-2">
          {pub.clueOrder.map((id, i) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3"
            >
              <span className="w-6 shrink-0 font-display text-muted">{i + 1}</span>
              <span className="font-display text-xl md:text-2xl">{label(id)}</span>
            </motion.li>
          ))}
        </ol>
      )}

      {(pub.phase === 'peeking' || pub.phase === 'voting') && (
        <div className="flex flex-col items-center gap-6">
          <PlayerDots
            players={state.players.filter((p) => !pub.out.includes(p.id))}
            done={pub.phase === 'peeking' ? pub.ready : pub.voted}
          />
          <Waiting
            label={t('room.game.waitingFor', {
              n: waiting.length,
              names: waiting.map((p) => p.name).join(', '),
            })}
          />
        </div>
      )}

      {pub.phase === 'reveal' && pub.whiteGuess && (
        <p className="text-center text-lg text-muted text-balance">
          {t('games.impostor.whiteGuessNote')}
        </p>
      )}

      {pub.phase === 'over' && pub.words && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-display text-2xl">
            {t('games.impostor.theWords', {
              civilian: pub.words.civilian,
              undercover: pub.words.undercover,
            })}
          </p>
        </div>
      )}
    </HostStage>
  );
}

export function Phone({ state, self, privateState, action }: RoomViewProps) {
  const { t, tRaw } = useI18n();
  const pub = state.public as ImpostorPublic | null;
  const secret = privateState as Secret | null;
  const [picked, setPicked] = useState<string | null>(null);
  const round = pub?.kind === 'impostor' ? pub.round : 0;

  useEffect(() => setPicked(null), [round, pub?.phase]);

  const vote = useCallback(
    (id: string) => {
      haptic('select');
      setPicked(id);
      action('vote', id);
    },
    [action],
  );

  if (pub?.kind !== 'impostor') return null;
  const me = self?.id ?? '';
  const isOut = pub.out.includes(me);

  const wordCard = secret ? (
    <div
      className={cn(
        'ring-glow glass flex flex-col items-center gap-2 rounded-[2rem] px-6 py-7 text-center',
        secret.role === 'white' && 'bg-gradient-to-br from-white/10 to-transparent',
      )}
    >
      {secret.role === 'white' ? (
        <>
          <span className="text-5xl" aria-hidden>
            🕳️
          </span>
          <p className="font-display text-2xl text-gradient">{t('games.impostor.youAreWhite')}</p>
          <p className="text-sm text-muted text-balance">{t('games.impostor.whiteBrief')}</p>
        </>
      ) : (
        <>
          <span className="font-display text-xs uppercase tracking-[0.25em] text-cyan">
            {t('games.impostor.yourWord')}
          </span>
          <p className="font-display text-3xl leading-tight text-balance">{secret.word}</p>
        </>
      )}
    </div>
  ) : null;

  if (isOut) {
    return (
      <PhonePanel
        kicker={t('games.impostor.roomKicker')}
        title={t('games.impostor.youAreOut')}
        hint={t('room.game.lookUp')}
      >
        {wordCard}
      </PhonePanel>
    );
  }

  if (pub.phase === 'peeking') {
    const ready = pub.ready.includes(me);
    return (
      <PhonePanel
        kicker={t('games.impostor.roomKicker')}
        hint={ready ? t('room.game.waitingOthers') : t('games.impostor.memoriseIt')}
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
              {t('games.impostor.gotIt')}
            </Button>
          ) : undefined
        }
      >
        {wordCard}
      </PhonePanel>
    );
  }

  if (pub.phase === 'voting') {
    if (pub.voted.includes(me)) {
      return (
        <PhonePanel kicker={t('games.impostor.roomKicker')} hint={t('room.game.voteLocked')}>
          <Waiting label={t('room.game.waitingOthers')} />
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.impostor.roomKicker')}
        title={t('games.impostor.voteNow')}
        hint={t('games.impostor.voteHint')}
      >
        <PickPlayer
          players={state.players.filter((p) => !pub.out.includes(p.id))}
          selected={picked}
          onPick={vote}
          disabledIds={me ? [me] : []}
        />
      </PhonePanel>
    );
  }

  if (pub.phase === 'reveal' || pub.phase === 'over') {
    return (
      <PhonePanel
        kicker={t('games.impostor.roomKicker')}
        title={
          pub.phase === 'over'
            ? pub.outcome === 'civilians'
              ? t('games.impostor.civiliansWin')
              : t('games.impostor.impostorsWin')
            : pub.tie
              ? t('games.impostor.deadHeat')
              : tRaw(`games.impostor.role.${pub.ejectedRole ?? 'civilian'}`)
        }
        hint={t('room.game.lookUp')}
      >
        {pub.phase === 'over' ? null : wordCard}
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.impostor.roomKicker')}
      title={t('games.impostor.oneWordEach')}
      hint={t('games.impostor.clueHint')}
    >
      {wordCard}
    </PhonePanel>
  );
}
