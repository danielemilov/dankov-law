import { hasAnyStem, hasAnyToken, hasPhrase } from './normalize.js';

const OFFICE = {
  lawyer: 'адвокат Диян Данков',
  city: 'Разград',
  address: 'ул. "Осъм" 4, ет. 3, офис 321, гр. Разград, България, 7200',
  email: 'contact.dankov@gmail.com',
  phone: '089 992 1629',
  hours: 'Понеделник - Петък, 09:00-18:00',
};

function isOnlyGreeting(doc) {
  return (
    doc.tokens.length <= 3 &&
    (hasAnyToken(doc, ['zdravei', 'hello', 'hi', 'alo', 'dobar', 'den']) ||
      hasPhrase(doc, 'dobar den'))
  );
}

function asksWellbeing(doc) {
  return (
    hasPhrase(doc, 'kak si') ||
    hasPhrase(doc, 'kak ste') ||
    hasPhrase(doc, 'kak varvi') ||
    hasPhrase(doc, 'kak e')
  );
}

function asksAddress(doc) {
  return (
    hasAnyStem(doc, ['adres', 'lokats']) ||
    hasPhrase(doc, 'kade se namirate') ||
    hasPhrase(doc, 'kade e kantorata')
  );
}

function asksPhone(doc) {
  return (
    hasAnyToken(doc, ['telefon', 'mobillen', 'nomer', 'kontakt']) ||
    hasAnyStem(doc, ['svarzh', 'svurzh', 'obad']) ||
    hasPhrase(doc, 'kak da se obadya') ||
    hasPhrase(doc, 'ima li telefon') ||
    hasPhrase(doc, 'kak da se svarzha')
  );
}

function asksEmail(doc) {
  return hasAnyToken(doc, ['email', 'imeil', 'mail']) || hasPhrase(doc, 'imeil adres');
}

function asksHours(doc) {
  return (
    hasAnyToken(doc, ['rabotno', 'vreme', 'chasove']) ||
    hasPhrase(doc, 'koga rabotite') ||
    hasPhrase(doc, 'rabotno vreme')
  );
}

function isThanks(doc) {
  return doc.tokens.length <= 5 && hasAnyStem(doc, ['blagodar', 'merci']);
}

function isAcknowledgement(doc) {
  return (
    doc.tokens.length <= 4 &&
    (hasAnyToken(doc, ['ok', 'dobre', 'yasno', 'da']) ||
      hasPhrase(doc, 'razbrah') ||
      hasPhrase(doc, 'dobre blagodarya'))
  );
}

function hasNoDocuments(doc) {
  return (
    hasPhrase(doc, 'nyamam dokumenti') ||
    hasPhrase(doc, 'nyamam nikakvi dokumenti') ||
    hasPhrase(doc, 'nyama dokumenti') ||
    hasPhrase(doc, 'bez dokumenti') ||
    (hasAnyStem(doc, ['nyam']) && hasAnyStem(doc, ['dokument', 'akt', 'zapoved', 'skrinshot']))
  );
}

function isNeedHuman(doc) {
  return (
    hasPhrase(doc, 'iskam chovek') ||
    hasPhrase(doc, 'iskam advokat') ||
    hasPhrase(doc, 'govorya s advokat') ||
    hasPhrase(doc, 'realen advokat') ||
    hasPhrase(doc, 'ne s bot')
  );
}

function isBotQuestion(doc) {
  return (
    hasPhrase(doc, 'ti robot li si') ||
    hasPhrase(doc, 'ti ai li si') ||
    hasPhrase(doc, 'izkustven intelekt') ||
    hasPhrase(doc, 'bot li si')
  );
}

function build(kind, reply, extra = {}) {
  return {
    kind,
    reply,
    detectedIntent: 'general',
    confidence: extra.confidence ?? 0.72,
    label: extra.label || 'Общ разговор',
    shouldShowContactForm: Boolean(extra.shouldShowContactForm),
    priority: extra.priority || 'normal',
  };
}

