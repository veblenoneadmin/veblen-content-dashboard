'use client';

import { useState } from 'react';

const VS = {
  bg0: '#1e1e1e', bg1: '#252526', bg2: '#2d2d2d', bg3: '#333333',
  border: '#3c3c3c', text0: '#f0f0f0', text1: '#c0c0c0', text2: '#909090',
  accent: '#007acc',
};

const workflows = [
  { id: 'WF1', title: 'Initial Creator Scrape', trigger: 'Manual — once per new creator', description: 'Reads the creator watchlist from Google Sheets, scrapes their entire post history from TikTok and Instagram via Apify, calculates engagement rates, stores everything in Supabase, then transcribes every video with Whisper. Sends a completion summary to Slack.', goal: 'One-time data load to bootstrap a new creator into the system.', stage: 1, tools: ['Google Sheets', 'Apify', 'Supabase', 'Whisper', 'Slack'], color: '#4F8EF7' },
  { id: 'WF2', title: 'Weekly Re-Scrape', trigger: 'Automatic — every Monday at 2:00 AM', description: 'Runs the same scrape as WF1, but only fetches posts newer than the last scrape date. Transcribes new videos, updates the database, then automatically kicks off the Analytics Engine (WF3).', goal: 'Keep the database current with the latest posts each week.', stage: 1, tools: ['Apify', 'Supabase', 'Whisper'], color: '#4F8EF7' },
  { id: 'WF3', title: 'Analytics Engine', trigger: 'Automatic after WF2, or manual', description: 'Fetches top posts from the last 3 months and sends them to Claude in batches. Claude tags each post with content frameworks (PAS, BAB, Story-Lesson-CTA), hook types, and CTA patterns. Aggregates findings into a weekly trends report saved in Supabase.', goal: 'Identify which content patterns are driving the most engagement right now.', stage: 2, tools: ['Supabase', 'Claude'], color: '#A259FF' },
  { id: 'WF4', title: 'Content Generation', trigger: 'Manual — weekly, after WF3', description: 'Pulls the latest trends report and top 30 posts. Plans 21 content pieces (e.g., 13 videos + 8 carousels). For each piece, Claude generates a full script: hook, monologue, cut-to-cut breakdown, and platform captions. Saves to Supabase and Google Sheets approval queue.', goal: 'Produce a full week of AI-generated content ready for human review.', stage: 3, tools: ['Supabase', 'Claude', 'Google Sheets'], color: '#00C896' },
  { id: 'WF5', title: 'Approval to Schedule', trigger: 'Automatic — every 15 minutes', description: "Scans the Google Sheets approval queue for rows marked 'Approved'. For each approved item, calls the Metricool API to schedule the post on the correct platform and date. Updates the row to 'Scheduled' and logs it to the content calendar.", goal: 'Bridge the approval step to live social scheduling with zero manual publishing.', stage: 3, tools: ['Google Sheets', 'Metricool'], color: '#00C896' },
  { id: 'WF6', title: 'ManyChat DM Automation', trigger: 'Webhook — fires on trigger word comment', description: 'When ManyChat detects a comment with a trigger keyword, it sends a webhook. The system looks up the matching giveaway asset from Google Sheets, sends a text DM with the link, then generates a personalised voice message via ElevenLabs and sends that as a second DM.', goal: 'Automatically deliver giveaway assets to commenters and capture leads via DM.', stage: 3, tools: ['ManyChat', 'Google Sheets', 'ElevenLabs'], color: '#FF6B6B' },
  { id: 'WF7', title: 'Weekly Report', trigger: 'Automatic — every Monday at 8:00 AM', description: 'Pulls the latest trends report from Supabase, counts DMs sent and leads captured, tallies published posts from the content calendar. Asks Claude to write a plain-English 3-sentence performance summary, then sends a formatted Slack message.', goal: "Give the team a clear weekly pulse on what's working across content and DMs.", stage: 3, tools: ['Supabase', 'Claude', 'Slack'], color: '#FFB347' },
  { id: 'WF8', title: 'Global Error Handler', trigger: 'Automatic — triggered by any failed workflow', description: 'Every other workflow calls this one if something breaks. Captures the workflow name, failed node, error message, timestamp, and execution ID, then sends a formatted alert to a Slack channel.', goal: 'Centralise all error alerts so nothing fails silently.', stage: null, tools: ['Slack'], color: '#FF4D4D' },
  { id: 'WF9', title: 'Script Generation (Deep Voice Mode)', trigger: 'Manual — on demand', description: "A focused script-writing mode. Transcribes top 20 posts if not done, then sends all transcripts + the weekly trends report to Claude with a detailed voice profile. Claude generates 5 in-depth scripts that closely mirror the creator's speaking style, tone, and vocabulary.", goal: "Generate higher-fidelity scripts when voice authenticity is the priority.", stage: 3, tools: ['Supabase', 'Claude', 'Whisper'], color: '#00C896' },
];

