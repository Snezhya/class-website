import { softSpring, gentleSpring, tweenSmooth, HOVER_LIFT_Y, HOVER_SCALE } from './animationConfig';

/** Framer Motion — UI transitions, hover, layout */
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: tweenSmooth(0.48),
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: tweenSmooth(0.36),
  },
};

export const staggerContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: tweenSmooth(0.5),
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: tweenSmooth(0.55),
  },
};

export const drawerBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: tweenSmooth(0.45) },
  exit: { opacity: 0, transition: tweenSmooth(0.35) },
};

export const drawerPanel = {
  initial: { x: '100%' },
  animate: { x: 0, transition: softSpring },
  exit: { x: '100%', transition: tweenSmooth(0.4) },
};

export const cardMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: tweenSmooth(0.5),
};

export const cardHoverMotion = {
  whileHover: { y: HOVER_LIFT_Y, scale: HOVER_SCALE },
  whileTap: { scale: 0.995 },
  transition: softSpring,
};

export const layoutSpring = {
  layout: true,
  transition: gentleSpring,
};

export const overlayPop = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: tweenSmooth(0.5) },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: tweenSmooth(0.38) },
};

/** Galeri lightbox — slide + fade (custom = arah: 1 maju, -1 mundur) */
export const lightboxSlideFade = {
  enter: (direction: number) => ({
    x: direction === 0 ? 0 : direction > 0 ? '18%' : '-18%',
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: tweenSmooth(0.44),
  },
  exit: (direction: number) => ({
    x: direction === 0 ? 0 : direction > 0 ? '-14%' : '14%',
    opacity: 0,
    scale: 0.97,
    transition: tweenSmooth(0.36),
  }),
};
