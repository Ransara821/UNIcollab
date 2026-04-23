import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ClipboardList, BookOpen, BrainCircuit,
  Search, FileText, BookMarked, Pencil, TrendingUp, Sparkles, ArrowRight
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`relative overflow-hidden p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500`} />
    
    <div className="flex items-start justify-between mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} border ${border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{value}</h3>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  </div>
);

const QuickAction = ({ label, icon: Icon, path, navigate, color, bg, border, desc }) => (
  <button onClick={() => navigate(path)}
    className="flex flex-col items-start p-6 rounded-3xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 group w-full text-left relative overflow-hidden active:scale-[0.98]">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${bg} ${color} ${border} border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{label}</h3>
    <p className="text-xs font-semibold text-slate-500 mt-1">{desc}</p>
    <div className="absolute right-6 bottom-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 group-hover:-translate-x-1">
      <ArrowRight size={16} />
    </div>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Kuppi Classes',   value: '12', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'My Enrollments', value: '3',  icon: ClipboardList,  color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Study Materials', value: '8', icon: BookOpen,        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Quizzes Taken',   value: '0', icon: BrainCircuit,   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const actions = [
    { label: 'Browse Classes', desc: 'Find peer tutoring sessions', icon: Search,     path: '/student/kuppi-classes',    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'My Enrollments', desc: 'View your scheduled classes', icon: FileText,   path: '/student/enrollments',       color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Resources',      desc: 'Access faculty past papers',   icon: BookMarked, path: '/student/resource-sharing',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Quiz Zone',      desc: 'Test your academic knowledge', icon: Pencil,     path: '/student/quizzes',           color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> Student Portal
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, <span className="text-emerald-500">{user?.name?.split(' ')[0] || 'Student'}</span>!
        </h1>
        <p className="text-slate-500 mt-2 text-base font-medium">Ready to continue your academic journey? Here is your personalized dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-6">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><TrendingUp size={18} /></div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map(a => <QuickAction key={a.label} {...a} navigate={navigate} />)}
        </div>
      </div>
    </div>
  );
}