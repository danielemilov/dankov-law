import dotenv from 'dotenv';
import app from './app.js';
import { connectDb } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

try {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('❌ Startup error:', err.message);
  process.exit(1);
}
