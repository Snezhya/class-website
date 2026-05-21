import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../utils/galleryUtils';

const jitter = (baseMs: number) => baseMs + Math.floor(Math.random() * 8) - 3;

/** Anime-style typing — natural delay with slight random variation */
export function useTerminalTypewriter(
  lines: string[],
  active: boolean,
  charDelayMs = 10
) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || lines.length === 0) {
      setDisplayLines([]);
      setDone(false);
      return;
    }

    if (prefersReducedMotion()) {
      setDisplayLines(lines);
      setDone(true);
      return;
    }

    let cancelled = false;
    setDisplayLines([]);
    setDone(false);

    const run = async () => {
      const completed: string[] = [];
      for (const line of lines) {
        if (cancelled) return;
        let current = '';
        for (const ch of line) {
          if (cancelled) return;
          current += ch;
          setDisplayLines([...completed, current]);
          await new Promise((r) => setTimeout(r, jitter(charDelayMs)));
        }
        completed.push(line);
        setDisplayLines([...completed]);
        await new Promise((r) => setTimeout(r, jitter(charDelayMs * 4)));
      }
      if (!cancelled) setDone(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [active, lines.join('\n'), charDelayMs]);

  return { displayLines, done };
};
