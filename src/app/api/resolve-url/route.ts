import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  try {
    // Use GET + redirect:follow so fetch natively follows all HTTP redirects.
    // response.url is the final destination URL.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    // response.url is the final URL after all redirects
    const finalUrl = res.url && res.url !== url ? res.url : url;

    // Google News sometimes embeds the real URL in the HTML as a meta refresh
    // or canonical link — try to extract it if we're still on a google domain
    if (finalUrl.includes('google.com')) {
      const html = await res.text();
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
        ?? html.match(/content=["']0;url=([^"']+)["']/i)?.[1]
        ?? html.match(/"(https?:\/\/(?!.*google\.com)[^"]+)"/)?.[1];
      if (canonical) return NextResponse.json({ url: canonical });
    }

    return NextResponse.json({ url: finalUrl });
  } catch (e) {
    // On failure, return the original URL so the request still goes through
    return NextResponse.json({ url, error: String(e) });
  }
}
