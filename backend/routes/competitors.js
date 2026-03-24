const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { requireAuth } = require('../lib/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const competitors = await prisma.competitor.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(competitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, category, youtube, instagram, linkedin } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'name and category are required' });
    const competitor = await prisma.competitor.create({ data: { name, category, youtube, instagram, linkedin } });
    res.status(201).json(competitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const competitor = await prisma.competitor.update({ where: { id: req.params.id }, data: req.body });
    res.json(competitor);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.competitor.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
