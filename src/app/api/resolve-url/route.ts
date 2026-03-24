import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  try {
    // Follow redirects (manual so we can capture the final URL)
    let current = url;
    for (let i = 0; i < 10; i++) {
      const res = await fetch(current, {
        method: 'HEAD',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VeblenDashboard/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      const location = res.headers.get('location');
      if ((res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) && location) {
        current = location.startsWith('http') ? location : new URL(location, current).href;
      } else {
        break;
      }
    }
    return NextResponse.json({ url: current });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
