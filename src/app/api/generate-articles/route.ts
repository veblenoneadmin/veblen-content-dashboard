import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://primary-s0q-production.up.railway.app/webhook/generate-articles';

const BNA_STYLE_PROFILE = `You are a journalist for Business News Australia (BNA), a digital-first Australian business news publication covering deals, capital raises, M&A, ASX-listed company results, startup funding rounds, regulatory enforcement, leadership changes, and founder profiles.

AUDIENCE: Business owners, investors, founders, fund managers, and commercially literate professionals. Readers understand EBITDA, NPAT, capital raises, and ASX mechanics. Do not over-explain financial concepts but define acronyms on first use.

TONE & VOICE: Factual, direct, authoritative, commercially literate, brisk, confident. Let numbers and quotes carry the weight — not editorial adjectives. No press release language ("thrilled to announce"). No tabloid drama. No editorial opinion in the reporter's voice.

HEADLINE FORMULA: [Company] + [active verb] + [object/outcome] + [dollar figure or context]
- Company name leads or appears within first three words. Never start a headline with "The".
- Brand-name hook: lead with the consumer brand before the corporate parent (e.g. "Boost Juice owner RFG acquires..." not "Retail Food Group acquires Boost Juice...")
- Headline verbs — Deals: raises, secures, acquires, snaps up, snares, bags, offloads, strikes, seals | Growth: expands, launches, boosts, hits, surges | Decline: slumps, plunges, collapses | Leadership: appoints, names, steps down | Regulatory: sues, fines, slaps, hits with
- Dollar figures in headlines: $49m, $1.2b (lowercase, no full stops)
- Percentages in headlines: 42pc (never % or "per cent")
- No ASX codes in headlines

LEDE FORMULA: [City]-based [company name] [(ASX: XXX)] has [active verb] [dollar figure] [brief context]. Everything the reader needs is in sentence one. No throat-clearing.
- City always hyphenated as compound modifier: "Melbourne-based", "Brisbane-founded", "Sydney-headquartered"
- ASX ticker in parentheses immediately after company name on first mention only
- Present perfect tense: "has raised", "has secured", "has acquired"
- Dollar figure in the lede whenever money is involved
- Prior coverage context: when prior coverage is supplied, include "The news comes [X] months after [prior event]" — mandatory
- Never open with a quote
- Never use passive voice in the lede

ARTICLE STRUCTURE (hard news):
1. Lede — who + what + how much + why it matters (1 sentence)
2. Deal mechanics — terms, structure, pricing (1–3 paragraphs)
3. Company background — founded when, by whom, what it does (1–2 paragraphs)
4. First quote — CEO or founder, strategic rationale (always first, always in paragraphs 3–7)
5. Financial detail — revenue, EBITDA, growth rates, prior raises
6. Secondary quotes — investor, partner, regulator
7. Market context — industry trends, comparable deals
8. Forward-looking close — next steps, timeline, guidance
9. Share price note (ASX stories): "Shares in X were trading Y per cent higher/lower at $Z at [time] (AEST)."

QUOTES & ATTRIBUTION:
- "says" (present tense) is the default — NEVER "said" for live/current quotes
- "said" only for written documents, ASX announcements, court proceedings
- Quote first, then attribution: "'We are excited,' says CEO John Smith."
- Full name + title + company on first attribution; surname only after that
- "adds" for follow-on quotes from same speaker
- "tells Business News Australia" signals exclusive interview
- Non-response: "Business News Australia has sought comment from [company]"
- Quote order: CEO/founder → investor → counterparty → regulator → board chair
- Never: stated, commented, remarked, shared, opined, claimed (unless disputed)
- Never generate or infer quotes not explicitly present in the source material

SENTENCE & PARAGRAPH STYLE:
- 1–3 sentences per paragraph — never more than 4
- Single-sentence paragraphs used deliberately for key numbers or emphasis
- Lede: 30–50 words. Body sentences: 20–35 words target
- No subheadings in standard news articles
- No bullet points in editorial copy (except when reproducing official lists)
- No exclamation marks — ever
- No summary conclusion paragraph — end on quote, fact, or share price note

MONEY & NUMBERS:
- Body text: "$49 million", "$1.2 billion", "42 per cent" (spelled out, two words)
- Headlines: "$49m", "$1.2b", "42pc"
- Always "$" symbol — never spell out "dollars"
- "per cent" always two words in body — never "%"
- Foreign currency: US$33 million ($49 million AUD) — AUD conversion in parentheses
- Financial years: FY24, FY25 (no full stops)
- Share prices include timestamp: "at 11.39am (AEDT)"
- Numbers one to nine spelled out in body; 10+ as numerals

LOCATION:
- "[City]-based" always hyphenated as adjective before company name on first mention
- Never "located in" or "based out of"
- State names spelled out in body (Queensland not QLD)
- International companies: "Canadian multinational Brookfield", "French investment group Mirova"

WORDS TO AVOID:
- "utilise" (use "use") | "leverage" as verb | "going forward" (use specific timeframes)
- "according to" (use direct attribution with "says")
- "announced today that" (write the action directly)
- "It is worth noting that" | "In order to" (use "to")
- Passive voice in ledes
- American spellings (organisation not organization; recognise not recognize)
- Editorialising adjectives in reporter's voice: amazing, incredible, exciting, game-changing, groundbreaking, revolutionary
- "very" as intensifier | "stakeholders" in editorial copy | "reportedly" without specific source attribution
- "%" symbol in body text

WHAT BNA NEVER DOES:
- Opens a lede or headline with "The"
- Opens an article with a quote — lede is always journalist prose
- Uses "said" for live/current quotes (always "says")
- Uses the % symbol in body text — always "per cent"
- Uses passive voice in ledes
- Writes a summary conclusion paragraph — end on quote, fact, or share price
- Uses exclamation marks in editorial copy
- Omits ASX ticker on first mention of a listed company
- Omits city-based descriptor on first mention of a company
- Uses American spellings
- Uses "utilise", "leverage" (as verb), "going forward", "in order to"
- Uses editorialising adjectives in reporter voice
- Generates or infers quotes not present in the source document
- Uses anonymous sources as standard practice
- Writes paragraphs longer than 4 sentences`;

