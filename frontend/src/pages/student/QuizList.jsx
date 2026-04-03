import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzes, getMyAttempts } from '../../services/quizService';
import { ArrowLeft, BookOpen, Clock, HelpCircle, ChevronRight, AlertCircle, PlayCircle, Eye } from 'lucide-react';

export default function QuizList() {
  const { year, semester } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          getQuizzes({ year, semester }),
          getMyAttempts()
        ]);
        setQuizzes(qRes.data.data);
        setAttempts(aRes.data.data);
      } catch (err) { } finally { setLoading(false); }
    };
    load();
  }, [year, semester]);

  const getAttemptStatus = (quizId) => {
    return attempts.filter(a => a.quizId?._id === quizId || a.quizId === quizId);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in py-12">
      <button onClick={() => navigate(`/student/quizzes/${year}`)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit hover:shadow-md">
        <ArrowLeft size={18}/> Back to Semesters
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <BookOpen className="text-indigo-500"/> {year} — {semester}
        </h1>
        <p className="text-slate-500 font-medium mt-2">Available assessments and assignments for your module.</p>
      </div>

      {loading ? <div className="text-indigo-500 font-bold py-20 animate-pulse text-center">Fetching assigned modules...</div> : 
      <div className="grid gap-6">
        {quizzes.length === 0 && (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Assessments</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">There are currently no published quizzes available for this specific semester tracking. Check back later.</p>
          </div>
        )}

        {quizzes.map(quiz => {
           const myAttempts = getAttemptStatus(quiz._id);
           const isCompleted = myAttempts.some(a => a.status === 'completed');
           const isInProgress = myAttempts.some(a => a.status === 'in-progress');
           const currentAtt = myAttempts[0];

           return (
            <div key={quiz._id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex-1">
                 <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{quiz.title}</h2>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700' : quiz.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{quiz.difficulty}</span>
                    {isCompleted && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">Completed</span>}
                    {isInProgress && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">In Progress</span>}
                 </div>
                 
                 <p className="text-slate-500 text-sm font-medium mb-6 max-w-3xl line-clamp-2">{quiz.description}</p>
                 
                 <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-2xl w-fit">
                    <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg"><BookOpen size={16}/> {quiz.subjectId?.name || 'General'}</span>
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> {quiz.timeLimit} Minutes</span>
                    <span className="flex items-center gap-1.5"><HelpCircle size={16} className="text-slate-400"/> {quiz.questionCount} Questions</span>
                 </div>
               </div>

               <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {isCompleted ? (
                    <div className="text-right w-full">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Highest Score</p>
                       <p className={`text-2xl font-black ${currentAtt.score >= quiz.passMark ? 'text-emerald-500' : 'text-red-500'}`}>{currentAtt.score} <span className="text-sm font-bold text-slate-400">/ {quiz.questionCount}</span></p>
                       <button onClick={() => navigate(`/student/quizzes/result/${currentAtt._id}`)} className="mt-3 w-full py-2.5 px-6 rounded-xl font-bold bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"><Eye size={18}/> Review Result</button>
                    </div>
                  ) : (
                    <button onClick={() => navigate(`/student/quizzes/${quiz._id}/details`)} className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 text-base" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                       {isInProgress ? <><PlayCircle size={20}/> Resume Attempt</> : <><PlayCircle size={20}/> Enter Details</>}
                    </button>
                  )}
               </div>
            </div>
           );
        })}
      </div>
      }
    </div>
  );
}
