'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House, Newspaper, Hash, Layout, Play, Camera,
  Briefcase, BarChart2, CalendarDays, Users, FileText, Archive, Zap, Mic, Workflow, X, Layers, TrendingUp,
} from 'lucide-react';

const navItems = [
  { group: null,          label: 'Home',           href: '/dashboard/home',           icon: House },
  { group: 'APPS',        label: 'JobSense',        href: '/dashboard/jobsense',       icon: Layers },
  { group: 'RESEARCH',    label: 'News',            href: '/dashboard/news',           icon: Newspaper },
  { group: 'RESEARCH',    label: 'Topics',          href: '/dashboard/topics',         icon: Hash },
  { group: 'RESEARCH',    label: 'Formats',         href: '/dashboard/formats',        icon: Layout },
  { group: 'RESEARCH',    label: 'Archive',         href: '/dashboard/archive',        icon: Archive },
  { group: 'CREATE',      label: 'YouTube',         href: '/dashboard/youtube',        icon: Play },
  { group: 'CREATE',      label: 'Instagram',       href: '/dashboard/instagram',      icon: Camera },
  { group: 'CREATE',      label: 'LinkedIn',        href: '/dashboard/linkedin',       icon: Briefcase },
  { group: 'CREATE',      label: 'Create Article',  href: '/dashboard/create-article', icon: FileText },
  { group: 'INSIGHTS',    label: 'Analytics',       href: '/dashboard/analytics',      icon: BarChart2 },
  { group: 'INSIGHTS',    label: 'Calendar',        href: '/dashboard/calendar',       icon: CalendarDays },
  { group: 'INSIGHTS',    label: 'Competitors',     href: '/dashboard/competitors',    icon: Users },
  { group: 'AUTOMATION',  label: 'Creator Sources',   href: '/dashboard/pipeline',            icon: Zap },
  { group: 'AUTOMATION',  label: 'Creator Analytics', href: '/dashboard/creator-analytics',   icon: TrendingUp },
  { group: 'AUTOMATION',  label: 'Workflows',         href: '/dashboard/workflows',            icon: Workflow },
  { group: 'AUTOMATION',  label: 'Transcribe',        href: '/dashboard/transcribe',           icon: Mic },
];

const groups = ['APPS', 'RESEARCH', 'CREATE', 'INSIGHTS', 'AUTOMATION'];

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

  const ungrouped = navItems.filter(item => item.group === null);
  const grouped = groups.map(group => ({
    label: group,
    items: navItems.filter(item => item.group === group),
  }));

  const renderItem = (item: typeof navItems[0]) => {
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
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: VS.bg1, borderRight: `1px solid ${VS.border}` }}
      >
        {/* Brand — h-14 matches navbar height */}
        <div
          className="flex h-14 items-center justify-between px-4 shrink-0"
          style={{ borderBottom: `1px solid ${VS.border}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #007acc, #4fc1ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>V</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: VS.text0, lineHeight: '1.2' }}>
                Veblen Group
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: VS.accent }} />
                <span style={{ fontSize: '10px', color: VS.text2 }}>355.9K followers</span>
              </div>
            </div>
          </div>
          <button
            className="md:hidden flex items-center justify-center h-7 w-7 rounded-lg"
            style={{ color: VS.text2 }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {ungrouped.map(renderItem)}
          </div>
          {grouped.map(group => (
            <div key={group.label} style={{ marginTop: '16px' }}>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#4d4d4d',
                  padding: '0 10px',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {group.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {group.items.map(renderItem)}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
