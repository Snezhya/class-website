import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { MotionCard } from '../components/motion/MotionCard';
import { sortByAbsen } from '../utils/attendance';
import { ClipboardList, Users, Award } from 'lucide-react';

export const Absen: React.FC = () => {
  const { members } = useApp();
  const sorted = sortByAbsen(members);
  const council = sorted.filter((m) => m.isCore);
  const roster = sorted.filter((m) => !m.isCore);

  const renderCard = (m: (typeof sorted)[0]) => (
    <MotionCard
      key={m.id}
      className="flex items-center gap-3 p-3 rounded-xl border border-brand-800 bg-brand-900/30"
    >
      <span className="w-10 h-10 shrink-0 rounded-lg bg-brand-800 border border-brand-700 flex items-center justify-center font-mono font-bold text-lg text-brand-300">
        {m.absen}
      </span>
      <img src={m.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-brand-800 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{m.name}</p>
        <p className="text-[10px] font-mono text-slate-500">{m.nis} · {m.role}</p>
      </div>
    </MotionCard>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-400" />
              Daftar Absen Kelas
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              Satu data untuk semua tampilan — perubahan nama atau nomor absen di Admin ikut ke
              Class Council, Roster, dan halaman ini.
            </p>
          </div>
          <Link
            to="/members"
            className="text-xs font-mono text-brand-400 hover:text-brand-300 border border-brand-800 px-3 py-2 rounded-lg self-start"
          >
            → Lihat profil lengkap
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Class Council (${council.length})`} className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-terminal-yellow mb-2">
            <Award className="w-3.5 h-3.5" />
            Pengurus / inti kelas
          </div>
          <div className="space-y-2">
            {council.length === 0 ? (
              <p className="text-xs text-slate-600 font-mono">Belum ada anggota council.</p>
            ) : (
              council.map(renderCard)
            )}
          </div>
        </Card>

        <Card title={`Full Roster (${roster.length})`} className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-2">
            <Users className="w-3.5 h-3.5" />
            Anggota kelas
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {roster.length === 0 ? (
              <p className="text-xs text-slate-600 font-mono">Belum ada anggota roster.</p>
            ) : (
              roster.map(renderCard)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
