const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/news-sources
router.get('/', async (_req, res) => {
  try {
    const sources = await prisma.newsSource.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(sources);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/news-sources
router.post('/', async (req, res) => {
  const { name, type, endpoint, apiKey, webhookId } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
  try {
    const source = await prisma.newsSource.upsert({
      where: { name },
      update: { type, endpoint: endpoint ?? null, apiKey: apiKey ?? null, webhookId: webhookId ?? null },
      create: { name, type, endpoint: endpoint ?? null, apiKey: apiKey ?? null, webhookId: webhookId ?? null },
    });
    res.json(source);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/news-sources/:name
router.delete('/:name', async (req, res) => {
  try {
    await prisma.newsSource.delete({ where: { name: req.params.name } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
