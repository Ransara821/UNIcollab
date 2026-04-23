import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, History, ArrowRight, GraduationCap, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMyAttempts } from '../../services/quizService';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const YEAR_COLORS = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hover: 'hover:border-emerald-400', arrow: 'group-hover:bg-emerald-600', num: 'text-emerald-100' },
  { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    hover: 'hover:border-teal-400',    arrow: 'group-hover:bg-teal-600',    num: 'text-teal-100' },
  { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   hover: 'hover:border-blue-400',   arrow: 'group-hover:bg-blue-600',   num: 'text-blue-100' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', hover: 'hover:border-purple-400', arrow: 'group-hover:bg-purple-600', num: 'text-purple-100' },
];

export default function QuizSection() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getMyAttempts().then(res => setHistory(res.data.data.slice(0, 4))).catch(() => null);
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-20 font-sans">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 rounded-[2rem] p-10 text-white shadow-2xl shadow-emerald-600/20 mb-10 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-52 h-52 bg-teal-900/20 rounded-full blur-2xl -mb-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white/90 text-xs font-black uppercase tracking-widest mb-4">
              <Zap size={13} /> Academic Assessment Centre
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-sm">Quiz Centre</h1>
            <p className="text-base font-medium text-emerald-50 max-w-xl leading-relaxed">
              Test your knowledge systematically. Access midterms, module assessments, and official evaluations mapped to your curriculum.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-3">
            <button onClick={() => navigate('/student/quizzes/leaderboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 transition-all hover:-translate-y-0.5">
              <Trophy size={18} /> View Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* ── Top row: Leaderboard card + Recent Attempts ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">

        {/* Leaderboard card */}
        <div
          onClick={() => navigate('/student/quizzes/leaderboard')}
          className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner border border-amber-200/50">
            <Trophy size={34} className="text-amber-500 drop-shadow-sm" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">University Rankings</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
            Discover top performers across the university by subject and semester.
          </p>
          <div className="mt-auto w-full py-3 bg-slate-50 rounded-xl font-black text-amber-600 text-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
            Access Rankings
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <History className="text-emerald-600" size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-800">Recent Attempts</h3>
          </div>

          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-semibold text-sm">You haven't taken any quizzes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(att => (
                <div
                  key={att._id}
                  onClick={() => navigate(`/student/quizzes/result/${att._id}`)}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                      {att.quizId?.title || 'Unknown Quiz'}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {new Date(att.submittedAt || att.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {att.status === 'completed' ? (
                      <>
                        <p className={`font-black text-base ${att.score >= (att.quizId?.passMark || 0) ? 'text-emerald-600' : 'text-red-500'}`}>
                          {att.score} <span className="text-xs text-slate-400 font-bold">/ {att.totalMarks || att.totalQuestions}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Final Score</p>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black uppercase tracking-wider">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Year Selection ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <GraduationCap size={18} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Select Academic Year</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {YEARS.map((y, i) => {
          const c = YEAR_COLORS[i];
          return (
            <div
              key={y}
              onClick={() => navigate(`/student/quizzes/${y}`)}
              className={`bg-white rounded-3xl p-6 border-2 ${c.border} ${c.hover} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-40`}
            >
              {/* Big faded number */}
              <div className={`absolute -right-2 -bottom-4 font-black text-8xl ${c.num} pointer-events-none select-none transition-all duration-500 group-hover:scale-110 group-hover:opacity-80`}>
                {i + 1}
              </div>
              <h3 className={`text-xl font-black relative z-10 ${c.text}`}>{y}</h3>
              <div className="mt-auto flex items-center justify-between relative z-10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">View Quizzes</span>
                <div className={`w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 ${c.arrow} group-hover:text-white group-hover:border-transparent transition-all`}>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
