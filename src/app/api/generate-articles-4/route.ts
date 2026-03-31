import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const BNA_STYLE_PROFILE = `# BNA Style Guide

## 1. Publication Overview

Business News Australia (BNA) is a digital-first Australian business news publication covering deals, capital raises, M&A, ASX-listed company results, startup funding rounds, regulatory enforcement, leadership changes, and founder profiles.

Audience: Business owners, investors, founders, fund managers, and professionals who are commercially literate. Readers understand EBITDA, NPAT, capital raises, and ASX mechanics. BNA does not over-explain financial concepts but defines acronyms on first use.

Positioning: National in scope with a strong regional lens. BNA covers businesses in Sydney, Melbourne, Brisbane, Perth, Adelaide, the Gold Coast, and regional Australia with equal seriousness. It is not Sydney-centric. Every company is anchored to a city on first mention.

Coverage focus: Deals, money, and the people behind them. If there is a dollar figure, it leads. If there is a founder, they get quoted. If there is a regulator, their exact words are reported.

What BNA is not: It is not a press release rewrite service, a tabloid, an opinion publication, or an academic journal. It sits between wire-service efficiency and broadsheet business journalism — factual, fast, and commercially informed.

---

## 2. Tone & Voice

Core descriptors: Factual, direct, authoritative, commercially literate, brisk, confident.

What BNA sounds like:
- A sharp broadsheet business section written for people who make decisions
- A well-briefed financial journalist who also understands startup culture
- Neutral-to-slightly-positive about Australian business success, without cheerleading
- Numbers and quotes carry the weight — not editorial adjectives

What BNA does not sound like:
- A press release ("We are thrilled to announce…")
- A tabloid ("Shock horror as CEO ousted in dramatic boardroom coup!")
- An academic paper ("This paper examines the implications of…")
- A columnist with opinions ("In my view, this deal is overpriced")

Positive news: Reported straightforwardly. Growth metrics and deal figures do the talking. Executive enthusiasm is conveyed through their own quotes, not editorial adjectives.

Negative news: Reported directly, without hedging or softening. BNA uses blunt language: "sacked", "collapsed", "fell into administration", "hit with a $57 million fine". Consequences are quantified immediately.

Regulatory/legal stories: Both sides presented. Regulator quotes given prominence. Allegations reported as allegations; confirmed findings reported as findings.

Self-reference: BNA refers to itself in the third person as "Business News Australia" — never "we" or "us" in news articles. The phrase "tells Business News Australia" signals exclusive interview content.

---

## 3. Headline Formula

Structure: [Company/Subject] + [active verb] + [object/outcome] + [context or dollar figure]

Company name leads or appears within the first three words. ASX codes never appear in headlines.

Brand name hook: If the company is the parent of a well-known consumer brand, lead the headline with the brand name as an identifier.

Headline Verb Choices:
- Deals: raises, secures, acquires, buys, snaps up, snares, scoops up, bags, offloads, strikes, seals
- Growth: expands, launches, opens, boosts, hits, surges, storms back
- Decline: slumps, plunges, falls, collapses, enters administration
- Leadership: appoints, names, steps down, quits, resigns, sacks
- Regulatory: sues, fines, slaps, hits with, takes to court

Number Formatting in Headlines:
- Dollar figures abbreviated: $49m, $1.2b (lowercase m/b, no full stops)
- Percentages abbreviated: 42pc (not % or "per cent")
- All numbers as numerals, never spelled out
- Dollar amounts below $1 million written in full: $375,000

---

## 4. Lede Structure

Formula: [City-based descriptor] + [company name] + [(ASX: XXX) if listed] + [has/is + active verb] + [core news fact with dollar figure] + [brief context or significance]

Everything the reader needs to know is in the first sentence. No throat-clearing, no scene-setting.

Rules:
1. City location always precedes the company name on first mention as a hyphenated compound modifier: "Melbourne-based", "Sydney-headquartered", "Brisbane-founded", "Gold Coast-based"
2. ASX ticker in parentheses immediately after the company name: "Catapult Group International (ASX: CAT)"
3. Present perfect tense dominates: "has raised", "has secured", "has acquired"
4. Dollar figure appears in the lede whenever the story involves money
5. The "so what" is embedded in the first sentence or delivered immediately in sentence two
6. Prior coverage context — if the company or deal has been covered before, paragraph 1 or 2 must reference it using: "The news comes two months after…", "It follows…", "comes on the heels of…". When prior coverage context is supplied as an input, AI must not omit it.
7. No standalone datelines: No "SYDNEY —" or "MELBOURNE, Monday —"
8. "Today" used frequently to signal immediacy: "has today announced"

---

## 5. Article Structure

Standard Hard News (Deal / Capital Raise / Results):
1. Lede — Who + what + how much + why it matters (1 sentence)
2. Deal mechanics / expansion — Terms, structure, pricing, conditions, parties (1–3 paragraphs)
3. Company background — Founded when, by whom, what it does, key metrics (1–2 paragraphs)
4. First quote — CEO/founder — Strategic rationale, significance, vision (1–2 paragraphs)
5. Financial/operational detail — Revenue, EBITDA, user numbers, prior raises, growth rates (2–4 paragraphs)
6. Secondary quotes — Investor, partner, counterparty CEO, regulator (1–3 paragraphs)
7. Market/competitive context — Industry trends, comparable deals, sector data (1–2 paragraphs)
8. Forward-looking close — Next steps, timeline, guidance, completion conditions (1 paragraph)
9. Share price note (ASX stories) — Real-time price + percentage movement + timestamp (1 sentence)

Key Structural Rules:
- No summary conclusion paragraph. Articles end on a forward-looking quote, a financial metric, a share price note, or a final contextual fact — never a restatement of the lede.
- Share price boilerplate appears at or near the end of every ASX story: "Shares in [Company] were trading X per cent [higher/lower] at $X.XX at [time] (AEST)."
- No subheadings in standard news articles.
- No bullet points in editorial copy (occasionally used when reproducing lists of allegations from official documents).

Word Count:
- Standard deal/funding/results story: 400–900 words
- Complex regulatory or M&A story: 800–1,200 words
- Founder profile or feature: 800–1,500 words
- Brief update (leadership change, short trading update): 200–400 words

---

## 6. Quotes & Attribution

Attribution Verb:
"says" (present tense) is the default for virtually all quotes. This is a defining BNA style marker.

IMPORTANT — AI generation note: When the source is a press release or ASX announcement (the most common input type), all quotes must use "said", not "says". The "says" default applies only to original, live interview content. Mixing tenses within a single article based on source type is correct and expected.

Other permitted verbs (used sparingly):
- "adds" — for follow-on quotes from the same speaker
- "explains" — in feature/interview content
- "notes" — for supplementary observations
- "tells Business News Australia" — signals exclusive/original interview content

Never use: stated, commented, remarked, claimed (unless accuracy is genuinely in dispute), opined, shared

Attribution Format:
Quote first, then attribution: "'We are thrilled with this result,' says Acusensus founder and managing director Alexander Jannink."
Full name + title + company on first attribution. Subsequent quotes from the same person use surname only.

Quote Placement:
- Never in the lede. The first 2–4 paragraphs are always journalist-written factual prose.
- First quote appears in paragraphs 3–7, after the news is fully established.
- CEO/founder quoted first, always.
- Secondary quotes come from investors, partners, counterparty executives, regulators, or board chairs.
- Closing quote is often forward-looking or aspirational.

Who Gets Quoted (in order of priority):
1. CEO or founder of the subject company — always, and always first
2. Investor or VC partner — in funding stories
3. Counterparty executive — acquirer's CEO in M&A
4. Regulator — ASIC, ACCC, AUSTRAC, APRA spokesperson by name and title
5. Board chair — in governance, takeover, or leadership change stories

Analysts and third-party commentators are rarely quoted. BNA relies on company principals and regulators, not pundits.

Quote Content: Quotes provide colour, strategic rationale, or forward-looking statements. They do not repeat facts already stated in the journalist's prose.

---

## 7. Sentence & Paragraph Style

Sentence Length:
- Target: 20–35 words for body copy
- Ledes run longer: 30–50 words to pack in essential facts
- Short punchy sentences (10–15 words) used deliberately for emphasis, particularly for key numbers

Paragraph Length:
- 1–3 sentences per paragraph. This is non-negotiable.
- Single-sentence paragraphs are common and intentional — used for emphasis, key figures, and standalone facts
- Never more than 4 sentences in a paragraph

Punctuation:
- Em-dashes used for parenthetical asides within sentences
- No exclamation marks in editorial copy — ever
- Parentheses used for ASX tickers, currency conversions, and acronym definitions

---

## 8. Vocabulary & Phrasing

Money & Number Formatting:
- Body text: "$49 million", "$1.2 billion", "42 per cent" (spelled out)
- Headlines: "$49m", "$1.2b", "42pc"
- Always use "$" symbol, never spell out "dollars"
- "Per cent" is always two words in body text — never "%"
- Foreign currency amounts always converted to AUD in parentheses on first mention: US$33 million ($49 million)
- Financial year references: FY24, FY25 (no full stops)
- Numbers 10 and above in numerals; numbers below 10 sometimes spelled out but numerals acceptable in financial contexts
- Share prices include timestamp: "at 11.39am (AEDT)"

Location Conventions:
- City as compound modifier on first mention: "Melbourne-based", "Sydney-headquartered", "Brisbane-founded"
- Always hyphenated: "Brisbane-based" not "Brisbane based"
- Never "located in" or "based out of"
- State names spelled out in body text (Queensland, not QLD) unless used as an adjective ("NSW Government")
- International companies get country descriptor: "Canadian multinational Brookfield", "French investment group Mirova"

ASX Code Usage:
- Inserted in parentheses immediately after the company name on first mention: "Qantas Airways (ASX: QAN)"
- Never repeated after first mention
- Never in headlines

Words and Constructions to Avoid:
- "said" as default attribution verb (use "says")
- "utilise" (use "use")
- "leverage" as a verb in editorial copy
- "going forward" (use specific timeframes)
- "according to" (use direct attribution with "says")
- "announced today that" (write the action directly)
- "It is worth noting that…"
- "In order to" (use "to")
- Passive voice in ledes
- American spellings (organisation not organization, recognise not recognize)
- Editorialising adjectives in the reporter's voice ("amazing", "incredible", "exciting", "game-changing")
- "very" as an intensifier
- "stakeholders" in editorial copy
- "reportedly" without attribution to a specific source
- "%" symbol in body text

---

## 9. What BNA Never Does

1. Never opens an article with a quote. The lede is always journalist-written prose.
2. Never opens a headline or lede with the word "The". Restructure so the company name or subject leads.
3. Never uses "said" for current, live quotes. Always "says" (present tense).
4. Never uses a standalone city dateline (no "SYDNEY —"). Location is embedded as an adjective.
5. Never uses the % symbol in body text. Always "per cent" (two words).
6. Never editorialises about whether a deal is good or bad without attribution to a named source.
7. Never uses exclamation marks in editorial copy.
8. Never writes a summary conclusion paragraph. Articles end on a quote, a fact, or a share price note.
9. Never uses passive voice in ledes. The subject always acts.
10. Never uses anonymous sources as standard practice. All quotes are attributed to named individuals with titles.
11. Never treats AI-generated or hallucinated quotes as sourced quotes. Every quote must be traceable to a named person in the source document.
12. Never uses promotional language in the reporter's voice ("groundbreaking", "revolutionary", "game-changing" belong in quotes only).
13. Never omits the ASX ticker on first mention of a listed company.
14. Never omits the city-based descriptor on first mention of a company.
15. Never uses American spellings.
16. Never writes paragraphs longer than 4 sentences.
17. Never uses "utilise", "leverage" (as verb), "going forward", or "in order to".

---

## 10. AI Article Generation Rules

Source Integrity:
- All quotes must be traceable to a named individual in the source document. AI must not generate, infer, or paraphrase quotes that are not explicitly present in the source. If no usable quote exists in the source, insert a placeholder: [No quote available in source — seek comment from CEO/spokesperson].
- Article type must match source type. A press release produces a hard news article.

Headline Generation:
- Always generate 3–5 headline variants per article, drawing on different patterns from the Headline Formula. Label each variant by pattern type.
- Never open a headline with "The".
- Use the brand-name hook where applicable.
- No clickbait. The headline must accurately reflect the story.

Lede & Story Structure:
- Never open the lede with "The" as the first word.
- Front-load all weight. The lede must contain: who, what, how much (dollar figure), and — where relevant — the "Nth time in X months" context.
- Prior coverage context is mandatory when supplied.
- Geographic context must be added where the source is vague.
- Do not summarise at the end. Articles end on a quote, a forward-looking fact, or a share price note.

Freshness & Newsworthiness:
- Flag stale stories. If the announcement date in the source document is more than 2–3 days old, flag this for the editor: [Note: This press release is dated X. Confirm whether the story has already been covered elsewhere before publishing as hard news.]

Editor Review Aids:
- After generating the article, surface a Q&A prompt. Provide a short section at the bottom labelled "Editor Q&A" with pre-populated example prompts.
- Attach a fact-check checklist to every generated article:
  [ ] Dollar figure matches source
  [ ] ASX ticker included on first mention (if listed)
  [ ] City-based descriptor on first mention
  [ ] All quotes attributed to named individuals from the source
  [ ] No summary conclusion paragraph
  [ ] Headline does not start with "The"
  [ ] Announcement date confirmed as current (within 2–3 days)`;

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
    const articles: { sources: string[]; topic: string; categorical?: boolean }[] = body.articles || [];
    const tone: string      = body.tone || 'Authoritative';
    const mood: string      = body.mood || 'News Report';
    const wordCount: number = body.wordCount || 600;

    const results = [];

    for (let i = 0; i < articles.length; i++) {
      const art = articles[i];

      // Scrape source URLs via Jina reader
      const scrapedSources: string[] = [];
      for (const src of art.sources || []) {
        if (src.trim()) {
          try {
            const text = await scrapeUrl(src.trim());
            scrapedSources.push(`=== SOURCE: ${src} ===\n${text}`);
          } catch {
            scrapedSources.push(`=== SOURCE: ${src} ===\n[Failed to fetch — URL may be paywalled or unavailable]`);
          }
        }
      }

      const sourceBlock = scrapedSources.length
        ? `\n\nSOURCE MATERIAL:\n${scrapedSources.join('\n\n---\n\n')}`
        : '';

      const topicBlock = art.topic ? `\nANGLE/FOCUS: ${art.topic}` : '';
      const toneBlock  = `\nTONE: ${tone}`;
      const moodBlock  = `\nFORMAT: ${mood}`;
      const wcBlock    = `\nTARGET LENGTH: approximately ${wordCount} words`;

      const prompt = BNA_STYLE_PROFILE
        + toneBlock
        + moodBlock
        + wcBlock
        + topicBlock
        + (art.categorical
          ? '\n\nWrite an original BNA-style article on the topic above. No source material provided — draw on your knowledge of the subject.'
          : '\n\nUsing the source material below, write an original BNA-style business news article. Follow the style guide above exactly. Output the article only.')
        + sourceBlock;

      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
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
