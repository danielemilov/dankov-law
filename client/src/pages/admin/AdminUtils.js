import { EMPTY_POST } from './AdminConfig.js';

export function toDateInput(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export function createPostForm() {
  return {
    ...EMPTY_POST,
    heroImage: {
      ...EMPTY_POST.heroImage,
    },
    video: {
      ...EMPTY_POST.video,
    },
    publishedAt: toDateInput(new Date()),
  };
}

export function postToForm(post = EMPTY_POST) {
  return {
    ...EMPTY_POST,
    ...post,
    publishedAt: toDateInput(post.publishedAt),
    heroImage: {
      ...EMPTY_POST.heroImage,
      ...(post.heroImage || {}),
    },
    video: {
      ...EMPTY_POST.video,
      ...(post.video || {}),
    },
  };
}

export function formatDate(value, includeTime = true) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: includeTime ? undefined : 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  }).format(date);
}

export function statusLabel(status = '') {
  const labels = {
    open: 'Отворен',
    lead: 'Контакт',
    waiting_for_lawyer: 'Чака адвокат',
    lawyer_joined: 'Адвокат отговори',
    closed: 'Затворен',

    published: 'Публикувана',
    draft: 'Чернова',
    archived: 'Архивирана',

    visible: 'Видим',
    hidden: 'Скрит',
    deleted: 'Изтрит',
    pending: 'Чака',

    new: 'Нова',
    reviewed: 'Прегледана',
    confirmed: 'Потвърдена',
    completed: 'Завършена',
    cancelled: 'Отказана',

    low: 'Нисък',
    normal: 'Нормален',
    high: 'Висок',
  };

  return labels[status] || status || '—';
}

export function normalizeSearch(value = '') {
  return value.trim().toLocaleLowerCase('bg-BG');
}

export function includesSearch(query, values = []) {
  if (!query) {
    return true;
  }

  return values
    .filter(Boolean)
    .some((value) =>
      String(value)
        .toLocaleLowerCase('bg-BG')
        .includes(query)
    );
}

export function getBackTarget(route) {
  if (route.itemId) {
    return {
      section: route.section,
      itemId: '',
      settingsPanel: '',
    };
  }

  if (route.settingsPanel) {
    return {
      section: 'settings',
      itemId: '',
      settingsPanel: '',
    };
  }

  if (route.section !== 'overview') {
    return {
      section: 'overview',
      itemId: '',
      settingsPanel: '',
    };
  }

  return null;
}

export function playAdminPing() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';

    oscillator.frequency.setValueAtTime(
      880,
      context.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      1320,
      context.currentTime + 0.08
    );

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.14,
      context.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.22
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);

    window.setTimeout(() => {
      context.close?.();
    }, 360);
  } catch {
    // Звукът е допълнителна функция и не трябва
    // да прекъсва работата на админ панела.
  }
}