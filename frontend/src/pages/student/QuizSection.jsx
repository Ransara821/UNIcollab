import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, History, ArrowRight, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMyAttempts } from '../../services/quizService';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function QuizSection() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    getMyAttempts().then(res => setHistory(res.data.data.slice(0, 4))).catch(()=>null);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-500 rounded-[2rem] p-10 text-white shadow-2xl shadow-indigo-600/20 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-indigo-900/20 rounded-full blur-2xl -mb-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">Academic Quiz Center</h1>
          <p className="text-lg font-medium text-indigo-50 max-w-2xl leading-relaxed">Test your knowledge systematically. Access midterms, module assessments, and official evaluations mapped precisely to your curriculum.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        <div onClick={() => navigate('/student/quizzes/leaderboard')} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-amber-200/50">
            <Trophy size={36} className="text-amber-500 drop-shadow-sm"/>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">University Leaderboards</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Discover top performers across the entire university network by subject and semester.</p>
          <div className="mt-6 w-full py-3 bg-slate-50 rounded-xl font-bold text-amber-600 text-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">Access Rankings</div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><History className="text-indigo-500" size={24}/> Recent Attempts History</h3>
          </div>
          {history.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center py-6">
                <BookOpen size={48} className="text-slate-200 mb-3" />
                <p className="text-slate-400 font-semibold">You have not taken any quizzes yet.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {history.map(att => (
                <div key={att._id} onClick={() => navigate(`/student/quizzes/result/${att._id}`)} className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-700 transition-colors">{att.quizId?.title || 'Unknown Quiz'}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-300"/> {new Date(att.submittedAt || att.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {att.status === 'completed' ? (
                      <>
                        <p className={`font-black text-lg ${att.score >= (att.quizId?.passMark||0) ? 'text-emerald-500' : 'text-red-500'}`}>{att.score} <span className="text-sm text-slate-400 font-bold">/ {att.totalMarks || att.totalQuestions}</span></p>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Final Score</p>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><GraduationCap size={20}/></div>
         <h2 className="text-2xl font-black text-slate-900">Select Academic Year</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {YEARS.map((y, i) => (
          <div key={y} onClick={() => navigate(`/student/quizzes/${y}`)} className="bg-white rounded-3xl p-6 border-2 border-slate-200/60 shadow-sm hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-40">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none">
              <span className="text-9xl font-black">{i+1}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 relative z-10 group-hover:text-indigo-700 transition-colors">{y}</h3>
            <div className="mt-auto flex items-center justify-end relative z-10">
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <ArrowRight size={16}/>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
