import React from 'react';

interface VormirixLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'cyan' | 'gradient' | 'white' | 'dark' | 'current';
  withGlow?: boolean;
}

// Brand mark image provided directly by the team. The original file was a
// JPEG with an opaque white background (despite the .png extension), which
// couldn't be recolored/masked reliably. public/logo-white.png has been
// reprocessed once (luminance -> alpha, glyph filled pure white) into a
// real transparent PNG, so it can just be drawn directly.
export const VormirixLogo: React.FC<VormirixLogoProps> = ({ className = '', size = 32, withGlow = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-white.png"
        alt="Vormirix"
        className="w-full h-full object-contain transition-transform duration-300"
        style={{ filter: withGlow ? 'drop-shadow(0 0 6px rgba(88,245,224,0.6))' : undefined }}
      />
    </div>
  );
};

export default VormirixLogo;
