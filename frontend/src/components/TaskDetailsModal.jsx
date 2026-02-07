import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    X,
    MessageSquare,
    Paperclip,
    Calendar,
    CheckCircle,
    User as UserIcon,
    Clock,
    FileText,
    Send,
    Trash2,
    Pencil
} from 'lucide-react';
import Modal from './Modal';

const TaskDetailsModal = ({ isOpen, onClose, taskId }) => {
    const { api, user } = useAuth();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen && taskId) {
            fetchTaskDetails();
        }
    }, [isOpen, taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tasks/${taskId}`);
            setTask(res.data.data);
        } catch (err) {
            console.error("Failed to fetch task details", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await api.post(`/tasks/${taskId}/comments`, { text: commentText });
            // Update local state with new comments
            setTask(prev => ({
                ...prev,
                comments: res.data.data
            }));
            setCommentText('');
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editingText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await api.put(`/tasks/${taskId}/comments/${commentId}`, { text: editingText });
            setTask(prev => ({
                ...prev,
                comments: res.data.data
            }));
            setEditingCommentId(null);
            setEditingText('');
        } catch (err) {
            console.error("Failed to update comment", err);
            alert("Failed to update comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
            setTask(prev => ({
                ...prev,
                comments: res.data.data
            }));
        } catch (err) {
            console.error("Failed to delete comment", err);
            alert("Failed to delete comment");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate upload
        const formData = {
            name: file.name,
            url: URL.createObjectURL(file) // Mock URL for demo
        };

        try {
            const res = await api.post(`/tasks/${taskId}/attachments`, formData);
            setTask(prev => ({
                ...prev,
                attachments: res.data.data
            }));
        } catch (err) {
            console.error("Failed to upload file", err);
            alert("Failed to upload file. Please try again.");
            e.target.value = null; // Reset input
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFile = async (attachmentId, e) => {
        if (e) e.stopPropagation();

        if (!attachmentId) {
            alert("Error: File ID is missing. Cannot delete.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this file?")) return;

        try {
            const deleteUrl = `/tasks/${taskId}/attachments/${attachmentId}`;
            const res = await api.delete(deleteUrl);

            setTask(prev => ({
                ...prev,
                attachments: res.data.data
            }));
        } catch (err) {
            console.error("Failed to delete file", err);
            const errorMsg = err.response?.data?.error || "Failed to delete file.";
            alert(`Error: ${errorMsg}`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task?.project?.name || "Task Node"}>
            <div className="flex flex-col h-[65vh]">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Telemetry...</p>
                    </div>
                ) : (
                    <>
                        {/* Status Strip */}
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${task?.priority === 'High' ? 'text-red-500 bg-red-500' :
                                task?.priority === 'Medium' ? 'text-amber-500 bg-amber-500' : 'text-green-500 bg-green-500'
                                }`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Segment: {task?.priority}</span>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-8 shrink-0 border border-white/5">
                            {['overview', 'comments', 'files'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {tab}
                                        {tab === 'comments' && task?.comments?.length > 0 &&
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">{task.comments.length}</span>
                                        }
                                        {tab === 'files' && task?.attachments?.length > 0 &&
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">{task.attachments.length}</span>
                                        }
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-10 animate-fade-in-up">
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">{task?.title}</h2>
                                        <div className="flex flex-wrap gap-3 mb-8">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm ${task?.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                                                }`}>
                                                {task?.status}
                                            </span>
                                            {task?.dueDate && (
                                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                                                    <Calendar size={12} className="text-primary" />
                                                    T-Minus {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5">{task?.description || "No project documentation available for this node."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Operational Agent</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 group">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    {task?.assignedTo?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-xs font-bold text-white tracking-wide">{task?.assignedTo?.name || "Unassigned Unit"}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Resource Estimate</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                                <Clock size={16} className="text-primary" />
                                                <span className="text-xs font-bold text-white tracking-wide">{task?.estimatedHours || 0} Cycles (Hrs)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COMMENTS TAB */}
                            {activeTab === 'comments' && (
                                <div className="flex flex-col h-full animate-fade-in-up">
                                    <div className="flex-1 space-y-6 mb-8 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                                        {task?.comments?.length > 0 ? (
                                            task.comments.map((comment, idx) => (
                                                <div key={idx} className="flex gap-4 group">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center font-black text-[10px] shrink-0 group-hover:border-primary/50 transition-colors">
                                                        {comment.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 w-full relative group/comment">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">{comment.user?.name || "Unknown Unit"}</span>
                                                                {comment.user?._id === user?._id && !editingCommentId && (
                                                                    <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingCommentId(comment._id);
                                                                                setEditingText(comment.text);
                                                                            }}
                                                                            className="text-slate-500 hover:text-primary transition"
                                                                        >
                                                                            <Pencil size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteComment(comment._id)}
                                                                            className="text-slate-500 hover:text-red-500 transition"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {editingCommentId === comment._id ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    className="w-full text-xs !bg-slate-900 border !border-white/10 rounded-xl p-3 focus:ring-1 focus:ring-primary/40 focus:outline-none text-white font-medium"
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    rows={2}
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-3">
                                                                    <button
                                                                        onClick={() => setEditingCommentId(null)}
                                                                        className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                                                    >
                                                                        Abort
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateComment(comment._id)}
                                                                        disabled={isSubmitting || !editingText.trim()}
                                                                        className="text-[9px] font-black uppercase tracking-widest text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                                                                    >
                                                                        Transmit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{comment.text}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <MessageSquare size={32} className="text-slate-700 mx-auto mb-4 opacity-50" />
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest italic">Communication channel silent.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Input Area */}
                                    {user?.role !== 'Super Admin' && (
                                        <form onSubmit={handlePostComment} className="relative mt-auto shrink-0 animate-slide-up">
                                            <input
                                                type="text"
                                                placeholder="Enter data for transmission..."
                                                className="w-full !pr-14 !pl-5 py-4 !bg-white/5 border border-white/10 !rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/10 transition-all placeholder-slate-500 font-bold"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!commentText.trim() || isSubmitting}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* FILES TAB */}
                            {activeTab === 'files' && (
                                <div className="space-y-8 animate-fade-in-up">
                                    {user?.role !== 'Super Admin' && (
                                        <div className="border-2 border-dashed border-white/5 bg-white/[0.02] rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer relative group overflow-hidden">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                                                    {isUploading ? <Clock size={24} className="animate-spin" /> : <Paperclip size={28} />}
                                                </div>
                                                <p className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{isUploading ? 'Encrypting Packet...' : 'Upload Telemetry'}</p>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">DRAG ASSETS HERE OR CLICK</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3 pb-8">
                                        {task?.attachments?.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center border border-white/5 shrink-0 group-hover:text-primary transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate pr-4">{file.name}</p>
                                                        <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-tighter">
                                                            Origin: {file.uploadedBy?.name || 'Unknown Unit'} • {new Date(file.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <a href={file.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                                                        Access
                                                    </a>
                                                    <button
                                                        onClick={(e) => handleDeleteFile(file._id, e)}
                                                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {task?.attachments?.length === 0 && (
                                            <div className="text-center py-10 opacity-50">
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest italic">No external data linked.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;

