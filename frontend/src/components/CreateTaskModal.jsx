import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Search, Calendar, Briefcase, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const { api, user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        priority: 'Medium',
        dueDate: '',
        status: 'To Do',
        assignedTo: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        try {
            setFetching(true);
            const res = await api.get('/projects');
            setProjects(res.data.data);
            if (res.data.data.length > 0) {
                setFormData(prev => ({ ...prev, project: res.data.data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to load projects", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (formData.project && projects.length > 0) {
            const proj = projects.find(p => p._id === formData.project);
            if (proj && proj.team) {
                setSelectedProjectMembers(proj.team.filter(m => m.user));
            } else {
                setSelectedProjectMembers([]);
            }
        }
    }, [formData.project, projects]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/tasks', formData);
            onTaskCreated();
            onClose();
            setFormData({
                title: '',
                description: '',
                project: projects[0]?._id || '',
                priority: 'Medium',
                dueDate: '',
                status: 'To Do',
                assignedTo: ''
            });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initialize Task Node">
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                {fetching ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accessing Project Registry...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Task Title</label>
                                <div className="relative group">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="Identify the deliverable..."
                                        className="w-full !pl-10 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-600"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Parent Project</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                        <select
                                            name="project"
                                            required
                                            className="w-full !pl-10 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none"
                                            value={formData.project}
                                            onChange={handleChange}
                                        >
                                            <option value="" className="bg-slate-900">Select Node</option>
                                            {projects.map(p => (
                                                <option key={p._id} value={p._id} className="bg-slate-900">{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Priority Class</label>
                                    <div className="relative group">
                                        <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                        <select
                                            name="priority"
                                            className="w-full !pl-10 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none"
                                            value={formData.priority}
                                            onChange={handleChange}
                                        >
                                            <option value="Low" className="bg-slate-900">Low</option>
                                            <option value="Medium" className="bg-slate-900">Medium</option>
                                            <option value="High" className="bg-slate-900">High</option>
                                            <option value="Critical" className="bg-slate-900">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Technical Brief</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    placeholder="Describe the operational requirements..."
                                    className="w-full px-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-600 font-medium"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Deadline Telemetry</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="date"
                                            name="dueDate"
                                            className="w-full !pl-10 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Operational Status</label>
                                    <select
                                        name="status"
                                        className="w-full px-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="To Do" className="bg-slate-900">To Do</option>
                                        <option value="In Progress" className="bg-slate-900">In Progress</option>
                                        <option value="Completed" className="bg-slate-900">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Assignee Field */}
                            {(['Super Admin', 'Project Manager', 'Project Admin'].includes(user?.role)) && selectedProjectMembers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Assigned Agent</label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                        <select
                                            name="assignedTo"
                                            className="w-full !pl-10 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none"
                                            value={formData.assignedTo || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="" className="bg-slate-900">Select Field Agent</option>
                                            {selectedProjectMembers.map(member => (
                                                <option key={member.user._id} value={member.user._id} className="bg-slate-900">
                                                    {member.user.name} ({member.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                Abort Initialization
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3.5 shadow-xl shadow-primary/20"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Initialize Task
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default CreateTaskModal;

