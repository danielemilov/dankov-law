import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, X } from 'lucide-react';
import api from '../lib/api.js';
import './ChatWidget.css';

const LAWYER_PHOTO = '/diyan-dankovv.jpg';
const MIN_REPLY_DELAY = 1650;

const QUICK = [
  'Уволниха ме дисциплинарно',
  'Имам случай на дискриминация',
  'Омразна реч онлайн',
  'Получих акт или заповед',
  'Искам консултация',
];

const welcome = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Здравейте. Опишете накратко казуса си и ще ви ориентирам общо към следваща стъпка.',
  time: 'Сега',
};

const easeOutSoft = [0.16, 1, 0.3, 1];
const easeExitGlass = [0.76, 0, 0.24, 1];

const windowTransition = {
  duration: 0.54,
  ease: easeOutSoft,
};

const windowExitTransition = {
  duration: 1.08,
  times: [0, 0.28, 0.66, 1],
  ease: easeOutSoft,
};

const messageTransition = {
  duration: 0.46,
  ease: easeOutSoft,
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHumanDelay(text = '') {
  const extra = Math.min(1200, text.length * 7);
  return MIN_REPLY_DELAY + extra;
}

function timeNow() {
  return new Date().toLocaleTimeString('bg-BG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function makeMessage(role, content, extra = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    time: timeNow(),
    ...extra,
  };
}

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 560px)').matches;
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

async function submitWeb3FormsLead({ clean, messages, sessionId }) {
  const config = await loadPublicConfig();
  const accessKey = config.web3FormsAccessKey;

  if (!accessKey) {
    throw new Error('WEB3FORMS_ACCESS_KEY липсва в Render.');
  }

  const transcript = formatTranscript(messages);
  const lawyerEmail = config.lawyerEmail || 'contact.dankov@gmail.com';
  const contactEmail = clean.email || lawyerEmail;

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `Нов чат лийд - ${clean.name || clean.phone || clean.email || 'клиент'}`,
      from_name: clean.name || 'Клиент от чат',
      name: clean.name || 'Клиент от чат',
      email: contactEmail,
      phone: clean.phone || '',
      replyto: clean.email || lawyerEmail,
      message: [
        'Ново запитване от чат асистента.',
        '',
        `Име: ${clean.name || '-'}`,
        `Имейл: ${clean.email || '-'}`,
        `Телефон: ${clean.phone || '-'}`,
        `Session ID: ${sessionId}`,
        '',
        'Разговор:',
        transcript || '-',
      ].join('\n'),
      source: 'dankov-law-chat-widget',
      botcheck: false,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Web3Forms не прие заявката.');
  }

  return data;
}

