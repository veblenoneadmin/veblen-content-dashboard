const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/content-approvals?status=&processed=&limit=
router.get('/', async (req, res) => {
  const { status, processed, limit = '100' } = req.query;
  const where = {};
  if (status)    where.status    = status;
  if (processed !== undefined) where.processed = processed === 'true';
  try {
    const items = await prisma.contentApproval.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: parseInt(limit, 10),
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/content-approvals — called from WF4
router.post('/', async (req, res) => {
  const {
    content_id, title, type, status, script_copy,
    tiktok_caption, instagram_caption, facebook_caption,
    giveaway_attached, giveaway_link, trigger_word,
    reference_video, framework_used, scheduled_date, notes,
  } = req.body;

  if (!content_id) return res.status(400).json({ error: 'content_id required' });

  try {
    const item = await prisma.contentApproval.upsert({
      where: { contentId: content_id },
      create: {
        contentId:        content_id,
        title:            title            ?? '',
        type:             type             ?? 'unknown',
        status:           status           ?? 'Pending Review',
        scriptCopy:       script_copy      ?? null,
        tiktokCaption:    tiktok_caption   ?? null,
        instagramCaption: instagram_caption ?? null,
        facebookCaption:  facebook_caption ?? null,
        giveawayAttached: giveaway_attached === 'yes' || giveaway_attached === true,
        giveawayLink:     giveaway_link    ?? null,
        triggerWord:      trigger_word     ?? null,
        referenceVideo:   reference_video  ?? null,
        frameworkUsed:    framework_used   ?? null,
        scheduledDate:    scheduled_date   ?? null,
        notes:            notes            ?? null,
      },
      update: {
        title:            title            ?? undefined,
        scriptCopy:       script_copy      ?? undefined,
        tiktokCaption:    tiktok_caption   ?? undefined,
        instagramCaption: instagram_caption ?? undefined,
        facebookCaption:  facebook_caption ?? undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/content-approvals/:id — approve / reject / mark scheduled
router.patch('/:id', async (req, res) => {
  const { status, platform, caption, scheduledDate, notes, processed, approvedBy } = req.body;
  try {
    const data = {};
    if (status        !== undefined) data.status        = status;
    if (platform      !== undefined) data.platform      = platform;
    if (caption       !== undefined) data.caption       = caption;
    if (scheduledDate !== undefined) data.scheduledDate = scheduledDate;
    if (notes         !== undefined) data.notes         = notes;
    if (processed     !== undefined) data.processed     = processed;
    if (approvedBy    !== undefined) data.approvedBy    = approvedBy;
    if (status === 'Approved')       data.approvedAt    = new Date();

    const item = await prisma.contentApproval.update({
      where: { id: req.params.id },
      data,
    });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
