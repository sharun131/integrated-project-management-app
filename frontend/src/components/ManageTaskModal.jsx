import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    X, Briefcase, Calendar, AlertCircle, ChevronDown, CheckCircle2,
    Circle, Plus, Trash2, Link as LinkIcon, Loader2, MessageSquare, Paperclip,
    FileText, Download, Send, User
} from 'lucide-react';
import Modal from './Modal';

const ManageTaskModal = ({ isOpen, onClose, onTaskUpdated, task = null }) => {
    const { api, user } = useAuth();
    const isEditing = !!task;
    const isAdminOrPM = ['Super Admin', 'Project Admin', 'Project Manager'].some(
        role => role.toLowerCase() === user.role?.toLowerCase()
    );

    const [activeTab, setActiveTab] = useState('overview'); // overview, comments, files

    const [projects, setProjects] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [members, setMembers] = useState([]);

    // Data States
    const [comments, setComments] = useState([]);
    const [files, setFiles] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const commentsEndRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        priority: 'Medium',
        dueDate: '',
        status: 'To Do',
        assignedTo: '',
        subtasks: [],
        dependencies: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (task) {
                fetchComments();
                fetchFiles();
            }
        }
    }, [isOpen, task]);

    useEffect(() => {
        scrollToBottom();
    }, [comments, activeTab]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchInitialData = async () => {
        try {
            setFetching(true);
            const res = await api.get('/projects');
            setProjects(res.data.data);

            if (task) {
                setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    project: task.project?._id || task.project || '',
                    priority: task.priority || 'Medium',
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                    status: task.status || 'To Do',
                    assignedTo: task.assignedTo?._id || task.assignedTo || '',
                    subtasks: task.subtasks || [],
                    dependencies: task.dependencies?.map(d => d._id || d) || []
                });
            } else if (res.data.data.length > 0) {
                setFormData(prev => ({ ...prev, project: res.data.data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to load initial data", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (formData.project) {
            const proj = projects.find(p => p._id === formData.project);
            if (proj && proj.team) {
                setMembers(proj.team.filter(m => m.user).map(m => m.user));
            }
            fetchProjectTasks(formData.project);
        }
    }, [formData.project, projects]);

    const fetchProjectTasks = async (projectId) => {
        try {
            const res = await api.get(`/tasks?projectId=${projectId}`);
            setAvailableTasks(res.data.data.filter(t => t._id !== task?._id));
        } catch (err) {
            console.error("Failed to load project tasks", err);
        }
    };

    const fetchComments = async () => {
        if (!task) return;
        try {
            // Task model has comments embedded, so we might need to re-fetch the task to get latest
            // OR if there is a specific endpoint. Based on controllers, we have addTaskComment which returns updated comments.
            // But we don't have a GET /comments endpoint, we rely on GET /tasks/:id
            const res = await api.get(`/tasks/${task._id}`);
            setComments(res.data.data.comments || []);
        } catch (err) {
            console.error("Failed to load comments", err);
        }
    };

    const fetchFiles = async () => {
        if (!task) return;
        try {
            const res = await api.get(`/files/task/${task._id}`);
            setFiles(res.data.data || []);
        } catch (err) {
            console.error("Failed to load files", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ... Subtask and Dependency handlers ...
    const handleAddSubtask = () => {
        setFormData({
            ...formData,
            subtasks: [...formData.subtasks, { title: '', completed: false }]
        });
    };

    const handleSubtaskChange = (index, value) => {
        const newSubtasks = [...formData.subtasks];
        newSubtasks[index].title = value;
        setFormData({ ...formData, subtasks: newSubtasks });
    };

    const handleToggleSubtask = (index) => {
        const newSubtasks = [...formData.subtasks];
        newSubtasks[index].completed = !newSubtasks[index].completed;
        setFormData({ ...formData, subtasks: newSubtasks });
    };

    const handleRemoveSubtask = (index) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter((_, i) => i !== index)
        });
    };

    const handleToggleDependency = (taskId) => {
        const newDependencies = formData.dependencies.includes(taskId)
            ? formData.dependencies.filter(id => id !== taskId)
            : [...formData.dependencies, taskId];
        setFormData({ ...formData, dependencies: newDependencies });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await api.put(`/tasks/${task._id}`, formData);
            } else {
                await api.post('/tasks', formData);
            }
            onTaskUpdated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} task`);
        } finally {
            setLoading(false);
        }
    };

    // --- Comment Handlers ---
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
            setComments(res.data.data); // Controller returns updated comments array
            setNewComment('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to post comment');
        }
    };

    // --- File Handlers ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('taskId', task._id);

        setUploading(true);
        try {
            await api.post('/files', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileDelete = async (fileId) => {
        if (!window.confirm("Delete this file permanently?")) return;
        try {
            await api.delete(`/files/${fileId}`);
            setFiles(files.filter(f => f._id !== fileId));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete file');
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
            alert('Failed to download file');
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
            <div className={`glass-card w-full max-w-3xl border-white/10 shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300`}>
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-none">
                                {isEditing ? 'Task Operations' : 'Initialize Task Node'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">
                                {isAdminOrPM ? 'Full system access granted' : 'Restricted operational access'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs (Only if editing) */}
                {isEditing && (
                    <div className="flex items-center border-b border-white/5 bg-white/[0.01]">
                        {[
                            { id: 'overview', icon: Briefcase, label: 'Overview' },
                            { id: 'comments', icon: MessageSquare, label: 'Comms', count: comments.length },
                            { id: 'files', icon: Paperclip, label: 'Files', count: files.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab.id
                                    ? 'border-primary text-white bg-white/5'
                                    : 'border-transparent text-slate-500 hover:text-white hover:bg-white/[0.02]'
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {/* OVERVIEW TAB */}
                    <div className={`p-8 space-y-8 ${activeTab === 'overview' ? 'block' : 'hidden'}`}>
                        <form id="task-form" onSubmit={handleSubmit}>
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        readOnly={!isAdminOrPM}
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter task title..."
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 ${!isAdminOrPM ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Brief</label>
                                    <textarea
                                        name="description"
                                        readOnly={!isAdminOrPM}
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the task parameters..."
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 resize-none ${!isAdminOrPM ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Context</label>
                                    <select
                                        name="project"
                                        required
                                        disabled={!isAdminOrPM || isEditing}
                                        value={formData.project}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                    >
                                        {projects.map(p => <option key={p._id} value={p._id} className="bg-slate-900">{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Personnel</label>
                                    <select
                                        name="assignedTo"
                                        disabled={!isAdminOrPM}
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Unassigned</option>
                                        {members.map(m => <option key={m._id} value={m._id} className="bg-slate-900">{m.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Layer</label>
                                    <select
                                        name="priority"
                                        disabled={!isAdminOrPM}
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                    >
                                        {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                                    >
                                        {['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-primary" /> Due Date Telemetry
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        readOnly={!isAdminOrPM}
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark] ${!isAdminOrPM ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Subtasks - PM/Admin Only */}
                            {isAdminOrPM && (
                                <div className="space-y-4 pt-6 border-t border-white/5 mt-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Subtasks</label>
                                        <button type="button" onClick={handleAddSubtask} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary hover:text-white transition-colors">
                                            <Plus size={14} /> Add Component
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.subtasks.map((sub, idx) => (
                                            <div key={idx} className="flex items-center gap-3 animate-fade-in-up">
                                                <button type="button" onClick={() => handleToggleSubtask(idx)} className="text-slate-500 hover:text-primary transition-colors">
                                                    {sub.completed ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} />}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={sub.title}
                                                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                                                    placeholder="Subtask objective..."
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                                />
                                                <button type="button" onClick={() => handleRemoveSubtask(idx)} className="text-slate-600 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dependencies - PM/Admin Only */}
                            {isAdminOrPM && availableTasks.length > 0 && (
                                <div className="space-y-4 pt-6 border-t border-white/5 mt-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <LinkIcon size={12} className="text-primary" /> Logistical Dependencies
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTasks.map(t => (
                                            <button
                                                key={t._id}
                                                type="button"
                                                onClick={() => handleToggleDependency(t._id)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.dependencies.includes(t._id)
                                                    ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                                                    }`}
                                            >
                                                {t.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* COMMENTS TAB */}
                    <div className={`flex flex-col h-full ${activeTab === 'comments' ? 'block' : 'hidden'}`}>
                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                                    <MessageSquare size={48} className="mb-4" />
                                    <p className="text-sm font-medium">No comms logged yet.</p>
                                </div>
                            ) : (
                                comments.map((comment, idx) => (
                                    <div key={idx || comment._id} className={`flex gap-3 animate-fade-in-up ${comment.user?._id === user._id ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${comment.user?._id === user._id ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>
                                            {comment.user?.name?.charAt(0) || <User size={14} />}
                                        </div>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${comment.user?._id === user._id ? 'bg-primary/20 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none'}`}>
                                            <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                                                <span>{comment.user?.name || "Unknown"}</span>
                                                <span>•</span>
                                                <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="leading-relaxed">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 mt-auto">
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FILES TAB */}
                    <div className={`p-8 space-y-6 ${activeTab === 'files' ? 'block' : 'hidden'}`}>
                        {/* Upload Zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            {uploading ? (
                                <Loader2 size={32} className="animate-spin mb-2" />
                            ) : (
                                <Paperclip size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                            )}
                            <p className="text-sm font-bold uppercase tracking-wider">{uploading ? 'Uploading...' : 'Click to attach file'}</p>
                            <p className="text-[10px] opacity-60 mt-1">Images, PDF, Docx (Max 10MB)</p>
                        </div>

                        {/* File List */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Attached Assets</h3>
                            {files.length === 0 ? (
                                <p className="text-sm text-slate-600 italic ml-1">No files attached to this node.</p>
                            ) : (
                                files.map((file) => (
                                    <div key={file._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group animate-fade-in-up">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-tight">{file.originalName}</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                                                    <span>{(file.fileSize / 1024).toFixed(0)} KB</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                    <span>{file.uploadedBy?.name || 'System'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDownload(file._id, file.originalName)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-primary transition-colors"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                            {(isAdminOrPM || file.uploadedBy?._id === user._id) && (
                                                <button
                                                    onClick={() => handleFileDelete(file._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer (Only shown in Overview tab) */}
                {activeTab === 'overview' && (
                    <div className="p-8 border-t border-white/5 shrink-0 bg-white/[0.01]">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                form="task-form"
                                disabled={loading}
                                className="flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    isEditing ? 'Confirm Parameters' : 'Deploy Task'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTaskModal;
