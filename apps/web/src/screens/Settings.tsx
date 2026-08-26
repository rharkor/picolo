import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { TopBar } from '@/components/TopBar';
import { Toggle } from '@/components/Toggle';
import { useI18n } from '@/i18n';
import { fetchConfig } from '@/lib/api';
import { useParty } from '@/store/party';
import { useSettings } from '@/store/settings';

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-4">
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">{title}</p>
        {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const settings = useSettings();
  const clearParty = useParty((s) => s.clear);
  const [askAdult, setAskAdult] = useState(false);
  const [serverAllowsAdult, setServerAllowsAdult] = useState(true);
  const [adminEnabled, setAdminEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchConfig().then((config) => {
      if (cancelled || !config) return;
      setServerAllowsAdult(config.allowAdultContent);
      setAdminEnabled(config.adminEnabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // If the admin turns adult content off server-side, respect it immediately.
  useEffect(() => {
    if (!serverAllowsAdult && settings.adultUnlocked) settings.setAdultUnlocked(false);
  }, [serverAllowsAdult, settings]);

  return (
    <Screen>
      <TopBar back={false} title={t('settings.title')} />

      <section className="flex flex-col gap-2">
        <Row title={t('settings.language')} desc={t('settings.languageDesc')} />
        <div className="flex justify-center py-1">
          <LocaleSwitch />
        </div>

        <Row
          title={t('settings.adult')}
          desc={serverAllowsAdult ? t('settings.adultDesc') : t('settings.adultDisabledByServer')}
        >
          <Toggle
            label={t('settings.adult')}
            checked={settings.adultUnlocked}
            disabled={!serverAllowsAdult}
            onChange={(value) => {
              if (value) setAskAdult(true);
              else settings.setAdultUnlocked(false);
            }}
          />
        </Row>

        <Row title={t('settings.haptics')} desc={t('settings.hapticsDesc')}>
          <Toggle
            label={t('settings.haptics')}
            checked={settings.haptics}
            onChange={settings.setHaptics}
          />
        </Row>

        <Row title={t('settings.sound')} desc={t('settings.soundDesc')}>
          <Toggle label={t('settings.sound')} checked={settings.sound} onChange={settings.setSound} />
        </Row>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
          {t('settings.about')}
        </h2>
        <div className="glass rounded-2xl p-4 text-sm leading-relaxed text-muted">
          <p>{t('settings.aboutBody')}</p>
          <p className="mt-3 text-amber">{t('settings.drinkResponsibly')}</p>
        </div>
      </section>

      {adminEnabled && (
        <section className="mt-6">
          <Row title={t('admin.settingsRow')} desc={t('admin.settingsRowDesc')}>
            <Button variant="surface" size="sm" onClick={() => navigate('/admin')}>
              {t('common.continue')}
            </Button>
          </Row>
        </section>
      )}

      <section className="mt-6">
        <Row title={t('settings.reset')} desc={t('settings.resetDesc')}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!window.confirm(t('settings.resetConfirm'))) return;
              clearParty();
              settings.reset();
            }}
          >
            {t('settings.reset')}
          </Button>
        </Row>
      </section>

      <Sheet open={askAdult} onClose={() => setAskAdult(false)} title={t('settings.adultConfirmTitle')}>
        <p className="mb-4 text-sm leading-relaxed text-muted">{t('settings.adultConfirmBody')}</p>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            full
            onClick={() => {
              settings.setAdultUnlocked(true);
              setAskAdult(false);
            }}
          >
            {t('settings.adultConfirmYes')}
          </Button>
          <Button variant="ghost" full onClick={() => setAskAdult(false)}>
            {t('common.cancel')}
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
