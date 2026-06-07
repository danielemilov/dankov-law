import mongoose from 'mongoose';

const caseCommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CasePost', required: true, index: true },
    postSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 48 },
    body: { type: String, required: true, trim: true, maxlength: 900 },
    status: {
      type: String,
      enum: ['visible', 'hidden', 'deleted', 'pending'],
      default: 'visible',
      index: true,
    },
    meta: {
      sessionId: { type: String, trim: true, default: '' },
      ip: { type: String, trim: true, default: '' },
      userAgent: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

caseCommentSchema.index({ postSlug: 1, status: 1, createdAt: -1 });

export default mongoose.model('CaseComment', caseCommentSchema);
