import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, BookOpen, BrainCircuit, Search,
  BookMarked, Pencil, ArrowRight, Star, Target, Trophy,
  CheckCircle2, XCircle, Flame, Calendar, Sparkles, Clock
} from 'lucide-react';
import { getKuppiClasses, getResources } from '../../services/api';
import { getMyAttempts } from '../../services/quizService';

// ── SVG Donut ────────────────────────────────────────────────────────────────
function DonutChart({ data, size = 130, thickness = 18 }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;
  const segs = data.map(d => {
    const pct = d.value / total;
    const s = { ...d, dash: pct * c, offset: cum * c };
    cum += pct;
    return s;
  });
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {segs.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${s.dash} ${c - s.dash}`}
          strokeDashoffset={-s.offset}
        />
      ))}
    </svg>
  );
}

const safeArr = v => Array.isArray(v) ? v : [];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [raw, setRaw]         = useState({ kuppi: [], resources: [], attempts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [kp, rs, at] = await Promise.allSettled([
        getKuppiClasses(), getResources(), getMyAttempts(),
      ]);
      setRaw({
        kuppi:     kp.status === 'fulfilled' ? safeArr(kp.value.data)                       : [],
        resources: rs.status === 'fulfilled' ? safeArr(rs.value.data)                       : [],
        attempts:  at.status === 'fulfilled' ? safeArr(at.value.data?.data ?? at.value.data): [],
      });
      setLoading(false);
    };
    load();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const completed = raw.attempts.filter(a => a.status === 'completed');
  const passed    = completed.filter(a => {
    const pct = a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
    return pct >= (a.quizId?.passMark || 50);
  });
  const avgScore  = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0), 0) / completed.length)
    : 0;

  const recentScores = [...completed]
    .sort((a, b) => new Date(b.submittedAt || b.startedAt) - new Date(a.submittedAt || a.startedAt))
    .slice(0, 5);

  const now      = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const heroStats = [
    { label: 'Kuppi Classes', value: raw.kuppi.length,    icon: GraduationCap, accent: 'text-indigo-600',  bg: 'bg-indigo-50',  ring: 'ring-indigo-100' },
    { label: 'Resources',    value: raw.resources.length, icon: BookOpen,      accent: 'text-teal-600',    bg: 'bg-teal-50',    ring: 'ring-teal-100' },
    { label: 'Quizzes Done', value: completed.length,     icon: BrainCircuit,  accent: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Avg Score',    value: `${avgScore}%`,       icon: Target,        accent: 'text-purple-600',  bg: 'bg-purple-50',  ring: 'ring-purple-100' },
  ];

  const quickActions = [
    { label: 'Browse Classes', desc: 'Find peer tutoring',     icon: Search,     path: '/student/kuppi-classes',    color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
    { label: 'Resources',      desc: 'Past papers & notes',     icon: BookMarked, path: '/student/resource-sharing', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Quiz Zone',      desc: 'Test your knowledge',     icon: Pencil,     path: '/student/quizzes',          color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  ];

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto font-sans selection:bg-emerald-100">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-7 lg:p-9 mb-6 shadow-xl shadow-emerald-500/20">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 bottom-0 w-48 h-48 rounded-full bg-teal-400/25 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-32 h-32 rounded-full bg-emerald-300/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} /> Student Portal
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {greeting}, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-emerald-100 mt-1.5 text-sm font-medium flex items-center gap-1.5">
                <Calendar size={13} /> {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-white/20 shrink-0 self-start">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-600/30">
                <Flame size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Quiz Streak</p>
                <p className="text-white font-black text-lg leading-tight">{completed.length} Completed</p>
              </div>
            </div>
          </div>

          {/* Inline mini-stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {heroStats.map(({ label, value, icon: Icon, accent, bg, ring }) => (
              <div key={label}
                className="bg-white rounded-2xl px-4 py-3.5 shadow-lg shadow-black/10 ring-1 ring-white/60 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 cursor-default group">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bg} ${ring} ring-1 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={12} className={accent} />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${accent}`}>{label}</p>
                </div>
                {loading
                  ? <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" />
                  : <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Upcoming Kuppi Classes — 2 col */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><GraduationCap size={15} className="text-indigo-600" /></div>
              <div>
                <h2 className="font-black text-slate-900 leading-tight">Upcoming Kuppi Classes</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Peer-led study sessions open for you</p>
              </div>
            </div>
            <button onClick={() => navigate('/student/kuppi-classes')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : (() => {
            const upcoming = raw.kuppi
              .filter(k => new Date(k.sessionDate) >= new Date())
              .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
              .slice(0, 3);

            if (upcoming.length === 0) return (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                  <GraduationCap size={22} className="text-indigo-400" />
                </div>
                <p className="font-bold text-slate-600 text-sm">No upcoming sessions</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Check back soon for new peer-tutoring sessions</p>
                <button onClick={() => navigate('/student/kuppi-classes')}
                  className="mt-4 px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors">
                  Browse All Classes
                </button>
              </div>
            );

            return (
              <div className="space-y-3">
                {upcoming.map((cls, i) => {
                  const colors = [
                    { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', btn: 'bg-indigo-500 hover:bg-indigo-600' },
                    { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   btn: 'bg-teal-500 hover:bg-teal-600' },
                    { bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-100',btn: 'bg-emerald-500 hover:bg-emerald-600' },
                  ][i % 3];
                  const sessionDate = new Date(cls.sessionDate);
                  const dateLabel   = sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  const timeLabel   = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={cls._id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200 group`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white border ${colors.border} shadow-sm group-hover:scale-110 transition-transform`}>
                        <BookOpen size={18} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{cls.title || cls.subject}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className={`text-[11px] font-semibold ${colors.text} flex items-center gap-1`}>
                            <Calendar size={10} /> {dateLabel} · {timeLabel}
                          </span>
                          {cls.location && (
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                              📍 {cls.location}
                            </span>
                          )}
                          {cls.academicYear && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Year {cls.academicYear}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/student/kuppi-classes')}
                        className={`shrink-0 px-4 py-2 rounded-xl text-white text-xs font-black ${colors.btn} transition-colors shadow-sm`}>
                        Join
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => navigate('/student/kuppi-classes')}
                  className="w-full mt-1 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-xs font-bold border border-slate-100 hover:border-indigo-100 transition-all">
                  Explore All Kuppi Sessions →
                </button>
              </div>
            );
          })()}
        </div>

        {/* Performance Donut — 1 col */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-purple-50 rounded-xl"><Trophy size={15} className="text-purple-600" /></div>
            <h2 className="font-black text-slate-900 text-sm">Performance</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-5">
              <DonutChart
                data={completed.length > 0 ? [
                  { label: 'Passed', value: passed.length,              color: '#10B981' },
                  { label: 'Failed', value: completed.length - passed.length, color: '#F43F5E' },
                ] : [{ label: 'None', value: 1, color: '#e2e8f0' }]}
                size={130} thickness={18}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{loading ? '—' : `${avgScore}%`}</span>
                <span className="text-[10px] font-semibold text-slate-400">avg score</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {[
                { label: 'Passed',      value: passed.length,                              bg: 'bg-emerald-50', text: 'text-emerald-700', dot: '#10B981' },
                { label: 'Failed',      value: completed.length - passed.length,           bg: 'bg-rose-50',    text: 'text-rose-700',    dot: '#F43F5E' },
                { label: 'In Progress', value: raw.attempts.filter(a => a.status === 'in-progress').length, bg: 'bg-amber-50', text: 'text-amber-700', dot: '#F59E0B' },
              ].map(({ label, value, bg, text, dot }) => (
                <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${bg}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
                    <span className={`text-xs font-bold ${text}`}>{label}</span>
                  </div>
                  <span className={`text-xs font-black ${text}`}>{loading ? '—' : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions + Recent Results ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions — 2 col */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-xl"><Star size={15} className="text-indigo-600" /></div>
            <h2 className="font-black text-slate-900">Explore</h2>
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

        {/* Recent Quiz Results — 1 col */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-rose-50 rounded-xl"><BrainCircuit size={15} className="text-rose-600" /></div>
            <h2 className="font-black text-slate-900 text-sm">Recent Results</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : recentScores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-bold text-slate-400">No results yet</p>
              <p className="text-xs text-slate-300 font-medium mt-1">Complete a quiz to see your results</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScores.slice(0, 5).map(att => {
                const pct    = att.totalQuestions > 0 ? Math.round((att.score / att.totalQuestions) * 100) : 0;
                const isPassed = pct >= (att.quizId?.passMark || 50);
                const date   = new Date(att.submittedAt || att.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <button key={att._id} onClick={() => navigate(`/student/quizzes/result/${att._id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPassed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {isPassed
                        ? <CheckCircle2 size={17} className="text-emerald-500" />
                        : <XCircle     size={17} className="text-rose-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-snug">{att.quizId?.title || 'Quiz'}</p>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={9} /> {date}
                      </p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${isPassed ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</span>
                  </button>
                );
              })}
            </div>
          )}

          <button onClick={() => navigate('/student/quizzes')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 text-xs font-bold border border-slate-100 hover:border-emerald-100 transition-all">
            Go to Quiz Zone
          </button>
        </div>
      </div>
    </div>
  );
}