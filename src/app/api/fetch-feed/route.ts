import { NextRequest, NextResponse } from 'next/server';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function decodeEntities(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(html: string) {
  // Decode entities first (handles double-encoded HTML like &lt;a href...&gt;),
  // then strip tags, then decode any remaining entities.
  let s = decodeEntities(html);
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  return s.trim();
}

function parseCdata(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseRss(xml: string, sourceName: string) {
  const items: object[] = [];
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  for (const [, block] of blocks) {
    const title   = parseCdata(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const link    = parseCdata(block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? block.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? '');
    const desc    = parseCdata(block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? '');
    const pubDate = parseCdata(block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] ?? block.match(/<published[^>]*>([\s\S]*?)<\/published>/)?.[1] ?? '');
    if (!title) continue;

    // Google News RSS descriptions contain the real article URL as an <a href>.
    // Extract it so news items carry the real URL instead of the news.google.com redirect.
    const descDecoded = decodeEntities(parseCdata(block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? ''));
    const descLink = descDecoded.match(/<a\s+[^>]*href=["']([^"']+)["']/i)?.[1];
    const resolvedUrl = (descLink && !descLink.includes('google.com')) ? descLink : (link || undefined);

    items.push({
      id: `${sourceName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source: sourceName,
      title: stripHtml(title),
      summary: stripHtml(desc).slice(0, 280),
      url: resolvedUrl,
      timeAgo: pubDate ? timeAgo(pubDate) : 'recently',
    });
  }
  return items;
}

function parseJsonFeed(json: Record<string, unknown>, sourceName: string) {
  const raw = (json.items ?? json.articles ?? json.news ?? json.data ?? json.results ?? json.posts ?? json.feed ?? []) as Record<string, unknown>[];
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).map((item, i) => ({
    id: `${sourceName}-${Date.now()}-${i}`,
    source: sourceName,
    title:   String(item.title ?? item.headline ?? item.name ?? 'Untitled'),
    summary: String(item.summary ?? item.description ?? item.excerpt ?? item.content_text ?? '').slice(0, 280),
    url:     String(item.url ?? item.link ?? item.href ?? '') || undefined,
    timeAgo: item.date_published ?? item.published_at ?? item.published ?? item.created_at
      ? timeAgo(String(item.date_published ?? item.published_at ?? item.published ?? item.created_at))
      : 'recently',
  }));
}

export async function GET(req: NextRequest) {
  const url      = req.nextUrl.searchParams.get('url');
  const name     = req.nextUrl.searchParams.get('name') ?? 'Source';
  const apiKey   = req.nextUrl.searchParams.get('apiKey') ?? '';

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  try {
    const headers: Record<string, string> = { 'User-Agent': 'VeblenDashboard/1.0' };
    if (apiKey) {
      // Support both common auth styles: X-Api-Key (newsapi.org, etc.) and Authorization Bearer
      headers['X-Api-Key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res  = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
    const text = await res.text();

    // RSS / Atom
    if (/<(rss|feed|channel)\b/.test(text)) {
      return NextResponse.json({ items: parseRss(text, name) });
    }

    // JSON feed
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      return NextResponse.json({ items: parseJsonFeed(json, name) });
    } catch { /* not JSON */ }

    return NextResponse.json({ items: [], warning: 'Could not parse feed — not RSS or JSON' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
