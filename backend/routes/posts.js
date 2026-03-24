const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { requireAuth } = require('../lib/auth');

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'veblen-internal';
function allowInternal(req, res, next) {
  if (req.headers['x-internal-key'] === INTERNAL_KEY) return next();
  return requireAuth(req, res, next);
}

// GET /api/posts
router.get('/', allowInternal, async (req, res) => {
  try {
    const { platform, status } = req.query;
    const where = {};
    if (platform) where.platform = platform;
    if (status)   where.status   = status;

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts
router.post('/', allowInternal, async (req, res) => {
  try {
    const { title, caption, platform, type, status, scheduledDate } = req.body;
    if (!title || !platform || !type) return res.status(400).json({ error: 'title, platform and type are required' });

    const post = await prisma.post.create({
      data: {
        title,
        caption: caption || null,
        platform,
        type,
        status: status || 'In Progress',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/posts/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(post);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
