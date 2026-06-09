import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  MessageCircleMore,
  MessagesSquare,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import '../admin/view/CommentsView.css';
import {
  BackLink,
  EmptyState,
  FilterTabs,
  SearchBox,
  StatusBadge,
} from './AdminUI.jsx';
import {
  formatDate,
  includesSearch,
  normalizeSearch,
} from './AdminUtils.js';

const COMMENT_FILTERS = [
  { value: 'all', label: 'Всички' },
  { value: 'pending', label: 'Чакат преглед' },
  { value: 'visible', label: 'Видими' },
  { value: 'hidden', label: 'Скрити' },
  { value: 'deleted', label: 'Изтрити' },
];

function getAuthorName(comment) {
  return (
    comment?.displayName ||
    comment?.name ||
    comment?.author?.name ||
    'Анонимен посетител'
  );
}

function getAuthorEmail(comment) {
  return comment?.email || comment?.author?.email || '';
}

function getCommentPost(comment) {
  return comment?.postTitle || comment?.postSlug || 'Публикация';
}

function getCommentTone(status) {
  if (status === 'pending') return 'warning';
  if (status === 'visible') return 'success';
  if (status === 'deleted') return 'danger';
  return 'neutral';
}

function CommentActions({ comment, saving, updateCommentStatus, compact = false }) {
  const status = comment?.status || 'pending';

  async function setStatus(nextStatus) {
    if (nextStatus === 'deleted' && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        'Сигурни ли сте, че искате да маркирате този коментар като изтрит?'
      );
      if (!confirmed) return;
    }

    await updateCommentStatus(comment.id, nextStatus);
  }

  return (
    <div className={`dAdminCommentActions ${compact ? 'dAdminCommentActions--compact' : ''}`}>
      {status !== 'visible' && (
        <button
          className="dAdminActionButton dAdminActionButton--success"
          type="button"
          onClick={() => setStatus('visible')}
          disabled={saving}
        >
          <Eye size={16} />
          <span>Покажи</span>
        </button>
      )}

      {status !== 'hidden' && status !== 'deleted' && (
        <button
          className="dAdminActionButton"
          type="button"
          onClick={() => setStatus('hidden')}
          disabled={saving}
        >
          <EyeOff size={16} />
          <span>Скрий</span>
        </button>
      )}

      {status !== 'deleted' && (
        <button
          className="dAdminActionButton dAdminActionButton--danger"
          type="button"
          onClick={() => setStatus('deleted')}
          disabled={saving}
        >
          <Trash2 size={16} />
          <span>Изтрий</span>
        </button>
      )}
    </div>
  );
}

function ModerationMetric({ icon: Icon, label, value, helper, tone = 'neutral' }) {
  return (
    <div className={`dAdminModerationMetric dAdminModerationMetric--${tone}`}>
      <span className="dAdminModerationMetric__icon">
        <Icon size={18} />
      </span>
      <span className="dAdminModerationMetric__copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{helper}</span>
      </span>
    </div>
  );
}

