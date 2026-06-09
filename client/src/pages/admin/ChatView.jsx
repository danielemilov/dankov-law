import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
} from 'lucide-react';
import './view/ChatView.css';
import {
  BackLink,
  EmptyState,
  FilterTabs,
  SearchBox,
  SelectField,
  StatusBadge,
  TextField,
} from './AdminUI.jsx';
import {
  formatDate,
  includesSearch,
  normalizeSearch,
  statusLabel,
} from './AdminUtils.js';

const CHAT_FILTERS = [
  { value: 'all', label: 'Всички' },
  { value: 'attention', label: 'Чакат отговор' },
  { value: 'open', label: 'Активни' },
  { value: 'closed', label: 'Затворени' },
];

function getVisitorName(chat) {
  return (
    chat?.visitor?.name ||
    chat?.visitor?.phone ||
    chat?.visitor?.email ||
    'Посетител'
  );
}

function getVisitorInitial(chat) {
  return getVisitorName(chat).trim().charAt(0).toUpperCase() || 'К';
}

function ChatList({ chats, navigate, controller }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const normalizedQuery = normalizeSearch(query);

  const filterItems = useMemo(() => {
    const attention = chats.filter((chat) => chat.needsAttention).length;
    const active = chats.filter((chat) => chat.status !== 'closed').length;
    const closed = chats.filter((chat) => chat.status === 'closed').length;

    return CHAT_FILTERS.map((item) => ({
      ...item,
      count:
        item.value === 'all'
          ? chats.length
          : item.value === 'attention'
            ? attention
            : item.value === 'open'
              ? active
              : closed,
    }));
  }, [chats]);

  const filteredChats = useMemo(() => {
    return [...chats]
      .filter((chat) => {
        if (filter === 'attention' && !chat.needsAttention) return false;
        if (filter === 'open' && chat.status === 'closed') return false;
        if (filter === 'closed' && chat.status !== 'closed') return false;

        return includesSearch(normalizedQuery, [
          chat.visitor?.name,
          chat.visitor?.phone,
          chat.visitor?.email,
          chat.lastMessage?.content,
          chat.attentionReason,
          statusLabel(chat.status),
        ]);
      })
      .sort((first, second) => {
        if (first.needsAttention !== second.needsAttention) {
          return first.needsAttention ? -1 : 1;
        }

        return (
          new Date(second.lastMessageAt || 0).getTime() -
          new Date(first.lastMessageAt || 0).getTime()
        );
      });
  }, [chats, filter, normalizedQuery]);

  async function openConversation(sessionId) {
    const opened = await controller.openChat(sessionId);
    if (opened) {
      navigate({ section: 'chats', itemId: sessionId, settingsPanel: '' });
    }
  }

  return (
    <div className="dAdminView dAdminChatListView">
      <section className="dAdminPageIntro">
        <div>
          <BackLink
            onClick={() =>
              navigate({ section: 'overview', itemId: '', settingsPanel: '' })
            }
          >
            Към таблото
          </BackLink>
          <span className="dAdminEyebrow">Основен приоритет</span>
          <h2>Клиентски разговори</h2>
          <p>
            Най-важните разговори са подредени първи. Отворете клиент, отговорете
            и променете статуса без да напускате панела.
          </p>
        </div>

        <div className="dAdminPageIntro__summary">
          <span>
            <AlertTriangle size={17} />
            Чакат отговор
          </span>
          <strong>{chats.filter((chat) => chat.needsAttention).length}</strong>
        </div>
      </section>

      <section className="dAdminPanel dAdminPanel--wide">
        <div className="dAdminToolbar">
          <SearchBox
            wide
            value={query}
            onChange={setQuery}
            placeholder="Търсене по име, телефон, имейл или съобщение…"
          />
          <FilterTabs value={filter} onChange={setFilter} items={filterItems} />
        </div>

        <div className="dAdminChatCards">
          {filteredChats.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title={query ? 'Няма намерени разговори' : 'Все още няма разговори'}
              text={
                query
                  ? 'Променете търсенето или изберете друг филтър.'
                  : 'Новите разговори от сайта ще се показват тук.'
              }
            />
          ) : (
            filteredChats.map((chat) => (
              <button
                className={`dAdminChatCard ${chat.needsAttention ? 'is-attention' : ''}`}
                key={chat.sessionId}
                type="button"
                onClick={() => openConversation(chat.sessionId)}
              >
                <span className="dAdminChatCard__avatar">{getVisitorInitial(chat)}</span>

                <span className="dAdminChatCard__body">
                  <span className="dAdminChatCard__topline">
                    <strong>{getVisitorName(chat)}</strong>
                    <small>{formatDate(chat.lastMessageAt)}</small>
                  </span>

                  <span className="dAdminChatCard__meta">
                    <StatusBadge status={chat.status || 'open'} />
                    <StatusBadge status={chat.priority || 'normal'} />
                    {chat.needsAttention && (
                      <span className="dAdminChatCard__attention">
                        <AlertTriangle size={13} />
                        Изисква реакция
                      </span>
                    )}
                  </span>

                  <span className="dAdminChatCard__message">
                    {chat.lastMessage?.content || 'Разговорът все още няма съобщения.'}
                  </span>

                  {chat.attentionReason && chat.needsAttention && (
                    <small className="dAdminChatCard__reason">{chat.attentionReason}</small>
                  )}
                </span>

                <ArrowRight className="dAdminChatCard__arrow" size={19} />
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <span><Icon size={16} /></span>
      <span>
        <small>{label}</small>
        <strong>{value || 'Не е посочено'}</strong>
      </span>
    </>
  );

  if (href && value) {
    return (
      <a className="dAdminContactItem" href={href}>
        {content}
      </a>
    );
  }

  return <div className="dAdminContactItem">{content}</div>;
}

function ChatDetail({ route, navigate, goBack, controller }) {
  const messagesEndRef = useRef(null);
  const {
    selectedChatId,
    selectedChatSummary,
    chatMessages,
    reply,
    saving,
    setSelectedChat,
    setReply,
    openChat,
    sendReply,
    updateChatTriage,
  } = controller;

  useEffect(() => {
    if (!route.itemId || selectedChatId === route.itemId) return;
    openChat(route.itemId);
  }, [openChat, route.itemId, selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [chatMessages.length]);

  function updateVisitorField(field, value) {
    setSelectedChat((current) => ({
      ...(current || selectedChatSummary || {}),
      visitor: {
        ...(current?.visitor || selectedChatSummary?.visitor || {}),
        [field]: value,
      },
    }));
  }

  function saveVisitorField(field, value) {
    updateChatTriage({
      visitor: {
        ...(selectedChatSummary?.visitor || {}),
        [field]: value,
      },
    });
  }

  function handleReplyKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      sendReply();
    }
  }

  if (!selectedChatSummary) {
    return (
      <div className="dAdminView">
        <BackLink
          onClick={() =>
            navigate({ section: 'chats', itemId: '', settingsPanel: '' })
          }
        >
          Всички чатове
        </BackLink>
        <section className="dAdminPanel dAdminPanel--wide">
          <EmptyState
            icon={MessageSquareText}
            title="Зареждане на разговора…"
            text="Разговорът ще се появи след момент."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="dAdminView dAdminChatDetailView">
      <section className="dAdminDetailHeader">
        <div>
          <BackLink onClick={goBack}>Всички чатове</BackLink>
          <span className="dAdminEyebrow">Активен разговор</span>
          <h2>{getVisitorName(selectedChatSummary)}</h2>
          <p>
            Последна активност: {formatDate(selectedChatSummary.lastMessageAt)}
          </p>
        </div>

        <div className="dAdminDetailHeader__status">
          <StatusBadge status={selectedChatSummary.status || 'open'} />
          <StatusBadge status={selectedChatSummary.priority || 'normal'} />
        </div>
      </section>

      {selectedChatSummary.needsAttention && (
        <div className="dAdminAttentionBanner">
          <AlertTriangle size={18} />
          <span>
            <strong>Този разговор чака реакция.</strong>
            {selectedChatSummary.attentionReason || 'Клиентът очаква отговор.'}
          </span>
        </div>
      )}

      <div className="dAdminChatWorkspace">
        <aside className="dAdminChatProfile">
          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><UserRound size={18} /></span>
                <div>
                  <small>Клиент</small>
                  <h3>Контактни данни</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminContactList">
              <ContactItem
                icon={Phone}
                label="Телефон"
                value={selectedChatSummary.visitor?.phone}
                href={
                  selectedChatSummary.visitor?.phone
                    ? `tel:${selectedChatSummary.visitor.phone}`
                    : ''
                }
              />
              <ContactItem
                icon={Mail}
                label="Имейл"
                value={selectedChatSummary.visitor?.email}
                href={
                  selectedChatSummary.visitor?.email
                    ? `mailto:${selectedChatSummary.visitor.email}`
                    : ''
                }
              />
            </div>
          </section>

          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><CheckCircle2 size={18} /></span>
                <div>
                  <small>Организация</small>
                  <h3>Статус и приоритет</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminChatTriageForm">
              <SelectField
                label="Статус"
                value={selectedChatSummary.status || 'open'}
                onChange={(value) => updateChatTriage({ status: value })}
              >
                <option value="open">Отворен</option>
                <option value="lead">Контакт</option>
                <option value="waiting_for_lawyer">Чака адвокат</option>
                <option value="lawyer_joined">Адвокат отговори</option>
                <option value="closed">Затворен</option>
              </SelectField>

              <SelectField
                label="Приоритет"
                value={selectedChatSummary.priority || 'normal'}
                onChange={(value) => updateChatTriage({ priority: value })}
              >
                <option value="low">Нисък</option>
                <option value="normal">Нормален</option>
                <option value="high">Висок</option>
              </SelectField>

              <TextField
                label="Име"
                value={selectedChatSummary.visitor?.name || ''}
                onChange={(value) => updateVisitorField('name', value)}
                className="dAdminField--full"
              />
              <button
                className="dAdminInlineSave"
                type="button"
                disabled={saving}
                onClick={() =>
                  saveVisitorField('name', selectedChatSummary.visitor?.name || '')
                }
              >
                Запази името
              </button>

              <TextField
                label="Телефон"
                value={selectedChatSummary.visitor?.phone || ''}
                onChange={(value) => updateVisitorField('phone', value)}
                className="dAdminField--full"
              />
              <button
                className="dAdminInlineSave"
                type="button"
                disabled={saving}
                onClick={() =>
                  saveVisitorField('phone', selectedChatSummary.visitor?.phone || '')
                }
              >
                Запази телефона
              </button>

              <TextField
                label="Имейл"
                type="email"
                value={selectedChatSummary.visitor?.email || ''}
                onChange={(value) => updateVisitorField('email', value)}
                className="dAdminField--full"
              />
              <button
                className="dAdminInlineSave"
                type="button"
                disabled={saving}
                onClick={() =>
                  saveVisitorField('email', selectedChatSummary.visitor?.email || '')
                }
              >
                Запази имейла
              </button>
            </div>
          </section>
        </aside>

        <section className="dAdminConversationPanel">
          <header className="dAdminConversationPanel__head">
            <div>
              <span className="dAdminConversationPanel__avatar">
                {getVisitorInitial(selectedChatSummary)}
              </span>
              <span>
                <strong>{getVisitorName(selectedChatSummary)}</strong>
                <small>
                  <Clock3 size={13} />
                  {formatDate(selectedChatSummary.lastMessageAt)}
                </small>
              </span>
            </div>
            <StatusBadge status={selectedChatSummary.status || 'open'} />
          </header>

          <div className="dAdminMessageStream">
            {chatMessages.length === 0 ? (
              <EmptyState
                compact
                icon={MessageSquareText}
                title="Няма съобщения"
                text="Разговорът все още е празен."
              />
            ) : (
              chatMessages.map((message) => {
                const isAdmin = message.meta?.source === 'admin';
                const isVisitor = message.role === 'user';
                const author = isAdmin
                  ? 'адв. Данков'
                  : isVisitor
                    ? 'посетител'
                    : message.role;

                return (
                  <article
                    className={`dAdminMessage ${isAdmin ? 'is-admin' : ''} ${
                      isVisitor ? 'is-visitor' : ''
                    }`}
                    key={message.id}
                  >
                    <span className="dAdminMessage__author">{author}</span>
                    <p>{message.content}</p>
                    <small>{formatDate(message.createdAt)}</small>
                  </article>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="dAdminComposer">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              onKeyDown={handleReplyKeyDown}
              placeholder="Напишете отговор към клиента…"
              rows={4}
            />

            <div className="dAdminComposer__footer">
              <small>Ctrl/⌘ + Enter за изпращане</small>
              <button
                className="dAdminButton dAdminButton--primary"
                type="button"
                onClick={sendReply}
                disabled={saving || !reply.trim()}
              >
                <Send size={17} />
                Изпрати отговор
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ChatsView(props) {
  if (props.route.itemId) {
    return <ChatDetail {...props} />;
  }

  return <ChatList {...props} chats={props.controller.chats} />;
}
