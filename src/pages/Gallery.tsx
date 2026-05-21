import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { uploadGalleryPhoto } from '../utils/supabaseApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { useToast } from '../context/ToastContext';
import { Image, Search, Plus, Calendar, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export const Gallery: React.FC = () => {
  const { gallery, addGallery, deleteGallery, isAdmin } = useApp();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Practicum' | 'Event' | 'Exam' | 'Classroom'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Admin Add Gallery modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<'Practicum' | 'Event' | 'Exam' | 'Classroom'>('Practicum');
  const [formImage, setFormImage] = useState('/hu-tao-placeholder.png');
  const [formPhotoFile, setFormPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openAddModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory('Practicum');
    setFormImage('/hu-tao-placeholder.png');
    setFormPhotoFile(null);
    setIsAddModalOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormPhotoFile(file);
    setFormImage(URL.createObjectURL(file));
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      toast('Title and description are required metadata', 'warning');
      return;
    }

    setIsUploading(true);
    let imageUrl = formImage;

    try {
      if (formPhotoFile) {
        imageUrl = await uploadGalleryPhoto(formPhotoFile);
      }
      await addGallery({
        title: formTitle,
        category: formCategory,
        description: formDesc,
        image: imageUrl,
      });
      setIsAddModalOpen(false);
      toast(`Media "${formTitle}" added to classroom archive`, 'success');
    } catch (err: any) {
      toast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGallery = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // prevent modal opening
    if (window.confirm(`Are you sure you want to delete media archive "${title}"?`)) {
      deleteGallery(id);
      toast(`Media "${title}" deleted`, 'error');
    }
  };

  // Filters logic
  const filteredGallery = gallery.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' ? true : item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-brand-400" />
              <span>Media Gallery & Activity Archive</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg font-sans">
              Archive records, practicum highlights, events, and classroom achievements for XI TJKT 1.
            </p>
          </div>
          
          {isAdmin && (
            <Button variant="terminal" size="sm" onClick={openAddModal} icon={Plus}>
              Catalog Media
            </Button>
          )}
        </div>
      </Card>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-800 rounded-lg text-xs text-white outline-none focus:border-brand-500 transition-colors placeholder-slate-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          {(['All', 'Practicum', 'Classroom', 'Event', 'Exam'] as const).map(cat => (
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

      {/* Grid Layout */}
      {filteredGallery.length === 0 ? (
        <EmptyState
          title="GALLERY_EMPTY"
          description="No media assets could be cataloged with the active parameters."
          actionText={isAdmin ? "Upload image" : "Reset category"}
          onAction={isAdmin ? openAddModal : () => setActiveCategory('All')}
          icon={Image}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGallery.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer group relative rounded-xl overflow-hidden border border-brand-800 hover:border-brand-500/50 bg-brand-900/20 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image aspect-video configuration (prevents layout shifts) */}
                <div className="relative aspect-video overflow-hidden bg-brand-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category tag Overlay */}
                  <span className="absolute top-3 left-3 bg-brand-950/80 border border-brand-800 backdrop-blur-sm text-[9px] font-mono text-brand-400 px-2 py-0.5 rounded">
                    {item.category.toUpperCase()}
                  </span>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-brand-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">{item.description}</p>
                </div>

                {/* Delete button if admin */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteGallery(e, item.id, item.title)}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-terminal-red/10 border border-terminal-red/20 text-terminal-red hover:bg-terminal-red/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Media File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="lg">
        {selectedItem && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-brand-800 bg-brand-950 relative">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-brand-950/80 border border-brand-800 backdrop-blur-sm text-[9px] font-mono text-brand-400 px-2 py-0.5 rounded">
                {selectedItem.category.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Uploaded: {selectedItem.date}</span>
              </span>
              <h2 className="text-lg font-bold text-white font-display">{selectedItem.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedItem.description}</p>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CATALOG MEDIA MODAL (ADMIN ONLY) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="catalog_media_asset.sh">
        <form onSubmit={handleAddGallery} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">MEDIA_TITLE *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Splicing Fiber Optik"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">DESCRIPTION *</label>
            <textarea
              required
              placeholder="Provide a detailed description of the event or activity captured..."
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs h-20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">CATEGORY</label>
            <select 
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as any)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            >
              <option value="Practicum">PRACTICUM / LABWORK</option>
              <option value="Event">EVENT / COMPETITION</option>
              <option value="Exam">EXAM / UKK</option>
              <option value="Classroom">CLASSROOM LIFE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">IMAGE FILE UPLOADER</label>
            <div className="border border-dashed border-brand-800 rounded-lg p-6 bg-brand-950 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {formImage !== '/hu-tao-placeholder.png' ? (
                <img src={formImage} alt="Preview" className="max-h-24 rounded object-cover" />
              ) : (
                <Image className="w-8 h-8 text-slate-500" />
              )}
              <span className="text-[10px] text-slate-400">Click to choose image (uploads to Supabase gallery-photos)</span>
              <span className="text-[9px] text-slate-600">PNG, JPG, WEBP — max 10 MB</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Catalog Asset'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
