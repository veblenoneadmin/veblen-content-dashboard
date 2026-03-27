'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Globe, Webhook, KeyRound, X, Users } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0',
};

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'Other'] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_COLORS: Record<Platform, string> = {
  TikTok:    '#000000',
  Instagram: '#E1306C',
  YouTube:   '#FF0000',
  Other:     '#888888',
};

const TYPE_ICONS = {
  url:     Globe,
  api:     KeyRound,
  webhook: Webhook,
};

type CreatorSource = {
  id: string;
  name: string;
  platform: Platform;
  type: 'url' | 'api' | 'webhook';
  endpoint?: string;
  apiKey?: string;
  createdAt: string;
};

const EMPTY_FORM = { name: '', platform: 'TikTok' as Platform, type: 'url' as 'url' | 'api' | 'webhook', endpoint: '', apiKey: '' };

function AddCreatorModal({ onClose, onSave }: { onClose: () => void; onSave: (c: CreatorSource) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inp: React.CSSProperties = {
    background: VS.bg0, border: `1px solid ${VS.border}`, borderRadius: '6px',
    padding: '8px 11px', color: VS.text0, fontFamily: 'inherit', fontSize: '13px',
    width: '100%', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontFamily: 'monospace', color: VS.text2,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '5px',
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) { setError('Creator name is required.'); return; }
    if (!form.endpoint.trim()) { setError('URL / endpoint is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/creator-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          platform: form.platform,
          type: form.type,
          endpoint: form.endpoint.trim(),
          apiKey: form.apiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      onSave(data);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${VS.border}` }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: VS.text0 }}>Add Creator Source</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={lbl}>Creator Name</label>
            <input style={inp} placeholder="e.g. @garyvee" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Platform + Type row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Platform</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Source Type</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'url' | 'api' | 'webhook', apiKey: '' }))}>
                <option value="url">URL</option>
                <option value="api">API</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </div>

          {/* Endpoint */}
          <div>
            <label style={lbl}>
              {form.type === 'url' ? 'Profile URL' : form.type === 'api' ? 'API Endpoint' : 'Webhook URL'}
            </label>
            <input
              style={inp}
              placeholder={
                form.type === 'url' ? 'https://www.tiktok.com/@username' :
                form.type === 'api' ? 'https://api.example.com/creator/posts' :
                'https://hooks.example.com/webhook/...'
              }
              value={form.endpoint}
              onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))}
            />
          </div>

          {/* API Key — only for api type */}
          {form.type === 'api' && (
            <div>
              <label style={lbl}>API Key <span style={{ color: VS.text2, fontWeight: 400 }}>(optional)</span></label>
              <input style={inp} type="password" placeholder="sk-..." value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} />
            </div>
          )}

          {error && <div style={{ fontSize: '12px', color: VS.error }}>{error}</div>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button onClick={onClose} style={{ background: 'none', border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', color: VS.text2, fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ background: VS.accent, border: 'none', borderRadius: '6px', padding: '7px 20px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Add Source'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [sources, setSources] = useState<CreatorSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/creator-sources')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSources(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/creator-sources/${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
    } catch { /* silently fail */ }
    setDeleting(null);
  };

  const grouped = PLATFORMS.reduce<Record<string, CreatorSource[]>>((acc, p) => {
    acc[p] = sources.filter(s => s.platform === p);
    return acc;
  }, {} as Record<string, CreatorSource[]>);

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {showModal && (
        <AddCreatorModal
          onClose={() => setShowModal(false)}
          onSave={c => setSources(prev => [...prev, c])}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0, marginBottom: '4px' }}>
            Creator Watchlist
          </h1>
          <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>
            {loading ? 'Loading…' : `${sources.length} creator${sources.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', background: VS.accent, border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600 }}
        >
          <Plus size={14} />
          Add Source
        </button>
      </div>

      {/* Empty state */}
      {!loading && sources.length === 0 && (
        <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', padding: '56px', textAlign: 'center' }}>
          <Users size={32} style={{ color: VS.text2, marginBottom: '12px' }} />
          <p style={{ color: VS.text0, fontSize: '14px', fontWeight: 600, margin: '0 0 6px' }}>No creators yet</p>
          <p style={{ color: VS.text2, fontSize: '13px', margin: '0 0 20px' }}>Add a creator by URL, API, or webhook to start tracking their content.</p>
          <button onClick={() => setShowModal(true)} style={{ background: VS.accent, border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            Add First Creator
          </button>
        </div>
      )}

      {/* Grouped by platform */}
      {!loading && sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {PLATFORMS.filter(p => grouped[p].length > 0).map(platform => (
            <div key={platform}>
              {/* Platform header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PLATFORM_COLORS[platform], flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px' }}>{platform}</span>
                <span style={{ fontSize: '11px', color: VS.text2 }}>· {grouped[platform].length}</span>
              </div>

              {/* Creator cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[platform].map(source => {
                  const TypeIcon = TYPE_ICONS[source.type];
                  return (
                    <div key={source.id} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Platform dot */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: PLATFORM_COLORS[platform] + '18', border: `1px solid ${PLATFORM_COLORS[platform]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: PLATFORM_COLORS[platform] === '#000000' ? '#fff' : PLATFORM_COLORS[platform] }}>
                          {platform[0]}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, marginBottom: '3px' }}>{source.name}</div>
                        <div style={{ fontSize: '12px', color: VS.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {source.endpoint}
                        </div>
                      </div>

                      {/* Type badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '4px 10px', flexShrink: 0 }}>
                        <TypeIcon size={11} style={{ color: VS.text2 }} />
                        <span style={{ fontSize: '11px', color: VS.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{source.type}</span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(source.id)}
                        disabled={deleting === source.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px', borderRadius: '4px', opacity: deleting === source.id ? 0.4 : 1, flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = VS.error}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = VS.text2}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
