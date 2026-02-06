
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp,
    Briefcase,
    CheckSquare,
    Clock,
    AlertTriangle,
    Flag,
    Users
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const ManagerDashboard = () => {
    const { user, api } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/role-dashboard/manager');
                setStats(res.data.data);
            } catch (err) {
                console.error('Error fetching manager stats:', err);
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

    // --- Data Preparation ---
    const milestoneData = [
        { name: 'Completed', value: stats?.milestoneStats?.completed || 0, color: '#10b981' },
        { name: 'Pending', value: stats?.milestoneStats?.pending || 0, color: '#f59e0b' },
        { name: 'Delayed', value: stats?.milestoneStats?.delayed || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-10 pb-10">
            {/* ================= Header ================= */}
            <div className="animate-fade-in-up">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Manager Dashboard <span className="text-primary">Overview</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Monitor your projects, team workload, and critical deadlines.
                </p>
            </div>

            {/* ================= KPI Grid ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="My Projects"
                    value={stats?.totalProjects || 0}
                    icon={Briefcase}
                    gradient="from-blue-600 to-blue-400"
                    subText="Under management"
                    delay="stagger-1"
                />
                <KPICard
                    title="Team Workload"
                    value={stats?.teamWorkload?.length || 0}
                    icon={Users}
                    gradient="from-indigo-600 to-indigo-400"
                    subText="Active Members"
                    delay="stagger-2"
                />
                <KPICard
                    title="Overdue Tasks"
                    value={stats?.overdueTasks?.length || 0}
                    icon={AlertTriangle}
                    gradient="from-red-600 to-red-400"
                    subText="Action Required"
                    delay="stagger-3"
                />
                <KPICard
                    title="Milestones"
                    value={stats?.milestoneStats?.pending || 0}
                    icon={Flag}
                    gradient="from-amber-600 to-amber-400"
                    subText="Pending completion"
                    delay="stagger-4"
                />
            </div>

            {/* ================= Charts Section ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up stagger-2">

                {/* Project Progress List */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">Project Progress</h3>
                        <TrendingUp size={16} className="text-primary" />
                    </div>

                    <div className="space-y-6 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                        {stats?.projectProgress?.map(p => (
                            <div key={p.id} className="group">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-white group-hover:text-primary transition-colors">{p.name}</span>
                                    <span className="text-slate-400 font-mono">{p.progress}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-1000 ${p.progress === 100 ? 'bg-success' :
                                                p.status === 'On Hold' ? 'bg-amber-500' : 'bg-primary'
                                            }`}
                                        style={{ width: `${p.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-500 uppercase font-bold">
                                    <span>{p.status}</span>
                                    <span>{p.completedTasks}/{p.totalTasks} Tasks</span>
                                </div>
                            </div>
                        ))}
                        {(!stats?.projectProgress || stats.projectProgress.length === 0) && (
                            <div className="text-center text-slate-600 italic py-10">No projects loaded</div>
                        )}
                    </div>
                </div>

                {/* Milestones Status */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white tracking-tight">Milestone Health</h3>
                        <Flag size={16} className="text-amber-500" />
                    </div>
                    <div className="h-64 w-full">
                        {milestoneData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={milestoneData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {milestoneData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <Flag size={32} className="mb-2 opacity-30" />
                                <span className="text-sm font-medium">No milestone data</span>
                            </div>
                        )}

                        {/* Legend Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-white">{stats?.milestoneStats?.completed || 0}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= Row 3: Team Workload & Overdue ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up stagger-3">

                {/* Team Workload Chart */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white tracking-tight">Team Workload</h3>
                        <Users size={16} className="text-indigo-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.teamWorkload || []} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#fff', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="tasks" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Overdue Tasks List */}
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-red-500/5">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            Critical Overdue
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {stats?.overdueTasks?.length > 0 ? (
                            stats.overdueTasks.map(task => (
                                <div key={task._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm truncate group-hover:text-red-400 transition-colors">{task.title || 'Untitled Task'}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {task.assignedTo && (
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white" title={task.assignedTo.name}>
                                                {task.assignedTo.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold rounded">Overdue</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-600 font-medium italic">
                                <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-500 mb-2">
                                    <CheckSquare size={20} />
                                </div>
                                <p>No overdue tasks!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reuse KPICard from DashboardHome
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

export default ManagerDashboard;
