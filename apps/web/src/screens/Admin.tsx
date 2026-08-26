import { useCallback, useEffect, useMemo, useState } from 'react';
import { GAME_CATALOGUE, type GameMeta } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { GAME_CONTENT, type ContentRow, type ContentSection } from '@/games/content';
import { hasLocalGame } from '@/games/registry';
import { useI18n } from '@/i18n';
import { adminLogin, adminLogout, adminSession, type AdminError } from '@/lib/api';
import { cn } from '@/lib/cn';

/** Per-tab, so closing the tab locks the page again. */
const TOKEN_KEY = 'piccolo.admin.token';

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeToken(token: string): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: the session just does not survive a reload */
  }
}

type Gate = 'checking' | 'locked' | 'open';
type LangView = 'both' | 'en' | 'fr';
type AdultView = 'all' | 'only' | 'hide';

/** Reviewable games first — the rest are catalogue entries with nothing to read. */
const ORDERED: GameMeta[] = [
  ...GAME_CATALOGUE.filter((g) => g.id in GAME_CONTENT),
  ...GAME_CATALOGUE.filter((g) => !(g.id in GAME_CONTENT)),
];

export function Admin() {
  const { t, tRaw, loc } = useI18n();

  const [gate, setGate] = useState<Gate>('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AdminError | null>(null);
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [cache, setCache] = useState<Record<string, ContentSection[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<LangView>('both');
  const [adultView, setAdultView] = useState<AdultView>('all');

  // Reuse a token from an earlier unlock in this tab.
  useEffect(() => {
    const token = readToken();
    if (!token) {
      setGate('locked');
      return;
    }
    let cancelled = false;
    void adminSession(token).then((ok) => {
      if (cancelled) return;
      if (!ok) writeToken('');
      setGate(ok ? 'open' : 'locked');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const result = await adminLogin(password);
    setBusy(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    writeToken(result.token);
    setPassword('');
    setGate('open');
  }, [busy, password]);

  const lock = useCallback(() => {
    const token = readToken();
    writeToken('');
    if (token) void adminLogout(token);
    setGate('locked');
  }, []);

  const loadContent = useCallback(async (id: string) => {
    const loader = GAME_CONTENT[id];
    if (!loader) return;
    setLoading((prev) => ({ ...prev, [id]: true }));
    const sections = await loader();
    setCache((prev) => ({ ...prev, [id]: sections }));
    setLoading((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const wasOpen = open[id] ?? false;
      setOpen((prev) => ({ ...prev, [id]: !wasOpen }));
      if (!wasOpen && !cache[id] && !loading[id]) void loadContent(id);
    },
    [cache, loadContent, loading, open],
  );

  const expandAll = useCallback(() => {
    const ids = Object.keys(GAME_CONTENT);
    setOpen(Object.fromEntries(ids.map((id) => [id, true])));
    for (const id of ids) if (!cache[id] && !loading[id]) void loadContent(id);
  }, [cache, loadContent, loading]);

  const keep = useCallback(
    (row: ContentRow) => {
      if (adultView === 'only' && !row.adult) return false;
      if (adultView === 'hide' && row.adult) return false;
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return (
        row.id.toLowerCase().includes(needle) ||
        row.text.en.toLowerCase().includes(needle) ||
        row.text.fr.toLowerCase().includes(needle)
      );
    },
    [adultView, query],
  );

  const loadedCount = Object.keys(cache).length;
  const totals = useMemo(() => {
    let rows = 0;
    let adult = 0;
    for (const sections of Object.values(cache)) {
      for (const section of sections) {
        rows += section.rows.length;
        adult += section.rows.filter((r) => r.adult).length;
      }
    }
    return { rows, adult };
  }, [cache]);

  if (gate === 'checking') {
    return (
      <Screen>
        <TopBar title={t('admin.title')} />
        <p className="text-muted">{t('common.loading')}</p>
      </Screen>
    );
  }

  if (gate === 'locked') {
    return (
      <Screen>
        <TopBar title={t('admin.title')} />
        <form
          className="glass mx-auto mt-6 flex max-w-sm flex-col gap-4 rounded-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void unlock();
          }}
        >
          <div>
            <p className="font-display text-xl">{t('admin.lockTitle')}</p>
            <p className="mt-1 text-sm text-muted">{t('admin.lockBody')}</p>
          </div>

          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.password')}
            aria-label={t('admin.password')}
            className={cn(
              'h-12 w-full rounded-2xl border border-line bg-surface/60 px-4',
              'placeholder:text-muted focus-visible:outline-2 focus-visible:outline-fuchsia',
            )}
          />

          {error && <p className="text-sm text-rose">{tRaw(`admin.errors.${error}`)}</p>}

          <Button type="submit" variant="primary" size="lg" full glow disabled={busy || !password}>
            {busy ? t('common.loading') : t('admin.unlock')}
          </Button>
        </form>
      </Screen>
    );
  }

  return (
    <Screen wide>
      <TopBar
        title={t('admin.title')}
        subtitle={t('admin.subtitle', {
          games: GAME_CATALOGUE.length,
          decks: Object.keys(GAME_CONTENT).length,
        })}
        right={
          <Button variant="ghost" size="sm" onClick={lock}>
            {t('admin.lock')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('admin.search')}
          aria-label={t('admin.search')}
          className={cn(
            'h-12 w-full rounded-2xl border border-line bg-surface/60 px-4',
            'placeholder:text-muted focus-visible:outline-2 focus-visible:outline-fuchsia',
          )}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={lang}
            onChange={setLang}
            options={[
              { value: 'both', label: t('admin.langBoth') },
              { value: 'en', label: 'EN' },
              { value: 'fr', label: 'FR' },
            ]}
          />
          <Segmented
            value={adultView}
            onChange={setAdultView}
            options={[
              { value: 'all', label: t('admin.adultAll') },
              { value: 'only', label: t('admin.adultOnly') },
              { value: 'hide', label: t('admin.adultHide') },
            ]}
          />
          <Button variant="surface" size="sm" onClick={expandAll}>
            {t('admin.expandAll')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen({})}>
            {t('admin.collapseAll')}
          </Button>
        </div>

        <p className="text-xs text-muted">
          {t('admin.loadedSummary', {
            decks: loadedCount,
            lines: totals.rows,
            adult: totals.adult,
          })}
          {query.trim() && loadedCount < Object.keys(GAME_CONTENT).length && (
            <span className="text-amber"> · {t('admin.searchHint')}</span>
          )}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {ORDERED.map((game) => {
          const sections = cache[game.id];
          const isOpen = open[game.id] ?? false;
          const reviewable = game.id in GAME_CONTENT;
          const filtered = sections
            ?.map((section) => ({ ...section, rows: section.rows.filter(keep) }))
            .filter((section) => section.rows.length > 0);

          return (
            <section key={game.id} className="glass overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => reviewable && toggle(game.id)}
                disabled={!reviewable}
                className={cn(
                  'flex w-full items-center gap-3 p-4 text-left',
                  reviewable ? 'hover:bg-surface-2/60' : 'opacity-60',
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {game.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display font-semibold">{loc(game.title)}</span>
                    <code className="text-xs text-muted">{game.id}</code>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Chip>{tRaw(`category.${game.category}`)}</Chip>
                    <Chip>{tRaw(`intensity.${game.intensity}`)}</Chip>
                    {game.modes.map((mode) => (
                      <Chip key={mode}>{tRaw(`mode.${mode}Short`)}</Chip>
                    ))}
                    {game.adult && <Chip tone="accent">18+</Chip>}
                    {hasLocalGame(game.id) ? (
                      <Chip tone="warn">{t('admin.playable')}</Chip>
                    ) : (
                      <Chip>{tRaw(`common.soon`)}</Chip>
                    )}
                    {sections && (
                      <Chip>
                        {t('admin.lines', {
                          n: sections.reduce((sum, s) => sum + s.rows.length, 0),
                        })}
                      </Chip>
                    )}
                  </span>
                </span>
                {reviewable && (
                  <span className="shrink-0 text-muted" aria-hidden>
                    {isOpen ? '▾' : '▸'}
                  </span>
                )}
              </button>

              {!reviewable && (
                <p className="px-4 pb-4 text-xs text-muted">{t('admin.noDeck')}</p>
              )}

              {isOpen && loading[game.id] && (
                <p className="px-4 pb-4 text-sm text-muted">{t('common.loading')}</p>
              )}

              {isOpen && filtered && (
                <div className="border-t border-line px-4 pb-4">
                  {filtered.length === 0 && (
                    <p className="pt-4 text-sm text-muted">{t('admin.empty')}</p>
                  )}
                  {filtered.map((section) => (
                    <div key={section.key} className="pt-4">
                      <h3 className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                        {tRaw(`admin.sections.${section.key}`)}
                        <Chip>{t('admin.lines', { n: section.rows.length })}</Chip>
                        {section.rows.some((r) => r.adult) && (
                          <Chip tone="accent">
                            {t('admin.adultCount', {
                              n: section.rows.filter((r) => r.adult).length,
                            })}
                          </Chip>
                        )}
                      </h3>
                      <ol className="flex flex-col gap-1.5">
                        {section.rows.map((row) => (
                          <Row key={row.id} row={row} lang={lang} />
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">{t('admin.note')}</p>
    </Screen>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="glass flex gap-0.5 rounded-pill p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors',
            option.value === value ? 'bg-fuchsia/20 text-text' : 'text-muted hover:text-text',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Row({ row, lang }: { row: ContentRow; lang: LangView }) {
  const { t, tRaw, loc } = useI18n();
  const numbers = row.numbers;

  return (
    <li className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <code className="text-[0.7rem] text-muted">{row.id}</code>
        <Chip>{tRaw(`intensity.${row.intensity}`)}</Chip>
        {row.adult && <Chip tone="accent">18+</Chip>}
        {row.needsPlayer && <Chip tone="warn">{t('admin.needsPlayer')}</Chip>}
        {numbers?.answer !== undefined && (
          <Chip tone="warn">
            {t('admin.answer', { n: numbers.answer, unit: loc(numbers.unit) })}
          </Chip>
        )}
        {numbers && (
          <Chip>{t('admin.bidding', { start: numbers.start, step: numbers.step })}</Chip>
        )}
      </div>

      {lang !== 'fr' && <p className="mt-1 leading-snug">{row.text.en}</p>}
      {lang !== 'en' && (
        <p className={cn('leading-snug', lang === 'both' ? 'mt-0.5 text-muted' : 'mt-1')}>
          {row.text.fr}
        </p>
      )}
    </li>
  );
}
