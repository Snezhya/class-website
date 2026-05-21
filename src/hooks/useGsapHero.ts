import { useEffect, type RefObject } from 'react';
import { ensureGsapPlugins, gsap } from '../utils/gsapSetup';
import { gsapHero, GSAP_SMOOTH_EASE } from '../utils/animationConfig';
import { GSAP_HERO_CLASS } from '../utils/animationLayers';
import { prefersReducedMotion } from '../utils/galleryUtils';

/** GSAP-only hero timeline + parallax (no Framer on same nodes) */
export function useGsapHero(heroRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled || !heroRef.current || prefersReducedMotion()) return;

    ensureGsapPlugins();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: GSAP_SMOOTH_EASE } });
      tl.from(`.${GSAP_HERO_CLASS}`, {
        opacity: 0,
        y: gsapHero.y,
        duration: gsapHero.duration,
        stagger: gsapHero.stagger,
      }).from('.hero-parallax', { opacity: 0, x: 28, duration: 1.25 }, '-=0.7');

      gsap.to('.hero-parallax', {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 2.8,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, [enabled, heroRef]);
}
