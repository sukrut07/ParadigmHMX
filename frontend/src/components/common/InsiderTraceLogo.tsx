import React from 'react';

interface InsiderTraceLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * InsiderTrace bespoke institutional brand mark.
 * Features a dual-facet geometric emerald shield with an embedded
 * central trace nexus diamond and vertical signal correlation paths.
 * Matches public/favicon.svg exactly.
 */
export const InsiderTraceLogo: React.FC<InsiderTraceLogoProps> = ({
  size = 32,
  className,
  style,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      style={{
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.35))',
        ...style,
      }}
      aria-label="InsiderTrace Shield Logo"
    >
      {/* Left Shield Facet */}
      <path d="M16 2.5L4 7.2V15.8C4 23.2 9.2 28.8 16 30.5V2.5Z" fill="#10B981" />
      {/* Right Shield Facet */}
      <path d="M16 2.5L28 7.2V15.8C28 23.2 22.8 28.8 16 30.5V2.5Z" fill="#047857" />
      {/* Inner Left Depth */}
      <path d="M16 7L8 10.4V15.6C8 20.8 11.4 24.8 16 26.2V7Z" fill="#064E3B" opacity="0.32" />
      {/* Inner Right Depth */}
      <path d="M16 7L24 10.4V15.6C24 20.8 20.6 24.8 16 26.2V7Z" fill="#022C22" opacity="0.45" />
      {/* Vertical Signal Trace Path */}
      <line x1="16" y1="5.5" x2="16" y2="10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="21" x2="16" y2="25.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      {/* Central Precision Trace Nexus Diamond */}
      <path d="M16 10.5L20 15.5L16 20.5L12 15.5L16 10.5Z" fill="#FFFFFF" />
      {/* Center Core Sensor Node */}
      <circle cx="16" cy="15.5" r="1.6" fill="#047857" />
    </svg>
  );
};
