import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, ClipboardList, BookOpen,
  PlusCircle, FileText, Upload, BrainCircuit,
  TrendingUp, Activity, ArrowRight, CheckCircle2
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`relative overflow-hidden p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group`}>
    {/* Decorative blob */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500`} />
    
    <div className="flex items-start justify-between mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} border ${border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
        <TrendingUp size={14} className="text-emerald-600" />
        <span className="text-xs font-bold text-emerald-700">+12%</span>
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{value}</h3>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Students', value: '24', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Kuppi Classes', value: '12',  icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Enrollments', value: '36',    icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Resources', value: '8',       icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const quickActions = [
    { label: 'Post Kuppi Class', desc: 'Schedule a new peer session', icon: PlusCircle, path: '/admin/post-kuppi-class', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Manage Enrollments', desc: 'Review student requests', icon: FileText, path: '/admin/enrollments', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Upload Resource', desc: 'Add new study materials', icon: Upload, path: '/admin/upload-resource', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Quiz Management', desc: 'Create and edit quizzes', icon: BrainCircuit, path: '/admin/quiz-management', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const activity = [
    { text: 'New student registered', time: '2 min ago', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { text: 'New enrollment submitted', time: '15 min ago', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { text: 'Kuppi class posted', time: '1 hr ago', icon: GraduationCap, color: 'text-teal-500', bg: 'bg-teal-50' },
    { text: 'Study material uploaded', time: '2 hr ago', icon: Upload, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity size={14} /> Admin Workspace
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-2 text-base font-medium">Welcome back, <span className="font-bold text-slate-700">{user?.name}</span>. Here is your daily platform summary.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 py-2 bg-slate-50 rounded-xl">
             <p className="text-xs font-bold text-slate-400">System Status</p>
             <div className="flex items-center gap-1.5 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-sm font-bold text-slate-700">All Systems Operational</span>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Quick Actions */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={18} /></div>
              Quick Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(({ label, desc, icon: Icon, path, color, bg, border }) => (
              <button 
                key={label} 
                onClick={() => navigate(path)}
                className="flex items-center p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group text-left relative overflow-hidden active:scale-[0.98]"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color} ${border} border mr-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{label}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
              <Activity size={20} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-6">
            {activity.map(({ text, time, icon: Icon, color, bg }, i) => (
              <div key={i} className="flex items-start gap-4 relative group cursor-default">
                {/* Timeline connector */}
                {i !== activity.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-[-24px] w-px bg-slate-100 group-hover:bg-emerald-200 transition-colors"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color} bg-opacity-50 shadow-sm border border-white ring-4 ring-white z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="pt-2.5">
                  <p className="text-sm font-bold text-slate-800">{text}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-sm font-bold transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}