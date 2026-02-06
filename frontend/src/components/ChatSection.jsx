import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Smile } from 'lucide-react';

const ChatSection = ({ taskId }) => {
    const { api, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/task/${taskId}`);
            setMessages(res.data.data);
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds (simple real-time)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [taskId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post('/messages', {
                text: newMessage,
                taskId
            });
            setNewMessage('');
            fetchMessages(); // Immediate refresh
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleUpdate = async (id) => {
        if (!editingText.trim()) return;
        try {
            await api.put(`/messages/${id}`, { text: editingText });
            setEditingMessageId(null);
            setEditingText('');
            fetchMessages();
        } catch (err) {
            console.error("Failed to update message", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await api.delete(`/messages/${id}`);
            fetchMessages();
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-gray-400">Loading chat...</div>;

    return (
        <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-lg p-3 group relative ${msg.sender._id === user.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                    }`}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="flex items-center">
                                        <span className={`text-xs font-bold mr-2 ${msg.sender._id === user.id ? 'text-blue-200' : 'text-gray-500'
                                            }`}>
                                            {msg.sender.name}
                                        </span>
                                        {msg.sender._id === user.id && !editingMessageId && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingMessageId(msg._id);
                                                        setEditingText(msg.text);
                                                    }}
                                                    className="text-white/70 hover:text-white transition"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(msg._id)}
                                                    className="text-white/70 hover:text-white transition"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] ${msg.sender._id === user.id ? 'text-blue-200' : 'text-gray-400'
                                        }`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {editingMessageId === msg._id ? (
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
                                                onClick={() => setEditingMessageId(null)}
                                                className="text-[10px] font-semibold text-gray-200 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(msg._id)}
                                                className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-1 rounded hover:bg-gray-100"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-gray-900"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={!newMessage.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatSection;
