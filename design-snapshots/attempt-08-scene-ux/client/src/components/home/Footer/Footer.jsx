import './Footer.css';

export default function Footer() {
  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('dankov:open-cookie-settings'));
  };

  return (
    <footer className="hlFooter" id="legal">
      <div>
        <strong>
          Диян <em>Данков</em>
        </strong>
        <p>Адвокат с мисия — защита на правата на всеки човек, без изключение.</p>
      </div>

      <nav>
        <a href="#home">За адвоката</a>
        <a href="#cases">Казуси</a>
        <a href="#video">Видео</a>
        <a href="#contact">Контакт</a>
      </nav>

      <div className="hlFooter__legal">
        <small>© 2026 Адвокат Диян Данков · Разград</small>
        <a href="/privacy">Поверителност</a>
        <button type="button" onClick={openCookieSettings}>
          Бисквитки
        </button>
      </div>
    </footer>
  );
}
