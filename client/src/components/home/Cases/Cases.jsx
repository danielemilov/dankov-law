import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  MessageCircle,
  Play,
  SendHorizontal,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api from '../../../lib/api.js';
import { cases as fallbackCases, videos } from '../_shared/homeData.js';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './Cases.css';
const FALLBACK_VIDEO_SLUGS = [
  'video-malki-istorii-prava',
  'video-pravoto-ima-choveshko-litse',
];
const FALLBACK_CASE_SLUGS = [
  'nezakonno-uvolnenie-vratsa',
  'kontrol-varhu-administrativni-aktove',
  'omrazna-rech-diskriminatsiya',
];
const LEGACY_SLUGS = {
  'fallback-video-1': FALLBACK_VIDEO_SLUGS[0],
  'fallback-video-2': FALLBACK_VIDEO_SLUGS[1],
  'fallback-case-1': FALLBACK_CASE_SLUGS[0],
  'fallback-case-2': FALLBACK_CASE_SLUGS[1],
  'fallback-case-3': FALLBACK_CASE_SLUGS[2],
};
function resolvePostSlug(slug = '') {
  const clean = String(slug).trim();
  return LEGACY_SLUGS[clean] || clean;
}
function getCaseSessionId() {
  if (typeof window === 'undefined') {
    return 'server-session';
  }
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
    slug: FALLBACK_VIDEO_SLUGS[index],
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
    stats: {
      comments: 0,
    },
    editorialNote: 'Видео',
  }));
  const casePosts = fallbackCases.map((item, index) => ({
    id: `fallback-case-${index + 1}`,
    slug: FALLBACK_CASE_SLUGS[index],
    type: 'article',
    title: item.title,
    excerpt: item.text,
    body: `${item.text}\n\nТози материал е обща информационна публикация. За конкретна преценка са важни документите, сроковете и точната хронология.`,
    category: item.tag,
    location: index === 0 ? 'Враца' : 'България',
    publishedAt: item.date,
    heroImage: {
      url:
        index === 0
          ? '/diyan-dankov.png'
          : index === 1
            ? '/diyan-dankovv.jpg'
            : '/diyan-dankov2.jpg',
      alt: item.title,
    },
    stats: {
      comments: 0,
    },
    editorialNote: index === 0 ? 'Последно добавено' : 'Казус',
  }));
  return [...videoPosts, ...casePosts];
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || '2026');
  }
  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
