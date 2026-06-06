import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import bookingsRouter from './routes/bookings.js';
import chatRouter from './routes/chat.js';
import whatsappWebhookRouter from './routes/whatsappWebhook.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      },
    },
  })
);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '32kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Твърде много заявки. Опитайте след малко.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 35,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Твърде много съобщения. Опитайте след малко.' },
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dankov Law API is running',
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dankov Law API',
    time: new Date().toISOString(),
  });
});

app.use('/api/bookings', bookingLimiter, bookingsRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/webhooks/whatsapp', whatsappWebhookRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
