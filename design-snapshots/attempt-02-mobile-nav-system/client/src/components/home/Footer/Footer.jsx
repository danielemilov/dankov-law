import './Footer.css';

export default function Footer() {
  return (
    <footer className="hlFooter">
      <div>
        <strong>
          Диян <em>Данков</em>
        </strong>
        <p>Адвокат с мисия — защита на правата на всеки човек, без изключение.</p>
      </div>

      <nav>
        <a href="#about">За адвоката</a>
        <a href="#cases">Казуси</a>
        <a href="#video">Видео</a>
        <a href="#contact">Контакт</a>
      </nav>

      <small>© 2026 Адвокат Диян Данков · Разград</small>
    </footer>
  );
}
