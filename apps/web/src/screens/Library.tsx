import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GAME_CATALOGUE, type GameCategory, type GameMeta, type PlayMode } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { GameCard } from '@/components/GameCard';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { pick } from '@/lib/random';
import { hasLocalGame } from '@/games/registry';
import { useSettings } from '@/store/settings';

const CATEGORIES: GameCategory[] = ['cards', 'party', 'social', 'skill', 'quiz', 'spicy'];

/** Shipped, and — for pass-the-phone — actually wired up to a local screen. */
function isPlayable(game: GameMeta): boolean {
  return game.status === 'ready' && (game.modes.includes('pass') ? hasLocalGame(game.id) : true);
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('tap');
        onClick();
      }}
      className={cn(
        'shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-colors',
        active ? 'bg-gradient-to-r from-violet to-fuchsia text-white' : 'glass text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

export function Library() {
  const { t, tRaw, loc } = useI18n();
  const adultUnlocked = useSettings((s) => s.adultUnlocked);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const mode = (params.get('mode') as PlayMode | null) ?? null;
  const category = (params.get('cat') as GameCategory | null) ?? null;

  const hiddenAdult = adultUnlocked ? 0 : GAME_CATALOGUE.filter((g) => g.adult).length;

  const games = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAME_CATALOGUE.filter((g) => {
      if (!adultUnlocked && g.adult) return false;
      if (mode && !g.modes.includes(mode)) return false;
      if (category && g.category !== category) return false;
      if (q) {
        const haystack = `${loc(g.title)} ${loc(g.tagline)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      // Playable first, then alphabetically in the active language.
      const aReady = isPlayable(a);
      const bReady = isPlayable(b);
      if (aReady !== bReady) return aReady ? -1 : 1;
      return loc(a.title).localeCompare(loc(b.title));
    });
  }, [adultUnlocked, category, loc, mode, query]);

  // Shuffle only ever lands on something you can start, and only within what the
  // filters are already showing — otherwise it feels like it ignored you.
  const shufflePool = useMemo(() => games.filter(isPlayable), [games]);

  const surprise = useCallback(() => {
    const game = pick(shufflePool);
    if (!game) return;
    haptic('select');
    navigate(`/g/${game.id}`);
  }, [navigate, shufflePool]);

  const readyCount = GAME_CATALOGUE.filter((g) => g.status === 'ready').length;
  const soonCount = GAME_CATALOGUE.length - readyCount;

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <Screen wide>
      {/* Filtered means we came from a Home card, not the tab bar: offer the way back. */}
      <TopBar
        back={mode !== null || category !== null}
        onBack={() => navigate('/')}
        title={t('library.title')}
        subtitle={
          soonCount > 0
            ? t('library.subtitle', { ready: readyCount, soon: soonCount })
            : t('library.subtitleAll', { ready: readyCount })
        }
      />

      <div className="mb-3 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('library.search')}
          className="glass min-w-0 flex-1 rounded-2xl px-4 py-3 text-base outline-none placeholder:text-muted/70 focus:border-fuchsia/50"
        />
        <Button
          variant="surface"
          size="md"
          className="h-auto shrink-0 self-stretch px-4"
          disabled={shufflePool.length === 0}
          onClick={surprise}
          aria-label={t('library.shuffle')}
          title={t('library.shuffleHint')}
        >
          <span aria-hidden>🎲</span>
          <span className="hidden sm:inline">{t('library.shuffle')}</span>
        </Button>
      </div>

      <div className="no-scrollbar -mx-5 mb-2 flex gap-2 overflow-x-auto px-5 pb-2">
        <FilterPill active={!mode} onClick={() => setParam('mode', null)}>
          {t('library.all')}
        </FilterPill>
        <FilterPill active={mode === 'pass'} onClick={() => setParam('mode', 'pass')}>
          {t('mode.passShort')}
        </FilterPill>
        <FilterPill active={mode === 'room'} onClick={() => setParam('mode', 'room')}>
          {t('mode.roomShort')}
        </FilterPill>
      </div>

      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-2">
        <FilterPill active={!category} onClick={() => setParam('cat', null)}>
          {t('library.all')}
        </FilterPill>
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            active={category === cat}
            onClick={() => setParam('cat', category === cat ? null : cat)}
          >
            {tRaw(`category.${cat}`)}
          </FilterPill>
        ))}
      </div>

      {games.length === 0 ? (
        <div className="glass rounded-card p-8 text-center">
          <p className="text-muted">{t('library.empty')}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setParams(new URLSearchParams(), { replace: true });
            }}
            className="mt-3 text-sm font-semibold text-fuchsia"
          >
            {t('library.clear')}
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </motion.div>
      )}

      {hiddenAdult > 0 && (
        <div className="glass mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4 text-sm">
          <span className="text-muted">{t('library.adultLocked', { count: hiddenAdult })}</span>
          <Link to="/settings" className="font-semibold text-fuchsia">
            {t('library.unlockAdult')} →
          </Link>
        </div>
      )}
    </Screen>
  );
}
