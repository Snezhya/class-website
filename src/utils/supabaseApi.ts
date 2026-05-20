import { supabase } from '../lib/supabase';
import { type Member } from '../data/initialData';

// Map database row to UI Member structure
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
  order: dbRow.sort_order || 0
});

// Map UI Member structure to database row
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
  sort_order: member.order
});

// Fetch all members
export const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('member')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }
  return (data || []).map(mapDbToMember);
};

// Add new member to database
export const addMemberDb = async (member: Omit<Member, 'id'>): Promise<Member> => {
  const dbData = mapMemberToDb(member);
  const { data, error } = await supabase
    .from('member')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return mapDbToMember(data);
};

// Update member in database
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

  if (error) {
    throw error;
  }
  return mapDbToMember(data);
};

// Delete member from database
export const deleteMemberDb = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('member')
    .delete()
    .eq('id', parseInt(id));

  if (error) {
    throw error;
  }
};

// Upload photo to Supabase storage
export const uploadMemberPhoto = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
