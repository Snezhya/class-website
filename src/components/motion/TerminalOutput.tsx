import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useTerminalTypewriter } from '../../hooks/useTerminalTypewriter';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface TerminalOutputProps {
  lines: string[];
  active?: boolean;
  className?: string;
  showCursor?: boolean;
  charDelayMs?: number;
  /** Tampilkan semua baris sekaligus (modal inspect) */
  instant?: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  lines,
  active = true,
  className = '',
  showCursor = true,
  charDelayMs = 14,
  instant = false,
}) => {
  const { displayLines, done } = useTerminalTypewriter(lines, active && !instant, charDelayMs);
  const visibleLines = instant && active ? lines : displayLines;
  const isDone = instant || done;
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cursorRef.current || prefersReducedMotion() || isDone || instant) return;
    const anim = animate(cursorRef.current, {
      opacity: [1, 0, 1],
      duration: 1100,
      loop: true,
      easing: 'easeInOutSine',
    });
    return () => {
      anim.pause();
    };
  }, [isDone, displayLines.length, instant]);

  return (
    <div
      data-anim-role="terminal-typing"
      className={`space-y-1.5 min-h-[8rem] ${className}`}
    >
      {active && visibleLines.length === 0 && (
        <div className="text-terminal-green/40 font-mono text-[11px]">$ awaiting stream...</div>
      )}
      {visibleLines.map((line, idx) => (
        <div key={idx} className="whitespace-pre-wrap break-words">
          {line}
          {showCursor && idx === visibleLines.length - 1 && !isDone && (
            <span ref={cursorRef} className="inline-block w-2 h-3.5 ml-0.5 bg-terminal-green/80 align-middle" />
          )}
        </div>
      ))}
    </div>
  );
};
