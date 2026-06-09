import { useMemo } from 'react';
import {
  ArrowRight,
  BellRing,
  Blocks,
  CheckCircle2,
  Contact,
  Globe2,
  Home,
  Link2,
  MessageSquareText,
  Navigation,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import './view/SettingsView.css';
import {
  BackLink,
  TextAreaField,
  TextField,
  ToggleField,
} from './AdminUi.jsx';
import { SETTINGS_PANELS } from './AdminConfig.js';

const PANEL_ICONS = {
  general: Contact,
  navigation: Navigation,
  homepage: Home,
  contact: SlidersHorizontal,
  chat: MessageSquareText,
  components: Blocks,
};

const PANEL_META = {
  general: {
    eyebrow: 'Идентичност и контакти',
    title: 'Основна информация',
    description:
      'Редактирайте данните, които се използват в целия сайт — име, телефон, имейл, адрес и footer съдържание.',
  },
  navigation: {
    eyebrow: 'Главно меню',
    title: 'Навигация',
    description:
      'Управлявайте кои връзки се виждат, как са изписани и накъде води основният CTA бутон.',
  },
  homepage: {
    eyebrow: 'Първо впечатление',
    title: 'Начална страница',
    description:
      'Настройте hero заглавията, основните действия и видимостта на ключовите секции.',
  },
  contact: {
    eyebrow: 'Контакт с клиента',
    title: 'Контакт и форма',
    description:
      'Редактирайте текстовете около контактната секция и формата за заявка за консултация.',
  },
  chat: {
    eyebrow: 'Директна комуникация',
    title: 'Директен чат',
    description:
      'Управлявайте welcome съобщението, известията, статусите, polling настройките и бързите въпроси.',
  },
  components: {
    eyebrow: 'Глобално поведение',
    title: 'Компоненти',
    description:
      'Включвайте и изключвайте глобални елементи като intro loader и cookie banner.',
  },
};

function SettingsHub({ navigate, controller }) {
  const { settings } = controller;

  const enabledSummary = useMemo(() => {
    const navigationItems = [
      settings.navigation?.showAbout !== false,
      settings.navigation?.showNews !== false,
      settings.navigation?.showContact !== false,
      settings.navigation?.showChat !== false,
    ].filter(Boolean).length;

    const homeSections = [
      settings.homePage?.heroEnabled !== false,
      settings.homePage?.casesEnabled !== false,
      settings.homePage?.contactEnabled !== false,
      settings.homePage?.footerEnabled !== false,
    ].filter(Boolean).length;

    const chatEnabled = settings.chat?.enabled !== false;

    return {
      navigationItems,
      homeSections,
      chatEnabled,
    };
  }, [settings]);

  function openPanel(panelId) {
    navigate({ section: 'settings', itemId: '', settingsPanel: panelId });
  }

  return (
    <div className="dAdminView dAdminSettingsView">
      <section className="dAdminPageIntro dAdminPageIntro--settings">
        <div>
          <BackLink
            onClick={() => navigate({ section: 'overview', itemId: '', settingsPanel: '' })}
          >
            Към таблото
          </BackLink>
          <span className="dAdminEyebrow">Управление на сайта</span>
          <h2>Настройки</h2>
          <p>
            Вместо една дълга и объркваща форма, настройките са разделени на
            ясни категории. Отворете само секцията, която искате да редактирате.
          </p>
        </div>

        <div className="dAdminPageIntro__status">
          <span className="is-clear">
            <ShieldCheck size={17} />
            Централизирано управление
          </span>
        </div>
      </section>

      <section className="dAdminSettingsSummary" aria-label="Обобщение на настройките">
        <div className="dAdminSettingsSummary__item">
          <Navigation size={18} />
          <span>
            <small>Навигация</small>
            <strong>{enabledSummary.navigationItems}/4 активни връзки</strong>
          </span>
        </div>

        <div className="dAdminSettingsSummary__item">
          <Home size={18} />
          <span>
            <small>Начална страница</small>
            <strong>{enabledSummary.homeSections}/4 активни секции</strong>
          </span>
        </div>

        <div className="dAdminSettingsSummary__item">
          <MessageSquareText size={18} />
          <span>
            <small>Директен чат</small>
            <strong>{enabledSummary.chatEnabled ? 'Включен' : 'Изключен'}</strong>
          </span>
        </div>
      </section>

      <section className="dAdminSettingsGrid">
        {SETTINGS_PANELS.map((panel) => {
          const Icon = PANEL_ICONS[panel.id] || Settings2;

          return (
            <button
              className="dAdminSettingsCard"
              key={panel.id}
              type="button"
              onClick={() => openPanel(panel.id)}
            >
              <span className="dAdminSettingsCard__icon">
                <Icon size={22} />
              </span>

              <span className="dAdminSettingsCard__copy">
                <small>Настройка</small>
                <strong>{panel.label}</strong>
                <span>{panel.description}</span>
              </span>

              <ArrowRight size={19} />
            </button>
          );
        })}
      </section>

      <section className="dAdminSettingsHelp">
        <span className="dAdminSettingsHelp__icon">
          <Sparkles size={18} />
        </span>
        <div>
          <strong>По-лесно управление без технически риск</strong>
          <p>
            Всички промени продължават да използват същата структура на
            настройките и същия API маршрут от стария админ панел.
          </p>
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ panelId, navigate, saving, onSave }) {
  const meta = PANEL_META[panelId] || PANEL_META.general;
  const Icon = PANEL_ICONS[panelId] || Settings2;

  return (
    <section className="dAdminSettingsEditorHead">
      <div>
        <BackLink
          onClick={() => navigate({ section: 'settings', itemId: '', settingsPanel: '' })}
        >
          Назад към настройките
        </BackLink>

        <span className="dAdminEyebrow">{meta.eyebrow}</span>
        <h2>{meta.title}</h2>
        <p>{meta.description}</p>
      </div>

      <div className="dAdminSettingsEditorHead__actions">
        <span className="dAdminSettingsEditorHead__icon">
          <Icon size={21} />
        </span>
        <button
          className="dAdminPrimaryAction"
          type="button"
          onClick={onSave}
          disabled={saving}
        >
          <Save size={17} />
          {saving ? 'Записване…' : 'Запази промените'}
        </button>
      </div>
    </section>
  );
}

function SectionBlock({ icon: Icon, eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`dAdminPanel dAdminSettingsSection ${className}`}>
      <header className="dAdminPanel__head dAdminSettingsSection__head">
        <div>
          <span className="dAdminPanel__icon">
            <Icon size={18} />
          </span>
          <div>
            {eyebrow && <small>{eyebrow}</small>}
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
      </header>

      <div className="dAdminSettingsSection__body">{children}</div>
    </section>
  );
}

