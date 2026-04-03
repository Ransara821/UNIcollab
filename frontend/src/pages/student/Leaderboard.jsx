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
            filtered.map((entry, idx) => {
               const isRank1 = idx === 0;
               const isRank2 = idx === 1;
               const isRank3 = idx === 2;

               // Responsive hierarchy base classes
               const heightClass   = isRank1 ? 'md:h-[120px]' : isRank2 ? 'md:h-[100px]' : 'md:h-[90px]';
               const badgeSize     = isRank1 ? 'w-20 h-20' : isRank2 ? 'w-[60px] h-[60px]' : 'w-[52px] h-[52px]';
               const badgeNumber   = isRank1 ? 'text-3xl' : isRank2 ? 'text-2xl' : 'text-xl';
               const badgeLabel    = isRank1 ? 'text-[10px]' : 'text-[9px]';
               const nameSize      = isRank1 ? 'text-3xl' : isRank2 ? 'text-2xl' : 'text-xl';
               const scoreSize     = isRank1 ? 'text-4xl' : isRank2 ? 'text-3xl' : 'text-2xl';
               const scoreBoxPad   = isRank1 ? 'px-6 py-4' : isRank2 ? 'px-5 py-3' : 'px-5 py-2';

               return (
               <div key={`${entry.userId}-${entry.quizId}`} className={`bg-white rounded-3xl lg:rounded-[2rem] px-6 py-5 ${heightClass} h-auto border-2 border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-amber-200 transition-all flex flex-col md:flex-row items-center gap-6 group relative overflow-hidden`}>
                  
                  {/* Left accent color strip */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${isRank1 ? 'bg-amber-400 opacity-100' : isRank2 ? 'bg-slate-300 opacity-100' : isRank3 ? 'bg-orange-500 opacity-100' : 'bg-transparent'}`} />
                  
                  {/* Rank Badge */}
                  <div className={`${badgeSize} rounded-2xl flex flex-col items-center justify-center shrink-0 border-[3px] shadow-sm transform transition-transform group-hover:rotate-3 ${isRank1 ? 'bg-amber-50 text-amber-500 border-amber-200 group-hover:scale-110 shadow-amber-500/20' : isRank2 ? 'bg-slate-50 text-slate-500 border-slate-200' : isRank3 ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                     <span className={`${badgeLabel} font-black uppercase tracking-widest opacity-70 leading-none mb-0.5`}>Rank</span>
                     <span className={`${badgeNumber} font-black leading-none`}>#{idx + 1}</span>
                  </div>

                  {/* Student Name */}
                  <div className="flex-1 text-center md:text-left min-w-0 flex flex-col justify-center">
                     <h3 className={`${nameSize} font-black text-slate-900 truncate group-hover:text-amber-500 transition-colors tracking-tight`}>{entry.userName}</h3>
                  </div>

                  {/* Score Container */}
                  <div className={`flex items-center bg-slate-50 rounded-2xl border border-slate-100/60 shadow-inner w-full md:w-auto justify-center shrink-0 min-w-[120px] ${scoreBoxPad}`}>
                     <div className="text-center px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Marks</p>
                        <p className={`${scoreSize} font-black text-emerald-500 drop-shadow-sm leading-none`}>{entry.score}</p>
                     </div>
                  </div>
               </div>
               );
            })
         )}
      </div>
    </div>
  );
}
