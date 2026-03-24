'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  Newspaper,
  Hash,
  Layout,
  Play,
  Camera,
  Briefcase,
  BarChart2,
  CalendarDays,
  Users,
  FileText,
} from 'lucide-react';

const navItems = [
  { group: null, label: 'Home', href: '/dashboard/home', icon: House },
  { group: 'RESEARCH', label: 'News', href: '/dashboard/news', icon: Newspaper },
  { group: 'RESEARCH', label: 'Topics', href: '/dashboard/topics', icon: Hash },
  { group: 'RESEARCH', label: 'Formats', href: '/dashboard/formats', icon: Layout },
  { group: 'CREATE', label: 'YouTube', href: '/dashboard/youtube', icon: Play },
  { group: 'CREATE', label: 'Instagram', href: '/dashboard/instagram', icon: Camera },
  { group: 'CREATE', label: 'LinkedIn', href: '/dashboard/linkedin', icon: Briefcase },
  { group: 'CREATE', label: 'Create Article', href: '/dashboard/create-article', icon: FileText },
  { group: 'INSIGHTS', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { group: 'INSIGHTS', label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { group: 'INSIGHTS', label: 'Competitors', href: '/dashboard/competitors', icon: Users },
];

const groups = ['RESEARCH', 'CREATE', 'INSIGHTS'];

export default function Sidebar() {
  const pathname = usePathname();

  const ungrouped = navItems.filter((item) => item.group === null);
  const grouped = groups.map((group) => ({
    label: group,
    items: navItems.filter((item) => item.group === group),
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
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '6px',
          textDecoration: 'none',
          color: isActive ? 'var(--text-primary)' : 'var(--text-inactive)',
          backgroundColor: isActive ? 'var(--accent-tint)' : 'transparent',
          fontSize: '13px',
          fontWeight: isActive ? 500 : 400,
          transition: 'background-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-inactive)';
          }
        }}
      >
        <Icon size={15} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div
      style={{
        width: '200px',
        minWidth: '200px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: '24px', padding: '4px 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              V
            </span>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: '1.2',
              }}
            >
              Veblen Group
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>355.9K followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {ungrouped.map(renderItem)}
        {grouped.map((group) => (
          <div key={group.label} style={{ marginTop: '16px' }}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--text-faint)',
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

      {/* Bottom user avatar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderTop: '1px solid var(--border)',
          marginTop: '0px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Z</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-inactive)' }}>Zac</span>
      </div>
    </div>
  );
}
