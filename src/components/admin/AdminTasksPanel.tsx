import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { type Task } from '../../data/initialData';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const AdminTasksPanel: React.FC = () => {
  const { tasks, addTask, editTask, deleteTask } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('pending');
    setDueDate('');
    setCategory('');
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setTitle(t.title);
    setDescription(t.description);
    setPriority(t.priority);
    setStatus(t.status);
    setDueDate(t.dueDate);
    setCategory(t.category);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast('Judul dan tanggal jatuh tempo wajib', 'warning');
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate,
      category: category.trim() || 'General',
    };
    if (editing) {
      await editTask(editing.id, payload);
      toast('Tugas diperbarui', 'success');
    } else {
      await addTask(payload);
      toast('Tugas ditambahkan', 'success');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500 font-mono">Kelola semua tugas kelas dari sini.</p>
        <Button variant="terminal" size="sm" icon={Plus} onClick={openNew}>
          Tambah tugas
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400">
                <th className="p-3">Judul</th>
                <th className="p-3">Prioritas</th>
                <th className="p-3">Status</th>
                <th className="p-3">Jatuh tempo</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-850">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-brand-900/20">
                  <td className="p-3 text-white max-w-[200px] truncate">{t.title}</td>
                  <td className="p-3 text-slate-400">{t.priority}</td>
                  <td className="p-3 text-slate-400">{t.status}</td>
                  <td className="p-3 text-slate-500">{t.dueDate}</td>
                  <td className="p-3 text-slate-500">{t.category}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => openEdit(t)} className="p-1.5 text-brand-400 hover:text-white rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus "${t.title}"?`)) deleteTask(t.id);
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit tugas' : 'Tambah tugas'} size="md">
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <input
            placeholder="Judul *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <textarea
            placeholder="Deskripsi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            >
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="overdue">overdue</option>
            </select>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            placeholder="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          />
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
