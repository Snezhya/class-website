import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ActivityLogs } from '../components/shared/ActivityLogs';
import { 
  Terminal, Users, FileText, Image, 
  Wifi, Bell, ShieldCheck, ArrowRight, Clock
} from 'lucide-react';
import { animate } from 'animejs';
import gsap from 'gsap';


export const Home: React.FC = () => {
  const { members, tasks, schedules, notes, gallery, settings, isAdmin } = useApp();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Stagger reveal animations on load (GSAP)
  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.gsap-reveal'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, []);

  // Anime.js count-up counters
  const totalStudents = members.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalGallery = gallery.length;

  useEffect(() => {
    // Total Students Counter
    animate('.counter-students', {
      innerHTML: [0, totalStudents],
      round: 1,
      easing: 'easeOutQuad',
      duration: 1200
    });

    // Completed Tasks Counter
    animate('.counter-completed', {
      innerHTML: [0, completedTasks],
      round: 1,
      easing: 'easeOutQuad',
      duration: 1200
    });

    // Gallery Archive Counter
    animate('.counter-gallery', {
      innerHTML: [0, totalGallery],
      round: 1,
      easing: 'easeOutQuad',
      duration: 1200
    });
  }, [totalStudents, completedTasks, totalGallery]);

  // System Monitor simulation
  const [cpuUsage, setCpuUsage] = React.useState(28);
  const [ramUsage, setRamUsage] = React.useState(42);
  const [dbPing, setDbPing] = React.useState(48);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.min(Math.max(prev + delta, 15), 65);
      });
      setRamUsage(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1 to +1
        return Math.min(Math.max(prev + delta, 38), 46);
      });
      setDbPing(prev => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.min(Math.max(prev + delta, 25), 85);
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Filter pinned or active announcements
  const pinnedAnnouncements = notes.filter(n => n.type === 'announcement' && n.isPinned);
  const otherAnnouncements = notes.filter(n => n.type === 'announcement' && !n.isPinned).slice(0, 2);
  const homepageAnnouncements = [...pinnedAnnouncements, ...otherAnnouncements];

  // Get current day's schedule preview
  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = daysIndo[new Date().getDay()] as any;
  const todaySchedules = schedules.filter(s => s.day === (currentDayName === 'Minggu' || currentDayName === 'Sabtu' ? 'Senin' : currentDayName));

  return (
    <div ref={heroRef} className="space-y-10">
      {/* 1. Hero Section */}
      {settings.showHero && (
        <section className="relative overflow-hidden rounded-2xl glass-panel p-8 md:p-12 border border-brand-800/80 bg-brand-900/60 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-slate-600 hidden md:block">
            STATION_ID: SMKN1BYL-XI-TJKT-1
          </div>
          
          <div className="max-w-3xl space-y-6">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800/60 border border-brand-700/80 text-[11px] font-mono text-brand-400">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-ping" />
              <span>TERMINAL NODE ACTIVE (v2.6.0)</span>
            </div>

            <h1 className="gsap-reveal text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
              {settings.heroTitle}
            </h1>
            
            <p className="gsap-reveal text-sm md:text-base text-slate-400 max-w-xl font-sans leading-relaxed">
              {settings.heroSubtitle}
            </p>

            <div className="gsap-reveal flex flex-wrap gap-3 pt-2">
              <Button 
                variant="primary" 
                onClick={() => navigate('/tasks')} 
                icon={FileText}
              >
                Inspect Tasks
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/members')} 
                icon={Users}
              >
                 Roster Directory
              </Button>
              <Button 
                variant="terminal" 
                onClick={() => navigate('/admin')} 
                icon={Terminal}
              >
                sudo system_init
              </Button>
            </div>
          </div>

          {/* Right Floating Console Mockup (Desktop) */}
          <div className="absolute right-8 bottom-6 w-96 hidden lg:block opacity-75 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-brand-950 border border-brand-800 rounded-lg overflow-hidden shadow-2xl font-mono text-[11px]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-brand-800 bg-brand-900/60">
                <span className="text-slate-500">guest@tjkt1-node:~</span>
                <span className="w-2 h-2 rounded-full bg-brand-500" />
              </div>
              <div className="p-3.5 space-y-2 text-slate-400">
                <div><span className="text-brand-400">$</span> neofetch</div>
                <div><span className="text-white font-bold">OS:</span> TJKT1 Core OS x86_64</div>
                <div><span className="text-white font-bold">Host:</span> SMKN 1 Boyolali Server</div>
                <div><span className="text-white font-bold">Shell:</span> bash 5.2.0</div>
                <div><span className="text-white font-bold">Resolution:</span> Responsive AutoGrid</div>
                <div><span className="text-white font-bold">Theme:</span> GitHub Dark Navy</div>
                <div><span className="text-white font-bold">Terminal:</span> Space-Grotesk-Monospace</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Statistical Cards (Anime.js Count-Up) */}
      {settings.showStats && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4 relative overflow-hidden group">
            <div className="p-3 rounded-lg bg-brand-800 border border-brand-700/60 text-brand-400 group-hover:border-brand-500/40 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">TOTAL_MEMBERS</span>
              <h3 className="text-2xl font-bold font-mono counter-students text-white">0</h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 relative overflow-hidden group">
            <div className="p-3 rounded-lg bg-brand-800 border border-brand-700/60 text-terminal-green group-hover:border-terminal-green/40 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">PENDING_TASKS</span>
              <h3 className="text-2xl font-bold font-mono text-white">
                {pendingTasks} <span className="text-xs font-sans text-slate-500 font-normal">due</span>
              </h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 relative overflow-hidden group">
            <div className="p-3 rounded-lg bg-brand-800 border border-brand-700/60 text-terminal-cyan group-hover:border-terminal-cyan/40 transition-colors">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">GALLERY_ARCHIVE</span>
              <h3 className="text-2xl font-bold font-mono counter-gallery text-white">0</h3>
            </div>
          </Card>

          <Card className="flex items-center gap-4 relative overflow-hidden group">
            <div className="p-3 rounded-lg bg-brand-800 border border-brand-700/60 text-terminal-yellow group-hover:border-terminal-yellow/40 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">SYSTEM_STATUS</span>
              <h3 className="text-sm font-bold font-mono text-terminal-green uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green inline-block animate-pulse" />
                <span>SECURED</span>
              </h3>
            </div>
          </Card>
        </section>
      )}

      {/* 3. Main Workspace Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Announcements & Schedule Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Announcements Feed */}
          <Card title="Pinned Broadcasts" className="relative">
            <div className="absolute top-4 right-5 text-slate-500">
              <Bell className="w-4 h-4" />
            </div>
            
            {homepageAnnouncements.length === 0 ? (
              <div className="text-slate-500 py-8 text-center text-sm font-mono select-none">
                No active announcements found in this node.
              </div>
            ) : (
              <div className="space-y-4">
                {homepageAnnouncements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl border border-brand-700 bg-brand-850/30 flex flex-col gap-2 relative overflow-hidden">
                    {ann.isPinned && (
                      <div className="absolute top-0 right-0 bg-brand-700 text-slate-300 text-[9px] uppercase font-mono px-2 py-0.5 border-l border-b border-brand-600 rounded-bl">
                        PINNED
                      </div>
                    )}
                    <span className="text-[10px] text-brand-400 font-mono uppercase tracking-wider">{ann.category} • {ann.date}</span>
                    <h4 className="text-sm font-display font-semibold text-white">{ann.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{ann.content}</p>
                    <div className="text-[10px] text-slate-500 font-mono self-end">By: {ann.author}</div>
                  </div>
                ))}
                
                <Link to="/notes" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors pt-2 group">
                  <span>View all bulletin archives</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </Card>

          {/* Schedule Preview */}
          {settings.showSchedulePreview && (
            <Card title={`Schedules Today (${currentDayName === 'Minggu' || currentDayName === 'Sabtu' ? 'Senin Preview' : currentDayName})`}>
              {todaySchedules.length === 0 ? (
                <div className="text-slate-500 py-8 text-center text-sm font-mono select-none">
                  No courses registered for today. System idle.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todaySchedules.map(sched => (
                    <div key={sched.id} className="p-4 rounded-xl border border-brand-700/60 bg-brand-950/20 flex flex-col gap-2 relative">
                      <div className="absolute top-3 right-3 text-slate-500 font-mono text-[9px] px-1.5 py-0.5 rounded bg-brand-800 border border-brand-700">
                        {sched.type.toUpperCase()}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-brand-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sched.time}</span>
                      </div>
                      
                      <h4 className="text-sm font-display font-bold text-white mt-1">{sched.subject}</h4>
                      
                      <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-sans mt-2 pt-2 border-t border-brand-850">
                        <span>Teacher: {sched.teacher}</span>
                        <span>Room: {sched.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Link to="/schedule" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors pt-4 group">
                <span>Open complete calendar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>
          )}

        </div>

        {/* Right Column: Activity Logs & System Monitor */}
        <div className="space-y-6">
          
          {/* Quick Access Actions */}
          <Card title="Quick Terminal Actions">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/members" className="p-3 rounded-lg border border-brand-700 hover:border-brand-500/40 bg-brand-950/20 hover:bg-brand-900/40 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-slate-400 hover:text-white select-none">
                <Users className="w-5 h-5 text-brand-400" />
                <span className="text-[10px] font-mono">ROSTER_DIR</span>
              </Link>
              
              <Link to="/tasks" className="p-3 rounded-lg border border-brand-700 hover:border-brand-500/40 bg-brand-950/20 hover:bg-brand-900/40 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-slate-400 hover:text-white select-none">
                <FileText className="w-5 h-5 text-terminal-green" />
                <span className="text-[10px] font-mono">TASK_BUFF</span>
              </Link>

              <Link to="/gallery" className="p-3 rounded-lg border border-brand-700 hover:border-brand-500/40 bg-brand-950/20 hover:bg-brand-900/40 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-slate-400 hover:text-white select-none">
                <Image className="w-5 h-5 text-terminal-cyan" />
                <span className="text-[10px] font-mono">MEDIA_ARCH</span>
              </Link>

              <Link to="/admin" className="p-3 rounded-lg border border-brand-700 hover:border-brand-500/40 bg-brand-950/20 hover:bg-brand-900/40 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-slate-400 hover:text-white select-none">
                <ShieldCheck className="w-5 h-5 text-terminal-red" />
                <span className="text-[10px] font-mono">CMS_ROOT</span>
              </Link>
            </div>
          </Card>

          {/* System Monitor Widget */}
          <Card title="Core Server Telemetry">
            <div className="space-y-5 font-mono text-xs">
              
              {/* Circular Indicators Layout */}
              <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-brand-950/40 rounded-xl border border-brand-850">
                {/* CPU Circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-brand-900 fill-none"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-brand-500 fill-none transition-all duration-1000"
                        strokeWidth="3.5"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 - (cpuUsage / 100) * (2 * Math.PI * 26)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                      {cpuUsage}%
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider">CPU_UTIL</span>
                </div>

                {/* RAM Circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-brand-900 fill-none"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-terminal-cyan fill-none transition-all duration-1000"
                        strokeWidth="3.5"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 - (ramUsage / 100) * (2 * Math.PI * 26)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                      {ramUsage}%
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider">MEM_ALLOC</span>
                </div>

                {/* DB Latency Circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-brand-900 fill-none"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-terminal-green fill-none transition-all duration-1000"
                        strokeWidth="3.5"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 - (Math.min(dbPing, 100) / 100) * (2 * Math.PI * 26)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                      {dbPing}ms
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider">DB_LATENCY</span>
                </div>
              </div>

              {/* Server Details */}
              <div className="pt-2 border-t border-brand-800/80 space-y-1 text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span>CLOUD BACKEND</span>
                  <span className="text-terminal-green uppercase font-bold">SUPABASE CLOUD</span>
                </div>
                <div className="flex justify-between">
                  <span>DB REGION</span>
                  <span>ap-southeast-1 (SG)</span>
                </div>
                <div className="flex justify-between">
                  <span>NETWORK LINK</span>
                  <span className="text-terminal-cyan flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>SECURE_HTTPS</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>UPTIME</span>
                  <span>42d 18h 05m 12s</span>
                </div>
                <div className="flex justify-between">
                  <span>ACTIVE SESSIONS</span>
                  <span>{isAdmin ? '2 (1 ROOT)' : '1 (READ_ONLY)'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Log Daemon */}
          {settings.showActivityLog && <ActivityLogs />}
          
        </div>
      </section>
    </div>
  );
};
