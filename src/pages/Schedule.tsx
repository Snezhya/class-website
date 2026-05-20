import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Clock, MapPin, User, Plus, Trash2, Edit
} from 'lucide-react';


export const Schedule: React.FC = () => {
  const { schedules, addSchedule, editSchedule, deleteSchedule, isAdmin } = useApp();
  const { toast } = useToast();

  const [activeDayTab, setActiveDayTab] = useState<'All' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('All');
  
  // Admin Schedule Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formDay, setFormDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin');
  const [formTime, setFormTime] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formType, setFormType] = useState<'theory' | 'practical' | 'exam'>('practical');

  const openAddModal = () => {
    setFormDay('Senin');
    setFormTime('');
    setFormSubject('');
    setFormTeacher('');
    setFormRoom('');
    setFormType('practical');
    setIsAddModalOpen(true);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTime || !formSubject || !formTeacher || !formRoom) {
      toast('All fields are required to allocate schedule slots', 'warning');
      return;
    }
    addSchedule({
      day: formDay,
      time: formTime,
      subject: formSubject,
      teacher: formTeacher,
      room: formRoom,
      type: formType
    });
    setIsAddModalOpen(false);
    toast(`Subject "${formSubject}" registered on ${formDay}`, 'success');
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormDay(item.day);
    setFormTime(item.time);
    setFormSubject(item.subject);
    setFormTeacher(item.teacher);
    setFormRoom(item.room);
    setFormType(item.type);
    setIsEditModalOpen(true);
  };

  const handleEditSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTime || !formSubject || !formTeacher || !formRoom) {
      toast('All fields must be filled', 'warning');
      return;
    }
    editSchedule(editingItem.id, {
      day: formDay,
      time: formTime,
      subject: formSubject,
      teacher: formTeacher,
      room: formRoom,
      type: formType
    });
    setIsEditModalOpen(false);
    toast('Schedule parameters committed', 'success');
  };

  const handleDeleteSchedule = (id: string, subject: string) => {
    if (window.confirm(`Are you sure you want to delete the schedule slot for "${subject}"?`)) {
      deleteSchedule(id);
      toast(`Slot "${subject}" de-allocated`, 'error');
    }
  };

  // Group and Filter Schedule
  const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  
  const filteredSchedules = schedules.filter(s => {
    return activeDayTab === 'All' ? true : s.day === activeDayTab;
  }).sort((a, b) => {
    // Sort by day order, then time
    const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.time.localeCompare(b.time);
  });

  const getTypeStyle = (type: 'theory' | 'practical' | 'exam') => {
    switch (type) {
      case 'exam':
        return 'bg-terminal-red/10 text-terminal-red border-terminal-red/20';
      case 'practical':
        return 'bg-terminal-green/10 text-terminal-green border-terminal-green/20';
      case 'theory':
      default:
        return 'bg-terminal-blue/10 text-terminal-blue border-terminal-blue/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <span>Academic Schedule & Lab Allocations</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg font-sans">
              Schedule grid for networking sessions, Cisco laboratory practicums, and general courses for class XI TJKT 1.
            </p>
          </div>
          
          {isAdmin && (
            <Button variant="terminal" size="sm" onClick={openAddModal} icon={Plus}>
              Allocate Slot
            </Button>
          )}
        </div>
      </Card>

      {/* Weekdays Tab Selector */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-brand-950/60 border border-brand-800 rounded-xl select-none scrollbar-none">
        {(['All', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const).map(day => (
          <button
            key={day}
            onClick={() => setActiveDayTab(day)}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap flex-1 text-center ${
              activeDayTab === day
                ? 'bg-brand-800 border border-brand-700 text-white shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-brand-900/40 border border-transparent'
            }`}
          >
            {day.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Schedule Display */}
      {filteredSchedules.length === 0 ? (
        <EmptyState
          title="SCHEDULE_EMPTY"
          description="No courses or lab sessions found registered for the selected day parameters."
          actionText={isAdmin ? "Allocate new slot" : "Select all days"}
          onAction={isAdmin ? openAddModal : () => setActiveDayTab('All')}
          icon={Calendar}
        />
      ) : (
        <div className="space-y-6">
          {/* Scrollable table container for desktop */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-brand-800 bg-brand-900/10">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400 uppercase select-none">
                  <th className="p-4 font-semibold">Day</th>
                  <th className="p-4 font-semibold">Time</th>
                  <th className="p-4 font-semibold">Course / Subject</th>
                  <th className="p-4 font-semibold">Teacher</th>
                  <th className="p-4 font-semibold">Room / Location</th>
                  <th className="p-4 font-semibold text-center">Type</th>
                  {isAdmin && <th className="p-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-850">
                {filteredSchedules.map(sched => (
                  <tr key={sched.id} className="hover:bg-brand-900/40 transition-colors">
                    <td className="p-4 font-semibold text-white">{sched.day}</td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sched.time}</span>
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold font-sans text-sm">{sched.subject}</td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sched.teacher}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sched.room}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getTypeStyle(sched.type)}`}>
                          {sched.type}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button 
                            onClick={() => openEditModal(sched)}
                            className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-brand-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSchedule(sched.id, sched.subject)}
                            className="p-1.5 text-slate-500 hover:text-terminal-red rounded hover:bg-brand-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile device representation */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredSchedules.map(sched => (
              <Card 
                key={sched.id} 
                className="bg-brand-900/20 border-brand-800 flex flex-col gap-3 relative"
              >
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${getTypeStyle(sched.type)}`}>
                    {sched.type}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-brand-400 uppercase">{sched.day} • {sched.time}</span>
                  <h4 className="text-sm font-bold text-white font-sans">{sched.subject}</h4>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-500 font-sans border-t border-brand-850 pt-2.5 mt-1">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{sched.teacher}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{sched.room}</span>
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2 border-t border-brand-850 pt-2 mt-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(sched)} icon={Edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteSchedule(sched.id, sched.subject)} icon={Trash2}>Delete</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ADD SCHEDULE MODAL (ADMIN ONLY) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="allocate_schedule_slot.sh">
        <form onSubmit={handleAddSchedule} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">WEEKDAY *</label>
              <select 
                value={formDay}
                onChange={e => setFormDay(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="Senin">SENIN</option>
                <option value="Selasa">SELASA</option>
                <option value="Rabu">RABU</option>
                <option value="Kamis">KAMIS</option>
                <option value="Jumat">JUMAT</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-slate-400">COURSE_TYPE</label>
              <select 
                value={formType}
                onChange={e => setFormType(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="practical">PRACTICAL / LAB</option>
                <option value="theory">THEORY / LECTURE</option>
                <option value="exam">EXAM / ASSESSMENT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">TIME_INTERVAL *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 07:00 - 09:30"
              value={formTime}
              onChange={e => setFormTime(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">COURSE_SUBJECT *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Administrasi Sistem Jaringan"
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">TEACHER_INSTRUCTOR *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Pak Joko Purwanto, S.Kom"
              value={formTeacher}
              onChange={e => setFormTeacher(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">ROOM / LABORATORY *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Lab Cisco Lantai 2"
              value={formRoom}
              onChange={e => setFormRoom(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Allocate Slot</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT SCHEDULE MODAL (ADMIN ONLY) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="edit_schedule_slot.sh">
        <form onSubmit={handleEditSchedule} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">WEEKDAY *</label>
              <select 
                value={formDay}
                onChange={e => setFormDay(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="Senin">SENIN</option>
                <option value="Selasa">SELASA</option>
                <option value="Rabu">RABU</option>
                <option value="Kamis">KAMIS</option>
                <option value="Jumat">JUMAT</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-slate-400">COURSE_TYPE</label>
              <select 
                value={formType}
                onChange={e => setFormType(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="practical">PRACTICAL / LAB</option>
                <option value="theory">THEORY / LECTURE</option>
                <option value="exam">EXAM / ASSESSMENT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">TIME_INTERVAL *</label>
            <input 
              type="text" 
              required
              value={formTime}
              onChange={e => setFormTime(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">COURSE_SUBJECT *</label>
            <input 
              type="text" 
              required
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">TEACHER_INSTRUCTOR *</label>
            <input 
              type="text" 
              required
              value={formTeacher}
              onChange={e => setFormTeacher(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">ROOM / LABORATORY *</label>
            <input 
              type="text" 
              required
              value={formRoom}
              onChange={e => setFormRoom(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Commit Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
