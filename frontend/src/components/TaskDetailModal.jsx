import { useState } from 'react';
import { X, MessageSquare, Paperclip, Info } from 'lucide-react';
import ChatSection from './ChatSection';
import FileSection from './FileSection';

const TaskDetailModal = ({ isOpen, onClose, task }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{task.project?.name} &gt; {task.status}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 mr-4 transition ${activeTab === 'details'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Info size={16} className="mr-2" />
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 mr-4 transition ${activeTab === 'chat'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MessageSquare size={16} className="mr-2" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'files'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Paperclip size={16} className="mr-2" />
                        Files
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Description</h3>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 text-gray-600 leading-relaxed">
                                    {task.description || 'No description provided.'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Scheduling</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Start Date:</span>
                                            <span className="font-medium">-</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Due Date:</span>
                                            <span className="font-medium text-red-600">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Assignment</h3>
                                    <div className="flex items-center mt-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs mr-3">
                                            {task.assignedTo?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{task.assignedTo?.name || 'Unassigned'}</p>
                                            <p className="text-xs text-gray-400">{task.assignedTo?.role || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <ChatSection taskId={task._id} />
                    )}

                    {activeTab === 'files' && (
                        <FileSection taskId={task._id} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
