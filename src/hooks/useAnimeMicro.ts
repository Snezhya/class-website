import { useEffect, type RefObject } from 'react';
import { animate } from 'animejs';
import { prefersReducedMotion } from '../utils/galleryUtils';

/** Anime.js — micro interaction halus */
export function useAnimePulse(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  intervalMs = 5000
) {
  useEffect(() => {
    if (!active || !ref.current || prefersReducedMotion()) return;
    const el = ref.current;

    const tick = () => {
      animate(el, {
        scale: [1, 1.05, 1],
        duration: 900,
        easing: 'easeInOutSine',
      });
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}

export function useAnimeShake(ref: RefObject<HTMLElement | null>, trigger: number) {
  useEffect(() => {
    if (!ref.current || trigger === 0 || prefersReducedMotion()) return;
    animate(ref.current, {
      translateX: [-2, 2, -1, 1, 0],
      duration: 520,
      easing: 'easeInOutSine',
    });
  }, [trigger]);
}
