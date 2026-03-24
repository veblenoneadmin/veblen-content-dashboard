'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDashboard } from '@/lib/store';
import { NewsSourceConfig, NewsItem } from '@/lib/types';
import {
  Search, ThumbsUp, Clock, Plus, X, ArrowUpDown, ExternalLink,
  List, LayoutGrid, Grid3x3, FileText, Loader2, Copy, ChevronRight,
  Globe, Webhook, KeyRound, CheckCircle2, AlertCircle,
} from 'lucide-react';

type SortOption = 'newest' | 'upvotes';
type ViewMode   = 'list' | '2col' | '3col';

// ── VS Dark palette ────────────────────────────────────────
const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', accentGlow: 'rgba(0,122,204,0.12)',
  error: '#f44747',
};

const LOADING_MSGS = [
  ['Connecting to engine…', 'Establishing pipeline'],
  ['Fetching source URLs…', 'Reaching out to sources'],
  ['Scraping article data…', 'Extracting text and metadata'],
  ['Preparing prompt…', 'Applying style guide'],
  ['AI is writing…', 'Generating original BNA-style content'],
  ['Refining structure…', 'Polishing lede and flow'],
  ['Quality check…', 'Verifying BNA style compliance'],
  ['Finalizing output…', 'Packaging articles'],
  ['Almost there…', 'Applying final formatting'],
];

type ArticleResult = { index: number; topic: string; articleText: string };

