'use client';

import { useDashboard } from '@/lib/store';
import { POST_STATUSES, STATUS_COLORS, PLATFORM_COLORS } from '@/lib/constants';
import { PostStatus } from '@/lib/types';
import {
  Activity, TrendingUp, TrendingDown, Minus,
  CheckCircle2, BarChart3, Users, CalendarClock,
  Zap, AlertTriangle, ArrowRight, Target, Circle,
} from 'lucide-react';

// ── EverSense VS Dark palette ─────────────────────────────
const VS = {
  bg0:    '#1e1e1e',
  bg1:    '#252526',
  bg2:    '#2d2d2d',
  bg3:    '#333333',
  border: '#3c3c3c',
  text0:  '#f0f0f0',
  text1:  '#c0c0c0',
  text2:  '#909090',
  blue:   '#569cd6',
  teal:   '#4ec9b0',
  yellow: '#dcdcaa',
  orange: '#ce9178',
  purple: '#c586c0',
  red:    '#f44747',
  accent: '#007acc',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate() {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function StatCard({ label, value, sub, color, icon: Icon, trend }: {
  label: string; value: string | number; sub?: string; color: string;
  icon: React.ElementType;
  trend?: { pct: number; dir: 'up' | 'down' | 'neutral' };
}) {
  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: VS.text2 }}>{label}</span>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: VS.text0, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', marginTop: '4px', color: VS.text2 }}>{sub}</div>}
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
          {trend.dir === 'up'      && <TrendingUp  size={12} style={{ color: VS.teal }} />}
          {trend.dir === 'down'    && <TrendingDown size={12} style={{ color: VS.red  }} />}
          {trend.dir === 'neutral' && <Minus        size={12} style={{ color: VS.text2 }} />}
          <span style={{ color: trend.dir === 'up' ? VS.teal : trend.dir === 'down' ? VS.red : VS.text2 }}>
            {trend.pct}% vs last period
          </span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const color = STATUS_COLORS[status] || VS.text2;
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: `${color}18`, border: `1px solid ${color}33`, color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

export default function VsCodeHome() {
  const { posts, competitors } = useDashboard();

  const pipelineCounts = POST_STATUSES.reduce<Record<PostStatus, number>>((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<PostStatus, number>);

  const published  = pipelineCounts['Published']  || 0;
  const scheduled  = pipelineCounts['Scheduled']  || 0;
  const inProgress = pipelineCounts['In Progress'] || 0;
  const ready      = pipelineCounts['Ready']       || 0;

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const upcoming = posts
    .filter((p) => p.scheduledDate && new Date(p.scheduledDate) >= new Date('2026-03-23'))
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
    .slice(0, 4);

  const maxPipeline = Math.max(...POST_STATUSES.map((s) => pipelineCounts[s] || 0), 1);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: VS.bg0, minHeight: '100vh', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0 }}>
            {getGreeting()}, Zac
          </h1>
          <p style={{ fontSize: '13px', color: VS.text2, margin: '4px 0 0 0' }}>{fmtDate()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: VS.bg2, border: `1px solid ${VS.border}`, fontSize: '12px', color: VS.text2 }}>
            <Activity size={14} style={{ color: VS.teal }} />
            ContentSense
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(86,156,214,0.1)', border: 'rgba(86,156,214,0.25) 1px solid', fontSize: '12px', color: VS.blue }}>
            <Circle size={8} style={{ fill: VS.blue, color: VS.blue }} />
            Content Dashboard
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard label="Total Posts"    value={posts.length}       icon={BarChart3}    color={VS.blue}   trend={{ pct: 12, dir: 'up' }} />
        <StatCard label="Published"      value={published}          icon={CheckCircle2} color={VS.teal}   trend={{ pct: 8,  dir: 'up' }} />
        <StatCard label="Scheduled"      value={scheduled}          icon={CalendarClock} color={VS.accent} />
        <StatCard label="In Progress"    value={inProgress}         icon={Zap}          color={VS.yellow} />
        <StatCard label="Ready to Post"  value={ready}              icon={Target}       color={VS.purple} />
        <StatCard label="Competitors"    value={competitors.length} icon={Users}        color={VS.orange} sub="tracked agencies" />
      </div>

      {/* ── Platform + Pipeline ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Platform Performance */}
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: VS.text0, margin: 0 }}>Platform Performance</h2>
            <span style={{ fontSize: '11px', color: VS.text2 }}>March 2026</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { platform: 'YouTube',   value: '4.9K',   pct: '+293%', color: PLATFORM_COLORS['YouTube']   },
              { platform: 'Instagram', value: '113.4K', pct: '+138%', color: PLATFORM_COLORS['Instagram'] },
              { platform: 'LinkedIn',  value: '64.3K',  pct: '+389%', color: PLATFORM_COLORS['LinkedIn']  },
            ].map((p) => (
              <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: VS.text1, flex: 1 }}>{p.platform}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: VS.text0 }}>{p.value}</span>
                <span style={{ fontSize: '11px', color: VS.teal, fontWeight: 600, minWidth: '52px', textAlign: 'right' }}>{p.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Pipeline with progress bars */}
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: VS.text0, margin: '0 0 16px 0' }}>Content Pipeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {POST_STATUSES.map((status) => {
              const count = pipelineCounts[status] || 0;
              const color = STATUS_COLORS[status];
              const pct = Math.round((count / maxPipeline) * 100);
              return (
                <div key={status}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: VS.text1 }}>{status}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: VS.text0 }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '999px', backgroundColor: VS.bg3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent + Upcoming ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Recent Content */}
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: VS.text0, margin: 0 }}>Recent Content</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: VS.blue, cursor: 'pointer' }}>
              View all <ArrowRight size={12} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentPosts.map((post, i) => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < recentPosts.length - 1 ? `1px solid ${VS.border}` : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: STATUS_COLORS[post.status], flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: VS.text1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title}
                </span>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: VS.text0, margin: 0 }}>Upcoming Posts</h2>
            <span style={{ fontSize: '11px', color: VS.text2 }}>next 14 days</span>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '8px' }}>
              <AlertTriangle size={20} style={{ color: VS.text2 }} />
              <span style={{ fontSize: '13px', color: VS.text2 }}>Nothing scheduled</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcoming.map((post, i) => {
                const dateStr = new Date(post.scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const [mon, day] = dateStr.split(' ');
                const color = STATUS_COLORS[post.status];
                return (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < upcoming.length - 1 ? `1px solid ${VS.border}` : 'none' }}>
                    <div style={{ background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '4px 8px', textAlign: 'center', flexShrink: 0, minWidth: '44px' }}>
                      <div style={{ fontSize: '10px', color: VS.text2, fontWeight: 600 }}>{mon.toUpperCase()}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: VS.text0, lineHeight: 1 }}>{day}</div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', color: VS.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                      <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{post.platform}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
