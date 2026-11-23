import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import questionsRoutes from './routes/questions';
import examRoutes from './routes/exam';
import paymentsRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import homeRoutes from './routes/home';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - support localhost:3000 and dynamic production origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production web deployment
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ACTIVE',
    service: 'Bravo Academy Backend Tactical API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/ai', aiRoutes);

// Root Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Bravo Academy Backend API Server - Operational',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.listen(PORT, () => {
  console.log(`[BRAVO HQ] Backend Server running on http://localhost:${PORT}`);
});

export default app;
