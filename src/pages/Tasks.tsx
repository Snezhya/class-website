import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { useToast } from '../context/ToastContext';
import { 
  CheckSquare, Square, Search, Plus, Trash2, Edit, CheckCircle2, Calendar, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export const Tasks: React.FC = () => {
  const { tasks, addTask, editTask, deleteTask, toggleTaskCompleted, isAdmin } = useApp();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  
  // Admin Task CRUD Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formCategory, setFormCategory] = useState('');

  const openAddModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormDueDate('');
    setFormCategory('');
    setIsAddModalOpen(true);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDueDate) {
      toast('Title and Due Date are required parameters', 'warning');
      return;
    }
    addTask({
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      status: 'pending',
      dueDate: formDueDate,
      category: formCategory || 'General'
    });
    setIsAddModalOpen(false);
    toast(`Task "${formTitle}" created successfully`, 'success');
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormCategory(task.category);
    setIsEditModalOpen(true);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDueDate) {
      toast('Title and Due Date are required', 'warning');
      return;
    }
    editTask(editingTask.id, {
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      dueDate: formDueDate,
      category: formCategory || 'General'
    });
    setIsEditModalOpen(false);
    toast(`Task changes updated`, 'success');
  };

  const handleDeleteTask = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to terminate task "${title}"?`)) {
      deleteTask(id);
      toast(`Task "${title}" terminated`, 'error');
    }
  };

  // Completion calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Search Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? t.status === 'completed' :
      filter === 'pending' ? t.status === 'pending' :
      filter === 'high' ? t.priority === 'high' : true;
      
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (prio: 'low' | 'medium' | 'high') => {
    switch (prio) {
      case 'high':
        return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
      case 'medium':
        return 'text-terminal-yellow bg-terminal-yellow/10 border-terminal-yellow/20';
      case 'low':
      default:
        return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Summary Banner */}
      <Card className="p-6 relative overflow-hidden bg-gradient-to-r from-brand-900/60 to-brand-800/40 border border-brand-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-400" />
              <span>Assignment Buffer Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-md font-sans">
              Operational track of active class duties, homework logs, and academic milestones. Total: {totalCount} | Completed: {completedCount}.
            </p>
          </div>
          
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>COMPLETION_INDEX</span>
              <span className="text-white font-bold">{completionPercent}%</span>
            </div>
            
            <div className="w-full bg-brand-950 rounded-full h-2.5 border border-brand-800 overflow-hidden">
              <motion.div 
                className="bg-brand-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-900/40 p-4 border border-brand-800 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search task index..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-800 rounded-lg text-xs text-white outline-none focus:border-brand-500 transition-colors placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto items-center">
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
              All
            </Button>
            <Button variant={filter === 'pending' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('pending')}>
              Pending
            </Button>
            <Button variant={filter === 'completed' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('completed')}>
              Completed
            </Button>
            <Button variant={filter === 'high' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('high')}>
              High Priority
            </Button>
          </div>
          
          {isAdmin && (
            <Button variant="terminal" size="sm" onClick={openAddModal} icon={Plus} className="w-full md:w-auto ml-0 md:ml-2">
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="TASK_QUEUE_EMPTY"
                description="No matching assignments could be extracted from local memory registers."
                actionText={isAdmin ? "Create new task" : "Clear filters"}
                onAction={isAdmin ? openAddModal : () => { setFilter('all'); setSearchQuery(''); }}
                icon={FileText}
              />
            </div>
          ) : (
            filteredTasks.map(task => {
              const isCompleted = task.status === 'completed';
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card 
                    className={`flex flex-col justify-between h-full border-l-4 transition-all duration-300 ${
                      isCompleted 
                        ? 'border-l-terminal-green bg-brand-900/10 opacity-75' 
                        : task.priority === 'high' 
                        ? 'border-l-terminal-red' 
                        : task.priority === 'medium'
                        ? 'border-l-terminal-yellow'
                        : 'border-l-terminal-blue'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] font-mono text-slate-500 bg-brand-950/60 border border-brand-850 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        
                        <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        {/* Custom animated checkbox */}
                        <button 
                          onClick={() => toggleTaskCompleted(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-terminal-green" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                        
                        <div className="space-y-1 flex-1">
                          <h4 className={`text-sm font-semibold text-white leading-snug ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 font-sans leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-800/40 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>Due: {task.dueDate}</span>
                      </span>

                      {/* Admin action overlays */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(task)}
                            className="p-1 text-slate-500 hover:text-white transition-colors rounded hover:bg-brand-900/60"
                            title="Edit Task Settings"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1 text-slate-500 hover:text-terminal-red transition-colors rounded hover:bg-brand-900/60"
                            title="Terminate Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ADD TASK MODAL (ADMIN ONLY) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="add_task_registry.sh">
        <form onSubmit={handleAddTask} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">TASK_TITLE *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Laporan Praktikum ASJ"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">DESCRIPTION</label>
            <textarea
              placeholder="Detailed description of task deliverables..."
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">PRIORITY</label>
              <select 
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">CATEGORY</label>
              <input
                type="text" 
                placeholder="e.g. Jaringan, Teori"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">DEADLINE_DATE *</label>
            <input 
              type="date" 
              required
              value={formDueDate}
              onChange={e => setFormDueDate(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Deploy Task</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT TASK MODAL (ADMIN ONLY) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="edit_task_registry.sh">
        <form onSubmit={handleEditTask} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">TASK_TITLE *</label>
            <input 
              type="text" 
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">DESCRIPTION</label>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">PRIORITY</label>
              <select 
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as any)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">CATEGORY</label>
              <input
                type="text" 
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">DEADLINE_DATE *</label>
            <input 
              type="date" 
              required
              value={formDueDate}
              onChange={e => setFormDueDate(e.target.value)}
              className="w-full p-2.5 bg-brand-950 border border-brand-800 rounded-lg text-white outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Commit Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
