'use client';

import { useState } from 'react';
import {
  Plus, X, Play, Camera, Briefcase, AtSign, Globe,
  CheckCircle2, AlertCircle, Clock, Trash2, ExternalLink,
  RefreshCw, Link2,
} from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#cccccc', text2: '#909090',
  accent: '#007acc', green: '#4ec9b0', yellow: '#dcdcaa', red: '#f44747',
};

type Platform = 'YouTube' | 'Instagram' | 'LinkedIn' | 'Twitter/X' | 'TikTok' | 'Other';
type Status = 'connected' | 'disconnected' | 'pending';

type SocialSource = {
  id: string;
  platform: Platform;
  handle: string;
  url: string;
  status: Status;
  followers: number;
  lastSync: string;
  notes: string;
};

const PLATFORM_META: Record<Platform, { icon: React.ElementType; color: string }> = {
  YouTube:    { icon: Play,      color: '#FF0000' },
  Instagram:  { icon: Camera,    color: '#E1306C' },
  LinkedIn:   { icon: Briefcase, color: '#0A66C2' },
  'Twitter/X':{ icon: AtSign,    color: '#1DA1F2' },
  TikTok:     { icon: Globe,     color: '#69C9D0' },
  Other:      { icon: Link2,     color: '#909090' },
};

const STATUS_META: Record<Status, { icon: React.ElementType; color: string; label: string }> = {
  connected:    { icon: CheckCircle2, color: '#4ec9b0', label: 'Connected' },
  disconnected: { icon: AlertCircle,  color: '#f44747', label: 'Disconnected' },
  pending:      { icon: Clock,        color: '#dcdcaa', label: 'Pending' },
};

const PLATFORMS: Platform[] = ['YouTube', 'Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Other'];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const SEED: SocialSource[] = [
  { id: '1', platform: 'YouTube',    handle: '@VeblenGroup',    url: 'https://youtube.com/@VeblenGroup',    status: 'pending',    followers: 0,  lastSync: '', notes: 'Main channel — weekly uploads' },
  { id: '2', platform: 'Instagram',  handle: '@veblengroup',    url: 'https://instagram.com/veblengroup',   status: 'connected',    followers: 355900, lastSync: '2026-03-30T07:30:00Z', notes: 'Primary brand account' },
  { id: '3', platform: 'LinkedIn',   handle: 'Veblen Group',    url: 'https://linkedin.com/company/veblen', status: 'connected',    followers: 18200,  lastSync: '2026-03-29T22:00:00Z', notes: 'Thought leadership content' },
  { id: '4', platform: 'Twitter/X',  handle: '@VeblenGroup',    url: 'https://x.com/VeblenGroup',           status: 'disconnected', followers: 4100,   lastSync: '2026-03-25T14:00:00Z', notes: 'API key expired — needs refresh' },
  { id: '5', platform: 'TikTok',     handle: '@veblengroup',    url: 'https://tiktok.com/@veblengroup',     status: 'pending',      followers: 0,      lastSync: '',                     notes: 'Account created, waiting for verification' },
];

const EMPTY_FORM = { platform: 'YouTube' as Platform, handle: '', url: '', notes: '' };

async function fetchYouTubeChannel(handle: string): Promise<{ subscribers: number; title: string } | null> {
  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!key) return null;
  const clean = handle.replace(/^@/, '');
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${clean}&key=${key}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  return {
    subscribers: parseInt(item.statistics?.subscriberCount ?? '0', 10),
    title: item.snippet?.title ?? handle,
  };
}

