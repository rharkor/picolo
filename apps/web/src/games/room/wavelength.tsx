import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { WavelengthPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, PlayerDots, Waiting } from './ui';

/** The spectrum rail, shared by both views. */
function Spectrum({
  left,
  right,
  markers,
  target,
}: {
  left: string;
  right: string;
  markers?: { id: string; value: number; label: string }[];
  target?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-14 w-full overflow-hidden rounded-pill bg-gradient-to-r from-cyan/30 via-violet/20 to-amber/30">
        {target !== undefined && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="absolute top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-white"
            style={{ left: `${target}%` }}
          />
        )}
        {(markers ?? []).map((marker, i) => (
          <motion.div
            key={marker.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-ink/80 px-1.5 py-0.5 text-[0.65rem] font-semibold"
            style={{ left: `${marker.value}%` }}
          >
            {marker.label}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between font-display text-sm uppercase tracking-[0.15em] text-muted">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export function Host({ state, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as WavelengthPublic | null;
  if (pub?.kind !== 'wavelength') return null;

  const psychic = state.players.find((p) => p.id === pub.psychic);
  const guessers = state.players.filter((p) => p.id !== pub.psychic);
  const waiting = guessers.filter((p) => p.connected && !pub.guessed.includes(p.id));

  return (
    <HostStage
      kicker={t('games.wavelength.roomKicker')}
      title={pub.clue || t('games.wavelength.waitingForClue', { name: psychic?.name ?? '' })}
      subtitle={
        pub.phase === 'reveal'
          ? t('games.wavelength.targetWas', { n: pub.target ?? 0 })
          : t('games.wavelength.psychicIs', { name: psychic?.name ?? '' })
      }
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
                {t('games.wavelength.nextSpectrum')}
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
      <div className="flex flex-col gap-6">
        <Spectrum
          left={pub.left}
          right={pub.right}
          target={pub.phase === 'reveal' ? pub.target : undefined}
          markers={
            pub.phase === 'reveal'
              ? (pub.guesses ?? []).map((g) => ({
                  id: g.id,
                  value: g.value,
                  label: `${state.players.find((p) => p.id === g.id)?.avatar ?? ''} +${g.points}`,
                }))
              : undefined
          }
        />
        {pub.phase === 'guessing' && (
          <>
            <PlayerDots players={guessers} done={pub.guessed} />
            <Waiting
              label={t('room.game.waitingFor', {
                n: waiting.length,
                names: waiting.map((p) => p.name).join(', '),
              })}
            />
          </>
        )}
        {pub.phase === 'clue' && (
          <Waiting label={t('games.wavelength.waitingForClue', { name: psychic?.name ?? '' })} />
        )}
      </div>
    </HostStage>
  );
}

export function Phone({ state, self, privateState, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as WavelengthPublic | null;
  const secret = privateState as { role?: string; target?: number } | null;
  const [clue, setClue] = useState('');
  const [value, setValue] = useState(50);
  const round = pub?.kind === 'wavelength' ? pub.round : 0;

  useEffect(() => {
    setClue('');
    setValue(50);
  }, [round]);

  const sendClue = useCallback(() => {
    const text = clue.trim();
    if (!text) return;
    haptic('select');
    action('clue', text);
  }, [action, clue]);

  const sendGuess = useCallback(() => {
    haptic('select');
    action('guess', value);
  }, [action, value]);

  if (pub?.kind !== 'wavelength') return null;
  const me = self?.id ?? '';
  const isPsychic = me === pub.psychic;

  if (pub.phase === 'reveal') {
    const mine = (pub.guesses ?? []).find((g) => g.id === me);
    return (
      <PhonePanel
        kicker={t('games.wavelength.roomKicker')}
        title={
          isPsychic
            ? t('games.wavelength.psychicDone')
            : t('games.wavelength.youScored', { n: mine?.points ?? 0 })
        }
        hint={t('room.game.lookUp')}
      >
        <Spectrum left={pub.left} right={pub.right} target={pub.target} />
      </PhonePanel>
    );
  }

  if (isPsychic) {
    if (pub.phase === 'clue') {
      return (
        <PhonePanel
          kicker={t('games.wavelength.roomKicker')}
          title={t('games.wavelength.yourTarget', { n: secret?.target ?? 0 })}
          hint={t('games.wavelength.clueHint')}
        >
          <div className="flex flex-col gap-4">
            <Spectrum left={pub.left} right={pub.right} target={secret?.target} />
            <input
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              maxLength={80}
              placeholder={t('games.wavelength.cluePlaceholder')}
              aria-label={t('games.wavelength.cluePlaceholder')}
              className="glass w-full rounded-2xl px-4 py-3 text-base outline-none focus:border-fuchsia/50"
            />
            <Button
              variant="primary"
              size="lg"
              full
              glow
              disabled={clue.trim().length === 0}
              onClick={sendClue}
            >
              {t('room.game.submit')}
            </Button>
          </div>
        </PhonePanel>
      );
    }
    return (
      <PhonePanel
        kicker={t('games.wavelength.roomKicker')}
        title={pub.clue}
        hint={t('games.wavelength.saidYourBit')}
      >
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  if (pub.phase === 'clue') {
    return (
      <PhonePanel kicker={t('games.wavelength.roomKicker')} hint={t('room.game.lookUp')}>
        <Waiting
          label={t('games.wavelength.waitingForClue', {
            name: state.players.find((p) => p.id === pub.psychic)?.name ?? '',
          })}
        />
      </PhonePanel>
    );
  }

  if (pub.guessed.includes(me)) {
    return (
      <PhonePanel kicker={t('games.wavelength.roomKicker')} hint={t('room.game.voteLocked')}>
        <Waiting label={t('room.game.waitingOthers')} />
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.wavelength.roomKicker')}
      title={pub.clue}
      hint={t('games.wavelength.dragHint')}
    >
      <div className="flex flex-col gap-5">
        <Spectrum left={pub.left} right={pub.right} target={value} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={t('games.wavelength.dragHint')}
          className="h-10 w-full accent-fuchsia"
        />
        <Button variant="primary" size="lg" full glow onClick={sendGuess}>
          {t('games.wavelength.lockIn', { n: value })}
        </Button>
      </div>
    </PhonePanel>
  );
}
