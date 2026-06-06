import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  visitorSnapshot: {
    name: String,
    email: String,
    phone: String,
  },
  meta: {
    model: String,
    fallback: Boolean,
  },
}, { timestamps: true });

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