const toolList = [
  { name: 'n8n', desc: 'Automation platform' },
  { name: 'Apify', desc: 'Scrapes TikTok & Instagram' },
  { name: 'Whisper', desc: 'Transcribes video audio' },
  { name: 'Claude', desc: 'AI analysis & generation' },
  { name: 'ElevenLabs', desc: 'Voice message generation' },
  { name: 'Supabase', desc: 'Database & storage' },
  { name: 'Google Sheets', desc: 'Approval queue & calendar' },
  { name: 'Metricool', desc: 'Schedules social posts' },
  { name: 'ManyChat', desc: 'DM automation trigger' },
  { name: 'Slack', desc: 'Alerts & reports' },
];

const stages = [
  { num: 1, label: 'Collect', color: '#4F8EF7', desc: 'Scrape & transcribe creator posts weekly' },
  { num: 2, label: 'Analyse', color: '#A259FF', desc: 'AI identifies winning content patterns' },
  { num: 3, label: 'Create & Publish', color: '#00C896', desc: 'Generate, approve, and schedule content' },
];

const weeklyLoop = [
  { time: 'Mon 2 AM',    text: 'WF2 scrapes new posts → auto-triggers WF3', color: '#4F8EF7' },
  { time: 'Mon morning', text: 'WF3 analyses patterns → saves trends report', color: '#A259FF' },
  { time: 'Mon (manual)', text: 'WF4 generates 21 content pieces → approval queue', color: '#00C896' },
  { time: 'Every 15 min', text: 'WF5 checks queue → schedules approved content', color: '#00C896' },
  { time: 'Post goes live', text: 'WF6 fires on trigger word → DM sent automatically', color: '#FF6B6B' },
  { time: 'Mon 8 AM',    text: 'WF7 compiles metrics → sends Slack summary', color: '#FFB347' },
  { time: 'Any failure', text: 'WF8 catches error → Slack alert immediately', color: '#FF4D4D' },
  { time: 'On demand',   text: 'WF9 generates deeper voice-authentic scripts', color: '#00C896' },
];

const toolColors: Record<string, string> = {
  'Google Sheets': '#0F9D58', 'Apify': '#FF6B35', 'Supabase': '#3ECF8E',
  'Whisper': '#10A37F', 'Claude': '#CC785C', 'Slack': '#4A154B',
  'Metricool': '#FF6900', 'ManyChat': '#0084FF', 'ElevenLabs': '#818CF8',
  'n8n': '#EA4B71',
};

