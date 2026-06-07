import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, MessageCircle, SendHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api.js';
import { cases as fallbackCases } from '../_shared/homeData.js';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './Cases.css';

function getCaseSessionId() {
  const key = 'dankov_case_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

function fallbackPosts() {
  return fallbackCases.map((item, index) => ({
    id: item.title,
    slug: `fallback-case-${index + 1}`,
    title: item.title,
    excerpt: item.text,
    body: `${item.text}\n\nТози материал е обща информационна публикация. За конкретна преценка са важни документите, сроковете и точната хронология.`,
    category: item.tag,
    location: index === 0 ? 'Враца' : 'България',
    publishedAt: item.date,
    heroImage: {
      url: index === 0 ? '/diyan-dankov.png' : index === 1 ? '/diyan-dankovv.jpg' : '/diyan-dankov2.jpg',
      alt: item.title,
    },
    stats: {
      likes: 0,
      comments: 0,
    },
    editorialNote: index === 0 ? 'Последно добавено' : 'Казус',
    liked: false,
  }));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '2026');

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function CaseDetail({ post, comments, loading, onClose, onLike, onSubmitComment }) {
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('dankov_case_name') || '');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const cleanName = displayName.trim();
    const cleanBody = body.trim();

    if (cleanName.length < 2) {
      setError('Изберете име за коментара.');
      return;
    }

    if (cleanBody.length < 2) {
      setError('Напишете кратък коментар.');
      return;
    }

    localStorage.setItem('dankov_case_name', cleanName);
    const ok = await onSubmitComment({ displayName: cleanName, body: cleanBody });
    if (ok) {
      setBody('');
      setError('');
    }
  }

  return (
    <motion.div
      className="hlCaseModal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="hlCaseModal__scrim" type="button" onClick={onClose} aria-label="Назад" />

      <motion.article
        className="hlCaseModal__panel"
        initial={{ opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hlCaseModal__media">
          <img src={post.heroImage?.url || '/diyan-dankov.png'} alt={post.heroImage?.alt || post.title} />
          <button type="button" onClick={onClose} className="hlCaseModal__back">
            <ArrowLeft size={18} />
            Назад
          </button>
          <button type="button" onClick={onClose} className="hlCaseModal__close" aria-label="Затвори">
            <X size={22} />
          </button>
        </div>

        <div className="hlCaseModal__body">
          <div className="hlCaseModal__meta">
            <span>{post.category}</span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>

          <h3>{post.title}</h3>
          <p className="hlCaseModal__lead">{post.excerpt}</p>
          <p className="hlCaseModal__text">{post.body}</p>

          <div className="hlCaseModal__actions">
            <button type="button" onClick={onLike} className={post.liked ? 'is-liked' : ''}>
              <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
              {post.stats?.likes || 0}
            </button>
            <span>
              <MessageCircle size={18} />
              {post.stats?.comments || comments.length || 0}
            </span>
          </div>

          <section className="hlCaseComments">
            <div className="hlCaseComments__head">
              <strong>Коментари</strong>
              <small>Без обиди, лични данни, линкове и спам. Коментари могат да бъдат премахвани.</small>
            </div>

            <form className="hlCaseComments__form" onSubmit={submit}>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Вашето име"
                maxLength={48}
              />
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Кратък коментар..."
                maxLength={900}
              />
              {error && <p className="hlCaseComments__error">{error}</p>}
              <button type="submit">
                <SendHorizontal size={17} />
                Публикувай
              </button>
            </form>

            <div className="hlCaseComments__list">
              {loading ? (
                <p className="hlCaseComments__empty">Зареждане...</p>
              ) : comments.length ? (
                comments.map((comment) => (
                  <article key={comment.id}>
                    <strong>{comment.displayName}</strong>
                    <time>{formatDate(comment.createdAt)}</time>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <p className="hlCaseComments__empty">Още няма коментари. Бъдете първият с кратка позиция.</p>
              )}
            </div>
          </section>
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function Cases() {
  const [posts, setPosts] = useState(() => fallbackPosts());
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sessionId] = useState(getCaseSessionId);

  const activePost = posts[activeIndex] || posts[0];

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const response = await api.get('/api/cases', {
          params: { sessionId },
        });
        if (!cancelled && response.data?.posts?.length) {
          setPosts(response.data.posts);
          setActiveIndex(0);
        }
      } catch {
        // Keep local editorial fallback.
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!selected) return undefined;
    let cancelled = false;

    async function loadCase() {
      setCommentsLoading(true);
      try {
        const response = await api.get(`/api/cases/${selected.slug}`, {
          params: { sessionId },
        });
        if (!cancelled) {
          setSelected(response.data.post);
          setComments(response.data.comments || []);
        }
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }

    loadCase();

    return () => {
      cancelled = true;
    };
  }, [selected?.slug, sessionId]);

  const railStyle = useMemo(
    () => ({
      transform: `translateX(calc(${activeIndex} * -100%))`,
    }),
    [activeIndex]
  );

  function move(direction) {
    setActiveIndex((value) => {
      const next = value + direction;
      if (next < 0) return posts.length - 1;
      if (next >= posts.length) return 0;
      return next;
    });
  }

  async function likePost(slug = selected?.slug) {
    if (!slug) return;

    setPosts((current) =>
      current.map((post) =>
        post.slug === slug && !post.liked
          ? { ...post, liked: true, stats: { ...post.stats, likes: (post.stats?.likes || 0) + 1 } }
          : post
      )
    );
    if (selected?.slug === slug && !selected.liked) {
      setSelected((post) => ({
        ...post,
        liked: true,
        stats: { ...post.stats, likes: (post.stats?.likes || 0) + 1 },
      }));
    }

    try {
      const response = await api.post(`/api/cases/${slug}/like`, {
        sessionId,
        fingerprint: navigator.userAgent.slice(0, 160),
      });

      setPosts((current) =>
        current.map((post) =>
          post.slug === slug
            ? { ...post, liked: true, stats: { ...post.stats, likes: response.data.likes } }
            : post
        )
      );
      if (selected?.slug === slug) {
        setSelected((post) => ({
          ...post,
          liked: true,
          stats: { ...post.stats, likes: response.data.likes },
        }));
      }
    } catch {
      // Optimistic like remains local; backend uniqueness prevents duplicates.
    }
  }

  async function submitComment(payload) {
    if (!selected) return false;

    try {
      const response = await api.post(`/api/cases/${selected.slug}/comments`, {
        ...payload,
        sessionId,
      });

      setComments((current) => [response.data.comment, ...current]);
      setPosts((current) =>
        current.map((post) =>
          post.slug === selected.slug
            ? { ...post, stats: { ...post.stats, comments: response.data.comments } }
            : post
        )
      );
      setSelected((post) => ({
        ...post,
        stats: { ...post.stats, comments: response.data.comments },
      }));
      return true;
    } catch {
      return false;
    }
  }

  return (
    <section className="hlSection hlCases" id="cases">
      <motion.div
        className="hlCases__shell"
        variants={pageStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.16 }}
      >
        <div className="hlCases__head">
          <div>
            <motion.p className="hlKicker" variants={fadeUp}>
              Последни казуси
            </motion.p>
            <motion.h2 className="hlSectionTitle" variants={fadeUp}>
              Правни истории като <em>медийна хроника.</em>
            </motion.h2>
          </div>

          <motion.div className="hlCases__controls" variants={fadeUp}>
            <button type="button" onClick={() => move(-1)} aria-label="Предишна новина">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Следваща новина">
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        <motion.div className="hlCasesTicker" variants={fadeUp}>
          <span>последно добавено</span>
          <div>
            <p>{activePost?.title}</p>
            <p>{activePost?.title}</p>
          </div>
        </motion.div>

        <div className="hlCasesCarousel">
          <div className="hlCasesCarousel__rail" style={railStyle}>
            {posts.map((post) => (
              <article className="hlMediaCard" key={post.slug}>
                <button type="button" onClick={() => setSelected(post)}>
                  <span className="hlMediaCard__image">
                    <img src={post.heroImage?.url || '/diyan-dankov.png'} alt={post.heroImage?.alt || post.title} />
                    <i>{post.editorialNote || 'Казус'}</i>
                  </span>
                  <span className="hlMediaCard__content">
                    <span className="hlMediaCard__meta">
                      <strong>{post.category}</strong>
                      <time>{formatDate(post.publishedAt)}</time>
                    </span>
                    <span className="hlMediaCard__title">{post.title}</span>
                    <span className="hlMediaCard__excerpt">{post.excerpt}</span>
                    <span className="hlMediaCard__footer">
                      <span>
                        <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                        {post.stats?.likes || 0}
                      </span>
                      <span>
                        <MessageCircle size={16} />
                        {post.stats?.comments || 0}
                      </span>
                      <em>Отвори</em>
                    </span>
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="hlCasesDots" aria-label="Избор на новина">
          {posts.map((post, index) => (
            <button
              type="button"
              key={post.slug}
              className={index === activeIndex ? 'is-active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-label={`Новина ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <CaseDetail
            post={selected}
            comments={comments}
            loading={commentsLoading}
            onClose={() => setSelected(null)}
            onLike={() => likePost(selected.slug)}
            onSubmitComment={submitComment}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
