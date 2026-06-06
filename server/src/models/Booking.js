import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true, trim: true, maxlength: 90 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
  },
  case: {
    area: {
      type: String,
      required: true,
      enum: [
        'Права на човека и дискриминация',
        'Омразна реч',
        'Трудово право',
        'Административно право',
        'Гражданско право',
        'Наказателно право',
        'НПО и обучения',
        'Друго',
      ],
    },
    urgency: {
      type: String,
      enum: ['normal', 'soon', 'urgent'],
      default: 'normal',
    },
    summary: { type: String, trim: true, maxlength: 1600 },
  },
  preferred: {
    date: { type: Date },
    time: { type: String, trim: true, maxlength: 20 },
    contactMethod: { type: String, enum: ['phone', 'email', 'whatsapp'], default: 'phone' },
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'confirmed', 'completed', 'cancelled'],
    default: 'new',
    index: true,
  },
  source: { type: String, enum: ['website', 'chat', 'whatsapp', 'admin'], default: 'website', index: true },
  consent: { type: Boolean, required: true },
  meta: {
    ip: String,
    userAgent: String,
  },
  notes: [{ body: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'client.email': 1 });
bookingSchema.index({ 'client.phone': 1 });

export default mongoose.model('Booking', bookingSchema);
