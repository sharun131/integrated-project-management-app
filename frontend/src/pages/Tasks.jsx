import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import ManageTaskModal from '../components/ManageTaskModal';
import PageHeader from '../components/PageHeader';

const Tasks = () => {
  const { user, api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = ['All', 'Open', 'In Progress', 'Completed'];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={18} className="text-success" />;
      case 'In Progress': return <AlertCircle size={18} className="text-primary" />;
      default: return <Circle size={18} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success/20 text-success border-success/30';
      case 'In Progress': return 'bg-primary/20 text-primary border-primary/30';
      case 'Open': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-white/10 text-slate-400 border-white/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
        <PageHeader title="Project Operations" subtitle="Synchronized task telemetry and node management" dark />
        {api.defaults.headers.common['Authorization'] && /* Just a check, better use user role */
          null
        }
        {/* We need user from context to check role here. Wait, Tasks.jsx doesn't destructure user from useAuth yet */}
        {['Super Admin', 'Project Manager', 'Project Admin'].includes(user?.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in"
          >
            <Plus size={18} />
            Create Task
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center animate-fade-in-up stagger-1">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-11 pr-4 py-2.5 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${filterStatus === status
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="divide-y divide-white/5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div
                key={task._id}
                onClick={() => setSelectedTask(task)}
                className={`px-6 py-5 flex items-center justify-between gap-6 hover:bg-white/[0.02] transition-all cursor-pointer group animate-fade-in-up stagger-${(index % 4) + 1}`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="mt-0.5 group-hover:scale-110 transition-transform">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-1.5 font-medium line-clamp-1 uppercase tracking-tight">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {task.dueDate && (
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                      <Calendar size={12} className="text-primary" />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {task.priority && (
                    <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                  <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center animate-scale-in">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-slate-700" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Workspace Crystal Clear</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">No tasks found in this view. Looks like you're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Unified Management Modal */}
      {(showModal || selectedTask) && (
        <ManageTaskModal
          isOpen={showModal || !!selectedTask}
          task={selectedTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={() => {
            setShowModal(false);
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};


export default Tasks;
