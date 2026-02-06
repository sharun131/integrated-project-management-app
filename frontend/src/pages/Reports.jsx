import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, Loader } from 'lucide-react';

const Reports = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [dateRange, setDateRange] = useState('month');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, tasksRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/tasks')
                ]);
                setProjects(projectsRes.data.data || []);
                setTasks(tasksRes.data.data || []);
            } catch (err) {
                console.error("Error fetching report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    // ================== CALCULATIONS ==================
    const totalProjects = projects.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const activeMembers = new Set(tasks.map(t => t.assignedTo?._id || t.assignedTo).filter(Boolean)).size;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const projectProgressData = projects.map(p => {
        const pTasks = tasks.filter(t => (t.project?._id || t.project) === p._id);
        const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
        const progress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;
        return {
            name: p.name,
            progress,
            tasks: pTasks.length
        };
    }).sort((a, b) => b.tasks - a.tasks).slice(0, 5);

    const statusData = [
        { name: 'Plan', value: tasks.filter(t => t.status === 'To Do').length },
        { name: 'Active', value: tasks.filter(t => t.status === 'In Progress').length },
        { name: 'Final', value: tasks.filter(t => t.status === 'Completed').length },
    ];

    const priorityData = [
        { name: 'Critical', value: tasks.filter(t => ['High', 'Critical'].includes(t.priority)).length, fill: '#6366f1' },
        { name: 'Stable', value: tasks.filter(t => t.priority === 'Low').length, fill: '#10b981' },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Intelligence Hub</h1>
                    <p className="text-slate-500 font-medium mt-2 italic">Real-time analytical decryption and project telemetry</p>
                </div>
                <button className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in">
                    <Download size={18} />
                    <span>Export Telemetry</span>
                </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex gap-2 animate-fade-in-up stagger-1">
                {['week', 'month', 'quarter', 'year'].map((range, idx) => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === range
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'
                            }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up stagger-2">
                <MetricCard label="Total Nodes" value={totalProjects} icon={<Download />} color="text-indigo-500" />
                <MetricCard label="Active Operations" value={tasks.length} icon={<Download />} color="text-primary" />
                <MetricCard label="Resolved Paths" value={completedTasks} icon={<Download />} color="text-success" />
                <MetricCard label="Efficiency Rating" value={`${completionRate}%`} icon={<Download />} color="text-purple-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-3">
                {/* Project Progress */}
                <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Node Development Progress (%)</h3>
                    <div className="h-64">
                        {projectProgressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectProgressData} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" stroke="#475569" domain={[0, 100]} fontSize={10} tick={{ fill: '#475569' }} />
                                    <YAxis dataKey="name" type="category" stroke="#475569" width={80} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="progress" fill="rgba(79, 70, 229, 0.8)" radius={[0, 8, 8, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Zero-Data State</div>
                        )}
                    </div>
                </div>

                {/* Task Status Distribution */}
                <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Operational Status Hierarchy</h3>
                    <div className="h-64">
                        {tasks.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#475569' }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : (index === 1 ? '#4f46e5' : '#334155')} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Zero-Data State</div>
                        )}
                    </div>
                </div>

                {/* Task Priorities (Pie) */}
                <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Priority Distribution Vector</h3>
                    <div className="h-64 flex justify-center">
                        {priorityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        stroke="none"
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Zero-Data State</div>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="glass-card p-8 border-white/5 flex flex-col justify-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">System Performance Summary</h3>
                    <div className="space-y-8">
                        <ProgressBar label="Network Saturation" percentage={completionRate} color="bg-primary" />
                        <ProgressBar label="Active Node Ratio" percentage={projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Active').length / projects.length) * 100) : 0} color="bg-success" />
                        <ProgressBar label="Critical Alert Ratio" percentage={tasks.length > 0 ? Math.round((tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length / tasks.length) * 100) : 0} color="bg-indigo-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ label, value, color }) => (
    <div className="glass-card p-6 border-white/5 group hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/20">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 group-hover:text-slate-400 transition-colors">{label}</p>
        <h3 className={`text-4xl font-black ${color} group-hover:scale-105 transition-transform origin-left`}>{value}</h3>
    </div>
);

const ProgressBar = ({ label, percentage, color }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="font-bold text-white text-[11px] tracking-widest">{percentage}%</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.4)] ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);


export default Reports;
