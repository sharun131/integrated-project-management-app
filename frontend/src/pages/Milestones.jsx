import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Flag, Calendar, CheckCircle, Circle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import CreateMilestoneModal from '../components/CreateMilestoneModal';

const Milestones = () => {
    const { api } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchMilestones();
    }, []);

    const fetchMilestones = async () => {
        try {
            const res = await api.get('/milestones');
            setMilestones(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch milestones", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMilestones = milestones.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="Project Milestones"
                subtitle="High-level tracking of phase transitions and critical deadlines"
            >
                <button
                    className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} />
                    <span>Deploy Milestone</span>
                </button>
            </PageHeader>

            {/* Search */}
            <div className="relative max-w-xl group animate-fade-in-up stagger-1">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                    size={16}
                />
                <input
                    type="text"
                    placeholder="Search by achievement name or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full !pl-11 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
                />
            </div>

            {/* List */}
            <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5 bg-white/[0.02]">
                            <tr className="text-slate-500 text-left">
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Milestone Entity</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Associated Project</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Deployment Date</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredMilestones.length > 0 ? (
                                filteredMilestones.map((milestone, idx) => (
                                    <tr key={milestone._id} className="hover:bg-white/[0.02] transition-colors group animate-fade-in-up" style={{ animationDelay: `${(idx % 5) * 0.05 + 0.3}s` }}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                                    <Flag size={16} />
                                                </div>
                                                <span className="font-bold text-white group-hover:text-primary transition-colors">{milestone.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-slate-400 font-medium">{milestone.project?.name || "—"}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                                <Calendar size={12} className="text-primary" />
                                                {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "UNSET"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${milestone.status === 'Completed'
                                                ? 'bg-success/10 text-success border-success/20'
                                                : 'bg-white/5 text-slate-500 border-white/10'
                                                }`}>
                                                {milestone.status === 'Completed' ? <CheckCircle size={10} /> : <Circle size={10} />}
                                                {milestone.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-32 text-center animate-scale-in">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                                                <Flag size={32} className="text-slate-700" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">No Milestones Recorded</h3>
                                            <p className="text-sm text-slate-500 max-w-sm font-medium italic">Project objectives are currently undefined in this quadrant.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <CreateMilestoneModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onMilestoneCreated={() => {
                        setShowModal(false);
                        fetchMilestones();
                    }}
                />
            )}
        </div>
    );
};


export default Milestones;
