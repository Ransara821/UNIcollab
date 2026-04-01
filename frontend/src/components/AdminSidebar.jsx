import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin/dashboard', label: '🏠 Dashboard' },
  { path: '/admin/users', label: '👥 Manage Users' },
  { path: '/admin/post-kuppi-class', label: '🎓 Post Kuppi Class' },
  { path: '/admin/enrollments', label: '📋 Enrollments' },
  { path: '/admin/upload-resource', label: '📚 Upload Resource' },
  { path: '/admin/create-study-group', label: '👥 Manage Study Groups' },
  { path: '/admin/feedback-report', label: '📊 Feedback Report' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-100 text-slate-800 flex flex-col fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 text-2xl">🎓</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            UNI<span className="text-emerald-500">collab</span>
          </h1>
        </div>
        <p className="text-orange-400 text-sm mt-1 font-bold">Admin Panel</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-lg text-orange-600 shadow-inner">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-slate-900 truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">Administrator</p>
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
                ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-orange-500'
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