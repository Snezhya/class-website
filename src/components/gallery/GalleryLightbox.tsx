import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Images, Pencil } from 'lucide-react';
import { type GalleryAlbum } from '../../data/initialData';
import { type LightboxSlide, prefersReducedMotion } from '../../utils/galleryUtils';

interface GalleryLightboxProps {
  album: GalleryAlbum;
  slides: LightboxSlide[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  album,
  slides,
  initialIndex,
  isOpen,
  onClose,
  isAdmin,
  onEdit,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const reduced = prefersReducedMotion();

  const current = slides[index] ?? slides[0];
  const hasMultiple = slides.length > 1;
  const isCover = index === 0;

  useEffect(() => {
    if (isOpen) setIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (!isOpen || !thumbStripRef.current) return;
    const active = thumbStripRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [index, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, index, goTo, onClose]);

  if (!isOpen || !current) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={album.title}
          data-anim-layer="framer"
          data-anim-role="lightbox-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-brand-950/97 backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 border-b border-brand-800/80 shrink-0">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-brand-400 flex items-center gap-1.5 truncate">
                <Images className="w-3.5 h-3.5 shrink-0" />
                ALBUM · {slides.length} foto · {album.category.toUpperCase()}
              </p>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">{album.title}</h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800/60 transition-colors"
                  aria-label="Edit album"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-brand-800/60 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden px-12 sm:px-16 py-2"
            onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || !hasMultiple) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              if (Math.abs(dx) > 48) goTo(dx > 0 ? index - 1 : index + 1);
              touchStartX.current = null;
            }}
          >
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-brand-900/90 border border-brand-700 text-white hover:bg-brand-800 transition-colors"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-brand-900/90 border border-brand-700 text-white hover:bg-brand-800 transition-colors"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            <div className="flex flex-col items-center justify-center w-full h-full max-h-full gap-2 pointer-events-none">
              {isCover && (
                <span className="text-[9px] font-mono text-terminal-cyan bg-brand-950/90 px-2 py-0.5 rounded border border-brand-700 pointer-events-auto">
                  SAMPUL ALBUM
                </span>
              )}
              <img
                key={current.id}
                src={current.image}
                alt={album.title}
                className="pointer-events-auto block max-w-[min(100%,min(90vw,56rem))] max-h-[min(calc(100vh-12rem),70vh)] w-auto h-auto object-contain rounded-lg border border-brand-800 shadow-2xl mx-auto"
                draggable={false}
              />
            </div>

            {hasMultiple && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 bg-brand-950/90 px-2 py-0.5 rounded border border-brand-800">
                {index + 1} / {slides.length}
              </span>
            )}
          </div>

          <div className="px-4 sm:px-6 py-2 shrink-0 max-w-3xl mx-auto w-full">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {album.date}
            </span>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{album.description}</p>
          </div>

          {hasMultiple && (
            <div className="shrink-0 border-t border-brand-800/80 bg-brand-900/40 px-3 sm:px-4 py-3">
              <p className="text-[9px] font-mono text-slate-500 mb-2 uppercase tracking-wider">
                Galeri moment · semua frame
              </p>
              <div
                ref={thumbStripRef}
                className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 snap-x snap-mandatory justify-center"
              >
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    data-active={i === index ? 'true' : 'false'}
                    onClick={() => setIndex(i)}
                    className={`relative shrink-0 snap-center rounded-lg overflow-hidden border-2 transition-all duration-300 w-16 h-12 sm:w-20 sm:h-14 ${
                      i === index
                        ? 'border-brand-400 shadow-lg shadow-brand-500/25 opacity-100'
                        : 'border-brand-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={slide.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {i === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-brand-950/90 text-[7px] font-mono text-center text-terminal-cyan py-0.5">
                        SAMPUL
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