function AddSourceModal({ onClose, onSave }: { onClose: () => void; onSave: (s: SocialSource) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = {
    background: VS.bg0, border: `1px solid ${VS.border}`, borderRadius: '6px',
    padding: '8px 11px', color: VS.text0, fontFamily: 'inherit', fontSize: '13px',
    width: '100%', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontFamily: 'monospace', color: VS.text2,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '5px',
  };

  const handleUrlChange = (url: string) => {
    let handle = form.handle;
    if (form.platform === 'YouTube') {
      const match = url.match(/youtube\.com\/(@[\w.-]+|channel\/[\w-]+|c\/[\w-]+|user\/[\w-]+)/i);
      if (match) handle = match[1].startsWith('@') ? match[1] : `@${match[1].split('/').pop()}`;
    }
    setForm(f => ({ ...f, url, handle }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.url.trim())    { setError('URL is required.'); return; }
    if (!form.handle.trim()) { setError('Handle is required.'); return; }

    setLoading(true);
    let followers = 0;
    let status: Status = 'pending';

    if (form.platform === 'YouTube') {
      const yt = await fetchYouTubeChannel(form.handle.trim());
      if (yt) {
        followers = yt.subscribers;
        status = 'connected';
      } else {
        setError('Could not fetch YouTube channel — check the handle and try again.');
        setLoading(false);
        return;
      }
    }

    onSave({
      id: Date.now().toString(),
      platform: form.platform,
      handle: form.handle.trim(),
      url: form.url.trim(),
      status,
      followers,
      lastSync: status === 'connected' ? new Date().toISOString() : '',
      notes: form.notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ background: VS.bg1, border: `1px solid ${VS.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${VS.border}` }}>
          <span className="text-[13px] font-semibold" style={{ color: VS.text0 }}>Add Social Source</span>
          <button onClick={onClose} style={{ color: VS.text2 }}><X className="h-4 w-4" /></button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label style={lbl}>// platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const meta = PLATFORM_META[p];
                const Icon = meta.icon;
                const sel = form.platform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, platform: p }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px]"
                    style={{
                      background: sel ? `${meta.color}22` : VS.bg2,
                      border: `1px solid ${sel ? meta.color : VS.border}`,
                      color: sel ? meta.color : VS.text2,
                      fontWeight: sel ? 600 : 400,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />{p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={lbl}>// handle</label>
            <input style={inp} placeholder="@yourhandle" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} />
          </div>

          <div>
            <label style={lbl}>// profile url</label>
            <input style={inp} placeholder="https://..." value={form.url} onChange={e => handleUrlChange(e.target.value)} />
          </div>

          <div>
            <label style={lbl}>// notes</label>
            <textarea
              style={{ ...inp, resize: 'none', height: 72 }}
              placeholder="Optional notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {error && (
            <div className="text-[12px] px-3 py-2 rounded" style={{ background: `${VS.red}18`, border: `1px solid ${VS.red}44`, color: VS.red, fontFamily: 'monospace' }}>
              ✗ {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[13px]"
              style={{ background: VS.bg2, border: `1px solid ${VS.border}`, color: VS.text2 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-md text-[13px] font-medium"
              style={{ background: loading ? '#005a9e' : VS.accent, color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Connecting...' : 'Add Source'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialSourcesPage() {
  const [sources, setSources] = useState<SocialSource[]>(SEED);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<Platform | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');

  const filtered = sources.filter(s => {
    if (filter !== 'All' && s.platform !== filter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => setSources(s => s.filter(x => x.id !== id));

  const handleSave = (s: SocialSource) => {
    setSources(prev => [...prev, s]);
    setFilter('All');
    setStatusFilter('All');
  };

  const connected      = sources.filter(s => s.status === 'connected').length;
  const disconnected   = sources.filter(s => s.status === 'disconnected').length;
  const totalFollowers = sources.filter(s => s.status === 'connected').reduce((a, b) => a + b.followers, 0);

  return (
    <div style={{ color: VS.text0 }}>
      {showAdd && <AddSourceModal onClose={() => setShowAdd(false)} onSave={handleSave} />}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Social Media Sources</h1>
          <p className="text-[12px] mt-0.5" style={{ color: VS.text2, fontFamily: 'monospace' }}>// manage connected publishing channels</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium"
          style={{ background: VS.accent, color: '#fff', border: 'none' }}
        >
          <Plus className="h-4 w-4" />Add Source
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Sources',   value: sources.length,      color: VS.text0 },
          { label: 'Connected',        value: connected,            color: VS.green },
          { label: 'Disconnected',     value: disconnected,         color: VS.red },
          { label: 'Total Followers',  value: fmt(totalFollowers),  color: VS.accent },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg px-4 py-3" style={{ background: VS.bg1, border: `1px solid ${VS.border}` }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: VS.text2, fontFamily: 'monospace' }}>{stat.label}</p>
            <p className="text-[22px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['All', ...PLATFORMS] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className="px-3 py-1.5 rounded-md text-[12px]"
            style={{
              background: filter === p ? `${VS.accent}22` : VS.bg1,
              border: `1px solid ${filter === p ? VS.accent : VS.border}`,
              color: filter === p ? VS.accent : VS.text2,
              fontWeight: filter === p ? 600 : 400,
            }}
          >
            {p}
          </button>
        ))}
        <div className="h-6 w-px self-center mx-1" style={{ background: VS.border }} />
        {(['All', 'connected', 'disconnected', 'pending'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-md text-[12px] capitalize"
            style={{
              background: statusFilter === s ? `${VS.accent}22` : VS.bg1,
              border: `1px solid ${statusFilter === s ? VS.accent : VS.border}`,
              color: statusFilter === s ? VS.accent : VS.text2,
              fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Source cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: VS.text2 }}>
          <Link2 className="h-8 w-8 opacity-30" />
          <p className="text-[13px]">No sources match the current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(source => {
            const pMeta = PLATFORM_META[source.platform];
            const sMeta = STATUS_META[source.status];
            const PIcon = pMeta.icon;
            const SIcon = sMeta.icon;

            return (
              <div
                key={source.id}
                className="rounded-xl p-4 flex flex-col gap-3"
                style={{ background: VS.bg1, border: `1px solid ${VS.border}` }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${pMeta.color}20` }}>
                      <PIcon className="h-4 w-4" style={{ color: pMeta.color }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold leading-snug" style={{ color: VS.text0 }}>{source.handle}</p>
                      <p className="text-[11px]" style={{ color: pMeta.color }}>{source.platform}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0" style={{ background: `${sMeta.color}18`, border: `1px solid ${sMeta.color}44` }}>
                    <SIcon className="h-3 w-3" style={{ color: sMeta.color }} />
                    <span className="text-[10px] font-medium" style={{ color: sMeta.color }}>{sMeta.label}</span>
                  </div>
                </div>

                {/* Followers */}
                {source.followers > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px]" style={{ color: VS.text2 }}>
                    <span className="font-semibold" style={{ color: VS.text1 }}>{fmt(source.followers)}</span>
                    <span>followers</span>
                  </div>
                )}

                {/* Notes */}
                {source.notes && (
                  <p className="text-[12px] leading-relaxed" style={{ color: VS.text2 }}>{source.notes}</p>
                )}

                {/* Last sync */}
                {source.lastSync && (
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: VS.text2, fontFamily: 'monospace' }}>
                    <RefreshCw className="h-3 w-3" />
                    Last sync: {new Date(source.lastSync).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${VS.border}` }}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md"
                    style={{ background: VS.bg2, color: VS.text2, textDecoration: 'none', border: `1px solid ${VS.border}` }}
                  >
                    <ExternalLink className="h-3 w-3" />Open
                  </a>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md ml-auto"
                    style={{ background: 'transparent', border: `1px solid transparent`, color: VS.text2 }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${VS.red}18`;
                      (e.currentTarget as HTMLElement).style.color = VS.red;
                      (e.currentTarget as HTMLElement).style.borderColor = `${VS.red}44`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = VS.text2;
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
