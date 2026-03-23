'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { POST_STATUSES, STATUS_COLORS, PLATFORM_COLORS } from '@/lib/constants';
import { PostStatus } from '@/lib/types';
import { GitBranch, Bell, CheckCircle, AlertCircle, X, Circle } from 'lucide-react';

// ── Syntax token colors (VS Code Dark+) ──────────────────
const T = {
  comment:    '#6A9955',
  keyword:    '#569CD6',
  string:     '#CE9178',
  number:     '#B5CEA8',
  property:   '#9CDCFE',
  punctuation:'#D4D4D4',
  type:       '#4EC9B0',
  fn:         '#DCDCAA',
  muted:      '#858585',
  white:      '#D4D4D4',
};

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '22px' }}>
      <span style={{ width: '44px', minWidth: '44px', textAlign: 'right', paddingRight: '16px', color: T.muted, fontSize: '13px', fontFamily: 'monospace', userSelect: 'none', lineHeight: '22px' }}>
        {n}
      </span>
      <span style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: '22px', whiteSpace: 'pre' }}>
        {children}
      </span>
    </div>
  );
}

function Blank({ n }: { n: number }) {
  return <Line n={n}>{''}</Line>;
}

// ── Tab bar ───────────────────────────────────────────────
type TabName = 'home.dashboard' | 'analytics.ts' | 'posts.json';
const FILE_TABS: TabName[] = ['home.dashboard', 'analytics.ts', 'posts.json'];
const TAB_ICONS: Record<TabName, string> = {
  'home.dashboard': '🏠',
  'analytics.ts':   '📊',
  'posts.json':     '📄',
};

