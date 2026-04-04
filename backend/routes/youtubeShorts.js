const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { requireAuth } = require('../lib/auth');

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'veblen-internal';

function allowInternal(req, res, next) {
  if (req.headers['x-internal-key'] === INTERNAL_KEY) return next();
  return requireAuth(req, res, next);
}

// GET /api/youtube-shorts — list all shorts
router.get('/', allowInternal, async (req, res) => {
  try {
    const { status, nicheId, limit } = req.query;
    const where = {};
    if (status)  where.status  = status;
    if (nicheId) where.nicheId = nicheId;

    const shorts = await prisma.youtubeShort.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
      select: {
        id: true, topic: true, nicheId: true, status: true,
        title: true, hook: true, durationMs: true,
        youtubeVideoId: true, youtubeUrl: true,
        createdAt: true, updatedAt: true,
      },
    });
    res.json(shorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/youtube-shorts/:id — get full detail
router.get('/:id', allowInternal, async (req, res) => {
  try {
    const short = await prisma.youtubeShort.findUnique({ where: { id: req.params.id } });
    if (!short) return res.status(404).json({ error: 'Short not found' });
    res.json(short);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/youtube-shorts — save a new short
router.post('/', allowInternal, async (req, res) => {
  try {
    const {
      topic, nicheId, status, title, description, tags,
      hook, script, brollPrompts, thumbnailText, thumbnailUrl,
      videoUrl, youtubeVideoId, youtubeUrl, durationMs,
      captionsSrt, assemblyPlan, error: errorMsg,
    } = req.body;

    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const short = await prisma.youtubeShort.create({
      data: {
        topic,
        nicheId:        nicheId        || 'general',
        status:         status         || 'draft',
        title:          title          || null,
        description:    description    || null,
        tags:           tags           ? JSON.stringify(tags) : null,
        hook:           hook           || null,
        script:         script         || null,
        brollPrompts:   brollPrompts   ? JSON.stringify(brollPrompts) : null,
        thumbnailText:  thumbnailText  || null,
        thumbnailUrl:   thumbnailUrl   || null,
        videoUrl:       videoUrl       || null,
        youtubeVideoId: youtubeVideoId || null,
        youtubeUrl:     youtubeUrl     || null,
        durationMs:     durationMs     || null,
        captionsSrt:    captionsSrt    || null,
        assemblyPlan:   assemblyPlan   ? JSON.stringify(assemblyPlan) : null,
        error:          errorMsg       || null,
      },
    });
    res.status(201).json(short);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/youtube-shorts/:id — update a short
router.patch('/:id', allowInternal, async (req, res) => {
  try {
    const data = { ...req.body };
    // Stringify JSON fields
    if (data.tags)         data.tags         = JSON.stringify(data.tags);
    if (data.brollPrompts) data.brollPrompts = JSON.stringify(data.brollPrompts);
    if (data.assemblyPlan) data.assemblyPlan = JSON.stringify(data.assemblyPlan);

    const short = await prisma.youtubeShort.update({
      where: { id: req.params.id },
      data,
    });
    res.json(short);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Short not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/youtube-shorts/:id
router.delete('/:id', allowInternal, async (req, res) => {
  try {
    await prisma.youtubeShort.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Short not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
