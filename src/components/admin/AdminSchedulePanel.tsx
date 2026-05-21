import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { type ScheduleItem } from '../../data/initialData';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const DAYS: ScheduleItem['day'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export const AdminSchedulePanel: React.FC = () => {
  const { schedules, addSchedule, editSchedule, deleteSchedule } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [day, setDay] = useState<ScheduleItem['day']>('Senin');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<ScheduleItem['type']>('practical');

  const openNew = () => {
    setEditing(null);
    setDay('Senin');
    setTime('');
    setSubject('');
    setTeacher('');
    setRoom('');
    setType('practical');
    setModalOpen(true);
  };

  const openEdit = (s: ScheduleItem) => {
    setEditing(s);
    setDay(s.day);
    setTime(s.time);
    setSubject(s.subject);
    setTeacher(s.teacher);
    setRoom(s.room);
    setType(s.type);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time.trim() || !subject.trim() || !teacher.trim() || !room.trim()) {
      toast('Semua field jadwal wajib diisi', 'warning');
      return;
    }
    const payload = { day, time: time.trim(), subject: subject.trim(), teacher: teacher.trim(), room: room.trim(), type };
    if (editing) {
      await editSchedule(editing.id, payload);
      toast('Jadwal diperbarui', 'success');
    } else {
      await addSchedule(payload);
      toast('Jadwal ditambahkan', 'success');
    }
    setModalOpen(false);
  };

  const sorted = [...schedules].sort(
    (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500 font-mono">Kelola jadwal pelajaran harian.</p>
        <Button variant="terminal" size="sm" icon={Plus} onClick={openNew}>
          Tambah slot
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400">
                <th className="p-3">Hari</th>
                <th className="p-3">Jam</th>
                <th className="p-3">Mapel</th>
                <th className="p-3">Guru</th>
                <th className="p-3">Ruang</th>
                <th className="p-3">Tipe</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-850">
              {sorted.map((s) => (
                <tr key={s.id} className="hover:bg-brand-900/20">
                  <td className="p-3 text-brand-400">{s.day}</td>
                  <td className="p-3 text-white">{s.time}</td>
                  <td className="p-3 text-white">{s.subject}</td>
                  <td className="p-3 text-slate-400">{s.teacher}</td>
                  <td className="p-3 text-slate-500">{s.room}</td>
                  <td className="p-3 text-slate-500">{s.type}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => openEdit(s)} className="p-1.5 text-brand-400 hover:text-white rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus jadwal ${s.subject}?`)) deleteSchedule(s.id);
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit jadwal' : 'Tambah jadwal'} size="md">
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as ScheduleItem['day'])}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            placeholder="Jam (07:00 - 08:30) *"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            placeholder="Mata pelajaran *"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            placeholder="Guru *"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            placeholder="Ruang *"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ScheduleItem['type'])}
            className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          >
            <option value="theory">theory</option>
            <option value="practical">practical</option>
            <option value="exam">exam</option>
          </select>
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
