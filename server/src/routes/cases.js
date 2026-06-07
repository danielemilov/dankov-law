import { Router } from 'express';
import { z } from 'zod';

import CaseComment from '../models/CaseComment.js';
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

const adminInput = z.object({
  token: z.string().trim().min(6),
});

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
    stats: {
      comments: post.stats?.comments || 0,
    },
    featured: post.featured,
    editorialNote: post.editorialNote,
  };
}

async function ensureDefaultPosts() {
  await Promise.all(
    defaultCasePosts.map((post) =>
      CasePost.updateOne(
        { slug: post.slug },
        {
          $setOnInsert: post,
        },
        { upsert: true }
      )
    )
  );
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

  const posts = await CasePost.find({ status: 'published' })
    .sort({ featured: -1, publishedAt: -1 })
    .limit(12)
    .lean();

  res.json({
    success: true,
    posts: posts.map((post) => publicPost(post)),
  });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  await ensureDefaultPosts();

  const post = await CasePost.findOne({ slug: req.params.slug, status: 'published' }).lean();

  if (!post) {
    return res.status(404).json({ success: false, message: 'Новината не беше намерена.' });
  }

  const comments = await CaseComment.find({ postSlug: post.slug, status: 'visible' })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({
    success: true,
    post: publicPost(post),
    comments: comments.map((comment) => ({
      id: String(comment._id),
      displayName: comment.displayName,
      body: comment.body,
      createdAt: comment.createdAt,
    })),
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
