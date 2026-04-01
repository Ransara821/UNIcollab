import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/quizService';
import { Trophy, Medal, Star, ArrowLeft, GraduationCap, Award } from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
       try {
          const res = await getLeaderboard();
          setLeaders(res.data.data);
       } catch (err) {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-amber-500 font-bold text-xl flex flex-col items-center justify-center gap-4"><Trophy size={48} className="animate-bounce"/><p>Compiling Global Rankings Matrix...</p></div>;

  const filtered = filter ? leaders.filter(l => l.quizTitle?.toLowerCase().includes(filter.toLowerCase()) || l.subjectName?.toLowerCase().includes(filter.toLowerCase()) || l.userName?.toLowerCase().includes(filter.toLowerCase())) : leaders;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in py-12 pb-24 mt-4 relative">
       <button onClick={() => navigate('/student/quizzes')} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold mb-8 transition-colors bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit hover:shadow-md">
        <ArrowLeft size={18}/> Access Main Dashboard
      </button>

      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-[2.5rem] p-10 lg:p-14 text-white shadow-2xl shadow-orange-500/20 mb-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay pointer-events-none" />
         <div className="relative z-10 text-center">
            <Trophy size={64} className="mx-auto mb-6 drop-shadow-md text-amber-50" />
            <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tight drop-shadow-sm">Global Leaderboard</h1>
            <p className="text-lg font-bold text-amber-50 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">Tracking the highest performing students across all modules. Excellence is measured strictly by assessment accuracy and completion speed.</p>
         </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
         <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shrink-0 shadow-inner">
               <Award size={28}/>
            </div>
            <div>
               <h3 className="font-black text-slate-800 text-xl mb-1">Subject Rankings</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time statistics updated upon submission</p>
            </div>
         </div>
         <input type="text" placeholder="Filter by Name, Assessment, or Module..." value={filter} onChange={e=>setFilter(e.target.value)} className="w-full md:w-[400px] bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:border-amber-400 focus:bg-white transition-all shadow-inner" />
      </div>

      <div className="space-y-5">
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm text-slate-500">
               <Star size={56} className="mx-auto mb-5 text-slate-200" />
               <h3 className="text-xl font-bold">No ranking data found for your query.</h3>
            </div>
         ) : (
            filtered.map((entry, idx) => (
               <div key={`${entry.userId}-${entry.quizId}`} className="bg-white rounded-[2rem] p-6 lg:p-8 border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-2 h-full transition-opacity ${idx === 0 ? 'bg-amber-400 opacity-100' : idx === 1 ? 'bg-slate-300 opacity-100' : idx === 2 ? 'bg-orange-500 opacity-100' : 'bg-transparent'}`} />
                  
                  <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 border-[4px] shadow-sm transform transition-transform group-hover:rotate-3 ${idx === 0 ? 'bg-amber-50 text-amber-500 border-amber-200 scale-110 shadow-amber-500/20' : idx === 1 ? 'bg-slate-50 text-slate-500 border-slate-200' : idx === 2 ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                     <span className="text-[10px] font-black uppercase mb-0.5 opacity-70 tracking-widest">Rank</span>
                     <span className="text-2xl font-black leading-none">#{idx + 1}</span>
                  </div>

                  <div className="flex-1 text-center md:text-left min-w-0 flex flex-col justify-center">
                     <h3 className="text-3xl font-black text-slate-900 mb-3 truncate group-hover:text-amber-500 transition-colors tracking-tight">{entry.userName}</h3>
                     <p className="text-sm font-bold text-indigo-600 flex items-center justify-center md:justify-start gap-2.5 truncate bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 w-fit mx-auto md:mx-0">
                        <GraduationCap size={16} className="text-indigo-500 shrink-0"/> ID: <span className="tracking-wider">{entry.studentId || 'N/A'}</span>
                     </p>
                  </div>

                  <div className="flex items-center bg-slate-50 p-6 rounded-2xl border border-slate-100/60 shadow-inner w-full md:w-auto justify-center shrink-0 min-w-[160px]">
                     <div className="text-center px-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Marks</p>
                        <p className="text-4xl font-black text-emerald-500 drop-shadow-sm">{entry.score}</p>
                     </div>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
