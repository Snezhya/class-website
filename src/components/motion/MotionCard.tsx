import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverMotion, cardMotion } from '../../utils/motionVariants';
import { tweenSmooth, softSpring } from '../../utils/animationConfig';
import { ANIM_LAYER } from '../../utils/animationLayers';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  layout?: boolean;
  /** Framer entrance — OFF when wrapped in ScrollReveal (GSAP owns enter) */
  hoverOnly?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  onClick,
  layout = false,
  hoverOnly = false,
}) => {
  if (prefersReducedMotion()) {
    return (
      <div className={className} onClick={onClick} role={onClick ? 'button' : undefined}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-anim-layer={ANIM_LAYER.framer}
      data-anim-role={hoverOnly ? 'card-hover' : 'card-enter-hover'}
      className={className}
      onClick={onClick}
      layout={layout}
      initial={hoverOnly ? false : cardMotion.initial}
      animate={hoverOnly ? undefined : cardMotion.animate}
      transition={hoverOnly ? undefined : tweenSmooth(0.5)}
      whileHover={{ ...cardHoverMotion.whileHover, transition: softSpring }}
      whileTap={{ ...cardHoverMotion.whileTap, transition: softSpring }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
};
