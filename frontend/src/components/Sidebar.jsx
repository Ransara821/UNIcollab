import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, GraduationCap, ClipboardList,
  BookOpen, Users, BrainCircuit, LogOut, BookMarked,
  AlertCircle
} from 'lucide-react';

const navItems = [
  { path: '/student/dashboard',        label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/student/kuppi-classes',    label: 'Kuppi Classes',     icon: GraduationCap },
  { path: '/student/enrollments',      label: 'My Enrollments',    icon: ClipboardList },
  { path: '/student/resource-sharing', label: 'Resource Sharing',  icon: BookOpen },
  { path: '/student/study-groups',     label: 'Study Groups',      icon: Users },
  { path: '/student/quizzes',          label: 'Quiz Zone',         icon: BrainCircuit },
  { path: '/student/feedback',         label: 'Provide Feedback' },

];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => { 
    setShowLogoutModal(false);
    logout(); 
    navigate('/login'); 
  };

  return (
    <>
      <div className="h-screen w-64 flex flex-col fixed left-0 top-0 z-50 bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgb(0,0,0,0.02)]">

        {/* Logo & Brand */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20">
              <BookMarked size={20} color="white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              UNI<span className="text-emerald-500">collab</span>
            </span>
          </div>
          <div className="mt-2 ml-14">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
              Student Portal
            </span>
          </div>
        </div>

        {/* User pill */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">{user?.name || 'Student'}</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">Active Learner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4 custom-scrollbar">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink 
              key={path} 
              to={path}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'} />
                  <span className="truncate">{label}</span>
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-[0_2px_10px_rgb(239,68,68,0.05)] transition-all duration-200 group active:scale-[0.98]"
          >
            <LogOut size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-full max-w-sm animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Ready to leave?</h3>
              <p className="text-sm font-semibold text-slate-500 mb-8 max-w-[250px] leading-relaxed">
                Are you sure you want to sign out of your Student Portal account?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}