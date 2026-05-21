/**
 * Animation architecture — ONE library per DOM element.
 *
 * | Layer        | Library       | Use for                                      | Never use for                    |
 * |--------------|---------------|----------------------------------------------|----------------------------------|
 * | UI           | Framer Motion | page transition, modal, sidebar, card hover  | scroll reveal, hero, counters    |
 * | Scene/Scroll | GSAP          | hero timeline, ScrollTrigger, section enter  | modals, hover, typing            |
 * | Micro        | Anime.js      | typing, number counters, pulse/bounce        | layout, page structure, scroll |
 *
 * Pattern: wrap GSAP targets in <ScrollReveal>, use <MotionCard hoverOnly> inside.
 */

export const ANIM_LAYER = {
  framer: 'framer',
  gsap: 'gsap',
  anime: 'anime',
} as const;

export type AnimLayer = (typeof ANIM_LAYER)[keyof typeof ANIM_LAYER];

/** GSAP scroll / hero selectors (not Framer-controlled) */
export const GSAP_SCROLL_CLASS = 'scroll-reveal';
export const GSAP_HERO_CLASS = 'gsap-reveal';
export const GSAP_STAGGER_CLASS = 'gsap-stagger';