function LawyerAvatar({ large = false }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={large ? 'chat__avatar chat__avatar--large' : 'chat__avatar'}>
        <span>ДД</span>
      </div>
    );
  }

  return (
    <div className={large ? 'chat__avatar chat__avatar--large' : 'chat__avatar'}>
      <img src={LAWYER_PHOTO} alt="Адвокат Диян Данков" onError={() => setFailed(true)} />
    </div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      className="chat__msg chat__msg--assistant chat__msg--typing"
      initial={{ opacity: 0, y: 14, filter: 'blur(7px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 8, filter: 'blur(7px)' }}
      transition={{ duration: 0.3, ease: easeOutSoft }}
    >
      <LawyerAvatar large />

      <div>
        <div className="chat__bubble chat__typing-clean">
          <i />
          <i />
          <i />
        </div>
      </div>
    </motion.div>
  );
}

function WelcomeContent({ text }) {
  const words = String(text).split(' ');

  return (
    <span className="chat__welcomeText">
      {words.map((word, index) => (
        <motion.span
          className="chat__welcomeWord"
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 9, filter: 'blur(7px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: 0.34 + index * 0.052,
            duration: 0.44,
            ease: easeOutSoft,
          }}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
}

function QuickSuggestions({ onPick }) {
  return (
    <motion.div
      className="chat__suggestions"
      initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
      transition={{ duration: 0.58, ease: easeOutSoft }}
    >
      <motion.span
        className="chat__suggestions-kicker"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.34, ease: easeOutSoft }}
      >
        Бърз избор
      </motion.span>

      <div className="chat__suggestion-list">
        {QUICK.map((q, index) => (
          <motion.button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            initial={{ opacity: 0, y: 12, filter: 'blur(7px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              delay: 0.2 + index * 0.14,
              duration: 0.42,
              ease: easeOutSoft,
            }}
          >
            {q}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('dankov_session_id') || null;
  });

  const [messages, setMessages] = useState([welcome]);
  const [actionCard, setActionCard] = useState(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [contactShake, setContactShake] = useState(false);

  const [visitorInfo, setVisitorInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false,
    website: '',
  });

  const [introReady, setIntroReady] = useState(false);
  const [quickReady, setQuickReady] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const consentRef = useRef(null);

  function closeChat() {
    setOpen(false);
  }

  function focusInput(delay = 220) {
    if (isMobileViewport()) return;
    window.setTimeout(() => inputRef.current?.focus(), delay);
  }

  useEffect(() => {
    if (open) {
      focusInput(360);
    }

    document.body.classList.toggle('chat-open', open);

    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [open]);

  useEffect(() => {
    const isFreshIntro = messages.length === 1 && messages[0]?.id === 'welcome';

    if (!open || !isFreshIntro) {
      setIntroReady(!isFreshIntro);
      setQuickReady(!isFreshIntro);
      return undefined;
    }

    setIntroReady(false);
    setQuickReady(false);

    const introTimer = window.setTimeout(() => {
      setIntroReady(true);
    }, 1180);

    const quickTimer = window.setTimeout(() => {
      setQuickReady(true);
    }, 2850);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(quickTimer);
    };
  }, [open, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading, actionCard, contactOpen, contactError, introReady, quickReady]);

  function updateContactField(field, value) {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (contactError) setContactError('');
  }

  function triggerContactError(message, focusConsent = false) {
    setContactError(message);
    setContactShake(true);

    setTimeout(() => setContactShake(false), 420);

    if (focusConsent && !isMobileViewport()) {
      setTimeout(() => consentRef.current?.focus(), 120);
    }
  }

  function openBookingSection() {
    setActionCard(null);
    setContactOpen(false);
    closeChat();

    setTimeout(() => {
      const contactSection =
        document.querySelector('#contact') ||
        document.querySelector('[data-section="contact"]') ||
        document.querySelector('.contact');

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = '#contact';
      }
    }, 180);
  }

  function askForMoreDetails() {
    setActionCard(null);
    setContactOpen(false);

    setMessages((prev) => [
      ...prev,
      makeMessage(
        'assistant',
        'Може да го опишете съвсем кратко. Достатъчни са 3 неща:\n1) Какво се случи?\n2) Кога стана?\n3) Имате ли документ, акт, заповед, съобщения или скрийншоти?'
      ),
    ]);

    focusInput(250);
  }

  function openContactForm() {
    setActionCard(null);
    setContactError('');

    setTimeout(() => {
      setContactOpen(true);
    }, 180);
  }

  function buildActionCard(data) {
    const alreadyHasContact = Boolean(visitorInfo.email || visitorInfo.phone);
    if (alreadyHasContact) return null;
    if (!data.shouldShowContactForm) return null;

    const forced = data.meta?.forcedContactAfterUnclear || data.meta?.unknownCount >= 3;
    const serious = data.meta?.seriousCase || data.meta?.priority === 'high';

    if (forced) {
      return {
        type: 'unclear',
        title: 'По-добре е да уточним случая',
        text:
          'За да не получите неточен общ отговор, може да оставите контакт или да опишете случая в няколко конкретни точки.',
      };
    }

    if (serious) {
      return {
        type: 'serious',
        title: 'Този казус може да има срокове',
        text:
          'Ако има акт, заповед, уволнение, полиция или институция, е добре казусът да се прегледа навреме.',
      };
    }

    return {
      type: 'normal',
      title: 'Следваща стъпка',
      text:
        'Можете да опишете още малко или да оставите контакт за обратна връзка от кантората.',
    };
  }

  async function send(text) {
    const content = (text || input).trim();

    if (!content || loading) return;

    setInput('');
    setActionCard(null);
    setContactOpen(false);
    setContactError('');

    setMessages((prev) => [...prev, makeMessage('user', content)]);
    setLoading(true);

    try {
      const [response] = await Promise.all([
        api.post('/api/chat/message', {
          message: content,
          sessionId,
          visitorInfo,
        }),
        wait(getHumanDelay(content)),
      ]);

      const data = response.data;

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('dankov_session_id', data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        makeMessage(
          'assistant',
          data.reply ||
            'Разбирам. Можете да оставите контакт или да изпратите заявка за консултация.'
        ),
      ]);

      const nextActionCard = buildActionCard(data);

      if (nextActionCard) {
        setTimeout(() => {
          setActionCard(nextActionCard);
        }, 900);
      }
    } catch (err) {
      await wait(500);

      const serverMessage =
        err.response?.data?.message ||
        'В момента има технически проблем с чата. Можете да използвате формата за консултация или да опитате отново след малко.';

      setMessages((prev) => [...prev, makeMessage('assistant', serverMessage)]);
    } finally {
      setLoading(false);
    }
  }

  async function saveContact() {
    const clean = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim(),
    };

    if (!clean.email && !clean.phone) {
      triggerContactError('Оставете имейл или телефон, за да може кантората да се свърже с вас.');
      return;
    }

    if (!contactForm.consent) {
      triggerContactError(
        'Потвърдете съгласието, за да изпратим контакта към кантората.',
        true
      );
      return;
    }

    if (!sessionId) {
      triggerContactError('Първо напишете кратко съобщение за казуса, за да създадем разговор.');
      return;
    }

    setContactSaving(true);
    setContactError('');

    try {
      await submitWeb3FormsLead({ clean, messages, sessionId });

      await Promise.all([
        api.post('/api/chat/contact', {
          sessionId,
          visitorInfo: clean,
          consent: true,
          emailDelivery: 'client_web3forms',
          website: contactForm.website,
        }),
        wait(700),
      ]);

      setVisitorInfo(clean);
      setContactOpen(false);
      setActionCard(null);

      setMessages((prev) => [
        ...prev,
        makeMessage(
          'assistant',
          `Благодаря${clean.name ? `, ${clean.name}` : ''}. Контактът и съгласието са записани към разговора и ще бъдат предадени към кантората.`
        ),
      ]);
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.message ||
        'Контактът не беше изпратен. Проверете данните и опитайте отново.';

      triggerContactError(serverMessage);
    } finally {
      setContactSaving(false);
    }
  }

  return (
    <div className={`chat ${open ? 'chat--open' : ''}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat__scrim"
            onClick={closeChat}
            initial={{ opacity: 0, backdropFilter: 'blur(0px) saturate(1)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(14px) saturate(1.12)' }}
            exit={{
              opacity: [1, 0.96, 0.54, 0],
              backdropFilter: [
                'blur(14px) saturate(1.12)',
                'blur(20px) saturate(1.2)',
                'blur(7px) saturate(1.04)',
                'blur(0px) saturate(1)',
              ],
            }}
            transition={{
              duration: 1.06,
              times: [0, 0.3, 0.72, 1],
              ease: easeOutSoft,
            }}
          >
            <motion.span
              className="chat__scrimClear"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 0.14, scale: 1 }}
              exit={{
                opacity: [0.14, 0.46, 0.2, 0],
                scale: [1, 1.08, 1.34, 1.58],
                filter: ['blur(22px)', 'blur(10px)', 'blur(4px)', 'blur(0px)'],
              }}
              transition={{ duration: 1.05, times: [0, 0.36, 0.75, 1], ease: easeOutSoft }}
            />

            <motion.span
              className="chat__scrimSweep"
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '-150%', opacity: 0 }}
              exit={{ x: ['-150%', '145%'], opacity: [0, 0.72, 0] }}
              transition={{ duration: 0.98, ease: easeExitGlass }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {open && (
          <motion.section
            className="chat__window"
            initial={{
              opacity: 0,
              y: 34,
              filter: 'blur(16px)',
              clipPath: 'inset(2% 2% 0% 2% round 32px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              clipPath: 'inset(0% 0% 0% 0% round 32px)',
              transition: windowTransition,
            }}
            exit={{
              opacity: [1, 0.98, 0.68, 0],
              y: [0, -4, -12, -24],
              filter: ['blur(0px)', 'blur(1px)', 'blur(9px)', 'blur(18px)'],
              clipPath: [
                'inset(0% 0% 0% 0% round 32px)',
                'inset(0% 0% 0% 0% round 32px)',
                'inset(9% 14% 9% 14% round 999px)',
                'inset(20% -34% 20% 126% round 999px)',
              ],
              transition: windowExitTransition,
            }}
          >
            <motion.span
              className="chat__windowClear"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0, scale: 0.9 }}
              exit={{
                opacity: [0, 0.46, 0.28, 0],
                scale: [0.92, 1.1, 1.36, 1.62],
                filter: ['blur(22px)', 'blur(9px)', 'blur(4px)', 'blur(0px)'],
              }}
              transition={{ duration: 1.06, times: [0, 0.36, 0.72, 1], ease: easeOutSoft }}
            />

            <motion.span
              className="chat__windowSweep"
              aria-hidden="true"
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '-150%', opacity: 0 }}
              exit={{ x: ['-150%', '145%'], opacity: [0, 0.82, 0] }}
              transition={{ duration: 0.94, ease: easeExitGlass }}
            />

            <motion.span
              className="chat__lensRing"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.76 }}
              animate={{ opacity: 0, scale: 0.76 }}
              exit={{
                opacity: [0, 0.38, 0],
                scale: [0.78, 1.18, 1.74],
                filter: ['blur(8px)', 'blur(2px)', 'blur(18px)'],
              }}
              transition={{ duration: 1.02, ease: easeOutSoft }}
            />

            <header className="chat__header">
              <LawyerAvatar />

              <div className="chat__header-copy">
                <strong>Адвокат Диян Данков</strong>
                <span>
                  <i /> Онлайн запитване · обща информация
                </span>
              </div>

              <button onClick={closeChat} aria-label="Затвори">
                <X size={19} strokeWidth={2.3} />
              </button>
            </header>

            <div className="chat__scroll-clip">
              <div className="chat__messages">
                <AnimatePresence initial={false}>
                  {!introReady && messages.length <= 1 && !loading && !actionCard && !contactOpen && (
                    <TypingBubble key="intro-loader" />
                  )}
                </AnimatePresence>

                {messages
                  .filter((msg) => msg.id !== 'welcome' || introReady)
                  .map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      className={`chat__msg chat__msg--${msg.role}${
                        msg.id === 'welcome' ? ' chat__msg--welcome' : ''
                      }`}
                      initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        duration: msg.id === 'welcome' ? 0.78 : messageTransition.duration,
                        ease: easeOutSoft,
                        delay: msg.id === 'welcome' ? 0.1 : Math.min(index * 0.08, 0.24),
                      }}
                    >
                      {msg.role === 'assistant' && <LawyerAvatar large />}

                      <div>
                        <div className="chat__bubble">{msg.content}</div>
                        <small>{msg.time}</small>
                      </div>
                    </motion.div>
                  ))}

                <AnimatePresence initial={false}>
                  {introReady && !quickReady && messages.length <= 1 && !loading && !actionCard && !contactOpen && (
                    <TypingBubble key="quick-loader" />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {quickReady && messages.length <= 1 && !loading && !actionCard && !contactOpen && (
                    <QuickSuggestions onPick={send} />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {loading && <TypingBubble />}
                </AnimatePresence>

                <AnimatePresence>
                  {actionCard && !contactOpen && (
                    <motion.div
                      className={`chat__action-card chat__action-card--${actionCard.type}`}
                      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                      transition={{ duration: 0.34, ease: easeOutSoft }}
                    >
                      <strong>{actionCard.title}</strong>
                      <p>{actionCard.text}</p>

                      <div className="chat__action-buttons">
                        <button type="button" onClick={askForMoreDetails}>
                          Ще опиша още
                        </button>

                        <button type="button" onClick={openContactForm}>
                          Оставям контакт
                        </button>

                        <button type="button" onClick={openBookingSection}>
                          Запази час
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {contactOpen && (
                    <motion.div
                      className={`chat__lead ${contactShake ? 'chat__lead--shake' : ''}`}
                      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                      transition={{ duration: 0.34, ease: easeOutSoft }}
                    >
                      <div className="chat__lead-head">
                        <span>Контакт</span>
                        <strong>Обратна връзка от кантората</strong>
                        <p>
                          Оставете имейл или телефон. Данните се използват само за
                          връзка по конкретното запитване.
                        </p>
                      </div>

                      <input
                        className="chat__hp"
                        tabIndex="-1"
                        autoComplete="off"
                        placeholder="Website"
                        value={contactForm.website}
                        onChange={(event) => updateContactField('website', event.target.value)}
                      />

                      <label className="chat__field">
                        <span>Име</span>
                        <input
                          placeholder="Например: Иван Петров"
                          value={contactForm.name}
                          onChange={(event) => updateContactField('name', event.target.value)}
                        />
                      </label>

                      <label className="chat__field">
                        <span>Имейл</span>
                        <input
                          placeholder="email@example.com"
                          value={contactForm.email}
                          onChange={(event) => updateContactField('email', event.target.value)}
                        />
                      </label>

                      <label className="chat__field">
                        <span>Телефон</span>
                        <input
                          placeholder="+359..."
                          value={contactForm.phone}
                          onChange={(event) => updateContactField('phone', event.target.value)}
                        />
                      </label>

                      <label className="chat__consent">
                        <input
                          ref={consentRef}
                          type="checkbox"
                          checked={contactForm.consent}
                          onChange={(event) => updateContactField('consent', event.target.checked)}
                        />

                        <span>
                          <strong>Съгласен/съгласна съм</strong> данните ми да бъдат
                          използвани за обратна връзка по запитването. Разбирам, че
                          чатът дава само обща информация и не представлява конкретен
                          правен съвет.
                        </span>
                      </label>

                      <AnimatePresence>
                        {contactError && (
                          <motion.div
                            className="chat__lead-error"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                          >
                            {contactError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="chat__lead-actions">
                        <button
                          type="button"
                          className="chat__lead-submit"
                          onClick={saveContact}
                          disabled={contactSaving}
                        >
                          {contactSaving ? 'Записване...' : 'Запази контакт'}
                        </button>

                        <button
                          type="button"
                          className="chat__skip"
                          onClick={() => {
                            setContactOpen(false);
                            setContactError('');
                            setActionCard({
                              type: 'normal',
                              title: 'Следваща стъпка',
                              text:
                                'Можете да продължите с описание на случая или да използвате формата за заявка за час.',
                            });
                          }}
                        >
                          Назад
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>
            </div>

            <div className="chat__legal-strip">
              Не изпращайте ЕГН, банкови данни или документи в чата. За конкретен съвет е нужна консултация.
            </div>

            <div className="chat__input-row">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') send();
                }}
                disabled={loading}
                placeholder="Напишете съобщение..."
              />

              <button type="button" onClick={() => send()} disabled={!input.trim() || loading}>
                <SendHorizontal size={20} strokeWidth={2.25} />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        className="chat__fab"
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.97 }}
        aria-label={open ? 'Затвори чат' : 'Отвори чат'}
      >
        {open ? (
          <X className="chat__fabSvg" size={25} strokeWidth={2.5} />
        ) : (
          <MessageCircle className="chat__fabSvg chat__fabSvg--chat" size={31} strokeWidth={2.15} />
        )}
        {!open && <i />}
      </motion.button>
    </div>
  );
}
