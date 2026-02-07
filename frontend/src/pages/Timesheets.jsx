import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Clock, Calendar } from 'lucide-react';
import LogTimeModal from '../components/LogTimeModal';

const Timesheets = () => {
  const { api } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await api.get('/timesheets');
      setTimesheets(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTimesheets = timesheets.filter(ts =>
    ts.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ts.project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalHours = () => {
    return filteredTimesheets.reduce(
      (sum, ts) => sum + (ts.hours || 0),
      0
    );
  };

  return (
    <div className="space-y-10 pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Operational Logs</h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            Precision time allocation and operational logging
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in"
        >
          <Plus size={18} />
          Log Operation
        </button>
      </div>

      {/* ================= Summary ================= */}
      <div className="glass-card p-8 flex items-center justify-between animate-fade-in-up stagger-1 border-primary/10 shadow-lg shadow-primary/5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Total Operational Hours
          </p>
          <p className="text-5xl font-black text-white tracking-tighter">
            {getTotalHours().toFixed(1)}<span className="text-primary text-2xl ml-1">h</span>
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
          <Clock size={32} />
        </div>
      </div>

      {/* ================= Search ================= */}
      <div className="relative max-w-xl group animate-fade-in-up stagger-2">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
        />
        <input
          type="text"
          placeholder="Filter by project code or assignment title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full !pl-11 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* ================= Timesheet Entries ================= */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr className="text-slate-500 text-left">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Project Source</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Active Assignment</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Timestamp</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Duration</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Operational Decrypt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredTimesheets.map((ts, idx) => (
                <tr
                  key={ts._id}
                  className="hover:bg-white/[0.02] transition-colors group animate-fade-in-up"
                  style={{ animationDelay: `${(idx % 5) * 0.05 + 0.4}s` }}
                >
                  <td className="px-6 py-5">
                    <span className="font-bold text-white group-hover:text-primary transition-colors">{ts.project?.name || '—'}</span>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-slate-400 font-medium italic">{ts.task?.title || '—'}</span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                      <Calendar size={12} className="text-primary" />
                      {new Date(ts.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                      {ts.hours || 0} HOURS
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <p className="text-slate-500 text-xs italic line-clamp-1 max-w-xs">{ts.description || '—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTimesheets.length === 0 && (
          <div className="py-24 text-center animate-scale-in">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
              <Clock size={32} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Logs Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium italic">Chronological logs are currently zero-indexed for this cycle.</p>
          </div>
        )}
      </div>

      {/* ================= Modal ================= */}
      {showModal && (
        <LogTimeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onTimeLogged={() => {
            setShowModal(false);
            fetchTimesheets();
          }}
        />
      )}
    </div>
  );
};


export default Timesheets;
