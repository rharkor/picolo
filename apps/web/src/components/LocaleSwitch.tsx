import { LOCALES, type Locale } from '@piccolo/shared';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';

const FLAG: Record<Locale, string> = { en: '🇬🇧', fr: '🇫🇷' };
const LABEL: Record<Locale, string> = { en: 'English', fr: 'Français' };

export function LocaleSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={cn('glass inline-flex rounded-pill p-1', compact ? 'gap-0.5' : 'gap-1')}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            haptic('select');
            setLocale(code);
          }}
          aria-pressed={locale === code}
          className={cn(
            'flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors',
            locale === code
              ? 'bg-gradient-to-r from-violet to-fuchsia text-white'
              : 'text-muted hover:text-text',
          )}
        >
          <span aria-hidden>{FLAG[code]}</span>
          {!compact && <span>{LABEL[code]}</span>}
          {compact && <span className="uppercase">{code}</span>}
        </button>
      ))}
    </div>
  );
}