function SettingsActions({ saving, onSave, navigate }) {
  return (
    <div className="dAdminSettingsStickyActions">
      <button
        className="dAdminSecondaryAction"
        type="button"
        onClick={() => navigate({ section: 'settings', itemId: '', settingsPanel: '' })}
      >
        Назад
      </button>

      <button
        className="dAdminPrimaryAction"
        type="button"
        onClick={onSave}
        disabled={saving}
      >
        <Save size={17} />
        {saving ? 'Записване…' : 'Запази промените'}
      </button>
    </div>
  );
}

function GeneralPanel({ controller }) {
  const { settings, updateSettingField } = controller;

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={Contact}
        eyebrow="Публични данни"
        title="Име и контакти"
        description="Тези данни се използват в различни секции на сайта."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Име в юридически текстове"
            value={settings.lawyerName}
            onChange={(value) => updateSettingField('lawyerName', value)}
          />
          <TextField
            label="Име в footer"
            value={settings.brandName}
            onChange={(value) => updateSettingField('brandName', value)}
          />
          <TextField
            label="Телефон за показване"
            value={settings.phoneDisplay}
            onChange={(value) => updateSettingField('phoneDisplay', value)}
          />
          <TextField
            label="Телефон за tel: линк"
            value={settings.phoneHref}
            onChange={(value) => updateSettingField('phoneHref', value)}
            placeholder="+359..."
          />
          <TextField
            label="Имейл"
            type="email"
            value={settings.email}
            onChange={(value) => updateSettingField('email', value)}
          />
          <TextField
            label="Работно време"
            value={settings.workingHours}
            onChange={(value) => updateSettingField('workingHours', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={Globe2}
        eyebrow="Локация"
        title="Адрес"
        description="Краткият адрес е подходящ за компактни елементи, а пълният — за карта и footer."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Кратък адрес"
            value={settings.addressShort}
            onChange={(value) => updateSettingField('addressShort', value)}
          />
          <TextField
            label="Пълен адрес"
            value={settings.addressFull}
            onChange={(value) => updateSettingField('addressFull', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={Sparkles}
        eyebrow="Footer"
        title="Кратко представяне"
        description="Текстът стои до контактите и марката в долната част на сайта."
      >
        <TextAreaField
          label="Footer описание"
          value={settings.footerTagline}
          onChange={(value) => updateSettingField('footerTagline', value)}
          rows={5}
        />
      </SectionBlock>
    </div>
  );
}

function NavigationPanel({ controller }) {
  const { settings, updateSettingGroup } = controller;
  const navigationSettings = settings.navigation || {};

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={Navigation}
        eyebrow="Видимост"
        title="Елементи в менюто"
        description="Изключеният елемент няма да се показва в основната навигация."
      >
        <div className="dAdminToggleGrid">
          <ToggleField
            label="За адвоката"
            description="Показвай връзката към профила."
            checked={navigationSettings.showAbout !== false}
            onChange={(value) => updateSettingGroup('navigation', 'showAbout', value)}
          />
          <ToggleField
            label="Новини"
            description="Показвай връзката към публикациите."
            checked={navigationSettings.showNews !== false}
            onChange={(value) => updateSettingGroup('navigation', 'showNews', value)}
          />
          <ToggleField
            label="Контакт"
            description="Показвай връзката към контактната секция."
            checked={navigationSettings.showContact !== false}
            onChange={(value) => updateSettingGroup('navigation', 'showContact', value)}
          />
          <ToggleField
            label="Чат"
            description="Показвай връзката към директния чат."
            checked={navigationSettings.showChat !== false}
            onChange={(value) => updateSettingGroup('navigation', 'showChat', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={Link2}
        eyebrow="Текстове"
        title="Етикети в менюто"
        description="Променете имената, които посетителите виждат в навигацията."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Етикет: За адвоката"
            value={navigationSettings.aboutLabel}
            onChange={(value) => updateSettingGroup('navigation', 'aboutLabel', value)}
          />
          <TextField
            label="Етикет: Новини"
            value={navigationSettings.newsLabel}
            onChange={(value) => updateSettingGroup('navigation', 'newsLabel', value)}
          />
          <TextField
            label="Етикет: Контакт"
            value={navigationSettings.contactLabel}
            onChange={(value) => updateSettingGroup('navigation', 'contactLabel', value)}
          />
          <TextField
            label="Етикет: Чат"
            value={navigationSettings.chatLabel}
            onChange={(value) => updateSettingGroup('navigation', 'chatLabel', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={ArrowRight}
        eyebrow="Основно действие"
        title="CTA бутон"
        description="Главният бутон в менюто трябва да има кратък текст и валиден вътрешен или външен линк."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="CTA текст"
            value={navigationSettings.ctaLabel}
            onChange={(value) => updateSettingGroup('navigation', 'ctaLabel', value)}
          />
          <TextField
            label="CTA линк"
            value={navigationSettings.ctaHref}
            onChange={(value) => updateSettingGroup('navigation', 'ctaHref', value)}
            placeholder="#contact"
          />
        </div>
      </SectionBlock>
    </div>
  );
}

function HomepagePanel({ controller }) {
  const { settings, updateSettingGroup } = controller;
  const homePage = settings.homePage || {};

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={Blocks}
        eyebrow="Структура"
        title="Видими секции"
        description="Изключете секция само когато временно не искате да се показва на началната страница."
      >
        <div className="dAdminToggleGrid">
          <ToggleField
            label="Hero секция"
            description="Основната начална визия и заглавие."
            checked={homePage.heroEnabled !== false}
            onChange={(value) => updateSettingGroup('homePage', 'heroEnabled', value)}
          />
          <ToggleField
            label="Новини и казуси"
            description="Секцията с публикации и практики."
            checked={homePage.casesEnabled !== false}
            onChange={(value) => updateSettingGroup('homePage', 'casesEnabled', value)}
          />
          <ToggleField
            label="Контактна секция"
            description="Контакти и форма за консултация."
            checked={homePage.contactEnabled !== false}
            onChange={(value) => updateSettingGroup('homePage', 'contactEnabled', value)}
          />
          <ToggleField
            label="Footer"
            description="Долната част на сайта."
            checked={homePage.footerEnabled !== false}
            onChange={(value) => updateSettingGroup('homePage', 'footerEnabled', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={Home}
        eyebrow="Hero"
        title="Заглавия"
        description="Desktop и mobile вариантите могат да бъдат различни, за да стоят правилно във всеки размер."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Desktop заглавие"
            value={homePage.heroTitleLine}
            onChange={(value) => updateSettingGroup('homePage', 'heroTitleLine', value)}
          />
          <TextField
            label="Desktop акцент"
            value={homePage.heroTitleAccent}
            onChange={(value) => updateSettingGroup('homePage', 'heroTitleAccent', value)}
          />
          <TextField
            label="Mobile заглавие"
            value={homePage.mobileTitleLine}
            onChange={(value) => updateSettingGroup('homePage', 'mobileTitleLine', value)}
          />
          <TextField
            label="Mobile акцент"
            value={homePage.mobileTitleAccent}
            onChange={(value) => updateSettingGroup('homePage', 'mobileTitleAccent', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={ArrowRight}
        eyebrow="Действия"
        title="Hero бутони"
        description="Основният бутон трябва да води към най-важното действие, а вторият — към допълнителна информация."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Основен CTA текст"
            value={homePage.primaryCtaLabel}
            onChange={(value) => updateSettingGroup('homePage', 'primaryCtaLabel', value)}
          />
          <TextField
            label="Основен CTA линк"
            value={homePage.primaryCtaHref}
            onChange={(value) => updateSettingGroup('homePage', 'primaryCtaHref', value)}
          />
          <TextField
            label="Втори CTA текст"
            value={homePage.secondaryCtaLabel}
            onChange={(value) => updateSettingGroup('homePage', 'secondaryCtaLabel', value)}
          />
          <TextField
            label="Втори CTA линк"
            value={homePage.secondaryCtaHref}
            onChange={(value) => updateSettingGroup('homePage', 'secondaryCtaHref', value)}
          />
        </div>
      </SectionBlock>
    </div>
  );
}

function ContactPanel({ controller }) {
  const { settings, updateSettingGroup } = controller;
  const contactPage = settings.contactPage || {};

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={Contact}
        eyebrow="Представяне"
        title="Контактна секция"
        description="Текстовете трябва ясно да обясняват как клиентът може да се свърже и какво следва."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Kicker текст"
            value={contactPage.kicker}
            onChange={(value) => updateSettingGroup('contactPage', 'kicker', value)}
          />
          <TextField
            label="Заглавие"
            value={contactPage.titleStart}
            onChange={(value) => updateSettingGroup('contactPage', 'titleStart', value)}
          />
          <TextField
            label="Заглавие акцент"
            value={contactPage.titleEmphasis}
            onChange={(value) => updateSettingGroup('contactPage', 'titleEmphasis', value)}
          />
          <TextField
            label="Заглавие на формата"
            value={contactPage.bookingTitle}
            onChange={(value) => updateSettingGroup('contactPage', 'bookingTitle', value)}
          />
        </div>

        <TextAreaField
          label="Описание в контакт секцията"
          value={contactPage.summary}
          onChange={(value) => updateSettingGroup('contactPage', 'summary', value)}
          rows={5}
        />
      </SectionBlock>

      <SectionBlock
        icon={SlidersHorizontal}
        eyebrow="Форма"
        title="Въвеждащ текст"
        description="Кратко обяснение преди полетата помага на клиента да попълни заявката по-уверено."
      >
        <TextAreaField
          label="Описание във формата"
          value={contactPage.bookingLead}
          onChange={(value) => updateSettingGroup('contactPage', 'bookingLead', value)}
          rows={6}
        />
      </SectionBlock>
    </div>
  );
}

function ChatPanel({ controller }) {
  const {
    settings,
    updateSettingGroup,
    updateQuickReply,
    addQuickReply,
    removeQuickReply,
  } = controller;
  const chat = settings.chat || {};
  const quickReplies = chat.quickReplies || [];

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={MessageSquareText}
        eyebrow="Достъпност"
        title="Чат функции"
        description="Контролирайте дали widget-ът и директният разговор с адвоката са достъпни."
      >
        <div className="dAdminToggleGrid">
          <ToggleField
            label="Показвай чат widget"
            description="Главният бутон за чат остава видим в сайта."
            checked={chat.enabled !== false}
            onChange={(value) => updateSettingGroup('chat', 'enabled', value)}
          />
          <ToggleField
            label="Позволи директен чат"
            description="Посетителят може да поиска отговор от адвокат."
            checked={chat.directChatEnabled !== false}
            onChange={(value) => updateSettingGroup('chat', 'directChatEnabled', value)}
          />
          <ToggleField
            label="Browser известия"
            description="Посетителите могат да получават известия за нов отговор."
            checked={chat.browserNotificationsEnabled !== false}
            onChange={(value) => updateSettingGroup('chat', 'browserNotificationsEnabled', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={BellRing}
        eyebrow="Комуникация"
        title="Съобщения и статуси"
        description="Тези текстове се виждат от клиента в различни моменти от разговора."
      >
        <TextAreaField
          label="Welcome съобщение"
          value={chat.welcomeMessage}
          onChange={(value) => updateSettingGroup('chat', 'welcomeMessage', value)}
          rows={5}
        />

        <div className="dAdminFieldGrid dAdminFieldGrid--two">
          <TextField
            label="Direct CTA текст"
            value={chat.directCtaLabel}
            onChange={(value) => updateSettingGroup('chat', 'directCtaLabel', value)}
          />
          <TextField
            label="Заглавие на browser известие"
            value={chat.notificationTitle}
            onChange={(value) => updateSettingGroup('chat', 'notificationTitle', value)}
          />
          <TextField
            label="Direct статус в header"
            value={chat.lawyerOnlineLabel}
            onChange={(value) => updateSettingGroup('chat', 'lawyerOnlineLabel', value)}
          />
          <TextField
            label="Общ статус в header"
            value={chat.generalOnlineLabel}
            onChange={(value) => updateSettingGroup('chat', 'generalOnlineLabel', value)}
          />
        </div>

        <TextAreaField
          label="Текст на browser известие"
          value={chat.notificationBody}
          onChange={(value) => updateSettingGroup('chat', 'notificationBody', value)}
          rows={3}
        />
      </SectionBlock>

      <SectionBlock
        icon={Settings2}
        eyebrow="Технически параметри"
        title="Обновяване и история"
        description="Променяйте тези стойности внимателно. По-ниско време означава по-чести заявки към сървъра."
      >
        <div className="dAdminFieldGrid dAdminFieldGrid--three">
          <TextField
            label="Polling direct ms"
            type="number"
            value={chat.directPollMs}
            onChange={(value) => updateSettingGroup('chat', 'directPollMs', value)}
          />
          <TextField
            label="Polling passive ms"
            type="number"
            value={chat.passivePollMs}
            onChange={(value) => updateSettingGroup('chat', 'passivePollMs', value)}
          />
          <TextField
            label="Запазени съобщения"
            type="number"
            value={chat.maxStoredMessages}
            onChange={(value) => updateSettingGroup('chat', 'maxStoredMessages', value)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        icon={Sparkles}
        eyebrow="Начало на разговор"
        title="Бързи въпроси"
        description="Кратките предложения помагат на посетителя да започне разговор без да пише дълъг текст."
      >
        <div className="dAdminQuickReplyManager">
          <div className="dAdminQuickReplyManager__head">
            <div>
              <strong>{quickReplies.length}/8 въпроса</strong>
              <span>Можете да добавите до осем предложения.</span>
            </div>

            <button
              className="dAdminSecondaryAction"
              type="button"
              onClick={addQuickReply}
              disabled={quickReplies.length >= 8}
            >
              <Plus size={16} />
              Добави въпрос
            </button>
          </div>

          <div className="dAdminQuickReplyList">
            {quickReplies.map((quickReply, index) => (
              <div className="dAdminQuickReplyRow" key={`quick-reply-${index}`}>
                <span>{index + 1}</span>
                <input
                  value={quickReply}
                  onChange={(event) => updateQuickReply(index, event.target.value)}
                  aria-label={`Бърз въпрос ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeQuickReply(index)}
                  disabled={quickReplies.length <= 1}
                  aria-label={`Изтрий бърз въпрос ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}

function ComponentsPanel({ controller }) {
  const { settings, updateSettingGroup } = controller;
  const components = settings.components || {};

  return (
    <div className="dAdminSettingsEditorGrid">
      <SectionBlock
        icon={Blocks}
        eyebrow="Глобални елементи"
        title="Компоненти в целия сайт"
        description="Изключването е незабавно след запис и засяга всички страници, които използват компонента."
      >
        <div className="dAdminToggleGrid">
          <ToggleField
            label="Brand intro loader"
            description="Началната brand анимация при зареждане."
            checked={components.brandIntroEnabled !== false}
            onChange={(value) => updateSettingGroup('components', 'brandIntroEnabled', value)}
          />
          <ToggleField
            label="Cookie banner"
            description="Информационният banner за cookies."
            checked={components.cookieBannerEnabled !== false}
            onChange={(value) => updateSettingGroup('components', 'cookieBannerEnabled', value)}
          />
        </div>
      </SectionBlock>

      <section className="dAdminSettingsSafetyNote">
        <span>
          <CheckCircle2 size={18} />
        </span>
        <div>
          <strong>Промените се записват централизирано</strong>
          <p>
            Тези превключватели използват същия `components` обект от
            съществуващите настройки и не променят API структурата.
          </p>
        </div>
      </section>
    </div>
  );
}

function SettingsEditor({ route, navigate, controller }) {
  const panelId = PANEL_META[route.settingsPanel] ? route.settingsPanel : 'general';
  const { saving, saveSettings } = controller;

  async function handleSave() {
    await saveSettings();
  }

  let panel = <GeneralPanel controller={controller} />;

  if (panelId === 'navigation') panel = <NavigationPanel controller={controller} />;
  if (panelId === 'homepage') panel = <HomepagePanel controller={controller} />;
  if (panelId === 'contact') panel = <ContactPanel controller={controller} />;
  if (panelId === 'chat') panel = <ChatPanel controller={controller} />;
  if (panelId === 'components') panel = <ComponentsPanel controller={controller} />;

  return (
    <div className="dAdminView dAdminSettingsEditor">
      <PanelHeader
        panelId={panelId}
        navigate={navigate}
        saving={saving}
        onSave={handleSave}
      />

      {panel}

      <SettingsActions
        saving={saving}
        onSave={handleSave}
        navigate={navigate}
      />
    </div>
  );
}

export default function SettingsView({ route, navigate, controller }) {
  if (route.settingsPanel) {
    return (
      <SettingsEditor
        route={route}
        navigate={navigate}
        controller={controller}
      />
    );
  }

  return <SettingsHub navigate={navigate} controller={controller} />;
}
