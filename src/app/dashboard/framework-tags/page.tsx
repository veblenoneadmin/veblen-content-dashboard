'use client';

import { useState, useEffect } from 'react';
import { Tag, Hash, Zap, MessageSquare, RefreshCw, ExternalLink } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', green: '#4ec9b0', yellow: '#dcdcaa', purple: '#c586c0',
  orange: '#ce9178',
};

const HOOK_COLORS: Record<string, string> = {
  'question':        '#007acc',
  'bold-statement':  '#c586c0',
  'story':           '#4ec9b0',
  'statistic':       '#dcdcaa',
  'controversy':     '#f44747',
  'relatability':    '#ce9178',
  'how-to':          '#6a9955',
  'list':            '#569cd6',
  'unknown':         '#666666',
};

function hookColor(hook: string) {
  const key = hook.toLowerCase().replace(/\s+/g, '-');
  return HOOK_COLORS[key] ?? '#888888';
}

type FrameworkTag = {
  id: string;
  postId: string;
  hookType: string;
  bodyStructure: string;
  ctaPattern: string;
  naturalDescription: string | null;
  analysisDate: string;
  createdAt: string;
};

type GroupedHook = {
  hookType: string;
  count: number;
  tags: FrameworkTag[];
};

function HookCard({ group, expanded, onToggle }: { group: GroupedHook; expanded: boolean; onToggle: () => void }) {
  const color = hookColor(group.hookType);
  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: color + '22', border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Hash size={16} style={{ color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: VS.text0, textTransform: 'capitalize' }}>{group.hookType}</div>
          <div style={{ fontSize: 12, color: VS.text2, marginTop: 2 }}>{group.count} posts analyzed</div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color, background: color + '22',
          border: `1px solid ${color}44`, borderRadius: 20, padding: '3px 10px',
        }}>
          {group.count}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${VS.border}` }}>
          {group.tags.map(tag => (
            <div key={tag.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${VS.bg3}` }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 11, background: VS.bg3, borderRadius: 4, padding: '2px 8px', color: VS.yellow }}>
                  {tag.bodyStructure}
                </span>
                <span style={{ fontSize: 11, background: VS.bg3, borderRadius: 4, padding: '2px 8px', color: VS.purple }}>
                  CTA: {tag.ctaPattern}
                </span>
                <span style={{ fontSize: 11, color: VS.text2 }}>
                  {tag.analysisDate}
                </span>
              </div>
              {tag.naturalDescription && (
                <p style={{ fontSize: 12, color: VS.text1, margin: 0, lineHeight: 1.5 }}>{tag.naturalDescription}</p>
              )}
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: VS.text2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                  {tag.postId}
                </span>
                {tag.postId.startsWith('http') && (
                  <a href={tag.postId} target="_blank" rel="noopener noreferrer" style={{ color: VS.text2, display: 'flex' }}>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FrameworkTagsPage() {
  const [tags, setTags] = useState<FrameworkTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'hooks' | 'structure' | 'all'>('hooks');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/framework-tags?limit=500');
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by hookType
  const hookGroups: GroupedHook[] = Object.values(
    tags.reduce((acc, tag) => {
      const key = tag.hookType;
      if (!acc[key]) acc[key] = { hookType: key, count: 0, tags: [] };
      acc[key].count++;
      acc[key].tags.push(tag);
      return acc;
    }, {} as Record<string, GroupedHook>)
  ).sort((a, b) => b.count - a.count);

  // Group by bodyStructure
  const structureGroups = Object.entries(
    tags.reduce((acc, tag) => {
      acc[tag.bodyStructure] = (acc[tag.bodyStructure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const topHook = hookGroups[0];
  const topStructure = structureGroups[0];
  const uniqueDates = [...new Set(tags.map(t => t.analysisDate))].length;

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: VS.text0, margin: 0, marginBottom: 4 }}>
            Framework Tags
          </h1>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            {loading ? 'Loading...' : `${tags.length} posts analyzed across ${uniqueDates} sessions`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: VS.text1, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Posts Analyzed', value: loading ? '...' : tags.length, color: VS.accent, icon: <Tag size={16} /> },
          { label: 'Hook Types', value: loading ? '...' : hookGroups.length, color: VS.green, icon: <Hash size={16} /> },
          { label: 'Top Hook', value: loading ? '...' : (topHook?.hookType || '—'), color: hookColor(topHook?.hookType || ''), icon: <Zap size={16} /> },
          { label: 'Top Structure', value: loading ? '...' : (topStructure?.[0] || '—'), color: VS.yellow, icon: <MessageSquare size={16} /> },
        ].map(s => (
          <div key={s.label} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: s.label.includes('Hook') && s.value !== '...' && typeof s.value === 'string' && s.value.length > 8 ? 12 : 20, fontWeight: 800, color: s.color, letterSpacing: '-0.5px', textTransform: 'capitalize' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: VS.text2, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['hooks', 'structure', 'all'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
            style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${viewMode === mode ? VS.accent : VS.border}`, background: viewMode === mode ? VS.accent + '22' : 'transparent', color: viewMode === mode ? VS.accent : VS.text2 }}>
            {mode === 'hooks' ? 'By Hook Type' : mode === 'structure' ? 'By Structure' : 'All Tags'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!loading && tags.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 12, padding: 56, textAlign: 'center' }}>
          <Tag size={32} style={{ color: VS.text2, marginBottom: 12 }} />
          <p style={{ color: VS.text0, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No framework tags yet</p>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            Run WF3 (Analytics Engine) to analyze creator posts and generate framework tags.
          </p>
        </div>
      )}

      {/* Hooks view */}
      {viewMode === 'hooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hookGroups.map(group => (
            <HookCard
              key={group.hookType}
              group={group}
              expanded={expanded === group.hookType}
              onToggle={() => setExpanded(expanded === group.hookType ? null : group.hookType)}
            />
          ))}
        </div>
      )}

      {/* Structure view */}
      {viewMode === 'structure' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {structureGroups.map(([structure, count]) => (
            <div key={structure} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: VS.text0, textTransform: 'capitalize' }}>{structure}</div>
                <div style={{ fontSize: 12, color: VS.text2, marginTop: 2 }}>body structure</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: VS.yellow }}>{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* All tags view */}
      {viewMode === 'all' && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px', padding: '10px 16px', borderBottom: `1px solid ${VS.border}` }}>
            {['Hook', 'Structure', 'CTA', 'Post ID', 'Date'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: VS.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
            ))}
          </div>
          {tags.slice(0, 200).map(tag => (
            <div key={tag.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px', padding: '10px 16px', borderBottom: `1px solid ${VS.bg3}` }}>
              <div>
                <span style={{ fontSize: 12, color: hookColor(tag.hookType), textTransform: 'capitalize' }}>{tag.hookType}</span>
              </div>
              <div style={{ fontSize: 12, color: VS.yellow, textTransform: 'capitalize' }}>{tag.bodyStructure}</div>
              <div style={{ fontSize: 12, color: VS.purple }}>{tag.ctaPattern}</div>
              <div style={{ fontSize: 11, color: VS.text2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tag.postId.length > 30 ? tag.postId.slice(0, 30) + '…' : tag.postId}
              </div>
              <div style={{ fontSize: 11, color: VS.text2 }}>{tag.analysisDate}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
