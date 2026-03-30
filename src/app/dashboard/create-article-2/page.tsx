'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, ChevronRight, Copy, Download, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';

const N8N_WEBHOOK = 'https://primary-s0q-production.up.railway.app/webhook/generate-articles';

const BNA_STYLE_PROFILE = `You are a journalist for Business News Australia (BNA), a digital-first Australian business news publication covering deals, capital raises, M&A, ASX-listed company results, startup funding rounds, regulatory enforcement, leadership changes, and founder profiles.

AUDIENCE: Business owners, investors, founders, fund managers, and commercially literate professionals. Readers understand EBITDA, NPAT, capital raises, and ASX mechanics. Do not over-explain financial concepts but define acronyms on first use.

TONE & VOICE: Factual, direct, authoritative, commercially literate, brisk, confident. Let numbers and quotes carry the weight — not editorial adjectives. No press release language ("thrilled to announce"). No tabloid drama. No editorial opinion in the reporter's voice.

HEADLINE FORMULA: [Company] + [active verb] + [object/outcome] + [dollar figure or context]
- Company name leads or appears within first three words. Never start a headline with "The".
- Brand-name hook: lead with the consumer brand before the corporate parent (e.g. "Boost Juice owner RFG acquires..." not "Retail Food Group acquires Boost Juice...")
- Preferred verbs — Deals: raises, secures, acquires, snaps up, snares, bags, offloads, strikes, seals | Growth: expands, launches, boosts, surges, deepens, widens | Decline: slumps, plunges, collapses, holds stubbornly | Leadership: appoints, names, steps down | Regulatory: sues, fines, slaps, hits with
- FORBIDDEN weak headline verbs: stuck, remains, continues, sees, faces, gets, shows, finds — these describe states, not actions
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

ARTICLE STRUCTURE — follow this exact order every time:
1. LEDE (1 sentence) — who + what + the single most important statistic + why it matters. Lead with the number. Never open with a quote. Never use passive voice. Present perfect tense.
2. KEY DATA BLOCK (1–2 paragraphs) — unpack the core statistics. Factual only — no editorialising.
3. FIRST QUOTE — most senior source (CEO, lead author, founder). Always "says" — NEVER "said". Quote first, then attribution.
4. SUPPORTING DATA (1–2 paragraphs) — job creation figures, sector breakdown, FY references. Spell out numbers in body: "83 million", "40 per cent".
5. WAGE & DEMOGRAPHIC ANALYSIS (1–2 paragraphs) — graduate wage premium, gender pay gap, median age comparisons. Weave global context in here — do not save it for the end.
6. SECOND QUOTE — practitioner or secondary source. Same "says" rule applies.
7. ROOT CAUSE ANALYSIS — structural explanation of why the problem exists. Industry comparisons, market dynamics.
8. SUPPLY-SIDE PROBLEMS — education infrastructure, institution growth, training quality issues where relevant.
9. POLICY RESPONSE — government schemes and what authorities are doing (include only if present in source).
10. CLOSING — end on a forward-looking quote, a final financial metric, or a thematic callback. NEVER write a summary conclusion paragraph.

QUOTES & ATTRIBUTION:
- *** CRITICAL *** "says" (present tense) is the standard attribution verb for all quotes from living, named sources in the article — use it by default
- "said" or "wrote" ONLY for: historical quotes from deceased individuals, court transcripts, or quotes explicitly framed as past statements in the source
- Using "said" where "says" is correct is a critical style error — treat it as forbidden in standard reporting
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
- DEFAULT word count: 600 words. Do not exceed unless wordCount parameter is explicitly set higher in the request.

MONEY & NUMBERS:
- Body text: "$49 million", "$1.2 billion", "42 per cent" (spelled out, two words)
- Headlines: "$49m", "$1.2b", "42pc"
- Always "$" symbol — never spell out "dollars"
- "per cent" always two words in body — never "%"
- Foreign currency: always include AUD conversion in parentheses on first mention — e.g. US$33 million ($49 million). If exact rate is unavailable, use "approximately".
- Financial years: FY24, FY25 (no full stops)
- Share prices include timestamp: "at 11.39am (AEDT)" — the time and timezone are mandatory
- Numbers one to nine spelled out in body; 10+ as numerals

LOCATION:
- "[City]-based" always hyphenated as adjective before company name on first mention
- Never "located in" or "based out of"
- State names spelled out in body (Queensland not QLD)
- International companies: "Canadian multinational Brookfield", "French investment group Mirova"

WORDS TO AVOID:
- "utilise" and "utilising" — always replace with "use" and "using". No exceptions.
- "leverage" as verb | "going forward" (use specific timeframes)
- "according to" (use direct attribution with "says")
- "announced today that" (write the action directly)
- "It is worth noting that" | "In order to" (use "to")
- Passive voice in ledes
- American spellings (organisation not organization; recognise not recognize)
- Editorialising adjectives in reporter's voice: amazing, incredible, exciting, game-changing, groundbreaking, revolutionary
- "very" as intensifier | "stakeholders" in editorial copy | "reportedly" without specific source attribution
- "%" symbol in body text
- Apostrophes used to form plurals — always write CEOs not CEO's, PoPs not PoP's

SOURCE MATERIAL HYGIENE:
When source material contains any of the following, ignore it entirely — use only the main article body:
- Navigation menus, header links, breadcrumb trails
- Sidebar content, "Latest News" or "Related Articles" lists
- Footer links, copyright notices, cookie banners
- Social share buttons, author bios appended at the end
If multiple sources are provided, cross-reference facts but never blend navigation or sidebar noise.

HEADLINE VERBS:
Use strong, precise active verbs that convey momentum, consequence, or action.
- Preferred: unveils, secures, raises, acquires, launches, deepens, widens, strikes, holds stubbornly, surges, expands, slashes, offloads, bags, sues, fines, plunges, collapses
- Banned weak verbs: stuck, shows, remains, continues, sees, faces, gets, looks, comes, goes, finds, hits (unless describing a target/record)

ONE STORY PER ARTICLE:
- Each article covers one company or one event only. Never combine two unrelated company stories.
- If source material contains news about multiple companies, write about the primary company only.
- Never append secondary company news under headings like "In a separate development".

LEDE STATISTIC RULE:
The first sentence must contain the single most important statistic or fact from the source. Never open with a report citation, publication name, or broad context statement. "A new report by X finds that..." is forbidden as an opening.

WHAT BNA NEVER DOES:
- Opens a lede or headline with "The"
- Opens an article with a quote — lede is always journalist prose
- Uses "said" for live/current quotes (always "says")
- Uses the % symbol in body text — always "per cent"
- Uses passive voice in ledes
- Writes a summary conclusion paragraph — any paragraph containing "represents...", "underscores...", "demonstrates...", "This marks...", "This signals..." must be deleted and replaced with a forward-looking quote or financial metric
- Uses editorialising verbs like "underscores", "demonstrates", "proves", "highlights", "reveals", "represents", "signals", "marks" in reporter voice
- Uses exclamation marks in editorial copy
- Omits ASX ticker on first mention of a listed company
- Omits city-based descriptor on first mention of a company
- Uses American spellings
- Uses "utilise", "leverage" (as verb), "going forward", "in order to"
- Generates or infers quotes not present in the source document
- Invents human interest case studies, personal anecdotes, or named individuals not present in the source material
- Writes paragraphs longer than 4 sentences
- Exceeds 600 words unless a higher wordCount is explicitly passed in the request
- Opens paragraph 2 with a report citation instead of statistics
- Uses apostrophes to form plurals (CEO's, PoP's) — always plain plurals (CEOs, PoPs)
- Omits the time and timezone from a share price note — always ends with "at [time] (AEDT/AEST)"
- Combines two unrelated company stories into one article
- Mentions a foreign currency without an AUD conversion on first mention`;

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
      {/* BNA Header */}
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

      {/* Article body */}
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

          {/* Image area */}
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
                <input
                  value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { onImgChange(urlInput); setUrlBarOpen(false); setUrlInput(''); } }}
                  placeholder="Paste image URL…"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px', padding: '5px 9px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  autoFocus
                />
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

          {/* Article body */}
          <div
            className="bna-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
            style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#656565', lineHeight: 1.72 }}
          />
        </div>

        {/* Sidebar */}
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
export default function CreateArticle2Page() {
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

  // ── Loading ticker ──────────────────────────────────────
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

  // ── Article input helpers ───────────────────────────────
  const addArticle      = () => setArticles(a => [...a, { topic: '', sources: [''] }]);
  const removeArticle   = (i: number) => setArticles(a => a.filter((_, j) => j !== i));
  const updateTopic     = (i: number, v: string) => setArticles(a => a.map((art, j) => j === i ? { ...art, topic: v } : art));
  const addSource       = (i: number) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: [...art.sources, ''] } : art));
  const removeSource    = (i: number, si: number) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: art.sources.filter((_, k) => k !== si) } : art));
  const updateSource    = (i: number, si: number, v: string) => setArticles(a => a.map((art, j) => j === i ? { ...art, sources: art.sources.map((s, k) => k === si ? v : s) } : art));
  const updateCategory  = (i: number, v: string) => setCategories(c => c.map((cat, j) => j === i ? v : cat));

  // ── Generate — posts directly to n8n ───────────────────
  const handleGenerate = async () => {
    setError('');

    if (mode === 'editor') {
      const hasSource = articles.some(a => a.sources.some(s => s.trim()));
      if (!hasSource) { setError('Please provide at least one source URL.'); return; }
    } else {
      if (!categories.some(c => c.trim())) { setError('Please provide at least one topic.'); return; }
    }

    startLoading();
    try {
      let payload: object;

      if (mode === 'editor') {
        const arts = articles
          .map(a => ({ sources: a.sources.filter(s => s.trim()), topic: a.topic.trim() }))
          .filter(a => a.sources.length > 0);
        payload = {
          articles: arts,
          tone, mood,
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

  // ── Shared input style ──────────────────────────────────
  const inp: React.CSSProperties = { background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '8px 11px', color: VS.text0, fontFamily: 'inherit', fontSize: '13px', width: '100%', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '9px', fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px' };

  return (
    <>
      {/* Loading overlay */}
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

              {/* Mode tabs */}
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

                  {/* Options accordion */}
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

                  {/* Whitelist accordion */}
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

                  {/* Cat options accordion */}
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

          {/* Preview toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: results.length ? '#fff' : VS.bg1, borderBottom: `1px solid ${results.length ? '#ddd' : VS.border}`, flexShrink: 0, gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
              {/* Collapse toggle */}
              <button onClick={() => setFormCollapsed(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '5px', border: `1px solid ${results.length ? '#ddd' : VS.border}`, background: results.length ? '#f5f5f0' : VS.bg2, color: results.length ? '#666' : VS.text2, cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace', flexShrink: 0 }}>
                {formCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
                {formCollapsed ? 'Show editor' : 'Hide editor'}
              </button>
              {/* Article tabs */}
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

          {/* Preview content */}
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
                <p style={{ fontSize: '13px', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>Paste source URLs and click Generate — n8n will scrape and rewrite them in BNA style.</p>
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
