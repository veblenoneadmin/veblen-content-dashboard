import { NextRequest, NextResponse } from 'next/server';

const APIFY = 'https://api.apify.com/v2/acts';
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

async function scrapeAndSave(platform: string, handle: string, url: string, sourceId: string): Promise<void> {
  const token = process.env.APIFY_API_TOKEN;
  const ytKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const creatorName = handle.replace(/^@/, '');

  if (platform === 'TikTok') {
    if (!token) throw new Error('APIFY_API_TOKEN not set');
    const res = await fetch(
      `${APIFY}/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${token}&timeout=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: [url], resultsPerPage: 30, shouldDownloadVideos: false }),
      }
    );
    if (!res.ok) throw new Error(`Apify TikTok ${res.status}: ${await res.text()}`);
    const posts = await res.json();
    for (const d of posts) {
      const views = Number(d.playCount ?? 0);
      const likes = Number(d.diggCount ?? 0);
      const comments = Number(d.commentCount ?? 0);
      const shares = Number(d.shareCount ?? 0);
      const saves = Number(d.collectCount ?? 0);
      await fetch(`${BACKEND}/api/creator-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: creatorName, platform: 'tiktok',
          post_url: d.webVideoUrl || d.url || '',
          post_date: d.createTimeISO || null,
          views, likes, comments_count: comments, shares, saves,
          caption: d.text || d.desc || '',
          hashtags: `{${(d.hashtags || []).map((h: { name?: string } | string) => typeof h === 'string' ? h : h.name ?? '').filter(Boolean).join(',')}}`,
          audio: d.musicMeta?.musicName || '',
          duration_seconds: Math.round(d.videoMeta?.duration || 0),
          engagement_rate: views > 0 ? Math.round(((likes + comments + shares + saves) / views) * 1000000) / 10000 : 0,
          video_download_url: d.videoUrl || '', transcript: '',
        }),
      });
    }
  }

  if (platform === 'Instagram') {
    if (!token) throw new Error('APIFY_API_TOKEN not set');
    const res = await fetch(
      `${APIFY}/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrls: [url], resultsLimit: 30, resultsType: 'posts', searchType: 'user' }),
      }
    );
    if (!res.ok) throw new Error(`Apify Instagram ${res.status}: ${await res.text()}`);
    const posts = await res.json();
    for (const d of posts) {
      const likes = Number(d.likesCount ?? 0);
      const comments = Number(d.commentsCount ?? 0);
      const views = Number(d.videoViewCount ?? 0);
      const engBase = views > 0 ? views : likes > 0 ? likes * 10 : 1;
      await fetch(`${BACKEND}/api/creator-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: creatorName, platform: 'instagram',
          post_url: d.url || (d.shortCode ? `https://www.instagram.com/p/${d.shortCode}/` : ''),
          post_date: d.timestamp || null,
          views, likes, comments_count: comments, shares: 0, saves: 0,
          caption: d.caption || '', hashtags: '{}', audio: '',
          duration_seconds: Math.round(d.videoDuration || 0),
          engagement_rate: Math.round(((likes + comments) / engBase) * 1000000) / 10000,
          video_download_url: d.videoUrl || '', transcript: '',
        }),
      });
    }
  }

  if (platform === 'LinkedIn') {
    if (!token) throw new Error('APIFY_API_TOKEN not set');
    const res = await fetch(
      `${APIFY}/bebity~linkedin-scraper/run-sync-get-dataset-items?token=${token}&timeout=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startUrls: [{ url }], maxPosts: 30 }),
      }
    );
    if (!res.ok) throw new Error(`Apify LinkedIn ${res.status}: ${await res.text()}`);
    const posts = await res.json();
    for (const d of posts) {
      const likes    = Number(d.numLikes ?? d.likesCount ?? d.likes ?? 0);
      const comments = Number(d.numComments ?? d.commentsCount ?? d.comments ?? 0);
      const shares   = Number(d.numShares ?? d.sharesCount ?? d.shares ?? 0);
      const engBase  = likes > 0 ? likes * 10 : 1;
      await fetch(`${BACKEND}/api/creator-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: creatorName, platform: 'linkedin',
          post_url: d.postUrl ?? d.url ?? '',
          post_date: d.postedAt ?? d.date ?? null,
          views: 0, likes, comments_count: comments, shares, saves: 0,
          caption: d.text ?? d.content ?? d.description ?? '',
          hashtags: '{}', audio: '', duration_seconds: 0,
          engagement_rate: Math.round(((likes + comments + shares) / engBase) * 1000000) / 10000,
          video_download_url: '', transcript: '',
        }),
      });
    }
  }

  if (platform === 'Twitter/X' || platform === 'Other') {
    // No scraper available — just mark as connected so the URL is tracked
  }

  if (platform === 'YouTube') {
    if (!ytKey) throw new Error('NEXT_PUBLIC_YOUTUBE_API_KEY not set');
    const channelHandle = handle.replace(/^@/, '');
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&forHandle=${channelHandle}&key=${ytKey}`
    );
    if (!chRes.ok) throw new Error(`YouTube channels API ${chRes.status}`);
    const chData = await chRes.json();
    const channel = chData.items?.[0];
    if (!channel) throw new Error(`YouTube channel not found for handle: ${channelHandle}`);
    const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) throw new Error('No uploads playlist found');

    // Update subscriber count
    const subscribers = Number(channel.statistics?.subscriberCount ?? 0);
    await fetch(`${BACKEND}/api/social-sources/${sourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followers: subscribers }),
    });

    const vidRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=30&key=${ytKey}`
    );
    if (!vidRes.ok) throw new Error(`YouTube playlistItems API ${vidRes.status}`);
    const vidData = await vidRes.json();
    const videoIds = (vidData.items || []).map((v: { snippet: { resourceId: { videoId: string } } }) => v.snippet.resourceId.videoId).join(',');
    if (!videoIds) throw new Error('No videos found');

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${ytKey}`
    );
    if (!statsRes.ok) throw new Error(`YouTube videos API ${statsRes.status}`);
    const statsData = await statsRes.json();

    for (const v of statsData.items || []) {
      const views = Number(v.statistics?.viewCount ?? 0);
      const likes = Number(v.statistics?.likeCount ?? 0);
      const comments = Number(v.statistics?.commentCount ?? 0);
      await fetch(`${BACKEND}/api/creator-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: creatorName, platform: 'youtube',
          post_url: `https://www.youtube.com/watch?v=${v.id}`,
          post_date: v.snippet?.publishedAt || null,
          views, likes, comments_count: comments, shares: 0, saves: 0,
          caption: v.snippet?.title || '', hashtags: '{}', audio: '',
          duration_seconds: 0,
          engagement_rate: views > 0 ? Math.round(((likes + comments) / views) * 1000000) / 10000 : 0,
          video_download_url: '', transcript: '',
        }),
      });
    }
  }

  // Mark source as connected
  await fetch(`${BACKEND}/api/social-sources/${sourceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'connected', lastSync: new Date().toISOString() }),
  });
}

export async function POST(req: NextRequest) {
  const { sourceId, platform, handle, url } = await req.json();
  if (!sourceId || !platform || !handle || !url) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    await scrapeAndSave(platform, handle, url, sourceId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
