import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type Member, type Task, type ScheduleItem, type ClassNote, type GalleryItem, type SystemSettings,
  initialMembers, initialTasks, initialSchedule, initialNotes, initialGallery, defaultSettings 
} from '../data/initialData';
import { storage } from '../utils/storage';
import { supabase } from '../lib/supabase';
import { fetchMembers, addMemberDb, editMemberDb, deleteMemberDb, mapDbToMember } from '../utils/supabaseApi';

interface AppContextType {
  members: Member[];
  tasks: Task[];
  schedules: ScheduleItem[];
  notes: ClassNote[];
  gallery: GalleryItem[];
  settings: SystemSettings;
  isAdmin: boolean;
  activityLogs: string[];
  dbLoading: boolean;
  dbError: string | null;
  
  // Auth actions
  login: (password: string) => Promise<boolean>;
  logout: () => void;

  // Member CRUD
  addMember: (member: Omit<Member, 'id' | 'order'>) => Promise<void>;
  editMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  reorderMembers: (members: Member[]) => Promise<void>;

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
  const [members, setMembers] = useState<Member[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

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

  // Log action helper
  const addActivityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    const dateStr = new Date().toISOString().split('T')[0];
    const logEntry = `[${dateStr} ${timestamp}] ${message}`;
    setActivityLogs(prev => {
      const updated = [logEntry, ...prev.slice(0, 49)];
      storage.set('activity_logs', updated);
      return updated;
    });
  };

