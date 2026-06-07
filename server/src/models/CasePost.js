import mongoose from 'mongoose';

const casePostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    excerpt: { type: String, required: true, trim: true, maxlength: 420 },
    body: { type: String, required: true, trim: true, maxlength: 6000 },
    category: { type: String, required: true, trim: true, maxlength: 80, index: true },
    location: { type: String, trim: true, maxlength: 80, default: 'България' },
    publishedAt: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    heroImage: {
      url: { type: String, trim: true, default: '' },
      alt: { type: String, trim: true, default: '' },
      provider: { type: String, enum: ['local', 'cloudinary', 'external', ''], default: 'local' },
      publicId: { type: String, trim: true, default: '' },
    },
    stats: {
      likes: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
    },
    featured: { type: Boolean, default: true, index: true },
    editorialNote: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

casePostSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model('CasePost', casePostSchema);
