import { NextRequest, NextResponse } from 'next/server';

// Extract a non-Google URL from Google News HTML.
// Google News redirect pages embed the target URL in several places.
function extractFromGoogleHtml(html: string): string | null {
  // 1. meta refresh: content="0;url=https://..."
  const metaRefresh = html.match(/content=["']0;\s*url=([^"']+)["']/i)?.[1];
  if (metaRefresh) return metaRefresh;

  // 2. JS window.location assignment
  const windowLoc = html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i)?.[1];
  if (windowLoc && !windowLoc.includes('google.com')) return windowLoc;

  // 3. JS location.replace / location.assign
  const locReplace = html.match(/location\.(?:replace|assign)\s*\(\s*["']([^"']+)["']\s*\)/i)?.[1];
  if (locReplace && !locReplace.includes('google.com')) return locReplace;

  // 4. data-n-au attribute (Google News article URL attribute)
  const dataNAu = html.match(/data-n-au="([^"]+)"/)?.[1];
  if (dataNAu) return dataNAu;

  // 5. canonical link
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  if (canonical && !canonical.includes('google.com')) return canonical;

  // 6. og:url meta tag pointing off-google
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1];
  if (ogUrl && !ogUrl.includes('google.com')) return ogUrl;

  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  // Non-Google URLs: follow redirects and return final URL
  if (!url.includes('google.com')) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VeblenDashboard/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      return NextResponse.json({ url: res.url || url });
    } catch {
      return NextResponse.json({ url });
    }
  }

  // Google News URLs — fetch the page and extract the real URL from HTML
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(12000),
    });

    // If fetch already redirected away from Google, we're done
    if (res.url && !res.url.includes('google.com')) {
      return NextResponse.json({ url: res.url });
    }

    // Parse HTML for the real URL
    const html = await res.text();
    const extracted = extractFromGoogleHtml(html);
    if (extracted) return NextResponse.json({ url: extracted });

    // Last resort: return wherever fetch landed
    return NextResponse.json({ url: res.url || url });
  } catch (e) {
    return NextResponse.json({ url, error: String(e) });
  }
}