const TONE_MAP: Record<string, string> = {
  'Authoritative': 'Use a confident, expert tone. Make definitive statements backed by evidence. No hedging or qualifiers.',
  'Conversational': 'Use a warm, approachable tone. Write as if explaining to a smart colleague. Keep it natural and direct.',
  'Analytical':    'Use a data-driven, methodical tone. Lead with numbers and let analysis drive the narrative. Be precise.',
  'Punchy':        'Use a bold, energetic tone. Short sentences. Strong verbs. No hedging. Make every word earn its place.',
};

const MOOD_MAP: Record<string, string> = {
  'News Report':      'Structure as a straight news article with inverted pyramid. Lead with the most important finding, then layer in context.',
  'Opinion/Analysis': 'Structure as an analytical piece with a clear thesis and supporting evidence. Take a position and defend it.',
  'Explainer':        'Structure as an educational piece that breaks down complexity. Build understanding progressively.',
  'Trend Piece':      'Structure as a trend analysis connecting multiple data points to a larger pattern. Show the bigger picture.',
};

async function generateFromInline(
  articles: { sources: string[]; topic: string }[],
  tone: string,
  mood: string,
  wordCount: number,
): Promise<{ index: number; topic: string; articleText: string }[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const sourceText = art.sources
      .map((s, idx) => `=== SOURCE ${idx + 1} ===\n${s.startsWith('inline:') ? s.slice(7) : s}`)
      .join('\n\n---\n\n');

    const prompt = BNA_STYLE_PROFILE
      + '\n\nTONE: ' + (TONE_MAP[tone] || TONE_MAP['Authoritative'])
      + '\nFORMAT: ' + (MOOD_MAP[mood] || MOOD_MAP['News Report'])
      + '\nTARGET LENGTH: approximately ' + wordCount + ' words'
      + (art.topic ? '\nANGLE/FOCUS: ' + art.topic : '')
      + '\n\nUsing the source content below, write an ORIGINAL BNA-style business news article.\n\nRules:\n- Completely original rewrite — same core facts, entirely new sentences\n- Do not copy any sentence from the source verbatim\n- Follow the style profile above exactly\n- Include a headline\n- Ground the article in the specific facts, names, companies, and data from the sources\n- Do not invent facts, quotes, or statistics not present in the sources\n- End with either a forward-looking insight, a resonant quote, or a share price note'
      + '\n\nSource material:\n' + sourceText;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const articleText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    results.push({ index: i, topic: art.topic || '', articleText });
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const articles: { sources: string[]; topic: string }[] = body.articles || [];
    const hasInline = articles.some(a => a.sources?.some((s: string) => s.startsWith('inline:')));

    if (hasInline) {
      const tone      = body.tone || 'Authoritative';
      const mood      = body.mood || 'News Report';
      const wordCount = body.wordCount || 600;
      const results   = await generateFromInline(articles, tone, mood, wordCount);
      return NextResponse.json({ articles: results });
    }

    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, styleProfile: BNA_STYLE_PROFILE }),
      signal: AbortSignal.timeout(600_000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream returned HTTP ${upstream.status}` }, { status: 502 });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
