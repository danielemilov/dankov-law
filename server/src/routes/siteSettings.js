import { Router } from 'express';

import SiteSettings from '../models/SiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

export async function getSiteSettings() {
  return SiteSettings.findOneAndUpdate(
    { singleton: 'main' },
    { $setOnInsert: { singleton: 'main' } },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }
  ).lean();
}

export function publicSettings(settings) {
  const navigation = settings.navigation || {};
  const homePage = settings.homePage || {};
  const contactPage = settings.contactPage || {};
  const chat = settings.chat || {};
  const components = settings.components || {};

  return {
    lawyerName: settings.lawyerName,
    brandName: settings.brandName,
    footerTagline: settings.footerTagline,
    phoneDisplay: settings.phoneDisplay,
    phoneHref: settings.phoneHref,
    email: settings.email,
    addressShort: settings.addressShort,
    addressFull: settings.addressFull,
    workingHours: settings.workingHours,
    navigation: {
      showAbout: navigation.showAbout !== false,
      aboutLabel: navigation.aboutLabel || 'За адвоката',
      showNews: navigation.showNews !== false,
      newsLabel: navigation.newsLabel || 'Новини',
      showContact: navigation.showContact !== false,
      contactLabel: navigation.contactLabel || 'Контакт',
      showChat: navigation.showChat !== false,
      chatLabel: navigation.chatLabel || 'Чат',
      ctaLabel: navigation.ctaLabel || 'Запази час',
      ctaHref: navigation.ctaHref || '/kontakt#booking',
    },
    homePage: {
      heroEnabled: homePage.heroEnabled !== false,
      casesEnabled: homePage.casesEnabled !== false,
      contactEnabled: homePage.contactEnabled !== false,
      footerEnabled: homePage.footerEnabled !== false,
      heroTitleLine: homePage.heroTitleLine || 'Доверието започва',
      heroTitleAccent: homePage.heroTitleAccent || 'преди делото.',
      mobileTitleLine: homePage.mobileTitleLine || 'Защитата започва',
      mobileTitleAccent: homePage.mobileTitleAccent || 'преди делото.',
      primaryCtaLabel: homePage.primaryCtaLabel || 'Запази консултация',
      primaryCtaHref: homePage.primaryCtaHref || '#contact',
      secondaryCtaLabel: homePage.secondaryCtaLabel || 'Последни новини',
      secondaryCtaHref: homePage.secondaryCtaHref || '#cases',
    },
    contactPage: {
      kicker: contactPage.kicker || 'Свържете се',
      titleStart: contactPage.titleStart || 'Запазете',
      titleEmphasis: contactPage.titleEmphasis || 'консултация.',
      summary:
        contactPage.summary ||
        'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
      bookingTitle: contactPage.bookingTitle || 'Опишете казуса си',
      bookingLead:
        contactPage.bookingLead ||
        'Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.',
    },
    chat: {
      enabled: chat.enabled !== false,
      directChatEnabled: chat.directChatEnabled !== false,
      browserNotificationsEnabled: chat.browserNotificationsEnabled !== false,
      welcomeMessage:
        chat.welcomeMessage ||
        'Здравейте. Опишете накратко казуса си и ще ви ориентирам общо към следваща стъпка.',
      directCtaLabel: chat.directCtaLabel || 'Директен чат с г-н Данков',
      notificationTitle: chat.notificationTitle || 'Нов отговор от адв. Данков',
      notificationBody: chat.notificationBody || 'Имате нов отговор в директния чат.',
      lawyerOnlineLabel: chat.lawyerOnlineLabel || 'Директен чат · очаква отговор',
      generalOnlineLabel: chat.generalOnlineLabel || 'Онлайн запитване · обща информация',
      directPollMs: chat.directPollMs || 8000,
      passivePollMs: chat.passivePollMs || 16000,
      maxStoredMessages: chat.maxStoredMessages || 100,
      quickReplies: Array.isArray(chat.quickReplies) && chat.quickReplies.length > 0
        ? chat.quickReplies
        : [
          'Уволниха ме дисциплинарно',
          'Имам случай на дискриминация',
          'Омразна реч онлайн',
          'Получих акт или заповед',
          'Искам консултация',
        ],
    },
    components: {
      brandIntroEnabled: components.brandIntroEnabled !== false,
      cookieBannerEnabled: components.cookieBannerEnabled !== false,
    },
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  res.json({
    success: true,
    settings: publicSettings(settings),
  });
}));

export default router;
