import { Router } from 'express';
import { z } from 'zod';

import Booking from '../models/Booking.js';
import CaseComment from '../models/CaseComment.js';
import CasePost from '../models/CasePost.js';
import ChatMessage from '../models/ChatMessage.js';
import ChatSession from '../models/ChatSession.js';
import SiteSettings from '../models/SiteSettings.js';
import {
  clearAdminCookie,
  createAdminSession,
  isAdminConfigured,
  readAdminSession,
  requireAdmin,
  setAdminCookie,
  verifyAdminCredentials,
} from '../middleware/adminAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import {
  getSiteSettings,
  publicSettings,
} from './siteSettings.js';

const router = Router();

const loginInput = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

const chatReplyInput = z.object({
  content: z.string().trim().min(1).max(4000),
});

const chatStatusInput = z.object({
  status: z.enum(['open', 'lead', 'waiting_for_lawyer', 'lawyer_joined', 'closed']),
});

const chatTriageInput = z.object({
  status: z.enum(['open', 'lead', 'waiting_for_lawyer', 'lawyer_joined', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  visitor: z.object({
    name: z.string().trim().max(90).optional().or(z.literal('')),
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().max(40).optional().or(z.literal('')),
  }).partial().optional(),
});

const postInput = z.object({
  slug: z.string().trim().max(180).optional().or(z.literal('')),
  title: z.string().trim().min(2).max(180),
  excerpt: z.string().trim().min(2).max(420),
  body: z.string().trim().min(2).max(6000),
  type: z.enum(['article', 'video']).default('article'),
  category: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80).optional().or(z.literal('')),
  publishedAt: z.string().trim().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  featured: z.boolean().default(false),
  editorialNote: z.string().trim().max(300).optional().or(z.literal('')),
  heroImage: z.object({
    url: z.string().trim().max(500).optional().or(z.literal('')),
    alt: z.string().trim().max(180).optional().or(z.literal('')),
    provider: z.enum(['local', 'cloudinary', 'external', '']).optional().default(''),
    publicId: z.string().trim().max(180).optional().or(z.literal('')),
  }).partial().optional().default({}),
  video: z.object({
    src: z.string().trim().max(500).optional().or(z.literal('')),
    youtubeUrl: z.string().trim().max(500).optional().or(z.literal('')),
    startAt: z.coerce.number().min(0).optional().default(0),
    endAt: z.coerce.number().min(0).optional().default(0),
    objectPosition: z.string().trim().max(80).optional().or(z.literal('')),
  }).partial().optional().default({}),
});

const commentStatusInput = z.object({
  status: z.enum(['visible', 'hidden', 'deleted', 'pending']),
});

const bookingStatusInput = z.object({
  status: z.enum(['new', 'reviewed', 'confirmed', 'completed', 'cancelled']),
});

const bookingNoteInput = z.object({
  body: z.string().trim().min(2).max(1200),
});

const settingsInput = z.object({
  lawyerName: z.string().trim().min(2).max(90),
  brandName: z.string().trim().min(2).max(90),
  footerTagline: z.string().trim().min(2).max(240),
  phoneDisplay: z.string().trim().min(2).max(40),
  phoneHref: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(120),
  addressShort: z.string().trim().min(2).max(180),
  addressFull: z.string().trim().min(2).max(260),
  workingHours: z.string().trim().min(2).max(120),
  navigation: z.object({
    showAbout: z.boolean().default(true),
    aboutLabel: z.string().trim().min(1).max(40),
    showNews: z.boolean().default(true),
    newsLabel: z.string().trim().min(1).max(40),
    showContact: z.boolean().default(true),
    contactLabel: z.string().trim().min(1).max(40),
    showChat: z.boolean().default(true),
    chatLabel: z.string().trim().min(1).max(40),
    ctaLabel: z.string().trim().min(1).max(60),
    ctaHref: z.string().trim().min(1).max(120),
  }),
  homePage: z.object({
    heroEnabled: z.boolean().default(true),
    casesEnabled: z.boolean().default(true),
    contactEnabled: z.boolean().default(true),
    footerEnabled: z.boolean().default(true),
    heroTitleLine: z.string().trim().min(1).max(90),
    heroTitleAccent: z.string().trim().min(1).max(90),
    mobileTitleLine: z.string().trim().min(1).max(90),
    mobileTitleAccent: z.string().trim().min(1).max(90),
    primaryCtaLabel: z.string().trim().min(1).max(60),
    primaryCtaHref: z.string().trim().min(1).max(120),
    secondaryCtaLabel: z.string().trim().min(1).max(60),
    secondaryCtaHref: z.string().trim().min(1).max(120),
  }),
  contactPage: z.object({
    kicker: z.string().trim().min(1).max(80),
    titleStart: z.string().trim().min(1).max(80),
    titleEmphasis: z.string().trim().min(1).max(80),
    summary: z.string().trim().min(2).max(420),
    bookingTitle: z.string().trim().min(2).max(100),
    bookingLead: z.string().trim().min(2).max(420),
  }),
  chat: z.object({
    enabled: z.boolean().default(true),
    directChatEnabled: z.boolean().default(true),
    browserNotificationsEnabled: z.boolean().default(true),
    welcomeMessage: z.string().trim().min(2).max(420),
    directCtaLabel: z.string().trim().min(2).max(80),
    notificationTitle: z.string().trim().min(2).max(90),
    notificationBody: z.string().trim().min(2).max(180),
    lawyerOnlineLabel: z.string().trim().min(2).max(80),
    generalOnlineLabel: z.string().trim().min(2).max(80),
    directPollMs: z.coerce.number().min(4000).max(60000),
    passivePollMs: z.coerce.number().min(8000).max(120000),
    maxStoredMessages: z.coerce.number().min(20).max(200),
    quickReplies: z.array(z.string().trim().min(2).max(80)).min(1).max(8),
  }),
  components: z.object({
    brandIntroEnabled: z.boolean().default(true),
    cookieBannerEnabled: z.boolean().default(true),
  }),
});

const CYRILLIC_MAP = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
};

