import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  try {
    // Follow all HTTP redirects. From Railway's server IP, Google News issues a
    // proper 301/302 to the real article URL. response.url is the final destination.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    const finalUrl = res.url && res.url !== url ? res.url : url;

    // If still on google.com, try to extract the real URL from the HTML
    if (finalUrl.includes('google.com')) {
      const html = await res.text();
      const extracted =
        html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
        html.match(/content=["']0;url=([^"']+)["']/i)?.[1] ??
        html.match(/"(https?:\/\/(?!.*google\.com)[^"]+)"/)?.[1];
      if (extracted) return NextResponse.json({ url: extracted });
    }

    return NextResponse.json({ url: finalUrl });
  } catch (e) {
    return NextResponse.json({ url, error: String(e) });
  }
}
