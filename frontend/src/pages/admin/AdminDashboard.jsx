import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, BrainCircuit, PlusCircle,
  FileText, Upload, TrendingUp, Activity, ArrowRight,
  Shield, BarChart3, RefreshCw, Clock, Layers, Calendar
} from 'lucide-react';
import { getAllUsers, getKuppiClasses, getResources, getStudyGroups } from '../../services/api';
import { getAllAttempts, getQuizzes } from '../../services/quizService';

// ── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ data, size = 156, thickness = 22 }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const seg = { ...d, dash: pct * c, offset: cum * c };
    cum += pct;
    return seg;
  });
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {segments.map((seg, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={seg.color} strokeWidth={thickness}
          strokeDasharray={`${seg.dash} ${c - seg.dash}`}
          strokeDashoffset={-seg.offset}
        />
      ))}
    </svg>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, border, loading }) {
  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl bg-white border ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-default`}>
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color} border ${border} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <TrendingUp size={10} /> Live
          </div>
        </div>
        {loading
          ? <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse mb-1" />
          : <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value ?? '—'}</h3>
        }
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Bar Row ──────────────────────────────────────────────────────────────────
function BarRow({ label, value, max, barColor, textColor, loading }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-600">{label}</span>
        <span className={textColor}>{loading ? '—' : value}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: loading ? '0%' : `${Math.round((value / (max || 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

const safeArr = v => (Array.isArray(v) ? v : []);

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [raw, setRaw]           = useState({ users: [], kuppi: [], resources: [], quizzes: [], attempts: [], groups: [] });
  const [loading, setLoading]   = useState(true);
  const [spinning, setSpinning] = useState(false);

  const load = async () => {
    const [u, k, res, q, att, g] = await Promise.allSettled([
      getAllUsers(), getKuppiClasses(), getResources(),
      getQuizzes(), getAllAttempts(), getStudyGroups(),
    ]);
    setRaw({
      users:     u.status   === 'fulfilled' ? safeArr(u.value.data)   : [],
      kuppi:     k.status   === 'fulfilled' ? safeArr(k.value.data)   : [],
      resources: res.status === 'fulfilled' ? safeArr(res.value.data) : [],
      quizzes:   q.status   === 'fulfilled' ? safeArr(q.value.data)   : [],
      attempts:  att.status === 'fulfilled' ? safeArr(att.value.data) : [],
      groups:    g.status   === 'fulfilled' ? safeArr(g.value.data)   : [],
    });
    setLoading(false);
    setSpinning(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setSpinning(true); load(); };

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalUsers   = raw.users.length;
  const students     = raw.users.filter(u => u.role !== 'admin').length;
  const admins       = raw.users.filter(u => u.role === 'admin').length;
  const activeUsers  = raw.users.filter(u => u.status !== 'inactive').length;
  const inactiveUsers = totalUsers - activeUsers;

  const completed  = raw.attempts.filter(a => a.status === 'completed').length;
  const inProgress = raw.attempts.filter(a => a.status === 'in-progress').length;
  const timeout    = raw.attempts.filter(a => a.status === 'timeout').length;

  const scoredAttempts = raw.attempts.filter(a => a.status === 'completed' && a.score != null);
  const avgScore = scoredAttempts.length
    ? Math.round(scoredAttempts.reduce((s, a) => s + (a.score || 0), 0) / scoredAttempts.length)
    : 0;

  const stats = [
    { label: 'Total Users',    value: totalUsers,          icon: Users,         color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-100' },
    { label: 'Students',       value: students,            icon: GraduationCap, color: 'text-teal-600',    bg: 'bg-teal-50',     border: 'border-teal-100' },
    { label: 'Admins',         value: admins,              icon: Shield,        color: 'text-indigo-600',  bg: 'bg-indigo-50',   border: 'border-indigo-100' },
    { label: 'Kuppi Classes',  value: raw.kuppi.length,    icon: BookOpen,      color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-100' },
    { label: 'Resources',      value: raw.resources.length,icon: FileText,      color: 'text-purple-600',  bg: 'bg-purple-50',   border: 'border-purple-100' },
    { label: 'Quiz Attempts',  value: raw.attempts.length, icon: BarChart3,     color: 'text-rose-600',    bg: 'bg-rose-50',     border: 'border-rose-100' },
  ];

  const quickActions = [
    { label: 'Post Kuppi Class',   desc: 'Schedule a new peer session',  icon: PlusCircle,  path: '/admin/post-kuppi-class', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Manage Enrollments', desc: 'Review student requests',       icon: FileText,    path: '/admin/enrollments',      color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-100' },
    { label: 'Upload Resource',    desc: 'Add new study materials',       icon: Upload,      path: '/admin/upload-resource',  color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
    { label: 'Quiz Management',    desc: 'Create and edit quizzes',       icon: BrainCircuit,path: '/admin/quiz-management',  color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  ];

  const recentActivity = [
    { text: 'New student registered',   time: '2 min ago',  icon: Users,         color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { text: 'New enrollment submitted', time: '15 min ago', icon: FileText,      color: 'text-blue-500',    bg: 'bg-blue-50' },
    { text: 'Kuppi class posted',       time: '1 hr ago',   icon: GraduationCap, color: 'text-teal-500',    bg: 'bg-teal-50' },
    { text: 'Study material uploaded',  time: '2 hr ago',   icon: Upload,        color: 'text-purple-500',  bg: 'bg-purple-50' },
    { text: 'Quiz attempt completed',   time: '3 hr ago',   icon: BrainCircuit,  color: 'text-rose-500',    bg: 'bg-rose-50' },
  ];

  const userDonut = [
    { label: 'Students', value: students,     color: '#10B981' },
    { label: 'Admins',   value: admins,       color: '#6366F1' },
    { label: 'Inactive', value: inactiveUsers, color: '#CBD5E1' },
  ].filter(d => d.value > 0);

  const contentBars = [
    { label: 'Kuppi Classes', value: raw.kuppi.length,     barColor: 'bg-blue-500',   textColor: 'text-blue-600' },
    { label: 'Resources',     value: raw.resources.length, barColor: 'bg-purple-500', textColor: 'text-purple-600' },
    { label: 'Quizzes',       value: raw.quizzes.length,   barColor: 'bg-rose-500',   textColor: 'text-rose-600' },
    { label: 'Study Groups',  value: raw.groups.length,    barColor: 'bg-teal-500',   textColor: 'text-teal-600' },
  ];
  const contentMax = Math.max(...contentBars.map(d => d.value), 1);

  const attemptBars = [
    { label: 'Completed',   value: completed,  barColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { label: 'In Progress', value: inProgress, barColor: 'bg-amber-500',   textColor: 'text-amber-600' },
    { label: 'Timeout',     value: timeout,    barColor: 'bg-rose-500',    textColor: 'text-rose-600' },
  ];
  const attemptMax = Math.max(...attemptBars.map(d => d.value), 1);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto font-sans selection:bg-emerald-100">

      {/* ── Header ── */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
            <Activity size={12} /> Admin Workspace
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {greeting}, <span className="text-emerald-500">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium flex items-center gap-1.5">
            <Calendar size={13} /> {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
              <p className="text-sm font-black text-slate-800 leading-tight">All Systems Operational</p>
            </div>
          </div>
          <button onClick={refresh} disabled={spinning}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all">
            <RefreshCw size={16} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

        {/* Donut — User Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-emerald-50 rounded-xl"><Users size={15} className="text-emerald-600" /></div>
            <h2 className="font-black text-slate-900 text-sm">User Distribution</h2>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="relative shrink-0">
              <DonutChart
                data={userDonut.length ? userDonut : [{ label: 'None', value: 1, color: '#e2e8f0' }]}
                size={150} thickness={20}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">{loading ? '—' : totalUsers}</span>
                <span className="text-[10px] font-semibold text-slate-400">users</span>
              </div>
            </div>
            <div className="space-y-2.5 flex-1">
              {[
                { label: 'Students', value: students,      color: '#10B981' },
                { label: 'Admins',   value: admins,        color: '#6366F1' },
                { label: 'Active',   value: activeUsers,   color: '#14B8A6' },
                { label: 'Inactive', value: inactiveUsers, color: '#CBD5E1' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs font-semibold text-slate-500 flex-1">{label}</span>
                  <span className="text-xs font-black text-slate-900">{loading ? '—' : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar — Content Overview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-xl"><Layers size={15} className="text-blue-600" /></div>
            <h2 className="font-black text-slate-900 text-sm">Content Overview</h2>
          </div>
          <div className="space-y-4">
            {contentBars.map(b => (
              <BarRow key={b.label} {...b} max={contentMax} loading={loading} />
            ))}
          </div>
        </div>

        {/* Bar — Quiz Performance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-rose-50 rounded-xl"><BrainCircuit size={15} className="text-rose-600" /></div>
            <h2 className="font-black text-slate-900 text-sm">Quiz Performance</h2>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-center mb-5">
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-0.5">Avg Score</p>
            <p className="text-3xl font-black text-white">{loading ? '—' : `${avgScore}%`}</p>
            <p className="text-[11px] text-emerald-100 font-medium mt-0.5">{scoredAttempts.length} scored attempts</p>
          </div>
          <div className="space-y-4">
            {attemptBars.map(b => (
              <BarRow key={b.label} {...b} max={attemptMax} loading={loading} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp size={15} className="text-emerald-600" /></div>
            <h2 className="font-black text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(({ label, desc, icon: Icon, path, color, bg, border }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300 group text-left active:scale-[0.98]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color} border ${border} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={21} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">{label}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all shrink-0">
                  <ArrowRight size={15} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-slate-100 rounded-xl"><Activity size={15} className="text-slate-600" /></div>
            <h2 className="font-black text-slate-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map(({ text, time, icon: Icon, color, bg }, i) => (
              <div key={i} className="flex items-start gap-3 group relative">
                {i < recentActivity.length - 1 && (
                  <div className="absolute left-5 top-9 bottom-[-16px] w-px bg-slate-100 group-hover:bg-emerald-100 transition-colors" />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color} border border-white ring-2 ring-slate-50 z-10 group-hover:scale-110 transition-transform`}>
                  <Icon size={15} />
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-slate-800 leading-snug">{text}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 text-sm font-bold border border-slate-100 hover:border-emerald-100 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}