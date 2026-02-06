import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Circle,
  XCircle,
  Download,
  Trash2,
  UserPlus
} from 'lucide-react';
import AssignTeamModal from '../components/AssignTeamModal';

const TABS = ['Overview', 'Tasks', 'Issues', 'Documents', 'Time'];

const ProjectOverview = () => {
  const { id } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('PROTOCOL ALERT: Permanent deletion of this node will purge all associated telemetry. Proceed?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProject = async () => {
    try {
      await api.put(`/projects/${id}`, { status: 'Active' });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const canManage = project && (user.role === 'Super Admin' || project.manager?._id === user.id || project.manager === user.id);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center animate-scale-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} className="text-slate-700" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Project Null</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">The requested project coordinates do not exist in our database.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-primary/20 text-primary border-primary/30';
      case 'Completed': return 'bg-success/20 text-success border-success/30';
      case 'Planning': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Pending Approval': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-white/10 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Project Control System <span className="mx-2 text-white/5">/</span> ID: {project._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManage && (
            <>
              {(project.status === 'Planning' || project.status === 'Pending Approval') && (
                <button
                  onClick={handleApproveProject}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all shadow-lg shadow-success/5"
                >
                  <CheckCircle size={14} /> Approve Node
                </button>
              )}
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
              >
                <UserPlus size={14} /> Assign Team
              </button>
              <button
                onClick={handleDeleteProject}
                className="p-2.5 rounded-xl text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                title="Purge Project"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <span className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(project.status)} shadow-lg shadow-black/20`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignTeamModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          project={project}
          onTeamUpdated={fetchProject}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-white/5 animate-fade-in-up stagger-1">
        <nav className="flex gap-10">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab
                ? 'text-primary'
                : 'text-slate-500 hover:text-white'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(79,70,229,0.8)] rounded-full animate-scale-in"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up stagger-2">
        {activeTab === 'Overview' && <OverviewTab project={project} />}
        {activeTab === 'Tasks' && <TasksTab projectId={id} />}
        {activeTab === 'Issues' && <IssuesTab projectId={id} />}
        {activeTab === 'Documents' && <DocumentsTab projectId={id} />}
        {activeTab === 'Time' && <TimeTab projectId={id} />}
      </div>
    </div>
  );
};

export default ProjectOverview;

/* ================= OVERVIEW ================= */

const OverviewTab = ({ project }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
    <Stat icon={<CheckCircle size={22} />} label="Tasks Resolved" value={project.taskStats?.completed || 0} variant="success" delay="stagger-1" />
    <Stat icon={<AlertTriangle size={22} />} label="Open Anomalies" value={project.issueStats?.open || 0} variant="danger" delay="stagger-2" />
    <Stat icon={<Clock size={22} />} label="Resource Units" value={project.hoursLogged || 0} variant="primary" delay="stagger-3" />
    <Stat icon={<Users size={22} />} label="Active Agents" value={project.team?.length || 0} variant="indigo" delay="stagger-4" />
  </div>
);

