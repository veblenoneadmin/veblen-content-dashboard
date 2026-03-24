'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/lib/store';
import { Search, ThumbsUp, Clock, Plus, X, ArrowUpDown, ExternalLink, List, LayoutGrid, Grid3x3 } from 'lucide-react';

type SortOption = 'newest' | 'upvotes';
type ViewMode = 'list' | '2col' | '3col';

export default function NewsPage() {
  const { newsItems, newsSources, addNewsSource, removeNewsSource } = useDashboard();
  const [search, setSearch] = useState('');
  const [sourceTab, setSourceTab] = useState('All');
  const [sort, setSort] = useState<SortOption>('newest');
  const [onlyWithUpvotes, setOnlyWithUpvotes] = useState(false);
  const [onlyWithLink, setOnlyWithLink] = useState(false);
  const [view, setView] = useState<ViewMode>('list');
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceInput, setNewSourceInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingSource) inputRef.current?.focus();
  }, [addingSource]);

  const handleAddSource = () => {
    if (newSourceInput.trim()) addNewsSource(newSourceInput.trim());
    setNewSourceInput('');
    setAddingSource(false);
  };

  const handleRemoveSource = (source: string) => {
    if (sourceTab === source) setSourceTab('All');
    removeNewsSource(source);
  };

  const activeFilterCount = [
    sort !== 'newest',
    onlyWithUpvotes,
    onlyWithLink,
  ].filter(Boolean).length;

  let filtered = newsItems.filter((item) => {
    if (search.trim() && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceTab !== 'All' && item.source !== sourceTab) return false;
    if (onlyWithUpvotes && !item.upvotes) return false;
    if (onlyWithLink && !item.url) return false;
    return true;
  });

  if (sort === 'upvotes') {
    filtered = [...filtered].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Industry News</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
            {filtered.length} of {newsItems.length} items
          </p>
        </div>
        {/* View toggle + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            {([['list', List, 'List'], ['2col', LayoutGrid, '2 col'], ['3col', Grid3x3, '3 col']] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={label}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: view === v ? 'var(--accent-tint)' : 'transparent', border: 'none', borderRight: v !== '3col' ? '1px solid var(--border)' : 'none', color: view === v ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontWeight: view === v ? 600 : 400 }}
              >
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search news..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          />
        </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>

        {/* Source tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
          <TabBtn label="All" active={sourceTab === 'All'} onClick={() => setSourceTab('All')} />
          {newsSources.map(source => (
            <div key={source} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <TabBtn
                label={source}
                active={sourceTab === source}
                onClick={() => setSourceTab(source)}
                paddingRight={26}
              />
              <button
                onClick={() => handleRemoveSource(source)}
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-55%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-faint)', display: 'flex' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f44747'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {addingSource ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
              <input
                ref={inputRef}
                value={newSourceInput}
                onChange={e => setNewSourceInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSource(); if (e.key === 'Escape') { setAddingSource(false); setNewSourceInput(''); } }}
                placeholder="Source name..."
                style={{ width: '120px', padding: '4px 8px', fontSize: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button onClick={handleAddSource} style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Add</button>
              <button onClick={() => { setAddingSource(false); setNewSourceInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSource(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', marginBottom: '8px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <Plus size={13} />Add source
            </button>
          )}
        </div>

        {/* Right-side filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '10px', flexShrink: 0 }}>
          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <span style={{ padding: '5px 8px 5px 10px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', borderRight: '1px solid var(--border)' }}>
              <ArrowUpDown size={11} />Sort
            </span>
            {(['newest', 'upvotes'] as SortOption[]).map(opt => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                style={{ padding: '5px 10px', background: sort === opt ? 'var(--accent-tint)' : 'transparent', border: 'none', color: sort === opt ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px', fontWeight: sort === opt ? 600 : 400, cursor: 'pointer', borderRight: opt === 'newest' ? '1px solid var(--border)' : 'none' }}
              >
                {opt === 'newest' ? 'Newest' : 'Most upvotes'}
              </button>
            ))}
          </div>

          {/* Toggle: has upvotes */}
          <FilterPill
            label="Has upvotes"
            active={onlyWithUpvotes}
            onClick={() => setOnlyWithUpvotes(v => !v)}
          />

          {/* Toggle: has link */}
          <FilterPill
            label="Has link"
            active={onlyWithLink}
            onClick={() => setOnlyWithLink(v => !v)}
          />

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSort('newest'); setOnlyWithUpvotes(false); setOnlyWithLink(false); }}
              style={{ padding: '5px 10px', background: 'rgba(244,71,71,0.1)', border: '1px solid rgba(244,71,71,0.25)', borderRadius: '8px', color: '#f44747', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
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
          {filtered.map(item => (
            <div
              key={item.id}
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0', padding: '14px 18px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, backgroundColor: 'rgba(0,122,204,0.12)', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      {item.subreddit ?? item.source}
                    </span>
                    {item.upvotes !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-subtle)' }}>
                        <ThumbsUp size={10} />
                        <span style={{ fontSize: '11px' }}>{item.upvotes.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-subtle)' }}>
                      <Clock size={10} />
                      <span style={{ fontSize: '11px' }}>{item.timeAgo}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: view === '3col' ? '13px' : '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px', lineHeight: '1.4' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.summary}</div>
                </div>

                {/* Link button — only show inline for list view */}
                {view === 'list' && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', textDecoration: 'none', marginTop: '2px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-tint)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-input)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Link button at bottom for grid views */}
              {view !== 'list' && item.url && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  >
                    <ExternalLink size={11} />Open source
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick, paddingRight }: { label: string; active: boolean; onClick: () => void; paddingRight?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `9px ${paddingRight ?? 16}px 9px 16px`,
        background: 'transparent', border: 'none',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '13px', fontWeight: active ? 600 : 400,
        cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: active ? 600 : 400,
        cursor: 'pointer', border: '1px solid',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        backgroundColor: active ? 'var(--accent-tint)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  );
}