function makeSlug(value = '') {
  const transliterated = String(value)
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_MAP[char] || char)
    .join('');

  const slug = transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

  return slug || `post-${Date.now()}`;
}

function publicPost(post) {
  return {
    id: String(post._id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    type: post.type || 'article',
    category: post.category,
    location: post.location,
    publishedAt: post.publishedAt,
    heroImage: post.heroImage,
    video: post.video,
    stats: post.stats,
    featured: post.featured,
    status: post.status,
    editorialNote: post.editorialNote,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function publicComment(comment) {
  return {
    id: String(comment._id),
    postSlug: comment.postSlug,
    displayName: comment.displayName,
    body: comment.body,
    status: comment.status,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

function serializeMessage(message) {
  return {
    id: String(message._id),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    meta: message.meta || {},
  };
}

function getAttentionState(session, lastMessage = null, lastUserMessage = null, lastAdminMessage = null) {
  const status = session.status || 'open';
  const priority = session.priority || 'normal';
  const direct = session.directChat || {};
  const lastUserAt = lastUserMessage?.createdAt || direct.lastVisitorMessageAt || null;
  const lastAdminAt = lastAdminMessage?.createdAt || direct.lastAdminReplyAt || null;
  const waitingSince = direct.requestedAt || session.lastMessageAt || session.createdAt;
  const waitingMinutes = waitingSince
    ? Math.max(0, Math.round((Date.now() - new Date(waitingSince).getTime()) / 60000))
    : 0;

  if (['waiting_for_lawyer'].includes(status)) {
    return {
      needsAttention: true,
      attentionReason: priority === 'high'
        ? 'Спешен директен чат чака адвокат.'
        : 'Директен чат чака първи отговор.',
      waitingMinutes,
      lastUserMessageAt: lastUserAt,
      lastAdminReplyAt: lastAdminAt,
    };
  }

  if (lastUserAt && (!lastAdminAt || new Date(lastUserAt) > new Date(lastAdminAt))) {
    return {
      needsAttention: status !== 'closed',
      attentionReason: priority === 'high'
        ? 'Нов клиентски отговор по висок приоритет.'
        : 'Има клиентско съобщение след последния админ отговор.',
      waitingMinutes,
      lastUserMessageAt: lastUserAt,
      lastAdminReplyAt: lastAdminAt,
    };
  }

  if (priority === 'high' && status !== 'closed') {
    return {
      needsAttention: true,
      attentionReason: 'Висок приоритет.',
      waitingMinutes,
      lastUserMessageAt: lastUserAt,
      lastAdminReplyAt: lastAdminAt,
    };
  }

  return {
    needsAttention: false,
    attentionReason: '',
    waitingMinutes,
    lastUserMessageAt: lastUserAt,
    lastAdminReplyAt: lastAdminAt,
  };
}

function serializeSession(
  session,
  lastMessage = null,
  {
    lastUserMessage = null,
    lastAdminMessage = null,
  } = {}
) {
  const attention = getAttentionState(session, lastMessage, lastUserMessage, lastAdminMessage);

  return {
    sessionId: session.sessionId,
    visitor: session.visitor || {},
    status: session.status,
    priority: session.priority,
    detectedIntent: session.detectedIntent,
    directChat: session.directChat || {},
    lastMessageAt: session.lastMessageAt,
    createdAt: session.createdAt,
    lastMessage: lastMessage ? serializeMessage(lastMessage) : null,
    ...attention,
  };
}

function serializeBooking(booking) {
  return {
    id: String(booking._id),
    client: booking.client || {},
    case: booking.case || {},
    preferred: booking.preferred || {},
    status: booking.status,
    source: booking.source,
    consent: booking.consent,
    notes: booking.notes || [],
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

function normalizePostPayload(input) {
  return {
    ...input,
    slug: makeSlug(input.slug || input.title),
    location: input.location || 'България',
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
    heroImage: {
      url: input.heroImage?.url || '',
      alt: input.heroImage?.alt || input.title,
      provider: input.heroImage?.provider || '',
      publicId: input.heroImage?.publicId || '',
    },
    video: {
      src: input.video?.src || '',
      youtubeUrl: input.video?.youtubeUrl || '',
      startAt: Number(input.video?.startAt || 0),
      endAt: Number(input.video?.endAt || 0),
      objectPosition: input.video?.objectPosition || 'center center',
    },
  };
}

router.get('/me', asyncHandler(async (req, res) => {
  const session = readAdminSession(req);

  res.json({
    success: true,
    configured: isAdminConfigured(),
    admin: session,
  });
}));

router.post('/login', validateBody(loginInput), asyncHandler(async (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Админ входът още не е конфигуриран в .env.',
    });
  }

  const { username, password } = req.body;
  if (!verifyAdminCredentials(username, password)) {
    return res.status(401).json({
      success: false,
      message: 'Грешно потребителско име или парола.',
    });
  }

  const token = createAdminSession(username);
  setAdminCookie(res, token);

  res.json({
    success: true,
    admin: {
      username,
    },
  });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  clearAdminCookie(res);
  res.json({ success: true });
}));

router.use(requireAdmin);

router.get('/overview', asyncHandler(async (req, res) => {
  const [
    totalChats,
    directChats,
    attentionChats,
    highPriorityChats,
    newBookings,
    confirmedBookings,
    publishedPosts,
    visibleComments,
    recentChats,
  ] = await Promise.all([
    ChatSession.countDocuments(),
    ChatSession.countDocuments({ status: { $in: ['waiting_for_lawyer', 'lawyer_joined'] } }),
    ChatSession.countDocuments({
      status: { $ne: 'closed' },
      $or: [
        { status: 'waiting_for_lawyer' },
        { priority: 'high' },
        {
          $expr: {
            $gt: [
              '$directChat.lastVisitorMessageAt',
              { $ifNull: ['$directChat.lastAdminReplyAt', new Date(0)] },
            ],
          },
        },
      ],
    }),
    ChatSession.countDocuments({ priority: 'high', status: { $ne: 'closed' } }),
    Booking.countDocuments({ status: 'new' }),
    Booking.countDocuments({ status: 'confirmed' }),
    CasePost.countDocuments({ status: 'published' }),
    CaseComment.countDocuments({ status: 'visible' }),
    ChatSession.find({})
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.json({
    success: true,
    overview: {
      totalChats,
      directChats,
      attentionChats,
      highPriorityChats,
      newBookings,
      confirmedBookings,
      publishedPosts,
      visibleComments,
      recentChats: recentChats.map((session) => serializeSession(session)),
    },
  });
}));

router.get('/chats', asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({})
    .sort({ lastMessageAt: -1 })
    .limit(80)
    .lean();

  const lastMessages = await Promise.all(
    sessions.map((session) =>
      ChatMessage.findOne({ sessionId: session.sessionId })
        .sort({ createdAt: -1 })
        .lean()
    )
  );
  const lastUserMessages = await Promise.all(
    sessions.map((session) =>
      ChatMessage.findOne({ sessionId: session.sessionId, role: 'user' })
        .sort({ createdAt: -1 })
        .lean()
    )
  );
  const lastAdminMessages = await Promise.all(
    sessions.map((session) =>
      ChatMessage.findOne({
        sessionId: session.sessionId,
        role: 'assistant',
        'meta.source': 'admin',
      })
        .sort({ createdAt: -1 })
        .lean()
    )
  );

  res.json({
    success: true,
    sessions: sessions.map((session, index) =>
      serializeSession(session, lastMessages[index], {
        lastUserMessage: lastUserMessages[index],
        lastAdminMessage: lastAdminMessages[index],
      })
    ),
  });
}));

router.get('/chats/:sessionId', asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ sessionId: req.params.sessionId }).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: 'Разговорът не беше намерен.' });
  }

  const [messages, lastMessage, lastUserMessage, lastAdminMessage] = await Promise.all([
    ChatMessage.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: 1 })
      .lean(),
    ChatMessage.findOne({ sessionId: req.params.sessionId })
      .sort({ createdAt: -1 })
      .lean(),
    ChatMessage.findOne({ sessionId: req.params.sessionId, role: 'user' })
      .sort({ createdAt: -1 })
      .lean(),
    ChatMessage.findOne({
      sessionId: req.params.sessionId,
      role: 'assistant',
      'meta.source': 'admin',
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  res.json({
    success: true,
    session: serializeSession(session, lastMessage, {
      lastUserMessage,
      lastAdminMessage,
    }),
    messages: messages.map((message) => serializeMessage(message)),
  });
}));

