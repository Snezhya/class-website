import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Search, Plus, Trash2, Edit, Megaphone, Pin, Clock, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export const Notes: React.FC = () => {
  const { notes, addNote, editNote, deleteNote, isAdmin } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Notes CRUD Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState<'announcement' | 'note'>('announcement');
  const [formCategory, setFormCategory] = useState<'System' | 'Academic' | 'Class' | 'General'>('Class');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formAuthor, setFormAuthor] = useState('');

  const openAddModal = () => {
    setFormTitle('');
    setFormContent('');
    setFormType('announcement');
    setFormCategory('Class');
    setFormIsPinned(false);
    setFormAuthor(isAdmin ? 'Class Administrator' : '');
    setIsAddModalOpen(true);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formAuthor.trim()) {
      toast('Title, Content, and Author parameters are required', 'warning');
      return;
    }
    addNote({
      title: formTitle,
      content: formContent,
      type: formType,
      category: formCategory,
      isPinned: formType === 'announcement' ? formIsPinned : false,
      author: formAuthor
    });
    setIsAddModalOpen(false);
    toast(`Bulletin item "${formTitle}" posted successfully`, 'success');
  };

  const openEditModal = (note: any) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormType(note.type);
    setFormCategory(note.category);
    setFormIsPinned(note.isPinned || false);
    setFormAuthor(note.author);
    setIsEditModalOpen(true);
  };

  const handleEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formAuthor.trim()) {
      toast('All fields must be configured', 'warning');
      return;
    }
    editNote(editingNote.id, {
      title: formTitle,
      content: formContent,
      type: formType,
      category: formCategory,
      isPinned: formType === 'announcement' ? formIsPinned : false,
      author: formAuthor
    });
    setIsEditModalOpen(false);
    toast('Bulletin updated successfully', 'success');
  };

  const handleDeleteNote = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete bulletin post "${title}"?`)) {
      deleteNote(id);
      toast(`Bulletin "${title}" deleted`, 'error');
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.author.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'announcements' ? n.type === 'announcement' :
      activeTab === 'notes' ? n.type === 'note' : true;
      
    return matchesSearch && matchesTab;
  });

  // Split into pinned and general for display priority
  const pinnedItems = filteredNotes.filter(n => n.isPinned && n.type === 'announcement');
  const generalItems = filteredNotes.filter(n => !n.isPinned || n.type !== 'announcement');

  const getCategoryColor = (cat: 'System' | 'Academic' | 'Class' | 'General') => {
    switch (cat) {
      case 'System':
        return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
      case 'Academic':
        return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
      case 'Class':
        return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
      case 'General':
      default:
        return 'text-terminal-yellow bg-terminal-yellow/10 border-terminal-yellow/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <Card className="p-6 bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-400" />
              <span>Broadcast Bulletin & Notes Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg font-sans">
              Timeline feed of academic declarations, technical setup notes, logs, and notifications.
            </p>
          </div>
          
          {isAdmin && (
            <Button variant="terminal" size="sm" onClick={openAddModal} icon={Plus}>
              Broadcast Post
            </Button>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search bulletins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-800 rounded-lg text-xs text-white outline-none focus:border-brand-500 transition-colors placeholder-slate-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          <Button variant={activeTab === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setActiveTab('all')}>
            All Items
          </Button>
          <Button variant={activeTab === 'announcements' ? 'primary' : 'secondary'} size="sm" onClick={() => setActiveTab('announcements')} icon={Megaphone}>
            Announcements
          </Button>
          <Button variant={activeTab === 'notes' ? 'primary' : 'secondary'} size="sm" onClick={() => setActiveTab('notes')} icon={FileText}>
            Class Notes
          </Button>
        </div>
      </div>

      {/* Timeline Layout */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title="BULLETIN_EMPTY"
          description="No bulletins or notes recorded matching these query guidelines."
          actionText={isAdmin ? "Create broadcast post" : "Reset filter"}
          onAction={isAdmin ? openAddModal : () => { setActiveTab('all'); setSearchQuery(''); }}
          icon={Megaphone}
        />
      ) : (
        <div className="relative border-l border-brand-800 ml-4 md:ml-6 pl-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {/* Pinned Broadcasts */}
            {pinnedItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                {/* Timeline Dot (Pinned styled dot) */}
                <span className="absolute -left-[31px] md:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-950 border-2 border-terminal-yellow">
                  <span className="h-1.5 w-1.5 rounded-full bg-terminal-yellow animate-pulse" />
                </span>

                <Card className="border-terminal-yellow/30 bg-terminal-yellow/[0.02] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-terminal-yellow/10 text-terminal-yellow text-[8px] font-mono font-bold px-2 py-0.5 border-l border-b border-terminal-yellow/20 rounded-bl select-none flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5" />
                    <span>PINNED_BROADCAST</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${getCategoryColor(item.category)}`}>
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-display">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{item.content}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-800/40 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Author: {item.author}</span>
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(item)} className="p-1 hover:text-white rounded hover:bg-brand-900/60"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteNote(item.id, item.title)} className="p-1 hover:text-terminal-red rounded hover:bg-brand-900/60"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* General Bulletins */}
            {generalItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[30px] md:-left-[38px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-950 border-2 border-brand-700">
                  <span className="h-1 w-1 rounded-full bg-brand-600" />
                </span>

                <Card className="bg-brand-900/10 border-brand-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${getCategoryColor(item.category)}`}>
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </span>
                      {item.type === 'log' && (
                        <span className="text-[9px] font-mono text-slate-500 bg-brand-950 px-1 border border-brand-800 rounded">DAEMON_LOG</span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white font-display">{item.title}</h4>
                    <p className={`text-xs leading-relaxed ${item.type === 'log' ? 'font-mono text-terminal-green bg-terminal-dark/60 p-3 rounded-lg border border-brand-850' : 'text-slate-400 font-sans'} whitespace-pre-wrap`}>
                      {item.content}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-800/40 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Author: {item.author}</span>
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(item)} className="p-1 hover:text-white rounded hover:bg-brand-850"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteNote(item.id, item.title)} className="p-1 hover:text-terminal-red rounded hover:bg-brand-850"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ADD POST MODAL (ADMIN ONLY) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="publish_bulletin_entry.sh">
        <form onSubmit={handleAddNote} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">ENTRY_TYPE</label>
              <select 
                value={formType}
                onChange={e => setFormType(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="announcement">ANNOUNCEMENT</option>
                <option value="note">CLASS NOTE</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-slate-400">CATEGORY</label>
              <select 
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="Class">CLASS / INTERNAL</option>
                <option value="Academic">ACADEMIC / LESSONS</option>
                <option value="System">SYSTEM / LOGS</option>
                <option value="General">GENERAL / BULLETIN</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">BULLETIN_TITLE *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Pembagian Akun Cisco Netacad Baru"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">ENTRY_CONTENT *</label>
            <textarea
              required
              placeholder="Write bulletin contents here. Markups not supported but newlines preserved..."
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs h-28"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">AUTHOR *</label>
            <input 
              type="text" 
              required
              value={formAuthor}
              onChange={e => setFormAuthor(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          {formType === 'announcement' && (
            <div className="flex items-center gap-2 pt-2 select-none">
              <input 
                type="checkbox" 
                id="isPinned"
                checked={formIsPinned}
                onChange={e => setFormIsPinned(e.target.checked)}
                className="w-4 h-4 bg-brand-950 border border-brand-800 rounded focus:ring-0 focus:ring-offset-0 text-brand-500"
              />
              <label htmlFor="isPinned" className="text-slate-400 cursor-pointer">PIN_TO_TOP_OF_BULLETIN</label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Broadcast Bulletin</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT POST MODAL (ADMIN ONLY) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="edit_bulletin_entry.sh">
        <form onSubmit={handleEditNote} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">ENTRY_TYPE</label>
              <select 
                value={formType}
                onChange={e => setFormType(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="announcement">ANNOUNCEMENT</option>
                <option value="note">CLASS NOTE</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-slate-400">CATEGORY</label>
              <select 
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="Class">CLASS / INTERNAL</option>
                <option value="Academic">ACADEMIC / LESSONS</option>
                <option value="System">SYSTEM / LOGS</option>
                <option value="General">GENERAL / BULLETIN</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">BULLETIN_TITLE *</label>
            <input 
              type="text" 
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">ENTRY_CONTENT *</label>
            <textarea
              required
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs h-28"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">AUTHOR *</label>
            <input 
              type="text" 
              required
              value={formAuthor}
              onChange={e => setFormAuthor(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          {formType === 'announcement' && (
            <div className="flex items-center gap-2 pt-2 select-none">
              <input 
                type="checkbox" 
                id="isPinnedEdit"
                checked={formIsPinned}
                onChange={e => setFormIsPinned(e.target.checked)}
                className="w-4 h-4 bg-brand-950 border border-brand-800 rounded focus:ring-0 focus:ring-offset-0 text-brand-500"
              />
              <label htmlFor="isPinnedEdit" className="text-slate-400 cursor-pointer">PIN_TO_TOP_OF_BULLETIN</label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Commit Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
