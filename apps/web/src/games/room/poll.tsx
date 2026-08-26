import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import type { OptionPollPublic, PeoplePollPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PickPlayer, PlayerDots, VoteBars, Waiting } from './ui';

/**
 * One prompt on the television, one tap per phone, then the split. Shared by
 * Most Likely To, Who In The Room and Would You Rather — the only difference
 * being whether you are voting for a person or for one of two options.
 */

export function PeoplePollHost({ state, action, canDrive, ns, kicker }: RoomViewProps & { ns: string; kicker?: boolean }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as PeoplePollPublic | null;
  if (pub?.kind !== 'people-poll') return null;

  const waiting = state.players.filter((p) => p.connected && !pub.voted.includes(p.id));
  const leaders = pub.leaders ?? [];
  const named = state.players.filter((p) => leaders.includes(p.id)).map((p) => p.name);

  return (
    <HostStage
      kicker={kicker ? tRaw(`games.${ns}.cta`) : tRaw(`games.${ns}.roomKicker`)}
      title={pub.prompt}
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {pub.phase === 'voting' ? (
              <Button variant="surface" size="lg" full onClick={() => action('reveal')}>
                {t('room.game.revealNow')}
              </Button>
            ) : (
              <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
                {t('room.game.nextPrompt')}
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {pub.phase === 'voting' ? (
        <div className="flex flex-col items-center gap-6">
          <PlayerDots players={state.players} done={pub.voted} />
          <Waiting
            label={t('room.game.waitingFor', {
              n: waiting.length,
              names: waiting.map((p) => p.name).join(', '),
            })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <VoteBars
            rows={(pub.results ?? []).map((row) => ({
              id: row.id,
              label: `${state.players.find((p) => p.id === row.id)?.avatar ?? ''} ${
                state.players.find((p) => p.id === row.id)?.name ?? ''
              }`,
              votes: row.votes,
            }))}
            highlight={leaders}
          />
          {named.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-display text-2xl text-gradient text-balance"
            >
              {tRaw(`games.${ns}.roomVerdict`, { names: named.join(' · ') })}
            </motion.p>
          )}
        </div>
      )}
    </HostStage>
  );
}

export function PeoplePollPhone({ state, self, action, ns }: RoomViewProps & { ns: string }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as PeoplePollPublic | null;
  const [picked, setPicked] = useState<string | null>(null);
  const round = pub?.kind === 'people-poll' ? pub.round : 0;

  const vote = useCallback(
    (id: string) => {
      haptic('select');
      setPicked(id);
      action('vote', id);
    },
    [action],
  );

  if (pub?.kind !== 'people-poll') return null;
  const alreadyVoted = self ? pub.voted.includes(self.id) : false;

  if (pub.phase === 'reveal') {
    const leaders = state.players.filter((p) => (pub.leaders ?? []).includes(p.id));
    return (
      <PhonePanel
        kicker={tRaw(`games.${ns}.roomKicker`)}
        title={pub.prompt}
        hint={t('room.game.lookUp')}
      >
        <p className="text-center font-display text-3xl text-gradient text-balance">
          {leaders.map((p) => `${p.avatar} ${p.name}`).join(' · ')}
        </p>
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={tRaw(`games.${ns}.roomKicker`)}
      title={pub.prompt}
      hint={alreadyVoted ? t('room.game.voteLocked') : t('room.game.pickOne')}
    >
      {alreadyVoted ? (
        <Waiting label={t('room.game.waitingOthers')} />
      ) : (
        <PickPlayer
          key={round}
          players={state.players}
          selected={picked}
          onPick={vote}
        />
      )}
    </PhonePanel>
  );
}

export function OptionPollHost({ state, action, canDrive, ns }: RoomViewProps & { ns: string }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as OptionPollPublic | null;
  if (pub?.kind !== 'option-poll') return null;

  const waiting = state.players.filter((p) => p.connected && !pub.voted.includes(p.id));

  const side = (which: 'a' | 'b') => {
    const text = which === 'a' ? pub.a : pub.b;
    const votes = pub.results ? (which === 'a' ? pub.results.a : pub.results.b) : 0;
    const isMinority = pub.minority === which;
    return (
      <div
        className={cn(
          'glass flex flex-1 flex-col justify-center gap-3 rounded-[2rem] px-6 py-8 text-center',
          which === 'a'
            ? 'border-cyan/25 bg-gradient-to-br from-cyan/15 to-transparent'
            : 'border-amber/25 bg-gradient-to-br from-amber/15 to-transparent',
          isMinority && 'ring-glow border-rose/50',
        )}
      >
        <span
          className={cn(
            'font-display text-xs uppercase tracking-[0.3em]',
            which === 'a' ? 'text-cyan' : 'text-amber',
          )}
        >
          {which === 'a' ? t('games.would-you-rather.optionA') : t('games.would-you-rather.optionB')}
        </span>
        <p className="font-display text-2xl leading-snug text-balance md:text-4xl">{text}</p>
        {pub.phase === 'reveal' && (
          <p className="font-display text-5xl tabular-nums text-gradient">{votes}</p>
        )}
      </div>
    );
  };

  return (
    <HostStage
      kicker={tRaw(`games.${ns}.cta`)}
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'voting' ? (
            <Button variant="surface" size="lg" full onClick={() => action('reveal')}>
              {t('room.game.revealNow')}
            </Button>
          ) : (
            <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
              {t('room.game.nextPrompt')}
            </Button>
          )
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          {side('a')}
          {side('b')}
        </div>
        {pub.phase === 'voting' ? (
          <>
            <PlayerDots players={state.players} done={pub.voted} />
            <Waiting
              label={t('room.game.waitingFor', {
                n: waiting.length,
                names: waiting.map((p) => p.name).join(', '),
              })}
            />
          </>
        ) : (
          <p className="text-center font-display text-2xl text-gradient text-balance">
            {pub.minority === 'tie'
              ? t('games.would-you-rather.everyoneDrinks')
              : t('room.game.minorityDrinks')}
          </p>
        )}
      </div>
    </HostStage>
  );
}

export function OptionPollPhone({ state, self, action, ns }: RoomViewProps & { ns: string }) {
  const { t, tRaw } = useI18n();
  const pub = state.public as OptionPollPublic | null;
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);

  const vote = useCallback(
    (which: 'a' | 'b') => {
      haptic('select');
      setPicked(which);
      action('vote', which);
    },
    [action],
  );

  if (pub?.kind !== 'option-poll') return null;
  const alreadyVoted = self ? pub.voted.includes(self.id) : false;

  if (pub.phase === 'reveal') {
    return (
      <PhonePanel kicker={tRaw(`games.${ns}.cta`)} hint={t('room.game.lookUp')}>
        <div className="flex flex-col gap-3 text-center">
          <p className="font-display text-xl text-balance">
            {pub.a} — {pub.results?.a ?? 0}
          </p>
          <p className="font-display text-xl text-balance">
            {pub.b} — {pub.results?.b ?? 0}
          </p>
        </div>
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={tRaw(`games.${ns}.cta`)}
      hint={alreadyVoted ? t('room.game.voteLocked') : t('room.game.pickOne')}
    >
      {alreadyVoted ? (
        <Waiting label={t('room.game.waitingOthers')} />
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          {(['a', 'b'] as const).map((which) => (
            <motion.button
              key={`${pub.round}-${which}`}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => vote(which)}
              className={cn(
                'glass flex flex-1 flex-col justify-center gap-2 rounded-[2rem] px-6 py-7 text-left',
                which === 'a'
                  ? 'border-cyan/25 bg-gradient-to-br from-cyan/15 to-transparent'
                  : 'border-amber/25 bg-gradient-to-br from-amber/15 to-transparent',
                picked === which && 'ring-glow',
              )}
            >
              <span
                className={cn(
                  'font-display text-xs uppercase tracking-[0.25em]',
                  which === 'a' ? 'text-cyan' : 'text-amber',
                )}
              >
                {which === 'a'
                  ? t('games.would-you-rather.optionA')
                  : t('games.would-you-rather.optionB')}
              </span>
              <p className="font-display text-xl leading-snug text-balance">
                {which === 'a' ? pub.a : pub.b}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </PhonePanel>
  );
}
