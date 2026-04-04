'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Play, Loader2, Copy, Download, RefreshCw, ChevronRight, ChevronDown,
  Sparkles, FileText, Film, Volume2, Type, Upload, Check, AlertCircle,
  Wand2, Globe, Link2, X, Send,
} from 'lucide-react';
import NICHE_PROFILES, { type NicheProfile } from '@/lib/youtube-niches';

// ── VS Dark palette ─────────────────────────────────────────
const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', accentBg: 'rgba(0,122,204,0.13)',
  green: '#4ec9b0', red: '#f44747', yellow: '#dcdcaa', orange: '#ce9178',
  purple: '#c586c0',
};

// ── Types ───────────────────────────────────────────────────
interface Draft {
  title: string;
  description: string;
  tags: string[];
  hook: string;
  script: string;
  brollPrompts: string[];
  thumbnailText: string;
}

type PipelineStage = 'idle' | 'drafting' | 'drafted' | 'producing' | 'produced' | 'uploading' | 'uploaded';

const STAGES = [
  { key: 'draft', label: 'Script', icon: FileText, color: VS.accent },
  { key: 'broll', label: 'B-Roll', icon: Film, color: VS.purple },
  { key: 'voice', label: 'Voiceover', icon: Volume2, color: VS.green },
  { key: 'captions', label: 'Captions', icon: Type, color: VS.yellow },
  { key: 'assemble', label: 'Assembly', icon: Play, color: VS.orange },
  { key: 'upload', label: 'Upload', icon: Upload, color: '#FF0000' },
];

const LOADING_MSGS = [
  'Connecting to Claude...',
  'Researching trending angles...',
  'Crafting the hook...',
  'Writing the script...',
  'Polishing for delivery...',
  'Generating b-roll prompts...',
  'Finalizing draft...',
];

// ── Helper: word count ──────────────────────────────────────
function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ── Helper: estimated duration ──────────────────────────────
function estimateDuration(text: string, wpm: number): string {
  const words = wordCount(text);
  const secs = Math.round((words / wpm) * 60);
  return `~${secs}s`;
}

// ── Niche Card ──────────────────────────────────────────────
function NicheCard({ niche, selected, onClick }: { niche: NicheProfile; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '8px',
        background: selected ? `${niche.primaryColor}18` : VS.bg1,
        border: `1px solid ${selected ? niche.primaryColor : VS.border}`,
        color: selected ? VS.text0 : VS.text2,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{niche.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: selected ? 600 : 400 }}>{niche.label}</div>
        <div style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {niche.tone}
        </div>
      </div>
      {selected && <Check size={14} style={{ color: niche.primaryColor, flexShrink: 0 }} />}
    </button>
  );
}