const Stat = ({ icon, label, value, variant, delay }) => {
  const variants = {
    primary: 'text-primary bg-primary/10 border-primary/20 shadow-primary/10',
    success: 'text-success bg-success/10 border-success/20 shadow-success/10',
    danger: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
  };

  return (
    <div className={`glass-card p-6 flex items-center gap-5 group hover:scale-[1.02] ${delay}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:shadow-lg ${variants[variant]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
};

/* ================= TASKS TAB ================= */

const TasksTab = ({ projectId }) => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TabLoading text="Syncing project tasks…" />;
  if (!tasks.length) return <EmptyState icon={<Briefcase size={32} />} text="No tasks registered for this coordinate" />;

  return (
    <div className="glass-card overflow-hidden">
      <div className="divide-y divide-white/5">
        {tasks.map((task, idx) => (
          <div key={task._id} className={`px-6 py-5 flex justify-between items-center gap-6 hover:bg-white/[0.02] transition-all group animate-fade-in-up stagger-${(idx % 4) + 1}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="group-hover:scale-110 transition-transform">
                <StatusIcon status={task.status} />
              </div>
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                {task.title}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${task.status === 'Completed' ? 'bg-success/10 text-success border-success/20' :
              task.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-white/5 text-slate-500 border-white/10'
              }`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= ISSUES TAB ================= */

const IssuesTab = ({ projectId }) => {
  const { api } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      const res = await api.get(`/issues?projectId=${projectId}`);
      setIssues(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TabLoading text="Scanning for anomalies…" />;
  if (!issues.length) return <EmptyState icon={<AlertTriangle size={32} />} text="No project anomalies detected" />;

  return (
    <div className="glass-card overflow-hidden">
      <div className="divide-y divide-white/5">
        {issues.map((issue, idx) => (
          <div key={issue._id} className={`px-6 py-5 flex justify-between items-center gap-6 hover:bg-white/[0.02] transition-all group animate-fade-in-up stagger-${(idx % 4) + 1}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="group-hover:rotate-12 transition-transform">
                <SeverityIcon severity={issue.severity} />
              </div>
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                {issue.title}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${issue.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-900/10' :
              issue.severity === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-white/5 text-slate-500 border-white/10'
              }`}>
              {issue.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= DOCUMENTS TAB ================= */

const DocumentsTab = ({ projectId }) => {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents?projectId=${projectId}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TabLoading text="Accessing document vault…" />;
  if (!documents.length) return <EmptyState icon={<FileText size={32} />} text="Archive is currently empty" />;

  return (
    <div className="glass-card overflow-hidden">
      <div className="divide-y divide-white/5">
        {documents.map((doc, idx) => (
          <div key={doc._id} className={`px-6 py-5 flex justify-between items-center gap-6 hover:bg-white/[0.02] transition-all group animate-fade-in-up stagger-${(idx % 4) + 1}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                  {doc.title}
                </p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">
                  {doc.fileType || 'DATA PACKAGE'}
                </p>
              </div>
            </div>

            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all"
              >
                <Download size={14} />
                Retrieve
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= TIME TAB ================= */

const TimeTab = ({ projectId }) => {
  const { api } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimesheets();
  }, [projectId]);

  const fetchTimesheets = async () => {
    try {
      const res = await api.get(`/timesheets?projectId=${projectId}`);
      setTimesheets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = timesheets.reduce(
    (sum, t) => sum + (t.hoursLogged || 0),
    0
  );

  if (loading) return <TabLoading text="Compiling time reports…" />;
  if (!timesheets.length) return <EmptyState icon={<Clock size={32} />} text="No resource allocation logs found" />;

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 flex justify-between items-center group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Aggregate Efficiency</p>
          <p className="text-4xl font-black text-white group-hover:text-primary transition-colors">
            {totalHours.toFixed(1)}<span className="text-sm text-slate-600 ml-1">UNITS</span>
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary relative z-10">
          <Clock size={32} className="group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-white/5">
          {timesheets.map((ts, idx) => (
            <div key={ts._id} className={`px-6 py-5 flex justify-between items-center hover:bg-white/[0.02] transition-colors group animate-fade-in-up stagger-${(idx % 4) + 1}`}>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                  {ts.taskId?.title || 'GENERAL OVERHEAD'}
                </p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-wider mt-1 italic">
                  {ts.description || 'No detailed log provided'}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">
                  <Calendar size={12} className="text-primary" />
                  {new Date(ts.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5 min-w-[50px] text-center">
                  {ts.hoursLogged}U
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const SeverityIcon = ({ severity }) => {
  if (severity === 'Critical') return <XCircle size={18} className="text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />;
  if (severity === 'High') return <AlertTriangle size={18} className="text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />;
  return <AlertTriangle size={18} className="text-slate-600" />;
};

const StatusIcon = ({ status }) => {
  if (status === 'Completed') return <CheckCircle size={18} className="text-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" />;
  if (status === 'In Progress') return <Clock size={18} className="text-primary shadow-[0_0_8px_rgba(79,70,229,0.4)]" />;
  return <Circle size={18} className="text-slate-600" />;
};

const TabLoading = ({ text }) => (
  <div className="py-20 flex flex-col items-center justify-center animate-pulse">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{text}</p>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="glass-card py-24 text-center animate-scale-in">
    <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{text}</p>
  </div>
);