export function detectConversationIntent(doc, previousState = {}) {
  const behavior = previousState.behavior || {};
  const activeIntent = previousState.activeIntent || 'unknown';
  const hasActiveCase = activeIntent && activeIntent !== 'unknown';

  if (asksWellbeing(doc)) {
    return build(
      'wellbeing',
      'Добре съм, благодаря. Готов съм да ви ориентирам общо. Опишете накратко казуса или попитайте за адрес, контакт, работно време или консултация.'
    );
  }

  if (isOnlyGreeting(doc)) {
    return build(
      'greeting',
      'Здравейте. Радвам се да помогна. Можете да опишете казуса с 1-2 изречения - какво се случи, кога и дали имате документ или съобщения.'
    );
  }

  if (hasNoDocuments(doc)) {
    return build(
      'noDocuments',
      hasActiveCase
        ? 'Добре, не е проблем, ако нямате документи. Опишете с ваши думи какво точно се случи, кога стана и кой участва - дати, съобщения и свидетели също могат да са важни.'
        : 'Добре, може и без документи. За начало напишете само какво се случи, кога стана и с кого е свързан проблемът.',
      {
        confidence: 0.86,
        label: 'Няма документи',
      }
    );
  }

  if (isAcknowledgement(doc)) {
    return build(
      'acknowledgement',
      hasActiveCase
        ? 'Добре. Добавете следващия важен детайл - дата, страна по спора, институция или какво искате да постигнете.'
        : 'Добре. Когато сте готови, опишете казуса с едно-две изречения или попитайте за контакт, адрес или час за консултация.',
      {
        confidence: 0.8,
        label: 'Кратък отговор',
      }
    );
  }

  if (isThanks(doc)) {
    return build(
      'thanks',
      'Моля. Ако има срок, акт, заповед, уволнение, полиция или съдебно заседание, не отлагайте и подгответе документите.'
    );
  }

  if (isNeedHuman(doc)) {
    return build(
      'humanContact',
      `Разбирам. Най-добре оставете телефон или имейл във формата, за да може кантората да върне контакт. Телефон: ${OFFICE.phone}, имейл: ${OFFICE.email}.`,
      {
        shouldShowContactForm: true,
        confidence: 0.9,
        label: 'Връзка с адвокат',
      }
    );
  }

  if (isBotQuestion(doc)) {
    return build(
      'botIdentity',
      'Аз съм чат асистент на сайта на адвокат Диян Данков. Работя с предварително зададена логика и давам само обща ориентация, а не конкретен правен съвет.'
    );
  }

  if (asksAddress(doc)) {
    return build(
      'address',
      `Кантората се намира на адрес: ${OFFICE.address}. Ако желаете, можете да оставите контакт през формата, за да се уточни консултация.`,
      { shouldShowContactForm: true, label: 'Адрес на кантората' }
    );
  }

  if (asksPhone(doc)) {
    return build(
      'phone',
      `Телефон за контакт: ${OFFICE.phone}. Можете също да оставите имейл или телефон във формата за обратна връзка.`,
      { shouldShowContactForm: true, label: 'Телефон за контакт' }
    );
  }

  if (asksEmail(doc)) {
    return build(
      'email',
      `Имейл за контакт: ${OFFICE.email}. За по-бърза ориентация добавете кратко описание на казуса и дали има срок или документ.`,
      { shouldShowContactForm: true, label: 'Имейл за контакт' }
    );
  }

  if (asksHours(doc)) {
    return build(
      'hours',
      `Работно време: ${OFFICE.hours}. При спешен срок опишете това ясно в заявката за консултация.`,
      { shouldShowContactForm: true, label: 'Работно време' }
    );
  }

  if (doc.text && doc.text === behavior.lastUserText) {
    const repeatedCount = Number(behavior.repeatedCount || 1) + 1;

    if (repeatedCount >= 3) {
      return build(
        'repeated',
        'Виждам, че повтаряте същото съобщение. За да не ви въртя в кръг с еднакви отговори, най-добре оставете телефон или имейл и кантората ще върне контакт за уточнение.',
        {
          shouldShowContactForm: true,
          confidence: 0.9,
          label: 'Повтарящо се съобщение',
        }
      );
    }

    return build(
      'repeated',
      'Вече отбелязах това. Ако искате по-точна насока, добавете нов детайл: кога се случи, какъв документ имате или коя институция/лице е замесено.',
      {
        confidence: 0.86,
        label: 'Повтарящо се съобщение',
      }
    );
  }

  return null;
}

export function updateBehaviorState(previousState = {}, doc, conversationIntent = null) {
  const previousBehavior = previousState.behavior || {};
  const repeatedCount =
    doc.text && doc.text === previousBehavior.lastUserText
      ? Number(previousBehavior.repeatedCount || 1) + 1
      : 1;

  return {
    ...previousState,
    behavior: {
      ...previousBehavior,
      lastUserText: doc.text,
      repeatedCount,
      lastConversationIntent: conversationIntent?.kind || null,
    },
  };
}
