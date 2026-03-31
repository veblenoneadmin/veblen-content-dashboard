'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, ChevronRight, Copy, Download, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';

const N8N_WEBHOOK = 'https://primary-s0q-production.up.railway.app/webhook/generate-articles';

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

Positive news: Reported straightforwardly. Growth metrics and deal figures do the talking. Executive enthusiasm is conveyed through their own quotes, not editorial adjectives. Occasional colourful verbs in headlines — "surges", "storms back", "fires up" — but the body remains factual.

Negative news: Reported directly, without hedging or softening. BNA uses blunt language: "sacked", "collapsed", "fell into administration", "hit with a $57 million fine". Consequences are quantified immediately. No editorial sympathy or moralising.

Regulatory/legal stories: Both sides presented. Regulator quotes given prominence. Allegations reported as allegations; confirmed findings reported as findings. BNA does not editorially adjudicate guilt.

Editorial opinion: Almost none in news articles. The closest BNA comes is contextual framing through verb choice ("embattled", "cash-strapped") or factual juxtaposition.

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

// ── VS Dark palette ───────────────────────────────────────
const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#FF8000', accentGlow: 'rgba(255,128,0,0.10)', accentDim: '#CC6600',
  error: '#f44747',
};

// ── Markdown → HTML ───────────────────────────────────────
function mdToHtml(text: string): string {
  let t = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/gs, '<em>$1</em>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n{2,}/g, '</p><p>');
  t = '<p>' + t + '</p>';
  t = t.replace(/<p>\s*<(h[1-4]|hr|blockquote)/gi, '<$1');
  t = t.replace(/<\/(h[1-4]|blockquote)>\s*<\/p>/gi, '</$1>');
  t = t.replace(/<p><\/p>/g, '');
  return t;
}

const LOADING_MSGS = [
  ['Connecting to engine…', 'Establishing n8n pipeline'],
  ['Fetching source URLs…', 'Reaching out to sources'],
  ['Scraping article data…', 'Extracting text via Jina AI'],
  ['Preparing prompt…', 'Applying BNA style guide'],
  ['AI is writing…', 'Generating original BNA-style content'],
  ['Refining structure…', 'Polishing lede and flow'],
  ['Quality check…', 'Verifying BNA style compliance'],
  ['Finalizing output…', 'Packaging articles'],
  ['Almost there…', 'Applying final formatting'],
];

type ArticleInput  = { topic: string; sources: string[] };
type ArticleResult = { index: number; topic: string; articleText: string };

