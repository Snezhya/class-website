/**
 * Shared timing tokens — used WITH animationLayers rules (one lib per element).
 */

export const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export const tweenSmooth = (duration = 0.55, delay = 0) => ({
  duration,
  delay,
  ease: SMOOTH_EASE,
});

/** Framer: soft spring, minimal bounce */
export const softSpring = {
  type: 'spring' as const,
  stiffness: 140,
  damping: 22,
  mass: 0.9,
};

export const gentleSpring = {
  type: 'spring' as const,
  stiffness: 110,
  damping: 20,
  mass: 1,
};

/** GSAP scene layer */
export const GSAP_SMOOTH_EASE = 'expo.out';
export const GSAP_SCROLL_EASE = 'power4.out';

export const gsapReveal = {
  y: 18,
  duration: 1.05,
  ease: GSAP_SCROLL_EASE,
};

export const gsapHero = {
  y: 22,
  duration: 1.15,
  stagger: 0.09,
  ease: GSAP_SMOOTH_EASE,
};

/** Framer hover — max 2px lift */
export const HOVER_LIFT_Y = -2;
export const HOVER_SCALE = 1.006;
