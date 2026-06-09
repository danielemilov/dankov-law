import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: 'main',
      unique: true,
      immutable: true,
    },
    lawyerName: {
      type: String,
      trim: true,
      maxlength: 90,
      default: 'Адвокат Диян Данков',
    },
    brandName: {
      type: String,
      trim: true,
      maxlength: 90,
      default: 'Диян Данков',
    },
    footerTagline: {
      type: String,
      trim: true,
      maxlength: 240,
      default: 'Адвокат с мисия - защита на правата на всеки човек, без изключение.',
    },
    phoneDisplay: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '089 992 1629',
    },
    phoneHref: {
      type: String,
      trim: true,
      maxlength: 60,
      default: '+359899921629',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: 'contact.dankov@gmail.com',
    },
    addressShort: {
      type: String,
      trim: true,
      maxlength: 180,
      default: 'ул. "Осъм" 4, ет. 3, офис 321, гр. Разград',
    },
    addressFull: {
      type: String,
      trim: true,
      maxlength: 260,
      default: 'ул. Осъм 4, ет. 3, офис 321, Разград 7200, България',
    },
    workingHours: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Понеделник - Петък · 09:00-18:00',
    },
    navigation: {
      showAbout: { type: Boolean, default: true },
      aboutLabel: { type: String, trim: true, maxlength: 40, default: 'За адвоката' },
      showNews: { type: Boolean, default: true },
      newsLabel: { type: String, trim: true, maxlength: 40, default: 'Новини' },
      showContact: { type: Boolean, default: true },
      contactLabel: { type: String, trim: true, maxlength: 40, default: 'Контакт' },
      showChat: { type: Boolean, default: true },
      chatLabel: { type: String, trim: true, maxlength: 40, default: 'Чат' },
      ctaLabel: { type: String, trim: true, maxlength: 60, default: 'Запази час' },
      ctaHref: { type: String, trim: true, maxlength: 120, default: '/kontakt#booking' },
    },
    homePage: {
      heroEnabled: { type: Boolean, default: true },
      casesEnabled: { type: Boolean, default: true },
      contactEnabled: { type: Boolean, default: true },
      footerEnabled: { type: Boolean, default: true },
      heroTitleLine: { type: String, trim: true, maxlength: 90, default: 'Доверието започва' },
      heroTitleAccent: { type: String, trim: true, maxlength: 90, default: 'преди делото.' },
      mobileTitleLine: { type: String, trim: true, maxlength: 90, default: 'Защитата започва' },
      mobileTitleAccent: { type: String, trim: true, maxlength: 90, default: 'преди делото.' },
      primaryCtaLabel: { type: String, trim: true, maxlength: 60, default: 'Запази консултация' },
      primaryCtaHref: { type: String, trim: true, maxlength: 120, default: '#contact' },
      secondaryCtaLabel: { type: String, trim: true, maxlength: 60, default: 'Последни новини' },
      secondaryCtaHref: { type: String, trim: true, maxlength: 120, default: '#cases' },
    },
    contactPage: {
      kicker: { type: String, trim: true, maxlength: 80, default: 'Свържете се' },
      titleStart: { type: String, trim: true, maxlength: 80, default: 'Запазете' },
      titleEmphasis: { type: String, trim: true, maxlength: 80, default: 'консултация.' },
      summary: {
        type: String,
        trim: true,
        maxlength: 420,
        default:
          'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
      },
      bookingTitle: { type: String, trim: true, maxlength: 100, default: 'Опишете казуса си' },
      bookingLead: {
        type: String,
        trim: true,
        maxlength: 420,
        default:
          'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
      },
    },
    chat: {
      enabled: { type: Boolean, default: true },
      directChatEnabled: { type: Boolean, default: true },
      browserNotificationsEnabled: { type: Boolean, default: true },
      welcomeMessage: {
        type: String,
        trim: true,
        maxlength: 420,
        default:
          'Здравейте. Опишете накратко казуса си и ще ви ориентирам общо към следваща стъпка.',
      },
      directCtaLabel: { type: String, trim: true, maxlength: 80, default: 'Директен чат с г-н Данков' },
      notificationTitle: { type: String, trim: true, maxlength: 90, default: 'Нов отговор от адв. Данков' },
      notificationBody: {
        type: String,
        trim: true,
        maxlength: 180,
        default: 'Имате нов отговор в директния чат.',
      },
      lawyerOnlineLabel: {
        type: String,
        trim: true,
        maxlength: 80,
        default: 'Директен чат · очаква отговор',
      },
      generalOnlineLabel: {
        type: String,
        trim: true,
        maxlength: 80,
        default: 'Онлайн запитване · обща информация',
      },
      directPollMs: { type: Number, min: 4000, max: 60000, default: 8000 },
      passivePollMs: { type: Number, min: 8000, max: 120000, default: 16000 },
      maxStoredMessages: { type: Number, min: 20, max: 200, default: 100 },
      quickReplies: {
        type: [String],
        default: [
          'Уволниха ме дисциплинарно',
          'Имам случай на дискриминация',
          'Омразна реч онлайн',
          'Получих акт или заповед',
          'Искам консултация',
        ],
        validate: {
          validator(values) {
            return values.length <= 8 && values.every((value) => String(value).length <= 80);
          },
          message: 'Бързите въпроси в чата са твърде много или твърде дълги.',
        },
      },
    },
    components: {
      brandIntroEnabled: { type: Boolean, default: true },
      cookieBannerEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSettings', siteSettingsSchema);
