import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type Member, type Task, type ScheduleItem, type ClassNote, type GalleryAlbum, type SystemSettings,
  initialMembers, initialTasks, initialSchedule, initialNotes, initialGallery, defaultSettings 
} from '../data/initialData';
import { storage } from '../utils/storage';
import { supabase } from '../lib/supabase';
import {
  fetchMembers, addMemberDb, editMemberDb, deleteMemberDb, mapDbToMember,
  fetchTasks, addTaskDb, editTaskDb, deleteTaskDb, mapDbToTask,
  fetchSchedules, addScheduleDb, editScheduleDb, deleteScheduleDb, mapDbToSchedule,
  fetchNotes, addNoteDb, editNoteDb, deleteNoteDb, mapDbToNote,
  fetchGalleryAlbums, addGalleryAlbumDb, deleteGalleryAlbumDb,
  updateGalleryAlbumDb, addGalleryPhotosDb, deleteGalleryPhotoDb, setAlbumCoverFromChildDb,
  fetchGalleryAlbumById,
  fetchSettings, updateSettingsDb, resetSettingsDb, mapDbToSettings,
  fetchActivityLogs, addActivityLogDb,
} from '../utils/supabaseApi';

interface AppContextType {
  members: Member[];
  tasks: Task[];
  schedules: ScheduleItem[];
  notes: ClassNote[];
  gallery: GalleryAlbum[];
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
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  editTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;

  // Schedule CRUD
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => Promise<void>;
  editSchedule: (id: string, item: Partial<ScheduleItem>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Notes CRUD
  addNote: (note: Omit<ClassNote, 'id' | 'date'>) => Promise<void>;
  editNote: (id: string, note: Partial<ClassNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Gallery album CRUD (sampul + foto tambahan)
  addGalleryAlbum: (input: {
    title: string;
    description: string;
    category: GalleryAlbum['category'];
    coverImage: string;
    childImageUrls: string[];
  }) => Promise<void>;
  deleteGallery: (id: string) => Promise<void>;
  updateGalleryAlbum: (
    albumId: string,
    fields: Partial<Pick<GalleryAlbum, 'title' | 'description' | 'category' | 'date' | 'coverImage'>>
  ) => Promise<GalleryAlbum>;
  addPhotosToGalleryAlbum: (albumId: string, imageUrls: string[]) => Promise<GalleryAlbum>;
  deleteGalleryPhoto: (albumId: string, photoId: string) => Promise<GalleryAlbum>;
  setGalleryCoverFromPhoto: (albumId: string, photoId: string) => Promise<GalleryAlbum>;

  // Settings
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  
  // Custom status banner
  addActivityLog: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize States
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [gallery, setGallery] = useState<GalleryAlbum[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(() => storage.get('settings', defaultSettings));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => storage.get('is_admin_session', false));
  const [activityLogs, setActivityLogs] = useState<string[]>(() => 
    storage.get('activity_logs', [
      `[${new Date().toISOString().split('T')[0]} 08:30:00] SYSTEM DAEMON: Node initialized successfully`,
      `[${new Date().toISOString().split('T')[0]} 08:31:05] SYSTEM DAEMON: LocalStorage persistence module loaded`,
      `[${new Date().toISOString().split('T')[0]} 08:32:12] AUTH DAEMON: Session listener listening on auth_session_init.sh`
    ])
  );

  const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

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
    if (hasSupabase) {
      addActivityLogDb(logEntry).catch(() => {});
    }
  };

  // 1. Fetch ALL entities from Supabase on mount + setup Realtime listeners
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Offline fallback: load everything from localStorage / initial data
      setMembers(storage.get('members', initialMembers));
      setTasks(storage.get('tasks', initialTasks));
      setSchedules(storage.get('schedules', initialSchedule));
      setNotes(storage.get('notes', initialNotes));
      setGallery(storage.get('gallery', initialGallery));
      setDbLoading(false);
      addActivityLog('SYSTEM DAEMON: Supabase credentials not found. Offline mode active.');
      return;
    }

