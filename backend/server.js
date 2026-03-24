require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');

const authRoutes        = require('./routes/auth');
const postsRoutes       = require('./routes/posts');
const articlesRoutes    = require('./routes/articles');
const competitorsRoutes = require('./routes/competitors');

const app  = express();
const PORT = process.env.BACKEND_PORT || 3001;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/posts',       postsRoutes);
app.use('/api/articles',    articlesRoutes);
app.use('/api/competitors', competitorsRoutes);

// ── Health ────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'veblen-backend' }));

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[veblen-backend] running on port ${PORT}`);
});

module.exports = app;
