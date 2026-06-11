import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import './view/PostView.css';
import {
  BackLink,
  EmptyState,
  FilterTabs,
  SearchBox,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextField,
  ToggleField,
} from './AdminUi.jsx';
import {
  formatDate,
  includesSearch,
  normalizeSearch,
  toDateInput,
} from './AdminUtils.js';

const POST_FILTERS = [
  { value: 'all', label: 'Всички' },
  { value: 'published', label: 'Видими в сайта' },
  { value: 'draft', label: 'Чернови' },
  { value: 'featured', label: 'Първа на сайта' },
  { value: 'archived', label: 'Архивирани' },
];

function getPostTypeLabel(type) {
  return type === 'video' ? 'Видео публикация' : 'Текстова публикация';
}

function getPostDateValue(post) {
  return new Date(post?.publishedAt || post?.createdAt || 0).getTime();
}

function sortByDisplayDate(a, b) {
  return getPostDateValue(b) - getPostDateValue(a);
}

function getHomepageLeadInfo(posts) {
  const publishedPosts = posts
    .filter((post) => post.status === 'published')
    .sort(sortByDisplayDate);

  const featuredPublishedPosts = publishedPosts
    .filter((post) => post.featured)
    .sort(sortByDisplayDate);

  if (featuredPublishedPosts.length > 0) {
    return {
      post: featuredPublishedPosts[0],
      mode: 'manual',
      featuredCount: featuredPublishedPosts.length,
    };
  }

  return {
    post: publishedPosts[0] || null,
    mode: publishedPosts[0] ? 'fallback' : 'empty',
    featuredCount: featuredPublishedPosts.length,
  };
}

function HomepageLeadCard({ leadInfo, onEdit, onCreate }) {
  const { post, mode, featuredCount } = leadInfo;
  const isManual = mode === 'manual';
  const isFallback = mode === 'fallback';

  return (
    <section className={`dAdminHomepageSlot${!post ? ' dAdminHomepageSlot--empty' : ''}`}>
      <div className="dAdminHomepageSlot__content">
        <span className="dAdminHomepageSlot__eyebrow">Начална страница</span>
        <h3>Първа голяма публикация</h3>
        <p>
          Това е публикацията, която ще стои в голямата първа карта на сайта.
          Публичният layout остава същият — оттук само избирате кое съдържание влиза там.
        </p>

        {post ? (
          <div className="dAdminHomepageSlot__selected">
            <span className={`dAdminHomepageSlot__badge${isFallback ? ' dAdminHomepageSlot__badge--auto' : ''}`}>
              <Sparkles size={13} />
              {isManual ? 'Избрана ръчно' : 'Автоматично най-нова'}
            </span>
            <strong>{post.title || 'Публикация без заглавие'}</strong>
            <small>
              {post.category || 'Без тема'} · {formatDate(post.publishedAt || post.createdAt, false)}
            </small>
          </div>
        ) : (
          <div className="dAdminHomepageSlot__selected dAdminHomepageSlot__selected--empty">
            <strong>Няма публикувана публикация за началната страница.</strong>
            <small>Създайте публикация или публикувайте чернова, за да се появи в сайта.</small>
          </div>
        )}

        {featuredCount > 1 && (
          <p className="dAdminHomepageSlot__warning">
            Има повече от една публикация отбелязана като първа. За най-ясен резултат оставете само една.
          </p>
        )}
      </div>

      <div className="dAdminHomepageSlot__actions">
        {post ? (
          <button className="dAdminSecondaryAction" type="button" onClick={() => onEdit(post)}>
            <Eye size={17} />
            Отвори публикацията
          </button>
        ) : (
          <button className="dAdminPrimaryAction" type="button" onClick={onCreate}>
            <Plus size={17} />
            Създай публикация
          </button>
        )}
      </div>
    </section>
  );
}

