import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getGame } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { hasLocalGame } from '@/games/registry';
import { useI18n } from '@/i18n';
import { ACCENT } from '@/lib/accents';
import { cn } from '@/lib/cn';
import { useParty } from '@/store/party';

export function GameDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t, tRaw, loc } = useI18n();
  const players = useParty((s) => s.players);
  const game = getGame(id);

  if (!game) {
    return (
      <Screen>
        <TopBar title="404" />
        <p className="text-muted">{t('library.empty')}</p>
      </Screen>
    );
  }

  const accent = ACCENT[game.accent];
  const playableLocally = game.modes.includes('pass') && hasLocalGame(game.id);
  const supportsRoom = game.modes.includes('room');
  const enoughPlayers = players.length >= game.minPlayers || players.length === 0;
  const rules = tRaw(`games.${game.id}.rules`);
  const hasRules = rules !== `games.${game.id}.rules`;

  return (
    <Screen>
      <TopBar title={loc(game.title)} subtitle={tRaw(`category.${game.category}`)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative overflow-hidden rounded-card p-6"
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-gradient-to-br blur-2xl',
            accent.grad,
          )}
        />
        <span className="relative block text-6xl leading-none" aria-hidden>
          {game.emoji}
        </span>
        <h2 className="relative mt-4 text-3xl leading-tight">{loc(game.title)}</h2>
        <p className="relative mt-2 text-muted">{loc(game.tagline)}</p>

        <div className="relative mt-5 flex flex-wrap gap-1.5">
          <Chip>{tRaw(`intensity.${game.intensity}`)}</Chip>
          <Chip>
            {game.maxPlayers === null
              ? t('game.playersNeeded', { min: game.minPlayers })
              : t('game.playersRange', { min: game.minPlayers, max: game.maxPlayers })}
          </Chip>
          <Chip>
            {game.minutes[0]}–{game.minutes[1]} {t('common.min')}
          </Chip>
          {game.adult && <Chip tone="accent">18+</Chip>}
        </div>
      </motion.div>

      {hasRules && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            {t('game.howToPlay')}
          </h3>
          <p className="glass rounded-2xl p-4 leading-relaxed">{rules}</p>
        </section>
      )}

      {game.props && (
        <section className="mt-4 flex items-center gap-3 rounded-2xl border border-amber/25 bg-amber/10 p-4 text-sm">
          <span aria-hidden className="text-lg">
            🧾
          </span>
          <span>
            <strong className="font-semibold">{t('game.youNeed')}:</strong> {loc(game.props)}
          </span>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {playableLocally && (
          <Button
            variant="primary"
            size="xl"
            full
            glow
            disabled={!enoughPlayers}
            onClick={() => navigate(`/play/${game.id}`)}
          >
            {t('game.startLocal')}
          </Button>
        )}

        {supportsRoom && (
          <Button variant="surface" size="lg" full onClick={() => navigate(`/host?game=${game.id}`)}>
            {t('game.startRoom')}
          </Button>
        )}

        {!playableLocally && !supportsRoom && (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-display text-lg">{t('game.notReady')}</p>
            <p className="mt-1 text-sm text-muted">{t('game.notReadyDesc')}</p>
          </div>
        )}

        {game.status !== 'ready' && (playableLocally || supportsRoom) && (
          <p className="text-center text-xs text-muted">{t('game.notReadyDesc')}</p>
        )}

        {!enoughPlayers && (
          <Link to="/party" className="text-center text-sm font-semibold text-fuchsia">
            {t('game.needMorePlayers', { min: game.minPlayers })} →
          </Link>
        )}
      </div>
    </Screen>
  );
}
