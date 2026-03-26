import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ClipboardList, BookOpen, BrainCircuit,
  Search, FileText, BookMarked, Pencil, TrendingUp
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

const QuickAction = ({ label, icon: Icon, path, gradient, navigate }) => (
  <button onClick={() => navigate(path)}
    className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-slate-200/60 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 group text-center w-full">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ background: gradient }}>
      <Icon size={22} color="white" />
    </div>
    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Kuppi Classes', value: '12', icon: GraduationCap, gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
    { label: 'My Enrollments', value: '3',  icon: ClipboardList,  gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' },
    { label: 'Study Materials', value: '8', icon: BookOpen,        gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
    { label: 'Quizzes Taken',  value: '5',  icon: BrainCircuit,    gradient: 'linear-gradient(135deg, #0F766E, #06B6D4)' },
  ];

  const actions = [
    { label: 'Browse Classes', icon: Search, path: '/student/kuppi-classes', gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
    { label: 'My Enrollments', icon: FileText, path: '/student/enrollments', gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' },
    { label: 'Resources',      icon: BookMarked, path: '/student/resource-sharing', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
    { label: 'Take a Quiz',    icon: Pencil, path: '/student/quizzes', gradient: 'linear-gradient(135deg, #0F766E, #06B6D4)' },
  ];

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-600 mb-1">Student Portal</p>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your academic journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map(a => <QuickAction key={a.label} {...a} navigate={navigate} />)}
        </div>
      </div>
    </div>
  );
}