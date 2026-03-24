'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, ChevronDown, ChevronUp, Clock, Tag, Copy, Check } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0',
};

type ArticleSummary = {
  id: string;
  topic: string;
  tone: string;
  mood: string;
  wordCount: number;
  createdAt: string;
};

type ArticleFull = ArticleSummary & {
  articleText: string;
  sourceUrls?: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ArticleCard({ article, onDelete }: { article: ArticleSummary; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState<ArticleFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExpand = async () => {
    if (!expanded && !full) {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${article.id}`);
        const data = await res.json();
        setFull(data);
      } catch { /* silently fail */ }
      setLoading(false);
    }
    setExpanded(e => !e);
  };

  const handleCopy = async () => {
    if (!full?.articleText) return;
    await navigator.clipboard.writeText(full.articleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this article?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
      onDelete(article.id);
    } catch { setDeleting(false); }
  };

  const sources = full?.sourceUrls ? (() => {
    try { return JSON.parse(full.sourceUrls!) as string[]; } catch { return [full.sourceUrls!]; }
  })() : [];

  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: VS.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={15} style={{ color: VS.accent }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, marginBottom: '6px', lineHeight: '1.4' }}>
            {article.topic || 'Untitled Article'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', background: VS.bg3, color: VS.text2, borderRadius: '4px', padding: '2px 7px' }}>
              {article.tone}
            </span>
            <span style={{ fontSize: '11px', background: VS.bg3, color: VS.text2, borderRadius: '4px', padding: '2px 7px' }}>
              {article.mood}
            </span>
            {article.wordCount > 0 && (
              <span style={{ fontSize: '11px', color: VS.text2, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Tag size={10} />
                {article.wordCount.toLocaleString()} words
              </span>
            )}
            <span style={{ fontSize: '11px', color: VS.text2, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={10} />
              {timeAgo(article.createdAt)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px', borderRadius: '4px', opacity: deleting ? 0.5 : 1 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.error}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleExpand}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px', borderRadius: '4px' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.text0}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${VS.border}` }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: VS.text2, fontSize: '13px' }}>Loading…</div>
          ) : full ? (
            <>
              {sources.length > 0 && (
                <div style={{ padding: '10px 16px', background: VS.bg2, borderBottom: `1px solid ${VS.border}` }}>
                  <span style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>Sources</span>
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {sources.map((s, i) => (
                      <a key={i} href={s} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: VS.accent, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: '16px', position: 'relative' }}>
                <button
                  onClick={handleCopy}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: copied ? VS.green : VS.text2, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <pre style={{ fontSize: '13px', color: VS.text1, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'inherit', paddingRight: '80px' }}>
                  {full.articleText}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: VS.error, fontSize: '13px' }}>Failed to load article.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ArchivePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
        else setError('Failed to load articles');
      })
      .catch(() => setError('Failed to connect to server'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0, marginBottom: '4px' }}>
          Article Archive
        </h1>
        <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>
          {loading ? 'Loading…' : `${articles.length} saved article${articles.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* States */}
      {loading && (
        <div style={{ color: VS.text2, fontSize: '13px' }}>Loading articles…</div>
      )}
      {!loading && error && (
        <div style={{ color: VS.error, fontSize: '13px' }}>{error}</div>
      )}
      {!loading && !error && articles.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '48px', textAlign: 'center' }}>
          <FileText size={32} style={{ color: VS.text2, marginBottom: '12px' }} />
          <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>No articles saved yet. Generate and save articles from the News page.</p>
        </div>
      )}

      {/* Article list */}
      {!loading && !error && articles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
