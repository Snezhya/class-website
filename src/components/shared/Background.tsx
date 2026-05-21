import React from 'react';
import { useApp } from '../../context/AppContext';

export const Background: React.FC = () => {
  const { settings } = useApp();

  const getBackgroundClass = () => {
    switch (settings.backgroundType) {
      case 'grid':
        return 'bg-grid-matrix';
      case 'gradient':
        return 'bg-gradient-to-tr from-brand-950 via-brand-900 to-brand-800';
      case 'image':
        return 'bg-cover bg-center';
      case 'dot':
      default:
        return 'bg-dot-matrix';
    }
  };

  const getInlineStyles = () => {
    const styles: React.CSSProperties = {
      opacity: settings.opacity / 100,
    };

    if (settings.backgroundType === 'image') {
      styles.backgroundImage = `url('${settings.backgroundImage || '/hu-tao-placeholder.png'}')`;
      styles.filter = `blur(${settings.blurIntensity}px) brightness(0.2)`;
    }

    return styles;
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-brand-950 overflow-hidden pointer-events-none select-none">
      {/* Background Matrix/Texture */}
      <div 
        className={`absolute inset-0 w-full h-full transition-all duration-500 ${getBackgroundClass()}`} 
        style={getInlineStyles()}
      />
      
      {/* Glowing Orb Details */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${settings.accentColor} 0%, transparent 70%)`,
          filter: `blur(${40 + settings.glowAmount}px)`,
          opacity: (settings.glowAmount / 200) * 0.4
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${settings.accentColor} 0%, transparent 70%)`,
          filter: `blur(${40 + settings.glowAmount}px)`,
          opacity: (settings.glowAmount / 200) * 0.3
        }}
      />
    </div>
  );
};
