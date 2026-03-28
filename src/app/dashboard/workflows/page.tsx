'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Power } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0', yellow: '#dcdcaa',
};

const N8N_URL = 'https://primary-s0q-production.up.railway.app';

const WORKFLOWS = [
  { num: 1,  id: '0yJMjB9HTHMx8xCa', name: 'Initial Creator Scrape',       trigger: 'manual',   canRun: true,  color: '#6366F1', description: 'One-time setup. Scrapes all creators on the watchlist, calculates engagement rates, loads everything into the database.', schedule: null },
  { num: 2,  id: 'NILI1T4BF1mOJRPS', name: 'Weekly Re-Scrape',              trigger: 'schedule', canRun: true,  color: '#0EA5E9', description: 'Runs every Monday at 2 AM. Fetches new posts since last scrape, updates DB, then auto-triggers Analytics Engine.', schedule: 'Every Monday 2:00 AM' },
  { num: 3,  id: 'dwxqwzab0DJN6ua8', name: 'Analytics Engine',              trigger: 'auto',     canRun: true,  color: '#8B5CF6', description: 'Analyses top posts from last 3 months. Claude tags hooks, frameworks, CTAs. Generates weekly trends report.', schedule: 'Auto after WF2' },
  { num: 4,  id: '8S2eNGnN0iCB7b12', name: 'Content Generation',            trigger: 'manual',   canRun: true,  color: '#EC4899', description: 'Reads trends report, generates 21 content pieces with Claude (scripts, hooks, captions). Sends to approval queue.', schedule: null },
  { num: 5,  id: 'urEZZsV9Q0pnCoKJ', name: 'Approval to Schedule',           trigger: 'schedule', canRun: false, color: '#F59E0B', description: 'Checks approval queue every 15 min. Approved items are scheduled via Metricool automatically.', schedule: 'Every 15 minutes' },
  { num: 6,  id: 'JgvzFoeHnnNHdBkx', name: 'ManyChat DM Automation',        trigger: 'webhook',  canRun: false, color: '#10B981', description: 'Fires on trigger word comment. Sends DM with giveaway link + ElevenLabs voice message.', schedule: 'Webhook (always listening)' },
  { num: 7,  id: 'g0OB6q4LxsnwwX2m', name: 'Weekly Report Notification',    trigger: 'schedule', canRun: true,  color: '#6366F1', description: 'Every Monday 8 AM: pulls metrics, Claude writes 3-sentence summary, posts formatted Slack report.', schedule: 'Every Monday 8:00 AM' },
  { num: 8,  id: 'pkYR4WGWEgKATu6q', name: 'Global Error Handler',          trigger: 'error',    canRun: false, color: '#EF4444', description: 'Silent guardian. Catches errors from all other workflows and sends Slack alert with full debug info.', schedule: 'Always active' },
  { num: 9,  id: '3IHsFm5SyqCWmM5X', name: 'Script Generation (Deep Voice)', trigger: 'manual',  canRun: true,  color: '#F97316', description: 'Takes top post transcripts + trends report, then Claude generates 5 scripts in the creator\'s authentic voice.', schedule: null },
];

type Status = { id: string; active: boolean | null; ok: boolean };
type Execution = { id: string; status: string; startedAt: string; stoppedAt?: string; mode: string };

function triggerBadge(trigger: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    manual:   { label: 'Manual',   color: '#a5b4fc', bg: 'rgba(99,102,241,.15)' },
    schedule: { label: 'Scheduled', color: '#fbbf24', bg: 'rgba(245,158,11,.12)' },
    auto:     { label: 'Auto',     color: '#34d399', bg: 'rgba(16,185,129,.12)' },
    webhook:  { label: 'Webhook',  color: '#34d399', bg: 'rgba(16,185,129,.12)' },
    error:    { label: 'Error Trap', color: '#f87171', bg: 'rgba(239,68,68,.12)' },
  };
  const s = map[trigger] ?? map.manual;
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function StatusDot({ active }: { active: boolean | null }) {
  if (active === true)  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: VS.green, boxShadow: `0 0 6px ${VS.green}80`, display: 'inline-block' }} title="Active in n8n" />;
  if (active === false) return <span style={{ width: 8, height: 8, borderRadius: '50%', background: VS.text2, display: 'inline-block' }} title="Inactive in n8n" />;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: VS.border, display: 'inline-block' }} title="Unknown" />;
}

function ExecStatus({ status }: { status: string }) {
  const s = status === 'success' ? VS.green : status === 'error' ? VS.error : VS.yellow;
  return <span style={{ fontSize: '11px', fontWeight: 600, color: s }}>{status}</span>;
}

