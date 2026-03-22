'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/store';
import { STATUS_COLORS } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '@/lib/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusLegend = [
  { label: 'In Progress', color: '#D4845A' },
  { label: 'Ready to Create', color: '#E8A87C' },
  { label: 'Editing', color: '#C27BA0' },
  { label: 'Ready', color: '#7CB8D4' },
  { label: 'Scheduled', color: '#85B8A0' },
  { label: 'Published', color: '#6AAF6A' },
];

const platforms = ['All', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X'];

function formatMonth(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CalendarPage() {
  const { posts } = useDashboard();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2);
  const [platformFilter, setPlatformFilter] = useState('All');

  const today = new Date('2026-03-22');

  const goToPrevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else { setMonth((m) => m - 1); } };
  const goToNextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else { setMonth((m) => m + 1); } };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const filteredPosts = posts.filter((p) => {
    if (!p.scheduledDate) return false;
    const d = new Date(p.scheduledDate);
    if (d.getFullYear() !== year || d.getMonth() !== month) return false;
    if (platformFilter !== 'All' && p.platform !== platformFilter) return false;
    return true;
  });

  const postsByDay: Record<number, Post[]> = {};
  filteredPosts.forEach((p) => {
    const day = new Date(p.scheduledDate!).getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(p);
  });

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Calendar</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Schedule and track your content</p>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {statusLegend.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {platforms.map((p) => (
            <button
              key={p} onClick={() => setPlatformFilter(p)}
              style={{ padding: '5px 10px', borderRadius: '999px', border: '1px solid', borderColor: platformFilter === p ? 'var(--accent)' : 'var(--border)', backgroundColor: platformFilter === p ? 'var(--accent-tint)' : 'transparent', color: platformFilter === p ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={goToPrevMonth} style={{ padding: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '180px', textAlign: 'center' }}>
          {formatMonth(year, month)}
        </span>
        <button onClick={goToNextMonth} style={{ padding: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} style={{ padding: '10px', textAlign: 'center', fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            const isToday = day !== null && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            const dayPosts = day ? postsByDay[day] || [] : [];
            const showPosts = dayPosts.slice(0, 3);
            const extraCount = dayPosts.length - 3;

            return (
              <div
                key={idx}
                style={{
                  minHeight: '90px', padding: '8px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: idx < cells.length - 7 ? '1px solid var(--border)' : 'none',
                  backgroundColor: day === null ? 'var(--bg-calendar-empty)' : 'transparent',
                }}
              >
                {day !== null && (
                  <>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isToday ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: isToday ? '#FFFFFF' : 'var(--text-secondary)', fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {showPosts.map((post) => {
                        const color = STATUS_COLORS[post.status] || '#888';
                        return (
                          <div key={post.id} title={post.title} style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', backgroundColor: `${color}22`, color: color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.title}
                          </div>
                        );
                      })}
                      {extraCount > 0 && <div style={{ fontSize: '9px', color: 'var(--text-subtle)', paddingLeft: '2px' }}>+{extraCount} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
