import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/** Map theme name → data-theme attribute applied to <html> */
const THEME_ATTR = 'data-theme';

export const Background: React.FC = () => {
  const { settings } = useApp();

  // Apply theme class to <html> so CSS variables cascade globally
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTR, settings.theme);
    return () => {
      // keep attribute on unmount — layout stays correct
    };
  }, [settings.theme]);

  const getPatternClass = () => {
    switch (settings.backgroundType) {
      case 'grid':      return 'bg-grid-matrix';
      case 'gradient':  return 'bg-gradient-to-tr from-[var(--bg-950)] via-[var(--bg-900)] to-[var(--bg-800)]';
      case 'image':     return 'bg-cover bg-center';
      case 'dot':
      default:          return 'bg-dot-matrix';
    }
  };

  const getInlineStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (settings.backgroundType === 'image') {
      styles.backgroundImage = `url('${settings.backgroundImage || '/hu-tao-placeholder.png'}')`;
      styles.filter = `blur(${settings.blurIntensity}px) brightness(0.2)`;
      styles.opacity = settings.opacity / 100;
    } else {
      styles.opacity = settings.opacity / 100;
    }
    return styles;
  };

  const isLight = settings.theme === 'light';
  const isGlass = settings.theme === 'glass' || settings.theme === 'glass-blur';

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none select-none"
         style={{ background: 'var(--bg-base)' }}>
      {/* Pattern / texture layer */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ${getPatternClass()}`}
        style={getInlineStyles()}
      />

      {/* Glass-blur: heavy frosted layer */}
      {settings.theme === 'glass-blur' && (
        <div className="absolute inset-0 backdrop-blur-2xl bg-white/5" />
      )}

      {/* Glass: lighter frosted layer */}
      {settings.theme === 'glass' && (
        <div className="absolute inset-0 backdrop-blur-md bg-white/[0.04]" />
      )}

      {/* Accent glow orbs — skip for light theme */}
      {!isLight && (
        <>
          <div
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${settings.accentColor} 0%, transparent 70%)`,
              filter: `blur(${40 + settings.glowAmount}px)`,
              opacity: isGlass ? (settings.glowAmount / 200) * 0.25 : (settings.glowAmount / 200) * 0.4,
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${settings.accentColor} 0%, transparent 70%)`,
              filter: `blur(${40 + settings.glowAmount}px)`,
              opacity: isGlass ? (settings.glowAmount / 200) * 0.2 : (settings.glowAmount / 200) * 0.3,
            }}
          />
        </>
      )}

      {/* Light theme: subtle warm overlay */}
      {isLight && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-white/60 to-blue-50/40" />
      )}
    </div>
  );
};
