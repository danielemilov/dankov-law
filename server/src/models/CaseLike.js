import mongoose from 'mongoose';

const caseLikeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CasePost', required: true, index: true },
    postSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    sessionId: { type: String, required: true, trim: true, maxlength: 120 },
    fingerprint: { type: String, trim: true, maxlength: 180, default: '' },
    meta: {
      ip: { type: String, trim: true, default: '' },
      userAgent: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

caseLikeSchema.index({ postSlug: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('CaseLike', caseLikeSchema);
