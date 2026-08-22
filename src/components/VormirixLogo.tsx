import React from 'react';

interface VormirixLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'cyan' | 'gradient' | 'white' | 'dark' | 'current';
  withGlow?: boolean;
}

export const VormirixLogo: React.FC<VormirixLogoProps> = ({
  className = '',
  size = 32,
  variant = 'cyan',
  withGlow = false,
}) => {
  const id = React.useId().replace(/:/g, '');
  const gradientId = `vormirix-grad-${id}`;
  const glowFilterId = `vormirix-glow-${id}`;

  const getFill = () => {
    switch (variant) {
      case 'cyan':
        return '#58f5e0';
      case 'gradient':
        return `url(#${gradientId})`;
      case 'white':
        return '#ffffff';
      case 'dark':
        return '#005a50';
      case 'current':
      default:
        return 'currentColor';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300"
        filter={withGlow ? `url(#${glowFilterId})` : undefined}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58f5e0" />
            <stop offset="60%" stopColor="#2dd8c4" />
            <stop offset="100%" stopColor="#ccbdff" />
          </linearGradient>

          {withGlow && (
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* 
          Vormirix Brand Icon - Stylized geometric dual-ribbon 'S' glyph
          1. Top-Left Primary Diagonal Capsule
        */}
        <path
          d="M 44.5 21.5 C 47.8 24.8 47.8 30.2 44.5 33.5 L 29.5 48.5 C 22.8 55.2 22.8 66.0 29.5 72.7 L 46.5 89.7 C 50.8 94.0 50.8 101.0 46.5 105.3 C 42.2 109.6 35.2 109.6 30.9 105.3 L 13.9 88.3 C 0.5 74.9 0.5 53.3 13.9 39.9 L 32.5 21.5 C 35.8 18.2 41.2 18.2 44.5 21.5 Z"
          fill={getFill()}
        />

        {/* 2. Bottom-Right Primary Diagonal Capsule */}
        <path
          d="M 55.5 118.5 C 52.2 115.2 52.2 109.8 55.5 106.5 L 70.5 91.5 C 77.2 84.8 77.2 74.0 70.5 67.3 L 53.5 50.3 C 49.2 46.0 49.2 39.0 53.5 34.7 C 57.8 30.4 64.8 30.4 69.1 34.7 L 86.1 51.7 C 99.5 65.1 99.5 86.7 86.1 100.1 L 67.5 118.5 C 64.2 121.8 58.8 121.8 55.5 118.5 Z"
          fill={getFill()}
        />

        {/* 3. Top-Right Rounded Corner Anchor */}
        <path
          d="M 60 26 C 60 23.8 61.8 22 64 22 L 78 22 C 86.8 22 94 29.2 94 38 L 94 52 C 94 54.2 92.2 56 90 56 C 87.8 56 86 54.2 86 52 L 86 40 C 86 34.5 81.5 30 76 30 L 64 30 C 61.8 30 60 28.2 60 26 Z"
          fill={getFill()}
        />

        {/* 4. Bottom-Left Rounded Corner Anchor */}
        <path
          d="M 40 114 C 40 116.2 38.2 118 36 118 L 22 118 C 13.2 118 6 110.8 6 102 L 6 88 C 6 85.8 7.8 84 10 84 C 12.2 84 14 85.8 14 88 L 14 100 C 14 105.5 18.5 110 24 110 L 36 110 C 38.2 110 40 111.8 40 114 Z"
          fill={getFill()}
        />
      </svg>
    </div>
  );
};

export default VormirixLogo;
