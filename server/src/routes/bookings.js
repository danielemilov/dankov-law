import { Router } from 'express';
import { z } from 'zod';
import Booking from '../models/Booking.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notifyNewBooking } from '../services/notificationService.js';

const router = Router();

const bookingInput = z.object({
  name: z.string().trim().min(2, 'Името е задължително').max(90),
  phone: z.string().trim().min(6, 'Телефонът е задължителен').max(40),
  email: z.string().trim().email('Невалиден имейл').max(120),
  area: z.enum([
    'Права на човека и дискриминация',
    'Омразна реч',
    'Трудово право',
    'Административно право',
    'Гражданско право',
    'Наказателно право',
    'НПО и обучения',
    'Друго',
  ]),
  urgency: z.enum(['normal', 'soon', 'urgent']).default('normal'),
  preferredDate: z.string().optional().or(z.literal('')),
  preferredTime: z.string().trim().max(20).optional().or(z.literal('')),
  contactMethod: z.enum(['phone', 'email', 'whatsapp']).default('phone'),
  message: z.string().trim().max(1600).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Необходимо е съгласие за обработка на данните.' }) }),
});

router.post('/', validateBody(bookingInput), asyncHandler(async (req, res) => {
  const data = req.body;

  const booking = await Booking.create({
    client: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
    case: {
      area: data.area,
      urgency: data.urgency,
      summary: data.message || '',
    },
    preferred: {
      date: data.preferredDate ? new Date(data.preferredDate) : undefined,
      time: data.preferredTime || '',
      contactMethod: data.contactMethod,
    },
    source: 'website',
    consent: data.consent,
    meta: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  notifyNewBooking(booking).catch((err) => console.error('Booking notification failed:', err.message));

  res.status(201).json({
    success: true,
    message: 'Заявката беше изпратена успешно.',
    booking: { id: booking._id, status: booking.status },
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, bookings });
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const statusSchema = z.object({
    status: z.enum(['new', 'reviewed', 'confirmed', 'completed', 'cancelled']),
  });

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Невалиден статус.' });
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  );

  if (!booking) return res.status(404).json({ success: false, message: 'Заявката не е намерена.' });
  res.json({ success: true, booking });
}));

export default router;
