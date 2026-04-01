import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyAttempts } from '../../services/quizService';
import { ArrowLeft, CheckCircle2, XCircle, Award, Target, Brain, AlertCircle } from 'lucide-react';

export default function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyAttempts();
        const found = res.data.data.find(a => a._id === attemptId);
        setAttempt(found);
      } catch (err) {} finally { setLoading(false); }
    };
    load();
  }, [attemptId]);

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500 font-bold text-xl">Compiling Analytics Node...</div>;
  if (!attempt) return <div className="p-20 text-center text-red-500 font-bold">Attempt Record Corrupted or Missing.</div>;

  const percent = Math.round((attempt.score / (attempt.totalQuestions || 1)) * 100);
  const passed = percent >= (attempt.quizId?.passMark || 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in pb-20 mt-6">
       <button onClick={() => navigate('/student/quizzes')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit hover:shadow-md">
        <ArrowLeft size={18}/> Access Main Dashboard
      </button>

      <div className={`rounded-[2.5rem] p-10 lg:p-14 border mb-10 text-center relative overflow-hidden shadow-2xl transition-all ${passed ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30' : 'bg-red-500 border-red-400 shadow-red-500/30'}`}>
         <div className="absolute inset-0 bg-white/10 opacity-40 block mix-blend-overlay"></div>
         <div className="relative z-10 text-white">
            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner border-[6px] ${passed ? 'bg-emerald-400 border-emerald-300' : 'bg-red-400 border-red-300'}`}>
               {passed ? <Award size={56} className="text-white drop-shadow-md" /> : <AlertCircle size={56} className="text-white drop-shadow-md" />}
            </div>
            <h1 className="text-5xl font-black mb-3 drop-shadow-sm tracking-tight">{passed ? 'PASSED' : 'FAILED'}</h1>
            <p className="text-xl font-bold opacity-90 mb-10">{attempt.quizId?.title}</p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 bg-white/10 p-6 md:p-8 rounded-[2rem] border border-white/20 backdrop-blur-md w-fit mx-auto">
               <div className="text-center px-4">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Yield</p>
                  <p className="text-4xl lg:text-5xl font-black drop-shadow-sm">{attempt.score} <span className="text-xl opacity-60 ml-1">/ {attempt.totalQuestions}</span></p>
               </div>
               <div className="w-full md:w-px h-px md:h-16 bg-white/30"></div>
               <div className="text-center px-4">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Accuracy Matrix</p>
                  <p className="text-4xl lg:text-5xl font-black drop-shadow-sm">{percent}%</p>
               </div>
               <div className="w-full md:w-px h-px md:h-16 bg-white/30"></div>
               <div className="text-center px-4">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Clock Phase</p>
                  <p className="text-4xl lg:text-5xl font-black drop-shadow-sm">{Math.floor(attempt.durationUsed / 60)}<span className="text-xl opacity-60 text-lowercase ml-1">m</span></p>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><Brain className="text-indigo-500" size={28}/> Evaluation Report</h2>
         
         {attempt.answers?.map((ans, i) => (
            <div key={ans._id || i} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group hover:border-indigo-200">
               <div className={`absolute top-0 left-0 w-2 h-full transition-opacity ${ans.isCorrect ? 'bg-emerald-500 opacity-60 group-hover:opacity-100' : 'bg-red-500 opacity-60 group-hover:opacity-100'}`} />
               <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border-2 transition-transform group-hover:scale-110 ${ans.isCorrect ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                     {ans.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-lg font-bold text-slate-800 mb-5 tracking-tight leading-relaxed flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                        <span className="flex-1"><span className="text-indigo-500 font-black mr-2 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Q{i+1}</span> {ans.questionId?.question || ans.questionId?.questionText || 'Node Data Corrupted'}</span>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border-2 border-slate-100 shrink-0 shadow-sm">{ans.marksAwarded} / {ans.questionId?.marks || 1} PTS</span>
                     </p>
                     
                     <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-600 shadow-inner">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Provided Node Link</span>
                           {ans.selectedAnswer ? `Variant ${ans.selectedAnswer.toUpperCase()}` : <span className="text-red-400 italic font-semibold">Offline (Skipped)</span>}
                        </div>
                        <div className="p-4 rounded-2xl font-bold border-2 border-emerald-100 bg-emerald-50 text-emerald-700 shadow-inner">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Authenticated Key</span>
                           Variant {ans.correctAnswer?.toUpperCase()}
                        </div>
                     </div>
                     
                     {ans.questionId?.explanation && (
                        <div className="mt-5 p-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40">
                           <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-2"><Target size={14}/> Academic Synopsis</p>
                           <p className="text-sm font-semibold text-indigo-900 leading-relaxed opacity-90">{ans.questionId.explanation}</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
