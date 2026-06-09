import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import api from '../../lib/api.js';

import {
  defaultSiteSettings,
  mergeSiteSettings,
} from '../../hooks/useSiteSettings.js';

import {
  createPostForm,
  playAdminPing,
  postToForm,
} from './AdminUtils.js';

export default function useAdminController(route) {
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [configured, setConfigured] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  const [soundEnabled, setSoundEnabled] =
    useState(() => {
      if (typeof window === 'undefined') {
        return true;
      }

      return (
        localStorage.getItem(
          'dankov_admin_sound_enabled'
        ) !== 'false'
      );
    });

  const attentionKeysRef = useRef(new Set());
  const attentionReadyRef = useRef(false);
  const notificationTimerRef = useRef(null);

  const [loginForm, setLoginForm] = useState({
    username: 'admin',
    password: '',
  });

  const [overview, setOverview] = useState(null);

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] =
    useState('');
  const [selectedChat, setSelectedChat] =
    useState(null);
  const [chatMessages, setChatMessages] =
    useState([]);
  const [reply, setReply] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingNotes, setBookingNotes] =
    useState({});

  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] =
    useState(createPostForm);

  const [comments, setComments] = useState([]);

  const [settings, setSettings] = useState(
    defaultSiteSettings
  );

  const selectedChatSummary = useMemo(() => {
    return (
      selectedChat ||
      chats.find(
        (chat) =>
          chat.sessionId === selectedChatId
      ) ||
      null
    );
  }, [
    chats,
    selectedChat,
    selectedChatId,
  ]);

  const pendingComments = useMemo(() => {
    return comments.filter(
      (comment) =>
        comment.status === 'pending'
    ).length;
  }, [comments]);

  const draftPosts = useMemo(() => {
    return posts.filter(
      (post) =>
        post.status === 'draft'
    ).length;
  }, [posts]);

  const notify = useCallback((text) => {
    setMessage(text);
    setError('');

    if (
      notificationTimerRef.current &&
      typeof window !== 'undefined'
    ) {
      window.clearTimeout(
        notificationTimerRef.current
      );
    }

    if (typeof window !== 'undefined') {
      notificationTimerRef.current =
        window.setTimeout(() => {
          setMessage('');
        }, 2600);
    }
  }, []);

  const fail = useCallback(
    (
      err,
      fallback = 'Възникна технически проблем.'
    ) => {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          fallback
      );

      setMessage('');
    },
    []
  );

  const processChats = useCallback(
    (nextChats, alertNew = false) => {
      const attentionKeys = new Set(
        nextChats
          .filter(
            (chat) => chat.needsAttention
          )
          .map(
            (chat) =>
              `${chat.sessionId}:${
                chat.lastMessage?.id ||
                chat.lastMessageAt ||
                ''
              }`
          )
      );

      const hasFreshAttention = [
        ...attentionKeys,
      ].some(
        (key) =>
          !attentionKeysRef.current.has(key)
      );

      if (
        alertNew &&
        attentionReadyRef.current &&
        hasFreshAttention &&
        soundEnabled
      ) {
        playAdminPing();
      }

      attentionKeysRef.current =
        attentionKeys;

      attentionReadyRef.current = true;

      setChats(nextChats);
    },
    [soundEnabled]
  );

  const loadAdminData = useCallback(
    async ({
      alertNew = false,
    } = {}) => {
      const [
        overviewResponse,
        chatsResponse,
        bookingsResponse,
        postsResponse,
        commentsResponse,
        settingsResponse,
      ] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/chats'),
        api.get('/api/admin/bookings'),
        api.get('/api/admin/posts'),
        api.get('/api/admin/comments'),
        api.get('/api/admin/settings'),
      ]);

      setOverview(
        overviewResponse.data?.overview ||
          null
      );

      processChats(
        chatsResponse.data?.sessions || [],
        alertNew
      );

      setBookings(
        bookingsResponse.data?.bookings ||
          []
      );

      setPosts(
        postsResponse.data?.posts || []
      );

      setComments(
        commentsResponse.data?.comments ||
          []
      );

      setSettings(
        mergeSiteSettings(
          settingsResponse.data?.settings ||
            {}
        )
      );
    },
    [processChats]
  );

  const refreshSectionData = useCallback(
    async ({
      alertNew = false,
    } = {}) => {
      const section =
        route?.section || 'overview';

      const requests = [
        api.get('/api/admin/overview'),
      ];

      const keys = ['overview'];

      if (
        section === 'overview' ||
        section === 'chats'
      ) {
        requests.push(
          api.get('/api/admin/chats')
        );

        keys.push('chats');
      }

      if (
        section === 'overview' ||
        section === 'bookings'
      ) {
        requests.push(
          api.get('/api/admin/bookings')
        );

        keys.push('bookings');
      }

      if (
        section === 'overview' ||
        (
          section === 'posts' &&
          !route?.itemId
        )
      ) {
        requests.push(
          api.get('/api/admin/posts')
        );

        keys.push('posts');
      }

      if (section === 'comments') {
        requests.push(
          api.get('/api/admin/comments')
        );

        keys.push('comments');
      }

      const responses =
        await Promise.all(requests);

      responses.forEach(
        (response, index) => {
          const key = keys[index];

          if (key === 'overview') {
            setOverview(
              response.data?.overview ||
                null
            );
          }

          if (key === 'chats') {
            processChats(
              response.data?.sessions ||
                [],
              alertNew
            );
          }

          if (key === 'bookings') {
            setBookings(
              response.data?.bookings ||
                []
            );
          }

          if (key === 'posts') {
            setPosts(
              response.data?.posts || []
            );
          }

          if (key === 'comments') {
            setComments(
              response.data?.comments ||
                []
            );
          }
        }
      );
    },
    [
      processChats,
      route?.itemId,
      route?.section,
    ]
  );

  const refreshSelectedChat =
    useCallback(
      async (
        sessionId = selectedChatId
      ) => {
        if (!sessionId) {
          return;
        }

        const response = await api.get(
          `/api/admin/chats/${sessionId}`
        );

        setSelectedChatId(sessionId);

        setSelectedChat(
          response.data?.session || null
        );

        setChatMessages(
          response.data?.messages || []
        );
      },
      [selectedChatId]
    );

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const response = await api.get(
          '/api/admin/me'
        );

        if (!active) {
          return;
        }

        setConfigured(
          Boolean(
            response.data?.configured
          )
        );

        if (response.data?.admin) {
          setAdmin(response.data.admin);
          await loadAdminData();
        }
      } catch {
        // Няма активна admin сесия.
        // Показваме login екрана.
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    boot();

    return () => {
      active = false;

      if (
        notificationTimerRef.current &&
        typeof window !== 'undefined'
      ) {
        window.clearTimeout(
          notificationTimerRef.current
        );
      }
    };
  }, [loadAdminData]);

  useEffect(() => {
    if (
      !admin ||
      !autoRefresh ||
      route?.section === 'settings'
    ) {
      return undefined;
    }

    const interval =
      window.setInterval(() => {
        refreshSectionData({
          alertNew: true,
        }).catch(() => {});

        if (
          route?.section === 'chats' &&
          route?.itemId
        ) {
          refreshSelectedChat(
            route.itemId
          ).catch(() => {});
        }
      },
      route?.section === 'chats'
        ? 3500
        : 6500
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    admin,
    autoRefresh,
    refreshSectionData,
    refreshSelectedChat,
    route?.itemId,
    route?.section,
  ]);

  async function login(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      const response = await api.post(
        '/api/admin/login',
        loginForm
      );

      setAdmin(
        response.data?.admin || {
          username: loginForm.username,
        }
      );

      await loadAdminData();

      notify('Успешен вход.');
    } catch (err) {
      fail(
        err,
        'Входът не беше успешен.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await api.post(
        '/api/admin/logout'
      );
    } catch (err) {
      fail(
        err,
        'Изходът не беше завършен коректно.'
      );
    } finally {
      setAdmin(null);
      setSelectedChatId('');
      setSelectedChat(null);
      setChatMessages([]);
    }
  }

  async function refreshAll() {
    setSaving(true);

    try {
      await loadAdminData();

      if (
        route?.section === 'chats' &&
        route?.itemId
      ) {
        await refreshSelectedChat(
          route.itemId
        );
      }

      notify('Данните са обновени.');
    } catch (err) {
      fail(
        err,
        'Данните не можаха да се обновят.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function openChat(sessionId) {
    setSelectedChatId(sessionId);
    setSelectedChat(null);
    setChatMessages([]);

    try {
      await refreshSelectedChat(
        sessionId
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Разговорът не можа да се отвори.'
      );

      return false;
    }
  }

  async function sendReply() {
    const content = reply.trim();

    if (
      !content ||
      !selectedChatId
    ) {
      return false;
    }

    setSaving(true);

    try {
      const response = await api.post(
        `/api/admin/chats/${selectedChatId}/reply`,
        {
          content,
        }
      );

      setChatMessages((current) => [
        ...current,
        response.data.message,
      ]);

      setReply('');

      await refreshSectionData();

      notify(
        'Отговорът е изпратен в чата.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Отговорът не беше изпратен.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateChatTriage(
    payload
  ) {
    if (!selectedChatId) {
      return false;
    }

    setSaving(true);

    try {
      const response = await api.patch(
        `/api/admin/chats/${selectedChatId}/triage`,
        payload
      );

      const nextSession =
        response.data?.session;

      if (nextSession) {
        setSelectedChat(nextSession);

        setChats((current) =>
          current.map((chat) =>
            chat.sessionId ===
            selectedChatId
              ? {
                  ...chat,
                  ...nextSession,
                }
              : chat
          )
        );
      }

      await refreshSectionData();

      notify(
        'Разговорът е обновен.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Разговорът не беше обновен.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateBookingStatus(
    bookingId,
    status
  ) {
    setSaving(true);

    try {
      const response = await api.patch(
        `/api/admin/bookings/${bookingId}/status`,
        {
          status,
        }
      );

      const nextBooking =
        response.data?.booking;

      if (nextBooking) {
        setBookings((current) =>
          current.map((booking) =>
            booking.id === bookingId
              ? nextBooking
              : booking
          )
        );
      }

      notify(
        'Статусът на заявката е обновен.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Заявката не беше обновена.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addBookingNote(
    bookingId
  ) {
    const body = (
      bookingNotes[bookingId] || ''
    ).trim();

    if (!body) {
      return false;
    }

    setSaving(true);

    try {
      const response = await api.post(
        `/api/admin/bookings/${bookingId}/notes`,
        {
          body,
        }
      );

      const nextBooking =
        response.data?.booking;

      if (nextBooking) {
        setBookings((current) =>
          current.map((booking) =>
            booking.id === bookingId
              ? nextBooking
              : booking
          )
        );
      }

      setBookingNotes((current) => ({
        ...current,
        [bookingId]: '',
      }));

      notify(
        'Бележката е добавена.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Бележката не беше записана.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  function resetPostForm() {
    setPostForm(createPostForm());
  }

  function selectPost(post) {
    setPostForm(postToForm(post));
  }

  function updatePostField(
    field,
    value
  ) {
    setPostForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePostNested(
    group,
    field,
    value
  ) {
    setPostForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  async function savePost() {
    setSaving(true);

    try {
      if (postForm.id) {
        await api.patch(
          `/api/admin/posts/${postForm.id}`,
          postForm
        );

        notify(
          'Публикацията е обновена.'
        );
      } else {
        await api.post(
          '/api/admin/posts',
          postForm
        );

        notify(
          'Публикацията е създадена.'
        );
      }

      resetPostForm();

      const response = await api.get(
        '/api/admin/posts'
      );

      setPosts(
        response.data?.posts || []
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Публикацията не беше записана.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function archivePost(postId) {
    setSaving(true);

    try {
      await api.delete(
        `/api/admin/posts/${postId}`
      );

      resetPostForm();

      const response = await api.get(
        '/api/admin/posts'
      );

      setPosts(
        response.data?.posts || []
      );

      notify(
        'Публикацията е архивирана.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Публикацията не беше архивирана.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateCommentStatus(
    commentId,
    status
  ) {
    setSaving(true);

    try {
      await api.patch(
        `/api/admin/comments/${commentId}/status`,
        {
          status,
        }
      );

      const response = await api.get(
        '/api/admin/comments'
      );

      setComments(
        response.data?.comments || []
      );

      notify(
        'Коментарът е обновен.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Коментарът не беше обновен.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  function updateSettingField(
    field,
    value
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSettingGroup(
    group,
    field,
    value
  ) {
    setSettings((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  function updateQuickReply(
    index,
    value
  ) {
    setSettings((current) => {
      const quickReplies = [
        ...(current.chat?.quickReplies ||
          []),
      ];

      quickReplies[index] = value;

      return {
        ...current,
        chat: {
          ...current.chat,
          quickReplies,
        },
      };
    });
  }

  function addQuickReply() {
    setSettings((current) => ({
      ...current,
      chat: {
        ...current.chat,
        quickReplies: [
          ...(
            current.chat?.quickReplies ||
            []
          ),
          'Нов бърз въпрос',
        ].slice(0, 8),
      },
    }));
  }

  function removeQuickReply(index) {
    setSettings((current) => ({
      ...current,
      chat: {
        ...current.chat,
        quickReplies: (
          current.chat?.quickReplies ||
          []
        ).filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      },
    }));
  }

  async function saveSettings() {
    setSaving(true);

    try {
      const response = await api.patch(
        '/api/admin/settings',
        settings
      );

      setSettings(
        mergeSiteSettings(
          response.data?.settings || {}
        )
      );

      notify(
        'Настройките са записани.'
      );

      return true;
    } catch (err) {
      fail(
        err,
        'Настройките не бяха записани.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  function toggleSound() {
    setSoundEnabled((value) => {
      const next = !value;

      localStorage.setItem(
        'dankov_admin_sound_enabled',
        String(next)
      );

      if (next) {
        playAdminPing();
      }

      return next;
    });
  }

  function getSectionBadge(sectionId) {
    if (sectionId === 'chats') {
      return (
        overview?.attentionChats || 0
      );
    }

    if (sectionId === 'bookings') {
      return (
        overview?.newBookings || 0
      );
    }

    if (sectionId === 'comments') {
      return pendingComments;
    }

    if (sectionId === 'posts') {
      return draftPosts;
    }

    return 0;
  }

  return {
    booting,
    saving,
    admin,
    configured,
    message,
    error,
    autoRefresh,
    soundEnabled,

    loginForm,
    overview,

    chats,
    selectedChatId,
    selectedChatSummary,
    chatMessages,
    reply,

    bookings,
    bookingNotes,

    posts,
    postForm,

    comments,
    settings,

    setAutoRefresh,
    setLoginForm,
    setSelectedChat,
    setReply,
    setBookingNotes,

    login,
    logout,
    refreshAll,

    openChat,
    refreshSelectedChat,
    sendReply,
    updateChatTriage,

    updateBookingStatus,
    addBookingNote,

    resetPostForm,
    selectPost,
    updatePostField,
    updatePostNested,
    savePost,
    archivePost,

    updateCommentStatus,

    updateSettingField,
    updateSettingGroup,
    updateQuickReply,
    addQuickReply,
    removeQuickReply,
    saveSettings,

    toggleSound,
    getSectionBadge,
  };
}