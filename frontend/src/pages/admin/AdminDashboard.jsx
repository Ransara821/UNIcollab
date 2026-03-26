import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, ClipboardList, BookOpen,
  PlusCircle, FileText, Upload, Brain, TrendingUp,
  UserCheck, Activity
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, gradient }) => (
  <div className="p-5 rounded-2xl border border-slate-200/60 bg-white hover:shadow-lg transition-all duration-200 group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
        style={{ background: gradient }}>
        <Icon size={20} color="white" />
      </div>
      <TrendingUp size={16} style={{ color: '#94A3B8' }} />
    </div>
    <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Students', value: '24', icon: Users, gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
    { label: 'Kuppi Classes', value: '12',  icon: GraduationCap, gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' },
    { label: 'Enrollments', value: '36',    icon: ClipboardList,  gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
    { label: 'Resources', value: '8',       icon: BookOpen,        gradient: 'linear-gradient(135deg, #0F766E, #06B6D4)' },
  ];

  const quickActions = [
    { label: 'Post Kuppi Class', icon: PlusCircle, path: '/admin/post-kuppi-class', gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
    { label: 'View Enrollments', icon: FileText,   path: '/admin/enrollments',       gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' },
    { label: 'Upload Resource',  icon: Upload,     path: '/admin/upload-resource',   gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
    { label: 'Quiz Management',  icon: Brain,      path: '/admin/quiz-management',   gradient: 'linear-gradient(135deg, #0F766E, #06B6D4)' },
  ];

  const activity = [
    { text: 'New student registered', time: '2 min ago', icon: UserCheck },
    { text: 'New enrollment submitted', time: '15 min ago', icon: ClipboardList },
    { text: 'Kuppi class posted', time: '1 hr ago', icon: GraduationCap },
    { text: 'Study material uploaded', time: '2 hr ago', icon: Upload },
  ];

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium" style={{ color: '#7C3AED' }}>Admin Panel</p>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's your platform summary.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, path, gradient }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-200 group text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: gradient }}>
                  <Icon size={18} color="white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: '#4F46E5' }} />
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {activity.map(({ text, time, icon: Icon }, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
                  <Icon size={14} style={{ color: '#4F46E5' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}