function PostsList({ navigate, controller }) {
  const { posts, resetPostForm, selectPost } = controller;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const homepageLeadInfo = useMemo(() => getHomepageLeadInfo(posts), [posts]);
  const homepageLeadId = homepageLeadInfo.post?.id;

  const filterItems = useMemo(
    () => POST_FILTERS.map((item) => ({
      ...item,
      count: item.value === 'all'
        ? posts.length
        : item.value === 'featured'
          ? posts.filter((post) => post.featured).length
          : posts.filter((post) => post.status === item.value).length,
    })),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return posts
      .filter((post) => {
        if (filter === 'featured') return Boolean(post.featured);
        if (filter !== 'all') return post.status === filter;
        return true;
      })
      .filter((post) => includesSearch(normalizedQuery, [
        post.title,
        post.slug,
        post.excerpt,
        post.category,
        post.location,
        post.type,
        post.status,
      ]))
      .sort(sortByDisplayDate);
  }, [filter, posts, query]);

  function createPost() {
    resetPostForm();
    navigate({ section: 'posts', itemId: 'new', settingsPanel: '' });
  }

  function editPost(post) {
    selectPost(post);
    navigate({ section: 'posts', itemId: post.id, settingsPanel: '' });
  }

  return (
    <div className="dAdminView">
      <section className="dAdminPageIntro dAdminPageIntro--posts">
        <div>
          <BackLink
            onClick={() => navigate({ section: 'overview', itemId: '', settingsPanel: '' })}
          >
            Към таблото
          </BackLink>
          <span className="dAdminEyebrow">Управление на сайта</span>
          <h2>Публикации</h2>
          <p>
            Управлявайте съдържанието така, както ще го виждат клиентите в сайта:
            ясно заглавие, точен label и много видима първа публикация на началната страница.
          </p>
        </div>

        <button className="dAdminPrimaryAction" type="button" onClick={createPost}>
          <Plus size={18} />
          Нова публикация
        </button>
      </section>

      <HomepageLeadCard
        leadInfo={homepageLeadInfo}
        onEdit={editPost}
        onCreate={createPost}
      />

      <section className="dAdminPanel dAdminPanel--wide">
        <div className="dAdminToolbar">
          <SearchBox
            wide
            value={query}
            onChange={setQuery}
            placeholder="Търсене по заглавие, област или текст…"
          />
          <FilterTabs value={filter} onChange={setFilter} items={filterItems} />
        </div>

        <div className="dAdminPostList">
          {filteredPosts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={query ? 'Няма намерени публикации' : 'Все още няма публикации'}
              text={
                query
                  ? 'Променете търсенето или изберете друг филтър.'
                  : 'Създайте първата новина, казус или правен анализ за сайта.'
              }
              action={
                !query ? (
                  <button className="dAdminPrimaryAction" type="button" onClick={createPost}>
                    <Plus size={17} />
                    Създай публикация
                  </button>
                ) : null
              }
            />
          ) : (
            filteredPosts.map((post) => {
              const isHomepagePost = post.id === homepageLeadId;
              const isAutoHomepagePost = isHomepagePost && !post.featured;

              return (
                <button
                  className={`dAdminPostRow${post.featured ? ' dAdminPostRow--homepage' : ''}${isAutoHomepagePost ? ' dAdminPostRow--autoHomepage' : ''}`}
                  key={post.id}
                  type="button"
                  onClick={() => editPost(post)}
                >
                  <span className="dAdminPostRow__media">
                    {post.heroImage?.url ? (
                      <img src={post.heroImage.url} alt="" />
                    ) : post.type === 'video' ? (
                      <Video size={22} />
                    ) : (
                      <FileText size={22} />
                    )}
                  </span>

                  <span className="dAdminPostRow__content">
                    <span className="dAdminPostRow__topline">
                      <strong>{post.title || 'Публикация без заглавие'}</strong>
                      <small>{formatDate(post.publishedAt || post.createdAt, false)}</small>
                    </span>

                    <span className="dAdminPostRow__meta">
                      <StatusBadge status={post.status || 'draft'} />
                      <span>{getPostTypeLabel(post.type)}</span>
                      {post.category && <span>{post.category}</span>}
                      {post.featured && (
                        <span className="dAdminFeaturedTag dAdminFeaturedTag--home">
                          <Sparkles size={13} />
                          Първа на сайта
                        </span>
                      )}
                      {isAutoHomepagePost && (
                        <span className="dAdminFeaturedTag dAdminFeaturedTag--auto">
                          Автоматично първа
                        </span>
                      )}
                    </span>

                    <span className="dAdminPostRow__excerpt">
                      {post.excerpt || 'Няма добавено кратко описание за картата в сайта.'}
                    </span>
                  </span>

                  <ArrowRight className="dAdminPostRow__arrow" size={19} />
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function PostPreview({ postForm }) {
  const hasMedia = postForm.heroImage?.url || postForm.video?.youtubeUrl || postForm.video?.src;

  return (
    <aside className="dAdminPostPreview">
      <div className="dAdminPostPreview__sticky">
        <div className="dAdminPanel">
          <header className="dAdminPanel__head">
            <div>
              <span className="dAdminPanel__icon"><Eye size={18} /></span>
              <div>
                <small>Преглед в сайта</small>
                <h3>Карта на публикацията</h3>
              </div>
            </div>
          </header>

          <div className={`dAdminPostPreviewCard${postForm.featured ? ' dAdminPostPreviewCard--homepage' : ''}`}>
            <div className="dAdminPostPreviewCard__media">
              {postForm.heroImage?.url ? (
                <img
                  src={postForm.heroImage.url}
                  alt={postForm.heroImage.alt || ''}
                />
              ) : (
                <span>
                  {postForm.type === 'video' ? <Video size={26} /> : <ImageIcon size={26} />}
                  {hasMedia ? 'Видео съдържание' : 'Няма добавена снимка'}
                </span>
              )}
            </div>

            <div className="dAdminPostPreviewCard__body">
              {postForm.featured && (
                <span className="dAdminPostPreviewCard__homeTag">
                  Първа голяма публикация
                </span>
              )}
              <span className="dAdminPostPreviewCard__meta">
                {postForm.category || 'Област / тема'}
                {' · '}
                {postForm.publishedAt
                  ? formatDate(postForm.publishedAt, false)
                  : 'Без дата'}
              </span>
              <h4>{postForm.title || 'Заглавието ще се появи тук'}</h4>
              <p>
                {postForm.excerpt || 'Краткото описание за картата ще се появи тук.'}
              </p>
            </div>
          </div>
        </div>

        <div className="dAdminEditorHint">
          <Check size={16} />
          <span>
            Прегледът помага да прецените съдържанието и label-ите. Публичният layout на сайта не се променя оттук.
          </span>
        </div>
      </div>
    </aside>
  );
}

function PostEditor({ route, navigate, goBack, controller }) {
  const {
    posts,
    postForm,
    saving,
    resetPostForm,
    selectPost,
    updatePostField,
    updatePostNested,
    savePost,
    archivePost,
  } = controller;

  const isNew = route.itemId === 'new' || !postForm.id;

  useEffect(() => {
    if (route.itemId === 'new') {
      if (postForm.id) resetPostForm();
      return;
    }

    if (!route.itemId || postForm.id === route.itemId) return;
    const matchedPost = posts.find((post) => post.id === route.itemId);
    if (matchedPost) selectPost(matchedPost);
  }, [postForm.id, posts, resetPostForm, route.itemId, selectPost]);

  async function handleSave(event) {
    event.preventDefault();
    const saved = await savePost();
    if (saved) {
      navigate({ section: 'posts', itemId: '', settingsPanel: '' }, { replace: true });
    }
  }

  async function handleArchive() {
    if (!postForm.id) return;

    const confirmed = typeof window === 'undefined'
      ? true
      : window.confirm('Сигурни ли сте, че искате да архивирате тази публикация?');

    if (!confirmed) return;
    const archived = await archivePost(postForm.id);
    if (archived) {
      navigate({ section: 'posts', itemId: '', settingsPanel: '' }, { replace: true });
    }
  }

  return (
    <div className="dAdminView dAdminPostEditorView">
      <section className="dAdminDetailHeader dAdminDetailHeader--editor">
        <div>
          <BackLink onClick={goBack}>Всички публикации</BackLink>
          <span className="dAdminEyebrow">
            {isNew ? 'Нова публикация' : 'Редакция на публикация'}
          </span>
          <h2>{isNew ? 'Подгответе публикация за сайта' : postForm.title || 'Редакция на публикация'}</h2>
          <p>
            {isNew
              ? 'Попълнете текста, изберете видимост и решете дали тази публикация трябва да бъде първата голяма карта на началната страница.'
              : 'Редактирайте съдържанието, label-а и позицията на публикацията в сайта.'}
          </p>
        </div>

        <div className="dAdminDetailHeader__status">
          <StatusBadge status={postForm.status || 'draft'} />
          {postForm.featured && (
            <span className="dAdminFeaturedTag dAdminFeaturedTag--home">
              <Sparkles size={13} />
              Първа на сайта
            </span>
          )}
        </div>
      </section>

      <form className="dAdminEditorLayout" onSubmit={handleSave}>
        <main className="dAdminEditorMain">
          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><FileText size={18} /></span>
                <div>
                  <small>Текст за сайта</small>
                  <h3>Заглавие, тема и описание</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <TextField
                label="Заглавие на публикацията"
                value={postForm.title}
                onChange={(value) => updatePostField('title', value)}
                placeholder="Напишете ясно заглавие за сайта"
                className="dAdminField--full"
              />

              <div className="dAdminFieldGrid">
                <TextField
                  label="Област / тема"
                  value={postForm.category}
                  onChange={(value) => updatePostField('category', value)}
                  placeholder="Напр. Наказателно право"
                />
                <TextField
                  label="Град или обхват"
                  value={postForm.location}
                  onChange={(value) => updatePostField('location', value)}
                  placeholder="България"
                />
              </div>

              <TextAreaField
                label="Кратко описание за картата"
                value={postForm.excerpt}
                onChange={(value) => updatePostField('excerpt', value)}
                rows={4}
                placeholder="Този текст излиза в картата на публикацията в сайта"
                className="dAdminField--full"
              />

              <TextAreaField
                label="Пълен текст на публикацията"
                value={postForm.body}
                onChange={(value) => updatePostField('body', value)}
                rows={14}
                placeholder="Напишете съдържанието на публикацията…"
                className="dAdminField--full dAdminField--editor"
              />
            </div>
          </section>

          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><ImageIcon size={18} /></span>
                <div>
                  <small>Визуално съдържание</small>
                  <h3>Снимка или видео към публикацията</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <div className="dAdminFieldGrid">
                <SelectField
                  label="Формат"
                  value={postForm.type}
                  onChange={(value) => updatePostField('type', value)}
                >
                  <option value="article">Текстова публикация</option>
                  <option value="video">Видео публикация</option>
                </SelectField>

                <TextField
                  label="Основна снимка URL"
                  value={postForm.heroImage?.url}
                  onChange={(value) => updatePostNested('heroImage', 'url', value)}
                  placeholder="https://…jpg"
                />
              </div>

              <TextField
                label="Описание на снимката"
                value={postForm.heroImage?.alt}
                onChange={(value) => updatePostNested('heroImage', 'alt', value)}
                placeholder="Кратко описание за достъпност и SEO"
                className="dAdminField--full"
              />

              {postForm.type === 'video' && (
                <div className="dAdminFieldGrid">
                  <TextField
                    label="Видео файл URL"
                    value={postForm.video?.src}
                    onChange={(value) => updatePostNested('video', 'src', value)}
                    placeholder="https://…mp4"
                  />
                  <TextField
                    label="YouTube URL"
                    value={postForm.video?.youtubeUrl}
                    onChange={(value) => updatePostNested('video', 'youtubeUrl', value)}
                    placeholder="https://youtube.com/…"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><CalendarDays size={18} /></span>
                <div>
                  <small>Публикуване</small>
                  <h3>Видимост и позиция в сайта</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <div className="dAdminFieldGrid dAdminFieldGrid--three">
                <SelectField
                  label="Видимост в сайта"
                  value={postForm.status}
                  onChange={(value) => updatePostField('status', value)}
                >
                  <option value="published">Публикувана — вижда се в сайта</option>
                  <option value="draft">Чернова — не се вижда</option>
                  <option value="archived">Архивирана — скрита от сайта</option>
                </SelectField>

                <TextField
                  label="Дата на публикуване"
                  type="date"
                  value={postForm.publishedAt}
                  onChange={(value) => updatePostField('publishedAt', value)}
                />

                <TextField
                  label="Адрес на страницата"
                  value={postForm.slug}
                  onChange={(value) => updatePostField('slug', value)}
                  placeholder="автоматично-от-заглавието"
                />
              </div>

              <div className="dAdminHomepagePlacement">
                <div className="dAdminHomepagePlacement__head">
                  <span>Начална страница</span>
                  <h4>Първа голяма публикация</h4>
                  <p>
                    Това контролира коя публикация влиза в голямата първа карта на началната страница.
                    Layout-ът на сайта не се променя — сменя се само съдържанието в тази позиция.
                  </p>
                </div>

                <ToggleField
                  label="Покажи тази публикация като първа на началната"
                  description="Използвайте това за най-важната новина, казус или правен анализ. Ако няма избрана такава, сайтът ще използва най-новата публикувана публикация."
                  checked={postForm.featured}
                  onChange={(value) => updatePostField('featured', value)}
                />
              </div>

              <TextField
                label="Вътрешна редакторска бележка"
                value={postForm.editorialNote}
                onChange={(value) => updatePostField('editorialNote', value)}
                placeholder="Само за админа — не се вижда в сайта"
                className="dAdminField--full"
              />
            </div>
          </section>
        </main>

        <PostPreview postForm={postForm} />

        <footer className="dAdminEditorBar">
          <button
            className="dAdminSecondaryAction"
            type="button"
            onClick={() => updatePostField('publishedAt', toDateInput(new Date()))}
          >
            <CalendarDays size={17} />
            Днешна дата
          </button>

          <span className="dAdminEditorBar__spacer" />

          {!isNew && (
            <button
              className="dAdminDangerAction"
              type="button"
              disabled={saving}
              onClick={handleArchive}
            >
              <Trash2 size={17} />
              Архивирай
            </button>
          )}

          <button className="dAdminPrimaryAction" type="submit" disabled={saving || !postForm.title.trim()}>
            <Save size={18} />
            {saving ? 'Записване…' : 'Запази публикацията'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function PostsView(props) {
  if (props.route.itemId) {
    return <PostEditor {...props} />;
  }

  return <PostsList {...props} />;
}
