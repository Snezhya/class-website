import React, { useState, useEffect } from 'react';
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
import { GalleryAlbumEditor } from '../components/gallery/GalleryAlbumEditor';
import { useDragDropUpload } from '../hooks/useDragDropUpload';
import { Image, Search, Plus, Calendar, Trash2, Eye, Layers, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { softSpring, HOVER_LIFT_Y } from '../utils/animationConfig';
import { StaggerReveal, StaggerItem } from '../components/motion/StaggerReveal';

/** Framer: hover ringan saja — kartu langsung tampil */
const GalleryCardInner: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  reduced: boolean;
}> = ({ children, onClick, reduced }) => (
  <motion.div
    data-anim-layer="framer"
    data-anim-role="gallery-card-hover"
    onClick={onClick}
    whileHover={reduced ? {} : { y: HOVER_LIFT_Y }}
    transition={softSpring}
    className="cursor-pointer group relative rounded-xl overflow-hidden border border-brand-800 hover:border-brand-500/50 bg-brand-900/20 shadow-lg hover:shadow-2xl transition-[border-color,box-shadow] duration-500 ease-out h-full"
  >
    {children}
  </motion.div>
);

export const Gallery: React.FC = () => {
  const { gallery, addGalleryAlbum, deleteGallery, isAdmin } = useApp();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Practicum' | 'Event' | 'Exam' | 'Classroom'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectAlbum, setInspectAlbum] = useState<GalleryAlbum | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryAlbum['category']>('Practicum');
  const [formDate, setFormDate] = useState('');
  const [formPhotoFiles, setFormPhotoFiles] = useState<File[]>([]);
  const [formPreview, setFormPreview] = useState('/hu-tao-placeholder.png');
  const [isUploading, setIsUploading] = useState(false);

  const reduced = prefersReducedMotion();

  const handlePhotoFilesSelected = (files: File[]) => {
    setFormPhotoFiles(files);
    if (files.length > 0) {
      setFormPreview(URL.createObjectURL(files[0]));
    }
  };

  const { isDragging: isFormDragging, ...dragDropProps } = useDragDropUpload({
    onFileSelect: handlePhotoFilesSelected,
    multiple: true,
  });

  const filteredAlbums = gallery.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' ? true : album.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!inspectAlbum) return;
    const fresh = gallery.find((a) => a.id === inspectAlbum.id);
    if (fresh) setInspectAlbum(fresh);
  }, [gallery, inspectAlbum?.id]);

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
      toast('Pilih minimal 1 foto (file pertama = sampul album)', 'warning');
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
        date: formDate,
      });

      setIsAddModalOpen(false);
      toast(
        urls.length > 1
          ? `Album "${formTitle}" — sampul + ${urls.length - 1} foto`
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

  const syncAlbum = (updated: GalleryAlbum) => {
    if (inspectAlbum?.id === updated.id) setInspectAlbum(updated);
    if (editingAlbum?.id === updated.id) setEditingAlbum(updated);
  };

  const openEdit = (album: GalleryAlbum, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingAlbum(album);
  };

  const slides = inspectAlbum ? getAlbumSlides(inspectAlbum) : [];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-brand-400" />
                Media Gallery & Activity Archive
              </h2>
              <p className="text-xs text-slate-500 max-w-lg font-sans">
                Setiap kartu adalah <strong className="text-slate-400">sampul album</strong>.
                Klik untuk membuka galeri lengkap semua foto dalam moment itu.
              </p>
            </div>
            {isAdmin && (
              <Button variant="terminal" size="sm" onClick={() => {
                setFormTitle('');
                setFormDesc('');
                setFormCategory('Practicum');
                setFormDate('');
                setFormPhotoFiles([]);
                setFormPreview('/hu-tao-placeholder.png');
                setIsAddModalOpen(true);
              }} icon={Plus}>
                Buat Album
              </Button>
            )}
          </div>
        </Card>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
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
            <Button
              key={cat}
              variant={activeCategory === cat ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredAlbums.length === 0 ? (
        <EmptyState
          title="GALLERY_EMPTY"
          description="Belum ada album. Admin: buat album dengan beberapa foto sekaligus."
          actionText={isAdmin ? 'Buat album' : 'Reset filter'}
          onAction={isAdmin ? () => setIsAddModalOpen(true) : () => setActiveCategory('All')}
          icon={Image}
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" inView={false}>
          {filteredAlbums.map((album) => {
            const photoCount = getAlbumPhotoCount(album);
            return (
              <StaggerItem key={album.id} className="gallery-card-wrapper">
                <GalleryCardInner
                  reduced={reduced}
                  onClick={() => setInspectAlbum(album)}
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-950">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
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
                    <div className="absolute inset-0 bg-brand-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white">
                        <Eye className="w-5 h-5" />
                      </div>
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
                    <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={(e) => openEdit(album, e)}
                        className="p-1.5 rounded-lg bg-brand-800/80 border border-brand-600 text-brand-300 hover:text-white"
                        title="Edit album"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAlbum(e, album.id, album.title)}
                        className="p-1.5 rounded-lg bg-terminal-red/10 border border-terminal-red/20 text-terminal-red hover:bg-terminal-red/30"
                        title="Hapus seluruh album"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </GalleryCardInner>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      )}

      {inspectAlbum && slides.length > 0 && (
        <GalleryLightbox
          isOpen
          album={inspectAlbum}
          slides={slides}
          initialIndex={0}
          onClose={() => setInspectAlbum(null)}
          isAdmin={isAdmin}
          onEdit={isAdmin ? () => openEdit(inspectAlbum) : undefined}
        />
      )}

      {editingAlbum && (
        <GalleryAlbumEditor
          album={editingAlbum}
          isOpen={!!editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onUpdated={(updated) => {
            syncAlbum(updated);
          }}
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
            <label className="text-slate-400">TANGGAL (opsional)</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">FOTO ALBUM * (banyak file)</label>
            <p className="text-[9px] text-slate-600 mb-1">
              File <strong>pertama</strong> = sampul di halaman. Sisanya masuk galeri saat dibuka.
            </p>
            <div
              {...dragDropProps}
              className={`border-2 border-dashed rounded-lg p-6 bg-brand-950 text-center relative transition-all ${
                isFormDragging
                  ? 'border-brand-400 bg-brand-900 scale-[1.01]'
                  : 'border-brand-800'
              }`}
            >
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
                {isFormDragging ? (
                  <span className="text-brand-300 font-bold">Lepaskan untuk pilih foto</span>
                ) : formPhotoFiles.length > 0 ? (
                  `${formPhotoFiles.length} file — #1 sampul, sisanya galeri`
                ) : (
                  'Drag & drop atau klik untuk pilih foto'
                )}
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
