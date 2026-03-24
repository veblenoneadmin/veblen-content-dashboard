const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { requireAuth } = require('../lib/auth');

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'veblen-internal';

function allowInternal(req, res, next) {
  if (req.headers['x-internal-key'] === INTERNAL_KEY) return next();
  return requireAuth(req, res, next);
}

// GET /api/articles
router.get('/', allowInternal, async (_req, res) => {
  try {
    const articles = await prisma.generatedArticle.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, topic: true, tone: true, mood: true, wordCount: true, createdAt: true },
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/:id
router.get('/:id', allowInternal, async (req, res) => {
  try {
    const article = await prisma.generatedArticle.findUnique({ where: { id: req.params.id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles  — save a generated article
router.post('/', allowInternal, async (req, res) => {
  try {
    const { topic, articleText, tone, mood, wordCount, sourceUrls } = req.body;
    if (!articleText) return res.status(400).json({ error: 'articleText is required' });

    const article = await prisma.generatedArticle.create({
      data: {
        topic:       topic       || '',
        articleText,
        tone:        tone        || 'Authoritative',
        mood:        mood        || 'News Report',
        wordCount:   wordCount   || articleText.split(' ').filter(Boolean).length,
        sourceUrls:  sourceUrls  ? JSON.stringify(sourceUrls) : null,
      },
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', allowInternal, async (req, res) => {
  try {
    await prisma.generatedArticle.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Article not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
