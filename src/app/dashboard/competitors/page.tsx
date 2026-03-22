'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { LayoutGrid, TableIcon, TrendingUp, Minus, AlertTriangle } from 'lucide-react';

function formatNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function CompetitorsPage() {
  const { competitors } = useDashboard();
  const [view, setView] = useState<'cards' | 'table'>('cards');

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Competitors
          </h1>
          <p style={{ color: '#888888', fontSize: '14px', margin: '4px 0 0 0' }}>
            Track and compare competitor performance
          </p>
        </div>
        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#1A1A1A',
            border: '1px solid #262626',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {(['cards', 'table'] as const).map((v) => {
            const isActive = view === v;
            const Icon = v === 'cards' ? LayoutGrid : TableIcon;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '7px 14px',
                  backgroundColor: isActive ? '#262626' : 'transparent',
                  border: 'none',
                  color: isActive ? '#FFFFFF' : '#666666',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Icon size={14} />
                <span style={{ textTransform: 'capitalize' }}>{v}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Banner */}
      <div
        style={{
          backgroundColor: 'rgba(212,132,90,0.08)',
          border: '1px solid rgba(212,132,90,0.25)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        <AlertTriangle size={16} color="#D4845A" />
        <span style={{ fontSize: '13px', color: '#D4845A' }}>
          ViralVault Studio has grown significantly — 2 of 3 competitors are trending up.
        </span>
      </div>

      {view === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {competitors.map((comp) => (
            <div
              key={comp.id}
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #262626',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>{comp.name}</div>
                  <div style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>{comp.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {comp.trend === 'up' ? (
                    <TrendingUp size={14} color="#6AAF6A" />
                  ) : (
                    <Minus size={14} color="#888888" />
                  )}
                  <span style={{ fontSize: '11px', color: comp.trend === 'up' ? '#6AAF6A' : '#888888' }}>
                    {comp.trend === 'up' ? 'Trending up' : 'Stable'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { emoji: '▶️', label: 'YouTube', value: formatNum(comp.youtube) },
                  { emoji: '📷', label: 'Instagram', value: formatNum(comp.instagram) },
                  { emoji: '💼', label: 'LinkedIn', value: formatNum(comp.linkedin) },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px' }}>{item.emoji}</span>
                      <span style={{ fontSize: '13px', color: '#AAAAAA' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #262626',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#666666', marginBottom: '2px' }}>Posts</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{comp.posts}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#666666', marginBottom: '2px' }}>Avg Eng.</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#D4845A' }}>{comp.avgEngagement}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #262626',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #262626' }}>
                {['Company', 'Category', 'YouTube', 'Instagram', 'LinkedIn', 'Posts', 'Avg Eng.', 'Trend'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      color: '#666666',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, idx) => (
                <tr
                  key={comp.id}
                  style={{
                    borderBottom: idx < competitors.length - 1 ? '1px solid #262626' : 'none',
                  }}
                >
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    {comp.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{comp.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#AAAAAA' }}>{formatNum(comp.youtube)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#AAAAAA' }}>{formatNum(comp.instagram)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#AAAAAA' }}>{formatNum(comp.linkedin)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#AAAAAA' }}>{comp.posts}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#D4845A' }}>
                    {comp.avgEngagement}%
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {comp.trend === 'up' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6AAF6A' }}>
                        <TrendingUp size={14} />
                        <span style={{ fontSize: '12px' }}>Up</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888888' }}>
                        <Minus size={14} />
                        <span style={{ fontSize: '12px' }}>Flat</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
