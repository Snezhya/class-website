import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/shared/EmptyState';
import { Search, User, Terminal, Award, ListOrdered, Download, CheckCircle } from 'lucide-react';
import { type Member } from '../data/initialData';
import { formatAbsen, sortByAbsen } from '../utils/attendance';
import { TerminalOutput } from '../components/motion/TerminalOutput';
import { MotionCard } from '../components/motion/MotionCard';
import { FadeIn } from '../components/motion/FadeIn';
import { StaggerReveal, StaggerItem } from '../components/motion/StaggerReveal';
import { ProfileCardPNG } from '../components/shared/ProfileCardPNG';
import html2canvas from 'html2canvas';

const Github = (props: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Linkedin = (props: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export const Members: React.FC = () => {
  const { members, dbLoading } = useApp();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'core' | 'member'>('all');
  const [viewByAbsen, setViewByAbsen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inspectLines, setInspectLines] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // URL search parameter check
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search');
    if (searchVal) {
      setSearchQuery(searchVal);
    }
    const viewVal = params.get('view');
    if (viewVal === 'absen') {
      setViewByAbsen(true);
    } else if (viewVal === 'profile') {
      setViewByAbsen(false);
    }
  }, [location]);

  // Filters logic
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.nis.includes(searchQuery) ||
                          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRole === 'all' || 
                        (selectedRole === 'core' && m.isCore) || 
                        (selectedRole === 'member' && !m.isCore);

    return matchesSearch && matchesRole;
  });

  const sortByOrder = (arr: Member[]) => [...arr].sort((a, b) => a.order - b.order);

  const absenList = viewByAbsen ? sortByAbsen(filteredMembers) : [];
  const coreTeam = viewByAbsen ? [] : sortByOrder(filteredMembers.filter(m => m.isCore));
  const regularRoster = viewByAbsen ? [] : sortByOrder(filteredMembers.filter(m => !m.isCore));

  const getStatusColor = (status: 'active' | 'away' | 'offline') => {
    switch (status) {
      case 'active':
        return 'bg-terminal-green';
      case 'away':
        return 'bg-terminal-yellow';
      case 'offline':
      default:
        return 'bg-terminal-gray';
    }
  };

  // Inspect terminal emulator simulation
  const buildInspectLines = (member: Member) => [
      `$ bash ./profile_inspect.sh --target="${member.name.replace(/\s+/g, '_')}"`,
      `[INFO] Locating registry NIS: ${member.nis}... Found.`,
      `[INFO] Querying system directory for: '${member.role}'...`,
      `--------------------------------------------------`,
      `NAME        : ${member.name}`,
      ...(viewByAbsen ? [`ABSEN       : ${formatAbsen(member)}`] : []),
      `NIS         : ${member.nis}`,
      `HIERARCHY   : ${member.isCore ? 'CORE_CLASS_COUNCIL' : 'GENERAL_ROSTER'}`,
      `DESIGNATION : ${member.role}`,
      `STATUS      : ${member.status.toUpperCase()}`,
      `BIO         : "${member.bio}"`,
      `SKILLS      : [${member.skills.join(', ')}]`,
      `--------------------------------------------------`,
      `[SUCCESS] Shell profile printed successfully. System daemon waiting...`,
  ];

  const handleInspectMember = (member: Member) => {
    setSelectedMember(member);
    setInspectLines(buildInspectLines(member));
  };

  const handleDownloadInspect = async (member: Member) => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      // Wait a tick so the hidden card is fully painted
      await new Promise(r => setTimeout(r, 120));
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `profile_${member.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented View Tab Toggle — Merged Members & Absen page layout */}
      <FadeIn className="w-full">
        <div className="flex p-1 bg-brand-950/60 border border-brand-800 rounded-xl select-none max-w-md mx-auto">
          <button
            onClick={() => setViewByAbsen(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-medium transition-all duration-300 font-mono ${
              !viewByAbsen
                ? 'bg-brand-800 border border-brand-700 text-white shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
            }`}
          >
            <User className="w-4 h-4" />
            PROFIL SISWA
          </button>
          <button
            onClick={() => setViewByAbsen(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-medium transition-all duration-300 font-mono ${
              viewByAbsen
                ? 'bg-brand-800 border border-brand-700 text-white shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            DAFTAR ABSEN
          </button>
        </div>
      </FadeIn>

      {/* Search and Filters Header */}
      <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={viewByAbsen ? "Cari nomor absen, nama, NIS..." : "Search students, NIS, skills..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-800 rounded-lg text-xs text-white outline-none focus:border-brand-500 transition-colors placeholder-slate-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button 
            variant={selectedRole === 'all' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setSelectedRole('all')}
          >
            All Students
          </Button>
          <Button 
            variant={selectedRole === 'core' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setSelectedRole('core')}
            icon={Award}
          >
            Core Team
          </Button>
          <Button 
            variant={selectedRole === 'member' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setSelectedRole('member')}
            icon={User}
          >
            Full Roster
          </Button>
        </div>
      </FadeIn>

      <div className="space-y-12">
        {dbLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-dashed border-brand-800 rounded-xl bg-brand-950/20 font-mono text-xs text-terminal-green">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-ping" />
              <span>CONNECTING TO CLOUD DATABASE DAEMON...</span>
            </div>
            <span className="text-[10px] text-slate-500">Querying public.member registry table</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState 
            title="NO_RECORDS_FOUND" 
            description="No student registry matches the query in this sector. Verify NIS or syntax parameter."
            actionText="Clear search query"
            onAction={() => { setSearchQuery(''); setSelectedRole('all'); }}
          />
        ) : viewByAbsen ? (
          <Card title="Daftar urut nomor absen" className="max-w-2xl mx-auto">
            <StaggerReveal className="space-y-2" inView={false}>
              {absenList.map((member) => (
                <MotionCard
                    key={member.id}
                    stagger
                    onClick={() => handleInspectMember(member)}
                    className="flex items-center gap-4 p-3 rounded-xl border border-brand-800 bg-brand-900/30 hover:border-brand-600/50 cursor-pointer"
                  >
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-brand-500 border-2 border-brand-950 text-lg font-mono font-bold text-white flex items-center justify-center">
                    {formatAbsen(member)}
                  </span>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-12 h-12 rounded-lg object-cover border border-brand-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{member.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono block">{member.nis}</span>
                    <span className="text-[10px] font-mono text-brand-400">{member.role}</span>
                  </div>
                  {member.isCore && (
                    <span className="text-[9px] font-mono text-terminal-yellow bg-terminal-yellow/10 border border-terminal-yellow/20 px-2 py-0.5 rounded shrink-0">
                      COUNCIL
                    </span>
                  )}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(member.status)}`} />
                  </MotionCard>
              ))}
            </StaggerReveal>
          </Card>
        ) : (
          <>
            {/* 1. Core Class Council (featured) */}
            {coreTeam.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-800 pb-2">
                  <Award className="w-5 h-5 text-brand-400" />
                  <h2 className="text-xl font-bold text-white">Class Council (Core Officers)</h2>
                </div>
                
                <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" inView={false}>
                  {coreTeam.map(member => (
                    <StaggerItem key={member.id}>
                    <Card
                      motion
                      onClick={() => handleInspectMember(member)}
                      className="border-brand-700/60 bg-gradient-to-br from-brand-800/40 via-brand-800/20 to-brand-900/60 hover:border-brand-500/50 hover:shadow-brand-500/5 relative group"
                    >
                      {/* Featured Border Accent */}
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-500" />
                      
                      {/* Active Status Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-[9px] font-mono text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)}`} />
                        <span>{member.status.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-16 h-16 rounded-xl object-cover border border-brand-700 select-none bg-brand-950"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white truncate">{member.name}</h3>
                          <span className="text-[11px] text-slate-500 font-mono block">{member.nis}</span>
                          <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-700 text-brand-300 font-semibold border border-brand-600/30">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-brand-800/80">
                        {member.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[9px] font-mono text-slate-400 bg-brand-950/60 border border-brand-850 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-[9px] font-mono text-brand-400 px-1">+{member.skills.length - 3}</span>
                        )}
                      </div>
                    </Card>
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </div>
            )}

            {/* 2. General Class Roster */}
            {regularRoster.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-800 pb-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <h2 className="text-xl font-bold text-white">Full Roster</h2>
                </div>

                <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" inView={false}>
                  {regularRoster.map(member => (
                    <StaggerItem key={member.id}>
                    <Card
                      motion
                      onClick={() => handleInspectMember(member)}
                      className="bg-brand-900/30 border-brand-800/80 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-11 h-11 rounded-lg object-cover border border-brand-800 select-none bg-brand-950 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{member.name}</h3>
                            <span className="text-[9px] text-slate-500 font-mono block">{member.nis}</span>
                            <span className="inline-block text-[9px] font-mono text-brand-400 uppercase mt-0.5">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-800/40">
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)}`} />
                          <span>{member.status.toUpperCase()}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{member.skills[0] || 'No tech stack'}</span>
                      </div>
                    </Card>
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden card for PNG capture */}
      {selectedMember && <ProfileCardPNG member={selectedMember} cardRef={cardRef} />}

      {/* 3. Detailed Profile Inspector Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => {
          setSelectedMember(null);
          setInspectLines([]);
        }}
        title={selectedMember ? `profile_inspect.sh --target=${selectedMember.name.split(' ')[0]}` : ''}
        size="lg"
      >
        {selectedMember && (
          <div key={selectedMember.id} className="space-y-5">

            {/* ── Terminal Output Block ── */}
            <div className="bg-[#060d18] border border-brand-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-800 bg-brand-950/80 select-none">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-terminal-green/80" />
                  </div>
                  <span className="text-slate-500 flex items-center gap-1.5 ml-2">
                    <Terminal className="w-3 h-3 text-terminal-green" />
                    <span>inspect_client_output</span>
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
              </div>
              <div className="p-4 text-terminal-green/90 overflow-x-auto min-h-[10rem]">
                <TerminalOutput
                  key={selectedMember.id}
                  lines={inspectLines}
                  active
                  instant
                  showCursor={false}
                />
              </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-brand-800 bg-brand-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Hierarchy</p>
                <p className="mt-1.5 text-sm font-bold text-white font-mono">{selectedMember.isCore ? 'CORE_CLASS_COUNCIL' : 'GENERAL_ROSTER'}</p>
              </div>
              <div className="rounded-xl border border-brand-800 bg-brand-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Current Status</p>
                <p className="mt-1.5 text-sm font-bold text-white font-mono">{selectedMember.status.toUpperCase()}</p>
              </div>
              <div className="rounded-xl border border-brand-800 bg-brand-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Skill Set</p>
                <p className="mt-1.5 text-sm font-bold text-white">{selectedMember.skills.length} validated techs</p>
              </div>
            </div>

            {/* ── Profile Card Preview (downloadable) ── */}
            <div className="rounded-2xl border border-brand-700/60 bg-gradient-to-br from-brand-900/80 to-brand-950/90 overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-800/70">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-brand-500" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-mono">Profile Card Preview</span>
                </div>
                <button
                  onClick={() => handleDownloadInspect(selectedMember)}
                  disabled={downloading}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                    downloaded
                      ? 'bg-terminal-green/20 border border-terminal-green/40 text-terminal-green'
                      : downloading
                      ? 'bg-brand-800/50 border border-brand-700 text-slate-500 cursor-wait'
                      : 'bg-brand-700/60 border border-brand-600 text-white hover:bg-brand-600/70 hover:border-brand-500 active:scale-95'
                  }`}
                >
                  {downloaded ? (
                    <><CheckCircle className="w-3.5 h-3.5" />Downloaded!</>
                  ) : downloading ? (
                    <><span className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin" />Rendering...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" />Download PNG</>
                  )}
                </button>
              </div>

              {/* Bio + Avatar section */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start p-5">
                <div className="relative shrink-0">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-[88px] h-[88px] rounded-2xl object-cover border-2 border-brand-700 bg-brand-950"
                  />
                  <span className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-brand-900 ${
                    selectedMember.status === 'active' ? 'bg-terminal-green' :
                    selectedMember.status === 'away' ? 'bg-terminal-yellow' : 'bg-slate-500'
                  }`} />
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-400 mb-1">
                      {selectedMember.isCore ? '◆ CORE_CLASS_COUNCIL' : '○ GENERAL_ROSTER'}
                    </p>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedMember.name}</h2>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIS: {selectedMember.nis} · {selectedMember.role}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedMember.bio}</p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Validated Skills</span>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {selectedMember.skills.map((skill: string) => (
                        <span key={skill} className="text-[10px] font-mono text-violet-300 bg-violet-900/30 border border-violet-800/50 px-2.5 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center sm:justify-start gap-2 pt-1">
                    {selectedMember.socialLinks?.github && (
                      <a href={selectedMember.socialLinks.github} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="secondary" icon={Github}>GitHub</Button>
                      </a>
                    )}
                    {selectedMember.socialLinks?.instagram && (
                      <a href={selectedMember.socialLinks.instagram} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="secondary" icon={Instagram}>Instagram</Button>
                      </a>
                    )}
                    {selectedMember.socialLinks?.linkedin && (
                      <a href={selectedMember.socialLinks.linkedin} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="secondary" icon={Linkedin}>LinkedIn</Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
