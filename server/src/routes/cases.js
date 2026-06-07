import { Router } from 'express';
import { z } from 'zod';

import CaseComment from '../models/CaseComment.js';
import CaseLike from '../models/CaseLike.js';
import CasePost from '../models/CasePost.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { defaultCasePosts } from '../data/defaultCasePosts.js';

const router = Router();

const commentInput = z.object({
  sessionId: z.string().trim().min(8).max(120),
  displayName: z.string().trim().min(2).max(48),
  body: z.string().trim().min(2).max(900),
});

const likeInput = z.object({
  sessionId: z.string().trim().min(8).max(120),
  fingerprint: z.string().trim().max(180).optional().default(''),
});

const adminInput = z.object({
  token: z.string().trim().min(6),
});

function publicPost(post, liked = false) {
  return {
    id: String(post._id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category,
    location: post.location,
    publishedAt: post.publishedAt,
    heroImage: post.heroImage,
    stats: post.stats,
    featured: post.featured,
    editorialNote: post.editorialNote,
    liked,
  };
}

async function ensureDefaultPosts() {
  const count = await CasePost.estimatedDocumentCount();
  if (count > 0) return;

  await CasePost.insertMany(defaultCasePosts, { ordered: false });
}

function isBadComment(text = '') {
  const value = String(text).toLowerCase();
  const banned = [
    'http://',
    'https://',
    'www.',
    'viagra',
    'casino',
    'crypto',
    'bitcoin',
    'forex',
    'xxx',
  ];

  if (banned.some((word) => value.includes(word))) return true;
  if (/(.)\1{12,}/.test(value)) return true;
  return false;
}

function requireAdmin(token) {
  const expected = process.env.CASES_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';
  return Boolean(expected && token === expected);
}

router.get('/', asyncHandler(async (req, res) => {
  await ensureDefaultPosts();

  const sessionId = String(req.query.sessionId || '').trim();
  const posts = await CasePost.find({ status: 'published' })
    .sort({ featured: -1, publishedAt: -1 })
    .limit(12)
    .lean();

  const likedSlugs = sessionId
    ? new Set(
        (
          await CaseLike.find({
            sessionId,
            postSlug: { $in: posts.map((post) => post.slug) },
          })
            .select('postSlug')
            .lean()
        ).map((like) => like.postSlug)
      )
    : new Set();

  res.json({
    success: true,
    posts: posts.map((post) => publicPost(post, likedSlugs.has(post.slug))),
  });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  await ensureDefaultPosts();

  const sessionId = String(req.query.sessionId || '').trim();
  const post = await CasePost.findOne({ slug: req.params.slug, status: 'published' }).lean();

  if (!post) {
    return res.status(404).json({ success: false, message: 'Новината не беше намерена.' });
  }

  const [liked, comments] = await Promise.all([
    sessionId
      ? CaseLike.exists({ sessionId, postSlug: post.slug })
      : Promise.resolve(false),
    CaseComment.find({ postSlug: post.slug, status: 'visible' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  res.json({
    success: true,
    post: publicPost(post, Boolean(liked)),
    comments: comments.map((comment) => ({
      id: String(comment._id),
      displayName: comment.displayName,
      body: comment.body,
      createdAt: comment.createdAt,
    })),
  });
}));

router.post('/:slug/like', validateBody(likeInput), asyncHandler(async (req, res) => {
  const post = await CasePost.findOne({ slug: req.params.slug, status: 'published' });
  if (!post) {
    return res.status(404).json({ success: false, message: 'Новината не беше намерена.' });
  }

  try {
    await CaseLike.create({
      post: post._id,
      postSlug: post.slug,
      sessionId: req.body.sessionId,
      fingerprint: req.body.fingerprint,
      meta: {
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    post.stats.likes += 1;
    await post.save();
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const fresh = await CasePost.findById(post._id).lean();
  res.json({
    success: true,
    liked: true,
    likes: fresh.stats.likes,
  });
}));

router.post('/:slug/comments', validateBody(commentInput), asyncHandler(async (req, res) => {
  const post = await CasePost.findOne({ slug: req.params.slug, status: 'published' });
  if (!post) {
    return res.status(404).json({ success: false, message: 'Новината не беше намерена.' });
  }

  if (isBadComment(req.body.body)) {
    return res.status(400).json({
      success: false,
      message: 'Коментарът не отговаря на правилата за публикуване.',
    });
  }

  const comment = await CaseComment.create({
    post: post._id,
    postSlug: post.slug,
    displayName: req.body.displayName,
    body: req.body.body,
    status: 'visible',
    meta: {
      sessionId: req.body.sessionId,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    },
  });

  post.stats.comments += 1;
  await post.save();

  res.status(201).json({
    success: true,
    comment: {
      id: String(comment._id),
      displayName: comment.displayName,
      body: comment.body,
      createdAt: comment.createdAt,
    },
    comments: post.stats.comments,
  });
}));

router.delete('/comments/:commentId', validateBody(adminInput), asyncHandler(async (req, res) => {
  if (!requireAdmin(req.body.token)) {
    return res.status(403).json({ success: false, message: 'Нямате право за това действие.' });
  }

  const comment = await CaseComment.findById(req.params.commentId);
  if (!comment || comment.status === 'deleted') {
    return res.status(404).json({ success: false, message: 'Коментарът не беше намерен.' });
  }

  comment.status = 'deleted';
  await comment.save();
  await CasePost.updateOne(
    { slug: comment.postSlug, 'stats.comments': { $gt: 0 } },
    { $inc: { 'stats.comments': -1 } }
  );

  res.json({ success: true });
}));

export default router;
