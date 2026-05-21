import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { uploadGalleryPhoto } from '../../utils/supabaseApi';
import { type GalleryAlbum } from '../../data/initialData';
import { Image, Trash2, Star, Plus, Save } from 'lucide-react';

interface GalleryAlbumEditorProps {
  album: GalleryAlbum;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (album: GalleryAlbum) => void;
}

export const GalleryAlbumEditor: React.FC<GalleryAlbumEditorProps> = ({
  album,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const {
    updateGalleryAlbum,
    addPhotosToGalleryAlbum,
    deleteGalleryPhoto,
    setGalleryCoverFromPhoto,
  } = useApp();
  const { toast } = useToast();

  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description);
  const [category, setCategory] = useState(album.category);
  const [coverImage, setCoverImage] = useState(album.coverImage);
  const [photos, setPhotos] = useState(album.photos);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(album.title);
    setDescription(album.description);
    setCategory(album.category);
    setCoverImage(album.coverImage);
    setPhotos(album.photos);
  }, [album]);

  const saveMeta = async () => {
    setBusy(true);
    try {
      const updated = await updateGalleryAlbum(album.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        coverImage,
      });
      onUpdated(updated);
      toast('Info album disimpan', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReplaceCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadGalleryPhoto(file);
      setCoverImage(url);
      const updated = await updateGalleryAlbum(album.id, { coverImage: url });
      onUpdated(updated);
      toast('Sampul album diperbarui', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleAddChildren = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadGalleryPhoto(f));
      const updated = await addPhotosToGalleryAlbum(album.id, urls);
      setPhotos(updated.photos);
      onUpdated(updated);
      toast(`${urls.length} foto ditambahkan ke album`, 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleDeleteChild = async (photoId: string) => {
    if (!window.confirm('Hapus foto tambahan ini? Sampul album tetap ada.')) return;
    setBusy(true);
    try {
      const updated = await deleteGalleryPhoto(album.id, photoId);
      setPhotos(updated.photos);
      onUpdated(updated);
      toast('Foto dihapus dari album', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSetCoverFromChild = async (photoId: string) => {
    setBusy(true);
    try {
      const updated = await setGalleryCoverFromPhoto(album.id, photoId);
      setCoverImage(updated.coverImage);
      setPhotos(updated.photos);
      onUpdated(updated);
      toast('Foto ini sekarang jadi sampul', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`edit_album: ${album.title}`} size="lg">
      <div className="space-y-5 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-slate-400">JUDUL</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-slate-400">DESKRIPSI</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white h-16 outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">KATEGORI</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryAlbum['category'])}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            >
              <option value="Practicum">PRACTICUM</option>
              <option value="Event">EVENT</option>
              <option value="Exam">EXAM</option>
              <option value="Classroom">CLASSROOM</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 border-t border-brand-800 pt-4">
          <label className="text-slate-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-terminal-cyan" />
            SAMPUL ALBUM · tampil di halaman
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full sm:w-40 aspect-video object-cover rounded-lg border-2 border-brand-500"
            />
            <label className="flex-1 border border-dashed border-brand-700 rounded-lg p-4 text-center cursor-pointer hover:border-brand-500 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={busy}
                onChange={handleReplaceCover}
              />
              <Image className="w-6 h-6 mx-auto text-slate-500 mb-1" />
              <span className="text-[10px] text-slate-400">Unggah sampul baru</span>
            </label>
          </div>
        </div>

        <div className="space-y-2 border-t border-brand-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-slate-400">FOTO TAMBAHAN ({photos.length})</label>
              <label className="inline-flex items-center gap-1 px-2 py-1 rounded border border-brand-700 text-brand-300 cursor-pointer hover:bg-brand-800/50 relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={busy}
                  onChange={handleAddChildren}
                />
                <Plus className="w-3.5 h-3.5" />
                Tambah foto
              </label>
            </div>

            {photos.length === 0 ? (
              <p className="text-slate-600 text-[10px]">Belum ada foto tambahan — hanya sampul.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative group rounded-lg overflow-hidden border border-brand-800 aspect-video"
                  >
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-brand-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="Jadikan sampul album"
                        disabled={busy}
                        onClick={() => handleSetCoverFromChild(p.id)}
                        className="p-1.5 rounded bg-brand-800 text-terminal-cyan hover:bg-brand-700"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Hapus foto ini"
                        disabled={busy}
                        onClick={() => handleDeleteChild(p.id)}
                        className="p-1.5 rounded bg-terminal-red/20 text-terminal-red hover:bg-terminal-red/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={busy}>
            Tutup
          </Button>
          <Button variant="primary" type="button" icon={Save} disabled={busy} onClick={saveMeta}>
            {busy ? 'Menyimpan...' : 'Simpan info'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
