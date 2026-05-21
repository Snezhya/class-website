import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from '../../utils/motionVariants';
import { ANIM_LAYER } from '../../utils/animationLayers';
import { prefersReducedMotion } from '../../utils/galleryUtils';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (prefersReducedMotion()) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-anim-layer={ANIM_LAYER.framer}
        data-anim-role="page-transition"
        className="w-full will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
