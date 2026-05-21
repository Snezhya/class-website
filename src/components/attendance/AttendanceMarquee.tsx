import React from 'react';
import { useApp } from '../../context/AppContext';
import { sortByAbsen } from '../../utils/attendance';

export const AttendanceMarquee: React.FC = () => {
  const { members } = useApp();
  const list = sortByAbsen(members);
  const items = list.length > 0 ? [...list, ...list] : [];

  if (list.length === 0) return null;

  return (
    <div className="relative h-[300px] overflow-hidden rounded-xl border border-brand-800 bg-brand-950/50">
      <div className="absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-brand-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-brand-950 to-transparent z-10 pointer-events-none" />

      <div className="attendance-scroll-track flex flex-col gap-3 px-4 py-3">
        {items.map((m, i) => (
          <div key={`${m.id}-${i}`} className="flex items-center gap-3 shrink-0">
            <span className="w-9 h-9 shrink-0 rounded-lg bg-brand-500 border-2 border-brand-950 text-sm font-mono font-bold text-white flex items-center justify-center">
              {m.absen || '—'}
            </span>
            <img
              src={m.image}
              alt={m.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-700 shadow-lg shrink-0"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{m.name}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{m.role}</p>
            </div>
            {m.isCore && (
              <span className="text-[8px] font-mono text-terminal-yellow bg-terminal-yellow/10 border border-terminal-yellow/20 px-1.5 py-0.5 rounded shrink-0">
                COUNCIL
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
