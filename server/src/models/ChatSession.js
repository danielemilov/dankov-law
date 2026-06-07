import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const consentSchema = new mongoose.Schema(
  {
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date, default: null },
    source: { type: String, default: '' },
    textVersion: { type: String, default: 'privacy_v1' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { _id: false }
);

const metaSchema = new mongoose.Schema(
  {
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    visitor: {
      type: visitorSchema,
      default: () => ({}),
    },

    consent: {
      type: consentSchema,
      default: () => ({}),
    },

    detectedIntent: {
      type: String,
      enum: [
        'unknown',
        'general',
        'employment',
        'discrimination',
        'hateSpeech',
        'administrative',
        'criminal',
        'booking',
        'pricing',
        'documents',
        'family',
        'civil',
        'consumer',
        'property',
        'company',
        'hate_speech',
        'admin_law',
      ],
      default: 'unknown',
      index: true,
    },

    status: {
      type: String,
      enum: ['open', 'lead', 'closed'],
      default: 'open',
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
      index: true,
    },

    unknownCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    legalState: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    leadNotifiedAt: {
      type: Date,
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    meta: {
      type: metaSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.model('ChatSession', chatSessionSchema);
