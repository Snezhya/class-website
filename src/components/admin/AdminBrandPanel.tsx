import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { uploadBrandLogo } from '../../utils/supabaseApi';
import { BrandLogo } from '../shared/BrandLogo';
import { DEFAULT_BRAND } from '../../constants/brand';
import { type SystemSettings } from '../../data/initialData';
import { ShieldAlert, UserCircle, Globe, type LucideIcon } from 'lucide-react';

type LogoKey = 'logoHeader' | 'logoFavicon' | 'logoAdmin' | 'logoPlaceholder';
type UploadSlot = 'header' | 'favicon' | 'admin' | 'placeholder';

const LOGO_SLOTS: {
  key: LogoKey;
  slot: UploadSlot;
  label: string;
  hint: string;
  fallback: LucideIcon;
}[] = [
  {
    key: 'logoHeader',
    slot: 'header',
    label: 'Logo navbar',
    hint: 'Pojok kiri atas semua halaman',
    fallback: Globe,
  },
  {
    key: 'logoFavicon',
    slot: 'favicon',
    label: 'Favicon',
    hint: 'Ikon tab browser',
    fallback: Globe,
  },
  {
    key: 'logoAdmin',
    slot: 'admin',
    label: 'Logo halaman admin',
    hint: 'Layar login & panel CMS',
    fallback: ShieldAlert,
  },
  {
    key: 'logoPlaceholder',
    slot: 'placeholder',
    label: 'Gambar default',
    hint: 'Fallback foto kosong (anggota / galeri)',
    fallback: UserCircle,
  },
];

export const AdminBrandPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const uploadLogo = async (key: LogoKey, slot: UploadSlot, file: File) => {
    setBusy(key);
    try {
      const url = await uploadBrandLogo(file, slot);
      updateSettings({ [key]: url } as Partial<SystemSettings>);
      toast(`${LOGO_SLOTS.find((s) => s.key === key)?.label} diperbarui`, 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const clearLogo = (key: LogoKey) => {
    const defaults: Record<LogoKey, string> = {
      logoHeader: DEFAULT_BRAND.logoHeader,
      logoFavicon: DEFAULT_BRAND.logoFavicon,
      logoAdmin: DEFAULT_BRAND.logoAdmin,
      logoPlaceholder: DEFAULT_BRAND.logoPlaceholder,
    };
    updateSettings({ [key]: defaults[key] } as Partial<SystemSettings>);
    toast('Dikembalikan ke default', 'info');
  };

  return (
    <div className="space-y-6">
      <Card title="Teks brand (navbar)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">JUDUL UTAMA</label>
            <input
              value={settings.brandTitle}
              onChange={(e) => updateSettings({ brandTitle: e.target.value })}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400">SUBJUDUL</label>
            <input
              value={settings.brandSubtitle}
              onChange={(e) => updateSettings({ brandSubtitle: e.target.value })}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </Card>

      <Card title="Aset logo situs">
        <p className="text-[10px] text-slate-500 font-mono mb-4">
          Unggah PNG/JPG/SVG. Kosongkan untuk pakai ikon bawaan. Perubahan langsung ke seluruh web.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOGO_SLOTS.map(({ key, slot, label, hint, fallback }) => {
            const src = settings[key];
            const Fallback = fallback;
            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-brand-800 bg-brand-950/40 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <BrandLogo src={src || undefined} size={48} fallback={Fallback} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-xs">{label}</p>
                    <p className="text-[10px] text-slate-500">{hint}</p>
                  </div>
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy === key}
                    className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-800 file:text-white"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadLogo(key, slot, f);
                      e.target.value = '';
                    }}
                  />
                </label>
                {src && (
                  <Button variant="ghost" size="sm" type="button" onClick={() => clearLogo(key)}>
                    Reset default
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Pratinjau navbar">
        <div className="flex items-center gap-2.5 p-4 rounded-lg bg-brand-900/60 border border-brand-800">
          <BrandLogo src={settings.logoHeader || undefined} size={32} />
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-white">{settings.brandTitle}</span>
            <span className="text-[10px] text-slate-500 font-mono">{settings.brandSubtitle}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
