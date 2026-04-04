import { NextRequest, NextResponse } from 'next/server';

// Fetches relevant vertical images for b-roll prompts
// Uses Pexels API (free, 200 req/hr) if PEXELS_API_KEY is set
// Falls back to picsum.photos (always works, no key needed)

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || 'abstract';
  const pexelsKey = process.env.PEXELS_API_KEY;

  // Try Pexels first
  if (pexelsKey) {
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
            url: photo.src.large || photo.src.medium,
            source: 'pexels',
            photographer: photo.photographer,
          });
        }
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: picsum.photos with a seed based on query for consistency
  let hash = 0;
  for (let i = 0; i < query.length; i++) hash = ((hash << 5) - hash + query.charCodeAt(i)) | 0;
  const seed = Math.abs(hash) % 1000;

  return NextResponse.json({
    url: `https://picsum.photos/seed/${seed}/576/1024`,
    source: 'picsum',
  });
}
