import { NextRequest, NextResponse } from 'next/server';

// Fetches relevant vertical VIDEOS for b-roll backgrounds
// Uses Pexels Video API (free, 200 req/hr)

async function searchPexelsVideos(query: string, key: string) {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5&size=small`,
    { headers: { Authorization: key } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.videos || [];
}

function pickBestVideo(videos: Record<string, unknown>[]) {
  if (!videos?.length) return null;
  // Pick first video, prefer one with HD quality
  for (const video of videos) {
    const files = video.video_files as { quality: string; width: number; height: number; link: string }[];
    // Prefer portrait/vertical videos
    const vertical = files?.filter(f => f.height > f.width);
    const pool = vertical?.length ? vertical : files;
    // Pick smallest HD file for fast loading
    const file = pool
      ?.filter(f => f.quality === 'hd' || f.width >= 480)
      ?.sort((a, b) => a.width - b.width)?.[0]
      || pool?.[0];
    if (file) {
      return {
        type: 'video' as const,
        url: file.link,
        width: file.width,
        height: file.height,
        poster: (video as { image?: string }).image,
        source: 'pexels',
      };
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || 'abstract';
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (pexelsKey) {
    // Strategy 1: Search with the full query
    let videos = await searchPexelsVideos(query, pexelsKey);
    let result = pickBestVideo(videos || []);
    if (result) return NextResponse.json(result);

    // Strategy 2: Simplify — take first 2-3 words only
    const simpler = query.split(/\s+/).slice(0, 3).join(' ');
    if (simpler !== query) {
      videos = await searchPexelsVideos(simpler, pexelsKey);
      result = pickBestVideo(videos || []);
      if (result) return NextResponse.json(result);
    }

    // Strategy 3: Single most specific word (longest word = most specific)
    const singleWord = query.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    if (singleWord && singleWord !== simpler) {
      videos = await searchPexelsVideos(singleWord, pexelsKey);
      result = pickBestVideo(videos || []);
      if (result) return NextResponse.json(result);
    }

    // Strategy 4: Fall back to Pexels images
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1&size=medium`,
        { headers: { Authorization: pexelsKey } },
      );
      if (res.ok) {
        const data = await res.json();
        const photo = data.photos?.[0];
        if (photo) {
          return NextResponse.json({
            type: 'image',
            url: photo.src.large || photo.src.medium,
            source: 'pexels',
          });
        }
      }
    } catch {
      // Fall through
    }
  }

  // Final fallback: picsum
  let hash = 0;
  for (let i = 0; i < query.length; i++) hash = ((hash << 5) - hash + query.charCodeAt(i)) | 0;
  const seed = Math.abs(hash) % 1000;

  return NextResponse.json({
    type: 'image',
    url: `https://picsum.photos/seed/${seed}/576/1024`,
    source: 'picsum',
  });
}
