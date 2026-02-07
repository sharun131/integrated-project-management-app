import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Hash, FileText, Loader2 } from 'lucide-react';
import Modal from './Modal';

const LogTimeModal = ({ isOpen, onClose, onTimeLogged }) => {
    const { api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        project: '',
        task: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    // Fetch Projects on open
    useEffect(() => {
        if (isOpen) {
            const fetchProjects = async () => {
                try {
                    const res = await api.get('/projects');
                    setProjects(res.data.data);
                    if (res.data.data.length > 0) {
                        setFormData(prev => ({ ...prev, project: res.data.data[0]._id }));
                    }
                } catch (err) {
                    console.error("Failed to load projects", err);
                }
            };
            fetchProjects();
        }
    }, [isOpen, api]);

    // Fetch Tasks when Project changes
    useEffect(() => {
        if (formData.project) {
            const fetchTasks = async () => {
                try {
                    const res = await api.get('/tasks');
                    const projectTasks = res.data.data.filter(t =>
                        (t.project?._id === formData.project || t.project === formData.project) &&
                        t.status !== 'Completed'
                    );
                    setTasks(projectTasks);
                    if (projectTasks.length > 0) {
                        setFormData(prev => ({ ...prev, task: projectTasks[0]._id }));
                    } else {
                        setFormData(prev => ({ ...prev, task: '' }));
                    }
                } catch (err) {
                    console.error("Failed to load tasks", err);
                }
            };
            fetchTasks();
        }
    }, [formData.project, api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/timesheets', formData);
            onTimeLogged();
            onClose();
            // Reset form
            setFormData({
                project: projects[0]?._id || '',
                task: '',
                date: new Date().toISOString().split('T')[0],
                hours: '',
                description: ''
            });
        } catch (err) {
            console.error("Failed to log time", err);
            alert(err.response?.data?.error || 'Failed to log time');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Operation">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                            Operational Source
                        </label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                            <select
                                name="project"
                                required
                                value={formData.project}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                            >
                                {projects.map(p => (
                                    <option key={p._id} value={p._id} className="bg-slate-900 text-white">{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Task Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                            Active Assignment
                        </label>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                            <select
                                name="task"
                                required
                                value={formData.task}
                                onChange={handleChange}
                                disabled={tasks.length === 0}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {tasks.length === 0 && <option value="">No Active Tasks</option>}
                                {tasks.map(t => (
                                    <option key={t._id} value={t._id} className="bg-slate-900 text-white">{t.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                            Timeline Reference
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Hours Logged */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                            Temporal Duration (Hours)
                        </label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="number"
                                name="hours"
                                required
                                min="0.1"
                                step="0.1"
                                max="24"
                                placeholder="0.0"
                                value={formData.hours}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                        Operational Decrypt (Description)
                    </label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Transcribe operational activity..."
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-600 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary min-w-[140px] shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={18} />
                                Logging...
                            </>
                        ) : (
                            'Commit Log'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LogTimeModal;
