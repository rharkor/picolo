import { Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { LOCAL_GAMES } from '@/games/registry';
import { useI18n } from '@/i18n';
import { useParty } from '@/store/party';
import { useSettings } from '@/store/settings';

export function Play() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t, loc } = useI18n();
  const players = useParty((s) => s.players);
  const adult = useSettings((s) => s.adultUnlocked);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const meta = getGame(id);
  const Game = LOCAL_GAMES[id];

  if (!meta || !Game) {
    return (
      <Screen>
        <p className="text-muted">{t('game.notReady')}</p>
        <Button className="mt-4" onClick={() => navigate('/games')}>
          {t('game.otherGame')}
        </Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="safe-t mb-2 flex items-center justify-between pt-2">
        <span className="font-display text-sm uppercase tracking-[0.18em] text-muted">
          {loc(meta.title)}
        </span>
        <button
          type="button"
          onClick={() => setConfirmQuit(true)}
          className="glass rounded-pill px-3 py-1.5 text-xs font-semibold text-muted"
        >
          {t('common.quit')}
        </button>
      </header>

      <Suspense
        fallback={<p className="py-20 text-center text-muted">{t('common.loading')}</p>}
      >
        <Game meta={meta} players={players} adult={adult} onExit={() => navigate('/games')} />
      </Suspense>

      <Sheet open={confirmQuit} onClose={() => setConfirmQuit(false)} title={t('common.quit')}>
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" full onClick={() => setConfirmQuit(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" full onClick={() => navigate('/games')}>
            {t('common.quit')}
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
