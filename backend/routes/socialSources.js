const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/social-sources
router.get('/', async (_req, res) => {
  try {
    const sources = await prisma.socialSource.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(sources);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/social-sources
router.post('/', async (req, res) => {
  const { platform, handle, url, status, followers, lastSync, notes } = req.body;
  if (!platform || !handle || !url) return res.status(400).json({ error: 'platform, handle and url are required' });
  try {
    const source = await prisma.socialSource.create({
      data: {
        platform,
        handle,
        url,
        status:    status    ?? 'pending',
        followers: followers ?? 0,
        lastSync:  lastSync  ?? null,
        notes:     notes     ?? null,
      },
    });
    res.status(201).json(source);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/social-sources/:id
router.patch('/:id', async (req, res) => {
  const { platform, handle, url, status, followers, lastSync, notes } = req.body;
  try {
    const source = await prisma.socialSource.update({
      where: { id: req.params.id },
      data: {
        ...(platform  !== undefined && { platform }),
        ...(handle    !== undefined && { handle }),
        ...(url       !== undefined && { url }),
        ...(status    !== undefined && { status }),
        ...(followers !== undefined && { followers }),
        ...(lastSync  !== undefined && { lastSync }),
        ...(notes     !== undefined && { notes }),
      },
    });
    res.json(source);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/social-sources/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.socialSource.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
