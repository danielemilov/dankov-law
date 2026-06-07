import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Play,
  SendHorizontal,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api.js';
import { cases as fallbackCases, videos } from '../_shared/homeData.js';
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
  const videoPosts = videos.map((item, index) => ({
    id: `fallback-video-${index + 1}`,
    slug: `fallback-video-${index + 1}`,
    type: 'video',
    title: item.headline.join(' '),
    excerpt: item.lead,
    body: item.lead,
    category: item.label,
    location: 'Разград',
    publishedAt: index === 0 ? '2026-06-01' : '2026-05-25',
    heroImage: {
      url: index === 0 ? '/diyan-dankov.png' : '/diyan-dankovv.jpg',
      alt: item.label,
    },
    video: item,
    stats: { comments: 0 },
    editorialNote: 'Видео',
  }));

  const casePosts = fallbackCases.map((item, index) => ({
    id: `fallback-case-${index + 1}`,
    slug: `fallback-case-${index + 1}`,
    type: 'article',
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
    stats: { comments: 0 },
    editorialNote: index === 0 ? 'Последно добавено' : 'Казус',
  }));

  return [...videoPosts, ...casePosts];
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

function getPostUrl(slug) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/?case=${encodeURIComponent(slug)}#cases`;
}

function MediaVisual({ post, compact = false, reader = false }) {
  if (post.type === 'video' && post.video?.src) {
    return (
      <video
        src={post.video.src}
        autoPlay={!reader}
        controls={reader}
        muted
        playsInline
        loop
        preload="metadata"
        style={{ objectPosition: post.video.objectPosition || 'center center' }}
      />
    );
  }

  return (
    <img
      src={post.heroImage?.url || '/diyan-dankov.png'}
      alt={post.heroImage?.alt || post.title}
      loading={compact ? 'lazy' : 'eager'}
    />
  );
}

function ShareActions({ post, onCopy, copied }) {
  const url = getPostUrl(post.slug);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <div className="hlShareActions">
      <button type="button" onClick={() => onCopy(url)}>
        <Copy size={16} />
        {copied ? 'Копирано' : 'Копирай линк'}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        <strong>in</strong>
        LinkedIn
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
      >
        <strong>f</strong>
        Facebook
      </a>
    </div>
  );
}

