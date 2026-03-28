'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Heart, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0', yellow: '#dcdcaa',
  purple: '#c586c0',
};

const PLATFORM_COLOR: Record<string, string> = {
  tiktok: '#000000', instagram: '#E1306C', youtube: '#FF0000', unknown: '#888888',
};

type Summary = {
  creatorName: string; platform: string; postCount: number;
  avgEngagement: number; avgViews: number; avgLikes: number;
  topEngagement: number; lastScraped: string;
};

type Post = {
  id: string; creatorName: string; platform: string; postUrl: string;
  views: number; likes: number; commentsCount: number; shares: number;
  saves: number; engagementRate: number; caption: string;
  postDate: string | null; scrapedAt: string;
};

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function PlatformDot({ platform }: { platform: string }) {
  const color = PLATFORM_COLOR[platform] ?? '#888';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: 4, fontSize: 10, fontWeight: 800,
      background: color + '22', color: color === '#000000' ? '#fff' : color, border: `1px solid ${color}40`,
    }}>
      {platform[0]?.toUpperCase()}
    </span>
  );
}

function CreatorRow({ summary }: { summary: Summary }) {
  const [expanded, setExpanded] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    if (posts.length) { setExpanded(v => !v); return; }
    setExpanded(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/creator-posts?creator=${encodeURIComponent(summary.creatorName)}&limit=20`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  const engColor = summary.avgEngagement >= 5 ? VS.green : summary.avgEngagement >= 2 ? VS.yellow : VS.text2;

  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <PlatformDot platform={summary.platform} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: VS.text0 }}>{summary.creatorName}</div>
          <div style={{ fontSize: 12, color: VS.text2, marginTop: 2 }}>
            {summary.postCount} posts &middot; last scraped {summary.lastScraped ? timeAgo(summary.lastScraped) : 'never'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: engColor }}>{summary.avgEngagement}%</div>
            <div style={{ fontSize: 10, color: VS.text2 }}>avg eng.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: VS.text1 }}>{fmt(summary.avgViews)}</div>
            <div style={{ fontSize: 10, color: VS.text2 }}>avg views</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: VS.text1 }}>{fmt(summary.avgLikes)}</div>
            <div style={{ fontSize: 10, color: VS.text2 }}>avg likes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: VS.purple }}>{summary.topEngagement}%</div>
            <div style={{ fontSize: 10, color: VS.text2 }}>top post</div>
          </div>
        </div>

        <button onClick={loadPosts} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: 4 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${VS.border}`, padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: VS.text2, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            Top Posts by Engagement
          </div>
          {loading && <div style={{ fontSize: 12, color: VS.text2 }}>Loading...</div>}
          {!loading && posts.length === 0 && <div style={{ fontSize: 12, color: VS.text2 }}>No posts found.</div>}
          {!loading && posts.map(post => (
            <div key={post.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
              background: VS.bg2, borderRadius: 6, marginBottom: 6,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: VS.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.caption || post.postUrl}
                </div>
                <div style={{ fontSize: 11, color: VS.text2, marginTop: 2, display: 'flex', gap: 10 }}>
                  <span><Eye size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {fmt(post.views)}</span>
                  <span><Heart size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {fmt(post.likes)}</span>
                  {post.postDate && <span>{timeAgo(post.postDate)}</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: post.engagementRate >= 5 ? VS.green : VS.yellow, flexShrink: 0 }}>
                {post.engagementRate}%
              </div>
              <a href={post.postUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: VS.text2, display: 'flex', flexShrink: 0 }}>
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorAnalyticsPage() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creator-posts/summary');
      const data = await res.json();
      setSummary(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? summary : summary.filter(s => s.platform === filter);
  const totalPosts = summary.reduce((a, s) => a + s.postCount, 0);
  const avgEng = summary.length
    ? (summary.reduce((a, s) => a + s.avgEngagement, 0) / summary.length).toFixed(2)
    : '0';

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: VS.text0, margin: 0, marginBottom: 4 }}>
            Creator Analytics
          </h1>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            {loading ? 'Loading...' : `${summary.length} creators · ${totalPosts.toLocaleString()} posts tracked`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: VS.text1, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Creators Tracked', value: loading ? '...' : summary.length, icon: <Users size={16} />, color: VS.accent },
          { label: 'Total Posts',       value: loading ? '...' : totalPosts.toLocaleString(), icon: <TrendingUp size={16} />, color: VS.green },
          { label: 'Avg Engagement',    value: loading ? '...' : avgEng + '%', icon: <Heart size={16} />, color: VS.yellow },
        ].map(s => (
          <div key={s.label} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: VS.text2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'tiktok', 'instagram', 'youtube'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === p ? VS.accent : VS.border}`, background: filter === p ? VS.accent + '22' : 'transparent', color: filter === p ? VS.accent : VS.text2 }}>
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Creator rows */}
      {!loading && filtered.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 12, padding: 56, textAlign: 'center' }}>
          <TrendingUp size={32} style={{ color: VS.text2, marginBottom: 12 }} />
          <p style={{ color: VS.text0, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No data yet</p>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            Run WF1 (Initial Creator Scrape) to populate creator posts.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(s => <CreatorRow key={`${s.creatorName}-${s.platform}`} summary={s} />)}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
