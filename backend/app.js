/**
 * backend/app.js
 *
 * Pure Express application — no database initialisation, no server.listen().
 * Exported so that Supertest can import and exercise routes without
 * starting the actual server or connecting to SQLite.
 */

import express from 'express';
import cors from 'cors';

import authRoutes       from './routes/auth.js';
import suggestionRoutes from './routes/suggestions.js';
import menuRoutes       from './routes/menu.js';
import feedbackRoutes   from './routes/feedback.js';
import errorHandler     from './middleware/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/menu',        menuRoutes);
app.use('/api/feedback',    feedbackRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

// ── 404 catch-all (must come after all routes) ──────────────────────────────
app.use((req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.path}`);
  err.code = 'NOT_FOUND';
  next(err);
});

// ── Centralised error handler ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