    setDbLoading(true);
    Promise.all([
      fetchMembers().catch((e: any) => { console.warn('member fetch', e); return storage.get('members', initialMembers); }),
      fetchTasks().catch((e: any) => { console.warn('task fetch', e); return storage.get('tasks', initialTasks); }),
      fetchSchedules().catch((e: any) => { console.warn('schedule fetch', e); return storage.get('schedules', initialSchedule); }),
      fetchNotes().catch((e: any) => { console.warn('note fetch', e); return storage.get('notes', initialNotes); }),
      fetchGalleryAlbums().catch((e: any) => { console.warn('gallery fetch', e); return storage.get('gallery', initialGallery); }),
      fetchSettings().catch(() => storage.get('settings', defaultSettings)),
      fetchActivityLogs().catch(() => storage.get('activity_logs', [])),
    ]).then(([mems, tsks, scheds, nts, gals, sets, logs]) => {
      setMembers(mems); storage.set('members', mems);
      setTasks(tsks); storage.set('tasks', tsks);
      setSchedules(scheds); storage.set('schedules', scheds);
      setNotes(nts); storage.set('notes', nts);
      setGallery(gals); storage.set('gallery', gals);
      setSettings(sets); storage.set('settings', sets);
      if (logs.length > 0) {
        setActivityLogs(logs);
        storage.set('activity_logs', logs);
      }
      setDbError(null);
      addActivityLog('SYSTEM DAEMON: All tables loaded from Supabase successfully.');
    }).catch((err: any) => {
      setDbError(err.message);
    }).finally(() => setDbLoading(false));

