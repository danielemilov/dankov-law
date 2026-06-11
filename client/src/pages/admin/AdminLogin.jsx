import { ArrowRight } from 'lucide-react';
import { TextField } from './AdminUi.jsx';
import './view/AdminLogin.css';

export default function AdminLogin({
  booting,
  configured,
  error,
  loginForm,
  setLoginForm,
  login,
  saving,
}) {
  const DankovPhoto = ({ loader = false }) => (
    <span className={`${loader ? 'dAdminLoader__mark' : 'dAdminAuthCard__mark'} dAdminPhotoMark`}>
      <img src="/diyan-dankov.png" alt="Dankov Admin" />
    </span>
  );

  if (booting) {
    return (
      <main className="dAdminLoginShell dAdminAuthShell">
        <div className="dAdminLoader" aria-live="polite">
          <DankovPhoto loader />
          <div>
            <strong>Dankov Admin</strong>
            <p>Зареждане на работното пространство…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dAdminAuthShell">
      <section className="dAdminAuthCard">
        <div className="dAdminAuthCard__brand">
          <DankovPhoto />
          <span>Dankov Admin</span>
        </div>

        <div className="dAdminAuthCard__copy">
          <span className="dAdminEyebrow">Сигурен достъп</span>
          <h1>Добре дошли обратно.</h1>
          <p>Управлявайте разговорите, новините и съдържанието на сайта от едно ясно работно пространство.</p>
        </div>

        {!configured && (
          <div className="dAdminNotice dAdminNotice--error">
            Добавете ADMIN_USERNAME, ADMIN_PASSWORD и ADMIN_SESSION_SECRET в server/.env.
          </div>
        )}

        {error && <div className="dAdminNotice dAdminNotice--error">{error}</div>}

        <form className="dAdminAuthForm" onSubmit={login}>
          <TextField
            label="Потребител"
            value={loginForm.username}
            onChange={(value) => setLoginForm((current) => ({ ...current, username: value }))}
          />

          <TextField
            label="Парола"
            type="password"
            value={loginForm.password}
            onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))}
          />

          <button
            className="dAdminButton dAdminButton--primary dAdminButton--large"
            type="submit"
            disabled={saving || !configured}
          >
            {saving ? 'Влизане…' : 'Вход в панела'}
            {!saving && <ArrowRight size={18} />}
          </button>
        </form>
      </section>
    </main>
  );
}