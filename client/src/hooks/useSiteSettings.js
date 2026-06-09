import {
  useEffect,
  useState,
} from 'react';

import api from '../lib/api.js';

export const defaultSiteSettings = {
  lawyerName: 'Адвокат Диян Данков',
  brandName: 'Диян Данков',
  footerTagline: 'Адвокат с мисия - защита на правата на всеки човек, без изключение.',
  phoneDisplay: '089 992 1629',
  phoneHref: '+359899921629',
  email: 'contact.dankov@gmail.com',
  addressShort: 'ул. "Осъм" 4, ет. 3, офис 321, гр. Разград',
  addressFull: 'ул. Осъм 4, ет. 3, офис 321, Разград 7200, България',
  workingHours: 'Понеделник - Петък · 09:00-18:00',
  navigation: {
    showAbout: true,
    aboutLabel: 'За адвоката',
    showNews: true,
    newsLabel: 'Новини',
    showContact: true,
    contactLabel: 'Контакт',
    showChat: true,
    chatLabel: 'Чат',
    ctaLabel: 'Запази час',
    ctaHref: '/kontakt#booking',
  },
  homePage: {
    heroEnabled: true,
    casesEnabled: true,
    contactEnabled: true,
    footerEnabled: true,
    heroTitleLine: 'Доверието започва',
    heroTitleAccent: 'преди делото.',
    mobileTitleLine: 'Защитата започва',
    mobileTitleAccent: 'преди делото.',
    primaryCtaLabel: 'Запази консултация',
    primaryCtaHref: '#contact',
    secondaryCtaLabel: 'Последни новини',
    secondaryCtaHref: '#cases',
  },
  contactPage: {
    kicker: 'Свържете се',
    titleStart: 'Запазете',
    titleEmphasis: 'консултация.',
    summary:
      'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
    bookingTitle: 'Опишете казуса си',
    bookingLead:
      'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
  },
  chat: {
    enabled: true,
    directChatEnabled: true,
    browserNotificationsEnabled: true,
    welcomeMessage:
      'Здравейте. Опишете накратко казуса си и ще ви ориентирам общо към следваща стъпка.',
    directCtaLabel: 'Директен чат с г-н Данков',
    notificationTitle: 'Нов отговор от адв. Данков',
    notificationBody: 'Имате нов отговор в директния чат.',
    lawyerOnlineLabel: 'Директен чат · очаква отговор',
    generalOnlineLabel: 'Онлайн запитване · обща информация',
    directPollMs: 8000,
    passivePollMs: 16000,
    maxStoredMessages: 100,
    quickReplies: [
      'Уволниха ме дисциплинарно',
      'Имам случай на дискриминация',
      'Омразна реч онлайн',
      'Получих акт или заповед',
      'Искам консултация',
    ],
  },
  components: {
    brandIntroEnabled: true,
    cookieBannerEnabled: true,
  },
};

let cachedSettings = null;

export function mergeSiteSettings(value = {}) {
  return {
    ...defaultSiteSettings,
    ...value,
    navigation: {
      ...defaultSiteSettings.navigation,
      ...(value.navigation || {}),
    },
    homePage: {
      ...defaultSiteSettings.homePage,
      ...(value.homePage || {}),
    },
    contactPage: {
      ...defaultSiteSettings.contactPage,
      ...(value.contactPage || {}),
    },
    chat: {
      ...defaultSiteSettings.chat,
      ...(value.chat || {}),
      quickReplies:
        Array.isArray(value.chat?.quickReplies) && value.chat.quickReplies.length > 0
          ? value.chat.quickReplies
          : defaultSiteSettings.chat.quickReplies,
    },
    components: {
      ...defaultSiteSettings.components,
      ...(value.components || {}),
    },
  };
}

export default function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings || defaultSiteSettings);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await api.get('/api/site-settings');
        const nextSettings = mergeSiteSettings(response.data?.settings || {});

        cachedSettings = nextSettings;
        if (!cancelled) setSettings(nextSettings);
      } catch {
        if (!cancelled) setSettings(cachedSettings || defaultSiteSettings);
      }
    }

    if (!cachedSettings) {
      loadSettings();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
