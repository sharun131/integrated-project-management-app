import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="h-16 px-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>

        <div className="flex items-center gap-4">
          <button className="relative text-slate-600 hover:text-slate-900">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm text-slate-700">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
