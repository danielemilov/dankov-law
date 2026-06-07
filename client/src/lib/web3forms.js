import api from './api.js';

function normalize(value, fallback = '-') {
  const text = String(value || '').trim();
  return text || fallback;
}

function formatTranscript(messages = []) {
  return messages
    .filter((message) => message.id !== 'welcome' && ['user', 'assistant'].includes(message.role))
    .slice(-12)
    .map((message) => {
      const label = message.role === 'user' ? 'Клиент' : 'Чат асистент';
      return `${label}: ${message.content}`;
    })
    .join('\n\n');
}

async function loadPublicConfig() {
  const response = await api.get('/api/public-config');
  return response.data || {};
}

async function submitWeb3Forms(payload) {
  const config = await loadPublicConfig();
  const accessKey = config.web3FormsAccessKey;
  const lawyerEmail = config.lawyerEmail || 'contact.dankov@gmail.com';

  if (!accessKey) {
    throw new Error('WEB3FORMS_ACCESS_KEY липсва в Render.');
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      botcheck: false,
      ...payload,
      email: payload.email || lawyerEmail,
      replyto: payload.replyto || payload.email || lawyerEmail,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Web3Forms не прие заявката.');
  }

  return data;
}

export async function submitChatLead({ clean, messages, sessionId }) {
  const transcript = formatTranscript(messages);

  return submitWeb3Forms({
    subject: `Нов чат лийд - ${clean.name || clean.phone || clean.email || 'клиент'}`,
    from_name: clean.name || 'Клиент от чат',
    name: clean.name || 'Клиент от чат',
    email: clean.email || '',
    phone: clean.phone || '',
    message: [
      'Ново запитване от чат асистента.',
      '',
      `Име: ${normalize(clean.name)}`,
      `Имейл: ${normalize(clean.email)}`,
      `Телефон: ${normalize(clean.phone)}`,
      `Session ID: ${sessionId}`,
      '',
      'Разговор:',
      transcript || '-',
    ].join('\n'),
    source: 'dankov-law-chat-widget',
  });
}

export async function submitBookingLead(payload) {
  const urgencyMap = {
    normal: 'Нормално',
    soon: 'Скоро',
    urgent: 'Спешно',
  };

  const contactMethodMap = {
    phone: 'Телефон',
    email: 'Имейл',
    whatsapp: 'WhatsApp',
  };

  return submitWeb3Forms({
    subject: `Нова заявка за консултация - ${payload.name || 'клиент'}`,
    from_name: payload.name || 'Клиент от форма',
    name: payload.name || 'Клиент от форма',
    email: payload.email || '',
    phone: payload.phone || '',
    message: [
      'Нова заявка за консултация от сайта.',
      '',
      `Име: ${normalize(payload.name)}`,
      `Имейл: ${normalize(payload.email)}`,
      `Телефон: ${normalize(payload.phone)}`,
      `Правна област: ${normalize(payload.area)}`,
      `Спешност: ${urgencyMap[payload.urgency] || normalize(payload.urgency)}`,
      `Желана дата: ${normalize(payload.preferredDate, 'Не е посочена')}`,
      `Желан час: ${normalize(payload.preferredTime, 'Не е посочен')}`,
      `Предпочитана връзка: ${
        contactMethodMap[payload.contactMethod] || normalize(payload.contactMethod)
      }`,
      '',
      'Описание:',
      normalize(payload.message),
    ].join('\n'),
    source: 'dankov-law-booking-form',
  });
}
