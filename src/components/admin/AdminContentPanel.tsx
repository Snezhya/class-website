import React, { useState } from 'react';
import { AdminTasksPanel } from './AdminTasksPanel';
import { AdminSchedulePanel } from './AdminSchedulePanel';
import { AdminNotesPanel } from './AdminNotesPanel';
import { AdminGalleryPanel } from './AdminGalleryPanel';

type ContentTab = 'tasks' | 'schedule' | 'notes' | 'gallery';

const tabs: { id: ContentTab; label: string }[] = [
  { id: 'tasks', label: 'Tugas' },
  { id: 'schedule', label: 'Jadwal' },
  { id: 'notes', label: 'Catatan' },
  { id: 'gallery', label: 'Galeri' },
];

export const AdminContentPanel: React.FC = () => {
  const [tab, setTab] = useState<ContentTab>('tasks');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
              tab === t.id
                ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                : 'border-brand-800 text-slate-500 hover:text-white hover:border-brand-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tasks' && <AdminTasksPanel />}
      {tab === 'schedule' && <AdminSchedulePanel />}
      {tab === 'notes' && <AdminNotesPanel />}
      {tab === 'gallery' && <AdminGalleryPanel />}
    </div>
  );
};
