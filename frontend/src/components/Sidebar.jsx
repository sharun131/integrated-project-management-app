import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bug,
  Clock,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Flag,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0a0a0f] text-slate-200 h-screen flex flex-col border-r border-white/5 relative z-20">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 blur-[80px] pointer-events-none"></div>

      {/* Logo */}
      <div className="px-6 py-8 relative">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <FolderKanban className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">ProjectHub</h1>
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        <Section title="Overview" delay="animate-fade-in-up stagger-1">
          <Item to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          {['Super Admin', 'Project Admin', 'Project Manager'].includes(user?.role) && (
            <Item to="/projects" icon={FolderKanban} label="Projects" />
          )}
        </Section>

        <Section title="Management" delay="animate-fade-in-up stagger-2">
          <Item to="/tasks" icon={CheckSquare} label="Tasks" />
          <Item to="/issues" icon={Bug} label="Issues / Bugs" />
          {user?.role !== 'Super Admin' && (
            <Item to="/milestones" icon={Flag} label="Milestones" />
          )}
        </Section>

        <Section title="Resources" delay="animate-fade-in-up stagger-3">
          <Item to="/timesheets" icon={Clock} label="Timesheets" />
          <Item to="/documents" icon={FileText} label="Documents" />
          <Item to="/reports" icon={BarChart3} label="Reports" />
        </Section>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role || "Member"}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Item to="/settings" icon={Settings} label="Settings" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

const Section = ({ title, children, delay }) => {
  return (
    <div className={delay}>
      <p className="px-4 mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Item = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden ${isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
          )}
          <Icon size={18} className={`${isActive ? "text-primary" : "text-slate-500 group-hover:text-white group-hover:scale-110"} transition-all duration-300`} />
          <span className="flex-1">{label}</span>
          <ChevronRight size={14} className={`opacity-0 ${isActive ? 'opacity-40' : 'group-hover:opacity-40'} -translate-x-2 group-hover:translate-x-0 transition-all duration-300`} />
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
