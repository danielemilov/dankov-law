import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, X } from 'lucide-react';
import './ChatWidget.css';

const LAWYER_PHOTO = '/diyan-dankov.jpg';

const MIN_REPLY_DELAY = 1200;

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
    'Здравейте. Мога да ви ориентирам общо и да насоча запитването към кантората на адв. Диян Данков. Опишете накратко казуса си.',
  time: 'Сега',
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
      className="chat__msg chat__msg--assistant"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.24 }}
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

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const consentRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 220);
    }

    document.body.classList.toggle('chat-open', open);

    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, actionCard, contactOpen, contactError]);

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

    if (focusConsent) {
      setTimeout(() => consentRef.current?.focus(), 120);
    }
  }

  function openBookingSection() {
    setActionCard(null);
    setContactOpen(false);
    setOpen(false);

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

    setTimeout(() => inputRef.current?.focus(), 250);
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
        axios.post('/api/chat/message', {
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
      await Promise.all([
        axios.post('/api/chat/contact', {
          sessionId,
          visitorInfo: clean,
          consent: true,
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
          <motion.section
            className="chat__window"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="chat__header">
              <LawyerAvatar />

              <div className="chat__header-copy">
                <strong>Адвокат Диян Данков</strong>
                <span>
                  <i /> Онлайн запитване · обща информация
                </span>
              </div>

              <button onClick={() => setOpen(false)} aria-label="Затвори">
                <X size={19} strokeWidth={2.3} />
              </button>
            </header>

            <div className="chat__scroll-clip">
              <div className="chat__messages">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`chat__msg chat__msg--${msg.role}`}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {msg.role === 'assistant' && <LawyerAvatar large />}

                    <div>
                      <div className="chat__bubble">{msg.content}</div>
                      <small>{msg.time}</small>
                    </div>
                  </motion.div>
                ))}

                <AnimatePresence>
                  {loading && <TypingBubble />}
                </AnimatePresence>

                <AnimatePresence>
                  {actionCard && !contactOpen && (
                    <motion.div
                      className={`chat__action-card chat__action-card--${actionCard.type}`}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

            {messages.length <= 1 && (
              <div className="chat__quick">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

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

              <button onClick={() => send()} disabled={!input.trim() || loading}>
                <SendHorizontal size={20} strokeWidth={2.25} />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        className="chat__fab"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Затвори чат' : 'Отвори чат'}
      >
        {open ? <X className="chat__fabSvg" size={25} strokeWidth={2.5} /> : <MessageCircle className="chat__fabSvg" size={27} strokeWidth={2.3} />}
        {!open && <i />}
      </motion.button>
    </div>
  );
}
