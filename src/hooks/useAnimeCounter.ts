import { useEffect } from 'react';
import { animate } from 'animejs';
import { prefersReducedMotion } from '../utils/galleryUtils';

type CounterTarget = { selector: string; value: number };

/** Anime.js-only number counters (never on Framer motion nodes) */
export function useAnimeCounter(targets: CounterTarget[], deps: unknown[] = []) {
  useEffect(() => {
    if (prefersReducedMotion()) {
      targets.forEach(({ selector, value }) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.textContent = String(value);
        });
      });
      return;
    }

    const instances = targets.map(({ selector, value }, i) =>
      animate(selector, {
        innerHTML: [0, value],
        round: 1,
        easing: 'easeOutCubic',
        duration: 2000,
        delay: i * 120,
      })
    );

    return () => {
      instances.forEach((a) => a.pause());
    };
  }, deps);
}
