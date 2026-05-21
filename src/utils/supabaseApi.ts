import { supabase } from '../lib/supabase';
import {
  type Member, type Task, type ScheduleItem, type ClassNote,
  type GalleryAlbum, type GalleryPhoto,
  type SystemSettings, defaultSettings,
} from '../data/initialData';

// ============================================================
// STORAGE (semua foto)
// ============================================================

const uploadImage = async (bucket: string, folder: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
  if (error) {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(
        `Bucket "${bucket}" belum ada. Buka Supabase → SQL Editor → jalankan file supabase/storage.sql`
      );
    }
    if (msg.includes('row-level security') || msg.includes('policy')) {
      throw new Error('Upload ditolak: login Admin dulu (Supabase Auth: admin@tjkt1.com)');
    }
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadMemberPhoto = (file: File) => uploadImage('member-photos', 'photos', file);
export const uploadGalleryPhoto = (file: File) => uploadImage('gallery-photos', 'photos', file);
export const uploadSiteAsset = (file: File) => uploadImage('site-assets', 'backgrounds', file);

// ============================================================
// MEMBER
// ============================================================

export const mapDbToMember = (dbRow: any): Member => ({
  id: dbRow.id.toString(),
  name: dbRow.name || '',
  nis: dbRow.nis || '',
  role: dbRow.role || 'Anggota',
  isCore: dbRow.is_core ?? false,
  bio: dbRow.bio || 'Student at SMKN 1 Boyolali Class XI TJKT 1.',
  skills: Array.isArray(dbRow.skills) ? dbRow.skills : [],
  socialLinks: dbRow.social_links || {},
  status: (dbRow.status as 'active' | 'away' | 'offline') || 'offline',
  image: dbRow.photo || '/hu-tao-placeholder.png',
  order: dbRow.sort_order || 0,
});

export const mapMemberToDb = (member: Omit<Member, 'id'>) => ({
  name: member.name,
  nis: member.nis,
  role: member.role,
  is_core: member.isCore,
  bio: member.bio,
  skills: member.skills,
  social_links: member.socialLinks,
  status: member.status,
  photo: member.image,
  sort_order: member.order,
});

export const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('member')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbToMember);
};

export const addMemberDb = async (member: Omit<Member, 'id'>): Promise<Member> => {
  const { data, error } = await supabase
    .from('member')
    .insert([mapMemberToDb(member)])
    .select()
    .single();
  if (error) throw error;
  return mapDbToMember(data);
};

export const editMemberDb = async (id: string, updatedFields: Partial<Member>): Promise<Member> => {
  const updatePayload: any = {};
  if (updatedFields.name !== undefined) updatePayload.name = updatedFields.name;
  if (updatedFields.nis !== undefined) updatePayload.nis = updatedFields.nis;
  if (updatedFields.role !== undefined) updatePayload.role = updatedFields.role;
  if (updatedFields.isCore !== undefined) updatePayload.is_core = updatedFields.isCore;
  if (updatedFields.bio !== undefined) updatePayload.bio = updatedFields.bio;
  if (updatedFields.skills !== undefined) updatePayload.skills = updatedFields.skills;
  if (updatedFields.socialLinks !== undefined) updatePayload.social_links = updatedFields.socialLinks;
  if (updatedFields.status !== undefined) updatePayload.status = updatedFields.status;
  if (updatedFields.image !== undefined) updatePayload.photo = updatedFields.image;
  if (updatedFields.order !== undefined) updatePayload.sort_order = updatedFields.order;

  const { data, error } = await supabase
    .from('member')
    .update(updatePayload)
    .eq('id', parseInt(id))
    .select()
    .single();
  if (error) throw error;
  return mapDbToMember(data);
};

export const deleteMemberDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from('member').delete().eq('id', parseInt(id));
  if (error) throw error;
};

// ============================================================
// TASK
// ============================================================

