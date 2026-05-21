import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { uploadGalleryPhoto } from '../utils/supabaseApi';
import { getAlbumSlides, getAlbumPhotoCount, prefersReducedMotion } from '../utils/galleryUtils';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { useToast } from '../context/ToastContext';
import { type GalleryAlbum } from '../data/initialData';
import { Image, Search, Plus, Calendar, Trash2, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const springTransition = { type: 'spring' as const, stiffness: 380, damping: 32 };

export const Gallery: React.FC = () => {
  const { gallery, addGalleryAlbum, deleteGallery, isAdmin } = useApp();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Practicum' | 'Event' | 'Exam' | 'Classroom'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectAlbum, setInspectAlbum] = useState<GalleryAlbum | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryAlbum['category']>('Practicum');
  const [formPhotoFiles, setFormPhotoFiles] = useState<File[]>([]);
  const [formPreview, setFormPreview] = useState('/hu-tao-placeholder.png');
  const [isUploading, setIsUploading] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  const filteredAlbums = gallery.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' ? true : album.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!gridRef.current || filteredAlbums.length === 0) return;
    const cards = gridRef.current.querySelectorAll('.gallery-card-anim');
    gsap.killTweensOf(cards);
    if (reduced) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      return;
    }
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' }
    );
  }, [filteredAlbums.length, activeCategory, searchQuery, reduced]);

  useEffect(() => {
    if (!headerRef.current || reduced) return;
    gsap.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  }, [reduced]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setFormPhotoFiles(files);
    setFormPreview(URL.createObjectURL(files[0]));
  };

  const handleAddAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      toast('Title and description are required', 'warning');
      return;
    }
    if (formPhotoFiles.length === 0) {
      toast('Pilih minimal 1 foto (foto pertama = thumbnail album)', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of formPhotoFiles) {
        urls.push(await uploadGalleryPhoto(file));
      }
      const [coverImage, ...childImageUrls] = urls;

      await addGalleryAlbum({
        title: formTitle,
        description: formDesc,
        category: formCategory,
        coverImage,
        childImageUrls,
      });

      setIsAddModalOpen(false);
      toast(
        urls.length > 1
          ? `Album "${formTitle}" — 1 thumbnail + ${urls.length - 1} foto anak`
          : `Album "${formTitle}" ditambahkan`,
        'success'
      );
    } catch (err: any) {
      toast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAlbum = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Hapus album "${title}" dan semua fotonya?`)) {
      deleteGallery(id);
      if (inspectAlbum?.id === id) setInspectAlbum(null);
      toast(`Album "${title}" dihapus`, 'error');
    }
  };

  const slides = inspectAlbum ? getAlbumSlides(inspectAlbum) : [];

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-brand-400" />
                Media Gallery & Activity Archive
              </h2>
              <p className="text-xs text-slate-500 max-w-lg font-sans">
                Halaman hanya menampilkan <strong className="text-slate-400">thumbnail album</strong>.
                Klik untuk inspect — lihat foto utama + semua foto anak di bawah.
              </p>
            </div>
            {isAdmin && (
              <Button variant="terminal" size="sm" onClick={() => {
                setFormTitle('');
                setFormDesc('');
                setFormCategory('Practicum');
                setFormPhotoFiles([]);
                setFormPreview('/hu-tao-placeholder.png');
                setIsAddModalOpen(true);
              }} icon={Plus}>
                Buat Album
              </Button>
            )}
          </div>
        </Card>
      </div>

      <motion.div layout className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-800 rounded-lg text-xs text-white outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 w-full md:w-auto">
          {(['All', 'Practicum', 'Classroom', 'Event', 'Exam'] as const).map((cat) => (
            <motion.div key={cat} layout transition={springTransition}>
              <Button
                variant={activeCategory === cat ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {filteredAlbums.length === 0 ? (
        <EmptyState
          title="GALLERY_EMPTY"
          description="Belum ada album. Admin: buat album dengan beberapa foto sekaligus."
          actionText={isAdmin ? 'Buat album' : 'Reset filter'}
          onAction={isAdmin ? () => setIsAddModalOpen(true) : () => setActiveCategory('All')}
          icon={Image}
        />
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAlbums.map((album) => {
              const photoCount = getAlbumPhotoCount(album);
              return (
                <motion.div
                  key={album.id}
                  layout
                  layoutId={`album-${album.id}`}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                  onClick={() => setInspectAlbum(album)}
                  className="gallery-card-anim cursor-pointer group relative rounded-xl overflow-hidden border border-brand-800 hover:border-brand-500/50 bg-brand-900/20 shadow-lg hover:shadow-2xl transition-[border-color,box-shadow] duration-300"
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-950">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 bg-brand-950/80 border border-brand-800 backdrop-blur-sm text-[9px] font-mono text-brand-400 px-2 py-0.5 rounded">
                      {album.category.toUpperCase()}
                    </span>
                    {photoCount > 1 && (
                      <span className="absolute top-3 right-3 bg-brand-950/90 border border-brand-700 text-[9px] font-mono text-terminal-cyan px-2 py-0.5 rounded flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {photoCount} foto
                      </span>
                    )}
                    <div className="absolute inset-0 bg-brand-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        whileHover={reduced ? {} : { scale: 1.1 }}
                        className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {album.date}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                      {album.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{album.description}</p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAlbum(e, album.id, album.title)}
                      className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-terminal-red/10 border border-terminal-red/20 text-terminal-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {inspectAlbum && (
        <GalleryLightbox
          isOpen={!!inspectAlbum}
          album={inspectAlbum}
          slides={slides}
          initialIndex={0}
          onClose={() => setInspectAlbum(null)}
        />
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="buat_album_gallery.sh">
        <form onSubmit={handleAddAlbum} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">JUDUL ALBUM *</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              placeholder="e.g. Praktikum Fiber Optik"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">DESKRIPSI *</label>
            <textarea
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white h-20 outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">KATEGORI</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as GalleryAlbum['category'])}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            >
              <option value="Practicum">PRACTICUM</option>
              <option value="Event">EVENT</option>
              <option value="Exam">EXAM</option>
              <option value="Classroom">CLASSROOM</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">FOTO ALBUM * (banyak file)</label>
            <p className="text-[9px] text-slate-600 mb-1">
              File <strong>pertama</strong> = thumbnail di halaman. Sisanya = foto anak (hanya di inspect).
            </p>
            <div className="border border-dashed border-brand-800 rounded-lg p-6 bg-brand-950 text-center relative">
              <input
                type="file"
                accept="image/*"
                multiple
                required
                onChange={handlePhotoSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {formPreview !== '/hu-tao-placeholder.png' ? (
                <img src={formPreview} alt="" className="max-h-24 mx-auto rounded object-cover" />
              ) : (
                <Image className="w-8 h-8 text-slate-500 mx-auto" />
              )}
              <span className="text-[10px] text-slate-400 block mt-2">
                {formPhotoFiles.length > 0
                  ? `${formPhotoFiles.length} file — #1 thumbnail, #2+ foto anak`
                  : 'Pilih banyak foto sekaligus'}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Simpan Album'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
