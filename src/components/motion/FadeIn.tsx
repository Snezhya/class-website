import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/motionVariants';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  as = 'div',
}) => {
  if (prefersReducedMotion()) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = motion[as] as typeof motion.div;

  const variants = {
    hidden: fadeInUp.hidden,
    show: {
      ...fadeInUp.show,
      transition: { ...fadeInUp.show.transition, delay },
    },
  };

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-32px 0px' }}
    >
      {children}
    </Tag>
  );
};
