import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Terminal, Users, Calendar, Image, FileText, ShieldAlert, 
  Menu, X, Settings, LogOut, Clock, ClipboardList
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/shared/BrandLogo';
import { Background } from '../components/shared/Background';
import { CommandPalette } from '../components/shared/CommandPalette';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/motion/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';
import { drawerBackdrop, drawerPanel } from '../utils/motionVariants';
import { gentleSpring } from '../utils/animationConfig';
import { prefersReducedMotion } from '../utils/galleryUtils';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, logout, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString('id-ID'));

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Terminal },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Absen', path: '/absen', icon: ClipboardList },
    { name: 'Tasks', path: '/tasks', icon: FileText },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Admin', path: '/admin', icon: ShieldAlert }
  ];

  const handleAdminLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-500`}>
      {/* Background Matrix & Lighting */}
      <Background />

      {/* Ctrl+K Search Listener */}
      <CommandPalette />

      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-brand-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Class Terminal Brand */}
          <Link to="/" className="flex items-center gap-2.5 select-none group">
            <BrandLogo
              src={settings.logoHeader || undefined}
              size={32}
              className="transition-all duration-300 group-hover:border-brand-500/50"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-white">
                {settings.brandTitle}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{settings.brandSubtitle}</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || 
                               (link.path !== '/' && location.pathname.startsWith(link.path));
              const linkClass = `relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium select-none ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              }`;
              if (prefersReducedMotion()) {
                return (
                  <Link key={link.path} to={link.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              }
              return (
                <motion.div key={link.path} layout className="relative">
                  <Link to={link.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-brand-800/40 border border-brand-700/30 -z-10"
                      transition={gentleSpring}
                    />
                  )}
                </motion.div>
              );
            })}
          </nav>

          {/* Right Header Panel (Clock & System Status) */}
          <div className="hidden md:flex items-center gap-4">
            {/* System Clock */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-brand-950/40 px-2.5 py-1.5 rounded-lg border border-brand-800/80">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>{systemTime}</span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-brand-950/40 border border-brand-800/80 px-2.5 py-1.5 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green"></span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase select-none">
                {isAdmin ? 'ADMIN SECURE_NODE' : 'SYS_OPERATIONAL'}
              </span>
            </div>

            {/* Command shortcut visual helper */}
            <div className="text-[10px] text-slate-500 font-mono bg-brand-800/30 border border-brand-800 px-2 py-1 rounded">
              Ctrl + K
            </div>

            {/* Quick Logout if Admin */}
            {isAdmin && (
              <button 
                onClick={handleAdminLogout}
                className="p-2 rounded-lg bg-terminal-red/10 border border-terminal-red/20 text-terminal-red hover:bg-terminal-red/20 transition-all"
                title="Logout Admin Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Clock Widget for Mobile */}
            <span className="text-xs text-slate-500 font-mono">{systemTime.slice(0, 5)}</span>
            
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg bg-brand-800/50 border border-brand-700/80 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar slide — Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30">
            <motion.div
              variants={drawerBackdrop}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 bg-brand-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              variants={drawerPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute right-0 top-0 bottom-0 w-[min(100%,280px)] pt-16 bg-brand-950 border-l border-brand-800 flex flex-col justify-between shadow-2xl"
            >
              <nav className="p-6 flex flex-col gap-2">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={prefersReducedMotion() ? false : { opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...gentleSpring, delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-500 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-brand-900/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-brand-800/80 bg-brand-950/40 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                  <span>STATUS:</span>
                  <span className="text-terminal-green">SYS_OPERATIONAL</span>
                </div>
                {isAdmin && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      handleAdminLogout();
                      setMobileMenuOpen(false);
                    }}
                    icon={LogOut}
                  >
                    Log Out Admin
                  </Button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile Native-like Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-brand-800/80 backdrop-blur-md px-3 py-2 flex items-center justify-around">
        {navLinks.slice(0, 5).map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{link.name}</span>
            </Link>
          );
        })}
        {/* Toggle mobile menu drawer for extra options */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
            mobileMenuOpen ? 'text-brand-400' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
};