function CommentsList({ navigate, controller }) {
  const { comments, saving, updateCommentStatus } = controller;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    return comments.reduce(
      (result, comment) => {
        const status = comment.status || 'pending';
        result.all += 1;
        result[status] = (result[status] || 0) + 1;
        return result;
      },
      {
        all: 0,
        pending: 0,
        visible: 0,
        hidden: 0,
        deleted: 0,
      }
    );
  }, [comments]);

  const filterItems = useMemo(
    () => COMMENT_FILTERS.map((item) => ({
      ...item,
      count: counts[item.value] || 0,
    })),
    [counts]
  );

  const filteredComments = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return comments
      .filter((comment) => filter === 'all' || (comment.status || 'pending') === filter)
      .filter((comment) => includesSearch(normalizedQuery, [
        getAuthorName(comment),
        getAuthorEmail(comment),
        comment.body,
        comment.postSlug,
        comment.postTitle,
        comment.status,
      ]))
      .sort((a, b) => {
        const priorityA = (a.status || 'pending') === 'pending' ? 1 : 0;
        const priorityB = (b.status || 'pending') === 'pending' ? 1 : 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [comments, filter, query]);

  function openComment(commentId) {
    navigate({ section: 'comments', itemId: commentId, settingsPanel: '' });
  }

  return (
    <div className="dAdminView dAdminCommentsView">
      <section className="dAdminPageIntro dAdminPageIntro--comments">
        <div>
          <BackLink
            onClick={() => navigate({ section: 'overview', itemId: '', settingsPanel: '' })}
          >
            Към таблото
          </BackLink>
          <span className="dAdminEyebrow">Модерация</span>
          <h2>Коментари</h2>
          <p>
            Всички мнения са събрани в ясна опашка за преглед. Най-новите и
            чакащите одобрение винаги стоят най-отгоре.
          </p>
        </div>

        <div className="dAdminPageIntro__status">
          <span className={counts.pending > 0 ? 'is-warning' : 'is-clear'}>
            {counts.pending > 0 ? <Clock3 size={17} /> : <CheckCircle2 size={17} />}
            {counts.pending > 0
              ? `${counts.pending} чакат решение`
              : 'Всичко е прегледано'}
          </span>
        </div>
      </section>

      <section className="dAdminModerationMetrics" aria-label="Статистика за коментарите">
        <ModerationMetric
          icon={Clock3}
          label="Чакат преглед"
          value={counts.pending}
          helper="изискват решение"
          tone={counts.pending > 0 ? 'warning' : 'success'}
        />
        <ModerationMetric
          icon={Eye}
          label="Видими"
          value={counts.visible}
          helper="показват се в сайта"
          tone="success"
        />
        <ModerationMetric
          icon={EyeOff}
          label="Скрити"
          value={counts.hidden}
          helper="запазени, но невидими"
        />
        <ModerationMetric
          icon={MessagesSquare}
          label="Общо"
          value={counts.all}
          helper="получени коментари"
        />
      </section>

      <section className="dAdminPanel dAdminPanel--wide dAdminCommentsPanel">
        <div className="dAdminToolbar">
          <SearchBox
            wide
            value={query}
            onChange={setQuery}
            placeholder="Търсене по автор, публикация или съдържание…"
          />
          <FilterTabs value={filter} onChange={setFilter} items={filterItems} />
        </div>

        <div className="dAdminCommentsQueue">
          {filteredComments.length === 0 ? (
            <EmptyState
              icon={MessageCircleMore}
              title={query ? 'Няма намерени коментари' : 'Няма коментари в тази категория'}
              text={
                query
                  ? 'Променете търсенето или изберете друг филтър.'
                  : 'Когато посетител остави мнение, то ще се появи тук.'
              }
            />
          ) : (
            filteredComments.map((comment) => {
              const status = comment.status || 'pending';

              return (
                <article
                  className={`dAdminCommentCard dAdminCommentCard--${status}`}
                  key={comment.id}
                >
                  <button
                    className="dAdminCommentCard__main"
                    type="button"
                    onClick={() => openComment(comment.id)}
                  >
                    <span className="dAdminCommentCard__avatar">
                      {getAuthorName(comment).trim().charAt(0).toUpperCase() || 'К'}
                    </span>

                    <span className="dAdminCommentCard__content">
                      <span className="dAdminCommentCard__topline">
                        <strong>{getAuthorName(comment)}</strong>
                        <small>{formatDate(comment.createdAt)}</small>
                      </span>

                      <span className="dAdminCommentCard__meta">
                        <StatusBadge status={status} tone={getCommentTone(status)} />
                        <span>
                          <FileText size={13} />
                          {getCommentPost(comment)}
                        </span>
                      </span>

                      <span className="dAdminCommentCard__body">
                        {comment.body || 'Коментарът няма съдържание.'}
                      </span>
                    </span>

                    <ArrowRight className="dAdminCommentCard__arrow" size={18} />
                  </button>

                  <CommentActions
                    compact
                    comment={comment}
                    saving={saving}
                    updateCommentStatus={updateCommentStatus}
                  />
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function CommentDetail({ route, navigate, controller }) {
  const { comments, saving, updateCommentStatus } = controller;
  const comment = comments.find((item) => String(item.id) === String(route.itemId));

  useEffect(() => {
    if (!comment && comments.length > 0) {
      navigate(
        { section: 'comments', itemId: '', settingsPanel: '' },
        { replace: true }
      );
    }
  }, [comment, comments.length, navigate]);

  if (!comment) {
    return (
      <div className="dAdminView">
        <BackLink
          onClick={() => navigate({ section: 'comments', itemId: '', settingsPanel: '' })}
        >
          Назад към коментарите
        </BackLink>
        <EmptyState
          icon={MessageCircleMore}
          title="Коментарът не е намерен"
          text="Възможно е да е бил премахнат или списъкът все още да се обновява."
        />
      </div>
    );
  }

  const status = comment.status || 'pending';
  const authorEmail = getAuthorEmail(comment);

  return (
    <div className="dAdminView dAdminCommentDetail">
      <section className="dAdminDetailHeader">
        <div>
          <BackLink
            onClick={() => navigate({ section: 'comments', itemId: '', settingsPanel: '' })}
          >
            Назад към коментарите
          </BackLink>
          <span className="dAdminEyebrow">Преглед и модерация</span>
          <h2>Коментар от {getAuthorName(comment)}</h2>
          <p>
            Прегледайте съдържанието и изберете дали да бъде видимо в сайта.
          </p>
        </div>

        <StatusBadge status={status} tone={getCommentTone(status)} />
      </section>

      <div className="dAdminCommentDetail__layout">
        <main className="dAdminCommentDetail__main">
          <section className="dAdminPanel dAdminCommentPreview">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon">
                  <MessageCircleMore size={18} />
                </span>
                <div>
                  <small>Съдържание</small>
                  <h3>Публикуван коментар</h3>
                </div>
              </div>
            </header>

            <div className="dAdminCommentPreview__body">
              <span className="dAdminCommentPreview__quote">“</span>
              <p>{comment.body || 'Коментарът няма съдържание.'}</p>
            </div>

            <footer className="dAdminCommentPreview__footer">
              <span className="dAdminCommentCard__avatar">
                {getAuthorName(comment).trim().charAt(0).toUpperCase() || 'К'}
              </span>
              <span>
                <strong>{getAuthorName(comment)}</strong>
                <small>{formatDate(comment.createdAt)}</small>
              </span>
            </footer>
          </section>

          <section className="dAdminPanel dAdminModerationDecision">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <small>Решение</small>
                  <h3>Управление на видимостта</h3>
                </div>
              </div>
            </header>

            <p>
              „Покажи“ публикува коментара в сайта. „Скрий“ го запазва в
              системата, но го премахва от публичния изглед.
            </p>

            <CommentActions
              comment={comment}
              saving={saving}
              updateCommentStatus={updateCommentStatus}
            />
          </section>
        </main>

        <aside className="dAdminCommentDetail__aside">
          <section className="dAdminPanel dAdminInfoPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon">
                  <UserRound size={18} />
                </span>
                <div>
                  <small>Автор</small>
                  <h3>Информация</h3>
                </div>
              </div>
            </header>

            <dl className="dAdminInfoList">
              <div>
                <dt>Име</dt>
                <dd>{getAuthorName(comment)}</dd>
              </div>
              <div>
                <dt>Имейл</dt>
                <dd>{authorEmail || 'Не е предоставен'}</dd>
              </div>
              <div>
                <dt>Получен</dt>
                <dd>{formatDate(comment.createdAt)}</dd>
              </div>
              <div>
                <dt>Текущ статус</dt>
                <dd><StatusBadge status={status} tone={getCommentTone(status)} /></dd>
              </div>
            </dl>
          </section>

          <section className="dAdminPanel dAdminInfoPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon">
                  <FileText size={18} />
                </span>
                <div>
                  <small>Контекст</small>
                  <h3>Публикация</h3>
                </div>
              </div>
            </header>

            <dl className="dAdminInfoList">
              <div>
                <dt>Заглавие / slug</dt>
                <dd>{getCommentPost(comment)}</dd>
              </div>
              {comment.postTitle && comment.postSlug && (
                <div>
                  <dt>Slug</dt>
                  <dd>{comment.postSlug}</dd>
                </div>
              )}
              {comment.id && (
                <div>
                  <dt>Коментар ID</dt>
                  <dd>{comment.id}</dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function CommentsView(props) {
  if (props.route.itemId) {
    return <CommentDetail {...props} />;
  }

  return <CommentsList {...props} />;
}
