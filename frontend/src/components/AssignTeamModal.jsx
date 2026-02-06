import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, Search, UserPlus, Users, Loader2 } from 'lucide-react';
import Modal from './Modal';

const AssignTeamModal = ({ isOpen, onClose, project, onTeamUpdated }) => {
    const { api } = useAuth();
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            if (project?.team) {
                setSelectedUsers(project.team.map(member => member.user._id || member.user));
            }
        }
    }, [isOpen, project]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setAllUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            // Transform selectedUsers into the format expected by the backend
            // For now, we'll just send the user IDs
            const team = selectedUsers.map(userId => ({ user: userId }));
            await api.put(`/projects/${project._id}`, { team });
            onTeamUpdated();
            onClose();
        } catch (err) {
            console.error('Failed to update team', err);
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Operational Assignment">
            <div className="space-y-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search agents by name or identification..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full !pl-10 pr-4 py-2.5 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
                    />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-10 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving personnel list...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => {
                            const isSelected = selectedUsers.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{user.role}</p>
                                        </div>
                                    </div>
                                    {isSelected ? (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-700 hover:border-slate-500 transition-colors" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center py-6 text-xs text-slate-500 italic">No matches in personnel database.</p>
                    )}
                </div>

                <div className="flex gap-3 pt-6 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        Abort
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3"
                    >
                        {updating ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Save Updates
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignTeamModal;
