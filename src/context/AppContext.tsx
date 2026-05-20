import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type Member, type Task, type ScheduleItem, type ClassNote, type GalleryItem, type SystemSettings,
  initialMembers, initialTasks, initialSchedule, initialNotes, initialGallery, defaultSettings 
} from '../data/initialData';
import { storage } from '../utils/storage';

interface AppContextType {
  members: Member[];
  tasks: Task[];
  schedules: ScheduleItem[];
  notes: ClassNote[];
  gallery: GalleryItem[];
  settings: SystemSettings;
  isAdmin: boolean;
  activityLogs: string[];
  
  // Auth actions
  login: (password: string) => boolean;
  logout: () => void;

  // Member CRUD
  addMember: (member: Omit<Member, 'id' | 'order'>) => void;
  editMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  reorderMembers: (members: Member[]) => void;

  // Task CRUD
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;

  // Schedule CRUD
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => void;
  editSchedule: (id: string, item: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;

  // Notes CRUD
  addNote: (note: Omit<ClassNote, 'id' | 'date'>) => void;
  editNote: (id: string, note: Partial<ClassNote>) => void;
  deleteNote: (id: string) => void;

  // Gallery CRUD
  addGallery: (item: Omit<GalleryItem, 'id' | 'date'>) => void;
  editGallery: (id: string, item: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  
  // Custom status banner
  addActivityLog: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize States from storage or default
  const [members, setMembers] = useState<Member[]>(() => storage.get('members', initialMembers));
  const [tasks, setTasks] = useState<Task[]>(() => storage.get('tasks', initialTasks));
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => storage.get('schedules', initialSchedule));
  const [notes, setNotes] = useState<ClassNote[]>(() => storage.get('notes', initialNotes));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => storage.get('gallery', initialGallery));
  const [settings, setSettings] = useState<SystemSettings>(() => storage.get('settings', defaultSettings));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => storage.get('is_admin_session', false));
  const [activityLogs, setActivityLogs] = useState<string[]>(() => 
    storage.get('activity_logs', [
      `[${new Date().toISOString().split('T')[0]} 08:30:00] SYSTEM DAEMON: Node initialized successfully`,
      `[${new Date().toISOString().split('T')[0]} 08:31:05] SYSTEM DAEMON: LocalStorage persistence module loaded`,
      `[${new Date().toISOString().split('T')[0]} 08:32:12] AUTH DAEMON: Session listener listening on auth_session_init.sh`
    ])
  );

  // Sync to storage when state changes
  useEffect(() => { storage.set('members', members); }, [members]);
  useEffect(() => { storage.set('tasks', tasks); }, [tasks]);
  useEffect(() => { storage.set('schedules', schedules); }, [schedules]);
  useEffect(() => { storage.set('notes', notes); }, [notes]);
  useEffect(() => { storage.set('gallery', gallery); }, [gallery]);
  useEffect(() => { storage.set('settings', settings); }, [settings]);
  useEffect(() => { storage.set('is_admin_session', isAdmin); }, [isAdmin]);
  useEffect(() => { storage.set('activity_logs', activityLogs); }, [activityLogs]);

  // Log action helper
  const addActivityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    const dateStr = new Date().toISOString().split('T')[0];
    const logEntry = `[${dateStr} ${timestamp}] ${message}`;
    setActivityLogs(prev => [logEntry, ...prev.slice(0, 49)]); // keep last 50 logs
  };

  // Auth Operations
  const login = (password: string): boolean => {
    const defaultPasscodes = ['admin123', 'tjkt1'];
    const envPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    const allowedPasscodes = envPasscode ? [...defaultPasscodes, envPasscode] : defaultPasscodes;
    
    if (allowedPasscodes.includes(password)) {
      setIsAdmin(true);
      addActivityLog('AUTH DAEMON: Admin user logged in. Auth token generated.');
      return true;
    }
    addActivityLog('AUTH DAEMON: Failed login attempt. Invalid credentials.');
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    addActivityLog('AUTH DAEMON: Admin logged out. Session destroyed.');
  };

  // Member Operations
  const addMember = (newMember: Omit<Member, 'id' | 'order'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const order = members.length + 1;
    const member: Member = { ...newMember, id, order };
    setMembers(prev => [...prev, member]);
    addActivityLog(`MEMBER DAEMON: Added new student '${member.name}'`);
  };

  const editMember = (id: string, updatedData: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    const member = members.find(m => m.id === id);
    addActivityLog(`MEMBER DAEMON: Updated student data for '${member?.name || id}'`);
  };

  const deleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    addActivityLog(`MEMBER DAEMON: Deleted student registry for '${member?.name || id}'`);
  };

  const reorderMembers = (reorderedList: Member[]) => {
    const adjustedList = reorderedList.map((m, idx) => ({ ...m, order: idx + 1 }));
    setMembers(adjustedList);
    addActivityLog('MEMBER DAEMON: Re-indexed student roster ordering');
  };

  // Task Operations
  const addTask = (newTask: Omit<Task, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const task: Task = { ...newTask, id };
    setTasks(prev => [...prev, task]);
    addActivityLog(`TASK DAEMON: Created task '${task.title}' with priority [${task.priority}]`);
  };

  const editTask = (id: string, updatedData: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    const task = tasks.find(t => t.id === id);
    addActivityLog(`TASK DAEMON: Edited task data '${task?.title || id}'`);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addActivityLog(`TASK DAEMON: Terminated task '${task?.title || id}'`);
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        addActivityLog(`TASK DAEMON: Set task '${t.title}' status to ${newStatus.toUpperCase()}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // Schedule Operations
  const addSchedule = (newItem: Omit<ScheduleItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ScheduleItem = { ...newItem, id };
    setSchedules(prev => [...prev, item]);
    addActivityLog(`SCHEDULE DAEMON: Appended subject '${item.subject}' on ${item.day}`);
  };

  const editSchedule = (id: string, updatedData: Partial<ScheduleItem>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    const item = schedules.find(s => s.id === id);
    addActivityLog(`SCHEDULE DAEMON: Adjusted schedule details for '${item?.subject || id}'`);
  };

  const deleteSchedule = (id: string) => {
    const item = schedules.find(s => s.id === id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    addActivityLog(`SCHEDULE DAEMON: Excised schedule slot for '${item?.subject || id}'`);
  };

  // Notes & Announcement Operations
  const addNote = (newNote: Omit<ClassNote, 'id' | 'date'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split('T')[0];
    const note: ClassNote = { ...newNote, id, date };
    setNotes(prev => [note, ...prev]);
    addActivityLog(`NOTE DAEMON: Broadcasted new ${note.type} '${note.title}'`);
  };

  const editNote = (id: string, updatedData: Partial<ClassNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
    const note = notes.find(n => n.id === id);
    addActivityLog(`NOTE DAEMON: Amended note/announcement '${note?.title || id}'`);
  };

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    addActivityLog(`NOTE DAEMON: Deleted announcement '${note?.title || id}'`);
  };

  // Gallery Operations
  const addGallery = (newItem: Omit<GalleryItem, 'id' | 'date'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split('T')[0];
    const item: GalleryItem = { ...newItem, id, date };
    setGallery(prev => [item, ...prev]);
    addActivityLog(`GALLERY DAEMON: Cataloged media asset '${item.title}'`);
  };

  const editGallery = (id: string, updatedData: Partial<GalleryItem>) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updatedData } : g));
    const item = gallery.find(g => g.id === id);
    addActivityLog(`GALLERY DAEMON: Updated metadata for '${item?.title || id}'`);
  };

  const deleteGallery = (id: string) => {
    const item = gallery.find(g => g.id === id);
    setGallery(prev => prev.filter(g => g.id !== id));
    addActivityLog(`GALLERY DAEMON: Erased media item '${item?.title || id}'`);
  };

  // Settings Panel Actions
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addActivityLog('SYSTEM DAEMON: Global environment preferences updated');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    addActivityLog('SYSTEM DAEMON: Reverted configurations to default parameters');
  };

  return (
    <AppContext.Provider value={{
      members, tasks, schedules, notes, gallery, settings, isAdmin, activityLogs,
      login, logout,
      addMember, editMember, deleteMember, reorderMembers,
      addTask, editTask, deleteTask, toggleTaskCompleted,
      addSchedule, editSchedule, deleteSchedule,
      addNote, editNote, deleteNote,
      addGallery, editGallery, deleteGallery,
      updateSettings, resetSettings, addActivityLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
