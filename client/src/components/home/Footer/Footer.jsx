import useSiteSettings from '../../../hooks/useSiteSettings.js';
import './Footer.css';

export default function Footer() {
  const settings = useSiteSettings();

  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('dankov:open-cookie-settings'));
  };

  return (
    <footer className="hlFooter" id="legal">
      <div className="hlFooter__inner">
        <div className="hlFooter__brandBlock">
          <strong className="hlFooter__brand">
            {settings.brandName}
          </strong>
             <p>
            {settings.footerTagline}
          </p>
          <br></br>
    <p><strong>Адрес:</strong>
          </p>
          <p>{settings.addressFull}
          </p>
          <br></br>
            <br></br>
    <p><strong>За контакти:</strong>
          </p>
          <p>Мобилен: {settings.phoneDisplay}
          </p>
          <br></br>
              <br></br>
    <p><strong>ИМЕЙЛ АДРЕС :</strong>
          </p>
          <p>{settings.email}

          </p>
          <br></br>
        </div>



        <div className="hlFooter__legal">
          <small>© 2026 {settings.lawyerName} · Разград</small>

          <div className="hlFooter__legalLinks">
            <a href="/privacy">Поверителност</a>

            <button type="button" onClick={openCookieSettings}>
              Бисквитки
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
