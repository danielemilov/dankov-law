import './Footer.css';

export default function Footer() {
  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('dankov:open-cookie-settings'));
  };

  return (
    <footer className="hlFooter" id="legal">
      <div className="hlFooter__inner">
        <div className="hlFooter__brandBlock">
          <strong className="hlFooter__brand">
            Диян Данков 
          </strong>
             <p>
            Адвокат с мисия — защита на правата на всеки човек, без изключение.
          </p>
          <br></br>
    <p><strong>Адрес:</strong>
          </p>
          <p>ул."Осъм" 4, ет. 3, офис 321, гр.Разград, България, 7200
          </p>
          <br></br>
            <br></br>
    <p><strong>За контакти:</strong>
          </p>
          <p>Мобилен: 089 992 1629
          </p>
          <br></br>
              <br></br>
    <p><strong>ИМЕЙЛ АДРЕС :</strong>
          </p>
          <p>contact.dankov@gmail.com

          </p>
          <br></br>
        </div>



        <div className="hlFooter__legal">
          <small>© 2026 Адвокат Диян Данков · Разград</small>

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
