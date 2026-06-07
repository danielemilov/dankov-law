import api from './api.js';

function normalize(value, fallback = '-') {
  const text = String(value || '').trim();
  return text || fallback;
}

function section(title, lines = []) {
  return [
    `━━ ${title} ━━`,
    ...lines.map(([label, value]) => `${label}: ${normalize(value)}`),
  ].join('\n');
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
    subject: `Ново запитване от чат асистента - ${clean.name || clean.phone || clean.email || 'клиент'}`,
    from_name: clean.name || 'Чат запитване',
    name: clean.name || 'Клиент от чат',
    email: clean.email || '',
    phone: clean.phone || '',
    message: [
      'DANKOV LAW / Чат асистент',
      'Ново запитване от посетител на сайта.',
      '',
      section('Контакт', [
        ['Име', clean.name],
        ['Имейл', clean.email],
        ['Телефон', clean.phone],
        ['Session ID', sessionId],
      ]),
      '',
      '━━ Разговор ━━',
      transcript || '-',
      '',
      '━━ Следваща стъпка ━━',
      'Свържете се с човека за уточняване на казуса и нужните документи.',
    ].join('\n'),
    source: 'dankov-law-chat-widget',
    category: 'Чат запитване',
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
    from_name: payload.name || 'Заявка за консултация',
    name: payload.name || 'Клиент от форма',
    email: payload.email || '',
    phone: payload.phone || '',
    message: [
      'DANKOV LAW / Форма за консултация',
      'Нова заявка за час от сайта.',
      '',
      section('Контакт', [
        ['Име', payload.name],
        ['Имейл', payload.email],
        ['Телефон', payload.phone],
        ['Предпочитана връзка', contactMethodMap[payload.contactMethod] || payload.contactMethod],
      ]),
      '',
      section('Консултация', [
        ['Правна област', payload.area],
        ['Спешност', urgencyMap[payload.urgency] || payload.urgency],
        ['Желана дата', normalize(payload.preferredDate, 'Не е посочена')],
        ['Желан час', normalize(payload.preferredTime, 'Не е посочен')],
      ]),
      '',
      '━━ Описание ━━',
      normalize(payload.message),
      '',
      '━━ Следваща стъпка ━━',
      'Прегледайте заявката и върнете контакт за потвърждение на час.',
    ].join('\n'),
    source: 'dankov-law-booking-form',
    category: 'Заявка за консултация',
  });
}
