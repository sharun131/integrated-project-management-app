
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle,
    Clock,
    Calendar,
    Zap,
    Bell,
    CheckSquare
} from 'lucide-react';

const MemberDashboard = () => {
    const { user, api } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/role-dashboard/member');
                setStats(res.data.data);
            } catch (err) {
                console.error('Error fetching member stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [api]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* ================= Header ================= */}
            <div className="animate-fade-in-up">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Hello, <span className="text-primary">{user?.name}</span>!
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Here is your personal work summary and upcoming deadlines.
                </p>
            </div>

            {/* ================= KPI Stats ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Assigned Tasks"
                    value={stats?.taskCounts?.total || 0}
                    icon={CheckSquare}
                    gradient="from-blue-600 to-blue-400"
                    subText={`${stats?.taskCounts?.pending} Pending`}
                    delay="stagger-1"
                />
                <KPICard
                    title="Completed"
                    value={stats?.taskCounts?.completed || 0}
                    icon={CheckCircle}
                    gradient="from-emerald-600 to-emerald-400"
                    subText="Great job!"
                    delay="stagger-2"
                />
                <KPICard
                    title="Upcoming Deadlines"
                    value={stats?.upcomingDeadlines?.length || 0}
                    icon={Calendar}
                    gradient="from-amber-600 to-amber-400"
                    subText="Next 7 Days"
                    delay="stagger-3"
                />
                <KPICard
                    title="Hours Logged"
                    value={stats?.totalHours || 0}
                    icon={Clock}
                    gradient="from-indigo-600 to-indigo-400"
                    subText="Total time tracked"
                    delay="stagger-4"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up stagger-2">

                {/* Main Content: My Tasks (Takes 2 cols) */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Zap size={18} className="text-primary" />
                            My Active Tasks
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {stats?.myTasks?.length > 0 ? (
                            stats.myTasks.map(task => (
                                <div key={task._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${task.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                task.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                            }`}>
                                            <span className="text-[10px] font-black uppercase">{task.priority.slice(0, 3)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{task.title}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">{task.projectName}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-mono text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${task.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                                                'bg-white/5 text-slate-400'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-600 font-medium italic">No active tasks assigned</div>
                        )}
                    </div>
                </div>

                {/* Side Content: Deadlines & Notifications (Takes 1 col) */}
                <div className="space-y-8">
                    {/* Upcoming Deadlines */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-white/5 bg-amber-500/5">
                            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                <Calendar size={16} className="text-amber-500" />
                                Upcoming Deadlines
                            </h3>
                        </div>
                        <div className="p-2">
                            {stats?.upcomingDeadlines?.length > 0 ? (
                                stats.upcomingDeadlines.map(d => (
                                    <div key={d.id} className="p-3 mb-1 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between">
                                        <span className="text-sm text-slate-300 truncate w-32 font-medium">{d.title}</span>
                                        <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">
                                            {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-600 text-sm">No impending deadlines</div>
                            )}
                        </div>
                    </div>

                    {/* Notifications Panel (Mock UI for now, as usually handles by bell) */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-white/5 bg-primary/5">
                            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                <Bell size={16} className="text-primary" />
                                Recent Updates
                            </h3>
                        </div>
                        <div className="p-6 text-center text-slate-600 text-xs italic">
                            Check your notifications bell for real-time updates on task assignments and comments.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reuse KPICard
const KPICard = ({ title, value, icon: Icon, gradient, subText, delay }) => (
    <div className={`glass-card p-6 animate-fade-in-up ${delay}`}>
        <div className="flex items-start justify-between">
            <div className="space-y-3">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">{title}</p>
                <h4 className="text-3xl font-black text-white">{value}</h4>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{subText}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform hover:scale-110 duration-300 ${gradient}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

export default MemberDashboard;
