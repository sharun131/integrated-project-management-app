import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Check
} from 'lucide-react';

const NotificationsPage = () => {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return <Info size={18} className="text-primary" />;
    }
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      {/* ================= Header ================= */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Signal Feed</h1>
          <p className="text-slate-500 font-medium mt-1 italic text-sm">Real-time status updates and priority alerts</p>
        </div>
      </div>

      {/* ================= Empty ================= */}
      {notifications.length === 0 && (
        <div className="glass-card py-24 text-center animate-scale-in">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
            <Bell size={32} className="text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Protocol Clear</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium italic">You're all caught up with current signal transmissions.</p>
        </div>
      )}

      {/* ================= Unread ================= */}
      {unread.length > 0 && (
        <div className="space-y-4 animate-fade-in-up stagger-1">
          <div className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Active Signals
          </div>

          <div className="space-y-3">
            {unread.map((notif, idx) => (
              <div
                key={notif._id}
                className="glass-card px-6 py-5 flex gap-5 bg-primary/[0.03] hover:bg-primary/[0.05] transition-all border-primary/10 group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05 + 0.2}s` }}
              >
                <div className="mt-1 group-hover:scale-110 transition-transform">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {notif.title}
                    </p>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2 italic">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= Read ================= */}
      {read.length > 0 && (
        <div className="space-y-4 animate-fade-in-up stagger-2">
          <div className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            Archived Signals
          </div>

          <div className="glass-card divide-y divide-white/5 overflow-hidden border-white/5 bg-white/[0.01]">
            {read.map((notif, idx) => (
              <div
                key={notif._id}
                className="px-6 py-5 flex gap-5 hover:bg-white/[0.02] transition-colors group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.03 + 0.4}s` }}
              >
                <div className="mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 italic">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-3 font-bold uppercase tracking-widest">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-start pt-1">
                  <Check size={14} className="text-slate-700 group-hover:text-success/40 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default NotificationsPage;
