import React from 'react';

interface Props {
  width?: number;
  showTagline?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function ContentSenseLogo({ width = 340, showTagline = true, style, className }: Props) {
  // When tagline is hidden, crop viewBox to just the icon + wordmark row
  const viewBox = showTagline ? '0 0 680 160' : '0 0 680 100';
  const aspectH = showTagline ? 160 : 100;
  const height = Math.round(width * (aspectH / 680));
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');
          .wm-white { font-family: 'Exo 2', sans-serif; font-weight: 700; font-size: 44px; fill: #D0D8E4; }
          .wm-cyan  { font-family: 'Exo 2', sans-serif; font-weight: 700; font-size: 44px; fill: #3CC8F5;
                      filter: drop-shadow(0 0 8px rgba(60,200,245,0.7)) drop-shadow(0 0 18px rgba(60,200,245,0.4)); }
          .tagline  { font-family: 'Exo 2', sans-serif; font-weight: 400; font-size: 11px; letter-spacing: 3.5px; fill: #6B7A8D; }
        `}</style>
        <radialGradient id="cg" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#2E7FD4"/>
          <stop offset="100%" stopColor="#1450A3"/>
        </radialGradient>
      </defs>

      <circle cx="80" cy="80" r="56" fill="none" stroke="#1E6FC4" strokeWidth="1" opacity="0.4"/>
      <circle cx="80" cy="80" r="56" fill="none" stroke="#3CC8F5" strokeWidth="0.5" opacity="0.2"/>
      <circle cx="80" cy="80" r="46" fill="url(#cg)"/>
      <circle cx="80" cy="80" r="46" fill="none" stroke="#5AAEE8" strokeWidth="1" opacity="0.5"/>

      <rect x="53" y="54" width="48" height="52" rx="5" fill="white" opacity="0.12"/>
      <rect x="53" y="54" width="48" height="52" rx="5" fill="none" stroke="white" strokeWidth="1.8" opacity="0.85"/>
      <circle cx="63" cy="64" r="5" fill="white" opacity="0.9"/>
      <rect x="71" y="60" width="18" height="3" rx="1.5" fill="white" opacity="0.8"/>
      <rect x="71" y="66" width="12" height="2.5" rx="1.2" fill="white" opacity="0.4"/>
      <rect x="59" y="75" width="36" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
      <rect x="59" y="81" width="36" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
      <rect x="59" y="87" width="24" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
      <circle cx="62" cy="97" r="3" fill="none" stroke="white" strokeWidth="1.4" opacity="0.5"/>
      <rect x="67" y="94" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
      <rect x="80" y="94" width="10" height="2" rx="1" fill="white" opacity="0.3"/>

      <line x1="97" y1="50" x2="97" y2="42" stroke="#3CC8F5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="93" y1="46" x2="101" y2="46" stroke="#3CC8F5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="94.5" y1="43.5" x2="99.5" y2="48.5" stroke="#3CC8F5" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <line x1="99.5" y1="43.5" x2="94.5" y2="48.5" stroke="#3CC8F5" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <circle cx="97" cy="46" r="6" fill="#3CC8F5" opacity="0.15"/>
      <circle cx="108" cy="58" r="1.5" fill="#3CC8F5" opacity="0.7"/>
      <circle cx="112" cy="50" r="1" fill="#3CC8F5" opacity="0.5"/>
      <circle cx="104" cy="44" r="1" fill="#3CC8F5" opacity="0.4"/>

      <circle cx="80" cy="28" r="3" fill="#3CC8F5" opacity="0.9"/>
      <circle cx="134" cy="52" r="2.2" fill="#3CC8F5" opacity="0.7"/>
      <circle cx="128" cy="112" r="1.8" fill="#3CC8F5" opacity="0.5"/>
      <circle cx="28" cy="48" r="1.5" fill="#3CC8F5" opacity="0.6"/>
      <circle cx="26" cy="104" r="2" fill="#3CC8F5" opacity="0.4"/>

      <line x1="162" y1="58" x2="162" y2="118" stroke="#3B4A5C" strokeWidth="1.5"/>

      <text y="88" className="wm-white"><tspan x="172">Content</tspan><tspan className="wm-cyan">Sense</tspan></text>
      <text x="172" y="110" className="tagline">AI CONTENT PLATFORM</text>
    </svg>
  );
}
