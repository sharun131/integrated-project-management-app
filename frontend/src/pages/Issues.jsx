import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, AlertTriangle, Trash2 } from 'lucide-react';
import ReportIssueModal from '../components/ReportIssueModal';

const Issues = () => {
  const { user, api } = useAuth();
  const [issues, setIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues');
      setIssues(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) return;
    try {
      await api.delete(`/issues/${id}`);
      fetchIssues(); // Refresh list
    } catch (err) {
      console.error("Failed to delete issue", err);
      alert("Failed to delete issue. Please try again.");
    }
  };

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSeverity =
      filterSeverity === 'All' || issue.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'High':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'text-success';
      case 'In Progress':
        return 'text-primary';
      case 'Open':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Issue Tracker</h1>
          <p className="text-slate-500 font-medium mt-2">
            Dynamic tracking and resolution management
          </p>
        </div>

        {['Project Manager', 'Project Admin', 'Team Member'].includes(user?.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary shadow-xl shadow-primary/20 bg-red-600 hover:bg-red-700 !shadow-red-900/20 animate-scale-in"
          >
            <Plus size={18} />
            Report Bug
          </button>
        )}
      </div>

      {/* ================= Filters ================= */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center animate-fade-in-up stagger-1">
        <div className="relative flex-1 max-w-xl group">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Filter by issue title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-11 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {severities.map(severity => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${filterSeverity === severity
                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Issues List ================= */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="divide-y divide-white/5">
          {filteredIssues.map((issue, index) => (
            <div
              key={issue._id}
              className={`px-6 py-5 flex items-start justify-between gap-6 hover:bg-white/[0.02] transition-colors group animate-fade-in-up stagger-${(index % 4) + 1}`}
            >
              {/* Left */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`mt-1 p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${issue.severity === 'Critical' ? 'text-red-500' :
                  issue.severity === 'High' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                  <AlertTriangle size={18} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                    {issue.title}
                  </h3>

                  {issue.description && (
                    <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed italic">
                      {issue.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-black border border-indigo-500/20">
                      {issue.reportedBy?.name?.charAt(0) || '?'}
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      BY {issue.reportedBy?.name || 'AGENT'} <span className="mx-2 text-white/5">/</span> {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-4 shrink-0 mt-1">
                <span
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getSeverityStyles(
                    issue.severity
                  )}`}
                >
                  {issue.severity}
                </span>

                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 ${getStatusBadge(
                    issue.status
                  )}`}
                >
                  {issue.status}
                </span>

                <button
                  onClick={() => handleDeleteIssue(issue._id)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Project Signal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <div className="py-24 text-center animate-scale-in">
              <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertTriangle size={32} className="text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Safe Intelligence</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium italic">No anomalies detected in this frequency. The project remains stable.</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= Modal ================= */}
      {showModal && (
        <ReportIssueModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onIssueReported={() => {
            setShowModal(false);
            fetchIssues();
          }}
        />
      )}
    </div>
  );
};

export default Issues;
