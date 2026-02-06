import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="relative w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button className="p-2 rounded-lg hover:bg-slate-100">
        <Bell size={20} />
      </button>
    </header>
  );
};

export default Header;
