import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GAME_CATALOGUE } from '@piccolo/shared';
import { Chip } from '@/components/Chip';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n';
import { useParty } from '@/store/party';
import { useSettings } from '@/store/settings';

function ModeCard({
  to,
  emoji,
  title,
  desc,
  delay,
  accent,
  disabled = false,
  disabledLabel,
}: {
  to: string;
  emoji: string;
  title: string;
  desc: string;
  delay: number;
  accent: string;
  /** Mode not shipped yet: the card reads as a preview, not a dead link. */
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const body = (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-70 blur-2xl transition-opacity group-hover:opacity-100`}
      />
      <span className="relative text-4xl" aria-hidden>
        {emoji}
      </span>
      <div className="relative min-w-0 flex-1">
        <h2 className="text-lg leading-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-muted">{desc}</p>
      </div>
      {disabled ? (
        <Chip tone="warn" className="relative shrink-0">
          {disabledLabel}
        </Chip>
      ) : (
        <span className="relative text-xl text-muted transition-transform group-hover:translate-x-0.5">
          →
        </span>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {disabled ? (
        <div
          aria-disabled
          className="glass group relative flex items-center gap-4 overflow-hidden rounded-card p-5 opacity-55"
        >
          {body}
        </div>
      ) : (
        <Link
          to={to}
          className="glass group relative flex items-center gap-4 overflow-hidden rounded-card p-5 transition-colors hover:border-white/20"
        >
          {body}
        </Link>
      )}
    </motion.div>
  );
}

/**
 * Room games installed on this build. The mode card stays disabled on an
 * instance that has none, rather than sending people to a lobby with nothing to
 * start.
 */
const roomGames = GAME_CATALOGUE.filter(
  (game) => game.modes.includes('room') && game.status === 'ready',
).length;

export function Home() {
  const { t } = useI18n();
  const players = useParty((s) => s.players);
  const adultUnlocked = useSettings((s) => s.adultUnlocked);

  const visible = GAME_CATALOGUE.filter((g) => adultUnlocked || !g.adult);

  return (
    <Screen>
      <div className="safe-t flex items-center justify-between pt-2">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">
          {t('home.kicker')}
        </span>
        <LocaleSwitch compact />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 text-6xl leading-none tracking-tight"
      >
        <span className="text-gradient">{t('home.title')}</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="mt-3 max-w-sm text-lg text-muted text-balance"
      >
        {t('home.tagline')}
      </motion.p>

      <div className="mt-9 flex flex-col gap-3">
        <ModeCard
          to="/games?mode=pass"
          emoji="📱"
          title={t('home.passTitle')}
          desc={t('home.passDesc')}
          delay={0.18}
          accent="from-violet/40 to-fuchsia/10"
        />
        <ModeCard
          to="/host"
          emoji="📺"
          title={t('home.roomTitle')}
          desc={t('home.roomDesc')}
          delay={0.26}
          accent="from-amber/40 to-orange/10"
          disabled={roomGames === 0}
          disabledLabel={t('home.roomUnavailable')}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="mt-4 flex flex-col gap-3"
      >
        <Link
          to="/party"
          className="glass flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors hover:bg-surface-2/70"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden>👥</span>
            <span className="font-semibold">{t('home.partyCta')}</span>
          </span>
          <span className="text-muted">
            {players.length > 0 ? t('home.partyCount', { count: players.length }) : t('home.partyEmpty')}
          </span>
        </Link>

        <Link
          to="/games"
          className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-muted transition-colors hover:text-text"
        >
          {t('home.browse', { count: visible.length })} →
        </Link>
      </motion.div>
    </Screen>
  );
}
