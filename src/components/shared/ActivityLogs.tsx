import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Terminal, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../utils/storage';

export const ActivityLogs: React.FC = () => {
  const { activityLogs, addActivityLog } = useApp();
  const { toast } = useToast();

  const handleClearLogs = () => {
    storage.remove('activity_logs');
    addActivityLog('SYSTEM: Activity logs cleared by admin.');
    toast('Terminal log buffers flushed', 'info');
  };

  return (
    <Card variant="terminal" terminalTitle="class_portal_event_watcher.log" className="h-full">
      <div className="flex justify-between items-center mb-3 text-slate-500 font-mono text-[10px] select-none border-b border-brand-850 pb-2">
        <span className="flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-terminal-green animate-pulse" />
          <span>LISTENING ON PORT 8080 (SESSION ACTIVE)</span>
        </span>
        <button 
          onClick={handleClearLogs}
          className="hover:text-terminal-red hover:underline transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>FLUSH_BUFFER</span>
        </button>
      </div>
      
      <div className="h-60 overflow-y-auto space-y-1.5 font-mono text-xs text-terminal-green/90 scrollbar-thin scrollbar-thumb-brand-800 pr-1">
        {activityLogs.length === 0 ? (
          <div className="text-slate-500 italic select-none">No active log entries found. Buffer empty.</div>
        ) : (
          activityLogs.map((log, idx) => (
            <div key={idx} className="hover:bg-brand-900/60 p-1 rounded transition-colors break-all">
              <span className="text-slate-600 select-none mr-2">{(activityLogs.length - idx).toString().padStart(3, '0')}</span>
              <span>{log}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
