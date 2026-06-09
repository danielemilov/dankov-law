import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Menu,
  RefreshCw,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
  LogOut,
} from 'lucide-react';
import './view/AdminLayout.css';
import { ADMIN_SECTIONS } from './AdminConfig.js';

export default function AdminLayout({
  admin,
  route,
  navigate,
  goBack,
  canGoBack,
  getSectionBadge,
  autoRefresh,
  setAutoRefresh,
  soundEnabled,
  toggleSound,
  saving,
  refreshAll,
  logout,
  message,
  error,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSection = useMemo(
    () => ADMIN_SECTIONS.find((section) => section.id === route.section) || ADMIN_SECTIONS[0],
    [route.section]
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [route.section, route.itemId, route.settingsPanel]);

  function openSection(sectionId) {
    navigate({ section: sectionId, itemId: '', settingsPanel: '' });
  }

  return (
    <main className="dAdminShell">
      <aside className={`dAdminSidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="dAdminSidebar__brand">
          <span className="dAdminSidebar__mark"><ShieldCheck size={22} /></span>
          <div>
            <strong>Dankov Admin</strong>
            <small>{admin?.username || 'Администратор'}</small>
          </div>
          <button
            className="dAdminSidebar__close"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Затвори менюто"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dAdminSidebar__focus">
          <span>Основна работа</span>
          {ADMIN_SECTIONS.filter((section) => section.group === 'primary').map((section) => {
            const Icon = section.icon;
            const badge = getSectionBadge(section.id);
            const active = route.section === section.id;

            return (
              <button
                key={section.id}
                className={`dAdminNavCard ${active ? 'is-active' : ''}`}
                type="button"
                onClick={() => openSection(section.id)}
              >
                <span className="dAdminNavCard__icon"><Icon size={20} /></span>
                <span className="dAdminNavCard__copy">
                  <strong>{section.shortLabel}</strong>
                  <small>{section.description}</small>
                </span>
                {badge > 0 && <span className="dAdminNavCard__badge">{badge}</span>}
              </button>
            );
          })}
        </div>

        <nav className="dAdminSidebar__nav" aria-label="Админ навигация">
          <span>Управление</span>
          {ADMIN_SECTIONS.filter((section) => section.group !== 'primary').map((section) => {
            const Icon = section.icon;
            const badge = getSectionBadge(section.id);
            const active = route.section === section.id;

            return (
              <button
                key={section.id}
                className={active ? 'is-active' : ''}
                type="button"
                onClick={() => openSection(section.id)}
              >
                <Icon size={18} />
                <span>{section.shortLabel}</span>
                {badge > 0 && <b>{badge}</b>}
              </button>
            );
          })}
        </nav>

        <div className="dAdminSidebar__footer">
          <button type="button" onClick={logout}>
            <LogOut size={18} />
            Изход
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="dAdminBackdrop"
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Затвори менюто"
        />
      )}

      <section className="dAdminWorkspace">
        <header className="dAdminHeader">
          <div className="dAdminHeader__start">
            <button
              className="dAdminMobileMenu"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Отвори менюто"
            >
              <Menu size={21} />
            </button>

            {canGoBack && (
              <button className="dAdminHeader__back" type="button" onClick={goBack}>
                <ArrowLeft size={18} />
                <span>Назад</span>
              </button>
            )}

            <div className="dAdminHeader__title">
              <span>{route.itemId || route.settingsPanel ? 'Детайлен изглед' : 'Работно пространство'}</span>
              <h1>{activeSection.label}</h1>
            </div>
          </div>

          <div className="dAdminHeader__actions">
            <button
              className={`dAdminIconButton ${autoRefresh ? 'is-active' : ''}`}
              type="button"
              onClick={() => setAutoRefresh((value) => !value)}
              title={autoRefresh ? 'Автоматичното обновяване е включено' : 'Автоматичното обновяване е изключено'}
            >
              <RefreshCw size={18} />
            </button>

            <button
              className={`dAdminIconButton ${soundEnabled ? 'is-active' : ''}`}
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Звукът е включен' : 'Звукът е изключен'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              className="dAdminButton dAdminButton--soft"
              type="button"
              onClick={refreshAll}
              disabled={saving}
            >
              <RefreshCw size={17} className={saving ? 'is-spinning' : ''} />
              <span>Обнови</span>
            </button>
          </div>
        </header>

        {(message || error) && (
          <div className={`dAdminToast ${error ? 'dAdminToast--error' : ''}`} role="status">
            {error ? <Bell size={17} /> : <ShieldCheck size={17} />}
            <span>{error || message}</span>
          </div>
        )}

        <div className="dAdminContent">{children}</div>
      </section>
    </main>
  );
}
