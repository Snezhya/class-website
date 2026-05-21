import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverMotion } from '../../utils/motionVariants';
import { softSpring } from '../../utils/animationConfig';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/** Framer: hover ringan saja — tidak ada entrance (konten langsung visible) */
export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  onClick,
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
      className={className}
      onClick={onClick}
      whileHover={{ ...cardHoverMotion.whileHover, transition: softSpring }}
      whileTap={{ ...cardHoverMotion.whileTap, transition: softSpring }}
    >
      {children}
    </motion.div>
  );
};
