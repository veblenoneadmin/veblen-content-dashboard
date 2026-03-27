'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Mic, Copy, Check, X, FileAudio, Clock, Languages } from 'lucide-react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc', error: '#f44747', green: '#4ec9b0',
};

const ACCEPTED = '.mp3,.mp4,.m4a,.wav,.webm,.ogg,.mpeg,.mpga';
const MAX_MB = 25;

type Segment = { start: number; end: number; text: string };
type Result = { text: string; language?: string; duration?: number; segments?: Segment[] };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSegments, setShowSegments] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    setProgress('Uploading file…');

    const form = new FormData();
    form.append('file', file);

    try {
      setProgress('Transcribing with Whisper…');
      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Transcription failed'); return; }
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => { setFile(null); setResult(null); setError(''); };

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0, marginBottom: '4px' }}>
          Transcribe
        </h1>
        <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>Upload audio or video — Whisper AI converts it to text. Max {MAX_MB}MB.</p>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? VS.accent : file ? VS.green : VS.border}`,
            borderRadius: '12px', padding: '40px', textAlign: 'center',
            background: dragging ? `${VS.accent}08` : VS.bg1,
            cursor: file ? 'default' : 'pointer',
            transition: 'all 0.15s', marginBottom: '16px',
          }}
        >
          <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {!file ? (
            <>
              <Upload size={32} style={{ color: VS.text2, marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, marginBottom: '6px' }}>
                Drop audio or video here
              </div>
              <div style={{ fontSize: '12px', color: VS.text2 }}>
                MP3, MP4, M4A, WAV, WEBM, OGG · Max {MAX_MB}MB
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <FileAudio size={24} style={{ color: VS.green }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: VS.text0 }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: VS.text2 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={e => { e.stopPropagation(); clear(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, marginLeft: '8px' }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ background: `${VS.error}15`, border: `1px solid ${VS.error}40`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: VS.error, marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Transcribe button */}
      {!result && (
        <button onClick={handleTranscribe} disabled={!file || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: VS.accent, border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 600, opacity: (!file || loading) ? 0.5 : 1, marginBottom: loading ? '12px' : 0 }}>
          <Mic size={15} />
          {loading ? 'Transcribing…' : 'Transcribe'}
        </button>
      )}

      {loading && (
        <div style={{ fontSize: '13px', color: VS.text2, marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: VS.accent, animation: 'pulse 1.2s ease-in-out infinite' }} />
          {progress}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          {/* Meta bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {result.language && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: VS.text1 }}>
                <Languages size={12} style={{ color: VS.accent }} />
                {result.language.toUpperCase()}
              </div>
            )}
            {result.duration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: VS.text1 }}>
                <Clock size={12} style={{ color: VS.accent }} />
                {formatTime(result.duration)}
              </div>
            )}
            {result.text && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: VS.text1 }}>
                {result.text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </div>
            )}
          </div>

          {/* Transcript */}
          <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${VS.border}` }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: VS.text2, textTransform: 'uppercase', letterSpacing: '1px' }}>Transcript</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: copied ? VS.green : VS.text2, fontSize: '12px' }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={clear}
                  style={{ background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: VS.text2, fontSize: '12px' }}>
                  New
                </button>
              </div>
            </div>
            <div style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto' }}>
              <p style={{ fontSize: '14px', color: VS.text1, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                {result.text}
              </p>
            </div>
          </div>

          {/* Segments toggle */}
          {result.segments && result.segments.length > 0 && (
            <div>
              <button onClick={() => setShowSegments(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: VS.text2, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={13} />
                {showSegments ? 'Hide' : 'Show'} timestamped segments ({result.segments.length})
              </button>
              {showSegments && (
                <div style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {result.segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '10px 16px', borderBottom: i < result.segments!.length - 1 ? `1px solid ${VS.border}` : 'none' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: VS.accent, flexShrink: 0, paddingTop: '2px' }}>
                        {formatTime(seg.start)}
                      </span>
                      <span style={{ fontSize: '13px', color: VS.text1, lineHeight: 1.6 }}>{seg.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
