import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const BNA_STYLE_PROFILE = fs.readFileSync(
  path.join(process.cwd(), 'final_bna.md'),
  'utf-8'
);

async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  const text = await res.text();
  // Trim to 3500 words to match n8n pipeline behaviour
  return text.split(/\s+/).slice(0, 3500).join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
    }
    const client = new Anthropic({ apiKey });

    const body = await req.json();
    const articles: { sources: string[]; files?: { name: string; content: string; fileType?: string }[]; topic: string; categorical?: boolean }[] = body.articles || [];

    const results = [];

    for (let i = 0; i < articles.length; i++) {
      const art = articles[i];

      // Scrape source URLs via Jina reader
      const textSources: string[] = [];
      for (const src of art.sources || []) {
        if (src.trim()) {
          try {
            const text = await scrapeUrl(src.trim());
            textSources.push(`=== SOURCE: ${src} ===\n${text}`);
          } catch {
            textSources.push(`=== SOURCE: ${src} ===\n[Failed to fetch — URL may be paywalled or unavailable]`);
          }
        }
      }

      // Separate text files from PDF files
      const pdfFiles: { name: string; content: string }[] = [];
      for (const file of art.files || []) {
        if (file.fileType === 'pdf') {
          pdfFiles.push({ name: file.name, content: file.content });
        } else {
          const trimmed = file.content.split(/\s+/).slice(0, 3500).join(' ');
          textSources.push(`=== SOURCE: ${file.name} ===\n${trimmed}`);
        }
      }

      const topicBlock = art.topic ? `\nANGLE/FOCUS: ${art.topic}` : '';
      const sourceBlock = textSources.length
        ? `\n\nSOURCE MATERIAL:\n${textSources.join('\n\n---\n\n')}`
        : '';

      const textPrompt = BNA_STYLE_PROFILE
        + topicBlock
        + (art.categorical
          ? '\n\nWrite an original BNA-style article on the topic above. No source material provided — draw on your knowledge of the subject.'
          : '\n\nUsing the source material provided, write an original BNA-style business news article. Follow the style guide above exactly. Output the article only.')
        + sourceBlock;

      // Build message content — add PDFs as document blocks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageContent: any[] = [{ type: 'text', text: textPrompt }];
      for (const pdf of pdfFiles) {
        messageContent.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdf.content },
          title: pdf.name,
        });
      }

      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ role: 'user', content: messageContent as any }],
      });

      const articleText = message.content[0]?.type === 'text' ? message.content[0].text : '';
      results.push({ index: i, topic: art.topic || '', articleText });
    }

    return NextResponse.json({ articles: results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