// ── BNA Preview ───────────────────────────────────────────
function BnaPreview({ article, imgSrc, onImgChange }: {
  article: ArticleResult;
  imgSrc: string;
  onImgChange: (src: string) => void;
}) {
  const [urlBarOpen, setUrlBarOpen] = useState(false);
  const [urlInput, setUrlInput]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]     = useState(false);

  const articleBody = article.articleText.split(/\n+#{1,3}\s*Headline Variants/)[0];
  const html = mdToHtml(articleBody);
  const tmp  = document.createElement('div');
  tmp.innerHTML = html;
  const h1 = tmp.querySelector('h1');
  const headline = h1 ? h1.innerHTML : '';
  if (h1) h1.remove();
  const bodyHtml = tmp.innerHTML;
  const today = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onImgChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#f0efe8', minHeight: '100%' }}>
      <div style={{ background: '#fff', borderBottom: '3px solid #000', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Pragati Narrow', 'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#000', letterSpacing: '-0.5px' }}>
            Business<span style={{ color: '#00AEEF' }}>News</span>Australia
          </span>
          <div style={{ display: 'flex', gap: '14px' }}>
            {['Entrepreneurship', 'Technology', 'Capital Raising', 'Leadership', 'Property'].map(n => (
              <span key={n} style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#333', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: '1fr 290px', gap: '28px' }}>
        <div>
          {headline && (
            <h1 style={{ fontFamily: "'Pragati Narrow', 'Playfair Display', serif", fontSize: '30px', fontWeight: 700, color: '#000', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.2px' }}
              dangerouslySetInnerHTML={{ __html: headline }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
            <span style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#333', fontWeight: 700 }}>
              By <span style={{ color: '#00AEEF' }}>InsightWire</span>
            </span>
            <span style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#999' }}>{today}</span>
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div
            onClick={() => imgSrc ? setUrlBarOpen(v => !v) : setUrlBarOpen(true)}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith('image/')) handleFile(file);
              else { const url = e.dataTransfer.getData('text'); if (url) onImgChange(url); }
            }}
            style={{ marginBottom: '6px', background: dragOver ? '#eaf5ff' : '#e8e8e0', borderRadius: '2px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative', outline: dragOver ? '3px dashed #00AEEF' : 'none' }}
          >
            {imgSrc
              ? <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#bbb', textAlign: 'center', padding: '20px' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="28" height="20" rx="2"/><circle cx="10" cy="13" r="3"/><path d="M2 22l8-6 6 5 4-3 10 7"/></svg>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#aaa' }}>Click or drop image</span>
                  <span style={{ fontSize: '11px' }}>JPG, PNG, WebP — or paste a URL</span>
                </div>
            }
            {urlBarOpen && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.82)', padding: '8px 10px', display: 'flex', gap: '6px', alignItems: 'center', zIndex: 3 }}
                onClick={e => e.stopPropagation()}>
                <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { onImgChange(urlInput); setUrlBarOpen(false); setUrlInput(''); } }}
                  placeholder="Paste image URL…"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px', padding: '5px 9px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  autoFocus />
                <button onClick={() => { onImgChange(urlInput); setUrlBarOpen(false); setUrlInput(''); }}
                  style={{ background: '#00AEEF', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                <button onClick={() => { setUrlBarOpen(false); fileRef.current?.click(); }}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Upload</button>
                <button onClick={() => setUrlBarOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}
            {imgSrc && (
              <button onClick={e => { e.stopPropagation(); onImgChange(''); }}
                style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 3 }}>×</button>
            )}
          </div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#999', fontStyle: 'italic', marginBottom: '18px', textAlign: 'right' }}>Image caption</div>

          <div className="bna-body" dangerouslySetInnerHTML={{ __html: bodyHtml }}
            style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#656565', lineHeight: 1.72 }} />
        </div>

        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#A12611', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #A12611', letterSpacing: '0.5px' }}>Latest News</div>
            {['Brisbane startup secures $5m Series A to expand nationally', 'Gold Coast developer launches $120m mixed-use precinct', 'Melbourne fintech Paytime names new CEO as growth accelerates', 'Perth mining tech firm lists on ASX raising $18m', 'Sydney biotech advances Phase 2 trial with $30m raise'].map((title, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid #eee' }}>
                <a href="#" style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#000', textDecoration: 'none', fontWeight: 700, lineHeight: 1.35, display: 'block' }}>{title}</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .bna-body p { margin: 0 0 15px; }
        .bna-body h1 { font-family: sans-serif; font-size: 28px; color: #000; margin: 0 0 12px; font-weight: 700; }
        .bna-body h2 { font-family: sans-serif; font-size: 24px; color: #000; margin: 24px 0 10px; font-weight: 700; }
        .bna-body h3 { font-family: sans-serif; font-size: 20px; color: #00AEEF; margin: 22px 0 8px; }
        .bna-body h4 { font-size: 14px; color: #A12611; margin: 18px 0 6px; text-transform: uppercase; font-weight: 700; }
        .bna-body strong { color: #333; font-weight: 700; }
        .bna-body em { font-style: italic; }
        .bna-body a { color: #00AEEF; text-decoration: none; }
        .bna-body blockquote { border-left: 4px solid #00AEEF; padding: 10px 16px; margin: 20px 0; background: #f4f9ff; color: #444; font-style: italic; }
        .bna-body hr { border: none; border-top: 1px solid #eee; margin: 22px 0; }
      `}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CreateArticle3Page() {
  const [mode, setMode]             = useState<'editor' | 'categorical'>('editor');
  const [tone, setTone]             = useState('Authoritative');
  const [mood, setMood]             = useState('News Report');
  const [articles, setArticles]     = useState<ArticleInput[]>([{ topic: '', sources: [''] }]);
  const [categories, setCategories] = useState(['', '', '']);
  const [wordCount, setWordCount]   = useState('');
  const [catWordCount, setCatWordCount] = useState('');
  const [catRegion, setCatRegion]   = useState('');
  const [whitelist, setWhitelist]   = useState('');
  const [optOpen, setOptOpen]       = useState(false);
  const [wlOpen, setWlOpen]         = useState(false);
  const [catOptOpen, setCatOptOpen] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [results, setResults]       = useState<ArticleResult[]>([]);
  const [imgSrcs, setImgSrcs]       = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode]     = useState<'preview' | 'raw'>('preview');
  const [error, setError]           = useState('');
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true); setLoadingMsg(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i = i >= LOADING_MSGS.length - 1 ? LOADING_MSGS.length - 3 : i + 1;
      setLoadingMsg(i);
    }, 4000);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const addArticle      = () => setArticles(a => [...a, { topic: '', sources: [''] }]);
  const removeArticle   = (i: number) => setArticles(a => a.filter((_, j) => j !== i));
  const updateTopic     = (i: number, v: string) => setArticles(a => a.map((art, j) => j === i ? { ...art, topic: v } : art));
  const addSource       = (i: number) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: [...art.sources, ''] } : art));
  const removeSource    = (i: number, si: number) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: art.sources.filter((_, k) => k !== si) } : art));
  const updateSource    = (i: number, si: number, v: string) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: art.sources.map((s, k) => k === si ? v : s) } : art));
  const updateCategory  = (i: number, v: string) => setCategories(c => c.map((cat, j) => j === i ? v : cat));

  const handleGenerate = async () => {
    setError('');
    if (mode === 'editor') {
      if (!articles.some(a => a.sources.some(s => s.trim()))) {
        setError('Please provide at least one source URL.'); return;
      }
    } else {
      if (!categories.some(c => c.trim())) {
        setError('Please provide at least one topic.'); return;
      }
    }

    startLoading();
    try {
      let payload: object;
      if (mode === 'editor') {
        const arts = articles
          .map(a => ({ sources: a.sources.filter(s => s.trim()), topic: a.topic.trim() }))
          .filter(a => a.sources.length > 0);
        payload = {
          articles: arts, tone, mood,
          styleProfile: BNA_STYLE_PROFILE,
          ...(wordCount ? { wordCount: parseInt(wordCount) } : {}),
        };
      } else {
        const wl = whitelist.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const cats = categories.filter(c => c.trim()).map(c => ({
          sources: [], topic: c, categorical: true,
          ...(catRegion ? { region: catRegion } : {}),
          ...(wl.length ? { whitelist: wl } : {}),
        }));
        payload = {
          articles: cats, categorical: true, tone, mood,
          styleProfile: BNA_STYLE_PROFILE,
          ...(catWordCount ? { wordCount: parseInt(catWordCount) } : {}),
          ...(catRegion ? { region: catRegion } : {}),
        };
      }

      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setError(`n8n returned HTTP ${res.status}`); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (!data.articles?.length) { setError('No articles returned from n8n.'); return; }
      setResults(data.articles);
      setCurrentIdx(data.articles[0].index ?? 0);
      setImgSrcs({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      stopLoading();
    }
  };

  const currentArticle = results.find(a => a.index === currentIdx) ?? results[0];

  const copyArticle = () => {
    if (!currentArticle) return;
    navigator.clipboard.writeText(currentArticle.articleText);
  };

  const downloadArticle = () => {
    if (!currentArticle) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([currentArticle.articleText], { type: 'text/plain' }));
    a.download = `bna-article-${currentIdx}.txt`;
    a.click();
  };

  const inp: React.CSSProperties = { background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '8px 11px', color: VS.text0, fontFamily: 'inherit', fontSize: '13px', width: '100%', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '9px', fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px' };

  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,6,11,0.93)', backdropFilter: 'blur(14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <Loader2 size={40} style={{ color: VS.accent, animation: 'spin 1s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: VS.text1 }}>{LOADING_MSGS[loadingMsg][0]}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: VS.text2, marginTop: '4px' }}>{LOADING_MSGS[loadingMsg][1]}</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: VS.bg0, fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Left: Form panel ─────────────────────────── */}
        <div style={{ width: formCollapsed ? 0 : '400px', minWidth: formCollapsed ? 0 : '400px', overflowY: 'auto', overflowX: 'hidden', borderRight: `1px solid ${VS.border}`, background: VS.bg1, transition: 'width 0.25s ease, min-width 0.25s ease', flexShrink: 0 }}>
          {!formCollapsed && (
            <div style={{ padding: '18px' }}>
              {error && (
                <div style={{ background: 'rgba(244,71,71,0.08)', border: '1px solid rgba(244,71,71,0.2)', color: VS.error, padding: '9px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', border: `1px solid ${VS.border}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '14px' }}>
                {(['editor', 'categorical'] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px 10px', background: mode === m ? VS.accentGlow : 'transparent', border: 'none', color: mode === m ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', cursor: 'pointer', fontWeight: mode === m ? 600 : 400 }}>
                    {m === 'editor' ? 'Source URLs' : 'By Topic'}
                  </button>
                ))}
              </div>

              {/* ── Editor mode ── */}
              {mode === 'editor' && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: '12px' }}>Articles</div>
                  {articles.map((art, i) => (
                    <div key={i} style={{ border: `1px solid ${VS.border}`, borderRadius: '8px', padding: '12px', marginBottom: '10px', background: VS.bg2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '9px', color: VS.accent, background: VS.accentGlow, padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>ARTICLE {i + 1}</span>
                        {i > 0 && <button onClick={() => removeArticle(i)} style={{ fontFamily: 'monospace', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(244,71,71,0.3)', background: 'rgba(244,71,71,0.05)', color: VS.error, cursor: 'pointer' }}>Remove</button>}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={lbl}>Angle (optional)</label>
                        <input style={inp} value={art.topic} onChange={e => updateTopic(i, e.target.value)} placeholder="e.g. Lead with funding implications for QLD tech" />
                      </div>
                      <label style={lbl}>Sources</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '7px' }}>
                        {art.sources.map((src, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: VS.text2, width: '14px', textAlign: 'right', flexShrink: 0 }}>{si + 1}</span>
                            <input style={{ ...inp, flex: 1 }} type="url" value={src} onChange={e => updateSource(i, si, e.target.value)} placeholder="https://…" />
                            {si > 0 && <button onClick={() => removeSource(i, si)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${VS.border}`, background: 'transparent', color: VS.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>×</button>}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addSource(i)} style={{ fontFamily: 'monospace', fontSize: '9px', padding: '4px 9px', borderRadius: '4px', border: `1px dashed ${VS.border}`, background: 'transparent', color: VS.text2, cursor: 'pointer' }}>+ Source</button>
                    </div>
                  ))}
                  {articles.length < 5 && (
                    <button onClick={addArticle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '9px', border: `1px dashed ${VS.border}`, borderRadius: '8px', background: 'transparent', color: VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                      <Plus size={12} /> Add Article
                    </button>
                  )}

                  <div style={{ border: `1px solid ${VS.border}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '12px' }}>
                    <button onClick={() => setOptOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', background: VS.bg1, border: 'none', color: optOpen ? VS.accent : VS.text2, cursor: 'pointer', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronRight size={11} style={{ transform: optOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        Optional overrides
                      </span>
                      <span style={{ fontSize: '9px', color: VS.text2, fontWeight: 400 }}>BNA style by default</span>
                    </button>
                    {optOpen && (
                      <div style={{ padding: '12px', borderTop: `1px solid ${VS.border}`, background: VS.bg2, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={lbl}>Tone</label>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {['Authoritative', 'Conversational', 'Analytical', 'Punchy'].map(t => (
                              <button key={t} onClick={() => setTone(t)} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${tone === t ? VS.accent : VS.border}`, background: tone === t ? VS.accentGlow : 'transparent', color: tone === t ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: tone === t ? 600 : 400 }}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={lbl}>Format</label>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {['News Report', 'Opinion/Analysis', 'Explainer', 'Trend Piece'].map(m => (
                              <button key={m} onClick={() => setMood(m)} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${mood === m ? VS.accent : VS.border}`, background: mood === m ? VS.accentGlow : 'transparent', color: mood === m ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: mood === m ? 600 : 400 }}>{m}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={lbl}>Word count</label>
                            <input style={inp} type="number" value={wordCount} onChange={e => setWordCount(e.target.value)} min={200} max={2000} step={50} placeholder="~600" />
                          </div>
                          <div>
                            <label style={lbl}>Region</label>
                            <input style={inp} type="text" placeholder="e.g. Queensland" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={handleGenerate} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px', background: `linear-gradient(135deg, ${VS.accent}, ${VS.accentDim})`, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 14px rgba(255,128,0,0.2)', opacity: loading ? 0.5 : 1 }}>
                    Generate Articles
                  </button>
                </div>
              )}

              {/* ── By Topic mode ── */}
              {mode === 'categorical' && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: '6px' }}>Topics</div>
                  <p style={{ fontSize: '12px', color: VS.text2, marginBottom: '10px' }}>Up to 3 topics — BNA generates one article each.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '10px' }}>
                    {categories.map((cat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: VS.accent, background: VS.accentGlow, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
                        <input style={{ ...inp, flex: 1 }} value={cat} onChange={e => updateCategory(i, e.target.value)} placeholder={['e.g. Brisbane fintech raises Q1 2025', 'e.g. QLD construction M&A activity', 'e.g. ASX health tech expanding to US'][i]} />
                      </div>
                    ))}
                  </div>

                  <div style={{ border: `1px solid ${VS.border}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '8px' }}>
                    <button onClick={() => setWlOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', background: VS.bg1, border: 'none', color: wlOpen ? VS.accent : VS.text2, cursor: 'pointer', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronRight size={11} style={{ transform: wlOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        Source whitelist
                      </span>
                      <span style={{ fontSize: '9px', color: whitelist.trim() ? VS.accent : VS.text2, fontWeight: 400 }}>
                        {whitelist.trim() ? `${whitelist.split('\n').filter(Boolean).length} domain(s)` : 'No restrictions'}
                      </span>
                    </button>
                    {wlOpen && (
                      <div style={{ padding: '12px', borderTop: `1px solid ${VS.border}`, background: VS.bg2 }}>
                        <label style={lbl}>Allowed domains</label>
                        <textarea value={whitelist} onChange={e => setWhitelist(e.target.value)} rows={4} placeholder={'businessnewsaustralia.com\nafr.com\nsmartcompany.com.au'} style={{ ...inp, fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6, resize: 'vertical' }} />
                        <div style={{ fontSize: '9px', color: VS.text2, fontFamily: 'monospace', marginTop: '5px' }}>One domain per line. Leave blank for no restriction.</div>
                      </div>
                    )}
                  </div>

                  <div style={{ border: `1px solid ${VS.border}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '12px' }}>
                    <button onClick={() => setCatOptOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', background: VS.bg1, border: 'none', color: catOptOpen ? VS.accent : VS.text2, cursor: 'pointer', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronRight size={11} style={{ transform: catOptOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        Optional overrides
                      </span>
                      <span style={{ fontSize: '9px', color: VS.text2, fontWeight: 400 }}>BNA style by default</span>
                    </button>
                    {catOptOpen && (
                      <div style={{ padding: '12px', borderTop: `1px solid ${VS.border}`, background: VS.bg2, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={lbl}>Tone</label>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {['Authoritative', 'Conversational', 'Analytical', 'Punchy'].map(t => (
                              <button key={t} onClick={() => setTone(t)} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${tone === t ? VS.accent : VS.border}`, background: tone === t ? VS.accentGlow : 'transparent', color: tone === t ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: tone === t ? 600 : 400 }}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={lbl}>Format</label>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {['News Report', 'Opinion/Analysis', 'Explainer', 'Trend Piece'].map(m => (
                              <button key={m} onClick={() => setMood(m)} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${mood === m ? VS.accent : VS.border}`, background: mood === m ? VS.accentGlow : 'transparent', color: mood === m ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: mood === m ? 600 : 400 }}>{m}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={lbl}>Word count</label>
                            <input style={inp} type="number" value={catWordCount} onChange={e => setCatWordCount(e.target.value)} min={200} max={2000} step={50} placeholder="~600" />
                          </div>
                          <div>
                            <label style={lbl}>Region</label>
                            <input style={inp} type="text" value={catRegion} onChange={e => setCatRegion(e.target.value)} placeholder="e.g. Queensland" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={handleGenerate} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px', background: `linear-gradient(135deg, ${VS.accent}, ${VS.accentDim})`, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 14px rgba(255,128,0,0.2)', opacity: loading ? 0.5 : 1 }}>
                    Generate Articles
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Preview panel ─────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: results.length ? '#f0efe8' : VS.bg0, minWidth: 0, position: fullscreen ? 'fixed' : 'relative', inset: fullscreen ? 0 : undefined, zIndex: fullscreen ? 500 : undefined }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: results.length ? '#fff' : VS.bg1, borderBottom: `1px solid ${results.length ? '#ddd' : VS.border}`, flexShrink: 0, gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
              <button onClick={() => setFormCollapsed(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '5px', border: `1px solid ${results.length ? '#ddd' : VS.border}`, background: results.length ? '#f5f5f0' : VS.bg2, color: results.length ? '#666' : VS.text2, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace', flexShrink: 0 }}>
                {formCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
                {formCollapsed ? 'Show editor' : 'Hide editor'}
              </button>
              {results.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', overflow: 'auto', flexWrap: 'nowrap' }}>
                  {results.map((art, idx) => (
                    <button key={art.index ?? idx} onClick={() => setCurrentIdx(art.index ?? idx)}
                      style={{ fontFamily: 'monospace', fontSize: '10px', padding: '5px 12px', borderRadius: '5px', border: (art.index ?? idx) === currentIdx ? '1px solid #FF8000' : '1px solid #ddd', background: (art.index ?? idx) === currentIdx ? '#FF8000' : '#f5f5f0', color: (art.index ?? idx) === currentIdx ? '#fff' : '#666', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: (art.index ?? idx) === currentIdx ? 600 : 400 }}>
                      {art.topic || `Article ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {results.length > 0 && (
                <>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {(['preview', 'raw'] as const).map(v => (
                      <button key={v} onClick={() => setViewMode(v)}
                        style={{ fontFamily: 'monospace', fontSize: '10px', padding: '5px 12px', borderRadius: '5px', border: '1px solid #ddd', background: viewMode === v ? '#000' : '#f5f5f0', color: viewMode === v ? '#fff' : '#666', cursor: 'pointer' }}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button onClick={copyArticle} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', color: '#666', cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>
                    <Copy size={11} /> Copy
                  </button>
                  <button onClick={downloadArticle} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', color: '#666', cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>
                    <Download size={11} /> .txt
                  </button>
                </>
              )}
              <button onClick={() => setFullscreen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '5px', border: `1px solid ${results.length ? '#ddd' : VS.border}`, background: results.length ? '#fff' : VS.bg2, color: results.length ? '#666' : VS.text2, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace' }}>
                {fullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!results.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '60px 40px', textAlign: 'center', color: VS.text2, gap: '14px' }}>
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.25}>
                  <rect x="8" y="6" width="32" height="36" rx="3"/>
                  <line x1="14" y1="16" x2="34" y2="16"/>
                  <line x1="14" y1="22" x2="34" y2="22"/>
                  <line x1="14" y1="28" x2="26" y2="28"/>
                </svg>
                <h3 style={{ fontFamily: 'inherit', fontSize: '18px', color: VS.text1, fontWeight: 400, margin: 0 }}>No articles yet</h3>
                <p style={{ fontSize: '13px', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>Paste source URLs and click Generate — articles will follow the final_bna.md style guide exactly.</p>
              </div>
            ) : viewMode === 'raw' ? (
              <pre style={{ padding: '28px', fontFamily: 'monospace', fontSize: '12px', color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', minHeight: '100%', margin: 0 }}>
                {currentArticle?.articleText ?? ''}
              </pre>
            ) : currentArticle ? (
              <BnaPreview
                key={currentArticle.index ?? 0}
                article={currentArticle}
                imgSrc={imgSrcs[currentArticle.index ?? 0] ?? ''}
                onImgChange={(src) => setImgSrcs(m => ({ ...m, [currentArticle.index ?? 0]: src }))}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
