const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/weekly-reports?limit=1&format=snake
router.get('/', async (req, res) => {
  const { limit, format } = req.query;
  const reports = await prisma.weeklyReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(limit) : 10,
  });
  if (format === 'snake') {
    return res.json(reports.map(r => ({
      id:                           r.id,
      week_start:                   r.weekStart,
      top_hooks_json:               r.topHooksJson,
      top_frameworks_json:          r.topFrameworksJson,
      trend_insights:               r.trendInsights,
      strategy_recommendations:     r.strategyRecommendations,
      delta_from_last_week:         r.deltaFromLastWeek,
      optimal_posting_schedule:     r.optimalPostingSchedule,
      content_split_recommendation: r.contentSplitRecommendation,
      action_items:                 r.actionItems,
      raw_report:                   r.rawReport,
      created_at:                   r.createdAt,
    })));
  }
  res.json(reports);
});

// POST /api/weekly-reports  — store report from WF3
router.post('/', async (req, res) => {
  const b = req.body;
  const report = await prisma.weeklyReport.create({
    data: {
      weekStart:                   b.weekStart                   || b.week_start || '',
      topHooksJson:                b.topHooksJson                || b.top_hooks_json || null,
      topFrameworksJson:           b.topFrameworksJson           || b.top_frameworks_json || null,
      trendInsights:               b.trendInsights               || b.trend_insights || null,
      strategyRecommendations:     b.strategyRecommendations     || b.strategy_recommendations || null,
      deltaFromLastWeek:           b.deltaFromLastWeek           || b.delta_from_last_week || null,
      optimalPostingSchedule:      b.optimalPostingSchedule      || b.optimal_posting_schedule || null,
      contentSplitRecommendation:  b.contentSplitRecommendation  || b.content_split_recommendation || null,
      actionItems:                 b.actionItems                 || b.action_items || null,
      rawReport:                   b.rawReport                   || b.raw_report || null,
    },
  });
  res.status(201).json(report);
});

module.exports = router;
