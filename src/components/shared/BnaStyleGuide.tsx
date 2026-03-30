'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg2: '#2d2d2d',
  text0: '#f0f0f0', text2: '#909090',
};

export default function BnaStyleGuide({ accent = '#FF8000' }: { accent?: string }) {
  const [open, setOpen] = useState<string[]>(['headlines', 'lede', 'structure', 'quotes', 'numbers', 'never']);

  const toggle = (key: string) =>
    setOpen(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const S: React.CSSProperties = { padding: '16px 20px', borderBottom: '1px solid #2a2a2a', fontSize: '12px', lineHeight: 1.7, color: '#c8c8c8' };
  const H: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 20px', background: 'none', border: 'none', borderBottom: '1px solid #2a2a2a', cursor: 'pointer', textAlign: 'left' };

  const Tag = ({ c, children }: { c: string; children: React.ReactNode }) => (
    <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', background: `${c}18`, border: `1px solid ${c}44`, color: c, marginRight: '4px', marginBottom: '3px' }}>{children}</span>
  );
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', gap: '10px', paddingBottom: '5px', borderBottom: '1px solid #2a2a2a', marginBottom: '5px' }}>
      <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '10px', minWidth: '130px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#c8c8c8', fontSize: '11px' }}>{value}</span>
    </div>
  );

  const sections: { key: string; title: string; content: React.ReactNode }[] = [
    {
      key: 'headlines',
      title: '📰 Headline Formula',
      content: (
        <div>
          <p style={{ marginBottom: '10px', color: '#aaa', fontSize: '11px' }}>Pattern: <strong style={{ color: '#fff' }}>[Company] + [active verb] + [object] + [dollar figure / context]</strong></p>
          <p style={{ marginBottom: '8px', fontSize: '11px', color: '#888' }}>Numbers: <code style={{ color: '#dcdcaa' }}>$49m</code> · <code style={{ color: '#dcdcaa' }}>$1.2b</code> · <code style={{ color: '#dcdcaa' }}>42pc</code> (never % in headlines)</p>
          <div style={{ marginBottom: '12px' }}>
            {[
              { label: 'Deals',      verbs: 'raises, secures, acquires, snaps up, snares, bags, offloads, strikes, seals' },
              { label: 'Growth',     verbs: 'expands, launches, boosts, hits, surges, storms back, fires up' },
              { label: 'Decline',    verbs: 'slumps, plunges, falls, collapses, enters administration' },
              { label: 'Leadership', verbs: 'appoints, names, steps down, quits, resigns, sacks' },
              { label: 'Regulatory', verbs: 'sues, fines, slaps, hits with, takes to court' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: '6px', fontSize: '11px' }}>
                <span style={{ color: accent, fontFamily: 'monospace', fontSize: '10px', marginRight: '8px' }}>{r.label}</span>
                <span style={{ color: '#aaa' }}>{r.verbs}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>Never start with "The". Brand-name hook: lead with the consumer brand before the corporate parent.</p>
        </div>
      ),
    },
    {
      key: 'lede',
      title: '✍️ Lede Formula',
      content: (
        <div>
          <div style={{ background: '#1a2a1a', border: '1px solid #2d4a2d', borderRadius: '6px', padding: '12px', marginBottom: '12px', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.8, color: '#90ee90' }}>
            [City]-based [Company] (ASX: XXX) has [verb] [$amount] to [purpose].
          </div>
          {[
            ['City descriptor',  '"Melbourne-based", "Sydney-headquartered", "Brisbane-founded" — always hyphenated, always first'],
            ['ASX ticker',       '(ASX: XXX) immediately after company name — first mention only'],
            ['Tense',            'Present perfect: "has raised", "has secured", "has acquired"'],
            ['Dollar figure',    'Always in the lede when the story involves money'],
            ['Prior context',    '"The news comes X months after…" — mandatory when prior coverage supplied'],
            ['Never',            '"Today" or "SYDNEY —" as standalone dateline; passive voice; lede opening with a quote'],
          ].map(([k, v]) => <Row key={k} label={k} value={v} />)}
        </div>
      ),
    },
    {
      key: 'structure',
      title: '🏗️ Article Structure',
      content: (
        <div>
          {[
            ['1. Lede',               'Who + what + how much + why it matters (1 sentence)'],
            ['2. Deal mechanics',      'Terms, structure, pricing, conditions, parties (1–3 ¶)'],
            ['3. Company background',  'Founded when, by whom, key metrics (1–2 ¶)'],
            ['4. First quote — CEO',   'Strategic rationale, vision (paragraphs 3–7)'],
            ['5. Financial detail',    'Revenue, EBITDA, prior raises, growth rates (2–4 ¶)'],
            ['6. Secondary quotes',    'Investor, partner, regulator (1–3 ¶)'],
            ['7. Market context',      'Industry trends, comparable deals (1–2 ¶)'],
            ['8. Forward-looking close','Next steps, timeline, guidance (1 ¶)'],
            ['9. Share price note',    '"Shares in X were trading Y per cent higher/lower at $Z.ZZ at [time] (AEST)."'],
          ].map(([k, v]) => <Row key={k} label={k} value={v} />)}
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
            <p><strong style={{ color: '#c8c8c8' }}>No subheadings</strong> in standard news. No summary conclusion. No bullet points (except reproducing official lists).</p>
            <p style={{ marginTop: '6px' }}><strong style={{ color: '#c8c8c8' }}>Word count:</strong> Standard 400–900w · Complex M&A/regulatory 800–1,200w · Brief update 200–400w</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quotes',
      title: '💬 Quotes & Attribution',
      content: (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <Tag c="#4ec9b0">says</Tag><span style={{ fontSize: '11px', color: '#aaa' }}>— default for live/original interview content (present tense)</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Tag c="#dcdcaa">said</Tag><span style={{ fontSize: '11px', color: '#aaa' }}>— from press releases, ASX announcements, written documents</span>
          </div>
          <p style={{ fontSize: '11px', marginBottom: '8px', color: '#aaa' }}>Format: quote first, then attribution — <span style={{ color: '#c8c8c8', fontStyle: 'italic' }}>&ldquo;&lsquo;Quote here,&rsquo; says CEO Full Name.&rdquo;</span></p>
          <p style={{ fontSize: '11px', marginBottom: '8px', color: '#aaa' }}>Subsequent quotes from same person: surname only — <span style={{ color: '#c8c8c8', fontStyle: 'italic' }}>Smith adds.</span></p>
          <p style={{ fontSize: '11px', marginBottom: '8px', color: '#888' }}>Exclusive interview: <span style={{ color: '#c8c8c8' }}>tells Business News Australia</span></p>
          <p style={{ fontSize: '11px', marginBottom: '8px', color: '#888' }}>No response: <span style={{ color: '#c8c8c8' }}>Business News Australia has sought comment from [company]</span></p>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
            <strong style={{ color: '#c8c8c8' }}>Quote order:</strong> CEO/founder → investor → counterparty → regulator → board chair
          </div>
          <div style={{ fontSize: '11px', color: '#f44747', marginTop: '8px' }}>
            Never use: stated · commented · remarked · opined · shared · claimed (unless disputed)
          </div>
        </div>
      ),
    },
    {
      key: 'numbers',
      title: '🔢 Numbers & Formatting',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
            {[
              ['Body — millions',       '$49 million'],
              ['Body — billions',       '$1.2 billion'],
              ['Body — percent',        '42 per cent (never %)'],
              ['Headline — millions',   '$49m'],
              ['Headline — billions',   '$1.2b'],
              ['Headline — percent',    '42pc'],
              ['USD conversion',        'US$33 million ($49 million)'],
              ['Share price',           '$4.55 or 93.5c'],
              ['Financial year',        'FY24, FY25 (no full stops)'],
              ['Share price timestamp', 'at 11.39am (AEDT)'],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: '10px', padding: '5px 8px', background: '#2a2a2a', borderRadius: '4px' }}>
                <div style={{ color: '#666', fontFamily: 'monospace', marginBottom: '2px' }}>{k}</div>
                <div style={{ color: '#dcdcaa' }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#888' }}>City: always hyphenated — "Melbourne-based" · "Sydney-headquartered" · "Brisbane-founded"</p>
          <p style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>ASX code: (ASX: XXX) on first mention only — never in headlines</p>
        </div>
      ),
    },
    {
      key: 'never',
      title: '🚫 What BNA Never Does',
      content: (
        <div>
          {[
            'Opens a lede or headline with "The"',
            'Opens an article with a quote — lede is always journalist prose',
            'Uses "said" for live/current quotes (always "says")',
            'Uses the % symbol in body text — always "per cent"',
            'Uses passive voice in ledes',
            'Writes a summary conclusion paragraph — end on quote, fact, or share price',
            'Uses exclamation marks in editorial copy',
            'Omits ASX ticker on first mention of a listed company',
            'Omits city-based descriptor on first mention of a company',
            'Uses American spellings (organisation, recognise, not -ize)',
            'Uses "utilise", "leverage" (as verb), "going forward", "in order to"',
            'Uses editorialising adjectives ("amazing", "game-changing") in reporter voice',
            'Generates or infers quotes not present in the source document',
            'Uses anonymous sources as standard practice',
            'Writes paragraphs longer than 4 sentences',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', paddingBottom: '5px', marginBottom: '5px', borderBottom: '1px solid #2a2a2a', fontSize: '11px' }}>
              <span style={{ color: '#f44747', flexShrink: 0 }}>✗</span>
              <span style={{ color: '#c8c8c8' }}>{rule}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: VS.bg0, minHeight: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: VS.text0 }}>BNA Style Guide</span>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: VS.text2, background: VS.bg2, padding: '2px 8px', borderRadius: '4px' }}>Quick Reference</span>
      </div>
      {sections.map(sec => (
        <div key={sec.key} style={{ borderBottom: '1px solid #2a2a2a' }}>
          <button onClick={() => toggle(sec.key)} style={{ ...H, color: open.includes(sec.key) ? VS.text0 : VS.text2, fontWeight: open.includes(sec.key) ? 600 : 400, fontSize: '12px' }}>
            {sec.title}
            <ChevronRight size={12} style={{ transform: open.includes(sec.key) ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: VS.text2, flexShrink: 0 }} />
          </button>
          {open.includes(sec.key) && <div style={S}>{sec.content}</div>}
        </div>
      ))}
    </div>
  );
}
