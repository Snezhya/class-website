import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'ul';
  /** Animasi saat masuk viewport (default: true) */
  inView?: boolean;
}

export const StaggerReveal: React.FC<StaggerRevealProps> = ({
  children,
  className = '',
  as = 'div',
  inView = true,
}) => {
  const Tag = motion[as] as typeof motion.div;

  if (prefersReducedMotion()) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? undefined : 'show'}
      whileInView={inView ? 'show' : undefined}
      viewport={inView ? { once: true, margin: '-48px 0px' } : undefined}
    >
      {children}
    </Tag>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  if (prefersReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
};