router.post('/chats/:sessionId/reply', validateBody(chatReplyInput), asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Разговорът не беше намерен.' });
  }

  const message = await ChatMessage.create({
    sessionId: session.sessionId,
    role: 'assistant',
    content: req.body.content,
    visitorSnapshot: session.visitor || {},
    meta: {
      source: 'admin',
      adminUser: req.admin.username,
    },
  });

  session.status = 'lawyer_joined';
  session.lastMessageAt = new Date();
  session.directChat = {
    ...(session.directChat || {}),
    requested: true,
    lastAdminReplyAt: new Date(),
  };
  await session.save();

  res.status(201).json({
    success: true,
    message: serializeMessage(message),
  });
}));

router.patch('/chats/:sessionId/status', validateBody(chatStatusInput), asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    {
      $set: {
        status: req.body.status,
        lastMessageAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  ).lean();

  if (!session) {
    return res.status(404).json({ success: false, message: 'Разговорът не беше намерен.' });
  }

  res.json({
    success: true,
    session: serializeSession(session),
  });
}));

router.patch('/chats/:sessionId/triage', validateBody(chatTriageInput), asyncHandler(async (req, res) => {
  const updates = {
    lastMessageAt: new Date(),
  };

  if (req.body.status) updates.status = req.body.status;
  if (req.body.priority) updates.priority = req.body.priority;
  if (req.body.visitor) {
    updates.visitor = {
      name: req.body.visitor.name || '',
      email: req.body.visitor.email || '',
      phone: req.body.visitor.phone || '',
    };
  }

  const session = await ChatSession.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    { $set: updates },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).lean();

  if (!session) {
    return res.status(404).json({ success: false, message: 'Разговорът не беше намерен.' });
  }

  res.json({
    success: true,
    session: serializeSession(session),
  });
}));

