import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { sortByAbsen, swapAbsenInList, getNextAbsenNumber } from '../../utils/attendance';
import { Trash2 } from 'lucide-react';

export const AdminAbsenPanel: React.FC = () => {
  const { members, addMember, editMember, deleteMember, reorderAbsen } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [absen, setAbsen] = useState('');
  const [role, setRole] = useState('Anggota');
  const [isCore, setIsCore] = useState(false);
  const [saving, setSaving] = useState(false);

  const sorted = sortByAbsen(members);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nis.trim()) {
      toast('Nama dan NIS wajib diisi', 'warning');
      return;
    }
    const num = absen.trim() ? parseInt(absen, 10) : getNextAbsenNumber(members);
    if (Number.isNaN(num) || num < 1) {
      toast('Nomor absen tidak valid', 'warning');
      return;
    }
    setSaving(true);
    try {
      await addMember({
        name: name.trim(),
        nis: nis.trim(),
        role,
        bio: 'Student at SMKN 1 Boyolali Class XI TJKT 1.',
        skills: ['Networking'],
        socialLinks: {},
        status: 'active',
        image: '/hu-tao-placeholder.png',
        isCore,
        absen: num,
      });
      setName('');
      setNis('');
      setAbsen('');
      toast('Siswa ditambahkan ke daftar absen', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const next = swapAbsenInList(sorted, index, direction);
    await reorderAbsen(next);
  };

  const saveField = async (id: string, field: 'name' | 'absen', value: string) => {
    if (field === 'absen') {
      const num = parseInt(value, 10);
      if (Number.isNaN(num) || num < 1) return;
      await editMember(id, { absen: num });
      toast('Nomor absen disimpan', 'success');
      return;
    }
    await editMember(id, { name: value.trim() });
    toast('Nama disimpan — council & roster ikut update', 'success');
  };

  return (
    <div className="space-y-6">
      <Card title="Tambah siswa + nomor absen">
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
          <input
            placeholder="Nama *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            placeholder="NIS *"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
            required
          />
          <input
            type="number"
            min={1}
            placeholder={`Absen (kosong = ${getNextAbsenNumber(members)})`}
            value={absen}
            onChange={(e) => setAbsen(e.target.value)}
            className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          />
          <input
            placeholder="Peran"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-slate-400 shrink-0">
              <input type="checkbox" checked={isCore} onChange={(e) => setIsCore(e.target.checked)} />
              Council
            </label>
            <Button type="submit" variant="terminal" size="sm" disabled={saving}>
              Tambah
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Atur urutan absen">
        <p className="text-[10px] text-slate-500 font-mono mb-4">
          Ubah nomor atau nama di sini — Class Council & Roster memakai data yang sama.
        </p>
        <div className="overflow-x-auto rounded-xl border border-brand-800">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400">
                <th className="p-3 w-16">Absen</th>
                <th className="p-3">Nama</th>
                <th className="p-3">NIS</th>
                <th className="p-3">Tipe</th>
                <th className="p-3 text-center">Urut</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-850">
              {sorted.map((m, idx) => (
                <tr key={m.id} className="hover:bg-brand-900/20">
                  <td className="p-2">
                    <input
                      type="number"
                      min={1}
                      defaultValue={m.absen}
                      className="w-14 p-1.5 bg-brand-950 border border-brand-800 rounded text-center text-brand-300 font-bold"
                      onBlur={(e) => saveField(m.id, 'absen', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      defaultValue={m.name}
                      className="w-full p-1.5 bg-brand-950 border border-brand-800 rounded text-white"
                      onBlur={(e) => saveField(m.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-slate-500">{m.nis}</td>
                  <td className="p-3">
                    {m.isCore ? (
                      <span className="text-terminal-yellow text-[9px]">COUNCIL</span>
                    ) : (
                      <span className="text-slate-600 text-[9px]">ROSTER</span>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="px-2 py-1 rounded bg-brand-800 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === sorted.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="px-2 py-1 rounded bg-brand-800 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus ${m.name}?`)) deleteMember(m.id);
                      }}
                      className="p-1.5 text-terminal-red hover:bg-brand-800 rounded"
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
    </div>
  );
};
