import { NextRequest, NextResponse } from 'next/server';

// Fetches relevant vertical VIDEOS for b-roll backgrounds
// Uses Pexels Video API (free, 200 req/hr)
// Falls back to Pexels images, then picsum.photos

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || 'abstract';
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (pexelsKey) {
    // Try Pexels Video API first
    try {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=3&size=small`,
        { headers: { Authorization: pexelsKey } },
      );
      if (res.ok) {
        const data = await res.json();
        const video = data.videos?.[0];
        if (video) {
          // Pick the smallest HD file (good quality, fast load)
          const file = video.video_files
            ?.filter((f: { quality: string; width: number }) => f.quality === 'hd' || f.width >= 480)
            ?.sort((a: { width: number }, b: { width: number }) => a.width - b.width)?.[0]
            || video.video_files?.[0];

          if (file) {
            return NextResponse.json({
              type: 'video',
              url: file.link,
              width: file.width,
              height: file.height,
              poster: video.image, // thumbnail image
              source: 'pexels',
              videographer: video.user?.name,
            });
          }
        }
      }
    } catch {
      // Fall through to image fallback
    }

    // Fallback: Pexels image
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

  // Final fallback: picsum.photos
  let hash = 0;
  for (let i = 0; i < query.length; i++) hash = ((hash << 5) - hash + query.charCodeAt(i)) | 0;
  const seed = Math.abs(hash) % 1000;

  return NextResponse.json({
    type: 'image',
    url: `https://picsum.photos/seed/${seed}/576/1024`,
    source: 'picsum',
  });
}
