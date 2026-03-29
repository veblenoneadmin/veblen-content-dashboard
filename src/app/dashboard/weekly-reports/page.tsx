'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Zap, TrendingUp, Calendar, CheckSquare, RefreshCw, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', green: '#4ec9b0', yellow: '#dcdcaa', purple: '#c586c0',
  orange: '#ce9178',
};

type WeeklyReport = {
  id: string;
  weekStart: string;
  topHooksJson: string | null;
  topFrameworksJson: string | null;
  trendInsights: string | null;
  strategyRecommendations: string | null;
  deltaFromLastWeek: string | null;
  optimalPostingSchedule: string | null;
  contentSplitRecommendation: string | null;
  actionItems: string | null;
  rawReport: string | null;
  createdAt: string;
};

function safeParse(val: string | null): unknown {
  if (!val) return null;
  try { return JSON.parse(val); } catch { return val; }
}

function Section({ title, color, icon, children }: { title: string; color: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: VS.bg2, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: VS.text0, flex: 1 }}>{title}</span>
        <span style={{ color: VS.text2 }}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function HookList({ data }: { data: unknown }) {
  if (!data) return <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>No data</p>;
  const items = Array.isArray(data) ? data : [];
  if (!items.length) return <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>No hooks recorded</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((hook: Record<string, unknown>, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: VS.bg3, borderRadius: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 4, background: VS.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: VS.accent, flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: VS.text0, textTransform: 'capitalize' }}>
              {String(hook.hook_type || hook.hookType || hook.type || 'Unknown')}
            </div>
            {(hook.avg_engagement_rate || hook.avgEngagementRate) && (
              <div style={{ fontSize: 11, color: VS.text2 }}>
                avg engagement: {String(hook.avg_engagement_rate || hook.avgEngagementRate)}%
                {hook.post_count ? ` · ${hook.post_count} posts` : ''}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TextContent({ value }: { value: string | null }) {
  if (!value) return <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>No data</p>;
  const parsed = safeParse(value);

  if (typeof parsed === 'string') {
    return <p style={{ color: VS.text1, fontSize: 13, margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{parsed}</p>;
  }

  if (Array.isArray(parsed)) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {parsed.map((item, i) => (
          <li key={i} style={{ color: VS.text1, fontSize: 13, lineHeight: 1.6 }}>
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (parsed && typeof parsed === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(parsed as Record<string, unknown>).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: VS.bg3, borderRadius: 6 }}>
            <span style={{ fontSize: 12, color: VS.text2, fontWeight: 600, minWidth: 140, textTransform: 'capitalize' }}>
              {k.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: 12, color: VS.text1 }}>
              {typeof v === 'string' ? v : JSON.stringify(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <p style={{ color: VS.text1, fontSize: 13, margin: 0 }}>{String(parsed)}</p>;
}

function ReportCard({ report, isLatest }: { report: WeeklyReport; isLatest: boolean }) {
  const [open, setOpen] = useState(isLatest);
  const topHooks = safeParse(report.topHooksJson);
  const topFrameworks = safeParse(report.topFrameworksJson);

  return (
    <div style={{ background: VS.bg1, border: `1px solid ${isLatest ? VS.accent : VS.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {/* Card header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: VS.accent + '22', border: `1px solid ${VS.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={18} style={{ color: VS.accent }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: VS.text0 }}>
              Week of {report.weekStart}
            </span>
            {isLatest && (
              <span style={{ fontSize: 10, fontWeight: 700, color: VS.green, background: VS.green + '22', border: `1px solid ${VS.green}44`, borderRadius: 10, padding: '2px 8px' }}>
                LATEST
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: VS.text2, marginTop: 3 }}>
            Generated {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span style={{ color: VS.text2 }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${VS.border}` }}>
          <div style={{ paddingTop: 14 }}>

            <Section title="Top Performing Hooks" color={VS.accent} icon={<Zap size={14} />}>
              <HookList data={topHooks} />
            </Section>

            <Section title="Top Frameworks" color={VS.yellow} icon={<BarChart2 size={14} />}>
              <HookList data={topFrameworks} />
            </Section>

            <Section title="Trend Insights" color={VS.green} icon={<TrendingUp size={14} />}>
              <TextContent value={report.trendInsights} />
            </Section>

            <Section title="Strategy Recommendations" color={VS.purple} icon={<FileText size={14} />}>
              <TextContent value={report.strategyRecommendations} />
            </Section>

            <Section title="Action Items" color={VS.orange} icon={<CheckSquare size={14} />}>
              <TextContent value={report.actionItems} />
            </Section>

            <Section title="Optimal Posting Schedule" color={VS.accent} icon={<Calendar size={14} />}>
              <TextContent value={report.optimalPostingSchedule} />
            </Section>

            <Section title="Content Split Recommendation" color={VS.yellow} icon={<BarChart2 size={14} />}>
              <TextContent value={report.contentSplitRecommendation} />
            </Section>

            {report.deltaFromLastWeek && (
              <Section title="Delta From Last Week" color={VS.text2} icon={<TrendingUp size={14} />}>
                <TextContent value={report.deltaFromLastWeek} />
              </Section>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weekly-reports?limit=10');
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: VS.text0, margin: 0, marginBottom: 4 }}>
            Weekly Reports
          </h1>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            {loading ? 'Loading...' : `${reports.length} report${reports.length !== 1 ? 's' : ''} generated by WF3`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: VS.text1, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 12, padding: 56, textAlign: 'center' }}>
          <BarChart2 size={32} style={{ color: VS.text2, marginBottom: 12 }} />
          <p style={{ color: VS.text0, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No reports yet</p>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            Run WF3 (Analytics Engine) to generate your first weekly intelligence report.
          </p>
        </div>
      )}

      {/* Reports */}
      {reports.map((report, i) => (
        <ReportCard key={report.id} report={report} isLatest={i === 0} />
      ))}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
