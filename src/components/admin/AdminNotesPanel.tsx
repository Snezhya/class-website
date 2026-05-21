import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { type ClassNote } from '../../data/initialData';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const AdminNotesPanel: React.FC = () => {
  const { notes, addNote, editNote, deleteNote } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ClassNote['type']>('announcement');
  const [category, setCategory] = useState<ClassNote['category']>('General');
  const [isPinned, setIsPinned] = useState(false);
  const [author, setAuthor] = useState('Class Administrator');

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setType('announcement');
    setCategory('General');
    setIsPinned(false);
    setAuthor('Class Administrator');
    setModalOpen(true);
  };

  const openEdit = (n: ClassNote) => {
    setEditing(n);
    setTitle(n.title);
    setContent(n.content);
    setType(n.type);
    setCategory(n.category);
    setIsPinned(n.isPinned);
    setAuthor(n.author);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast('Judul, isi, dan penulis wajib', 'warning');
      return;
    }
    const payload = {
      title: title.trim(),
      content: content.trim(),
      type,
      category,
      isPinned: type === 'announcement' ? isPinned : false,
      author: author.trim(),
    };
    if (editing) {
      await editNote(editing.id, payload);
      toast('Catatan diperbarui', 'success');
    } else {
      await addNote(payload);
      toast('Catatan ditambahkan', 'success');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500 font-mono">Pengumuman, catatan, dan log kelas.</p>
        <Button variant="terminal" size="sm" icon={Plus} onClick={openNew}>
          Tambah catatan
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400">
                <th className="p-3">Judul</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Pin</th>
                <th className="p-3">Penulis</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-850">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-brand-900/20">
                  <td className="p-3 text-white max-w-[180px] truncate">{n.title}</td>
                  <td className="p-3 text-slate-400">{n.type}</td>
                  <td className="p-3 text-slate-500">{n.category}</td>
                  <td className="p-3">{n.isPinned ? '✓' : '—'}</td>
                  <td className="p-3 text-slate-500">{n.author}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => openEdit(n)} className="p-1.5 text-brand-400 hover:text-white rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus "${n.title}"?`)) deleteNote(n.id);
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit catatan' : 'Tambah catatan'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <input
            placeholder="Judul *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <textarea
            placeholder="Isi *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClassNote['type'])}
              className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            >
              <option value="announcement">announcement</option>
              <option value="note">note</option>
              <option value="log">log</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClassNote['category'])}
              className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            >
              <option value="System">System</option>
              <option value="Academic">Academic</option>
              <option value="Class">Class</option>
              <option value="General">General</option>
            </select>
          </div>
          <input
            placeholder="Penulis *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          {type === 'announcement' && (
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              Sematkan di dashboard
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="terminal" size="sm">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
