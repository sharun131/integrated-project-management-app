import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Search,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app">
      {/* ================= Sidebar ================= */}
      <Sidebar />

      {/* ================= Main ================= */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 px-8 h-20 flex items-center justify-between shrink-0 animate-slide-down">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-sm group">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                placeholder="Search everything..."
                className="w-full !pl-11 pr-4 py-2.5 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
              <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(79,70,229,0.6)]"></span>
              </button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro Account</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20 ring-2 ring-white/5 group-hover:ring-primary/40 transition-all">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
          <div className="animate-fade-in-up max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


export default DashboardLayout;
