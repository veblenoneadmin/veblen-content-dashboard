import { NextRequest, NextResponse } from 'next/server';

// Google News article IDs are base64url-encoded protobuf containing the real URL.
// We find https:// directly in the raw buffer bytes to avoid protobuf byte corruption.
function decodeGoogleNewsId(url: string): string | null {
  try {
    const match = url.match(/\/articles\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    const buf = Buffer.from(base64, 'base64');
    for (const prefix of ['https://', 'http://']) {
      const idx = buf.indexOf(Buffer.from(prefix, 'ascii'));
      if (idx !== -1) {
        // Walk forward collecting only printable ASCII (valid URL chars)
        let end = idx;
        while (end < buf.length && buf[end] >= 33 && buf[end] <= 126) end++;
        return buf.slice(idx, end).toString('ascii');
      }
    }
    return null;
  } catch {
    return null;
  }
}

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

  // Strategy 1: decode the base64 protobuf path
  const decoded = decodeGoogleNewsId(url);
  if (decoded) return NextResponse.json({ url: decoded });

  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // Strategy 2: redirect:manual on the clean /articles/ URL — grab the raw Location header
  // before any consent/JS redirect chain kicks in
  try {
    const cleanUrl = url.replace('/rss/articles/', '/articles/').split('?')[0];
    const manualRes = await fetch(cleanUrl, {
      redirect: 'manual',
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(6000),
    });
    const location = manualRes.headers.get('location');
    if (location && !location.includes('google.com')) {
      return NextResponse.json({ url: location });
    }
  } catch { /* continue */ }

  // Strategy 3: redirect:manual on the original URL
  try {
    const manualRes = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(6000),
    });
    const location = manualRes.headers.get('location');
    if (location && !location.includes('google.com')) {
      return NextResponse.json({ url: location });
    }
  } catch { /* continue */ }

  // Strategy 4: follow redirects, check final URL, then parse HTML
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (res.url && !res.url.includes('google.com')) {
      return NextResponse.json({ url: res.url });
    }

    const html = await res.text();
    const extracted = extractFromGoogleHtml(html);
    if (extracted) return NextResponse.json({ url: extracted });

    return NextResponse.json({ url: res.url || url });
  } catch (e) {
    return NextResponse.json({ url, error: String(e) });
  }
}
