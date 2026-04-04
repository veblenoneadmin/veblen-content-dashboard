import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  const text = await res.text();
  return text.split(/\s+/).slice(0, 3500).join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
    }

    const body = await req.json();
    const { action } = body;

    // ── DRAFT: Generate script ──────────────────────────────
    if (action === 'draft') {
      const { topic, niche, sourceUrls } = body;
      const client = new Anthropic({ apiKey });

      // Scrape source URLs if provided
      let sourceBlock = '';
      if (sourceUrls?.length) {
        const scraped: string[] = [];
        for (const url of sourceUrls) {
          if (url.trim()) {
            try {
              const text = await scrapeUrl(url.trim());
              scraped.push(`=== SOURCE: ${url} ===\n${text}`);
            } catch {
              scraped.push(`=== SOURCE: ${url} ===\n[Failed to fetch]`);
            }
          }
        }
        if (scraped.length) {
          sourceBlock = `\n\nSOURCE MATERIAL:\n${scraped.join('\n\n---\n\n')}`;
        }
      }

      const systemPrompt = `You are a YouTube Shorts scriptwriter specializing in the "${niche.label}" niche.

NICHE PROFILE:
- Tone: ${niche.tone}
- Target word count: ${niche.wordCount} words
- Pacing: ${niche.pacing}
- Words per minute: ${niche.wordsPerMinute}
- Energy level: ${niche.energyLevel}
- Visual aesthetic: ${niche.aesthetic}
- Music mood: ${niche.musicMood}

SCRIPT FORMAT RULES:
- Write a voiceover script for a 60-90 second YouTube Short (9:16 vertical video)
- Open with a strong hook in the first 3 seconds — make the viewer stop scrolling
- Use short, punchy sentences. One idea per sentence.
- Write for spoken delivery, not reading. Use contractions, conversational language.
- Include [PAUSE] markers where dramatic pauses should go
- Include [B-ROLL: description] markers for visual cues (3-5 total)
- End with a strong callback or cliffhanger — never "like and subscribe"
- Stay within ${niche.wordCount} words for the spoken content

OUTPUT FORMAT:
Return a JSON object with these fields:
{
  "title": "Video title (engaging, under 60 chars)",
  "description": "YouTube description (2-3 sentences with keywords)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "hook": "The opening hook line (first 3 seconds)",
  "script": "The full voiceover script with [PAUSE] and [B-ROLL] markers",
  "brollPrompts": ["image generation prompt 1", "prompt 2", "prompt 3", "prompt 4"],
  "thumbnailText": "2-4 words for thumbnail overlay"
}

Return ONLY valid JSON, no markdown fences or extra text.`;

      const userPrompt = topic
        ? `Write a YouTube Short script about: ${topic}${sourceBlock}`
        : `Pick a trending topic in the ${niche.label} niche and write a YouTube Short script about it.${sourceBlock}`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';

      // Parse JSON from response
      let draft;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        draft = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        draft = null;
      }

      if (!draft) {
        return NextResponse.json({ error: 'Failed to parse script response', raw }, { status: 500 });
      }

      return NextResponse.json({ draft });
    }

    // ── REWRITE: Rewrite/edit script ────────────────────────
    if (action === 'rewrite') {
      const { script, instruction, niche } = body;
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are a YouTube Shorts scriptwriter for the "${niche.label}" niche. The user has a script and wants changes. Return the FULL updated JSON object (same format) with the changes applied. Return ONLY valid JSON, no markdown fences.`,
        messages: [
          { role: 'user', content: `Current script JSON:\n${JSON.stringify(script, null, 2)}\n\nRequested change: ${instruction}` },
        ],
      });

      const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';
      let updated;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        updated = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        updated = null;
      }

      if (!updated) {
        return NextResponse.json({ error: 'Failed to parse rewrite response' }, { status: 500 });
      }

      return NextResponse.json({ draft: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
