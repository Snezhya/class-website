import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/shared/EmptyState';
import { Search, User, Terminal, Award, ListOrdered } from 'lucide-react';
import { type Member } from '../data/initialData';
import { sortByAbsen } from '../utils/attendance';
import { TerminalOutput } from '../components/motion/TerminalOutput';
import { MotionCard } from '../components/motion/MotionCard';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { useGsapScrollReveal } from '../hooks/useGsapScrollReveal';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [inspectLines, setInspectLines] = useState<string[]>([]);

  // URL search parameter check
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search');
    if (searchVal) {
      setSearchQuery(searchVal);
    }
  }, [location]);

  useGsapScrollReveal(containerRef, '[data-anim-role="scroll-reveal"]', [
    searchQuery,
    selectedRole,
    viewByAbsen,
  ]);

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
      ...(viewByAbsen ? [`ABSEN       : ${member.absen ?? '—'}`] : []),
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

  return (
    <div className="space-y-8">
      {/* Search and Filters Header */}
      <ScrollReveal className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search students, NIS, skills..."
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
          <Button
            variant={viewByAbsen ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewByAbsen(prev => !prev)}
            icon={ListOrdered}
          >
            Urut Absen
          </Button>
        </div>
      </ScrollReveal>

      {/* Roster Layout Directory */}
      <div ref={containerRef} className="space-y-12">
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
            <div className="space-y-2">
              {absenList.map((member) => (
                <ScrollReveal key={member.id}>
                  <MotionCard
                    hoverOnly
                    onClick={() => handleInspectMember(member)}
                    className="flex items-center gap-4 p-3 rounded-xl border border-brand-800 bg-brand-900/30 hover:border-brand-600/50 cursor-pointer"
                  >
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-brand-500 border-2 border-brand-950 text-lg font-mono font-bold text-white flex items-center justify-center">
                    {member.absen}
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
                </ScrollReveal>
              ))}
            </div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreTeam.map(member => (
                    <Card
                      key={member.id}
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
                  ))}
                </div>
              </div>
            )}

            {/* 2. General Class Roster */}
            {regularRoster.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-800 pb-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <h2 className="text-xl font-bold text-white">Full Roster</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {regularRoster.map(member => (
                    <Card
                      key={member.id}
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
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Detailed Profile Inspector Modal (Terminal Linux UI) */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={selectedMember ? `profile_inspect.sh --target=${selectedMember.name.split(' ')[0]}` : ''}
        size="lg"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Terminal Window frame mockup inside the modal */}
            <div className="bg-terminal-dark border border-brand-800 rounded-lg overflow-hidden shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-brand-800 bg-brand-950/60 select-none">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-terminal-green" />
                  <span>inspect_client_output</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
              </div>
              
              <div className="p-4 text-terminal-green/90 overflow-x-auto">
                <TerminalOutput lines={inspectLines} active={!!selectedMember} />
              </div>
            </div>

            {/* Roster Bio & Social Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-4 border border-brand-850 rounded-xl bg-brand-950/20">
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-24 h-24 rounded-xl object-cover border border-brand-700 bg-brand-950"
              />
              
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">NIS: {selectedMember.nis} • Role: {selectedMember.role}</p>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {selectedMember.bio}
                </p>

                {/* Skill List */}
                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Validated Skills</span>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                    {selectedMember.skills.map((skill: string) => (
                      <span key={skill} className="text-[10px] font-mono text-slate-300 bg-brand-800 border border-brand-700 px-2.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social links */}
                <div className="flex justify-center sm:justify-start gap-2 pt-2">
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
        )}
      </Modal>
    </div>
  );
};
