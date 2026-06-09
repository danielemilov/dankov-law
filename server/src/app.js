import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import bookingsRouter from './routes/bookings.js';
import adminRouter from './routes/admin.js';
import casesRouter from './routes/cases.js';
import chatRouter from './routes/chat.js';
import siteSettingsRouter from './routes/siteSettings.js';
import whatsappWebhookRouter from './routes/whatsappWebhook.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(','),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .map((origin) => origin?.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/+$/, '');
  if (allowedOrigins.has(normalizedOrigin)) return true;

  try {
    const { hostname, protocol } = new URL(normalizedOrigin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
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

const casesLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Твърде много действия. Опитайте след малко.' },
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 80,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Твърде много админ действия. Опитайте след малко.' },
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

app.get('/api/public-config', (req, res) => {
  res.json({
    success: true,
    web3FormsAccessKey: process.env.WEB3FORMS_ACCESS_KEY || '',
    lawyerEmail: process.env.LAWYER_EMAIL || '',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dankov Law API',
    time: new Date().toISOString(),
  });
});

app.use('/api/bookings', bookingLimiter, bookingsRouter);
app.use('/api/admin', adminLimiter, adminRouter);
app.use('/api/cases', casesLimiter, casesRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/site-settings', siteSettingsRouter);
app.use('/api/webhooks/whatsapp', whatsappWebhookRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