// ── Create Article Modal ───────────────────────────────────
function CreateArticleModal({ initialUrls, onClose }: { initialUrls: string[]; onClose: () => void }) {
  const [tone, setTone]       = useState('Authoritative');
  const [mood, setMood]       = useState('News Report');
  const [topic, setTopic]     = useState('');
  const [sources, setSources] = useState<string[]>(initialUrls.length ? initialUrls : ['']);
  const [wordCount, setWordCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [results, setResults] = useState<ArticleResult[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError]     = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const inp: React.CSSProperties = { background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '8px 11px', color: VS.text0, fontFamily: 'inherit', fontSize: '13px', width: '100%', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '9px', fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase' as const, letterSpacing: '1.2px', marginBottom: '4px' };

  const startLoading = useCallback(() => {
    setLoading(true); setLoadingMsg(0); let i = 0;
    timerRef.current = setInterval(() => {
      i = i >= LOADING_MSGS.length - 1 ? LOADING_MSGS.length - 3 : i + 1;
      setLoadingMsg(i);
    }, 4000);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleGenerate = async () => {
    setError('');
    const validSources = sources.filter(s => s.trim());
    if (!validSources.length) { setError('Please provide at least one source URL.'); return; }
    startLoading();
    try {
      // Resolve redirect URLs (e.g. Google News proxy links) before sending to n8n
      const resolvedSources = await Promise.all(
        validSources.map(async (url) => {
          if (!url.includes('news.google.com') && !url.includes('rss/articles')) return url;
          try {
            const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            return data.url ?? url;
          } catch { return url; }
        })
      );

      const payload = {
        articles: [{ sources: resolvedSources, topic: topic.trim() }],
        tone, mood,
        ...(wordCount ? { wordCount: parseInt(wordCount) } : {}),
      };
      const res  = await fetch('/api/generate-articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || `HTTP ${res.status}`); return; }
      const articles = Array.isArray(data) ? data : (data.articles ?? data.results ?? []);
      if (!articles.length) { setError(`No articles returned. URLs sent: ${resolvedSources.join(', ')}`); return; }
      setResults(articles);
      setCurrentIdx(articles[0].index ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      stopLoading();
    }
  };

  const current = results.find(a => a.index === currentIdx);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '960px', maxHeight: '90vh', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${VS.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={15} style={{ color: VS.accent }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: VS.text0 }}>Create Article</span>
            <span style={{ fontSize: '11px', color: VS.text2, fontFamily: 'monospace' }}>{sources.filter(s => s.trim()).length} source{sources.filter(s => s.trim()).length !== 1 ? 's' : ''} loaded</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.text0}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left — form */}
          <div style={{ width: '360px', minWidth: '360px', borderRight: `1px solid ${VS.border}`, overflowY: 'auto', padding: '18px', background: VS.bg1 }}>
            {error && (
              <div style={{ background: 'rgba(244,71,71,0.08)', border: '1px solid rgba(244,71,71,0.2)', color: VS.error, padding: '9px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}>
                {error}
              </div>
            )}

            {/* Tone */}
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Tone</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['Authoritative', 'Conversational', 'Analytical', 'Punchy'].map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${tone === t ? VS.accent : VS.border}`, background: tone === t ? VS.accentGlow : 'transparent', color: tone === t ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: tone === t ? 600 : 400 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Format</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['News Report', 'Opinion/Analysis', 'Explainer', 'Trend Piece'].map(m => (
                  <button key={m} onClick={() => setMood(m)}
                    style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${mood === m ? VS.accent : VS.border}`, background: mood === m ? VS.accentGlow : 'transparent', color: mood === m ? VS.accent : VS.text2, fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', fontWeight: mood === m ? 600 : 400 }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic / angle */}
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Angle (optional)</label>
              <input style={inp} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Focus on funding implications" />
            </div>

            {/* Word count */}
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Word count (optional)</label>
              <input style={inp} value={wordCount} onChange={e => setWordCount(e.target.value)} placeholder="e.g. 600" type="number" min={100} max={3000} />
            </div>

            {/* Source URLs */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Source URLs</label>
                <button onClick={() => setSources(s => [...s, ''])}
                  style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontFamily: 'monospace', color: VS.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Plus size={11} />Add URL
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sources.map((src, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      style={{ ...inp, flex: 1 }}
                      value={src}
                      onChange={e => setSources(s => s.map((x, j) => j === i ? e.target.value : x))}
                      placeholder="https://..."
                    />
                    {sources.length > 1 && (
                      <button onClick={() => setSources(s => s.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, display: 'flex', flexShrink: 0, padding: '4px' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.error}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', padding: '10px', background: VS.accent, border: 'none', borderRadius: '7px', color: '#fff', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Generating…</> : <><ChevronRight size={14} />Generate Article</>}
            </button>
          </div>

          {/* Right — result */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px', background: VS.bg0 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <Loader2 size={32} style={{ color: VS.accent, animation: 'spin 1s linear infinite' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', color: VS.text1 }}>{LOADING_MSGS[loadingMsg][0]}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: VS.text2, marginTop: '4px' }}>{LOADING_MSGS[loadingMsg][1]}</div>
                </div>
              </div>
            ) : current ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', color: VS.text2, fontFamily: 'monospace' }}>Generated article</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(current.articleText)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', color: VS.text1, fontSize: '11px', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = VS.accent}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = VS.border}
                  >
                    <Copy size={12} />Copy
                  </button>
                </div>
                <pre style={{ fontFamily: 'inherit', fontSize: '13px', color: VS.text1, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {current.articleText}
                </pre>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: VS.text2 }}>
                <FileText size={32} style={{ opacity: 0.2 }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Your generated article will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Add Source Modal ───────────────────────────────────────
type SourceType = 'url' | 'api' | 'webhook';

const SOURCE_TYPES: { value: SourceType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'url',     label: 'URL',     icon: Globe,   desc: 'RSS feed or JSON feed URL' },
  { value: 'api',     label: 'API',     icon: KeyRound, desc: 'REST API endpoint returning articles' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, desc: 'Receive articles via POST webhook' },
];

function AddSourceModal({ onAdd, onClose }: {
  onAdd: (config: NewsSourceConfig) => void;
  onClose: () => void;
}) {
  const [name, setName]         = useState('');
  const [type, setType]         = useState<SourceType>('url');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey]     = useState('');
  const [status, setStatus]     = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg]     = useState('');

  const webhookId = useRef(`wh_${Math.random().toString(36).slice(2, 10)}`);
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/${webhookId.current}`
    : `/api/webhook/${webhookId.current}`;

  const canSave = name.trim() && (type === 'webhook' || endpoint.trim());

  const handleTest = async () => {
    if (!endpoint.trim()) return;
    setStatus('testing'); setErrMsg('');
    try {
      const params = new URLSearchParams({ url: endpoint, name: name || 'Test', ...(apiKey ? { apiKey } : {}) });
      const res  = await fetch(`/api/fetch-feed?${params}`);
      const data = await res.json();
      if (data.error) { setStatus('error'); setErrMsg(data.error); }
      else { setStatus('ok'); }
    } catch (e) {
      setStatus('error'); setErrMsg(String(e));
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    const config: NewsSourceConfig = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      ...(type !== 'webhook' && endpoint.trim() ? { endpoint: endpoint.trim() } : {}),
      ...(type === 'api' && apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      ...(type === 'webhook' ? { webhookId: webhookId.current } : {}),
    };
    onAdd(config);
    onClose();
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 11px', background: VS.bg2,
    border: `1px solid ${VS.border}`, borderRadius: '7px',
    color: VS.text0, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '10px', color: VS.text2,
    fontWeight: 600, letterSpacing: '0.05em', marginBottom: '5px',
    textTransform: 'uppercase' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${VS.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={15} style={{ color: VS.accent }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: VS.text0 }}>Add Source</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.text0}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
          ><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Name */}
          <div>
            <label style={lbl}>Source name</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. TechCrunch" autoFocus />
          </div>

          {/* Type selector */}
          <div>
            <label style={lbl}>Source type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {SOURCE_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => { setType(value); setStatus('idle'); setErrMsg(''); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '12px 8px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${type === value ? VS.accent : VS.border}`,
                    background: type === value ? VS.accentGlow : VS.bg2,
                    color: type === value ? VS.accent : VS.text2,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.3, color: type === value ? VS.accent : VS.text2, opacity: 0.8 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific inputs */}
          {type === 'url' && (
            <div>
              <label style={lbl}>Feed URL</label>
              <input style={inp} value={endpoint} onChange={e => { setEndpoint(e.target.value); setStatus('idle'); }} placeholder="https://example.com/rss.xml" />
            </div>
          )}

          {type === 'api' && (
            <>
              <div>
                <label style={lbl}>API Endpoint</label>
                <input style={inp} value={endpoint} onChange={e => { setEndpoint(e.target.value); setStatus('idle'); }} placeholder="https://api.example.com/articles" />
              </div>
              <div>
                <label style={lbl}>API Key <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input style={inp} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Bearer token or API key" type="password" />
              </div>
            </>
          )}

          {type === 'webhook' && (
            <div>
              <label style={lbl}>Your Webhook URL</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1, color: VS.text2, fontSize: '12px', fontFamily: 'monospace' }} value={webhookUrl} readOnly />
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  style={{ flexShrink: 0, padding: '8px 12px', background: VS.bg3, border: `1px solid ${VS.border}`, borderRadius: '7px', color: VS.text1, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} />Copy
                </button>
              </div>
              <p style={{ fontSize: '11px', color: VS.text2, marginTop: '8px', lineHeight: 1.5 }}>
                POST <code style={{ background: VS.bg3, padding: '1px 5px', borderRadius: '3px' }}>{'{ title, summary, url }'}</code> to this endpoint to push items into your feed.
              </p>
            </div>
          )}

          {/* Test result */}
          {status === 'testing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: VS.text2 }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />Testing connection…
            </div>
          )}
          {status === 'ok' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4ec9b0' }}>
              <CheckCircle2 size={14} />Connection successful — feed is reachable
            </div>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: VS.error }}>
              <AlertCircle size={14} />{errMsg || 'Could not reach the feed'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 20px', borderTop: `1px solid ${VS.border}`, justifyContent: 'flex-end' }}>
          {type !== 'webhook' && (
            <button
              onClick={handleTest}
              disabled={!endpoint.trim() || status === 'testing'}
              style={{ padding: '8px 14px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '8px', color: VS.text1, fontSize: '12px', cursor: endpoint.trim() ? 'pointer' : 'not-allowed', opacity: endpoint.trim() ? 1 : 0.5 }}
            >
              Test connection
            </button>
          )}
          <button onClick={onClose} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${VS.border}`, borderRadius: '8px', color: VS.text2, fontSize: '12px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{ padding: '8px 16px', background: canSave ? VS.accent : VS.bg3, border: 'none', borderRadius: '8px', color: canSave ? '#fff' : VS.text2, fontSize: '12px', fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { if (canSave) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Add source
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── News Page ──────────────────────────────────────────────
export default function NewsPage() {
  const { newsItems, newsSources, newsSourceConfigs, addNewsSourceConfig, removeNewsSource } = useDashboard();
  const [search, setSearch]             = useState('');
  const [sourceTab, setSourceTab]       = useState('All');
  const [sort, setSort]                 = useState<SortOption>('newest');
  const [onlyWithUpvotes, setOnlyWithUpvotes] = useState(false);
  const [onlyWithLink, setOnlyWithLink] = useState(false);
  const [view, setView]                 = useState<ViewMode>('list');
  const [showAddSource, setShowAddSource] = useState(false);
  const [fetchedItems, setFetchedItems] = useState<NewsItem[]>([]);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [showModal, setShowModal]       = useState(false);

  // Fetch items from URL/API sources whenever configs change
  useEffect(() => {
    const urlSources = newsSourceConfigs.filter(c => (c.type === 'url' || c.type === 'api') && c.endpoint);
    if (!urlSources.length) return;
    let cancelled = false;
    Promise.all(urlSources.map(async s => {
      try {
        const params = new URLSearchParams({ url: s.endpoint!, name: s.name, ...(s.apiKey ? { apiKey: s.apiKey } : {}) });
        const res  = await fetch(`/api/fetch-feed?${params}`);
        const data = await res.json();
        return (data.items ?? []) as NewsItem[];
      } catch { return []; }
    })).then(results => {
      if (!cancelled) setFetchedItems(results.flat());
    });
    return () => { cancelled = true; };
  }, [newsSourceConfigs]);

  const handleAddConfig = (config: NewsSourceConfig) => {
    addNewsSourceConfig(config);
  };

  const handleRemoveSource = (source: string) => {
    if (sourceTab === source) setSourceTab('All');
    removeNewsSource(source);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeFilterCount = [sort !== 'newest', onlyWithUpvotes, onlyWithLink].filter(Boolean).length;

  const allItems = [...newsItems, ...fetchedItems];

  let filtered = allItems.filter(item => {
    if (search.trim() && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceTab !== 'All' && item.source !== sourceTab) return false;
    if (onlyWithUpvotes && !item.upvotes) return false;
    if (onlyWithLink && !item.url) return false;
    return true;
  });
  if (sort === 'upvotes') filtered = [...filtered].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  const selectedUrls = allItems
    .filter(n => selected.has(n.id) && n.url)
    .map(n => n.url as string);

  return (
    <>
      {showModal && (
        <CreateArticleModal
          initialUrls={selectedUrls}
          onClose={() => setShowModal(false)}
        />
      )}
      {showAddSource && (
        <AddSourceModal
          onAdd={handleAddConfig}
          onClose={() => setShowAddSource(false)}
        />
      )}

      <div>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Industry News</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
              {filtered.length} of {allItems.length} items
              {selected.size > 0 && <span style={{ marginLeft: '10px', color: 'var(--accent)', fontWeight: 600 }}>· {selected.size} selected</span>}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <span style={{ padding: '6px 8px 6px 10px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', borderRight: '1px solid var(--border)' }}>
                <ArrowUpDown size={11} />Sort
              </span>
              {(['newest', 'upvotes'] as SortOption[]).map((opt, i, arr) => (
                <button key={opt} onClick={() => setSort(opt)}
                  style={{ padding: '6px 10px', background: sort === opt ? 'var(--accent-tint)' : 'transparent', border: 'none', color: sort === opt ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px', fontWeight: sort === opt ? 600 : 400, cursor: 'pointer', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {opt === 'newest' ? 'Newest' : 'Most upvotes'}
                </button>
              ))}
            </div>

            <FilterPill label="Has upvotes" active={onlyWithUpvotes} onClick={() => setOnlyWithUpvotes(v => !v)} />
            <FilterPill label="Has link"    active={onlyWithLink}    onClick={() => setOnlyWithLink(v => !v)} />

            {activeFilterCount > 0 && (
              <button onClick={() => { setSort('newest'); setOnlyWithUpvotes(false); setOnlyWithLink(false); }}
                style={{ padding: '5px 10px', background: 'rgba(244,71,71,0.1)', border: '1px solid rgba(244,71,71,0.25)', borderRadius: '8px', color: '#f44747', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>
                Clear ({activeFilterCount})
              </button>
            )}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

            {/* View toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {([['list', List, 'List'], ['2col', LayoutGrid, '2 col'], ['3col', Grid3x3, '3 col']] as const).map(([v, Icon, label]) => (
                <button key={v} onClick={() => setView(v)} title={label}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: view === v ? 'var(--accent-tint)' : 'transparent', border: 'none', borderRight: v !== '3col' ? '1px solid var(--border)' : 'none', color: view === v ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontWeight: view === v ? 600 : 400 }}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: '100%', padding: '6px 12px 6px 32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
            </div>

          </div>
        </div>

        {/* ── Source tabs ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap', flex: 1 }}>
            <TabBtn label="All" active={sourceTab === 'All'} onClick={() => setSourceTab('All')} />
            {newsSources.map(source => (
              <div key={source} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <TabBtn label={source} active={sourceTab === source} onClick={() => setSourceTab(source)} paddingRight={26} />
                <button onClick={() => handleRemoveSource(source)}
                  style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-55%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-faint)', display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f44747'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button onClick={() => setShowAddSource(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', marginBottom: '8px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <Plus size={13} />Add source
            </button>
          </div>

          {/* Create Article button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={selected.size === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              padding: '6px 14px', marginBottom: '8px', borderRadius: '8px',
              border: `1px solid ${selected.size > 0 ? 'transparent' : 'var(--border)'}`,
              cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
              background: selected.size > 0 ? VS.accent : 'var(--bg-card)',
              color: selected.size > 0 ? '#fff' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600,
              opacity: selected.size === 0 ? 0.45 : 1,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { if (selected.size > 0) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = selected.size === 0 ? '0.45' : '1'; }}
          >
            <FileText size={13} />
            Create Article{selected.size > 0 ? ` (${selected.size})` : ''}
          </button>
        </div>

        {/* ── News Feed ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)', fontSize: '14px' }}>
            No news items match your filters.
          </div>
        ) : (
          <div style={{
            display: view === 'list' ? 'flex' : 'grid',
            flexDirection: view === 'list' ? 'column' : undefined,
            gridTemplateColumns: view === '2col' ? 'repeat(2, 1fr)' : view === '3col' ? 'repeat(3, 1fr)' : undefined,
            gap: '10px',
          }}>
            {filtered.map(item => {
              const isSelected = selected.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  style={{
                    backgroundColor: isSelected ? VS.accentGlow : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? VS.accent : 'var(--border)'}`,
                    borderLeft: `3px solid ${isSelected ? VS.accent : 'var(--accent)'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>

                    {/* Checkbox */}
                    <div
                      style={{
                        flexShrink: 0, width: '16px', height: '16px', borderRadius: '4px', marginTop: '2px',
                        border: `2px solid ${isSelected ? VS.accent : 'var(--border)'}`,
                        background: isSelected ? VS.accent : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, backgroundColor: 'rgba(0,122,204,0.12)', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                          {item.subreddit ?? item.source}
                        </span>
                        {item.upvotes !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-subtle)' }}>
                            <ThumbsUp size={10} /><span style={{ fontSize: '11px' }}>{item.upvotes.toLocaleString()}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-subtle)' }}>
                          <Clock size={10} /><span style={{ fontSize: '11px' }}>{item.timeAgo}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: view === '3col' ? '13px' : '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px', lineHeight: '1.4' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.summary}</div>
                    </div>

                    {view === 'list' && item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', textDecoration: 'none', marginTop: '2px' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-tint)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-input)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  {view !== 'list' && item.url && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                      >
                        <ExternalLink size={11} />Open source
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function TabBtn({ label, active, onClick, paddingRight }: { label: string; active: boolean; onClick: () => void; paddingRight?: number }) {
  return (
    <button onClick={onClick}
      style={{ padding: `9px ${paddingRight ?? 16}px 9px 16px`, background: 'transparent', border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', color: active ? 'var(--accent)' : 'var(--text-muted)', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: active ? 600 : 400, cursor: 'pointer', border: '1px solid', borderColor: active ? 'var(--accent)' : 'var(--border)', backgroundColor: active ? 'var(--accent-tint)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
      {label}
    </button>
  );
}