// ── Pipeline Progress Bar ───────────────────────────────────
function PipelineProgress({ stage, activeStep }: { stage: PipelineStage; activeStep: number }) {
  if (stage === 'idle') return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 0' }}>
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 10px', borderRadius: '6px', flex: 1,
              background: active ? `${s.color}18` : done ? `${VS.green}12` : VS.bg2,
              border: `1px solid ${active ? s.color : done ? `${VS.green}44` : VS.border}`,
              transition: 'all 0.3s',
            }}>
              {active ? (
                <Loader2 size={12} style={{ color: s.color, animation: 'spin 1s linear infinite' }} />
              ) : done ? (
                <Check size={12} style={{ color: VS.green }} />
              ) : (
                <Icon size={12} style={{ color: VS.text2 }} />
              )}
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: active ? s.color : done ? VS.green : VS.text2 }}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <ChevronRight size={10} style={{ color: VS.text2, flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Script Preview ──────────────────────────────────────────
function ScriptPreview({ draft, niche }: { draft: Draft; niche: NicheProfile }) {
  const lines = draft.script.split('\n').filter(Boolean);

  return (
    <div>
      {lines.map((line, i) => {
        const isBroll = line.trim().startsWith('[B-ROLL');
        const isPause = line.trim() === '[PAUSE]';

        if (isPause) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: VS.border }} />
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>pause</span>
              <div style={{ flex: 1, height: '1px', background: VS.border }} />
            </div>
          );
        }

        if (isBroll) {
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', margin: '6px 0', borderRadius: '6px',
              background: `${VS.purple}12`, border: `1px solid ${VS.purple}33`,
            }}>
              <Film size={11} style={{ color: VS.purple, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: VS.purple, fontFamily: 'monospace' }}>{line.trim()}</span>
            </div>
          );
        }

        return (
          <p key={i} style={{ fontSize: '13px', lineHeight: 1.7, color: VS.text1, margin: '6px 0' }}>
            {i === 0 ? (
              <span style={{ color: niche.primaryColor, fontWeight: 600 }}>{line}</span>
            ) : line}
          </p>
        );
      })}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function YouTubeShortsPage() {
  // State
  const [selectedNiche, setSelectedNiche] = useState<NicheProfile>(NICHE_PROFILES[0]);
  const [topic, setTopic] = useState('');
  const [sourceUrls, setSourceUrls] = useState<string[]>(['']);
  const [showSources, setShowSources] = useState(false);
  const [showNicheDetails, setShowNicheDetails] = useState(false);

  const [stage, setStage] = useState<PipelineStage>('idle');
  const [activeStep, setActiveStep] = useState(-1);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState<Draft | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [producing, setProducing] = useState(false);
  const [produceResults, setProduceResults] = useState<Record<string, unknown> | null>(null);
  const [ytStatus, setYtStatus] = useState<{ connected: boolean; channel?: { title: string } } | null>(null);
  const [history, setHistory] = useState<{ id: string; topic: string; title: string; status: string; nicheId: string; createdAt: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loading animation
  const startLoading = useCallback(() => {
    setLoadingMsg(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length;
      setLoadingMsg(i);
    }, 3000);
  }, []);

  const stopLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Generate script
  const handleGenerate = async () => {
    setError('');
    setDraft(null);
    setStage('drafting');
    setActiveStep(0);
    startLoading();

    try {
      const res = await fetch('/api/youtube-shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft',
          topic: topic.trim() || undefined,
          niche: selectedNiche,
          sourceUrls: sourceUrls.filter(u => u.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Server returned HTTP ${res.status}`);
        setStage('idle');
        setActiveStep(-1);
        return;
      }

      setDraft(data.draft);
      setStage('drafted');
      setActiveStep(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed');
      setStage('idle');
      setActiveStep(-1);
    } finally {
      stopLoading();
    }
  };

  // Rewrite script
  const handleRewrite = async () => {
    if (!editInstruction.trim() || !draft) return;
    setRewriting(true);
    setError('');

    try {
      const res = await fetch('/api/youtube-shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rewrite',
          script: draft,
          instruction: editInstruction.trim(),
          niche: selectedNiche,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Rewrite failed');
        return;
      }

      setDraft(data.draft);
      setEditInstruction('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Rewrite failed');
    } finally {
      setRewriting(false);
    }
  };

  // Copy script
  const handleCopy = () => {
    if (!draft) return;
    const text = `${draft.title}\n\n${draft.script}\n\nDescription: ${draft.description}\nTags: ${draft.tags.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download script
  const handleDownload = () => {
    if (!draft) return;
    const text = JSON.stringify(draft, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save draft to database
  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch('/api/youtube-shorts/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || draft.title,
          nicheId: selectedNiche.id,
          status: 'draft',
          title: draft.title,
          description: draft.description,
          tags: draft.tags,
          hook: draft.hook,
          script: draft.script,
          brollPrompts: draft.brollPrompts,
          thumbnailText: draft.thumbnailText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setSavedId(data.id);
      }
    } catch {
      // silent fail for save
    } finally {
      setSaving(false);
    }
  };

  // Produce (TTS, b-roll, captions)
  const handleProduce = async () => {
    if (!draft) return;
    setProducing(true);
    setError('');
    setStage('producing');
    setActiveStep(1); // start at b-roll

    try {
      // Step through stages with visual updates
      const stageDelay = (step: number) => new Promise<void>(r => {
        setActiveStep(step);
        setTimeout(r, 800);
      });

      await stageDelay(1); // b-roll
      await stageDelay(2); // voiceover
      await stageDelay(3); // captions

      const res = await fetch('/api/youtube-shorts/produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, niche: selectedNiche }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Production failed');
        setStage('drafted');
        setActiveStep(1);
        return;
      }

      await stageDelay(4); // assembly
      setProduceResults(data.results);
      setStage('produced');
      setActiveStep(5);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Production failed');
      setStage('drafted');
      setActiveStep(1);
    } finally {
      setProducing(false);
    }
  };

  // Check YouTube connection
  const checkYouTube = async () => {
    try {
      const res = await fetch('/api/youtube-shorts/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' }),
      });
      const data = await res.json();
      setYtStatus(data);
    } catch {
      setYtStatus({ connected: false });
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/youtube-shorts/db');
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch {
      // silent
    }
  };

  // Source URL management
  const addSource = () => setSourceUrls(u => [...u, '']);
  const removeSource = (i: number) => setSourceUrls(u => u.filter((_, j) => j !== i));
  const updateSource = (i: number, v: string) => setSourceUrls(u => u.map((s, j) => j === i ? v : s));

  return (
    <div style={{ color: VS.text0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>YouTube Shorts</h1>
          <p className="text-[12px] mt-0.5" style={{ color: VS.text2, fontFamily: 'monospace' }}>// AI-powered short-form video pipeline</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(v => !v); if (!showHistory) fetchHistory(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: showHistory ? VS.accentBg : VS.bg1, border: `1px solid ${showHistory ? VS.accent : VS.border}`, color: showHistory ? VS.accent : VS.text2 }}
          >
            <FileText size={13} />History
          </button>
          {draft && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
                style={{ background: VS.bg1, border: `1px solid ${VS.border}`, color: VS.text2 }}
              >
                {copied ? <Check size={13} style={{ color: VS.green }} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
                style={{ background: VS.bg1, border: `1px solid ${VS.border}`, color: VS.text2 }}
              >
                <Download size={13} />JSON
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
                style={{ background: savedId ? `${VS.green}18` : VS.bg1, border: `1px solid ${savedId ? VS.green : VS.border}`, color: savedId ? VS.green : VS.text2 }}
              >
                {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : savedId ? <Check size={13} /> : <Download size={13} />}
                {saving ? 'Saving...' : savedId ? 'Saved' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Progress */}
      <PipelineProgress stage={stage} activeStep={activeStep} />

      {/* Main Grid: Left (config) + Right (output) */}
      <div style={{ display: 'grid', gridTemplateColumns: draft ? '380px 1fr' : '1fr', gap: '16px' }}>

        {/* ── LEFT: Config Panel ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Niche Selector */}
          <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setShowNicheDetails(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: VS.text0,
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: VS.accent }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Niche</span>
                <span style={{ fontSize: '11px', color: VS.text2 }}>— {selectedNiche.emoji} {selectedNiche.label}</span>
              </div>
              <ChevronDown size={13} style={{ color: VS.text2, transform: showNicheDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showNicheDetails && (
              <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {NICHE_PROFILES.map(n => (
                  <NicheCard key={n.id} niche={n} selected={n.id === selectedNiche.id} onClick={() => setSelectedNiche(n)} />
                ))}
              </div>
            )}

            {/* Selected niche details */}
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: `${selectedNiche.wordsPerMinute} wpm`, color: VS.accent },
                { label: selectedNiche.energyLevel, color: VS.green },
                { label: selectedNiche.wordCount + ' words', color: VS.yellow },
              ].map(tag => (
                <span key={tag.label} style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                  fontSize: '10px', fontFamily: 'monospace',
                  background: `${tag.color}15`, border: `1px solid ${tag.color}33`, color: tag.color,
                }}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={14} style={{ color: VS.accent }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: VS.text0 }}>Topic</span>
              <span style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace' }}>optional — leave blank for auto-pick</span>
            </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={`e.g. "Why GPT-5 changes everything for developers" or leave empty for trending ${selectedNiche.label} topic...`}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', resize: 'vertical',
                background: VS.bg0, border: `1px solid ${VS.border}`, color: VS.text0,
                fontSize: '13px', lineHeight: 1.5, outline: 'none',
              }}
            />
          </div>

          {/* Source URLs (collapsible) */}
          <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setShowSources(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: VS.text0,
              }}
            >
              <div className="flex items-center gap-2">
                <Globe size={14} style={{ color: VS.accent }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Source URLs</span>
                <span style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace' }}>optional — research material</span>
              </div>
              <ChevronDown size={13} style={{ color: VS.text2, transform: showSources ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showSources && (
              <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sourceUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Link2 size={12} style={{ color: VS.text2, flexShrink: 0 }} />
                    <input
                      value={url}
                      onChange={e => updateSource(i, e.target.value)}
                      placeholder="https://..."
                      style={{
                        flex: 1, padding: '7px 10px', borderRadius: '6px',
                        background: VS.bg0, border: `1px solid ${VS.border}`,
                        color: VS.text0, fontSize: '12px', outline: 'none',
                      }}
                    />
                    {sourceUrls.length > 1 && (
                      <button onClick={() => removeSource(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSource}
                  className="flex items-center gap-1 text-[11px] mt-1"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.accent }}
                >
                  + Add URL
                </button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={stage === 'drafting'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px', borderRadius: '10px',
              background: stage === 'drafting' ? VS.bg2 : VS.accent,
              border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: stage === 'drafting' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {stage === 'drafting' ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                {LOADING_MSGS[loadingMsg]}
              </>
            ) : draft ? (
              <>
                <RefreshCw size={15} />
                Regenerate Script
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Script
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: `${VS.red}12`, border: `1px solid ${VS.red}33` }}>
              <AlertCircle size={14} style={{ color: VS.red, flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: VS.red, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* Hook Templates Reference */}
          {!draft && (
            <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '14px 16px' }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: VS.text2 }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: VS.text2 }}>Hook Templates — {selectedNiche.label}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedNiche.hookTemplates.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2" style={{ fontSize: '11px', color: VS.text2, lineHeight: 1.5 }}>
                    <span style={{ color: selectedNiche.primaryColor, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}.</span>
                    {hook}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Output Panel ──────────────────────────── */}
        {draft && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Title + Meta */}
            <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: VS.text0, marginBottom: '8px', lineHeight: 1.3 }}>
                {draft.title}
              </h2>
              <p style={{ fontSize: '12px', color: VS.text2, marginBottom: '12px', lineHeight: 1.6 }}>
                {draft.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {draft.tags.map((tag, i) => (
                  <span key={i} style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace',
                    background: `${VS.accent}15`, border: `1px solid ${VS.accent}33`, color: VS.accent,
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4" style={{ fontSize: '11px', fontFamily: 'monospace', color: VS.text2 }}>
                <span>{wordCount(draft.script)} words</span>
                <span>{estimateDuration(draft.script, selectedNiche.wordsPerMinute)}</span>
                <span>{draft.brollPrompts.length} b-roll shots</span>
              </div>
            </div>

            {/* Hook Highlight */}
            <div style={{
              background: `${selectedNiche.primaryColor}10`, border: `1px solid ${selectedNiche.primaryColor}33`,
              borderRadius: '10px', padding: '14px 18px',
              borderLeft: `3px solid ${selectedNiche.primaryColor}`,
            }}>
              <div style={{ fontSize: '9px', fontFamily: 'monospace', color: selectedNiche.primaryColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                Hook — first 3 seconds
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, lineHeight: 1.5 }}>
                &ldquo;{draft.hook}&rdquo;
              </p>
            </div>

            {/* Script Body */}
            <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '20px' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: VS.accent }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Voiceover Script</span>
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: VS.text2 }}>
                  {selectedNiche.pacing}
                </div>
              </div>
              <ScriptPreview draft={draft} niche={selectedNiche} />
            </div>

            {/* B-Roll Prompts */}
            <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px' }}>
              <div className="flex items-center gap-2 mb-3">
                <Film size={14} style={{ color: VS.purple }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>B-Roll Prompts</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {draft.brollPrompts.map((prompt, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: '8px',
                    background: VS.bg0, border: `1px solid ${VS.border}`,
                  }}>
                    <div style={{ fontSize: '9px', fontFamily: 'monospace', color: VS.purple, marginBottom: '4px' }}>SHOT {i + 1}</div>
                    <p style={{ fontSize: '11px', color: VS.text1, lineHeight: 1.5 }}>{prompt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnail Text */}
            <div style={{
              background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0,
                background: `linear-gradient(135deg, ${selectedNiche.primaryColor}44, ${selectedNiche.secondaryColor}44)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${VS.border}`,
              }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: VS.text0, textAlign: 'center', padding: '4px', lineHeight: 1.2 }}>
                  {draft.thumbnailText}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: VS.text0, marginBottom: '4px' }}>Thumbnail Text</div>
                <p style={{ fontSize: '12px', color: VS.text2, lineHeight: 1.5 }}>
                  {draft.thumbnailText} — overlay on a 9:16 thumbnail with {selectedNiche.aesthetic}
                </p>
              </div>
            </div>

            {/* Edit/Rewrite Bar */}
            <div style={{
              background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              position: 'sticky', bottom: '16px',
            }}>
              <Wand2 size={14} style={{ color: VS.accent, flexShrink: 0 }} />
              <input
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRewrite(); }}
                placeholder="Edit script... (e.g. 'make the hook more dramatic' or 'add a statistic')"
                style={{
                  flex: 1, padding: '8px 0', background: 'none', border: 'none',
                  color: VS.text0, fontSize: '13px', outline: 'none',
                }}
              />
              <button
                onClick={handleRewrite}
                disabled={rewriting || !editInstruction.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '6px',
                  background: editInstruction.trim() ? VS.accent : VS.bg2,
                  border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600,
                  cursor: editInstruction.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {rewriting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                {rewriting ? 'Rewriting...' : 'Rewrite'}
              </button>
            </div>

            {/* Produce + Upload Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleProduce}
                disabled={producing || stage === 'producing'}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '10px',
                  background: producing ? VS.bg2 : VS.purple,
                  border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
                  cursor: producing ? 'not-allowed' : 'pointer',
                }}
              >
                {producing ? (
                  <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Producing...</>
                ) : produceResults ? (
                  <><Check size={15} />Produced</>
                ) : (
                  <><Film size={15} />Produce Video</>
                )}
              </button>
              <button
                onClick={() => { checkYouTube(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '10px',
                  background: ytStatus?.connected ? `${VS.green}18` : VS.bg1,
                  border: `1px solid ${ytStatus?.connected ? VS.green : VS.border}`,
                  color: ytStatus?.connected ? VS.green : VS.text2,
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Upload size={15} />
                {ytStatus?.connected ? ytStatus.channel?.title || 'Connected' : 'YouTube'}
              </button>
            </div>

            {/* Production Results */}
            {produceResults && (
              <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Check size={14} style={{ color: VS.green }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: VS.text0 }}>Production Complete</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'B-Roll', value: `${(produceResults.broll as { images?: unknown[] })?.images?.length || 0} shots`, color: VS.purple, icon: Film },
                    { label: 'Voiceover', value: (produceResults.voiceover as { durationFormatted?: string })?.durationFormatted || '—', color: VS.green, icon: Volume2 },
                    { label: 'Captions', value: `${(produceResults.captions as { wordCount?: number })?.wordCount || 0} words`, color: VS.yellow, icon: Type },
                    { label: 'Assembly', value: (produceResults.assembly as { resolution?: string })?.resolution || '1080x1920', color: VS.orange, icon: Play },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} style={{ padding: '10px 12px', borderRadius: '8px', background: VS.bg0, border: `1px solid ${VS.border}` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={11} style={{ color: item.color }} />
                          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: item.color }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: VS.text0 }}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace', marginTop: '10px' }}>
                  FFmpeg assembly ready. Add REPLICATE_API_TOKEN to .env.local for AI-generated b-roll images.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div style={{ marginTop: '16px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '16px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={14} style={{ color: VS.accent }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Recent Shorts</span>
            </div>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, padding: '4px' }}>
              <X size={14} />
            </button>
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: '12px', color: VS.text2, textAlign: 'center', padding: '20px 0' }}>No saved shorts yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {history.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px', background: VS.bg0, border: `1px solid ${VS.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: VS.text0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || item.topic}
                    </div>
                    <div style={{ fontSize: '10px', color: VS.text2, fontFamily: 'monospace', marginTop: '2px' }}>
                      {NICHE_PROFILES.find(n => n.id === item.nicheId)?.emoji} {item.nicheId} &middot; {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace',
                    background: item.status === 'uploaded' ? `${VS.green}15` : item.status === 'produced' ? `${VS.purple}15` : `${VS.accent}15`,
                    color: item.status === 'uploaded' ? VS.green : item.status === 'produced' ? VS.purple : VS.accent,
                    border: `1px solid ${item.status === 'uploaded' ? `${VS.green}33` : item.status === 'produced' ? `${VS.purple}33` : `${VS.accent}33`}`,
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay when drafting with no draft yet */}
      {stage === 'drafting' && !draft && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: `${VS.accent}15`, border: `1px solid ${VS.accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={24} style={{ color: VS.accent, animation: 'spin 1s linear infinite' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, marginBottom: '4px' }}>
              {LOADING_MSGS[loadingMsg]}
            </p>
            <p style={{ fontSize: '11px', color: VS.text2, fontFamily: 'monospace' }}>
              Generating {selectedNiche.label} script with Claude...
            </p>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