export const mapDbToTask = (row: any): Task => ({
  id: row.id.toString(),
  title: row.title || '',
  description: row.description || '',
  priority: (row.priority as 'low' | 'medium' | 'high') || 'medium',
  status: (row.status as 'pending' | 'completed' | 'overdue') || 'pending',
  dueDate: row.due_date || '',
  category: row.category || 'Umum',
});

export const mapTaskToDb = (task: Omit<Task, 'id'>) => ({
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  due_date: task.dueDate || null,
  category: task.category,
});

export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('task')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbToTask);
};

export const addTaskDb = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('task')
    .insert([mapTaskToDb(task)])
    .select()
    .single();
  if (error) throw error;
  return mapDbToTask(data);
};

export const editTaskDb = async (id: string, fields: Partial<Task>): Promise<Task> => {
  const payload: any = {};
  if (fields.title !== undefined) payload.title = fields.title;
  if (fields.description !== undefined) payload.description = fields.description;
  if (fields.priority !== undefined) payload.priority = fields.priority;
  if (fields.status !== undefined) payload.status = fields.status;
  if (fields.dueDate !== undefined) payload.due_date = fields.dueDate || null;
  if (fields.category !== undefined) payload.category = fields.category;

  const { data, error } = await supabase
    .from('task')
    .update(payload)
    .eq('id', parseInt(id))
    .select()
    .single();
  if (error) throw error;
  return mapDbToTask(data);
};

export const deleteTaskDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from('task').delete().eq('id', parseInt(id));
  if (error) throw error;
};

// ============================================================
// SCHEDULE
// ============================================================

export const mapDbToSchedule = (row: any): ScheduleItem => ({
  id: row.id.toString(),
  day: row.day as ScheduleItem['day'],
  time: row.time || '',
  subject: row.subject || '',
  teacher: row.teacher || '',
  room: row.room || '',
  type: (row.type as 'theory' | 'practical' | 'exam') || 'theory',
});

export const mapScheduleToDb = (item: Omit<ScheduleItem, 'id'>) => ({
  day: item.day,
  time: item.time,
  subject: item.subject,
  teacher: item.teacher,
  room: item.room,
  type: item.type,
});

export const fetchSchedules = async (): Promise<ScheduleItem[]> => {
  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const { data, error } = await supabase.from('schedule').select('*');
  if (error) throw error;
  return (data || [])
    .map(mapDbToSchedule)
    .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
};

export const addScheduleDb = async (item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> => {
  const { data, error } = await supabase
    .from('schedule')
    .insert([mapScheduleToDb(item)])
    .select()
    .single();
  if (error) throw error;
  return mapDbToSchedule(data);
};

export const editScheduleDb = async (id: string, fields: Partial<ScheduleItem>): Promise<ScheduleItem> => {
  const payload: any = {};
  if (fields.day !== undefined) payload.day = fields.day;
  if (fields.time !== undefined) payload.time = fields.time;
  if (fields.subject !== undefined) payload.subject = fields.subject;
  if (fields.teacher !== undefined) payload.teacher = fields.teacher;
  if (fields.room !== undefined) payload.room = fields.room;
  if (fields.type !== undefined) payload.type = fields.type;

  const { data, error } = await supabase
    .from('schedule')
    .update(payload)
    .eq('id', parseInt(id))
    .select()
    .single();
  if (error) throw error;
  return mapDbToSchedule(data);
};

export const deleteScheduleDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from('schedule').delete().eq('id', parseInt(id));
  if (error) throw error;
};

// ============================================================
// NOTE / ANNOUNCEMENT
// ============================================================

export const mapDbToNote = (row: any): ClassNote => ({
  id: row.id.toString(),
  title: row.title || '',
  content: row.content || '',
  type: (row.type as 'announcement' | 'note' | 'log') || 'note',
  category: (row.category as 'System' | 'Academic' | 'Class' | 'General') || 'General',
  isPinned: row.is_pinned ?? false,
  date: row.date || new Date().toISOString().split('T')[0],
  author: row.author || '',
});

