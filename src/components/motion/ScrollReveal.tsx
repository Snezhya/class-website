import React from 'react';
import { ANIM_LAYER, GSAP_SCROLL_CLASS } from '../../utils/animationLayers';

/** GSAP-only wrapper — jangan pasang initial/animate Framer pada elemen ini */
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    data-anim-layer={ANIM_LAYER.gsap}
    data-anim-role="scroll-reveal"
    className={`${GSAP_SCROLL_CLASS} ${className}`.trim()}
  >
    {children}
  </div>
);