function getPostUrl(slug) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/novini/${encodeURIComponent(resolvePostSlug(slug))}`;
}
function isMobileShareViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 820px)').matches;
}
function stopInteractiveEvent(event) {
  event.preventDefault();
  event.stopPropagation();
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
        style={{
          objectPosition: post.video.objectPosition || 'center center',
        }}
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
function ShareMenu({
  post,
  copied = false,
  onCopy,
  className = '',
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const url = getPostUrl(post.slug);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(post.title);
  useEffect(() => {
    if (!open) return undefined;
    function handleOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);
  async function handlePrimaryShare(event) {
    stopInteractiveEvent(event);
    if (
      isMobileShareViewport() &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url,
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    setOpen((current) => !current);
  }
  async function handleCopy(event) {
    stopInteractiveEvent(event);
    await onCopy(post);
    setOpen(false);
  }
  function stopSocialNavigation(event) {
    event.stopPropagation();
    setOpen(false);
  }
  return (
    <div
      ref={rootRef}
      className={`hlStoryShare ${open ? 'is-open' : ''} ${className}`}
    >
      <button
        className={`hlStoryShare__trigger ${copied ? 'is-copied' : ''}`}
        type="button"
        onClick={handlePrimaryShare}
        aria-label={copied ? 'Линкът е копиран' : 'Сподели публикацията'}
        aria-expanded={open}
        title={copied ? 'Копирано' : 'Сподели'}
      >
        {copied ? <Copy size={17} /> : <Share2 size={17} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="hlStoryShare__menu"
            initial={{
              opacity: 0,
              y: 7,
              scale: 0.94,
              filter: 'blur(5px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: 5,
              scale: 0.96,
              filter: 'blur(4px)',
            }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Копирай линка"
              title="Копирай линка"
            >
              <Copy size={16} />
            </button>
            <a
              className="hlStoryShare__linkedin"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              onClick={stopSocialNavigation}
              aria-label="Сподели в LinkedIn"
              title="LinkedIn"
            >
              <strong>in</strong>
            </a>
            <a
              className="hlStoryShare__facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`}
              target="_blank"
              rel="noreferrer"
              onClick={stopSocialNavigation}
              aria-label="Сподели във Facebook"
              title="Facebook"
            >
              <strong>f</strong>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function StoryMediaActions({
  post,
  compact = false,
  copied = false,
  onCopy,
}) {
  return (
    <div
      className={`hlStoryMedia ${
        compact ? 'hlStoryMedia--compact' : ''
      }`}
    >
      <MediaVisual post={post} compact={compact} />
      <span className="hlStoryMedia__shade" aria-hidden="true" />
      <span className="hlStoryMedia__category">
        {post.editorialNote ||
          (post.type === 'video' ? 'Видео' : post.category)}
      </span>
      {post.type === 'video' && (
        <span className="hlStoryMedia__play" aria-hidden="true">
          <Play size={17} fill="currentColor" />
        </span>
      )}
      <div className="hlStoryMedia__controls">
        <span
          className="hlStoryMedia__comments"
          aria-label={`${post.stats?.comments || 0} коментара`}
        >
          <MessageCircle size={16} />
          {post.stats?.comments || 0}
        </span>
        <ShareMenu
          post={post}
          copied={copied}
          onCopy={onCopy}
        />
      </div>
    </div>
  );
}
function StoryMeta({ post }) {
  return (
    <div className="hlEditorialMeta">
      <strong>{post.category}</strong>
      <span aria-hidden="true">•</span>
      <time>{formatDate(post.publishedAt)}</time>
    </div>
  );
}
function ReadMoreLabel({ post }) {
  return (
    <span className="hlEditorialReadMore">
      {post.type === 'video' ? 'Гледай видеото' : 'Прочети още'}
      <ArrowRight size={16} />
    </span>
  );
}
function InteractiveStory({
  className,
  post,
  onOpen,
  variants,
  children,
}) {
  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  }
  return (
    <motion.article
      className={className}
      variants={variants}
      role="link"
      tabIndex={0}
      aria-label={`Отвори публикацията: ${post.title}`}
      onClick={() => onOpen(post)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </motion.article>
  );
}
function FeaturedStory({
  post,
  onOpen,
  onCopy,
  copied,
  home = false,
}) {
  return (
    <InteractiveStory
      className={`hlNewsFeature ${
        home ? 'hlNewsFeature--home' : 'hlNewsFeature--archive'
      }`}
      post={post}
      onOpen={onOpen}
      variants={fadeUp}
    >
      <div className="hlNewsFeature__media">
        <StoryMediaActions
          post={post}
          copied={copied}
          onCopy={onCopy}
        />
      </div>
      <div className="hlNewsFeature__content">
        <StoryMeta post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <ReadMoreLabel post={post} />
      </div>
    </InteractiveStory>
  );
}
function CompactStoryRow({
  post,
  onOpen,
  onCopy,
  copied,
}) {
  return (
    <InteractiveStory
      className="hlHomeStoryRow"
      post={post}
      onOpen={onOpen}
      variants={fadeUp}
    >
      <div className="hlHomeStoryRow__media">
        <StoryMediaActions
          post={post}
          compact
          copied={copied}
          onCopy={onCopy}
        />
      </div>
      <div className="hlHomeStoryRow__content">
        <StoryMeta post={post} />
        <h3>{post.title}</h3>
        <ReadMoreLabel post={post} />
      </div>
    </InteractiveStory>
  );
}
function StoryCard({
  post,
  onOpen,
  onCopy,
  copied,
}) {
  return (
    <InteractiveStory
      className="hlNewsCard"
      post={post}
      onOpen={onOpen}
      variants={fadeUp}
    >
      <div className="hlNewsCard__media">
        <StoryMediaActions
          post={post}
          copied={copied}
          onCopy={onCopy}
        />
      </div>
      <div className="hlNewsCard__content">
        <StoryMeta post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <ReadMoreLabel post={post} />
      </div>
    </InteractiveStory>
  );
}
function HomeNewsLayout({
  posts,
  onOpen,
  onCopy,
  copiedSlug,
}) {
  const featured = posts[0];
  const compactPosts = posts.slice(1, 4);
  return (
    <motion.div
      className="hlCases__shell hlCases__shell--home"
      variants={pageStagger}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.12,
      }}
    >
      <div className="hlHomeNews__heading">
        <div>
          <motion.p className="hlKicker" variants={fadeUp}>
            Последни новини
          </motion.p>
          <motion.h2 className="hlHomeNews__title" variants={fadeUp}>
            Право, позиции и
            <em> човешки истории.</em>
          </motion.h2>
        </div>
        <motion.a
          className="hlHomeNews__all"
          href="/novini"
          variants={fadeUp}
        >
          Всички новини
          <ArrowRight size={17} />
        </motion.a>
      </div>
      <div className="hlHomeNews__layout">
        {featured && (
          <FeaturedStory
            post={featured}
            onOpen={onOpen}
            onCopy={onCopy}
            copied={copiedSlug === featured.slug}
            home
          />
        )}
        <div className="hlHomeNews__rail">
          {compactPosts.map((post) => (
            <CompactStoryRow
              key={post.slug}
              post={post}
              onOpen={onOpen}
              onCopy={onCopy}
              copied={copiedSlug === post.slug}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
function NewsArchiveLayout({
  posts,
  onBack,
  onOpen,
  onCopy,
  copiedSlug,
}) {
  const featured = posts[0];
  const gridPosts = posts.slice(1);
  return (
    <motion.div
      className="hlCases__shell hlCases__shell--archive"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      <motion.header
        className="hlNewsArchive__intro"
        variants={fadeUp}
      >
        <button
          className="hlNewsArchive__back"
          type="button"
          onClick={onBack}
          aria-label="Назад"
          title="Назад"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="hlNewsArchive__introCopy">
          <p>Новини</p>
          <h1>
            Право, позиции
            <span>и човешки истории.</span>
          </h1>
          <small>
            Подбрани материали, видеа и практически позиции по
            актуални правни теми.
          </small>
        </div>
      </motion.header>
      {featured && (
        <FeaturedStory
          post={featured}
          onOpen={onOpen}
          onCopy={onCopy}
          copied={copiedSlug === featured.slug}
        />
      )}
      <div className="hlNewsArchive__grid">
        {gridPosts.map((post) => (
          <StoryCard
            key={post.slug}
            post={post}
            onOpen={onOpen}
            onCopy={onCopy}
            copied={copiedSlug === post.slug}
          />
        ))}
      </div>
    </motion.div>
  );
}
function CaseDetail({
  post,
  comments,
  loading,
  onClose,
  onSubmitComment,
}) {
  const [displayName, setDisplayName] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getPostUrl(post.slug));
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
      return true;
    } catch {
      setError('Не успях да копирам линка автоматично.');
      return false;
    }
  }
  async function submit(event) {
    event.preventDefault();
    const cleanName = displayName.trim();
    const cleanBody = body.trim();
    if (cleanName.length < 2) {
      setError('Изберете псевдоним за коментара.');
      return;
    }
    if (cleanBody.length < 2) {
      setError('Напишете кратък коментар.');
      return;
    }
    const ok = await onSubmitComment({
      displayName: cleanName,
      body: cleanBody,
    });
    if (ok) {
      setBody('');
      setError('');
    } else {
      setError(
        'Коментарът не беше публикуван. Опитайте пак след малко.'
      );
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
        initial={{
          y: 24,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: 16,
          opacity: 0,
        }}
        transition={{
          duration: 0.36,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <header className="hlCaseReader__bar">
          <button
            className="hlCaseReader__back"
            type="button"
            onClick={() => onClose()}
            aria-label="Назад към новините"
            title="Назад"
          >
            <ArrowLeft size={18} />
          </button>
          <span>
            {post.type === 'video' ? 'Видео' : 'Новина'}
          </span>
          <button
            className="hlCaseReader__close"
            type="button"
            onClick={() => onClose()}
            aria-label="Затвори публикацията"
            title="Затвори"
          >
            <X size={18} />
          </button>
        </header>
        <div className="hlCaseReader__media">
          <MediaVisual post={post} reader />
          {post.type === 'video' && (
            <a
              href={post.video?.youtubeUrl || post.video?.src}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={17} fill="currentColor" />
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
          <div className="hlCaseReader__share">
            <ShareMenu
              post={post}
              copied={copied}
              onCopy={copyLink}
              className="hlStoryShare--reader"
            />
          </div>
          <section className="hlCaseComments">
            <div className="hlCaseComments__head">
              <strong>Коментари</strong>
              <small>
                Пишете с псевдоним, не с лични данни. Без обиди,
                линкове и спам. Коментари могат да бъдат премахвани.
              </small>
            </div>
            <form
              className="hlCaseComments__form"
              onSubmit={submit}
            >
              <input
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="Псевдоним"
                maxLength={48}
              />
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Кратък коментар..."
                maxLength={900}
              />
              {error && (
                <p className="hlCaseComments__error">
                  {error}
                </p>
              )}
              <button type="submit">
                <SendHorizontal size={17} />
                Публикувай
              </button>
            </form>
            <div className="hlCaseComments__list">
              {loading ? (
                <p className="hlCaseComments__empty">
                  Зареждане...
                </p>
              ) : comments.length ? (
                comments.map((comment) => (
                  <article key={comment.id}>
                    <strong>{comment.displayName}</strong>
                    <time>
                      {formatDate(comment.createdAt)}
                    </time>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <p className="hlCaseComments__empty">
                  Още няма коментари. Бъдете първият с кратка
                  позиция.
                </p>
              )}
            </div>
          </section>
        </div>
      </motion.article>
    </motion.div>
  );
}
export default function Cases({
  pageMode = false,
  onBack,
  initialSlug = '',
}) {
  const [posts, setPosts] = useState(() => fallbackPosts());
  const [selected, setSelected] = useState(null);
  const [returnScrollY, setReturnScrollY] = useState(0);
  const [returnTargetUrl, setReturnTargetUrl] = useState('');
  const [dismissedInitialSlug, setDismissedInitialSlug] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState('');
  const [sessionId] = useState(getCaseSessionId);
  function closePage() {
    if (onBack) {
      onBack();
      return;
    }
    window.history.pushState(null, '', '/');
    window.requestAnimationFrame(() => {
      document.querySelector('#home')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
  function openPost(post) {
    setReturnScrollY(window.scrollY);
    setReturnTargetUrl(
      pageMode || window.location.pathname.startsWith('/novini')
        ? '/novini'
        : '/#cases'
    );
    setSelected(post);
  }
  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      try {
        const response = await api.get('/api/cases', {
          params: {
            sessionId,
          },
        });
        if (!cancelled && response.data?.posts?.length) {
          setPosts(response.data.posts);
        }
      } catch {
        // Използва локалните публикации, когато backend-ът не е стартиран.
      }
    }
    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);
  useEffect(() => {
    if (!posts.length) return;
    const pathMatch = window.location.pathname.match(
      /^\/novini\/([^/?#]+)/
    );
    const routeSlug =
      initialSlug ||
      (pathMatch ? decodeURIComponent(pathMatch[1]) : '');
    const legacySlug = new URLSearchParams(
      window.location.search
    ).get('case');
    const slug = resolvePostSlug(
      routeSlug || legacySlug || ''
    );
    if (
      !slug ||
      selected ||
      slug === dismissedInitialSlug
    ) {
      return;
    }
    const found = posts.find((post) => post.slug === slug);
    if (found) {
      setReturnTargetUrl('/novini');
      setSelected(found);
    }
  }, [
    dismissedInitialSlug,
    initialSlug,
    posts,
    selected,
  ]);
  useEffect(() => {
    setDismissedInitialSlug('');
  }, [initialSlug]);
  useEffect(() => {
    document.body.classList.toggle(
      'case-reader-open',
      Boolean(selected)
    );
    return () => {
      document.body.classList.remove('case-reader-open');
    };
  }, [selected]);
  useEffect(() => {
    if (!selected) return undefined;
    let cancelled = false;
    async function loadCase() {
      setCommentsLoading(true);
      try {
        const response = await api.get(
          `/api/cases/${selected.slug}`,
          {
            params: {
              sessionId,
            },
          }
        );
        if (!cancelled) {
          setSelected(response.data.post);
          setComments(response.data.comments || []);
        }
      } catch {
        if (!cancelled) {
          setComments([]);
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    }
    const nextPath = `/novini/${encodeURIComponent(
      selected.slug
    )}`;
    if (
      window.location.pathname !== nextPath ||
      window.location.search ||
      window.location.hash
    ) {
      window.history.replaceState(null, '', nextPath);
    }
    loadCase();
    return () => {
      cancelled = true;
    };
  }, [selected?.slug, sessionId]);
  function closeReader({ target = 'return' } = {}) {
    const closedSlug = selected?.slug || '';
    setSelected(null);
    setComments([]);
    if (target === 'return') {
      const targetUrl =
        returnTargetUrl ||
        (pageMode ||
        window.location.pathname.startsWith('/novini')
          ? '/novini'
          : '/#cases');
      if (targetUrl === '/novini' && closedSlug) {
        setDismissedInitialSlug(closedSlug);
      }
      window.history.replaceState(null, '', targetUrl);
      window.requestAnimationFrame(() => {
        if (targetUrl === '/novini') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          return;
        }
        window.scrollTo({
          top: returnScrollY,
          behavior: 'smooth',
        });
      });
      return;
    }
    const nextHash = target.startsWith('#')
      ? target
      : '#home';
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${nextHash}`
    );
    window.requestAnimationFrame(() => {
      if (
        nextHash === '#contact' ||
        nextHash === '#booking'
      ) {
        window.dispatchEvent(
          new CustomEvent('dankov:open-contact')
        );
        return;
      }
      document.querySelector(nextHash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
  useEffect(() => {
    if (!selected) return undefined;
    function handlePageNavigation(event) {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      const isHomeLink =
        href === '/' ||
        href === './' ||
        href === '#home';
      const isSectionLink = href?.startsWith('#');
      if (!isHomeLink && !isSectionLink) return;
      event.preventDefault();
      closeReader({
        target: isHomeLink ? '#home' : href,
      });
    }
    function handleResetHome() {
      closeReader({
        target: '#home',
      });
    }
    window.addEventListener(
      'click',
      handlePageNavigation,
      true
    );
    window.addEventListener(
      'dankov:reset-home',
      handleResetHome
    );
    return () => {
      window.removeEventListener(
        'click',
        handlePageNavigation,
        true
      );
      window.removeEventListener(
        'dankov:reset-home',
        handleResetHome
      );
    };
  }, [selected, returnScrollY]);
  async function copyPostLink(post) {
    try {
      await navigator.clipboard.writeText(
        getPostUrl(post.slug)
      );
      setCopiedSlug(post.slug);
      window.setTimeout(() => {
        setCopiedSlug('');
      }, 1500);
      return true;
    } catch {
      setCopiedSlug('');
      return false;
    }
  }
  async function submitComment(payload) {
    if (!selected) return false;
    try {
      const response = await api.post(
        `/api/cases/${selected.slug}/comments`,
        {
          ...payload,
          sessionId,
        }
      );
      setComments((current) => [
        response.data.comment,
        ...current,
      ]);
      setPosts((current) =>
        current.map((post) =>
          post.slug === selected.slug
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: response.data.comments,
                },
              }
            : post
        )
      );
      setSelected((post) => ({
        ...post,
        stats: {
          ...post.stats,
          comments: response.data.comments,
        },
      }));
      return true;
    } catch {
      return false;
    }
  }
  return (
    <section
      className={`hlSection hlCases ${
        pageMode ? 'hlCases--page' : 'hlCases--home'
      }`}
      id="cases"
    >
      {pageMode ? (
        <NewsArchiveLayout
          posts={posts}
          onBack={closePage}
          onOpen={openPost}
          onCopy={copyPostLink}
          copiedSlug={copiedSlug}
        />
      ) : (
        <HomeNewsLayout
          posts={posts}
          onOpen={openPost}
          onCopy={copyPostLink}
          copiedSlug={copiedSlug}
        />
      )}
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