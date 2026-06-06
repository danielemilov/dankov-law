import { useEffect, useState } from 'react';
import './CookieBanner.css';

const STORAGE_KEY = 'dankov_cookie_consent_v1';

const DEFAULT_CONSENT = {
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: null,
  version: 1,
};

export function getStoredCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true,
    };
  } catch {
    return null;
  }
}

export function hasCookieConsent(category) {
  const consent = getStoredCookieConsent();

  if (!consent) return false;
  if (category === 'necessary') return true;

  return Boolean(consent[category]);
}

export function saveCookieConsent(preferences) {
  const consent = {
    ...DEFAULT_CONSENT,
    ...preferences,
    necessary: true,
    savedAt: new Date().toISOString(),
    version: 1,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

  window.dispatchEvent(
    new CustomEvent('dankov:cookie-consent-updated', {
      detail: consent,
    })
  );

  return consent;
}

function Toggle({ checked, disabled, onChange, title, text }) {
  return (
    <label className={`cookie-toggle ${disabled ? 'cookie-toggle--disabled' : ''}`}>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />

      <i aria-hidden="true" />
    </label>
  );
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredCookieConsent();

    if (!stored) {
      setVisible(true);
      return;
    }

    setPreferences(stored);
    setVisible(false);
  }, []);

  useEffect(() => {
    const openSettings = () => {
      const stored = getStoredCookieConsent();

      setPreferences(stored || DEFAULT_CONSENT);
      setVisible(true);
      setSettingsOpen(true);
    };

    window.addEventListener('dankov:open-cookie-settings', openSettings);

    return () => {
      window.removeEventListener('dankov:open-cookie-settings', openSettings);
    };
  }, []);

  function acceptAll() {
    saveCookieConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });

    setPreferences({
      ...DEFAULT_CONSENT,
      analytics: true,
      marketing: true,
    });

    setVisible(false);
    setSettingsOpen(false);
  }

  function rejectAll() {
    saveCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });

    setPreferences({
      ...DEFAULT_CONSENT,
      analytics: false,
      marketing: false,
    });

    setVisible(false);
    setSettingsOpen(false);
  }

  function saveSettings() {
    saveCookieConsent(preferences);

    setVisible(false);
    setSettingsOpen(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-layer" role="dialog" aria-modal="true" aria-label="Настройки за поверителност">
      <div className="cookie-card">
        <div className="cookie-card__mark">§</div>

        <div className="cookie-card__content">
          <p className="cookie-card__eyebrow">Поверителност и бисквитки</p>

          <h2>Управление на съгласието</h2>

          <p>
            Използваме необходими технологии за работа на сайта и чата. Аналитични или
            маркетингови бисквитки ще се използват само ако ги приемете.
          </p>

          {!settingsOpen && (
            <div className="cookie-card__actions">
              <button type="button" className="cookie-btn cookie-btn--dark" onClick={acceptAll}>
                Приемам всички
              </button>

              <button type="button" className="cookie-btn cookie-btn--ghost" onClick={rejectAll}>
                Отказвам
              </button>

              <button type="button" className="cookie-btn cookie-btn--line" onClick={() => setSettingsOpen(true)}>
                Настройки
              </button>
            </div>
          )}

          {settingsOpen && (
            <div className="cookie-settings">
              <Toggle
                title="Необходими"
                text="Нужни за работа на сайта, формите и сигурността. Не могат да бъдат изключени."
                checked
                disabled
                onChange={() => {}}
              />

              <Toggle
                title="Аналитични"
                text="Помагат да разберем как се използва сайтът. В момента не са задължителни."
                checked={preferences.analytics}
                onChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    analytics: value,
                  }))
                }
              />

              <Toggle
                title="Маркетингови"
                text="Използват се за рекламни и проследяващи цели. По подразбиране са изключени."
                checked={preferences.marketing}
                onChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    marketing: value,
                  }))
                }
              />

              <div className="cookie-card__actions cookie-card__actions--settings">
                <button type="button" className="cookie-btn cookie-btn--dark" onClick={saveSettings}>
                  Запази избора
                </button>

                <button type="button" className="cookie-btn cookie-btn--ghost" onClick={rejectAll}>
                  Отказвам всички
                </button>

                <button type="button" className="cookie-btn cookie-btn--line" onClick={acceptAll}>
                  Приемам всички
                </button>
              </div>
            </div>
          )}

          <a href="/privacy" className="cookie-card__link">
            Политика за поверителност и бисквитки
          </a>
        </div>
      </div>
    </div>
  );
}
