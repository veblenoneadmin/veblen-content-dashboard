'use client';

import { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Heart, MessageCircle, TrendingUp, Users, RefreshCw } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#cccccc', text2: '#909090',
  accent: '#007acc', green: '#4ec9b0', yellow: '#dcdcaa',
  linkedin: '#0A66C2',
};

type Post = {
  id: string;
  creatorName: string;
  platform: string;
  postUrl: string;
  postDate: string | null;
  views: number;
  likes: number;
  commentsCount: number;
  shares: number;
  saves: number;
  caption: string;
  engagementRate: number;
  durationSeconds: number;
  scrapedAt: string;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30)  return `${d}d ago`;
  const m = Math.floor(d / 30);
  return `${m}mo ago`;
}

export default function LinkedInPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<string>('All');
  const [sort, setSort] = useState<'engagement' | 'likes' | 'recent'>('engagement');

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/creator-posts?platform=linkedin&limit=200')
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const creators = ['All', ...Array.from(new Set(posts.map(p => p.creatorName))).sort()];

  const filtered = posts
    .filter(p => creator === 'All' || p.creatorName === creator)
    .sort((a, b) => {
      if (sort === 'engagement') return b.engagementRate - a.engagementRate;
      if (sort === 'likes')      return b.likes - a.likes;
      return new Date(b.postDate ?? b.scrapedAt).getTime() - new Date(a.postDate ?? a.scrapedAt).getTime();
    });

  const totalPosts = filtered.length;
  const avgEng     = totalPosts ? (filtered.reduce((s, p) => s + p.engagementRate, 0) / totalPosts) : 0;
  const totalLikes = filtered.reduce((s, p) => s + p.likes, 0);
  const totalComments = filtered.reduce((s, p) => s + p.commentsCount, 0);

  return (
    <div style={{ color: VS.text0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>LinkedIn</h1>
          <p className="text-[12px] mt-0.5" style={{ color: VS.text2, fontFamily: 'monospace' }}>// scraped company posts</p>
        </div>
        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
          style={{ background: VS.bg1, border: `1px solid ${VS.border}`, color: VS.text2 }}
        >
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts',    value: totalPosts,             color: VS.text0,    icon: Briefcase },
          { label: 'Avg Engagement', value: `${avgEng.toFixed(2)}%`, color: VS.green,    icon: TrendingUp },
          { label: 'Total Likes',    value: fmt(totalLikes),        color: VS.linkedin, icon: Heart },
          { label: 'Total Comments', value: fmt(totalComments),     color: VS.accent,   icon: MessageCircle },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: VS.bg1, border: `1px solid ${VS.border}` }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${stat.color}18` }}>
                <Icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: VS.text2, fontFamily: 'monospace' }}>{stat.label}</p>
                <p className="text-[18px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {creators.map(c => (
            <button
              key={c}
              onClick={() => setCreator(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px]"
              style={{
                background: creator === c ? `${VS.linkedin}22` : VS.bg1,
                border: `1px solid ${creator === c ? VS.linkedin : VS.border}`,
                color: creator === c ? VS.linkedin : VS.text2,
                fontWeight: creator === c ? 600 : 400,
              }}
            >
              {c !== 'All' && <Users className="h-3 w-3" />}{c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1.5">
          {(['engagement', 'likes', 'recent'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-3 py-1.5 rounded-md text-[12px] capitalize"
              style={{
                background: sort === s ? `${VS.accent}22` : VS.bg1,
                border: `1px solid ${sort === s ? VS.accent : VS.border}`,
                color: sort === s ? VS.accent : VS.text2,
                fontWeight: sort === s ? 600 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[13px]" style={{ color: VS.text2 }}>
          Loading posts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: VS.text2 }}>
          <Briefcase className="h-8 w-8 opacity-30" />
          <p className="text-[13px]">No LinkedIn posts yet — add a source on the Social Sources page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(post => (
            <div
              key={post.id}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: VS.bg1, border: `1px solid ${VS.border}` }}
            >
              {/* Creator + date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: `${VS.linkedin}22`, color: VS.linkedin }}>
                    {post.creatorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: VS.text1 }}>{post.creatorName}</span>
                </div>
                <span className="text-[11px]" style={{ color: VS.text2 }}>
                  {post.postDate ? timeAgo(post.postDate) : timeAgo(post.scrapedAt)}
                </span>
              </div>

              {/* Caption */}
              <p className="text-[12px] leading-relaxed line-clamp-4" style={{ color: VS.text2 }}>
                {post.caption || '—'}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Heart,         value: fmt(post.likes),         color: VS.linkedin, label: 'likes' },
                  { icon: MessageCircle, value: fmt(post.commentsCount),  color: VS.accent,   label: 'comments' },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="flex flex-col items-center gap-0.5 rounded-lg py-2" style={{ background: VS.bg2 }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                      <span className="text-[13px] font-semibold" style={{ color: VS.text0 }}>{m.value}</span>
                      <span className="text-[9px] uppercase tracking-wider" style={{ color: VS.text2 }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Engagement + link */}
              <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px solid ${VS.border}` }}>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" style={{ color: VS.green }} />
                  <span className="text-[12px] font-semibold" style={{ color: VS.green }}>{post.engagementRate.toFixed(2)}%</span>
                  <span className="text-[11px]" style={{ color: VS.text2 }}>eng rate</span>
                </div>
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-md"
                  style={{ background: VS.bg2, color: VS.text2, textDecoration: 'none', border: `1px solid ${VS.border}` }}
                >
                  <ExternalLink className="h-3 w-3" />View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
