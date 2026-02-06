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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-24 pb-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task?.priority === 'High' ? 'bg-red-500' :
                            task?.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                            }`} />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{task?.project?.name}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 px-6">
                            {['overview', 'comments', 'files'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {tab === 'comments' && task?.comments?.length > 0 &&
                                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{task.comments.length}</span>
                                    }
                                    {tab === 'files' && task?.attachments?.length > 0 &&
                                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{task.attachments.length}</span>
                                    }
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{task?.title}</h2>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${task?.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {task?.status}
                                            </span>
                                            {task?.dueDate && (
                                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    <Calendar size={12} />
                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 whitespace-pre-wrap">{task?.description || "No description provided."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Assigned To</label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {task?.assignedTo?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{task?.assignedTo?.name || "Unassigned"}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Est. Hours</label>
                                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium">
                                                <Clock size={16} className="text-gray-400" />
                                                {task?.estimatedHours || 0} hrs
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COMMENTS TAB */}
                            {activeTab === 'comments' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-4 mb-4">
                                        {task?.comments?.length > 0 ? (
                                            task.comments.map((comment, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {comment.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3 w-full group relative">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="flex items-center">
                                                                <span className="text-xs font-bold text-gray-900 mr-2">{comment.user?.name || "User"}</span>
                                                                {comment.user?._id === user?._id && !editingCommentId && (
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingCommentId(comment._id);
                                                                                setEditingText(comment.text);
                                                                            }}
                                                                            className="text-gray-400 hover:text-blue-500 transition"
                                                                            title="Edit comment"
                                                                        >
                                                                            <Pencil size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteComment(comment._id)}
                                                                            className="text-gray-400 hover:text-red-500 transition"
                                                                            title="Delete comment"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        {editingCommentId === comment._id ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    className="w-full text-sm bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    rows={2}
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setEditingCommentId(null)}
                                                                        className="text-[10px] font-semibold text-gray-500 hover:text-gray-700"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateComment(comment._id)}
                                                                        disabled={isSubmitting || !editingText.trim()}
                                                                        className="text-[10px] font-semibold text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700">{comment.text}</p>
                                                        )}
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first!</div>
                                        )}
                                    </div>
                                    {user?.role !== 'Super Admin' && (
                                        <form onSubmit={handlePostComment} className="relative mt-auto">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />           <button
                                                type="submit"
                                                disabled={!commentText.trim() || isSubmitting}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* FILES TAB */}
                            {activeTab === 'files' && (
                                <div>
                                    {user?.role !== 'Super Admin' && (
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-blue-400 transition cursor-pointer relative group">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                {isUploading ? <div className="animate-spin border-2 border-current border-t-transparent rounded-full w-6 h-6" /> : <Paperclip size={24} />}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                                            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {task?.attachments?.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-xs text-gray-500">Uploaded by {file.uploadedBy?.name || 'User'} on {new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">Download</a>
                                                    <button
                                                        onClick={(e) => handleDeleteFile(file._id, e)}
                                                        className="text-gray-400 hover:text-red-500 transition"
                                                        title="Delete file"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {task?.attachments?.length === 0 && (
                                            <div className="text-center text-gray-400 text-sm py-4">No files uploaded yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskDetailsModal;
