'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, X } from 'lucide-react';
import ContentSenseLogo from '@/components/shared/ContentSenseLogo';

const navItems = [
  { label: 'InsightWire', href: '/dashboard/create-article-2', icon: FileText },
];

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {navItems.map(item => {
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
        </nav>
      </div>
    </>
  );
}
