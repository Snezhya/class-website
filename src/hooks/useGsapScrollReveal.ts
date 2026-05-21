import { useEffect, type RefObject } from 'react';
import { ensureGsapPlugins, gsap } from '../utils/gsapSetup';
import { gsapReveal, GSAP_SCROLL_EASE } from '../utils/animationConfig';
import { prefersReducedMotion } from '../utils/galleryUtils';

/** GSAP ScrollTrigger — reveal halus saat scroll */
export function useGsapScrollReveal(
  containerRef: RefObject<HTMLElement | null>,
  selector = '[data-anim-role="scroll-reveal"]',
  deps: unknown[] = []
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || prefersReducedMotion()) return;

    ensureGsapPlugins();
    const targets = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector));
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      targets.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: gsapReveal.y,
          duration: gsapReveal.duration,
          delay: i * 0.04,
          ease: GSAP_SCROLL_EASE,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, deps);
}
