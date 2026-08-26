import { NavLink } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { useParty } from '@/store/party';

const TABS = [
  { to: '/', icon: '🏠', key: 'nav.home' },
  { to: '/games', icon: '🎲', key: 'nav.games' },
  { to: '/party', icon: '👥', key: 'nav.party' },
  { to: '/settings', icon: '⚙️', key: 'nav.settings' },
] as const;

export function TabBar() {
  const { tRaw } = useI18n();
  const count = useParty((s) => s.players.length);

  return (
    <nav className="safe-b fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-3">
      <div className="glass flex w-full max-w-md items-center gap-1 rounded-3xl p-1.5 shadow-2xl">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            onClick={() => haptic('tap')}
            className={({ isActive }) =>
              cn(
                'relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[0.68rem] font-semibold transition-colors',
                isActive ? 'bg-white/10 text-text' : 'text-muted hover:text-text',
              )
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tRaw(tab.key)}</span>
            {tab.to === '/party' && count > 0 && (
              <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-fuchsia px-1 text-[0.6rem] text-white">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
