import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Briefcase, Calendar, AlertCircle, ChevronDown } from 'lucide-react';

const ManageProjectModal = ({ isOpen, onClose, onProjectUpdated, project = null }) => {
    const { api } = useAuth();
    const isEditing = !!project;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Planning',
        priority: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                status: project.status || 'Planning',
                priority: project.priority || 'Medium'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                status: 'Planning',
                priority: 'Medium'
            });
        }
    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditing) {
                await api.put(`/projects/${project._id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            onProjectUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} project`);
        } finally {
            setLoading(false);
        }
    };

    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Active', 'On Hold', 'Completed', 'Archived', 'Planning', 'Pending Approval'];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="glass-card w-full max-w-lg border-white/10 shadow-2xl animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-none">
                                {isEditing ? 'Calibrate Node' : 'Initialize Node'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">
                                {isEditing ? 'Modifying project parameters' : 'New project deployment'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-shake">
                            <AlertCircle size={18} />
                            <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter project title..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Overview</label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the mission objectives..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
                            <div className="relative group">
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                                >
                                    {priorities.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Status</label>
                            <div className="relative group">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                                >
                                    {statuses.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={12} className="text-primary" /> Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={12} className="text-indigo-400" /> End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                isEditing ? 'Confirm Core Polish' : 'Deploy Node'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageProjectModal;
