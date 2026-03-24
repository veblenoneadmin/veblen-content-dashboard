import { NextRequest, NextResponse } from 'next/server';

function extractUrlFromHtml(html: string): string | null {
  // 1. data-n-au attribute (Google News article page real URL)
  const dna = html.match(/data-n-au="([^"]+)"/)?.[1];
  if (dna && !dna.includes('google.com')) return dna;

  // 2. canonical link
  const can = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  if (can && !can.includes('google.com')) return can;

  // 3. og:url meta
  const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1];
  if (og && !og.includes('google.com')) return og;

  // 4. meta refresh redirect
  const refresh = html.match(/content=["'][^"']*url=([^"'&\s]+)/i)?.[1];
  if (refresh && !refresh.includes('google.com')) return decodeURIComponent(refresh);

  // 5. window.location assignment in JS
  const winLoc = html.match(/window\.location(?:\.href)?\s*=\s*["']((https?:\/\/(?!.*google\.com)[^"']+))["']/i)?.[1];
  if (winLoc) return winLoc;

  // 6. Any non-Google HTTPS URL in double quotes (broad fallback)
  const allUrls = [...html.matchAll(/"(https?:\/\/(?!(?:www\.)?google\.[a-z]+)[^"]{10,})"/g)];
  if (allUrls.length) return allUrls[0][1];

  return null;
}

function decodeGoogleNewsToken(url: string): string | null {
  try {
    const token = url.match(/articles\/(CBMi[^?#/\s]+)/)?.[1];
    if (!token) return null;
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const buf = Buffer.from(b64, 'base64');
    // Scan for 'http' bytes anywhere in the buffer
    for (let i = 0; i < buf.length - 4; i++) {
      if (buf[i] === 0x68 && buf[i + 1] === 0x74 && buf[i + 2] === 0x74 && buf[i + 3] === 0x70) {
        const raw = buf.subarray(i).toString('utf8');
        const end = raw.search(/[\x00\s"'<>]/);
        const decoded = end > 0 ? raw.slice(0, end) : raw;
        if (decoded.startsWith('http') && !decoded.includes('google.com')) return decoded;
      }
    }
  } catch { /* ignore */ }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  const isGNews = url.includes('news.google.com');

  // Fast path: try to decode Google News token without any network request
  if (isGNews) {
    const decoded = decodeGoogleNewsToken(url);
    if (decoded) {
      console.log('[resolve-url] decoded from token:', decoded.slice(0, 80));
      return NextResponse.json({ url: decoded });
    }
  }

  try {
    // Convert RSS article URL to regular article URL — may behave differently
    const fetchUrl = isGNews ? url.replace('/rss/articles/', '/articles/') : url;

    const res = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://news.google.com/',
      },
      signal: AbortSignal.timeout(12000),
    });

    // If redirect landed on a non-Google URL, return it
    const finalUrl = res.url || fetchUrl;
    if (!finalUrl.includes('google.com')) {
      console.log('[resolve-url] redirect worked:', finalUrl.slice(0, 80));
      return NextResponse.json({ url: finalUrl });
    }

    // Still on Google — parse the HTML for embedded real URL
    const html = await res.text();
    const extracted = extractUrlFromHtml(html);
    if (extracted) {
      console.log('[resolve-url] extracted from html:', extracted.slice(0, 80));
      return NextResponse.json({ url: extracted });
    }

    // If RSS URL was used and article URL fetch failed too, try the original RSS URL
    if (isGNews && fetchUrl !== url) {
      try {
        const res2 = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'Accept': 'text/html',
          },
          signal: AbortSignal.timeout(8000),
        });
        const finalUrl2 = res2.url || url;
        if (!finalUrl2.includes('google.com')) return NextResponse.json({ url: finalUrl2 });
        const html2 = await res2.text();
        const extracted2 = extractUrlFromHtml(html2);
        if (extracted2) {
          console.log('[resolve-url] extracted (googlebot):', extracted2.slice(0, 80));
          return NextResponse.json({ url: extracted2 });
        }
      } catch { /* ignore fallback failure */ }
    }

    console.log('[resolve-url] could not resolve, returning original:', url.slice(0, 80));
    return NextResponse.json({ url, warning: 'could not resolve' });
  } catch (e) {
    console.log('[resolve-url] fetch error:', String(e));
    return NextResponse.json({ url, error: String(e) });
  }
}
