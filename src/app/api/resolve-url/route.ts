import { NextRequest, NextResponse } from 'next/server';

/** Returns true only if the URL looks like a real article (has a non-trivial path). */
function isArticleUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname.includes('google.com')) return false;
    return pathname.length > 1; // not just "/"
  } catch { return false; }
}

function extractUrlFromHtml(html: string): string | null {
  // 1. data-n-au attribute (Google News real article URL)
  const dna = html.match(/data-n-au="([^"]+)"/)?.[1];
  if (dna && isArticleUrl(dna)) return dna;

  // 2. canonical link
  const can1 = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const can2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  const can = can1 ?? can2;
  if (can && isArticleUrl(can)) return can;

  // 3. og:url meta
  const og1 = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const og2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1];
  const og = og1 ?? og2;
  if (og && isArticleUrl(og)) return og;

  // 4. meta refresh redirect
  const refresh = html.match(/content=["'][^"']*url=([^"'&\s]+)/i)?.[1];
  if (refresh && isArticleUrl(decodeURIComponent(refresh))) return decodeURIComponent(refresh);

  // 5. window.location assignment in JS
  const winLoc = html.match(/window\.location(?:\.href)?\s*=\s*["']((https?:\/\/[^"']+))["']/i)?.[1];
  if (winLoc && isArticleUrl(winLoc)) return winLoc;

  return null;
}

function decodeGoogleNewsToken(url: string): string | null {
  try {
    const token = url.match(/articles\/(CBMi[^?#/\s]+)/)?.[1];
    if (!token) return null;
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const buf = Buffer.from(b64, 'base64');
    // Scan for 'http' bytes in the decoded buffer
    for (let i = 0; i < buf.length - 4; i++) {
      if (buf[i] === 0x68 && buf[i + 1] === 0x74 && buf[i + 2] === 0x74 && buf[i + 3] === 0x70) {
        const raw = buf.subarray(i).toString('utf8');
        const end = raw.search(/[\x00\s"'<>]/);
        const decoded = end > 0 ? raw.slice(0, end) : raw;
        if (isArticleUrl(decoded)) return decoded;
      }
    }
  } catch { /* ignore */ }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  const isGNews = url.includes('news.google.com');

  // Fast path: try to decode Google News token without network
  if (isGNews) {
    const decoded = decodeGoogleNewsToken(url);
    if (decoded) {
      console.log('[resolve-url] token-decoded:', decoded.slice(0, 80));
      return NextResponse.json({ url: decoded });
    }
  }

  const tryFetch = async (fetchUrl: string, ua: string): Promise<string | null> => {
    try {
      const res = await fetch(fetchUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...(isGNews ? { 'Referer': 'https://news.google.com/' } : {}),
        },
        signal: AbortSignal.timeout(12000),
      });
      const finalUrl = res.url || fetchUrl;
      if (isArticleUrl(finalUrl)) {
        console.log('[resolve-url] redirect resolved:', finalUrl.slice(0, 80));
        return finalUrl;
      }
      // Still on Google — parse HTML
      const html = await res.text();
      const extracted = extractUrlFromHtml(html);
      if (extracted) {
        console.log('[resolve-url] html-extracted:', extracted.slice(0, 80));
        return extracted;
      }
    } catch (e) {
      console.log('[resolve-url] fetch error:', String(e));
    }
    return null;
  };

  const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const googlebot = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

  // Attempt 1: Chrome UA on original URL
  const r1 = await tryFetch(url, chrome);
  if (r1) return NextResponse.json({ url: r1 });

  // Attempt 2: Googlebot UA on original URL
  const r2 = await tryFetch(url, googlebot);
  if (r2) return NextResponse.json({ url: r2 });

  // Could not resolve — return original so the flow isn't broken
  console.log('[resolve-url] unresolved, returning original');
  return NextResponse.json({ url, warning: 'could not resolve' });
}
