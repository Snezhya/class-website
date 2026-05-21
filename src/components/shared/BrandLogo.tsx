import React from 'react';
import { Network, type LucideIcon } from 'lucide-react';

interface BrandLogoProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  imgClassName?: string;
  fallback?: LucideIcon;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt = 'Logo',
  size = 32,
  className = '',
  imgClassName = 'object-contain',
  fallback: Fallback = Network,
}) => {
  const boxStyle = { width: size, height: size };

  if (src) {
    return (
      <div
        className={`rounded-lg overflow-hidden border border-brand-700/80 bg-brand-950 flex items-center justify-center shrink-0 ${className}`}
        style={boxStyle}
      >
        <img src={src} alt={alt} className={`w-full h-full ${imgClassName}`} />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg bg-brand-800 border border-brand-700/80 flex items-center justify-center shrink-0 ${className}`}
      style={boxStyle}
    >
      <Fallback className="text-brand-400" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
};
