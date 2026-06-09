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
  { value: 'published', label: 'Публикувани' },
  { value: 'draft', label: 'Чернови' },
  { value: 'featured', label: 'Водещи' },
  { value: 'archived', label: 'Архивирани' },
];

function getPostTypeLabel(type) {
  return type === 'video' ? 'Видео' : 'Статия';
}

function PostsList({ navigate, controller }) {
  const { posts, resetPostForm, selectPost } = controller;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

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
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
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
          <span className="dAdminEyebrow">Съдържание на сайта</span>
          <h2>Новини и публикации</h2>
          <p>
            Създавайте, намирайте и редактирайте публикации в отделен, спокоен
            редактор. Списъкът остава чист и лесен за преглед.
          </p>
        </div>

        <button className="dAdminPrimaryAction" type="button" onClick={createPost}>
          <Plus size={18} />
          Нова публикация
        </button>
      </section>

      <section className="dAdminPanel dAdminPanel--wide">
        <div className="dAdminToolbar">
          <SearchBox
            wide
            value={query}
            onChange={setQuery}
            placeholder="Търсене по заглавие, категория или текст…"
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
                  : 'Създайте първата новина или статия за сайта.'
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
            filteredPosts.map((post) => (
              <button
                className="dAdminPostRow"
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
                      <span className="dAdminFeaturedTag">
                        <Sparkles size={13} />
                        Водеща
                      </span>
                    )}
                  </span>

                  <span className="dAdminPostRow__excerpt">
                    {post.excerpt || 'Няма добавено кратко описание.'}
                  </span>
                </span>

                <ArrowRight className="dAdminPostRow__arrow" size={19} />
              </button>
            ))
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
                <small>Преглед</small>
                <h3>Как ще изглежда</h3>
              </div>
            </div>
          </header>

          <div className="dAdminPostPreviewCard">
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
              <span className="dAdminPostPreviewCard__meta">
                {postForm.category || 'Категория'}
                {' · '}
                {postForm.publishedAt
                  ? formatDate(postForm.publishedAt, false)
                  : 'Без дата'}
              </span>
              <h4>{postForm.title || 'Заглавието ще се появи тук'}</h4>
              <p>
                {postForm.excerpt || 'Краткото описание ще се появи тук.'}
              </p>
            </div>
          </div>
        </div>

        <div className="dAdminEditorHint">
          <Check size={16} />
          <span>
            Промените се изпращат към същите API маршрути като в стария панел.
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
            {isNew ? 'Ново съдържание' : 'Редакция'}
          </span>
          <h2>{isNew ? 'Нова публикация' : postForm.title || 'Редакция на публикация'}</h2>
          <p>
            {isNew
              ? 'Попълнете основната информация и запазете, когато съдържанието е готово.'
              : 'Редактирайте съдържанието и се върнете към списъка без презареждане.'}
          </p>
        </div>

        <div className="dAdminDetailHeader__status">
          <StatusBadge status={postForm.status || 'draft'} />
          {postForm.featured && (
            <span className="dAdminFeaturedTag">
              <Sparkles size={13} />
              Водеща
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
                  <small>Основно съдържание</small>
                  <h3>Заглавие и текст</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <TextField
                label="Заглавие"
                value={postForm.title}
                onChange={(value) => updatePostField('title', value)}
                placeholder="Напишете ясно заглавие"
                className="dAdminField--full"
              />

              <div className="dAdminFieldGrid">
                <TextField
                  label="Категория"
                  value={postForm.category}
                  onChange={(value) => updatePostField('category', value)}
                  placeholder="Напр. Наказателно право"
                />
                <TextField
                  label="Местоположение"
                  value={postForm.location}
                  onChange={(value) => updatePostField('location', value)}
                  placeholder="България"
                />
              </div>

              <TextAreaField
                label="Кратко описание"
                value={postForm.excerpt}
                onChange={(value) => updatePostField('excerpt', value)}
                rows={4}
                placeholder="Кратък текст за картата на публикацията"
                className="dAdminField--full"
              />

              <TextAreaField
                label="Основен текст"
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
                  <small>Медия</small>
                  <h3>Снимка или видео</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <div className="dAdminFieldGrid">
                <SelectField
                  label="Тип публикация"
                  value={postForm.type}
                  onChange={(value) => updatePostField('type', value)}
                >
                  <option value="article">Статия</option>
                  <option value="video">Видео</option>
                </SelectField>

                <TextField
                  label="Снимка URL"
                  value={postForm.heroImage?.url}
                  onChange={(value) => updatePostNested('heroImage', 'url', value)}
                  placeholder="https://…jpg"
                />
              </div>

              <TextField
                label="Alt текст на снимката"
                value={postForm.heroImage?.alt}
                onChange={(value) => updatePostNested('heroImage', 'alt', value)}
                placeholder="Кратко описание на изображението"
                className="dAdminField--full"
              />

              {postForm.type === 'video' && (
                <div className="dAdminFieldGrid">
                  <TextField
                    label="Видео URL"
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
                  <h3>Статус и дата</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminEditorFields">
              <div className="dAdminFieldGrid dAdminFieldGrid--three">
                <SelectField
                  label="Статус"
                  value={postForm.status}
                  onChange={(value) => updatePostField('status', value)}
                >
                  <option value="published">Публикувана</option>
                  <option value="draft">Чернова</option>
                  <option value="archived">Архивирана</option>
                </SelectField>

                <TextField
                  label="Дата"
                  type="date"
                  value={postForm.publishedAt}
                  onChange={(value) => updatePostField('publishedAt', value)}
                />

                <TextField
                  label="Slug"
                  value={postForm.slug}
                  onChange={(value) => updatePostField('slug', value)}
                  placeholder="автоматично-от-заглавието"
                />
              </div>

              <ToggleField
                label="Водеща публикация"
                description="Показва публикацията с по-висок приоритет в сайта."
                checked={postForm.featured}
                onChange={(value) => updatePostField('featured', value)}
              />

              <TextField
                label="Вътрешна редакторска бележка"
                value={postForm.editorialNote}
                onChange={(value) => updatePostField('editorialNote', value)}
                placeholder="Тази бележка не е част от основния текст"
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
