import nodemailer from 'nodemailer';

const BRAND = {
  name: 'Адвокат Диян Данков',
  label: 'DANKOV LAW',
  city: 'Разград',
  ink: '#0f0e0c',
  cream: '#f5f2ec',
  warm: '#e8e2d6',
  gold: '#b5862a',
  muted: '#6f6a60',
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function nl2br(value = '') {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function safe(value, fallback = '—') {
  if (value === undefined || value === null || value === '') return fallback;
  return escapeHtml(value);
}

function plain(value, fallback = '—') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function formatDate(value) {
  if (!value) return 'Не е посочена';

  try {
    return new Date(value).toLocaleDateString('bg-BG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Не е посочена';
  }
}

function formatDateTime(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

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

function getBookingClient(booking = {}) {
  return {
    name: booking.client?.name || booking.name || '',
    phone: booking.client?.phone || booking.phone || '',
    email: booking.client?.email || booking.email || '',
  };
}

function getBookingCase(booking = {}) {
  return {
    area: booking.case?.area || booking.area || '',
    urgency: booking.case?.urgency || booking.urgency || '',
    summary: booking.case?.summary || booking.message || booking.case?.message || '',
  };
}

function getBookingPreferred(booking = {}) {
  return {
    date: booking.preferred?.date || booking.date || '',
    time: booking.preferred?.time || booking.time || '',
    contactMethod: booking.preferred?.contactMethod || booking.contactMethod || '',
  };
}

function getLastUserMessage(messages = []) {
  return [...messages].reverse().find((message) => message.role === 'user');
}

function getTranscript(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return '<p style="margin:0;color:#6f6a60;">Няма записани съобщения.</p>';
  }

  return messages
    .map((message) => {
      const isUser = message.role === 'user';
      const label = isUser ? 'Клиент' : 'AI асистент';
      const bg = isUser ? '#0f0e0c' : '#e8e2d6';
      const color = isUser ? '#f5f2ec' : '#0f0e0c';
      const align = isUser ? 'right' : 'left';

      return `
        <div style="margin:0 0 14px; text-align:${align};">
          <div style="display:inline-block; max-width:92%; background:${bg}; color:${color}; padding:12px 14px; border-radius:14px; text-align:left;">
            <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.65; margin-bottom:6px;">
              ${label}
            </div>
            <div style="font-size:14px; line-height:1.65;">
              ${nl2br(message.content || '')}
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function getRecommendedAction({ intent, priority }) {
  if (priority === 'high') {
    return 'Препоръчва се бърза обратна връзка, защото е възможно да има кратък срок или важен документ за преглед.';
  }

  if (intent === 'employment') {
    return 'Прегледайте дали има заповед, дата на връчване, мотиви и документи от работодателя.';
  }

  if (intent === 'administrative') {
    return 'Проверете какъв документ е получен и кога е връчен, защото сроковете при административни актове често са кратки.';
  }

  if (intent === 'hateSpeech') {
    return 'Поискайте скрийншоти, линкове, профил, дата и час на публикацията.';
  }

  if (intent === 'discrimination') {
    return 'Уточнете къде, кога, от кого е извършено действието и има ли свидетели или доказателства.';
  }

  return 'Свържете се с клиента за уточняване на казуса и нужните документи.';
}

function emailShell({ title, eyebrow = BRAND.label, children, footer = `${BRAND.name} · ${BRAND.city}` }) {
  return `
    <!doctype html>
    <html lang="bg">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0; padding:0; background:#f3efe7;">
        <div style="width:100%; background:#f3efe7; padding:32px 0;">
          <div style="max-width:720px; margin:0 auto; background:#f5f2ec; border:1px solid #ded6c8; box-shadow:0 20px 60px rgba(15,14,12,0.12);">
            
            <div style="background:#0f0e0c; padding:30px 34px;">
              <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#b5862a; font-family:Arial, sans-serif; margin-bottom:10px;">
                ${escapeHtml(eyebrow)}
              </div>
              <h1 style="font-family:Georgia, serif; font-size:27px; line-height:1.18; font-weight:400; color:#f5f2ec; margin:0;">
                ${escapeHtml(title)}
              </h1>
            </div>

            <div style="padding:34px;">
              ${children}
            </div>

            <div style="background:#0f0e0c; padding:18px 34px;">
              <p style="font-family:Arial, sans-serif; font-size:12px; color:rgba(245,242,236,0.55); margin:0;">
                ${escapeHtml(footer)}
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
}

function infoGrid(items = []) {
  return `
    <table style="width:100%; border-collapse:collapse; margin:0 0 24px;">
      ${items
        .map(
          (item) => `
          <tr>
            <td style="width:160px; padding:12px 0; border-bottom:1px solid #ded6c8; font-family:Arial, sans-serif; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#8a8174;">
              ${escapeHtml(item.label)}
            </td>
            <td style="padding:12px 0; border-bottom:1px solid #ded6c8; font-family:Georgia, serif; font-size:15px; line-height:1.5; color:#0f0e0c;">
              ${item.html ? item.value : safe(item.value)}
            </td>
          </tr>
        `
        )
        .join('')}
    </table>
  `;
}

function noticeBox(content, tone = 'gold') {
  const border = tone === 'dark' ? '#0f0e0c' : '#b5862a';
  const bg = tone === 'dark' ? '#ebe5da' : '#e8e2d6';

  return `
    <div style="background:${bg}; border-left:4px solid ${border}; padding:18px 20px; margin:24px 0;">
      <div style="font-family:Arial, sans-serif; font-size:14px; line-height:1.75; color:#38342e;">
        ${content}
      </div>
    </div>
  `;
}

export async function sendBookingNotification(booking) {
  const transporter = createTransporter();

  const client = getBookingClient(booking);
  const caseData = getBookingCase(booking);
  const preferred = getBookingPreferred(booking);

  const lawyerHtml = emailShell({
    title: `Нова заявка за консултация`,
    children: `
      ${infoGrid([
        { label: 'Клиент', value: client.name },
        { label: 'Телефон', value: client.phone },
        { label: 'Имейл', value: client.email },
        { label: 'Правна област', value: caseData.area },
        { label: 'Спешност', value: caseData.urgency || 'Не е посочена' },
        { label: 'Желана дата', value: formatDate(preferred.date) },
        { label: 'Желан час', value: preferred.time || 'Не е посочен' },
        { label: 'Връзка', value: preferred.contactMethod || 'Не е посочено' },
      ])}

      ${noticeBox(`
        <strong>Описание на казуса:</strong><br />
        ${nl2br(caseData.summary || '—')}
      `)}

      <p style="font-family:Arial, sans-serif; font-size:13px; line-height:1.7; color:#6f6a60; margin:22px 0 0;">
        Заявката е записана в системата. Препоръчително е да се направи обратна връзка според посочената спешност.
      </p>
    `,
  });

  const clientHtml = emailShell({
    title: `Получихме заявката ви`,
    children: `
      <p style="font-family:Georgia, serif; font-size:18px; line-height:1.55; color:#0f0e0c; margin:0 0 18px;">
        Здравейте${client.name ? `, ${escapeHtml(client.name)}` : ''},
      </p>

      <p style="font-family:Arial, sans-serif; font-size:14px; line-height:1.8; color:#444; margin:0 0 18px;">
        Получихме вашата заявка за консултация. Информацията е изпратена към кантората и ще бъде прегледана.
      </p>

      ${noticeBox(`
        <strong>Правна област:</strong> ${safe(caseData.area)}<br />
        <strong>Желана дата:</strong> ${safe(formatDate(preferred.date))}<br />
        <strong>Желан час:</strong> ${safe(preferred.time || 'Не е посочен')}
      `)}

      <p style="font-family:Arial, sans-serif; font-size:14px; line-height:1.8; color:#444; margin:0;">
        Ако казусът е свързан със срокове, акт, заповед, уволнение или институция, пазете всички документи, съобщения, дати и доказателства.
      </p>
    `,
  });

  const results = await Promise.allSettled([
    transporter.sendMail({
      from: `"Сайт Данков" <${process.env.EMAIL_USER}>`,
      to: process.env.LAWYER_EMAIL,
      replyTo: client.email || process.env.EMAIL_USER,
      subject: `Нова заявка — ${client.name || 'клиент'}`,
      html: lawyerHtml,
    }),

    client.email
      ? transporter.sendMail({
          from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
          to: client.email,
          replyTo: process.env.LAWYER_EMAIL || process.env.EMAIL_USER,
          subject: `Получихме заявката ви — ${BRAND.name}`,
          html: clientHtml,
        })
      : Promise.resolve({ skipped: true }),
  ]);

  return results;
}

export async function sendChatLeadNotification({ session, messages }) {
  const transporter = createTransporter();

  const visitor = session.visitor || {};
  const lastUser = getLastUserMessage(messages);
  const intent = session.detectedIntent || 'unknown';
  const priority = session.priority || 'normal';
  const recommendedAction = getRecommendedAction({ intent, priority });

  const subjectName = visitor.name || 'Нов клиент';

  const html = emailShell({
    title: `Нов разговор от чат асистента`,
    children: `
      ${infoGrid([
        { label: 'Име', value: visitor.name || '—' },
        { label: 'Имейл', value: visitor.email || '—' },
        { label: 'Телефон', value: visitor.phone || '—' },
        { label: 'Категория', value: formatIntent(intent) },
        { label: 'Приоритет', value: formatPriority(priority) },
        { label: 'Създадено', value: formatDateTime(session.createdAt) },
      ])}

      ${noticeBox(`
        <strong>Последно съобщение от клиента:</strong><br />
        ${nl2br(lastUser?.content || '—')}
      `)}

      ${noticeBox(`
        <strong>Препоръчано действие:</strong><br />
        ${escapeHtml(recommendedAction)}
      `, priority === 'high' ? 'dark' : 'gold')}

      <h2 style="font-family:Georgia, serif; font-size:22px; font-weight:400; color:#0f0e0c; margin:30px 0 16px;">
        Разговор
      </h2>

      <div style="background:#fffaf2; border:1px solid #ded6c8; padding:18px;">
        ${getTranscript(messages)}
      </div>
    `,
  });

  await transporter.sendMail({
    from: `"Чат Асистент" <${process.env.EMAIL_USER}>`,
    to: process.env.LAWYER_EMAIL,
    replyTo: visitor.email || process.env.EMAIL_USER,
    subject: `Нов чат лийд — ${subjectName}`,
    html,
  });
}

export async function sendChatContactConfirmation({ session }) {
  const transporter = createTransporter();
  const visitor = session.visitor || {};

  if (!visitor.email) {
    return { skipped: true, reason: 'No visitor email' };
  }

  const html = emailShell({
    title: `Получихме съобщението ви`,
    children: `
      <p style="font-family:Georgia, serif; font-size:18px; line-height:1.55; color:#0f0e0c; margin:0 0 18px;">
        Здравейте${visitor.name ? `, ${escapeHtml(visitor.name)}` : ''},
      </p>

      <p style="font-family:Arial, sans-serif; font-size:14px; line-height:1.8; color:#444; margin:0 0 18px;">
        Получихме вашето запитване от AI чата. Разговорът и контактът ви са предадени към кантората.
      </p>

      ${noticeBox(`
        <strong>Категория:</strong> ${safe(formatIntent(session.detectedIntent))}<br />
        <strong>Приоритет:</strong> ${safe(formatPriority(session.priority))}
      `)}

      <p style="font-family:Arial, sans-serif; font-size:14px; line-height:1.8; color:#444; margin:0;">
        Ако казусът е свързан със срокове, акт, заповед, уволнение или институция, пазете всички документи, скрийншоти, съобщения, линкове, дати и имена.
      </p>
    `,
  });

  await transporter.sendMail({
    from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
    to: visitor.email,
    replyTo: process.env.LAWYER_EMAIL || process.env.EMAIL_USER,
    subject: `Получихме съобщението ви — ${BRAND.name}`,
    html,
  });
}