import React from 'react';

/**
 * Unique High-Performance Vector Logo for ScholaVerse
 * Designed with custom geometric vectors for maximum sharpness and zero runtime overhead.
 */
export const Logo = ({
  size = 'md',
  showText = true,
  textVariant = 'dark', // 'dark' (for light bg) | 'light' (for dark bg)
  subtitle = 'Academy OS',
  className = '',
}) => {
  // Size dimensions for the icon
  const sizeMap = {
    xs: { icon: 'w-6 h-6', font: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 'w-8 h-8', font: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', font: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', font: 'text-xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', font: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Custom Vector SVG Emblem */}
      <div
        className={`${currentSize.icon} shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-2 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20 flex items-center justify-center transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Subtle Backglow Accent */}
          <path
            d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
            fill="currentColor"
            fillOpacity="0.15"
          />

          {/* Academic Graduation Prism (Top Rhombus) */}
          <path
            d="M16 6L27 12L16 18L5 12L16 6Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* Lower Book Folds & Pillars */}
          <path
            d="M7 14.5L16 19.5V26L7 21V14.5Z"
            fill="white"
            fillOpacity="0.75"
          />
          <path
            d="M25 14.5L16 19.5V26L25 21V14.5Z"
            fill="white"
            fillOpacity="0.88"
          />

          {/* Central Beacon Star / Nexus */}
          <circle cx="16" cy="12" r="1.75" fill="#6366F1" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="leading-tight">
          <span
            className={`font-black tracking-tight block ${
              currentSize.font
            } ${textVariant === 'light' ? 'text-white' : 'text-slate-900'}`}
          >
            Schola<span className="text-indigo-600">Verse</span>
          </span>
          {subtitle && (
            <span
              className={`font-semibold uppercase tracking-widest block font-mono ${
                currentSize.sub
              } ${textVariant === 'light' ? 'text-indigo-300' : 'text-slate-400'}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