router.get('/posts', asyncHandler(async (req, res) => {
  const posts = await CasePost.find({})
    .sort({ publishedAt: -1, createdAt: -1, updatedAt: -1 })
    .limit(120)
    .lean();

  res.json({
    success: true,
    posts: posts.map((post) => publicPost(post)),
  });
}));

router.post('/posts', validateBody(postInput), asyncHandler(async (req, res) => {
  const payload = normalizePostPayload(req.body);
  const post = await CasePost.create(payload);

  res.status(201).json({
    success: true,
    post: publicPost(post),
  });
}));

router.patch('/posts/:postId', validateBody(postInput), asyncHandler(async (req, res) => {
  const payload = normalizePostPayload(req.body);
  const post = await CasePost.findByIdAndUpdate(
    req.params.postId,
    { $set: payload },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!post) {
    return res.status(404).json({ success: false, message: 'Публикацията не беше намерена.' });
  }

  res.json({
    success: true,
    post: publicPost(post),
  });
}));

router.delete('/posts/:postId', asyncHandler(async (req, res) => {
  const post = await CasePost.findByIdAndUpdate(
    req.params.postId,
    { $set: { status: 'archived' } },
    { returnDocument: 'after' }
  );

  if (!post) {
    return res.status(404).json({ success: false, message: 'Публикацията не беше намерена.' });
  }

  res.json({
    success: true,
    post: publicPost(post),
  });
}));

