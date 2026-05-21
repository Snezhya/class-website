import { type GalleryAlbum } from '../data/initialData';

export type LightboxSlide = { id: string; image: string };

/** Semua frame untuk lightbox: sampul + foto tambahan */
export const getAlbumSlides = (album: GalleryAlbum): LightboxSlide[] => [
  { id: `${album.id}-cover`, image: album.coverImage },
  ...album.photos.map((p) => ({ id: p.id, image: p.image })),
];

export const getAlbumPhotoCount = (album: GalleryAlbum): number =>
  1 + album.photos.length;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