function WorkflowCard({ wf, status, onRun, onToggle }: {
  wf: typeof WORKFLOWS[0];
  status: Status | undefined;
  onRun: (id: string, num: number) => Promise<void>;
  onToggle: (id: string, active: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loadingExec, setLoadingExec] = useState(false);
  const [running, setRunning] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [runResult, setRunResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const isActive = status?.active === true;

  const handleToggle = async () => {
    setToggling(true);
    setRunResult(null);
    const action = isActive ? 'deactivate' : 'activate';
    try {
      const res = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: wf.id }),
      });
      const data = await res.json();
      if (data.ok) {
        onToggle(wf.id, !isActive);
      } else {
        setRunResult({ ok: false, msg: data.error ?? 'Could not update workflow' });
        setTimeout(() => setRunResult(null), 8000);
      }
    } catch (e) {
      setRunResult({ ok: false, msg: String(e) });
      setTimeout(() => setRunResult(null), 8000);
    }
    setToggling(false);
  };

  const loadExecutions = async () => {
    if (executions.length) { setExpanded(e => !e); return; }
    setLoadingExec(true);
    setExpanded(true);
    try {
      const res = await fetch(`/api/n8n?action=executions&id=${wf.id}`);
      const data = await res.json();
      setExecutions(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoadingExec(false);
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', id: wf.id }),
      });
      const data = await res.json();
      if (data.ok || data.data?.executionId) {
        setRunResult({ ok: true, msg: 'Workflow triggered successfully' });
      } else {
        // Fallback: open in n8n
        window.open(`${N8N_URL}/workflow/${wf.id}`, '_blank');
        setRunResult({ ok: true, msg: 'Opened in n8n' });
      }
    } catch {
      window.open(`${N8N_URL}/workflow/${wf.id}`, '_blank');
      setRunResult({ ok: true, msg: 'Opened in n8n' });
    }
    setRunning(false);
    setTimeout(() => setRunResult(null), 4000);
    await onRun(wf.id, wf.num);
  };

  const timeAgo = (iso: string) => {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  };

  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Color badge */}
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: wf.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: wf.color }}>W{wf.num}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: VS.text0 }}>{wf.name}</span>
            <StatusDot active={status?.active ?? null} />
            {triggerBadge(wf.trigger)}
          </div>
          <div style={{ fontSize: '12px', color: VS.text2, lineHeight: 1.5, marginBottom: wf.schedule ? '4px' : 0 }}>{wf.description}</div>
          {wf.schedule && (
            <div style={{ fontSize: '11px', color: VS.text2, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={10} /> {wf.schedule}
            </div>
          )}
          {runResult && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: runResult.ok ? VS.green : VS.error, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {runResult.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {runResult.msg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Activate / Deactivate toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={isActive ? 'Deactivate in n8n' : 'Activate in n8n'}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isActive ? `${VS.green}18` : VS.bg2, border: `1px solid ${isActive ? VS.green + '50' : VS.border}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: isActive ? VS.green : VS.text2, fontSize: '12px', fontWeight: 600, opacity: toggling ? 0.5 : 1 }}
          >
            <Power size={12} />
            {toggling ? '...' : isActive ? 'On' : 'Off'}
          </button>

          <a href={`${N8N_URL}/workflow/${wf.id}`} target="_blank" rel="noopener noreferrer"
            style={{ background: 'none', border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: VS.text2, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            title="Open in n8n">
            <ExternalLink size={13} />
          </a>
          {wf.canRun && (
            <button onClick={handleRun} disabled={running}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: wf.color + '22', border: `1px solid ${wf.color}50`, borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', color: wf.color, fontSize: '12px', fontWeight: 600, opacity: running ? 0.6 : 1 }}>
              {running ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
              {running ? 'Running...' : 'Run Now'}
            </button>
          )}
          {!wf.canRun && (
            <span style={{ fontSize: '11px', color: VS.text2, padding: '5px 8px' }}>Auto</span>
          )}
          <button onClick={loadExecutions}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px' }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Executions panel */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${VS.border}`, padding: '12px 16px' }}>
          <div style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Recent Executions</div>
          {loadingExec && <div style={{ fontSize: '12px', color: VS.text2 }}>Loading...</div>}
          {!loadingExec && executions.length === 0 && (
            <div style={{ fontSize: '12px', color: VS.text2 }}>No executions found.</div>
          )}
          {!loadingExec && executions.map(ex => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: VS.bg2, borderRadius: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {ex.status === 'success'
                  ? <CheckCircle2 size={13} style={{ color: VS.green }} />
                  : ex.status === 'error'
                  ? <XCircle size={13} style={{ color: VS.error }} />
                  : <AlertTriangle size={13} style={{ color: VS.yellow }} />}
                <ExecStatus status={ex.status} />
                <span style={{ fontSize: '11px', color: VS.text2 }}>{ex.mode}</span>
              </div>
              <span style={{ fontSize: '11px', color: VS.text2 }}>{timeAgo(ex.startedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkflowsPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/n8n?action=statuses');
      const data = await res.json();
      if (Array.isArray(data)) setStatuses(data);
    } catch { /* silently fail */ }
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => { fetchStatuses(); }, [fetchStatuses]);

  const activeCount = statuses.filter(s => s.active === true).length;

  const handleRun = async () => { setTimeout(fetchStatuses, 2000); };

  const handleToggle = (id: string, active: boolean) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, active } : s));
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0, marginBottom: '4px' }}>
            n8n Workflows
          </h1>
          <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>
            {loading ? 'Checking status...' : `${activeCount} of ${WORKFLOWS.length} active`}
            {lastRefresh && <span style={{ marginLeft: '8px' }}>- refreshed {lastRefresh.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button onClick={fetchStatuses} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: VS.text1, fontSize: '13px', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Workflows', value: WORKFLOWS.length, color: VS.accent },
          { label: 'Active in n8n',   value: loading ? '...' : activeCount, color: VS.green },
          { label: 'Auto-triggered',  value: WORKFLOWS.filter(w => !w.canRun).length, color: VS.yellow },
        ].map(s => (
          <div key={s.label} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: VS.text2, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Workflow cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {WORKFLOWS.map(wf => (
          <WorkflowCard
            key={wf.id}
            wf={wf}
            status={statuses.find(s => s.id === wf.id)}
            onRun={handleRun}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
