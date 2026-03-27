const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/creator-sources
router.get('/', async (_req, res) => {
  try {
    const sources = await prisma.creatorSource.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(sources);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/creator-sources
router.post('/', async (req, res) => {
  const { name, platform, type, endpoint, apiKey } = req.body;
  if (!name || !platform || !type) return res.status(400).json({ error: 'name, platform and type are required' });
  try {
    const source = await prisma.creatorSource.create({
      data: { name, platform, type, endpoint: endpoint ?? null, apiKey: apiKey ?? null },
    });
    res.status(201).json(source);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/creator-sources/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.creatorSource.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
