import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { uploadMemberPhoto } from '../../utils/supabaseApi';
import { type Member } from '../../data/initialData';

interface AdminMemberEditorProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMemberEditor: React.FC<AdminMemberEditorProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { editMember, settings } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [role, setRole] = useState('');
  const [absen, setAbsen] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [isCore, setIsCore] = useState(false);
  const [status, setStatus] = useState<Member['status']>('active');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!member) return;
    setName(member.name);
    setNis(member.nis);
    setRole(member.role);
    setAbsen(String(member.absen || ''));
    setBio(member.bio);
    setSkills(member.skills.join(', '));
    setIsCore(member.isCore);
    setStatus(member.status);
    setGithub(member.socialLinks.github ?? '');
    setInstagram(member.socialLinks.instagram ?? '');
    setLinkedin(member.socialLinks.linkedin ?? '');
    setPhotoFile(null);
    setPhotoPreview(member.image);
  }, [member]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    if (!name.trim() || !nis.trim()) {
      toast('Nama dan NIS wajib diisi', 'warning');
      return;
    }
    const absenNum = parseInt(absen, 10);
    if (Number.isNaN(absenNum) || absenNum < 1) {
      toast('Nomor absen tidak valid', 'warning');
      return;
    }

    setSaving(true);
    try {
      let image = member.image;
      if (photoFile) {
        image = await uploadMemberPhoto(photoFile);
      }

      await editMember(member.id, {
        name: name.trim(),
        nis: nis.trim(),
        role: role.trim() || 'Anggota',
        absen: absenNum,
        bio: bio.trim() || 'Student at SMKN 1 Boyolali Class XI TJKT 1.',
        skills: skills
          ? skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        isCore,
        status,
        image,
        socialLinks: {
          ...(github.trim() ? { github: github.trim() } : {}),
          ...(instagram.trim() ? { instagram: instagram.trim() } : {}),
          ...(linkedin.trim() ? { linkedin: linkedin.trim() } : {}),
        },
      });
      toast('Data siswa disimpan', 'success');
      onClose();
    } catch (err: any) {
      toast(err.message ?? 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen && !!member}
      onClose={onClose}
      title={member ? `edit_member.sh — ${member.name}` : ''}
      size="lg"
    >
      {member && (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">NAMA *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">NIS *</label>
              <input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">PERAN / JABATAN</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">NOMOR ABSEN *</label>
              <input
                type="number"
                min={1}
                value={absen}
                onChange={(e) => setAbsen(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Member['status'])}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              >
                <option value="active">ACTIVE</option>
                <option value="away">AWAY</option>
                <option value="offline">OFFLINE</option>
              </select>
            </div>
            <div className="space-y-1 flex items-end">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={isCore}
                  onChange={(e) => setIsCore(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-700"
                />
                Class Council (Core)
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">BIO</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">SKILLS (pisahkan koma)</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, Docker, CCNA"
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">GITHUB URL</label>
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">INSTAGRAM URL</label>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">LINKEDIN URL</label>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">FOTO PROFIL</label>
            <div className="flex items-center gap-4 p-3 bg-brand-950/60 border border-brand-850 rounded-lg">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs text-slate-400" />
              <img
                src={photoPreview || settings.logoPlaceholder}
                alt=""
                className="w-14 h-14 rounded-lg object-cover border border-brand-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-800">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="terminal" size="sm" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan perubahan'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
