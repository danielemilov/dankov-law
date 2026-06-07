import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';

import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { detectIntent, getAssistantReply } from '../services/aiService.js';
import {
  notifyChatLead,
  notifyChatContactConfirmation,
} from '../services/notificationService.js';
import { extractContact, shouldEscalate } from '../utils/contact.js';

const router = Router();

const CONSENT_TEXT_VERSION = 'privacy_v1';

const visitorInfoSchema = z.object({
  name: z.string().trim().max(90).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
}).partial().default({});

const chatInput = z.object({
  message: z.string().trim().min(1).max(1800),
  sessionId: z.string().uuid().optional().nullable(),
  visitorInfo: visitorInfoSchema,
});

const contactCaptureInput = z.object({
  sessionId: z.string().uuid(),
  visitorInfo: visitorInfoSchema,
  consent: z.boolean().refine((value) => value === true, {
    message: 'Необходимо е съгласие за обработка на данните за обратна връзка.',
  }),
  emailDelivery: z.enum(['server', 'client_web3forms']).optional().default('server'),
  website: z.string().max(200).optional().default(''),
});

function cleanVisitorInfo(visitorInfo = {}, extracted = {}) {
  return {
    name: visitorInfo.name || '',
    email: visitorInfo.email || extracted.email || '',
    phone: visitorInfo.phone || extracted.phone || '',
  };
}

function hasReachableContact(visitor = {}) {
  return Boolean(visitor.email || visitor.phone);
}

function hasAnyVisitorValue(visitor = {}) {
  return Boolean(visitor.name || visitor.email || visitor.phone);
}

function mergeVisitor(oldVisitor = {}, newVisitor = {}) {
  return {
    name: newVisitor.name || oldVisitor.name || '',
    email: newVisitor.email || oldVisitor.email || '',
    phone: newVisitor.phone || oldVisitor.phone || '',
  };
}

function isSpamLikeMessage(message = '') {
  const text = String(message).toLowerCase().trim();

  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount >= 2) return true;

  if (/(.)\1{14,}/.test(text)) return true;

  const spamWords = [
    'viagra',
    'casino',
    'crypto',
    'bitcoin',
    'loan',
    'forex',
    'xxx',
    'free money',
    'make money fast',
    'seo backlinks',
    'buy followers',
    'telegram pump',
    'airdrop',
  ];

  if (spamWords.some((word) => text.includes(word))) return true;

  const compact = text.replace(/[^a-zа-я0-9]/gi, '');
  if (compact.length > 45) {
    const unique = new Set(compact.split('')).size;
    if (unique <= 4) return true;
  }

  return false;
}

function looksLikeFakePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');

  if (!digits) return false;
  if (digits.length < 7) return true;
  if (digits.length > 18) return true;
  if (/^(\d)\1+$/.test(digits)) return true;
  if (digits === '123456789' || digits === '0123456789') return true;

  return false;
}

