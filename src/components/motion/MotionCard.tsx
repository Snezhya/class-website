import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverMotion, staggerItem } from '../../utils/motionVariants';
import { softSpring, tweenSmooth } from '../../utils/animationConfig';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Entrance halus (di luar StaggerReveal) */
  reveal?: boolean;
  /** Pakai variant stagger — parent harus StaggerReveal */
  stagger?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  onClick,
  reveal = false,
  stagger = false,
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
      role={onClick ? 'button' : undefined}
      variants={stagger ? staggerItem : undefined}
      initial={reveal && !stagger ? { opacity: 0, y: 12 } : false}
      animate={reveal && !stagger ? { opacity: 1, y: 0 } : undefined}
      transition={reveal && !stagger ? tweenSmooth(0.5) : undefined}
      whileHover={{ ...cardHoverMotion.whileHover, transition: softSpring }}
      whileTap={{ ...cardHoverMotion.whileTap, transition: softSpring }}
    >
      {children}
    </motion.div>
  );
};
