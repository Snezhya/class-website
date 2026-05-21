import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sortByAbsen } from '../../utils/attendance';
import { prefersReducedMotion } from '../../utils/galleryUtils';
import { ANIM_LAYER } from '../../utils/animationLayers';
import gsap from 'gsap';

export const AttendanceMarquee: React.FC = () => {
  const { members } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const list = sortByAbsen(members);
  const reduced = prefersReducedMotion();

  const items = list.length > 0 ? [...list, ...list] : [];

  useEffect(() => {
    if (!trackRef.current || items.length === 0 || reduced) return;
    const track = trackRef.current;
    const half = track.scrollHeight / 2;
    gsap.killTweensOf(track);
    gsap.set(track, { force3D: true });
    gsap.to(track, {
      y: -half,
      duration: Math.max(40, list.length * 3.2),
      ease: 'none',
      repeat: -1,
    });
  }, [items.length, list.length, reduced]);

  if (list.length === 0) return null;

  return (
    <div
      data-anim-layer={ANIM_LAYER.gsap}
      data-anim-role="attendance-scroll"
      className="relative h-[300px] overflow-hidden rounded-xl border border-brand-800 bg-brand-950/50"
    >
      <div className="absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-brand-950 via-brand-950/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-brand-950 via-brand-950/80 to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className={`flex flex-col gap-3 px-4 py-3 will-change-transform ${reduced ? 'max-h-full overflow-y-auto' : ''}`}
      >
        {items.map((m, i) => (
          <div
            key={`${m.id}-${i}`}
            className="attendance-card flex items-center gap-3 shrink-0"
          >
            <span className="w-9 h-9 shrink-0 rounded-lg bg-brand-500 border-2 border-brand-950 text-sm font-mono font-bold text-white flex items-center justify-center">
              {m.absen || '—'}
            </span>
            <img
              src={m.image}
              alt={m.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-700 shadow-lg shrink-0"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{m.name}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{m.role}</p>
            </div>
            {m.isCore && (
              <span className="text-[8px] font-mono text-terminal-yellow bg-terminal-yellow/10 border border-terminal-yellow/20 px-1.5 py-0.5 rounded shrink-0">
                COUNCIL
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
