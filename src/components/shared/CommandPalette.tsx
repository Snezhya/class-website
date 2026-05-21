import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Users, Calendar, Image, FileText, Settings, ShieldAlert, Sparkles, AlertTriangle, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';
import { overlayPop } from '../../utils/motionVariants';
import { tweenSmooth } from '../../utils/animationConfig';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { members, tasks, updateSettings, isAdmin, logout } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset indices and focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Command items
  const pages = [
    { title: 'Dashboard / Home', path: '/', icon: Terminal },
    { title: 'Class Members', path: '/members', icon: Users },
    { title: 'Daftar Absen', path: '/absen', icon: ClipboardList },
    { title: 'Tasks & Homework', path: '/tasks', icon: FileText },
    { title: 'Schedule & Exams', path: '/schedule', icon: Calendar },
    { title: 'Gallery Archive', path: '/gallery', icon: Image },
    { title: 'Notes & Announcements', path: '/notes', icon: FileText },
    { title: 'Admin Console', path: '/admin', icon: ShieldAlert },
  ];

  const actions = [
    {
      title: 'Switch Theme: Dark Navy',
      action: () => { updateSettings({ theme: 'dark-navy' }); toast('Theme changed to Dark Navy', 'success'); },
      icon: Sparkles
    },
    {
      title: 'Switch Theme: Dark Slate',
      action: () => { updateSettings({ theme: 'dark-slate' }); toast('Theme changed to Dark Slate', 'success'); },
      icon: Sparkles
    },
    {
      title: 'Switch Theme: Pure Black',
      action: () => { updateSettings({ theme: 'pure-black' }); toast('Theme changed to Pure Black', 'success'); },
      icon: Sparkles
    },
    {
      title: 'Switch Background: Dot Matrix',
      action: () => { updateSettings({ backgroundType: 'dot' }); toast('Background set to Dot Matrix', 'info'); },
      icon: Settings
    },
    {
      title: 'Switch Background: Grid Matrix',
      action: () => { updateSettings({ backgroundType: 'grid' }); toast('Background set to Grid Matrix', 'info'); },
      icon: Settings
    },
    {
      title: 'Switch Background: Animated Gradient',
      action: () => { updateSettings({ backgroundType: 'gradient' }); toast('Background set to Gradient', 'info'); },
      icon: Settings
    },
    {
      title: isAdmin ? 'Log Out Admin Session' : 'Go to Admin Login',
      action: () => {
        if (isAdmin) {
          logout();
          toast('Logged out of admin console', 'info');
        } else {
          navigate('/admin');
        }
      },
      icon: ShieldAlert
    }
  ];

  // Filter items based on query
  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  
  const filteredMembers = members
    .filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()))
    .map(m => ({
      title: `Student: ${m.name} (${m.role})`,
      path: `/members?search=${m.name}`,
      icon: Users
    }));

  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()))
    .map(t => ({
      title: `Task: ${t.title} [${t.priority.toUpperCase()}]`,
      path: `/tasks?search=${t.title}`,
      icon: FileText
    }));

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  // Combine items
  const allItems = [
    ...filteredPages.map(p => ({ ...p, type: 'page' })),
    ...filteredActions.map(a => ({ ...a, type: 'action' })),
    ...filteredMembers.map(m => ({ ...m, type: 'member' })),
    ...filteredTasks.map(t => ({ ...t, type: 'task' }))
  ];

  // Handle arrow key traversal
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        executeItem(allItems[selectedIndex]);
      }
    }
  };

  const executeItem = (item: any) => {
    setIsOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={tweenSmooth(0.35)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-brand-950/80 backdrop-blur-sm"
        >
          <motion.div
            ref={containerRef}
            variants={overlayPop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-2xl bg-brand-900 border border-brand-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[60vh] select-none"
            onKeyDown={handleKeyDown}
          >
            {/* Search Bar Header */}
            <div className="flex items-center gap-3 px-4 border-b border-brand-800 bg-brand-950/40">
              <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search portal pages, members, tasks, and system actions..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full py-4 bg-transparent text-white outline-none border-none text-base font-sans placeholder-slate-500"
              />
              <span className="text-[10px] text-slate-500 bg-brand-800 border border-brand-700 px-2 py-1 rounded-md font-mono flex-shrink-0">
                ESC to close
              </span>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-2 flex-1">
              {allItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-slate-600" />
                  <span>No results match your query</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {allItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`${item.type}-${idx}`}
                        onClick={() => executeItem(item)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-brand-700/60 text-white border-l-2 border-brand-500 pl-4' 
                            : 'hover:bg-brand-800/40 text-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                        <span className="text-sm font-medium font-sans flex-1">{item.title}</span>
                        <span className="text-xs uppercase px-2 py-0.5 rounded font-mono bg-brand-950/60 text-slate-500 border border-brand-800">
                          {item.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-brand-800 bg-brand-950/40 text-slate-500 text-[10px] font-mono flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <div>
                <span>XI TJKT 1 Class Core Portal</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
