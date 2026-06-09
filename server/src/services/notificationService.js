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

function logNotificationResult(label, result) {
  if (result.status !== 'rejected') return;

  const message = result.reason?.message || result.reason || 'Unknown notification error';
  console.error(`${label} notification failed:`, message);
}

export async function notifyNewBooking(booking) {
  const text = `Нова заявка за консултация

Име: ${booking.client?.name || booking.name || '—'}
Телефон: ${booking.client?.phone || booking.phone || '—'}
Имейл: ${booking.client?.email || booking.email || '—'}
Област: ${booking.case?.area || booking.area || '—'}
Описание: ${booking.case?.summary || booking.message || '—'}`;

  const [email, whatsapp] = await Promise.allSettled([
    sendBookingNotification(booking),
    notifyLawyerOnWhatsApp(text),
  ]);

  logNotificationResult('Booking email', email);
  logNotificationResult('Booking WhatsApp', whatsapp);

  return { email, whatsapp };
}

export async function notifyChatLead({ session, messages }) {
  const visitor = session.visitor || {};
  const lastUser = getLastUserMessage(messages);

  const text = `Ново запитване от чат асистента

Име: ${visitor.name || '—'}
Телефон: ${visitor.phone || '—'}
Имейл: ${visitor.email || '—'}
Категория: ${formatIntent(session.detectedIntent)}
Приоритет: ${formatPriority(session.priority)}

Последно съобщение:
${lastUser?.content || '—'}`;

  const [email, whatsapp] = await Promise.allSettled([
    sendChatLeadNotification({ session, messages }),
    notifyLawyerOnWhatsApp(text),
  ]);

  logNotificationResult('Chat inquiry email', email);
  logNotificationResult('Chat inquiry WhatsApp', whatsapp);

  return { email, whatsapp };
}

export async function notifyDirectChatMessage({ session, message, messages = [] }) {
  const visitor = session.visitor || {};

  const text = `Ново съобщение в директния чат

Име: ${visitor.name || '—'}
Телефон: ${visitor.phone || '—'}
Имейл: ${visitor.email || '—'}
Приоритет: ${formatPriority(session.priority)}

Съобщение:
${message?.content || '—'}`;

  const [email, whatsapp] = await Promise.allSettled([
    sendChatLeadNotification({ session, messages }),
    notifyLawyerOnWhatsApp(text),
  ]);

  logNotificationResult('Direct chat email', email);
  logNotificationResult('Direct chat WhatsApp', whatsapp);

  return { email, whatsapp };
}

export async function notifyChatContactConfirmation({ session }) {
  await sendChatContactConfirmation({ session });
}
