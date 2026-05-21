import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useTerminalTypewriter } from '../../hooks/useTerminalTypewriter';
import { ANIM_LAYER } from '../../utils/animationLayers';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface TerminalOutputProps {
  lines: string[];
  active?: boolean;
  className?: string;
  showCursor?: boolean;
  charDelayMs?: number;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  lines,
  active = true,
  className = '',
  showCursor = true,
  charDelayMs = 14,
}) => {
  const { displayLines, done } = useTerminalTypewriter(lines, active, charDelayMs);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cursorRef.current || prefersReducedMotion() || done) return;
    const anim = animate(cursorRef.current, {
      opacity: [1, 0, 1],
      duration: 1100,
      loop: true,
      easing: 'easeInOutSine',
    });
    return () => {
      anim.pause();
    };
  }, [done, displayLines.length]);

  return (
    <div data-anim-layer={ANIM_LAYER.anime} data-anim-role="terminal-typing" className={`space-y-1.5 ${className}`}>
      {displayLines.map((line, idx) => (
        <div key={idx} className="whitespace-pre">
          {line}
          {showCursor && idx === displayLines.length - 1 && !done && (
            <span ref={cursorRef} className="inline-block w-2 h-3.5 ml-0.5 bg-terminal-green/80 align-middle" />
          )}
        </div>
      ))}
    </div>
  );
};
