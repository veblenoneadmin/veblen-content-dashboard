'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/lib/store';
import { Search, ThumbsUp, Clock, Plus, X } from 'lucide-react';

export default function NewsPage() {
  const { newsItems, newsSources, addNewsSource, removeNewsSource } = useDashboard();
  const [search, setSearch] = useState('');
  const [sourceTab, setSourceTab] = useState('All');
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceInput, setNewSourceInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingSource) inputRef.current?.focus();
  }, [addingSource]);

  const handleAddSource = () => {
    if (newSourceInput.trim()) {
      addNewsSource(newSourceInput.trim());
    }
    setNewSourceInput('');
    setAddingSource(false);
  };

  const handleRemoveSource = (source: string) => {
    if (sourceTab === source) setSourceTab('All');
    removeNewsSource(source);
  };

  const filtered = newsItems.filter((item) => {
    const matchesSearch = search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceTab === 'All' || item.source === sourceTab;
    return matchesSearch && matchesSource;
  });

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Industry News</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>{newsItems.length} items · Updated just now</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news..."
          style={{ width: '100%', padding: '9px 12px 9px 34px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
        />
      </div>

      {/* Source Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '24px', gap: '2px' }}>
        {/* All tab */}
        <button
          onClick={() => setSourceTab('All')}
          style={{
            padding: '9px 16px', background: 'transparent', border: 'none',
            borderBottom: sourceTab === 'All' ? '2px solid var(--accent)' : '2px solid transparent',
            color: sourceTab === 'All' ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: sourceTab === 'All' ? 600 : 400,
            cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap',
          }}
        >
          All
        </button>

        {/* Dynamic source tabs */}
        {newsSources.map((source) => (
          <div key={source} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '-1px' }}>
            <button
              onClick={() => setSourceTab(source)}
              style={{
                padding: '9px 28px 9px 16px', background: 'transparent', border: 'none',
                borderBottom: sourceTab === source ? '2px solid var(--accent)' : '2px solid transparent',
                color: sourceTab === source ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: sourceTab === source ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {source}
            </button>
            <button
              onClick={() => handleRemoveSource(source)}
              title={`Remove ${source}`}
              style={{
                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-55%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: 'var(--text-faint)', display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-red)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Add source */}
        {addingSource ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', marginBottom: '-1px' }}>
            <input
              ref={inputRef}
              value={newSourceInput}
              onChange={e => setNewSourceInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddSource();
                if (e.key === 'Escape') { setAddingSource(false); setNewSourceInput(''); }
              }}
              placeholder="Source name..."
              style={{
                width: '120px', padding: '4px 8px', fontSize: '12px',
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent)',
                borderRadius: '6px', color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <button
              onClick={handleAddSource}
              style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
            >
              Add
            </button>
            <button
              onClick={() => { setAddingSource(false); setNewSourceInput(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSource(true)}
            title="Add source"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '9px 12px', background: 'transparent', border: 'none',
              color: 'var(--text-faint)', fontSize: '12px', cursor: 'pointer',
              marginBottom: '-1px', borderBottom: '2px solid transparent',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}
          >
            <Plus size={13} />
            Add source
          </button>
        )}
      </div>

      {/* News Feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)', fontSize: '14px' }}>
          No news items match your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, backgroundColor: 'rgba(0,122,204,0.12)', color: 'var(--accent)' }}>
                  {item.subreddit ? item.subreddit : item.source}
                </span>
                {item.upvotes !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-subtle)' }}>
                    <ThumbsUp size={11} />
                    <span style={{ fontSize: '11px' }}>{item.upvotes.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                  <Clock size={11} />
                  <span style={{ fontSize: '11px' }}>{item.timeAgo}</span>
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.4' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.summary}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
