import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { uploadMemberPhoto, uploadSiteAsset } from '../utils/supabaseApi';
import { AdminBrandPanel } from '../components/admin/AdminBrandPanel';
import { AdminAbsenPanel } from '../components/admin/AdminAbsenPanel';
import { AdminMemberEditor } from '../components/admin/AdminMemberEditor';
import { AdminContentPanel } from '../components/admin/AdminContentPanel';
import { TerminalOutput } from '../components/motion/TerminalOutput';
import { useAnimeShake } from '../hooks/useAnimeMicro';
import { BrandLogo } from '../components/shared/BrandLogo';
import { 
  ShieldAlert, Lock, Eye, EyeOff, Trash2, RefreshCw, Pencil
} from 'lucide-react';
import { type Member } from '../data/initialData';


export const Admin: React.FC = () => {
  const { 
    isAdmin, login, logout, settings, updateSettings, resetSettings,
    members, addMember, deleteMember, reorderMembers
  } = useApp();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();

  // Login Form State
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginLogs, setLoginLogs] = useState<string[]>(['[SYSTEM] Authentication node waiting at auth_session_init.sh']);
  const [loginShake, setLoginShake] = useState(0);
  const loginTerminalRef = useRef<HTMLDivElement>(null);
  useAnimeShake(loginTerminalRef, loginShake);

  // Admin Workspace State
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'brand' | 'customization' | 'members' | 'absen' | 'content'
  >('overview');
  
  // Member Form State for Admin Quick Add
  const [memName, setMemName] = useState('');
  const [memNis, setMemNis] = useState('');
  const [memRole, setMemRole] = useState('Anggota');
  const [memBio, setMemBio] = useState('');
  const [memSkills, setMemSkills] = useState('');
  const [memIsCore, setMemIsCore] = useState(false);
  const [memStatus, setMemStatus] = useState<'active' | 'away' | 'offline'>('active');
  const [memPhotoFile, setMemPhotoFile] = useState<File | null>(null);
  const [memPhotoPreview, setMemPhotoPreview] = useState<string>('');
  const [isSavingMember, setIsSavingMember] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    setIsAuthenticating(true);
    setLoginLogs(prev => [...prev, `$ execute auth_session_init.sh --pass=******`]);

    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const success = await login(passwordInput);
      if (success) {
        setLoginLogs(prev => [...prev, `[SUCCESS] Token generated. Access granted to root.`, `[SYSTEM] Mount user environment...`]);
        toast('Welcome back, System Admin', 'success');
      } else {
        setLoginLogs(prev => [...prev, `[ERROR] Invalid credentials or password. Denied.`, `[WARN] Log recorded at secure_audit.log`]);
        setLoginShake((n) => n + 1);
        toast('Authentication failed', 'error');
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      setLoginLogs(prev => [...prev, `[FATAL] Auth failure - ${err.message}`]);
      toast('Authentication failed: server error', 'error');
      setIsAuthenticating(false);
    }
    setPasswordInput('');
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMemPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Setup initial auth states if already logged in
  useEffect(() => {
    if (isAdmin) {
      setIsAuthenticating(false);
    }
  }, [isAdmin]);

  const handleAddMemberAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memNis.trim()) {
      toast('Student Name and NIS are required', 'warning');
      return;
    }

    setIsSavingMember(true);
    let imageUrl = settings.logoPlaceholder;

    try {
      if (memPhotoFile) {
        imageUrl = await uploadMemberPhoto(memPhotoFile);
      }

      await addMember({
        name: memName,
        nis: memNis,
        role: memRole,
        bio: memBio || 'Student at SMKN 1 Boyolali Class XI TJKT 1.',
        skills: memSkills ? memSkills.split(',').map(s => s.trim()) : ['Networking'],
        socialLinks: {},
        status: memStatus,
        image: imageUrl,
        isCore: memIsCore
      });
      
      // Reset Form
      setMemName('');
      setMemNis('');
      setMemRole('Anggota');
      setMemBio('');
      setMemSkills('');
      setMemIsCore(false);
      setMemStatus('active');
      setMemPhotoFile(null);
      setMemPhotoPreview('');
      toast('Student registry appended to class roster', 'success');
    } catch (err: any) {
      toast(`Failed to register student: ${err.message}`, 'error');
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleMoveMember = (idx: number, direction: 'up' | 'down') => {
    const listCopy = [...members];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= listCopy.length) return;
    
    const temp = listCopy[idx];
    listCopy[idx] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;
    
    reorderMembers(listCopy);
    toast('Member hierarchy index updated', 'info');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto">
            <BrandLogo
              src={settings.logoAdmin || undefined}
              size={48}
              fallback={Lock}
              className="!border-terminal-red/30"
            />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access</h2>
          <p className="text-xs text-slate-500 font-sans">
            Enter validation passcode to initialize write session. Public users have read-only access.
          </p>
        </div>

        {/* Terminal Login Frame */}
        <Card variant="terminal" terminalTitle="auth_session_init.sh">
          <div className="space-y-4">
            {/* Terminal logs */}
            <div
              ref={loginTerminalRef}
              className="text-[11px] text-terminal-green/80 h-32 overflow-y-auto bg-terminal-dark/60 p-3 rounded-lg border border-brand-850"
            >
              <TerminalOutput lines={loginLogs} active charDelayMs={8} />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">tjkt1-secure-passcode:</label>
                <div className="relative">
                  <input
                    type="password"
                    disabled={isAuthenticating}
                    placeholder="Enter admin passcode..."
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-brand-950 border border-brand-800 rounded-lg text-xs text-terminal-green outline-none focus:border-brand-500 font-mono"
                  />
                  <div className="absolute right-3 top-3 text-[10px] text-slate-600">
                    SECURE_INPUT
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[9px] text-slate-550">SYSTEM_NODE: ENCRYPTED_SESSION</span>
                <Button 
                  variant="terminal" 
                  type="submit" 
                  disabled={isAuthenticating || !passwordInput}
                >
                  {isAuthenticating ? 'VALIDATING...' : 'ESTABLISH_SESSION'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrandLogo
                src={settings.logoAdmin || undefined}
                size={24}
                fallback={ShieldAlert}
                className="!border-terminal-red/30"
              />
              <span>Administrative Operations Terminal (CMS)</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg font-sans">
              System root console for cataloging class members, allocating lessons schedules, altering page variables, and theme controls.
            </p>
          </div>

          <Button variant="danger" size="sm" onClick={logout}>
            De-authenticate Session
          </Button>
        </div>
      </Card>

      {/* Tabs Control */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-brand-950/60 border border-brand-800 rounded-xl select-none">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'overview'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          TELEMETRY & VISIBILITY
        </button>
        <button
          onClick={() => setActiveAdminTab('brand')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'brand'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          BRAND & LOGOS
        </button>
        <button
          onClick={() => setActiveAdminTab('customization')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'customization'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          THEME & CANVAS
        </button>
        <button
          onClick={() => setActiveAdminTab('members')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'members'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          MANAGE ROSTER LIST
        </button>
        <button
          onClick={() => setActiveAdminTab('absen')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'absen'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          DAFTAR ABSEN
        </button>
        <button
          onClick={() => setActiveAdminTab('content')}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all flex-1 text-center whitespace-nowrap ${
            activeAdminTab === 'content'
              ? 'bg-brand-800 border border-brand-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
          }`}
        >
          KONTEN SITUS
        </button>
      </div>

      {/* Admin Tabs Content */}
      <div className="space-y-6">
        
        {/* Tab 1: Telemetry & Section Visibility */}
        {activeAdminTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Visibility Settings Panel */}
            <Card title="Page Section Toggles">
              <div className="space-y-4 font-mono text-xs">
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-950/20 border border-brand-800">
                  <span className="flex flex-col">
                    <span className="text-white font-semibold">Hero Landing Header</span>
                    <span className="text-[10px] text-slate-500">Show welcome terminal box</span>
                  </span>
                  <button
                    onClick={() => updateSettings({ showHero: !settings.showHero })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.showHero 
                        ? 'border-terminal-green/30 bg-terminal-green/10 text-terminal-green' 
                        : 'border-brand-800 bg-brand-950 text-slate-500'
                    }`}
                  >
                    {settings.showHero ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-950/20 border border-brand-800">
                  <span className="flex flex-col">
                    <span className="text-white font-semibold">Class Counters & Metrics</span>
                    <span className="text-[10px] text-slate-500">Enable dashboard status widgets</span>
                  </span>
                  <button
                    onClick={() => updateSettings({ showStats: !settings.showStats })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.showStats 
                        ? 'border-terminal-green/30 bg-terminal-green/10 text-terminal-green' 
                        : 'border-brand-800 bg-brand-950 text-slate-500'
                    }`}
                  >
                    {settings.showStats ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-950/20 border border-brand-800">
                  <span className="flex flex-col">
                    <span className="text-white font-semibold">Schedule Preview Box</span>
                    <span className="text-[10px] text-slate-500">Display current day schedules on homepage</span>
                  </span>
                  <button
                    onClick={() => updateSettings({ showSchedulePreview: !settings.showSchedulePreview })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.showSchedulePreview 
                        ? 'border-terminal-green/30 bg-terminal-green/10 text-terminal-green' 
                        : 'border-brand-800 bg-brand-950 text-slate-500'
                    }`}
                  >
                    {settings.showSchedulePreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-950/20 border border-brand-800">
                  <span className="flex flex-col">
                    <span className="text-white font-semibold">Activity Logs Panel</span>
                    <span className="text-[10px] text-slate-500">Allow users to inspect secure logs</span>
                  </span>
                  <button
                    onClick={() => updateSettings({ showActivityLog: !settings.showActivityLog })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.showActivityLog 
                        ? 'border-terminal-green/30 bg-terminal-green/10 text-terminal-green' 
                        : 'border-brand-800 bg-brand-950 text-slate-500'
                    }`}
                  >
                    {settings.showActivityLog ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-950/20 border border-brand-800">
                  <span className="flex flex-col">
                    <span className="text-white font-semibold">Animasi Daftar Absen</span>
                    <span className="text-[10px] text-slate-500">Marquee foto + nomor absen di dashboard</span>
                  </span>
                  <button
                    onClick={() => updateSettings({ showAttendancePreview: !settings.showAttendancePreview })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.showAttendancePreview
                        ? 'border-terminal-green/30 bg-terminal-green/10 text-terminal-green'
                        : 'border-brand-800 bg-brand-950 text-slate-500'
                    }`}
                  >
                    {settings.showAttendancePreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            </Card>

            {/* Homepage Content Adjuster */}
            <Card title="Homepage Text Nodes">
              <form onSubmit={(e) => { e.preventDefault(); toast('Homepage text definitions updated', 'success'); }} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">HERO_TITLE</label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={e => updateSettings({ heroTitle: e.target.value })}
                    className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">HERO_SUBTITLE</label>
                  <textarea
                    value={settings.heroSubtitle}
                    onChange={e => updateSettings({ heroSubtitle: e.target.value })}
                    className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 h-20"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="terminal" size="sm" type="submit">COMMIT_TEXT_NODES</Button>
                </div>
              </form>
            </Card>

          </div>
        )}

        {activeAdminTab === 'brand' && <AdminBrandPanel />}

        {activeAdminTab === 'absen' && <AdminAbsenPanel />}

        {activeAdminTab === 'content' && <AdminContentPanel />}

        {/* Tab: Customization & Background controls */}
        {activeAdminTab === 'customization' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* THEME PICKER */}
            <Card title="Global Theme Preset">
              <div className="space-y-3 font-mono text-xs">
                <p className="text-[10px] text-slate-500">
                  Pilih tema tampilan. Perubahan langsung terlihat oleh semua pengguna via Supabase Realtime.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    {
                      key: 'glass-blur',
                      label: 'Glass Blur',
                      desc: 'Frosted heavy blur',
                      preview: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(99,179,237,0.05) 100%)',
                      border: 'rgba(255,255,255,0.15)',
                      badge: '✨',
                    },
                    {
                      key: 'glass',
                      label: 'Glass',
                      desc: 'Subtle glassmorphism',
                      preview: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(59,130,246,0.04) 100%)',
                      border: 'rgba(255,255,255,0.10)',
                      badge: '🪟',
                    },
                    {
                      key: 'dark-navy',
                      label: 'Dark Navy',
                      desc: 'Default dark theme',
                      preview: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 100%)',
                      border: 'rgba(30,41,59,0.8)',
                      badge: '🌊',
                    },
                    {
                      key: 'dark-slate',
                      label: 'Dark Slate',
                      desc: 'Slightly warmer dark',
                      preview: 'linear-gradient(135deg, #0f1623 0%, #1a2236 100%)',
                      border: 'rgba(36,49,72,0.8)',
                      badge: '🔷',
                    },
                    {
                      key: 'pure-black',
                      label: 'Pure Black',
                      desc: 'AMOLED ink black',
                      preview: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
                      border: 'rgba(17,17,17,0.9)',
                      badge: '⬛',
                    },
                    {
                      key: 'light',
                      label: 'Light',
                      desc: 'Clean bright mode',
                      preview: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      border: 'rgba(203,213,225,0.8)',
                      badge: '☀️',
                    },
                  ] as const).map((t) => {
                    const isActive = settings.theme === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          updateSettings({ theme: t.key });
                          toast(`Theme changed to ${t.label}`, 'success');
                        }}
                        className={`relative group p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                          isActive
                            ? 'border-brand-400 shadow-lg shadow-brand-500/20 scale-[1.02]'
                            : 'border-brand-800/60 hover:border-brand-600 hover:scale-[1.01]'
                        }`}
                        style={{ background: t.preview }}
                      >
                        {/* Active badge */}
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 text-[8px] font-bold text-brand-300 bg-brand-950/80 px-1.5 py-0.5 rounded border border-brand-600">
                            ACTIVE
                          </span>
                        )}
                        <span className="text-base">{t.badge}</span>
                        <p className={`text-[11px] font-bold mt-1 ${t.key === 'light' ? 'text-slate-800' : 'text-white'}`}>
                          {t.label}
                        </p>
                        <p className={`text-[9px] mt-0.5 ${t.key === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Color themes and backgrounds */}
            <Card title="Canvas Customization Panel">
              <div className="space-y-6 font-mono text-xs">
                
                {settings.backgroundType === 'image' && (
                  <div className="space-y-2">
                    <label className="text-slate-400">BACKGROUND_IMAGE_UPLOAD</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-800 file:text-white"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadSiteAsset(file);
                          updateSettings({ backgroundType: 'image', backgroundImage: url });
                          toast('Background image uploaded to site-assets', 'success');
                        } catch (err: any) {
                          toast(`Upload failed: ${err.message}`, 'error');
                        }
                      }}
                    />
                  </div>
                )}

                {/* Background Type */}
                <div className="space-y-2">
                  <label className="text-slate-400">BACKGROUND_MATRICES</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Dot Matrix', type: 'dot' },
                      { name: 'Grid Grid', type: 'grid' },
                      { name: 'Glow Gradient', type: 'gradient' },
                      { name: 'Placeholder Image', type: 'image' }
                    ].map(bg => (
                      <button
                        key={bg.type}
                        onClick={() => { updateSettings({ backgroundType: bg.type as any }); toast(`Background set to ${bg.name}`, 'info'); }}
                        className={`p-3 rounded-lg border text-center font-semibold transition-all ${
                          settings.backgroundType === bg.type
                            ? 'bg-brand-800 border-brand-500 text-white shadow-inner'
                            : 'bg-brand-950/40 border-brand-800 text-slate-400 hover:text-white hover:bg-brand-900/40'
                        }`}
                      >
                        {bg.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Pickers */}
                <div className="space-y-2">
                  <label className="text-slate-400">SYSTEM_ACCENT_THEME</label>
                  <div className="flex gap-2">
                    {[
                      { hex: '#3b82f6', name: 'Blue' },
                      { hex: '#10b981', name: 'Green' },
                      { hex: '#f59e0b', name: 'Yellow' },
                      { hex: '#ef4444', name: 'Red' },
                      { hex: '#8b5cf6', name: 'Purple' },
                      { hex: '#06b6d4', name: 'Cyan' }
                    ].map(color => (
                      <button
                        key={color.hex}
                        onClick={() => { updateSettings({ accentColor: color.hex as any }); toast(`System accent color modified to ${color.name}`, 'success'); }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                          settings.accentColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-brand-800/80">
                  <Button variant="secondary" size="sm" onClick={resetSettings} icon={RefreshCw}>
                    Revert Defaults
                  </Button>
                </div>
              </div>
            </Card>

            {/* Slider Adjustments */}
            <Card title="Glow & Filter Attributes">
              <div className="space-y-4 font-mono text-xs">
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-400">BACKDROP_OPACITY</label>
                    <span className="text-white">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.opacity}
                    onChange={e => updateSettings({ opacity: parseInt(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-400">BLUR_INTENSITY</label>
                    <span className="text-white">{settings.blurIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.blurIntensity}
                    onChange={e => updateSettings({ blurIntensity: parseInt(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-400">RADIAL_GLOW_AMOUNT</label>
                    <span className="text-white">{settings.glowAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.glowAmount}
                    onChange={e => updateSettings({ glowAmount: parseInt(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>

              </div>
            </Card>

          </div>
        )}

        {/* Tab 3: Member Management & Reordering */}
        {activeAdminTab === 'members' && (
          <div className="space-y-6">
            
            {/* Quick add member form */}
            <Card title="Register New Student">
              <form onSubmit={handleAddMemberAdmin} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">STUDENT_NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aji Prasetyo"
                      value={memName}
                      onChange={e => setMemName(e.target.value)}
                      className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">STUDENT_NIS *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23.01.2104"
                      value={memNis}
                      onChange={e => setMemNis(e.target.value)}
                      className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">CLASS_ROLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Anggota, Sekretaris"
                      value={memRole}
                      onChange={e => setMemRole(e.target.value)}
                      className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">STATUS_ACTIVE</label>
                    <select
                      value={memStatus}
                      onChange={e => setMemStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
                    >
                      <option value="active">ACTIVE</option>
                      <option value="away">AWAY / BUSY</option>
                      <option value="offline">OFFLINE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">VALIDATED_SKILLS (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, Docker, CCNA"
                      value={memSkills}
                      onChange={e => setMemSkills(e.target.value)}
                      className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">STUDENT_PHOTO_UPLOAD</label>
                  <div className="flex items-center gap-4 p-3 bg-brand-950/60 border border-brand-850 rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-brand-700 file:bg-brand-800 file:text-white file:cursor-pointer hover:file:bg-brand-750 text-slate-400"
                    />
                    {memPhotoPreview && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">PREVIEW:</span>
                        <img
                          src={memPhotoPreview}
                          alt="Roster preview"
                          className="w-8 h-8 rounded object-cover border border-brand-750"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">STUDENT_BIO</label>
                  <textarea
                    placeholder="Brief developer profile / description..."
                    value={memBio}
                    onChange={e => setMemBio(e.target.value)}
                    className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 h-16"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      id="isCore"
                      checked={memIsCore}
                      onChange={e => setMemIsCore(e.target.checked)}
                      className="w-4 h-4 bg-brand-950 border border-brand-800 rounded focus:ring-0 text-brand-500"
                    />
                    <label htmlFor="isCore" className="text-slate-400 cursor-pointer">FEATURE_IN_CORE_OFFICERS</label>
                  </div>

                  <Button variant="terminal" size="sm" type="submit" disabled={isSavingMember}>
                    {isSavingMember ? 'SAVING_MEMBERS...' : 'APPEND_STUDENT'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Member roster index table & reordering controls */}
            <Card title="Hierarchy & Roster Ordering Controls">
              <div className="overflow-x-auto rounded-xl border border-brand-800 bg-brand-950/20">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-950/70 border-b border-brand-800 text-slate-400 uppercase select-none">
                      <th className="p-4">Index</th>
                      <th className="p-4">Absen</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">NIS</th>
                      <th className="p-4">Role Designation</th>
                      <th className="p-4 text-center">Core</th>
                      <th className="p-4 text-center">Order Controls</th>
                      <th className="p-4 text-center">Edit</th>
                      <th className="p-4 text-right">Registry Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-850">
                    {members.sort((a, b) => a.order - b.order).map((mem, idx) => (
                      <tr key={mem.id} className="hover:bg-brand-900/20 transition-colors">
                        <td className="p-4 font-bold text-slate-500">{mem.order}</td>
                        <td className="p-4 font-mono font-bold text-brand-400">{mem.absen}</td>
                        <td className="p-4 text-white font-sans font-medium">{mem.name}</td>
                        <td className="p-4 text-slate-450">{mem.nis}</td>
                        <td className="p-4 text-brand-400">{mem.role}</td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {mem.isCore ? (
                              <span className="text-[9px] font-bold text-terminal-yellow bg-terminal-yellow/10 border border-terminal-yellow/20 px-2 py-0.5 rounded-full">CORE</span>
                            ) : (
                              <span className="text-[9px] text-slate-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveMember(idx, 'up')}
                              className="px-2 py-1 rounded bg-brand-800 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-brand-700 font-bold"
                            >
                              ↑
                            </button>
                            <button
                              disabled={idx === members.length - 1}
                              onClick={() => handleMoveMember(idx, 'down')}
                              className="px-2 py-1 rounded bg-brand-800 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-brand-700 font-bold"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => setEditingMember(mem)}
                              className="p-1.5 text-brand-400 hover:text-white rounded hover:bg-brand-800 transition-colors"
                              title="Edit semua data siswa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Terminate registry for "${mem.name}"?`)) {
                                deleteMember(mem.id);
                                toast(`Registry terminated for ${mem.name}`, 'error');
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-terminal-red rounded hover:bg-brand-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

      </div>

      <AdminMemberEditor
        member={editingMember}
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
      />
    </div>
  );
};
