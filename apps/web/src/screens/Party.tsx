import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useParty } from '@/store/party';

export function Party() {
  const { t } = useI18n();
  const { players, add, remove, cycleAvatar, shuffleOrder, clear } = useParty();
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (!name.trim()) return;
    const ok = add(name);
    if (!ok) {
      setError(true);
      haptic('fail');
      return;
    }
    haptic('success');
    setError(false);
    setName('');
    inputRef.current?.focus();
  }

  return (
    <Screen>
      <TopBar back={false} title={t('party.title')} subtitle={t('party.subtitle')} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(false);
          }}
          placeholder={t('party.namePlaceholder')}
          maxLength={16}
          autoComplete="off"
          className="glass min-w-0 flex-1 rounded-2xl px-4 py-3 text-base outline-none placeholder:text-muted/70 focus:border-fuchsia/50"
        />
        <Button type="submit" variant="primary" size="lg" disabled={!name.trim()}>
          +
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-rose">{t('party.duplicate')}</p>}

      {players.length === 0 ? (
        <p className="glass mt-5 rounded-2xl p-5 text-center text-sm text-muted">
          {t('party.empty')}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {players.map((player, i) => (
              <motion.li
                key={player.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                className="glass flex items-center gap-3 rounded-2xl p-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    haptic('tap');
                    cycleAvatar(player.id);
                  }}
                  aria-label={t('party.changeAvatar')}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl"
                >
                  {player.avatar}
                </button>
                <span className="min-w-0 flex-1 truncate font-display text-lg">{player.name}</span>
                <span className="text-xs text-muted">#{i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    haptic('fail');
                    remove(player.id);
                  }}
                  aria-label={t('party.remove', { name: player.name })}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-rose/15 hover:text-rose"
                >
                  ✕
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {players.length > 1 && (
        <div className="mt-5 flex gap-2">
          <Button variant="outline" full onClick={shuffleOrder}>
            🔀
          </Button>
          <Button variant="danger" full onClick={clear}>
            {t('party.clear')}
          </Button>
        </div>
      )}
    </Screen>
  );
}
