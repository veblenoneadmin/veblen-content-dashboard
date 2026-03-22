'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { Search, ThumbsUp, Clock } from 'lucide-react';

const sourceTabs = ['All', 'Reddit', 'RSS', 'LocalLLaMA'];

export default function NewsPage() {
  const { newsItems } = useDashboard();
  const [search, setSearch] = useState('');
  const [sourceTab, setSourceTab] = useState('All');

  const filtered = newsItems.filter((item) => {
    const matchesSearch =
      search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());

    const matchesSource =
      sourceTab === 'All' || item.source === sourceTab;

    return matchesSearch && matchesSource;
  });

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          Industry News
        </h1>
        <p style={{ color: '#888888', fontSize: '14px', margin: '4px 0 0 0' }}>
          {newsItems.length} items · Updated just now
        </p>
      </div>

      {/* Search Bar */}
      <div
        style={{
          position: 'relative',
          marginBottom: '16px',
        }}
      >
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#555555',
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news..."
          style={{
            width: '100%',
            padding: '9px 12px 9px 34px',
            backgroundColor: '#1A1A1A',
            border: '1px solid #262626',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      {/* Source Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: '1px solid #262626',
          marginBottom: '24px',
        }}
      >
        {sourceTabs.map((tab) => {
          const isActive = sourceTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSourceTab(tab)}
              style={{
                padding: '9px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #D4845A' : '2px solid transparent',
                color: isActive ? '#D4845A' : '#888888',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* News Feed */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#555555',
            fontSize: '14px',
          }}
        >
          No news items match your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #262626',
                borderLeft: '3px solid #D4845A',
                borderRadius: '0 10px 10px 0',
                padding: '16px 18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Source Chip */}
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor:
                      item.source === 'Reddit'
                        ? 'rgba(255,100,50,0.15)'
                        : item.source === 'RSS'
                        ? 'rgba(100,180,100,0.15)'
                        : 'rgba(100,100,200,0.15)',
                    color:
                      item.source === 'Reddit'
                        ? '#FF6432'
                        : item.source === 'RSS'
                        ? '#64B464'
                        : '#6464C8',
                    fontWeight: 600,
                  }}
                >
                  {item.source === 'Reddit' && item.subreddit
                    ? item.subreddit
                    : item.source}
                </span>

                {/* Upvotes */}
                {item.upvotes !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666666' }}>
                    <ThumbsUp size={11} />
                    <span style={{ fontSize: '11px' }}>{item.upvotes.toLocaleString()}</span>
                  </div>
                )}

                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666666', marginLeft: 'auto' }}>
                  <Clock size={11} />
                  <span style={{ fontSize: '11px' }}>{item.timeAgo}</span>
                </div>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px', lineHeight: '1.4' }}>
                {item.title}
              </div>

              <div style={{ fontSize: '12px', color: '#888888', lineHeight: '1.6' }}>
                {item.summary}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