    // Realtime: member
    const memberChannel = supabase
      .channel('rt:member')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member' }, ({ eventType, new: n, old: o }) => {
        addActivityLog(`REALTIME: member [${eventType}]`);
        if (eventType === 'INSERT') setMembers(p => { const r = mapDbToMember(n); return p.some(x => x.id === r.id) ? p : [...p, r].sort((a,b)=>a.order-b.order); });
        else if (eventType === 'UPDATE') setMembers(p => p.map(x => x.id === n.id?.toString() ? mapDbToMember(n) : x).sort((a,b)=>a.order-b.order));
        else if (eventType === 'DELETE') setMembers(p => p.filter(x => x.id !== o.id?.toString()));
      }).subscribe();

    // Realtime: task
    const taskChannel = supabase
      .channel('rt:task')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task' }, ({ eventType, new: n, old: o }) => {
        addActivityLog(`REALTIME: task [${eventType}]`);
        if (eventType === 'INSERT') setTasks(p => { const r = mapDbToTask(n); return p.some(x => x.id === r.id) ? p : [r, ...p]; });
        else if (eventType === 'UPDATE') setTasks(p => p.map(x => x.id === n.id?.toString() ? mapDbToTask(n) : x));
        else if (eventType === 'DELETE') setTasks(p => p.filter(x => x.id !== o.id?.toString()));
      }).subscribe();

    // Realtime: schedule
    const scheduleChannel = supabase
      .channel('rt:schedule')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, ({ eventType, new: n, old: o }) => {
        addActivityLog(`REALTIME: schedule [${eventType}]`);
        const dayOrder = ['Senin','Selasa','Rabu','Kamis','Jumat'];
        if (eventType === 'INSERT') setSchedules(p => { const r = mapDbToSchedule(n); return p.some(x => x.id === r.id) ? p : [...p, r].sort((a,b)=>dayOrder.indexOf(a.day)-dayOrder.indexOf(b.day)); });
        else if (eventType === 'UPDATE') setSchedules(p => p.map(x => x.id === n.id?.toString() ? mapDbToSchedule(n) : x).sort((a,b)=>dayOrder.indexOf(a.day)-dayOrder.indexOf(b.day)));
        else if (eventType === 'DELETE') setSchedules(p => p.filter(x => x.id !== o.id?.toString()));
      }).subscribe();

    // Realtime: note
    const noteChannel = supabase
      .channel('rt:note')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'note' }, ({ eventType, new: n, old: o }) => {
        addActivityLog(`REALTIME: note [${eventType}]`);
        if (eventType === 'INSERT') setNotes(p => { const r = mapDbToNote(n); return p.some(x => x.id === r.id) ? p : [r, ...p]; });
        else if (eventType === 'UPDATE') setNotes(p => p.map(x => x.id === n.id?.toString() ? mapDbToNote(n) : x));
        else if (eventType === 'DELETE') setNotes(p => p.filter(x => x.id !== o.id?.toString()));
      }).subscribe();

    const refreshGallery = () => {
      fetchGalleryAlbums()
        .then((g) => { setGallery(g); storage.set('gallery', g); })
        .catch(() => {});
    };

    const galleryAlbumChannel = supabase
      .channel('rt:gallery_album')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_album' }, ({ eventType }) => {
        addActivityLog(`REALTIME: gallery_album [${eventType}]`);
        refreshGallery();
      }).subscribe();

    const galleryPhotoChannel = supabase
      .channel('rt:gallery_photo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photo' }, ({ eventType }) => {
        addActivityLog(`REALTIME: gallery_photo [${eventType}]`);
        refreshGallery();
      }).subscribe();

    const settingsChannel = supabase
      .channel('rt:app_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, ({ eventType, new: n }) => {
        if (eventType === 'UPDATE' || eventType === 'INSERT') {
          const s = mapDbToSettings(n);
          setSettings(s);
          storage.set('settings', s);
        }
      }).subscribe();

    const logChannel = supabase
      .channel('rt:activity_log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, ({ new: n }) => {
        const d = new Date(n.created_at);
        const dateStr = d.toISOString().split('T')[0];
        const timeStr = d.toLocaleTimeString('id-ID');
        const entry = n.message?.startsWith('[') ? n.message : `[${dateStr} ${timeStr}] ${n.message}`;
        setActivityLogs(p => {
          if (p[0] === entry) return p;
          const updated = [entry, ...p.slice(0, 49)];
          storage.set('activity_logs', updated);
          return updated;
        });
      }).subscribe();

    return () => {
      supabase.removeChannel(memberChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(noteChannel);
      supabase.removeChannel(galleryAlbumChannel);
      supabase.removeChannel(galleryPhotoChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(logChannel);
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

  // Sync settings & session to localStorage
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
  const addTask = async (newTask: Omit<Task, 'id'>) => {
    if (hasSupabase) {
      try {
        const added = await addTaskDb(newTask);
        setTasks(prev => prev.some(t => t.id === added.id) ? prev : [added, ...prev]);
        addActivityLog(`TASK DAEMON: Created task '${added.title}' [${added.priority}] → Supabase`);
      } catch (err: any) { addActivityLog(`TASK DAEMON: Insert error - ${err.message}`); throw err; }
    } else {
      const task: Task = { ...newTask, id: Math.random().toString(36).substring(2, 9) };
      setTasks(prev => [task, ...prev]);
      addActivityLog(`TASK DAEMON: Created task '${task.title}' locally.`);
    }
  };

  const editTask = async (id: string, updatedData: Partial<Task>) => {
    if (hasSupabase) {
      try {
        const updated = await editTaskDb(id, updatedData);
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        addActivityLog(`TASK DAEMON: Edited task '${updated.title}' → Supabase`);
      } catch (err: any) { addActivityLog(`TASK DAEMON: Update error - ${err.message}`); throw err; }
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
      addActivityLog(`TASK DAEMON: Edited task '${id}' locally.`);
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (hasSupabase) {
      try {
        await deleteTaskDb(id);
        setTasks(prev => prev.filter(t => t.id !== id));
        addActivityLog(`TASK DAEMON: Deleted task '${task?.title || id}' → Supabase`);
      } catch (err: any) { addActivityLog(`TASK DAEMON: Delete error - ${err.message}`); throw err; }
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      addActivityLog(`TASK DAEMON: Deleted task '${task?.title || id}' locally.`);
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    addActivityLog(`TASK DAEMON: Set task '${task.title}' → ${newStatus.toUpperCase()}`);
    await editTask(id, { status: newStatus });
  };

  // Schedule Operations
  const addSchedule = async (newItem: Omit<ScheduleItem, 'id'>) => {
    if (hasSupabase) {
      try {
        const added = await addScheduleDb(newItem);
        const dayOrder = ['Senin','Selasa','Rabu','Kamis','Jumat'];
        setSchedules(prev => prev.some(s => s.id === added.id) ? prev : [...prev, added].sort((a,b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)));
        addActivityLog(`SCHEDULE DAEMON: Added '${added.subject}' on ${added.day} → Supabase`);
      } catch (err: any) { addActivityLog(`SCHEDULE DAEMON: Insert error - ${err.message}`); throw err; }
    } else {
      const item: ScheduleItem = { ...newItem, id: Math.random().toString(36).substring(2, 9) };
      setSchedules(prev => [...prev, item]);
      addActivityLog(`SCHEDULE DAEMON: Added '${item.subject}' locally.`);
    }
  };

  const editSchedule = async (id: string, updatedData: Partial<ScheduleItem>) => {
    if (hasSupabase) {
      try {
        const updated = await editScheduleDb(id, updatedData);
        setSchedules(prev => prev.map(s => s.id === id ? updated : s));
        addActivityLog(`SCHEDULE DAEMON: Updated '${updated.subject}' → Supabase`);
      } catch (err: any) { addActivityLog(`SCHEDULE DAEMON: Update error - ${err.message}`); throw err; }
    } else {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
      addActivityLog(`SCHEDULE DAEMON: Updated schedule '${id}' locally.`);
    }
  };

  const deleteSchedule = async (id: string) => {
    const item = schedules.find(s => s.id === id);
    if (hasSupabase) {
      try {
        await deleteScheduleDb(id);
        setSchedules(prev => prev.filter(s => s.id !== id));
        addActivityLog(`SCHEDULE DAEMON: Deleted '${item?.subject || id}' → Supabase`);
      } catch (err: any) { addActivityLog(`SCHEDULE DAEMON: Delete error - ${err.message}`); throw err; }
    } else {
      setSchedules(prev => prev.filter(s => s.id !== id));
      addActivityLog(`SCHEDULE DAEMON: Deleted schedule '${item?.subject || id}' locally.`);
    }
  };

  // Notes & Announcement Operations
  const addNote = async (newNote: Omit<ClassNote, 'id' | 'date'>) => {
    const date = new Date().toISOString().split('T')[0];
    if (hasSupabase) {
      try {
        const added = await addNoteDb({ ...newNote, date });
        setNotes(prev => prev.some(n => n.id === added.id) ? prev : [added, ...prev]);
        addActivityLog(`NOTE DAEMON: Broadcasted '${added.title}' → Supabase`);
      } catch (err: any) { addActivityLog(`NOTE DAEMON: Insert error - ${err.message}`); throw err; }
    } else {
      const note: ClassNote = { ...newNote, date, id: Math.random().toString(36).substring(2, 9) };
      setNotes(prev => [note, ...prev]);
      addActivityLog(`NOTE DAEMON: Broadcasted '${note.title}' locally.`);
    }
  };

  const editNote = async (id: string, updatedData: Partial<ClassNote>) => {
    if (hasSupabase) {
      try {
        const updated = await editNoteDb(id, updatedData);
        setNotes(prev => prev.map(n => n.id === id ? updated : n));
        addActivityLog(`NOTE DAEMON: Amended '${updated.title}' → Supabase`);
      } catch (err: any) { addActivityLog(`NOTE DAEMON: Update error - ${err.message}`); throw err; }
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
      addActivityLog(`NOTE DAEMON: Amended note '${id}' locally.`);
    }
  };

  const deleteNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (hasSupabase) {
      try {
        await deleteNoteDb(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        addActivityLog(`NOTE DAEMON: Deleted '${note?.title || id}' → Supabase`);
      } catch (err: any) { addActivityLog(`NOTE DAEMON: Delete error - ${err.message}`); throw err; }
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
      addActivityLog(`NOTE DAEMON: Deleted note '${note?.title || id}' locally.`);
    }
  };

  const addGalleryAlbum = async (input: {
    title: string;
    description: string;
    category: GalleryAlbum['category'];
    coverImage: string;
    childImageUrls: string[];
  }) => {
    const date = new Date().toISOString().split('T')[0];
    if (hasSupabase) {
      try {
        const added = await addGalleryAlbumDb({ ...input, date });
        setGallery((prev) => (prev.some((g) => g.id === added.id) ? prev : [added, ...prev]));
        const total = 1 + added.photos.length;
        addActivityLog(`GALLERY DAEMON: Album '${added.title}' (${total} foto) → Supabase`);
      } catch (err: any) { addActivityLog(`GALLERY DAEMON: Insert error - ${err.message}`); throw err; }
    } else {
      const item: GalleryAlbum = {
        id: Math.random().toString(36).substring(2, 9),
        title: input.title,
        description: input.description,
        category: input.category,
        coverImage: input.coverImage,
        date,
        photos: input.childImageUrls.map((url, i) => ({
          id: `p-${i}`,
          image: url,
          sortOrder: i + 1,
        })),
      };
      setGallery((prev) => [item, ...prev]);
      addActivityLog(`GALLERY DAEMON: Album '${item.title}' locally.`);
    }
  };

  const deleteGallery = async (id: string) => {
    const item = gallery.find((g) => g.id === id);
    if (hasSupabase) {
      try {
        await deleteGalleryAlbumDb(id);
        setGallery((prev) => prev.filter((g) => g.id !== id));
        addActivityLog(`GALLERY DAEMON: Erased album '${item?.title || id}' → Supabase`);
      } catch (err: any) { addActivityLog(`GALLERY DAEMON: Delete error - ${err.message}`); throw err; }
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      addActivityLog(`GALLERY DAEMON: Erased album '${item?.title || id}' locally.`);
    }
  };

  const updateGalleryAlbum = async (
    albumId: string,
    fields: Partial<Pick<GalleryAlbum, 'title' | 'description' | 'category' | 'date' | 'coverImage'>>
  ): Promise<GalleryAlbum> => {
    if (hasSupabase) {
      const updated = await updateGalleryAlbumDb(albumId, fields);
      setGallery((prev) => {
        const next = prev.map((g) => (g.id === albumId ? updated : g));
        storage.set('gallery', next);
        return next;
      });
      addActivityLog(`GALLERY DAEMON: Updated album '${updated.title}' metadata`);
      return updated;
    }
    const updated = gallery.find((g) => g.id === albumId)!;
    const merged = { ...updated, ...fields };
    setGallery((prev) => prev.map((g) => (g.id === albumId ? merged : g)));
    return merged;
  };

  const addPhotosToGalleryAlbum = async (albumId: string, imageUrls: string[]): Promise<GalleryAlbum> => {
    if (hasSupabase) {
      const updated = await addGalleryPhotosDb(albumId, imageUrls);
      setGallery((prev) => {
        const next = prev.map((g) => (g.id === albumId ? updated : g));
        storage.set('gallery', next);
        return next;
      });
      addActivityLog(`GALLERY DAEMON: Added ${imageUrls.length} photo(s) to '${updated.title}'`);
      return updated;
    }
    const base = gallery.find((g) => g.id === albumId)!;
    const newPhotos = imageUrls.map((url, i) => ({
      id: `p-${Date.now()}-${i}`,
      image: url,
      sortOrder: base.photos.length + i + 1,
    }));
    const updated = { ...base, photos: [...base.photos, ...newPhotos] };
    setGallery((prev) => prev.map((g) => (g.id === albumId ? updated : g)));
    return updated;
  };

  const deleteGalleryPhoto = async (albumId: string, photoId: string): Promise<GalleryAlbum> => {
    if (hasSupabase) {
      await deleteGalleryPhotoDb(photoId);
      const updated = await fetchGalleryAlbumById(albumId);
      setGallery((prev) => {
        const next = prev.map((g) => (g.id === albumId ? updated : g));
        storage.set('gallery', next);
        return next;
      });
      addActivityLog(`GALLERY DAEMON: Removed child photo from album`);
      return updated;
    }
    const base = gallery.find((g) => g.id === albumId)!;
    const updated = { ...base, photos: base.photos.filter((p) => p.id !== photoId) };
    setGallery((prev) => prev.map((g) => (g.id === albumId ? updated : g)));
    return updated;
  };

  const setGalleryCoverFromPhoto = async (albumId: string, photoId: string): Promise<GalleryAlbum> => {
    if (hasSupabase) {
      const updated = await setAlbumCoverFromChildDb(albumId, photoId);
      setGallery((prev) => {
        const next = prev.map((g) => (g.id === albumId ? updated : g));
        storage.set('gallery', next);
        return next;
      });
      addActivityLog(`GALLERY DAEMON: Swapped cover on '${updated.title}'`);
      return updated;
    }
    const base = gallery.find((g) => g.id === albumId)!;
    const child = base.photos.find((p) => p.id === photoId);
    if (!child) throw new Error('Foto tidak ditemukan');
    const updated: GalleryAlbum = {
      ...base,
      coverImage: child.image,
      photos: [
        ...base.photos.filter((p) => p.id !== photoId),
        { id: `p-old-cover`, image: base.coverImage, sortOrder: child.sortOrder },
      ],
    };
    setGallery((prev) => prev.map((g) => (g.id === albumId ? updated : g)));
    return updated;
  };

  // Settings Panel Actions
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      storage.set('settings', merged);
      if (hasSupabase) {
        updateSettingsDb(merged).catch((err: any) => {
          console.warn('settings update', err);
        });
      }
      return merged;
    });
    addActivityLog('SYSTEM DAEMON: Global environment preferences updated');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    storage.set('settings', defaultSettings);
    if (hasSupabase) {
      resetSettingsDb().catch((err: any) => console.warn('settings reset', err));
    }
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
      addGalleryAlbum, deleteGallery,
      updateGalleryAlbum, addPhotosToGalleryAlbum, deleteGalleryPhoto, setGalleryCoverFromPhoto,
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

