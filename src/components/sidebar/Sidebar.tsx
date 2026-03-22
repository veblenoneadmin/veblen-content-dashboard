'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  Newspaper,
  Hash,
  Layout,
  Youtube,
  Instagram,
  Linkedin,
  BarChart2,
  CalendarDays,
  Users,
} from 'lucide-react';

const navItems = [
  { group: null, label: 'Home', href: '/dashboard/home', icon: House },
  { group: 'RESEARCH', label: 'News', href: '/dashboard/news', icon: Newspaper },
  { group: 'RESEARCH', label: 'Topics', href: '/dashboard/topics', icon: Hash },
  { group: 'RESEARCH', label: 'Formats', href: '/dashboard/formats', icon: Layout },
  { group: 'CREATE', label: 'YouTube', href: '/dashboard/youtube', icon: Youtube },
  { group: 'CREATE', label: 'Instagram', href: '/dashboard/instagram', icon: Instagram },
  { group: 'CREATE', label: 'LinkedIn', href: '/dashboard/linkedin', icon: Linkedin },
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
          color: isActive ? '#FFFFFF' : '#999999',
          backgroundColor: isActive ? 'rgba(212, 132, 90, 0.13)' : 'transparent',
          fontSize: '13px',
          fontWeight: isActive ? 500 : 400,
          transition: 'background-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.color = '#CCCCCC';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#999999';
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
        backgroundColor: '#141414',
        borderRight: '1px solid #262626',
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
              background: 'linear-gradient(135deg, #D4845A, #E8A87C)',
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
                color: '#FFFFFF',
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
                  backgroundColor: '#D4845A',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '10px', color: '#888888' }}>355.9K followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* Ungrouped items */}
        {ungrouped.map(renderItem)}

        {/* Grouped items */}
        {grouped.map((group) => (
          <div key={group.label} style={{ marginTop: '16px' }}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#555555',
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
          borderTop: '1px solid #262626',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: 500 }}>Z</span>
        </div>
        <span style={{ fontSize: '13px', color: '#999999' }}>Zac</span>
      </div>
    </div>
  );
}
