'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { monthlyReachData, engagementData } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

const timeRanges = ['7d', '14d', '30d', '90d'];
const tabs = ['Overview', 'Instagram', 'Twitter/X', 'Content ROI'];

const platformBreakdown = [
  { platform: 'Instagram', color: '#E1306C', followers: '113.4K', metrics: [{ label: 'Posts', value: '47' }, { label: 'Avg Reach', value: '2.4K' }, { label: 'Eng Rate', value: '4.8%' }, { label: 'Saves', value: '891' }] },
  { platform: 'Twitter/X', color: '#1DA1F2', followers: '38K', metrics: [{ label: 'Tweets', value: '124' }, { label: 'Avg Reach', value: '612' }, { label: 'Eng Rate', value: '2.1%' }, { label: 'RTs', value: '244' }] },
  { platform: 'LinkedIn', color: '#0A66C2', followers: '64.3K', metrics: [{ label: 'Posts', value: '28' }, { label: 'Avg Reach', value: '2.3K' }, { label: 'Eng Rate', value: '5.2%' }, { label: 'Shares', value: '412' }] },
  { platform: 'YouTube', color: '#FF0000', followers: '4.9K', metrics: [{ label: 'Videos', value: '9' }, { label: 'Avg Views', value: '544' }, { label: 'Eng Rate', value: '3.1%' }, { label: 'Subs', value: '183' }] },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-input)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {entry.value >= 1000 ? `${(entry.value / 1000).toFixed(1)}K` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EngagementTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-input)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value}%</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { posts } = useDashboard();
  const [activeTimeRange, setActiveTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('Overview');

  const totalPosts = posts.length;
  const totalReach = 215700;
  const avgEngagement = 4.3;
  const totalEngagement = Math.round(totalReach * (avgEngagement / 100));

  const statCards = [
    { label: 'Total Posts', value: totalPosts.toString() },
    { label: 'Total Reach', value: '215.7K' },
    { label: 'Avg Engagement', value: `${avgEngagement}%` },
    { label: 'Total Engagement', value: totalEngagement.toLocaleString() },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Performance overview across all platforms</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {timeRanges.map((r) => (
            <button
              key={r} onClick={() => setActiveTimeRange(r)}
              style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid', borderColor: activeTimeRange === r ? 'var(--accent)' : 'var(--border)', backgroundColor: activeTimeRange === r ? 'var(--accent-tint)' : 'transparent', color: activeTimeRange === r ? 'var(--accent)' : 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 20px', background: 'transparent', border: 'none', borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent', color: isActive ? 'var(--accent)' : 'var(--text-muted)', fontSize: '13px', fontWeight: isActive ? 600 : 400, cursor: 'pointer', marginBottom: '-1px' }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab !== 'Overview' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-faint)', fontSize: '14px' }}>
          {activeTab} analytics coming soon
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {statCards.map((card) => (
              <div key={card.label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Platform Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {platformBreakdown.map((plat) => (
              <div key={plat.platform} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: plat.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{plat.platform}</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>{plat.followers}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {plat.metrics.map((m) => (
                    <div key={m.label}>
                      <div style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>{m.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Total Reach / Impressions</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyReachData} barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--border-input)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="instagram" name="Instagram" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="twitter" name="Twitter/X" fill="#1DA1F2" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="linkedin" name="LinkedIn" fill="#6BA3E0" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Avg Engagement Rate</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4845A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4845A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border-input)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<EngagementTooltip />} />
                  <Area type="monotone" dataKey="rate" name="Engagement" stroke="var(--accent)" strokeWidth={2} fill="url(#accentGrad)" dot={{ fill: 'var(--accent)', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