function looksLikeSuspiciousName(name = '') {
  const value = String(name).trim();

  if (!value) return false;
  if (value.length === 1) return true;
  if (/(.)\1{8,}/.test(value)) return true;
  if (/https?:\/\//i.test(value)) return true;

  return false;
}

function isUnclear(ai) {
  return (
    ai.detectedIntent === 'unknown' ||
    ai.confidence === 0 ||
    (ai.detectedIntent === 'general' && Number(ai.confidence || 0) < 0.22)
  );
}

router.post('/message', validateBody(chatInput), asyncHandler(async (req, res) => {
  const { message, sessionId: existingSessionId, visitorInfo } = req.body;

  if (isSpamLikeMessage(message)) {
    return res.status(400).json({
      success: false,
      message:
        'Съобщението изглежда като автоматичен или spam текст. Моля, опишете казуса си с нормален текст.',
    });
  }

  const sessionId = existingSessionId || randomUUID();
  const extracted = extractContact(message);

  const cleanVisitorFromState = cleanVisitorInfo(visitorInfo);
  const preDetectedIntent = detectIntent(message);

  const session = await ChatSession.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        meta: {
          ip: req.ip,
          userAgent: req.get('user-agent') || '',
        },
      },
      $set: {
        detectedIntent: preDetectedIntent,
        lastMessageAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  const history = await ChatMessage.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  const userMessage = await ChatMessage.create({
    sessionId,
    role: 'user',
    content: message,
    visitorSnapshot: cleanVisitorFromState,
    meta: {
      detectedIntent: preDetectedIntent,
      extractedContact: extracted,
      possibleContactInMessage: Boolean(extracted.email || extracted.phone),
    },
  });

  const ai = await getAssistantReply({
    history,
    userText: message,
  });

  const unclear = isUnclear(ai);

  session.unknownCount = unclear ? Number(session.unknownCount || 0) + 1 : 0;

  const forcedContactAfterUnclear = session.unknownCount >= 3;

  const finalReply = forcedContactAfterUnclear
    ? `${ai.reply}\n\nЗа да не ви подвеждам с общи отговори, най-добре е да оставите телефон или имейл. Кантората ще може да прецени казуса след повече конкретика.`
    : ai.reply;

  const assistantMessage = await ChatMessage.create({
    sessionId,
    role: 'assistant',
    content: finalReply,
    visitorSnapshot: cleanVisitorFromState,
    meta: {
      model: ai.model,
      fallback: ai.fallback,
      detectedIntent: ai.detectedIntent,
      confidence: ai.confidence,
      priority: ai.priority,
      shouldShowContactForm: ai.shouldShowContactForm,
      unknownCount: session.unknownCount,
      forcedContactAfterUnclear,
      diagnostics: ai.diagnostics,
    },
  });

  session.detectedIntent = ai.detectedIntent || preDetectedIntent;
  session.priority = ai.priority || session.priority || 'normal';
  session.lastMessageAt = new Date();

  const contactAvailable = hasReachableContact(session.visitor || {});
  const extractedContactAvailable = Boolean(extracted.email || extracted.phone);

  const seriousCase =
    shouldEscalate(message) ||
    ai.priority === 'high' ||
    ['employment', 'discrimination', 'hateSpeech', 'administrative', 'criminal'].includes(
      ai.detectedIntent || preDetectedIntent
    );

  if (contactAvailable) {
    session.status = 'lead';
  } else if (seriousCase || forcedContactAfterUnclear) {
    session.status = 'open';
  }

  await session.save();

  res.json({
    success: true,
    sessionId,
    reply: finalReply,
    detectedIntent: ai.detectedIntent || preDetectedIntent,
    shouldShowContactForm: Boolean(
      ai.shouldShowContactForm ||
        seriousCase ||
        extractedContactAvailable ||
        forcedContactAfterUnclear
    ),
    meta: {
      model: ai.model,
      fallback: ai.fallback,
      leadCaptured: contactAvailable,
      seriousCase,
      priority: ai.priority,
      confidence: ai.confidence,
      unknownCount: session.unknownCount,
      forcedContactAfterUnclear,
    },
  });
}));

router.post('/contact', validateBody(contactCaptureInput), asyncHandler(async (req, res) => {
  const { sessionId, visitorInfo, emailDelivery, website } = req.body;

  if (website && website.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Заявката беше отказана.',
    });
  }

  const incomingVisitor = {
    name: visitorInfo.name || '',
    email: visitorInfo.email || '',
    phone: visitorInfo.phone || '',
  };

  if (!hasAnyVisitorValue(incomingVisitor)) {
    return res.status(400).json({
      success: false,
      message: 'Оставете поне име, имейл или телефон.',
    });
  }

  if (!hasReachableContact(incomingVisitor)) {
    return res.status(400).json({
      success: false,
      message: 'Оставете имейл или телефон, за да може кантората да се свърже с вас.',
    });
  }

  if (looksLikeSuspiciousName(incomingVisitor.name)) {
    return res.status(400).json({
      success: false,
      message: 'Моля, въведете реално име или оставете полето празно.',
    });
  }

  if (incomingVisitor.phone && looksLikeFakePhone(incomingVisitor.phone)) {
    return res.status(400).json({
      success: false,
      message: 'Моля, въведете реален телефонен номер или използвайте имейл.',
    });
  }

  const existingSession = await ChatSession.findOne({ sessionId });

  const previousVisitor = existingSession?.visitor || {};
  const cleanVisitor = mergeVisitor(previousVisitor, incomingVisitor);

  const hadContactBefore = hasReachableContact(previousVisitor);
  const alreadyNotified = Boolean(existingSession?.leadNotifiedAt);

  const consentRecord = {
    accepted: true,
    acceptedAt: new Date(),
    source: 'chat_contact',
    textVersion: CONSENT_TEXT_VERSION,
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
  };

  const session = await ChatSession.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        meta: {
          ip: req.ip,
          userAgent: req.get('user-agent') || '',
        },
      },
      $set: {
        visitor: cleanVisitor,
        consent: consentRecord,
        status: 'lead',
        lastMessageAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  const messages = await ChatMessage.find({ sessionId })
    .sort({ createdAt: 1 })
    .lean();

  const contactChanged =
    cleanVisitor.name !== (previousVisitor.name || '') ||
    cleanVisitor.email !== (previousVisitor.email || '') ||
    cleanVisitor.phone !== (previousVisitor.phone || '');

  const shouldSendLeadToLawyer =
    emailDelivery !== 'client_web3forms' &&
    (!alreadyNotified || !hadContactBefore || contactChanged);
  let leadNotification = null;
  let clientConfirmationSent = false;

  if (shouldSendLeadToLawyer) {
    leadNotification = await notifyChatLead({ session, messages });

    if (leadNotification.email.status === 'fulfilled') {
      session.leadNotifiedAt = new Date();
      await session.save();
    } else {
      return res.status(502).json({
        success: false,
        message:
          'Контактът е записан, но известието към кантората не беше изпратено. Моля, опитайте отново след малко.',
        consentSaved: true,
        leadNotified: false,
      });
    }
  }

  if (emailDelivery === 'client_web3forms') {
    session.leadNotifiedAt = new Date();
    await session.save();
  }

  if (cleanVisitor.email) {
    try {
      await notifyChatContactConfirmation({ session });
      clientConfirmationSent = true;
    } catch (err) {
      console.error('Chat client confirmation failed:', err.message);
    }
  }

  res.json({
    success: true,
    message: 'Контактът е записан.',
    consentSaved: true,
    consent: {
      accepted: true,
      source: 'chat_contact',
      textVersion: CONSENT_TEXT_VERSION,
    },
    leadNotified:
      emailDelivery === 'client_web3forms' ||
      leadNotification?.email?.status === 'fulfilled' ||
      alreadyNotified,
    clientConfirmationSent,
  });
}));

router.get('/history/:sessionId', asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;

  const messages = await ChatMessage.find({ sessionId })
    .sort({ createdAt: 1 })
    .select('role content createdAt')
    .lean();

  res.json({
    success: true,
    messages,
  });
}));

export default router;
