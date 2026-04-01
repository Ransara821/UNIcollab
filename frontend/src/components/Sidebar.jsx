import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/student/dashboard', label: '🏠 Dashboard' },
  { path: '/student/kuppi-classes', label: '🎓 Kuppi Classes' },
  { path: '/student/enrollments', label: '📋 My Enrollments' },
  { path: '/student/resource-sharing', label: '📚 Resource Sharing' },
  { path: '/student/study-groups', label: '👥 Study Group Finder' },
  { path: '/student/feedback', label: '💬 Provide Feedback' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-64 bg-white border-r border-slate-100 text-slate-800 flex flex-col fixed left-0 top-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">
      {/* User Info */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-lg text-emerald-600 shadow-inner">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-slate-900 truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}