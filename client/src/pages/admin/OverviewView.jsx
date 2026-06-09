import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Newspaper,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';

import { EmptyState, StatusBadge } from './AdminUi.jsx';
import { formatDate } from './AdminUtils.js';
import './view/OverviewView.css';
function DashboardMetric({ label, value, helper, tone = 'neutral' }) {
  return (
    <article className={`dAdminMetric dAdminMetric--${tone}`}>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

function QuickAction({ icon: Icon, eyebrow, title, text, badge, onClick, tone = 'default' }) {
  return (
    <button
      className={`dAdminQuickAction dAdminQuickAction--${tone}`}
      type="button"
      onClick={onClick}
    >
      <span className="dAdminQuickAction__icon">
        <Icon size={22} />
      </span>

      <span className="dAdminQuickAction__copy">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{text}</span>
      </span>

      {badge > 0 && <b>{badge}</b>}
      <ArrowRight className="dAdminQuickAction__arrow" size={19} />
    </button>
  );
}

export default function OverviewView({ navigate, controller }) {
  const {
    overview,
    chats,
    bookings,
    posts,
    comments,
    openChat,
    resetPostForm,
    selectPost,
  } = controller;

  const attentionChats = chats
    .filter((chat) => chat.needsAttention)
    .slice(0, 4);

  const newBookings = bookings
    .filter((booking) => booking.status === 'new')
    .slice(0, 4);

  const recentPosts = [...posts]
    .sort((first, second) => {
      const firstDate = new Date(first.publishedAt || first.createdAt || 0).getTime();
      const secondDate = new Date(second.publishedAt || second.createdAt || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 4);

  const pendingComments = comments.filter((comment) => comment.status === 'pending').length;
  const draftPosts = posts.filter((post) => post.status === 'draft').length;

  async function openConversation(sessionId) {
    const opened = await openChat(sessionId);
    if (opened) {
      navigate({ section: 'chats', itemId: sessionId, settingsPanel: '' });
    }
  }

  function createPost() {
    resetPostForm();
    navigate({ section: 'posts', itemId: 'new', settingsPanel: '' });
  }

  function editPost(post) {
    selectPost(post);
    navigate({ section: 'posts', itemId: post.id, settingsPanel: '' });
  }

  return (
    <div className="dAdminOverview">
      <section className="dAdminOverviewHero">
        <div className="dAdminOverviewHero__copy">
          <span className="dAdminEyebrow">
            <Sparkles size={15} />
            Днешна работа
          </span>
          <h2>Най-важното е отпред.</h2>
          <p>
            Първо отговорете на клиентите, след това управлявайте съдържанието.
            Останалите секции са на един клик разстояние.
          </p>
        </div>

        <div className="dAdminOverviewHero__actions">
          <button
            className="dAdminButton dAdminButton--primary"
            type="button"
            onClick={() => navigate({ section: 'chats', itemId: '', settingsPanel: '' })}
          >
            <MessageSquareText size={18} />
            Отвори чатовете
          </button>

          <button
            className="dAdminButton dAdminButton--dark"
            type="button"
            onClick={createPost}
          >
            <Plus size={18} />
            Нова публикация
          </button>
        </div>
      </section>

      <section className="dAdminOverview__focusGrid" aria-label="Основни действия">
        <QuickAction
          icon={MessageSquareText}
          eyebrow="Основен приоритет"
          title="Клиентски чатове"
          text="Прегледайте разговорите и отговорете директно."
          badge={overview?.attentionChats || 0}
          tone="chat"
          onClick={() => navigate({ section: 'chats', itemId: '', settingsPanel: '' })}
        />

        <QuickAction
          icon={Newspaper}
          eyebrow="Съдържание"
          title="Новини и публикации"
          text="Създавайте, редактирайте и подреждайте новините."
          badge={draftPosts}
          tone="news"
          onClick={() => navigate({ section: 'posts', itemId: '', settingsPanel: '' })}
        />
      </section>

      <section className="dAdminOverview__metrics" aria-label="Статистика">
        <DashboardMetric
          label="Чакат отговор"
          value={overview?.attentionChats}
          helper="клиентски разговора"
          tone={(overview?.attentionChats || 0) > 0 ? 'warning' : 'success'}
        />
        <DashboardMetric
          label="Нови заявки"
          value={overview?.newBookings}
          helper="за консултация"
          tone={(overview?.newBookings || 0) > 0 ? 'warning' : 'neutral'}
        />
        <DashboardMetric
          label="Публикувани"
          value={overview?.publishedPosts}
          helper="новини и статии"
        />
        <DashboardMetric
          label="Видими коментари"
          value={overview?.visibleComments}
          helper={pendingComments > 0 ? `${pendingComments} чакат преглед` : 'няма чакащи'}
          tone={pendingComments > 0 ? 'warning' : 'neutral'}
        />
      </section>

      <div className="dAdminOverview__columns">
        <section className="dAdminPanel dAdminPanel--attention">
          <header className="dAdminPanel__head">
            <div>
              <span className="dAdminPanel__icon"><AlertTriangle size={18} /></span>
              <div>
                <small>Изискват реакция</small>
                <h3>Чатове за отговор</h3>
              </div>
            </div>

            <button
              className="dAdminTextButton"
              type="button"
              onClick={() => navigate({ section: 'chats', itemId: '', settingsPanel: '' })}
            >
              Всички
              <ArrowRight size={16} />
            </button>
          </header>

          <div className="dAdminPanel__body dAdminOverviewList">
            {attentionChats.length === 0 ? (
              <EmptyState
                compact
                icon={CheckCircle2}
                title="Няма чакащи чатове"
                text="Всички разговори са обработени."
              />
            ) : (
              attentionChats.map((chat) => (
                <button
                  className="dAdminOverviewRow"
                  key={chat.sessionId}
                  type="button"
                  onClick={() => openConversation(chat.sessionId)}
                >
                  <span className="dAdminOverviewRow__avatar">
                    {(chat.visitor?.name || chat.visitor?.phone || 'К').trim().charAt(0).toUpperCase()}
                  </span>

                  <span className="dAdminOverviewRow__copy">
                    <strong>
                      {chat.visitor?.name || chat.visitor?.phone || chat.visitor?.email || 'Посетител'}
                    </strong>
                    <span>{chat.lastMessage?.content || chat.attentionReason || 'Нов разговор'}</span>
                    <small>
                      <Clock3 size={13} />
                      {formatDate(chat.lastMessageAt)}
                    </small>
                  </span>

                  <StatusBadge status={chat.priority || 'normal'} />
                  <ArrowRight size={17} />
                </button>
              ))
            )}
          </div>
        </section>

        <section className="dAdminPanel">
          <header className="dAdminPanel__head">
            <div>
              <span className="dAdminPanel__icon"><CalendarDays size={18} /></span>
              <div>
                <small>Нови клиенти</small>
                <h3>Заявки за консултация</h3>
              </div>
            </div>

            <button
              className="dAdminTextButton"
              type="button"
              onClick={() => navigate({ section: 'bookings', itemId: '', settingsPanel: '' })}
            >
              Всички
              <ArrowRight size={16} />
            </button>
          </header>

          <div className="dAdminPanel__body dAdminOverviewList">
            {newBookings.length === 0 ? (
              <EmptyState
                compact
                icon={CheckCircle2}
                title="Няма нови заявки"
                text="Новите заявки ще се покажат тук."
              />
            ) : (
              newBookings.map((booking) => (
                <button
                  className="dAdminOverviewRow"
                  key={booking.id}
                  type="button"
                  onClick={() => navigate({ section: 'bookings', itemId: booking.id, settingsPanel: '' })}
                >
                  <span className="dAdminOverviewRow__avatar">
                    {(booking.client?.name || 'К').trim().charAt(0).toUpperCase()}
                  </span>

                  <span className="dAdminOverviewRow__copy">
                    <strong>{booking.client?.name || 'Клиент'}</strong>
                    <span>{booking.case?.area || booking.case?.summary || 'Консултация'}</span>
                    <small>
                      <Clock3 size={13} />
                      {formatDate(booking.createdAt)}
                    </small>
                  </span>

                  <StatusBadge status={booking.status || 'new'} />
                  <ArrowRight size={17} />
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="dAdminPanel dAdminPanel--wide">
        <header className="dAdminPanel__head">
          <div>
            <span className="dAdminPanel__icon"><Newspaper size={18} /></span>
            <div>
              <small>Последно съдържание</small>
              <h3>Новини и публикации</h3>
            </div>
          </div>

          <div className="dAdminPanel__actions">
            <button className="dAdminTextButton" type="button" onClick={createPost}>
              <Plus size={16} />
              Нова публикация
            </button>
            <button
              className="dAdminTextButton"
              type="button"
              onClick={() => navigate({ section: 'posts', itemId: '', settingsPanel: '' })}
            >
              Всички
              <ArrowRight size={16} />
            </button>
          </div>
        </header>

        <div className="dAdminPanel__body dAdminRecentPosts">
          {recentPosts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="Все още няма публикации"
              text="Създайте първата новина или статия за сайта."
              action={(
                <button className="dAdminButton dAdminButton--primary" type="button" onClick={createPost}>
                  <Plus size={17} />
                  Създай публикация
                </button>
              )}
            />
          ) : (
            recentPosts.map((post) => (
              <button
                className="dAdminRecentPost"
                key={post.id}
                type="button"
                onClick={() => editPost(post)}
              >
                <span className="dAdminRecentPost__media">
                  {post.heroImage?.url ? (
                    <img src={post.heroImage.url} alt="" />
                  ) : (
                    <Newspaper size={21} />
                  )}
                </span>

                <span className="dAdminRecentPost__copy">
                  <small>{post.category || 'Без категория'}</small>
                  <strong>{post.title || 'Публикация без заглавие'}</strong>
                  <span>{formatDate(post.publishedAt || post.createdAt, false)}</span>
                </span>

                <StatusBadge status={post.status || 'draft'} />
                <ArrowRight size={17} />
              </button>
            ))
          )}
        </div>
      </section>

      <section className="dAdminOverview__footerActions" aria-label="Допълнителни действия">
        <button
          type="button"
          onClick={() => navigate({ section: 'comments', itemId: '', settingsPanel: '' })}
        >
          <MessageSquareText size={18} />
          <span>
            <strong>Коментари</strong>
            <small>{pendingComments > 0 ? `${pendingComments} чакат преглед` : 'Преглед и модерация'}</small>
          </span>
          <ArrowRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => navigate({ section: 'settings', itemId: '', settingsPanel: '' })}
        >
          <Settings size={18} />
          <span>
            <strong>Настройки на сайта</strong>
            <small>Текстове, секции и функции</small>
          </span>
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}
