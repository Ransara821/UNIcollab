import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList,
  Upload, UserCog, BrainCircuit, LogOut, BookMarked
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard',          label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/admin/users',              label: 'Manage Users',      icon: UserCog },
  { path: '/admin/post-kuppi-class',   label: 'Post Kuppi Class',  icon: GraduationCap },
  { path: '/admin/enrollments',        label: 'Enrollments',       icon: ClipboardList },
  { path: '/admin/upload-resource',    label: 'Upload Resource',   icon: Upload },
  { path: '/admin/create-study-group', label: 'Study Groups',      icon: Users },
  { path: '/admin/quiz-management',    label: 'Quiz Management',   icon: BrainCircuit },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="h-screen w-64 flex flex-col fixed left-0 top-0 z-50"
      style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <BookMarked size={16} color="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            UNI<span style={{ color: '#06B6D4' }}>collab</span>
          </span>
        </div>
        <div className="mt-2 ml-11">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>Admin Panel</span>
        </div>
      </div>

      {/* User pill */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#64748B' }}>Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`
            }
            style={({ isActive }) => ({
              background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15))' : 'transparent',
              borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
              color: isActive ? '#E2E8F0' : '#64748B',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FCA5A5'}
          onMouseLeave={e => e.currentTarget.style.color = '#EF4444'}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}