function CaseDetail({ post, comments, loading, onClose, onSubmitComment }) {
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('dankov_case_name') || '');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function copyLink(url = getPostUrl(post.slug)) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Не успях да копирам линка автоматично.');
    }
  }

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
    } else {
      setError('Коментарът не беше публикуван. Опитайте пак след малко.');
    }
  }

  return (
    <motion.div
      className="hlCaseReader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.article
        className="hlCaseReader__panel"
        initial={{ y: 28 }}
        animate={{ y: 0 }}
        exit={{ y: 18 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="hlCaseReader__bar">
          <button type="button" onClick={onClose}>
            <ArrowLeft size={18} />
            Назад
          </button>
          <span>{post.type === 'video' ? 'Видео' : 'Новина'}</span>
          <button type="button" onClick={onClose} aria-label="Затвори">
            <X size={20} />
          </button>
        </header>

        <div className="hlCaseReader__media">
          <MediaVisual post={post} reader />
          {post.type === 'video' && (
            <a href={post.video?.youtubeUrl || post.video?.src} target="_blank" rel="noreferrer">
              <Play size={18} fill="currentColor" />
              Гледай цялото видео
            </a>
          )}
        </div>

        <div className="hlCaseReader__content">
          <div className="hlCaseReader__meta">
            <strong>{post.category}</strong>
            <time>{formatDate(post.publishedAt)}</time>
          </div>

          <h3>{post.title}</h3>
          <p className="hlCaseReader__lead">{post.excerpt}</p>
          <p className="hlCaseReader__text">{post.body}</p>

          <ShareActions post={post} onCopy={copyLink} copied={copied} />

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
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState('');
  const [sessionId] = useState(getCaseSessionId);

  const featured = posts[0];
  const rest = posts.slice(1);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const response = await api.get('/api/cases', {
          params: { sessionId },
        });
        if (!cancelled && response.data?.posts?.length) {
          setPosts(response.data.posts);
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
    if (!posts.length) return;
    const slug = new URLSearchParams(window.location.search).get('case');
    if (!slug || selected) return;
    const found = posts.find((post) => post.slug === slug);
    if (found) setSelected(found);
  }, [posts, selected]);

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

    const params = new URLSearchParams(window.location.search);
    params.set('case', selected.slug);
    window.history.replaceState(null, '', `?${params.toString()}#cases`);
    loadCase();

    return () => {
      cancelled = true;
    };
  }, [selected?.slug, sessionId]);

  function closeReader() {
    setSelected(null);
    setComments([]);
    window.history.replaceState(null, '', `${window.location.pathname}#cases`);
    window.requestAnimationFrame(() => {
      document.querySelector('#cases')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function copyPostLink(post) {
    try {
      await navigator.clipboard.writeText(getPostUrl(post.slug));
      setCopiedSlug(post.slug);
      window.setTimeout(() => setCopiedSlug(''), 1500);
    } catch {
      setCopiedSlug('');
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
              Медийна хроника
            </motion.p>
            <motion.h2 className="hlSectionTitle" variants={fadeUp}>
              Видео и казуси в <em>жива емисия.</em>
            </motion.h2>
          </div>
        </div>

        {featured && (
          <motion.article className="hlFeaturedStory" variants={fadeUp}>
            <button type="button" onClick={() => setSelected(featured)}>
              <span className="hlFeaturedStory__visual">
                <MediaVisual post={featured} />
                <i>
                  {featured.type === 'video' ? <Play size={15} fill="currentColor" /> : null}
                  {featured.editorialNote || (featured.type === 'video' ? 'Видео' : 'Последно добавено')}
                </i>
              </span>
              <span className="hlFeaturedStory__content">
                <span className="hlStoryMeta">
                  <strong>{featured.category}</strong>
                  <time>{formatDate(featured.publishedAt)}</time>
                </span>
                <span className="hlFeaturedStory__title">{featured.title}</span>
                <span className="hlFeaturedStory__excerpt">{featured.excerpt}</span>
                <span className="hlStoryActions">
                  <span>
                    <MessageCircle size={16} />
                    {featured.stats?.comments || 0}
                  </span>
                  <em>Отвори</em>
                </span>
              </span>
            </button>
          </motion.article>
        )}

        <div className="hlStoryFeed">
          {rest.map((post, index) => (
            <motion.article className="hlStoryCard" key={post.slug} variants={fadeUp}>
              <button type="button" onClick={() => setSelected(post)}>
                <span className="hlStoryCard__visual">
                  <MediaVisual post={post} compact />
                  {post.type === 'video' && (
                    <i>
                      <Play size={16} fill="currentColor" />
                    </i>
                  )}
                </span>
                <span className="hlStoryCard__content">
                  <span className="hlStoryMeta">
                    <strong>{post.category}</strong>
                    <time>{formatDate(post.publishedAt)}</time>
                  </span>
                  <span className="hlStoryCard__title">{post.title}</span>
                  <span className="hlStoryCard__excerpt">{post.excerpt}</span>
                  <span className="hlStoryActions">
                    <span>
                      <MessageCircle size={16} />
                      {post.stats?.comments || 0}
                    </span>
                    <em>Отвори</em>
                  </span>
                </span>
              </button>

              <div className="hlStoryCard__share">
                <button type="button" onClick={() => copyPostLink(post)}>
                  <Share2 size={15} />
                  {copiedSlug === post.slug ? 'Копирано' : 'Share'}
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPostUrl(post.slug))}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Сподели в LinkedIn"
                >
                  <strong>in</strong>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl(post.slug))}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Сподели във Facebook"
                >
                  <strong>f</strong>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <CaseDetail
            post={selected}
            comments={comments}
            loading={commentsLoading}
            onClose={closeReader}
            onSubmitComment={submitComment}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
