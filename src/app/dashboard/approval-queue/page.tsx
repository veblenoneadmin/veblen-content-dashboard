'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Send } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0', yellow: '#dcdcaa', purple: '#c586c0',
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'Pending Review': { color: VS.yellow,  bg: 'rgba(220,220,170,.12)' },
  'Approved':       { color: VS.green,   bg: 'rgba(78,201,176,.12)'  },
  'Rejected':       { color: VS.error,   bg: 'rgba(244,71,71,.12)'   },
  'Scheduled':      { color: VS.accent,  bg: 'rgba(0,122,204,.12)'   },
};

const PLATFORMS = ['TikTok', 'Instagram', 'Facebook'];

type Item = {
  id: string; contentId: string; title: string; type: string; status: string;
  scriptCopy: string | null; tiktokCaption: string | null; instagramCaption: string | null;
  facebookCaption: string | null; platform: string | null; caption: string | null;
  giveawayAttached: boolean; giveawayLink: string | null; triggerWord: string | null;
  referenceVideo: string | null; frameworkUsed: string | null; scheduledDate: string | null;
  notes: string | null; processed: boolean; generatedAt: string; approvedAt: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE['Pending Review'];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, color: s.color, background: s.bg }}>
      {status}
    </span>
  );
}

function ContentCard({ item, onUpdate }: { item: Item; onUpdate: (updated: Item) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [platform, setPlatform] = useState(item.platform ?? 'TikTok');
  const [scheduledDate, setScheduledDate] = useState(item.scheduledDate ?? '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [saving, setSaving] = useState(false);

  const caption = platform === 'TikTok' ? item.tiktokCaption
    : platform === 'Instagram' ? item.instagramCaption
    : item.facebookCaption;

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content-approvals/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) onUpdate(data);
    } catch { /* silently fail */ }
    setSaving(false);
  };

  const handleApprove = () => patch({
    status: 'Approved', platform, caption: caption ?? '', scheduledDate, notes,
  });

  const handleReject = () => patch({ status: 'Rejected', notes });

  const isPending = item.status === 'Pending Review';

  return (
    <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Type badge */}
        <div style={{ width: 36, height: 36, borderRadius: 8, background: item.type === 'video' ? 'rgba(99,102,241,.2)' : 'rgba(236,72,153,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: item.type === 'video' ? '#818cf8' : '#f472b6' }}>
            {item.type === 'video' ? 'VID' : 'CAR'}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: VS.text0, marginBottom: 3 }}>{item.title || item.contentId}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={item.status} />
            {item.frameworkUsed && (
              <span style={{ fontSize: 11, color: VS.text2 }}>{item.frameworkUsed}</span>
            )}
            {item.giveawayAttached && (
              <span style={{ fontSize: 11, color: VS.purple }}>+ Giveaway</span>
            )}
            <span style={{ fontSize: 11, color: VS.text2 }}>
              {new Date(item.generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Quick approve/reject — only for pending */}
        {isPending && !expanded && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => setExpanded(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${VS.green}18`, border: `1px solid ${VS.green}50`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', color: VS.green, fontSize: 12, fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Review
            </button>
          </div>
        )}

        {item.status === 'Approved' && item.scheduledDate && (
          <div style={{ fontSize: 12, color: VS.text2, flexShrink: 0 }}>
            <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {item.scheduledDate}
          </div>
        )}

        <button onClick={() => setExpanded(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: 4, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${VS.border}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Script / Copy */}
          {item.scriptCopy && (
            <div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                Script / Copy
              </div>
              <div style={{ background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: 8, padding: 12, fontSize: 13, color: VS.text1, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                {item.scriptCopy}
              </div>
            </div>
          )}

          {/* Captions */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
              Captions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['TikTok', item.tiktokCaption], ['Instagram', item.instagramCaption], ['Facebook', item.facebookCaption]].map(([p, cap]) => cap ? (
                <div key={p as string} style={{ background: VS.bg2, borderRadius: 6, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: VS.text2, fontWeight: 600, marginBottom: 4 }}>{p as string}</div>
                  <div style={{ fontSize: 12, color: VS.text1, lineHeight: 1.6 }}>{cap as string}</div>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Giveaway */}
          {item.giveawayAttached && item.giveawayLink && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${VS.purple}12`, border: `1px solid ${VS.purple}30`, borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 12, color: VS.purple, fontWeight: 600 }}>Giveaway Doc</span>
              <a href={item.giveawayLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: VS.accent, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                Open <ExternalLink size={11} />
              </a>
              {item.triggerWord && <span style={{ fontSize: 11, color: VS.text2 }}>Trigger: &ldquo;{item.triggerWord}&rdquo;</span>}
            </div>
          )}

          {/* Approval form — only for pending */}
          {isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Platform */}
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>Platform</div>
                  <select value={platform} onChange={e => setPlatform(e.target.value)}
                    style={{ width: '100%', background: VS.bg0, border: `1px solid ${VS.border}`, borderRadius: 6, padding: '7px 10px', color: VS.text0, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* Scheduled date */}
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>Schedule Date</div>
                  <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                    style={{ width: '100%', background: VS.bg0, border: `1px solid ${VS.border}`, borderRadius: 6, padding: '7px 10px', color: VS.text0, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>Notes (optional)</div>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..."
                  style={{ width: '100%', background: VS.bg0, border: `1px solid ${VS.border}`, borderRadius: 6, padding: '7px 10px', color: VS.text0, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={handleReject} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${VS.error}15`, border: `1px solid ${VS.error}40`, borderRadius: 6, padding: '7px 16px', cursor: 'pointer', color: VS.error, fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
                  <XCircle size={13} /> Reject
                </button>
                <button onClick={handleApprove} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${VS.green}18`, border: `1px solid ${VS.green}50`, borderRadius: 6, padding: '7px 20px', cursor: 'pointer', color: VS.green, fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
                  <CheckCircle2 size={13} /> {saving ? 'Saving...' : 'Approve'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApprovalQueuePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content-approvals');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { /* silently fail */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = (updated: Item) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const counts = {
    all:      items.length,
    pending:  items.filter(i => i.status === 'Pending Review').length,
    approved: items.filter(i => i.status === 'Approved').length,
    rejected: items.filter(i => i.status === 'Rejected').length,
    scheduled:items.filter(i => i.status === 'Scheduled').length,
  };

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: VS.text0, margin: 0, marginBottom: 4 }}>
            Approval Queue
          </h1>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>
            {loading ? 'Loading...' : `${counts.pending} pending review · ${counts.approved} approved · ${counts.scheduled} scheduled`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: VS.text1, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Pending',   value: counts.pending,   color: VS.yellow },
          { label: 'Approved',  value: counts.approved,  color: VS.green  },
          { label: 'Scheduled', value: counts.scheduled, color: VS.accent },
          { label: 'Rejected',  value: counts.rejected,  color: VS.error  },
        ].map(s => (
          <div key={s.label} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{loading ? '...' : s.value}</div>
            <div style={{ fontSize: 12, color: VS.text2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'Pending Review', label: `Pending (${counts.pending})` },
          { key: 'Approved',       label: `Approved (${counts.approved})` },
          { key: 'Scheduled',      label: `Scheduled (${counts.scheduled})` },
          { key: 'Rejected',       label: `Rejected (${counts.rejected})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === f.key ? VS.accent : VS.border}`, background: filter === f.key ? `${VS.accent}22` : 'transparent', color: filter === f.key ? VS.accent : VS.text2 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: 12, padding: 56, textAlign: 'center' }}>
          <Send size={32} style={{ color: VS.text2, marginBottom: 12 }} />
          <p style={{ color: VS.text0, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No content here yet</p>
          <p style={{ color: VS.text2, fontSize: 13, margin: 0 }}>Run WF4 (Content Generation) to generate content for review.</p>
        </div>
      )}

      {/* Content cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(item => (
          <ContentCard key={item.id} item={item} onUpdate={handleUpdate} />
        ))}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