export const mapNoteToDb = (note: Omit<ClassNote, 'id'>) => ({
  title: note.title,
  content: note.content,
  type: note.type,
  category: note.category,
  is_pinned: note.isPinned,
  date: note.date,
  author: note.author,
});

export const fetchNotes = async (): Promise<ClassNote[]> => {
  const { data, error } = await supabase
    .from('note')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbToNote);
};

export const addNoteDb = async (note: Omit<ClassNote, 'id'>): Promise<ClassNote> => {
  const { data, error } = await supabase
    .from('note')
    .insert([mapNoteToDb(note)])
    .select()
    .single();
  if (error) throw error;
  return mapDbToNote(data);
};

export const editNoteDb = async (id: string, fields: Partial<ClassNote>): Promise<ClassNote> => {
  const payload: any = {};
  if (fields.title !== undefined) payload.title = fields.title;
  if (fields.content !== undefined) payload.content = fields.content;
  if (fields.type !== undefined) payload.type = fields.type;
  if (fields.category !== undefined) payload.category = fields.category;
  if (fields.isPinned !== undefined) payload.is_pinned = fields.isPinned;
  if (fields.date !== undefined) payload.date = fields.date;
  if (fields.author !== undefined) payload.author = fields.author;

  const { data, error } = await supabase
    .from('note')
    .update(payload)
    .eq('id', parseInt(id))
    .select()
    .single();
  if (error) throw error;
  return mapDbToNote(data);
};

export const deleteNoteDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from('note').delete().eq('id', parseInt(id));
  if (error) throw error;
};

// ============================================================
// GALLERY ALBUM (sampul + foto tambahan)
// ============================================================

const mapDbToGalleryPhoto = (row: any): GalleryPhoto => ({
  id: row.id.toString(),
  image: row.image || '/hu-tao-placeholder.png',
  sortOrder: row.sort_order ?? 0,
});

export const mapDbToGalleryAlbum = (row: any): GalleryAlbum => {
  const photos = (row.gallery_photo || [])
    .map(mapDbToGalleryPhoto)
    .sort((a: GalleryPhoto, b: GalleryPhoto) => a.sortOrder - b.sortOrder);
  return {
    id: row.id.toString(),
    title: row.title || '',
    category: row.category || 'Event',
    description: row.description || '',
    coverImage: row.cover_image || '/hu-tao-placeholder.png',
    date: row.date || new Date().toISOString().split('T')[0],
    photos,
  };
};

/** Fallback: tabel lama `gallery` (1 baris = 1 album tanpa foto tambahan) */
const mapLegacyGalleryRow = (row: any): GalleryAlbum => ({
  id: row.id.toString(),
  title: row.title || '',
  category: row.category || 'Event',
  description: row.description || '',
  coverImage: row.image || '/hu-tao-placeholder.png',
  date: row.date || new Date().toISOString().split('T')[0],
  photos: [],
});

const isMissingGalleryAlbumTable = (err: { code?: string; message?: string } | null) =>
  err?.code === 'PGRST205' || (err?.message?.toLowerCase().includes('gallery_album') ?? false);

const galleryAlbumTableMissingError = () =>
  new Error(
    'Tabel gallery_album belum dibuat. Supabase Dashboard → SQL Editor → Run file supabase/gallery-album-migration.sql (tunggu ~10 detik lalu coba lagi).'
  );

export const fetchGalleryAlbums = async (): Promise<GalleryAlbum[]> => {
  const { data, error } = await supabase
    .from('gallery_album')
    .select('*, gallery_photo(*)')
    .order('created_at', { ascending: false });

  if (!error && data) {
    return data.map(mapDbToGalleryAlbum);
  }

  const legacy = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
  if (legacy.error) throw error || legacy.error;
  return (legacy.data || []).map(mapLegacyGalleryRow);
};