router.get('/comments', asyncHandler(async (req, res) => {
  const comments = await CaseComment.find({})
    .sort({ createdAt: -1 })
    .limit(160)
    .lean();

  res.json({
    success: true,
    comments: comments.map((comment) => publicComment(comment)),
  });
}));

router.patch('/comments/:commentId/status', validateBody(commentStatusInput), asyncHandler(async (req, res) => {
  const existing = await CaseComment.findById(req.params.commentId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Коментарът не беше намерен.' });
  }

  const wasVisible = existing.status === 'visible';
  existing.status = req.body.status;
  await existing.save();

  const isVisible = existing.status === 'visible';
  if (wasVisible !== isVisible) {
    await CasePost.updateOne(
      {
        slug: existing.postSlug,
        ...(wasVisible ? { 'stats.comments': { $gt: 0 } } : {}),
      },
      { $inc: { 'stats.comments': isVisible ? 1 : -1 } }
    );
  }

  res.json({
    success: true,
    comment: publicComment(existing),
  });
}));

router.get('/bookings', asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .limit(160)
    .lean();

  res.json({
    success: true,
    bookings: bookings.map((booking) => serializeBooking(booking)),
  });
}));

router.patch('/bookings/:bookingId/status', validateBody(bookingStatusInput), asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    { $set: { status: req.body.status } },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).lean();

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Заявката не беше намерена.' });
  }

  res.json({
    success: true,
    booking: serializeBooking(booking),
  });
}));

router.post('/bookings/:bookingId/notes', validateBody(bookingNoteInput), asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    {
      $push: {
        notes: {
          body: req.body.body,
          createdAt: new Date(),
        },
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).lean();

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Заявката не беше намерена.' });
  }

  res.status(201).json({
    success: true,
    booking: serializeBooking(booking),
  });
}));

router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  res.json({
    success: true,
    settings: publicSettings(settings),
  });
}));

router.patch('/settings', validateBody(settingsInput), asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneAndUpdate(
    { singleton: 'main' },
    {
      $set: req.body,
      $setOnInsert: { singleton: 'main' },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  res.json({
    success: true,
    settings: publicSettings(settings),
  });
}));

export default router;
