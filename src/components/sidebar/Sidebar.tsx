'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House, Newspaper, Hash, Layout, Archive,
  Play, Camera, Briefcase, FileText, Share2,
  BarChart2, CalendarDays, Users,
  Zap, TrendingUp, ClipboardCheck, Tag, ScrollText, Workflow, Mic,
  X, ChevronDown,
} from 'lucide-react';
import ContentSenseLogo from '@/components/shared/ContentSenseLogo';
import { useDashboard, UserRole } from '@/lib/store';
import { useState } from 'react';

type NavItem = { label: string; href: string; icon: typeof House; group?: string };

const allNavItems: NavItem[] = [
  { label: 'Home', href: '/dashboard/home', icon: House },
  // RESEARCH
  { label: 'News', href: '/dashboard/news', icon: Newspaper, group: 'RESEARCH' },
  { label: 'Topics', href: '/dashboard/topics', icon: Hash, group: 'RESEARCH' },
  { label: 'Formats', href: '/dashboard/formats', icon: Layout, group: 'RESEARCH' },
  { label: 'Archive', href: '/dashboard/archive', icon: Archive, group: 'RESEARCH' },
  // CREATE
  { label: 'YouTube', href: '/dashboard/youtube', icon: Play, group: 'CREATE' },
  { label: 'Instagram', href: '/dashboard/instagram', icon: Camera, group: 'CREATE' },
  { label: 'LinkedIn', href: '/dashboard/linkedin', icon: Briefcase, group: 'CREATE' },
  { label: 'Create Article', href: '/dashboard/create-article', icon: FileText, group: 'CREATE' },
  { label: 'InsightWire', href: '/dashboard/create-article-2', icon: FileText, group: 'CREATE' },
  { label: 'Social Sources', href: '/dashboard/social-sources', icon: Share2, group: 'CREATE' },
  // INSIGHTS
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2, group: 'INSIGHTS' },
  { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays, group: 'INSIGHTS' },
  { label: 'Competitors', href: '/dashboard/competitors', icon: Users, group: 'INSIGHTS' },
  // CONTENT PIPELINE
  { label: 'Creator Sources', href: '/dashboard/pipeline', icon: Zap, group: 'CONTENT PIPELINE' },
  { label: 'Creator Analytics', href: '/dashboard/creator-analytics', icon: TrendingUp, group: 'CONTENT PIPELINE' },
  { label: 'Approval Queue', href: '/dashboard/approval-queue', icon: ClipboardCheck, group: 'CONTENT PIPELINE' },
  { label: 'Framework Tags', href: '/dashboard/framework-tags', icon: Tag, group: 'CONTENT PIPELINE' },
  { label: 'Weekly Reports', href: '/dashboard/weekly-reports', icon: ScrollText, group: 'CONTENT PIPELINE' },
  { label: 'Workflows', href: '/dashboard/workflows', icon: Workflow, group: 'CONTENT PIPELINE' },
  { label: 'Transcribe', href: '/dashboard/transcribe', icon: Mic, group: 'CONTENT PIPELINE' },
];

function getVisibleItems(role: UserRole): NavItem[] {
  if (role === 'admin') return allNavItems;
  if (role === 'editor') return allNavItems.filter(i => i.group !== 'CONTENT PIPELINE');
  // content_writer
  return allNavItems.filter(i => i.label === 'InsightWire');
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  content_writer: 'Content Writer',
};

const VS = {
  bg1: '#252526',
  bg2: '#2d2d2d',
  border: '#3c3c3c',
  accent: '#007acc',
  text0: '#f0f0f0',
  text1: '#cccccc',
  text2: '#909090',
};
const accentBg = 'rgba(0,122,204,0.15)';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, setRole } = useDashboard();
  const [roleOpen, setRoleOpen] = useState(false);
  const items = getVisibleItems(role);

  // Group items: ungrouped first, then by group
  const groups: { group: string | null; items: NavItem[] }[] = [];
  let currentGroup: string | null = null;
  for (const item of items) {
    const g = item.group ?? null;
    if (g !== currentGroup) {
      groups.push({ group: g, items: [item] });
      currentGroup = g;
    } else {
      groups[groups.length - 1].items.push(item);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: VS.bg1, borderRight: `1px solid ${VS.border}` }}
      >
        <div
          className="flex h-14 items-center justify-between px-4 shrink-0"
          style={{ borderBottom: `1px solid ${VS.border}` }}
        >
          <ContentSenseLogo width={185} showTagline={false} />
          <button
            className="md:hidden flex items-center justify-center h-7 w-7 rounded-lg"
            style={{ color: VS.text2 }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: '4px' }}>
              {g.group && (
                <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#4d4d4d', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 10px 4px', fontWeight: 600 }}>
                  {g.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {g.items.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? VS.text0 : VS.text2,
                        background: isActive ? accentBg : 'transparent',
                        borderLeft: isActive ? `2px solid ${VS.accent}` : '2px solid transparent',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = VS.bg2;
                          (e.currentTarget as HTMLElement).style.color = VS.text1;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = VS.text2;
                        }
                      }}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Role selector */}
        <div style={{ borderTop: `1px solid ${VS.border}`, padding: '10px 12px', position: 'relative' }}>
          <button
            onClick={() => setRoleOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '7px 10px', borderRadius: '6px',
              border: `1px solid ${VS.border}`, background: VS.bg2,
              color: VS.text1, fontSize: '11px', fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            <span>{ROLE_LABELS[role]}</span>
            <ChevronDown size={12} style={{ transform: roleOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {roleOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '12px', right: '12px',
              background: VS.bg2, border: `1px solid ${VS.border}`, borderRadius: '6px',
              overflow: 'hidden', marginBottom: '4px',
            }}>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setRoleOpen(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '7px 10px', border: 'none',
                    background: r === role ? accentBg : 'transparent',
                    color: r === role ? VS.text0 : VS.text2,
                    fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