export const addGalleryAlbumDb = async (input: {
  title: string;
  description: string;
  category: GalleryAlbum['category'];
  date: string;
  coverImage: string;
  childImageUrls: string[];
}): Promise<GalleryAlbum> => {
  const { data: album, error: albumErr } = await supabase
    .from('gallery_album')
    .insert([{
      title: input.title,
      description: input.description,
      category: input.category,
      cover_image: input.coverImage,
      date: input.date,
    }])
    .select()
    .single();

  if (albumErr) {
    if (isMissingGalleryAlbumTable(albumErr)) {
      if (input.childImageUrls.length > 0) {
        throw galleryAlbumTableMissingError();
      }
      const { data: legacy, error: legacyErr } = await supabase
        .from('gallery')
        .insert([{
          title: input.title,
          description: input.description,
          category: input.category,
          image: input.coverImage,
          date: input.date,
        }])
        .select()
        .single();
      if (legacyErr) throw galleryAlbumTableMissingError();
      return mapLegacyGalleryRow(legacy);
    }
    throw albumErr;
  }

  if (input.childImageUrls.length > 0) {
    const rows = input.childImageUrls.map((url, i) => ({
      album_id: album.id,
      image: url,
      sort_order: i + 1,
    }));
    const { error: photoErr } = await supabase.from('gallery_photo').insert(rows);
    if (photoErr) throw photoErr;
  }

  const { data: full, error: fetchErr } = await supabase
    .from('gallery_album')
    .select('*, gallery_photo(*)')
    .eq('id', album.id)
    .single();
  if (fetchErr) throw fetchErr;
  return mapDbToGalleryAlbum(full);
};

export const deleteGalleryAlbumDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from('gallery_album').delete().eq('id', parseInt(id));
  if (error) {
    const legacy = await supabase.from('gallery').delete().eq('id', parseInt(id));
    if (legacy.error) throw error;
  }
};

export const fetchGalleryAlbumById = async (albumId: string): Promise<GalleryAlbum> => {
  const { data, error } = await supabase
    .from('gallery_album')
    .select('*, gallery_photo(*)')
    .eq('id', parseInt(albumId))
    .single();
  if (error) throw error;
  return mapDbToGalleryAlbum(data);
};

export const updateGalleryAlbumDb = async (
  albumId: string,
  fields: Partial<Pick<GalleryAlbum, 'title' | 'description' | 'category' | 'date' | 'coverImage'>>
): Promise<GalleryAlbum> => {
  const payload: Record<string, unknown> = {};
  if (fields.title !== undefined) payload.title = fields.title;
  if (fields.description !== undefined) payload.description = fields.description;
  if (fields.category !== undefined) payload.category = fields.category;
  if (fields.date !== undefined) payload.date = fields.date;
  if (fields.coverImage !== undefined) payload.cover_image = fields.coverImage;

  const { error } = await supabase.from('gallery_album').update(payload).eq('id', parseInt(albumId));
  if (error) {
    if (isMissingGalleryAlbumTable(error)) {
      const legacy: Record<string, unknown> = {};
      if (fields.title !== undefined) legacy.title = fields.title;
      if (fields.description !== undefined) legacy.description = fields.description;
      if (fields.category !== undefined) legacy.category = fields.category;
      if (fields.date !== undefined) legacy.date = fields.date;
      if (fields.coverImage !== undefined) legacy.image = fields.coverImage;
      const { data, error: legacyErr } = await supabase
        .from('gallery')
        .update(legacy)
        .eq('id', parseInt(albumId))
        .select()
        .single();
      if (legacyErr) throw legacyErr;
      return mapLegacyGalleryRow(data);
    }
    throw error;
  }
  return fetchGalleryAlbumById(albumId);
};

export const addGalleryPhotosDb = async (albumId: string, imageUrls: string[]): Promise<GalleryAlbum> => {
  if (imageUrls.length === 0) return fetchGalleryAlbumById(albumId);

  const album = await fetchGalleryAlbumById(albumId);
  const maxOrder = album.photos.reduce((m, p) => Math.max(m, p.sortOrder), 0);
  const rows = imageUrls.map((url, i) => ({
    album_id: parseInt(albumId),
    image: url,
    sort_order: maxOrder + i + 1,
  }));

  const { error } = await supabase.from('gallery_photo').insert(rows);
  if (error) throw error;
  return fetchGalleryAlbumById(albumId);
};

