import {
  sendBookingNotification,
  sendChatLeadNotification,
  sendChatContactConfirmation,
} from './emailService.js';

import { notifyLawyerOnWhatsApp } from './whatsappService.js';

function formatIntent(intent = '') {
  const map = {
    employment: 'Трудово право / уволнение',
    discrimination: 'Дискриминация',
    hateSpeech: 'Омразна реч онлайн',
    administrative: 'Административен акт / институция',
    criminal: 'Полиция / наказателен казус',
    booking: 'Консултация',
    pricing: 'Въпрос за хонорар',
    documents: 'Документи / доказателства',
    general: 'Общ правен въпрос',
    unknown: 'Неуточнен казус',
    hate_speech: 'Омразна реч онлайн',
    admin_law: 'Административен акт / институция',
  };

  return map[intent] || intent || 'Неуточнен казус';
}

function formatPriority(priority = 'normal') {
  const map = {
    low: 'Нисък',
    normal: 'Нормален',
    high: 'Висок / възможен кратък срок',
  };

  return map[priority] || priority || 'Нормален';
}

function getLastUserMessage(messages = []) {
  return [...messages].reverse().find((message) => message.role === 'user');
}

export async function notifyNewBooking(booking) {
  const text = `Нова заявка за консултация

Име: ${booking.client?.name || booking.name || '—'}
Телефон: ${booking.client?.phone || booking.phone || '—'}
Имейл: ${booking.client?.email || booking.email || '—'}
Област: ${booking.case?.area || booking.area || '—'}
Описание: ${booking.case?.summary || booking.message || '—'}`;

  await Promise.allSettled([
    sendBookingNotification(booking),
    notifyLawyerOnWhatsApp(text),
  ]);
}

export async function notifyChatLead({ session, messages }) {
  const visitor = session.visitor || {};
  const lastUser = getLastUserMessage(messages);

  const text = `Нов чат лийд

Име: ${visitor.name || '—'}
Телефон: ${visitor.phone || '—'}
Имейл: ${visitor.email || '—'}
Категория: ${formatIntent(session.detectedIntent)}
Приоритет: ${formatPriority(session.priority)}

Последно съобщение:
${lastUser?.content || '—'}`;

  await Promise.allSettled([
    sendChatLeadNotification({ session, messages }),
    notifyLawyerOnWhatsApp(text),
  ]);
}

export async function notifyChatContactConfirmation({ session }) {
  await sendChatContactConfirmation({ session });
}