export default function PipelinePage() {
  const [tab, setTab] = useState<'workflows' | 'loop' | 'tools'>('workflows');
  const [selected, setSelected] = useState<string | null>(null);

  const selectedWF = workflows.find(w => w.id === selected);

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: VS.text0, margin: 0, marginBottom: '4px' }}>
          Creator Pipeline
        </h1>
        <p style={{ color: VS.text2, fontSize: '13px', margin: 0 }}>n8n Automation Suite · 9 workflows · 3 stages</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${VS.border}`, marginBottom: '24px' }}>
        {(['workflows', 'loop', 'tools'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', fontSize: '13px', fontWeight: 500,
            color: tab === t ? VS.text0 : VS.text2,
            borderBottom: tab === t ? `2px solid ${VS.accent}` : '2px solid transparent',
            marginBottom: '-1px',
          }}>
            {t === 'loop' ? 'Weekly Loop' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* WORKFLOWS TAB */}
      {tab === 'workflows' && (
        <div>
          {/* Stage pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {stages.map(s => (
              <div key={s.num} style={{
                padding: '5px 12px', borderRadius: '20px',
                background: s.color + '18', border: `1px solid ${s.color}40`,
                fontSize: '12px', fontWeight: 500, color: s.color,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }} />
                Stage {s.num}: {s.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => setSelected(selected === wf.id ? null : wf.id)}
                style={{
                  background: selected === wf.id ? VS.bg2 : VS.bg1,
                  border: `1px solid ${selected === wf.id ? wf.color + '60' : VS.border}`,
                  borderRadius: '10px', padding: '16px', cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: selected === wf.id ? `0 0 0 1px ${wf.color}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: wf.color, background: wf.color + '18', padding: '2px 8px', borderRadius: '4px' }}>
                    {wf.id}
                  </span>
                  {wf.stage ? (
                    <span style={{ fontSize: '10px', color: VS.text2, background: VS.bg3, padding: '2px 6px', borderRadius: '4px' }}>S{wf.stage}</span>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#FF4D4D', background: '#FF4D4D18', padding: '2px 6px', borderRadius: '4px' }}>Global</span>
                  )}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: VS.text0, marginBottom: '4px' }}>{wf.title}</div>
                <div style={{ fontSize: '12px', color: VS.text2, marginBottom: '10px', lineHeight: 1.4 }}>{wf.trigger}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {wf.tools.map(t => (
                    <span key={t} style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                      background: (toolColors[t] || VS.bg3) + '22',
                      color: toolColors[t] || VS.text2,
                      border: `1px solid ${(toolColors[t] || VS.border)}30`,
                      fontWeight: 500,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedWF && (
            <div style={{
              marginTop: '14px', background: VS.bg1,
              border: `1px solid ${selectedWF.color}40`,
              borderRadius: '10px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: selectedWF.color, background: selectedWF.color + '18', padding: '3px 10px', borderRadius: '4px' }}>
                  {selectedWF.id}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: VS.text0 }}>{selectedWF.title}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: VS.text2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>What it does</div>
                  <div style={{ fontSize: '13px', color: VS.text1, lineHeight: 1.6 }}>{selectedWF.description}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: VS.text2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Goal</div>
                  <div style={{ fontSize: '13px', color: VS.text1, lineHeight: 1.6, marginBottom: '14px' }}>{selectedWF.goal}</div>
                  <div style={{ fontSize: '10px', color: VS.text2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Trigger</div>
                  <div style={{ fontSize: '13px', color: selectedWF.color }}>{selectedWF.trigger}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WEEKLY LOOP TAB */}
      {tab === 'loop' && (
        <div style={{ maxWidth: '580px' }}>
          <p style={{ fontSize: '13px', color: VS.text2, marginTop: 0, marginBottom: '20px' }}>
            The workflows form a clean weekly loop — here's how they connect.
          </p>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '72px', top: '20px', bottom: '20px',
              width: '1px', background: 'linear-gradient(to bottom, #4F8EF7, #A259FF, #00C896, #FF4D4D)',
              opacity: 0.3,
            }} />
            {weeklyLoop.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px', position: 'relative' }}>
                <div style={{ minWidth: '72px', fontSize: '11px', fontWeight: 600, color: VS.text2, textAlign: 'right', paddingTop: '3px', lineHeight: 1.4 }}>
                  {item.time}
                </div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, marginTop: '4px', flexShrink: 0, boxShadow: `0 0 8px ${item.color}60` }} />
                <div style={{ background: VS.bg1, border: `1px solid ${item.color}25`, borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: VS.text1, lineHeight: 1.5, flex: 1 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {tab === 'tools' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '32px' }}>
            {toolList.map(t => (
              <div key={t.name} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: (toolColors[t.name] || VS.bg3) + '22',
                  border: `1px solid ${(toolColors[t.name] || VS.border)}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: toolColors[t.name] || VS.text2,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: VS.text0 }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: VS.text2, marginTop: '1px' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${VS.border}`, paddingTop: '24px' }}>
            <div style={{ fontSize: '10px', color: VS.text2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>What This System Achieves</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: '📊', title: 'Remove guesswork', desc: 'Every piece of content is grounded in real performance data.' },
                { icon: '⚙️', title: 'Eliminate manual work', desc: 'Only touchpoint: reviewing and approving drafts.' },
                { icon: '🎙️', title: 'Authentic voice', desc: 'Scripts use real transcripts and voice profiles as reference.' },
                { icon: '🔔', title: 'Stay visible', desc: 'Every failure sends a Slack alert. Weekly summaries auto-deliver.' },
              ].map(g => (
                <div key={g.title} style={{ background: VS.bg1, border: `1px solid ${VS.border}`, borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '18px', marginBottom: '6px' }}>{g.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: VS.text0, marginBottom: '4px' }}>{g.title}</div>
                  <div style={{ fontSize: '12px', color: VS.text2, lineHeight: 1.5 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