export const deleteGalleryPhotoDb = async (photoId: string): Promise<void> => {
  const { error } = await supabase.from('gallery_photo').delete().eq('id', parseInt(photoId));
  if (error) throw error;
};

export const setAlbumCoverFromChildDb = async (albumId: string, photoId: string): Promise<GalleryAlbum> => {
  const album = await fetchGalleryAlbumById(albumId);
  const child = album.photos.find((p) => p.id === photoId);
  if (!child) throw new Error('Foto tidak ditemukan');

  const oldCover = album.coverImage;
  await supabase.from('gallery_album').update({ cover_image: child.image }).eq('id', parseInt(albumId));
  await supabase.from('gallery_photo').delete().eq('id', parseInt(photoId));
  await supabase.from('gallery_photo').insert([{
    album_id: parseInt(albumId),
    image: oldCover,
    sort_order: child.sortOrder,
  }]);

  return fetchGalleryAlbumById(albumId);
};

// ============================================================
// APP SETTINGS (theme / admin panel)
// ============================================================

export const mapDbToSettings = (row: any): SystemSettings => ({
  theme: row.theme || defaultSettings.theme,
  accentColor: row.accent_color || defaultSettings.accentColor,
  backgroundType: row.background_type || defaultSettings.backgroundType,
  backgroundImage: row.background_image || defaultSettings.backgroundImage,
  blurIntensity: row.blur_intensity ?? defaultSettings.blurIntensity,
  opacity: row.opacity ?? defaultSettings.opacity,
  glowAmount: row.glow_amount ?? defaultSettings.glowAmount,
  showHero: row.show_hero ?? defaultSettings.showHero,
  showStats: row.show_stats ?? defaultSettings.showStats,
  showSchedulePreview: row.show_schedule_preview ?? defaultSettings.showSchedulePreview,
  showActivityLog: row.show_activity_log ?? defaultSettings.showActivityLog,
  heroTitle: row.hero_title || defaultSettings.heroTitle,
  heroSubtitle: row.hero_subtitle || defaultSettings.heroSubtitle,
});

export const mapSettingsToDb = (s: SystemSettings) => ({
  id: 1,
  theme: s.theme,
  accent_color: s.accentColor,
  background_type: s.backgroundType,
  background_image: s.backgroundImage,
  blur_intensity: s.blurIntensity,
  opacity: s.opacity,
  glow_amount: s.glowAmount,
  show_hero: s.showHero,
  show_stats: s.showStats,
  show_schedule_preview: s.showSchedulePreview,
  show_activity_log: s.showActivityLog,
  hero_title: s.heroTitle,
  hero_subtitle: s.heroSubtitle,
  updated_at: new Date().toISOString(),
});

export const fetchSettings = async (): Promise<SystemSettings> => {
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return mapDbToSettings(data);
};

export const updateSettingsDb = async (settings: SystemSettings): Promise<SystemSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert([mapSettingsToDb(settings)], { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapDbToSettings(data);
};

export const resetSettingsDb = async (): Promise<SystemSettings> => {
  return updateSettingsDb(defaultSettings);
};

// ============================================================
// ACTIVITY LOG
// ============================================================

export const fetchActivityLogs = async (limit = 50): Promise<string[]> => {
  const { data, error } = await supabase
    .from('activity_log')
    .select('message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) => {
    const d = new Date(row.created_at);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toLocaleTimeString('id-ID');
    return row.message.startsWith('[') ? row.message : `[${dateStr} ${timeStr}] ${row.message}`;
  });
};

export const addActivityLogDb = async (message: string): Promise<void> => {
  const { error } = await supabase.from('activity_log').insert([{ message }]);
  if (error) throw error;
};