export default function VsCodeHome() {
  const { posts, competitors } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabName>('home.dashboard');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pipelineCounts = POST_STATUSES.reduce<Record<PostStatus, number>>((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<PostStatus, number>);

  const upcoming = posts
    .filter((p) => p.scheduledDate)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
    .slice(0, 3);

  const totalProblems = 0;
  const totalWarnings = posts.filter((p) => p.status === 'In Progress').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', backgroundColor: '#1E1E1E', fontFamily: 'monospace' }}>

      {/* ── Tab Bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', backgroundColor: '#252526', borderBottom: '1px solid #3C3C3C', flexShrink: 0 }}>
        {FILE_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
                backgroundColor: isActive ? '#1E1E1E' : 'transparent',
                color: isActive ? '#D4D4D4' : '#858585',
                borderTop: isActive ? '1px solid #007ACC' : '1px solid transparent',
                borderRight: '1px solid #3C3C3C',
                borderBottom: isActive ? '1px solid #1E1E1E' : 'none',
                marginBottom: isActive ? '-1px' : '0',
                userSelect: 'none',
                transition: 'color 0.1s',
              }}
            >
              <span style={{ fontSize: '12px' }}>{TAB_ICONS[tab]}</span>
              <span>{tab}</span>
              <X size={12} style={{ color: '#858585', marginLeft: '4px', opacity: isActive ? 1 : 0 }} />
            </div>
          );
        })}
      </div>

      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div style={{ padding: '4px 16px', backgroundColor: '#1E1E1E', borderBottom: '1px solid #3C3C3C', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: '#858585' }}>veblen-group</span>
        <span style={{ fontSize: '12px', color: '#858585' }}>›</span>
        <span style={{ fontSize: '12px', color: '#858585' }}>dashboard</span>
        <span style={{ fontSize: '12px', color: '#858585' }}>›</span>
        <span style={{ fontSize: '12px', color: '#D4D4D4' }}>{activeTab}</span>
      </div>

      {/* ── Editor Content ───────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0 32px 0', backgroundColor: '#1E1E1E' }}>

        {activeTab === 'home.dashboard' && (
          <>
            <Line n={1}><span style={{ color: T.comment }}>{'/**'}</span></Line>
            <Line n={2}><span style={{ color: T.comment }}>{' * Veblen Group — Content Dashboard'}</span></Line>
            <Line n={3}><span style={{ color: T.comment }}>{` * ${greeting}, Zac  ·  March 2026`}</span></Line>
            <Line n={4}><span style={{ color: T.comment }}>{' */'}</span></Line>
            <Blank n={5} />
            <Line n={6}>
              <span style={{ color: T.keyword }}>const </span>
              <span style={{ color: T.property }}>platform_stats</span>
              <span style={{ color: T.punctuation }}> = {'{'}</span>
            </Line>
            {[
              { key: 'youtube',   val: '"4.9K"',   growth: '"+293%"', note: '// 🔴 YouTube' },
              { key: 'instagram', val: '"113.4K"', growth: '"+138%"', note: '// 🟠 Instagram' },
              { key: 'linkedin',  val: '"64.3K"',  growth: '"+389%"', note: '// 🔵 LinkedIn' },
            ].map(({ key, val, growth, note }, i) => (
              <Line key={key} n={7 + i}>
                {'  '}
                <span style={{ color: T.property }}>{key}</span>
                <span style={{ color: T.punctuation }}>: {'{ '}</span>
                <span style={{ color: T.property }}>followers</span>
                <span style={{ color: T.punctuation }}>: </span>
                <span style={{ color: T.string }}>{val}</span>
                <span style={{ color: T.punctuation }}>, </span>
                <span style={{ color: T.property }}>growth</span>
                <span style={{ color: T.punctuation }}>: </span>
                <span style={{ color: T.string }}>{growth}</span>
                <span style={{ color: T.punctuation }}>{' },'}</span>
                <span style={{ color: T.comment }}>  {note}</span>
              </Line>
            ))}
            <Line n={10}><span style={{ color: T.punctuation }}>{'};'}</span></Line>
            <Blank n={11} />
            <Line n={12}>
              <span style={{ color: T.keyword }}>const </span>
              <span style={{ color: T.property }}>content_pipeline</span>
              <span style={{ color: T.punctuation }}> = {'{'}</span>
            </Line>
            {POST_STATUSES.map((status, i) => {
              const count = pipelineCounts[status] || 0;
              const color = STATUS_COLORS[status];
              const key = status.toLowerCase().replace(/ /g, '_');
              return (
                <Line key={status} n={13 + i}>
                  {'  '}
                  <span style={{ color: T.property }}>{key}</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.number }}>{count}</span>
                  <span style={{ color: T.punctuation }}>,</span>
                  <span style={{ color: T.comment }}>{'  // '}</span>
                  <span style={{ color, fontSize: '11px' }}>{'■'}</span>
                  <span style={{ color: T.comment }}> {status}</span>
                </Line>
              );
            })}
            <Line n={19}><span style={{ color: T.punctuation }}>{'};'}</span></Line>
            <Blank n={20} />
            <Line n={21}>
              <span style={{ color: T.keyword }}>const </span>
              <span style={{ color: T.property }}>upcoming_posts</span>
              <span style={{ color: T.punctuation }}>{': Post[] = ['}</span>
            </Line>
            {upcoming.length === 0 ? (
              <Line n={22}><span style={{ color: T.comment }}>{'  // No upcoming posts scheduled'}</span></Line>
            ) : upcoming.map((post, i) => {
              const dateStr = post.scheduledDate
                ? new Date(post.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'TBD';
              return (
                <Line key={post.id} n={22 + i}>
                  {'  { '}
                  <span style={{ color: T.property }}>title</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${post.title.slice(0, 30)}${post.title.length > 30 ? '…' : ''}"`}</span>
                  <span style={{ color: T.punctuation }}>, </span>
                  <span style={{ color: T.property }}>date</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${dateStr}"`}</span>
                  <span style={{ color: T.punctuation }}>, </span>
                  <span style={{ color: T.property }}>status</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${post.status}"`}</span>
                  <span style={{ color: T.punctuation }}>{' },'}  </span>
                </Line>
              );
            })}
            <Line n={22 + upcoming.length}><span style={{ color: T.punctuation }}>{'];'}</span></Line>
            <Blank n={23 + upcoming.length} />
            <Line n={24 + upcoming.length}>
              <span style={{ color: T.keyword }}>export default </span>
              <span style={{ color: T.fn }}>Dashboard</span>
              <span style={{ color: T.punctuation }}>{'();'}</span>
            </Line>
          </>
        )}

        {activeTab === 'analytics.ts' && (
          <>
            <Line n={1}><span style={{ color: T.comment }}>{'// Analytics snapshot — March 2026'}</span></Line>
            <Blank n={2} />
            <Line n={3}>
              <span style={{ color: T.keyword }}>interface </span>
              <span style={{ color: T.type }}>PlatformStats </span>
              <span style={{ color: T.punctuation }}>{'{'}</span>
            </Line>
            <Line n={4}>{'  '}<span style={{ color: T.property }}>followers</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.type }}>string</span><span style={{ color: T.punctuation }}>;</span></Line>
            <Line n={5}>{'  '}<span style={{ color: T.property }}>growth</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.type }}>string</span><span style={{ color: T.punctuation }}>;</span></Line>
            <Line n={6}>{'  '}<span style={{ color: T.property }}>engagementRate</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.type }}>number</span><span style={{ color: T.punctuation }}>;</span></Line>
            <Line n={7}><span style={{ color: T.punctuation }}>{'}'}</span></Line>
            <Blank n={8} />
            <Line n={9}>
              <span style={{ color: T.keyword }}>const </span>
              <span style={{ color: T.property }}>summary</span>
              <span style={{ color: T.punctuation }}> = {'{'}</span>
            </Line>
            <Line n={10}>{'  '}<span style={{ color: T.property }}>totalPosts</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.number }}>{posts.length}</span><span style={{ color: T.punctuation }}>,</span></Line>
            <Line n={11}>{'  '}<span style={{ color: T.property }}>totalReach</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.string }}>"215.7K"</span><span style={{ color: T.punctuation }}>,</span></Line>
            <Line n={12}>{'  '}<span style={{ color: T.property }}>avgEngagement</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.number }}>4.3</span><span style={{ color: T.punctuation }}>,  </span><span style={{ color: T.comment }}>// percent</span></Line>
            <Line n={13}>{'  '}<span style={{ color: T.property }}>competitors</span><span style={{ color: T.punctuation }}>: </span><span style={{ color: T.number }}>{competitors.length}</span><span style={{ color: T.punctuation }}>,</span></Line>
            <Line n={14}><span style={{ color: T.punctuation }}>{'};'}</span></Line>
          </>
        )}

        {activeTab === 'posts.json' && (
          <>
            <Line n={1}><span style={{ color: T.punctuation }}>{'{'}</span></Line>
            <Line n={2}>{'  '}<span style={{ color: T.property }}>"posts"</span><span style={{ color: T.punctuation }}>: [</span></Line>
            {posts.slice(0, 6).map((post, i) => (
              <div key={post.id}>
                <Line n={3 + i * 5}>{'    {'}</Line>
                <Line n={4 + i * 5}>
                  {'      '}
                  <span style={{ color: T.property }}>"title"</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${post.title.slice(0, 35)}${post.title.length > 35 ? '…' : ''}"`}</span>
                  <span style={{ color: T.punctuation }}>,</span>
                </Line>
                <Line n={5 + i * 5}>
                  {'      '}
                  <span style={{ color: T.property }}>"status"</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${post.status}"`}</span>
                  <span style={{ color: T.punctuation }}>,</span>
                </Line>
                <Line n={6 + i * 5}>
                  {'      '}
                  <span style={{ color: T.property }}>"platform"</span>
                  <span style={{ color: T.punctuation }}>: </span>
                  <span style={{ color: T.string }}>{`"${post.platform}"`}</span>
                </Line>
                <Line n={7 + i * 5}>{`    }${i < posts.slice(0, 6).length - 1 ? ',' : ''}`}</Line>
              </div>
            ))}
            <Line n={3 + posts.slice(0, 6).length * 5}>{'  ]'}</Line>
            <Line n={4 + posts.slice(0, 6).length * 5}>{'}'}</Line>
          </>
        )}
      </div>

      {/* ── Status Bar ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#007ACC', padding: '3px 12px', flexShrink: 0,
          fontSize: '12px', color: '#FFFFFF', fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <GitBranch size={13} />
            <span>main</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} />
            <span>{totalProblems} errors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} />
            <span>{totalWarnings} warnings</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{activeTab === 'posts.json' ? 'JSON' : activeTab === 'analytics.ts' ? 'TypeScript' : 'Dashboard'}</span>
          <span>UTF-8</span>
          <span>Ln 1, Col 1</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bell size={12} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Circle size={10} style={{ fill: '#4EC9B0', color: '#4EC9B0' }} />
            <span>Veblen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
