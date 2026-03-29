const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// Converts camelCase Prisma object to snake_case for n8n compatibility
function toSnake(post) {
  return {
    id:                post.id,
    creator_name:      post.creatorName,
    platform:          post.platform,
    post_url:          post.postUrl,
    post_date:         post.postDate,
    views:             post.views,
    likes:             post.likes,
    comments_count:    post.commentsCount,
    shares:            post.shares,
    saves:             post.saves,
    caption:           post.caption,
    hashtags:          post.hashtags,
    audio:             post.audio,
    duration_seconds:  post.durationSeconds,
    engagement_rate:   post.engagementRate,
    video_download_url: post.videoDownloadUrl,
    transcript:        post.transcript,
    scraped_at:        post.scrapedAt,
  };
}

// GET /api/creator-posts?creator=&platform=&limit=50&format=snake
router.get('/', async (req, res) => {
  const { creator, platform, limit = '100', format } = req.query;
  const where = {};
  if (creator)  where.creatorName = creator;
  if (platform) where.platform    = platform;
  try {
    const posts = await prisma.creatorPost.findMany({
      where,
      orderBy: { engagementRate: 'desc' },
      take: parseInt(limit, 10),
    });
    res.json(format === 'snake' ? posts.map(toSnake) : posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/creator-posts/summary — per-creator stats
router.get('/summary', async (_req, res) => {
  try {
    const rows = await prisma.creatorPost.groupBy({
      by: ['creatorName', 'platform'],
      _count: { id: true },
      _avg:   { engagementRate: true, views: true, likes: true },
      _max:   { engagementRate: true, scrapedAt: true },
    });
    const summary = rows.map(r => ({
      creatorName:       r.creatorName,
      platform:          r.platform,
      postCount:         r._count.id,
      avgEngagement:     Math.round((r._avg.engagementRate ?? 0) * 100) / 100,
      avgViews:          Math.round(r._avg.views ?? 0),
      avgLikes:          Math.round(r._avg.likes ?? 0),
      topEngagement:     Math.round((r._max.engagementRate ?? 0) * 100) / 100,
      lastScraped:       r._max.scrapedAt,
    }));
    summary.sort((a, b) => b.avgEngagement - a.avgEngagement);
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/creator-posts — upsert by postUrl (called from n8n)
router.post('/', async (req, res) => {
  const {
    creator_name, platform, post_url, post_date,
    views, likes, comments_count, shares, saves,
    caption, hashtags, audio, duration_seconds,
    engagement_rate, video_download_url, transcript,
  } = req.body;

  if (!creator_name || !post_url) {
    return res.status(400).json({ error: 'creator_name and post_url required' });
  }

  const data = {
    creatorName:      creator_name,
    platform:         platform ?? 'unknown',
    postUrl:          post_url,
    postDate:         post_date ? new Date(post_date) : null,
    views:            Number(views)            || 0,
    likes:            Number(likes)            || 0,
    commentsCount:    Number(comments_count)   || 0,
    shares:           Number(shares)           || 0,
    saves:            Number(saves)            || 0,
    caption:          caption  ?? null,
    hashtags:         hashtags ?? null,
    audio:            audio    ?? null,
    durationSeconds:  Number(duration_seconds) || 0,
    engagementRate:   Number(engagement_rate)  || 0,
    videoDownloadUrl: video_download_url ?? null,
    transcript:       transcript ?? null,
  };

  try {
    // findFirst + create/update to avoid unique constraint issues on TEXT fields
    const existing = await prisma.creatorPost.findFirst({ where: { postUrl: post_url } });
    const post = existing
      ? await prisma.creatorPost.update({ where: { id: existing.id }, data: { ...data, scrapedAt: new Date() } })
      : await prisma.creatorPost.create({ data });
    res.status(201).json(post);
  } catch {
    // last-resort create
    try {
      const post = await prisma.creatorPost.create({ data });
      res.status(201).json(post);
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
});

// PATCH /api/creator-posts/:id/transcript
router.patch('/:id/transcript', async (req, res) => {
  const { transcript } = req.body;
  try {
    const post = await prisma.creatorPost.update({
      where: { id: req.params.id },
      data:  { transcript },
    });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
