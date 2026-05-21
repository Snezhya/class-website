import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GalleryAlbumEditor } from '../gallery/GalleryAlbumEditor';
import { uploadGalleryPhoto } from '../../utils/supabaseApi';
import { useDragDropUpload } from '../../hooks/useDragDropUpload';
import { type GalleryAlbum } from '../../data/initialData';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const AdminGalleryPanel: React.FC = () => {
  const { gallery, addGalleryAlbum, deleteGallery } = useApp();
  const { toast } = useToast();
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GalleryAlbum['category']>('Practicum');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setFiles(files);
  };

  const dragDrop = useDragDropUpload({ onFileSelect: handleFilesSelected, multiple: true });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || files.length === 0) {
      toast('Judul, deskripsi, dan minimal 1 foto wajib', 'warning');
      return;
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        urls.push(await uploadGalleryPhoto(f));
      }
      await addGalleryAlbum({
        title: title.trim(),
        description: description.trim(),
        category,
        coverImage: urls[0],
        childImageUrls: urls.slice(1),
      });
      setTitle('');
      setDescription('');
      setFiles([]);
      setAdding(false);
      toast('Album galeri dibuat', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const syncAlbum = (updated: GalleryAlbum) => {
    setEditingAlbum(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500 font-mono">
          Edit album lengkap (sampul + foto) atau buat album baru.
        </p>
        <Button variant="terminal" size="sm" icon={Plus} onClick={() => setAdding((v) => !v)}>
          {adding ? 'Tutup form' : 'Album baru'}
        </Button>
      </div>

      {adding && (
        <Card title="Buat album baru">
          <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
            <input
              placeholder="Judul album *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            />
            <textarea
              placeholder="Deskripsi *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryAlbum['category'])}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            >
              <option value="Practicum">Practicum</option>
              <option value="Event">Event</option>
              <option value="Exam">Exam</option>
              <option value="Classroom">Classroom</option>
            </select>
            <div
              {...dragDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                dragDrop.isDragging
                  ? 'border-brand-400 bg-brand-900/40'
                  : 'border-brand-800 bg-brand-950/20'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="relative">
                <p className="text-xs text-slate-400 mb-2">
                  {dragDrop.isDragging ? (
                    <span className="text-brand-300 font-bold">Lepaskan untuk tambah foto</span>
                  ) : (
                    'Drag & drop foto atau klik untuk pilih'
                  )}
                </p>
                {files.length > 0 && (
                  <p className="text-[10px] text-brand-300">{files.length} file siap diunggah</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="terminal" size="sm" disabled={uploading}>
              {uploading ? 'Mengunggah...' : 'Simpan album'}
            </Button>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400">
                <th className="p-3">Sampul</th>
                <th className="p-3">Judul</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Foto</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-850">
              {gallery.map((a) => (
                <tr key={a.id} className="hover:bg-brand-900/20">
                  <td className="p-2">
                    <img src={a.coverImage} alt="" className="w-12 h-8 object-cover rounded border border-brand-800" />
                  </td>
                  <td className="p-3 text-white">{a.title}</td>
                  <td className="p-3 text-slate-500">{a.category}</td>
                  <td className="p-3 text-slate-500">{1 + a.photos.length}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingAlbum(a)}
                      className="p-1.5 text-brand-400 hover:text-white rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus album "${a.title}"?`)) deleteGallery(a.id);
                      }}
                      className="p-1.5 text-terminal-red hover:bg-brand-800 rounded ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editingAlbum && (
        <GalleryAlbumEditor
          album={editingAlbum}
          isOpen={!!editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onUpdated={(updated) => {
            syncAlbum(updated);
            setEditingAlbum(gallery.find((g) => g.id === updated.id) ?? updated);
          }}
        />
      )}
    </div>
  );
};