  // 1. Initial Member Fetch and Realtime Listener Setup
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const loadMembers = async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        // Fallback to local storage or initial data
        const local = storage.get('members', initialMembers);
        setMembers(local);
        setDbLoading(false);
        addActivityLog('SYSTEM DAEMON: Supabase credentials not found. Falling back to Local Roster.');
        return;
      }

      setDbLoading(true);
      try {
        const data = await fetchMembers();
        setMembers(data);
        storage.set('members', data); // cache locally
        setDbError(null);
        addActivityLog('MEMBER DAEMON: Fetched roster from Supabase.');
      } catch (err: any) {
        setDbError(err.message);
        addActivityLog(`MEMBER DAEMON: Failed to fetch remote roster - ${err.message}`);
        // Fallback
        const local = storage.get('members', initialMembers);
        setMembers(local);
      } finally {
        setDbLoading(false);
      }
    };

    loadMembers();

    // Setup Realtime websocket listener if configured
    let channel: any = null;
    if (supabaseUrl && supabaseAnonKey) {
      channel = supabase
        .channel('public:member')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'member' }, (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          addActivityLog(`REALTIME DAEMON: Member record changed [${eventType}]`);

          if (eventType === 'INSERT') {
            const addedMember = mapDbToMember(newRow);
            setMembers(prev => {
              if (prev.some(m => m.id === addedMember.id)) return prev;
              const updated = [...prev, addedMember].sort((a, b) => a.order - b.order);
              storage.set('members', updated);
              return updated;
            });
          } else if (eventType === 'UPDATE') {
            const updatedMember = mapDbToMember(newRow);
            setMembers(prev => {
              const updated = prev.map(m => m.id === updatedMember.id ? updatedMember : m).sort((a, b) => a.order - b.order);
              storage.set('members', updated);
              return updated;
            });
          } else if (eventType === 'DELETE') {
            const deletedId = oldRow.id.toString();
            setMembers(prev => {
              const updated = prev.filter(m => m.id !== deletedId);
              storage.set('members', updated);
              return updated;
            });
          }
        })
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 2. Auth Session Check & Auth State Subscription
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAdmin(true);
        storage.set('is_admin_session', true);
        addActivityLog('AUTH DAEMON: Active session found. Admin access granted.');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAdmin(true);
        storage.set('is_admin_session', true);
      } else {
        setIsAdmin(false);
        storage.set('is_admin_session', false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync state variables to storage when local updates occur
  useEffect(() => { storage.set('tasks', tasks); }, [tasks]);
  useEffect(() => { storage.set('schedules', schedules); }, [schedules]);
  useEffect(() => { storage.set('notes', notes); }, [notes]);
  useEffect(() => { storage.set('gallery', gallery); }, [gallery]);
  useEffect(() => { storage.set('settings', settings); }, [settings]);
  useEffect(() => { storage.set('is_admin_session', isAdmin); }, [isAdmin]);

  // Auth Operations
  const login = async (password: string): Promise<boolean> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@tjkt1.com',
          password: password,
        });

        if (error) {
          addActivityLog(`AUTH DAEMON: Supabase Auth error - ${error.message}`);
        } else if (data?.user) {
          setIsAdmin(true);
          storage.set('is_admin_session', true);
          addActivityLog('AUTH DAEMON: Admin user logged in via Supabase Auth.');
          return true;
        }
      } catch (err: any) {
        addActivityLog(`AUTH DAEMON: Supabase Auth subsystem failed - ${err.message}`);
      }
    }

    // Offline / Legacy fallback
    const defaultPasscodes = ['admin123', 'tjkt1'];
    const envPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    const allowedPasscodes = envPasscode ? [...defaultPasscodes, envPasscode] : defaultPasscodes;
    
    if (allowedPasscodes.includes(password)) {
      setIsAdmin(true);
      storage.set('is_admin_session', true);
      addActivityLog('AUTH DAEMON: Admin logged in (offline fallback credentials).');
      return true;
    }

    addActivityLog('AUTH DAEMON: Failed login attempt. Invalid credentials.');
    return false;
  };

  const logout = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await supabase.auth.signOut();
      } catch (err: any) {
        addActivityLog(`AUTH DAEMON: SignOut failed - ${err.message}`);
      }
    }

    setIsAdmin(false);
    storage.set('is_admin_session', false);
    addActivityLog('AUTH DAEMON: Admin logged out. Session destroyed.');
  };

  // Member Operations
  const addMember = async (newMember: Omit<Member, 'id' | 'order'>) => {
    const order = members.length + 1;
    const memberWithOrder = { ...newMember, order };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const added = await addMemberDb(memberWithOrder);
        setMembers(prev => {
          if (prev.some(m => m.id === added.id)) return prev;
          const updated = [...prev, added].sort((a, b) => a.order - b.order);
          storage.set('members', updated);
          return updated;
        });
        addActivityLog(`MEMBER DAEMON: Added student '${added.name}' to Supabase.`);
      } catch (err: any) {
        addActivityLog(`MEMBER DAEMON: Insert error - ${err.message}`);
        throw err;
      }
    } else {
      // Local fallback
      const id = Math.random().toString(36).substring(2, 9);
      const member: Member = { ...memberWithOrder, id };
      setMembers(prev => {
        const updated = [...prev, member];
        storage.set('members', updated);
        return updated;
      });
      addActivityLog(`MEMBER DAEMON: Added student '${member.name}' locally (offline mode).`);
    }
  };

  const editMember = async (id: string, updatedData: Partial<Member>) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const updated = await editMemberDb(id, updatedData);
        setMembers(prev => {
          const updatedList = prev.map(m => m.id === id ? updated : m).sort((a, b) => a.order - b.order);
          storage.set('members', updatedList);
          return updatedList;
        });
        addActivityLog(`MEMBER DAEMON: Updated student '${updated.name}' details on Supabase.`);
      } catch (err: any) {
        addActivityLog(`MEMBER DAEMON: Update error - ${err.message}`);
        throw err;
      }
    } else {
      // Local fallback
      setMembers(prev => {
        const updatedList = prev.map(m => m.id === id ? { ...m, ...updatedData } : m);
        storage.set('members', updatedList);
        return updatedList;
      });
      const member = members.find(m => m.id === id);
      addActivityLog(`MEMBER DAEMON: Updated student '${member?.name || id}' locally (offline mode).`);
    }
  };

  const deleteMember = async (id: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await deleteMemberDb(id);
        setMembers(prev => {
          const updated = prev.filter(m => m.id !== id);
          storage.set('members', updated);
          return updated;
        });
        addActivityLog(`MEMBER DAEMON: Deleted student record (id: ${id}) from Supabase.`);
      } catch (err: any) {
        addActivityLog(`MEMBER DAEMON: Delete error - ${err.message}`);
        throw err;
      }
    } else {
      // Local fallback
      const member = members.find(m => m.id === id);
      setMembers(prev => {
        const updated = prev.filter(m => m.id !== id);
        storage.set('members', updated);
        return updated;
      });
      addActivityLog(`MEMBER DAEMON: Deleted student '${member?.name || id}' locally (offline mode).`);
    }
  };

  const reorderMembers = async (reorderedList: Member[]) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const adjustedList = reorderedList.map((m, idx) => ({ ...m, order: idx + 1 }));
    setMembers(adjustedList);
    storage.set('members', adjustedList);
    addActivityLog('MEMBER DAEMON: Reordered roster indexes.');

    if (supabaseUrl && supabaseAnonKey) {
      try {
        // Sequentially execute updates in background
        for (const m of adjustedList) {
          await editMemberDb(m.id, { order: m.order });
        }
        addActivityLog('MEMBER DAEMON: Pushed roster reordering to remote database.');
      } catch (err: any) {
        addActivityLog(`MEMBER DAEMON: Remote reorder sync warning - ${err.message}`);
      }
    }
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
      dbLoading, dbError,
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

