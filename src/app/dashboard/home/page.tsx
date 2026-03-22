'use client';

import { useDashboard } from '@/lib/store';
import { POST_STATUSES, STATUS_COLORS, PLATFORM_COLORS } from '@/lib/constants';
import { PostStatus } from '@/lib/types';
import StatusChip from '@/components/shared/StatusChip';
import { CalendarDays, RefreshCw, Download, Settings } from 'lucide-react';

function Sparkline({ color }: { color: string }) {
  const heights = [30, 50, 40, 70, 55, 80, 95];
  const maxH = 28;

  return (
    <svg width="56" height="28" viewBox="0 0 56 28">
      {heights.map((h, i) => {
        const barH = (h / 100) * maxH;
        return (
          <rect
            key={i}
            x={i * 8}
            y={maxH - barH}
            width={6}
            height={barH}
            rx={1}
            fill={color}
            opacity={0.7 + (i / heights.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}

const platformStats = [
  { platform: 'YouTube', value: '4.9K', pct: '+293%', color: PLATFORM_COLORS['YouTube'] },
  { platform: 'Instagram', value: '113.4K', pct: '+138%', color: PLATFORM_COLORS['Instagram'] },
  { platform: 'LinkedIn', value: '64.3K', pct: '+389%', color: PLATFORM_COLORS['LinkedIn'] },
];

export default function HomePage() {
  const { posts, newsItems } = useDashboard();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pipelineCounts = POST_STATUSES.reduce<Record<PostStatus, number>>((acc, status) => {
    acc[status] = posts.filter((p) => p.status === status).length;
    return acc;
  }, {} as Record<PostStatus, number>);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const today = new Date('2026-03-22');
  const in14Days = new Date('2026-04-05');
  const upcomingPosts = posts
    .filter((p) => {
      if (!p.scheduledDate) return false;
      const d = new Date(p.scheduledDate);
      return d >= today && d <= in14Days;
    })
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

  const lastTwoNews = newsItems.slice(0, 2);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: '1.2' }}>
            {greeting}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Your content dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ icon: RefreshCw, label: 'Refresh' }, { icon: Download, label: 'Export' }, { icon: Settings, label: 'Settings' }].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {platformStats.map((stat) => (
          <div key={stat.platform} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stat.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{stat.platform}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#6AAF6A', marginTop: '4px' }}>{stat.pct}</div>
              </div>
              <Sparkline color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Content Pipeline + Recently Created */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Content Pipeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {POST_STATUSES.map((status) => {
              const count = pipelineCounts[status] || 0;
              const color = STATUS_COLORS[status];
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{status}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: count > 0 ? 'var(--text-primary)' : 'var(--border-light)' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Recently Created</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPosts.map((post) => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {post.title}
                </span>
                <StatusChip status={post.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Up + Competitor Intel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Coming Up</h2>
          {upcomingPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: '13px' }}>
              No posts scheduled in the next 14 days
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingPosts.map((post) => (
                <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarDays size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(post.scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {post.title}
                  </span>
                  <StatusChip status={post.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Competitor Intel</h2>
          {lastTwoNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: '13px' }}>No news items</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lastTwoNews.map((item) => (
                <div key={item.id} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    {item.source === 'Reddit' && item.subreddit ? item.subreddit : item.source} · {item.timeAgo}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
