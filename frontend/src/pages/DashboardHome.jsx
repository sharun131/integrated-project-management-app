import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  AlertTriangle,
  MoreVertical
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
  CartesianGrid,
  Legend
} from 'recharts';

const DashboardHome = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
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

  // Prepare Data for Charts
  const projectData = [
    { name: 'Active', value: stats?.projectCounts?.active || 0, color: '#4f46e5' },
    { name: 'Completed', value: stats?.projectCounts?.completed || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  const taskData = [
    { name: 'Completed', value: stats?.taskCounts?.completed || 0 },
    { name: 'Pending', value: stats?.taskCounts?.pending || 0 },
    { name: 'High Priority', value: stats?.taskCounts?.highPriority || 0 },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* ================= Header ================= */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, <span className="text-primary">{user?.name}</span> 👋
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Workspace insights and real-time project metrics
        </p>
      </div>

      {/* ================= KPI Grid ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value={stats?.projectCounts?.active || 0}
          icon={Briefcase}
          gradient="from-blue-600 to-blue-400"
          subText={`${stats?.projectCounts?.total || 0} Total Projects`}
          delay="stagger-1"
        />
        <KPICard
          title="Total Tasks"
          value={stats?.taskCounts?.total || 0}
          icon={CheckSquare}
          gradient="from-indigo-600 to-indigo-400"
          subText="Across all projects"
          delay="stagger-2"
        />
        <KPICard
          title="Pending Tasks"
          value={stats?.taskCounts?.pending || 0}
          icon={Clock}
          gradient="from-amber-600 to-amber-400"
          subText="Needs attention"
          delay="stagger-3"
        />
        <KPICard
          title="Urgent Items"
          value={stats?.taskCounts?.highPriority || 0}
          icon={AlertTriangle}
          gradient="from-red-600 to-red-400"
          subText="High priority tasks"
          delay="stagger-4"
        />

        {/* Admin Issue Insights */}
        {user?.role === 'Super Admin' && (
          <>
            <KPICard
              title="Pending Issues"
              value={stats?.issueCounts?.pending || 0}
              icon={AlertTriangle}
              gradient="from-orange-600 to-orange-400"
              subText="Reported Bugs"
              delay="stagger-5"
            />
            <KPICard
              title="Rectified Issues"
              value={stats?.issueCounts?.rectified || 0}
              icon={CheckSquare}
              gradient="from-emerald-600 to-emerald-400"
              subText="Resolved Bugs"
              delay="stagger-6"
            />
          </>
        )}
      </div>

      {/* ================= Charts Section ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up stagger-2">
        {/* Project Status Chart */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Project Health</h3>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
          </div>
          <div className="h-64 w-full">
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <Briefcase size={32} className="mb-2 opacity-30" />
                <span className="text-sm font-medium">No project data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Task Workload Chart */}
        <div className="glass-card p-8 font-bold">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Workload Distribution</h3>
            <MoreVertical size={16} className="text-slate-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={45}>
                  {
                    taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#ef4444' : (index === 1 ? '#f59e0b' : '#4f46e5')} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= Recent Activity ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in-up stagger-3">
        {/* Recent Projects */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Projects</h3>
            <button className="text-xs text-primary font-bold uppercase tracking-wider hover:text-white transition-colors">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map(project => (
                <div key={project._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${project.status === 'Active' ? 'bg-primary/20 text-primary border border-primary/30' :
                    project.status === 'Completed' ? 'bg-success/20 text-success border border-success/30' :
                      'bg-white/10 text-slate-400 border border-white/10'
                    }`}>
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-600 font-medium italic">No active projects found</div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Tasks</h3>
            <button className="text-xs text-primary font-bold uppercase tracking-wider hover:text-white transition-colors">Workspace</button>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map(task => (
                <div key={task._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                      task.priority === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                        'bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      }`} />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">{task.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 truncate">{task.description || 'No description provided'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-tighter ${task.status === 'Completed' ? 'text-success' :
                      task.status === 'In Progress' ? 'text-primary' : 'text-slate-500'
                      }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-600 font-medium italic">All tasks settled for now</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for KPI Cards
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


export default DashboardHome;
