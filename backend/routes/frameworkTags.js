const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/framework-tags?postId=&analysisDate=&limit=
router.get('/', async (req, res) => {
  const { postId, analysisDate, limit } = req.query;
  const where = {};
  if (postId) where.postId = postId;
  if (analysisDate) where.analysisDate = analysisDate;

  const tags = await prisma.frameworkTag.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(limit) : 500,
  });
  res.json(tags);
});

// POST /api/framework-tags  — bulk insert from WF3
router.post('/', async (req, res) => {
  const body = req.body;
  const items = Array.isArray(body) ? body : [body];

  const created = await prisma.frameworkTag.createMany({
    data: items.map(t => ({
      postId:             t.postId            || t.post_id || '',
      hookType:           t.hookType          || t.hook_type || '',
      bodyStructure:      t.bodyStructure     || t.body_structure || '',
      ctaPattern:         t.ctaPattern        || t.cta_pattern || '',
      naturalDescription: t.naturalDescription || t.natural_description || null,
      analysisDate:       t.analysisDate      || t.analysis_date || new Date().toISOString().slice(0, 10),
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ count: created.count });
});

module.exports = router;
