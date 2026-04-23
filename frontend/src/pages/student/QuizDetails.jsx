import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, startAttempt, getMyAttempts } from '../../services/quizService';
import { ArrowLeft, Clock, HelpCircle, AlertTriangle, CheckCircle, ShieldAlert, GraduationCap, FileText, XCircle } from 'lucide-react';

function ConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-emerald-500" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Start Knowledge Check</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5 leading-relaxed">Are you sure you want to begin? The strict timer cannot be paused once initiated.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full pt-1">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all">
            Begin Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, aRes] = await Promise.all([getQuizById(id), getMyAttempts()]);
        setQuiz(qRes.data.data);
        setAttempts(aRes.data.data.filter(a => a.quizId?._id === id || a.quizId === id));
      } catch (err) { } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const executeStart = async () => {
    setShowConfirm(false);
    setStarting(true);
    try {
      await startAttempt({ quizId: id });
      navigate(`/student/quizzes/${id}/attempt`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting attempt');
      setStarting(false);
    }
  };

  const executeResume = async () => {
    setStarting(true);
    try {
      await startAttempt({ quizId: id });
    } catch (_) { }
    navigate(`/student/quizzes/${id}/attempt`);
  };

  if(loading) return <div className="p-20 text-center animate-pulse text-emerald-500 font-bold text-xl flex flex-col items-center justify-center gap-3"><div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>Loading Quiz...</div>;
  if(!quiz) return <div className="p-20 text-center text-red-500 font-bold">Error 104 - Assessment Missing.</div>;

  const inProgress = attempts.find(a => a.status === 'in-progress');
  const completed = attempts.filter(a => a.status === 'completed');
  const canAttempt = !inProgress && completed.length < quiz.attemptsAllowed;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in py-12 pb-24">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit hover:shadow-md hover:border-emerald-200">
        <ArrowLeft size={18}/> Back to Term Listings
      </button>

      <div className="bg-white rounded-[2rem] p-10 lg:p-14 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
        
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-10 border-b border-slate-100 pb-10">
           <div className="flex-1">
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 inline-block shadow-sm">Official Protocol</span>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{quiz.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-fit"><GraduationCap size={18} className="text-emerald-500"/> Module Context: <span className="text-slate-800">{quiz.subjectId?.name || 'General Evaluation Requirement'}</span></div>
           </div>
           
           <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 min-w-[240px] shadow-inner">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Criteria</span>
                 <span className="font-black text-lg text-slate-800">{quiz.passMark} <span className="text-sm font-bold text-slate-400">PTS</span></span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-2 shadow-inner">
                 <div className="bg-emerald-500 h-3 rounded-full shadow-md relative" style={{ width: `${Math.min((quiz.passMark / Math.max(quiz.totalMarks, 1))*100, 100)}%` }}>
                    <div className="absolute right-0 top-0 w-1 h-3 bg-white/40" />
                 </div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-bold uppercase mt-1">out of {quiz.totalMarks} total</p>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
           <div>
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3"><FileText className="text-emerald-500"/> Context & Overview</h3>
              <p className="text-slate-600 font-semibold leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[15px] shadow-inner">{quiz.description}</p>
           </div>
           
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3"><ShieldAlert className="text-emerald-500"/> Protocol Rules</h3>
              <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
                 <span className="flex items-center gap-3 font-semibold text-slate-700 tracking-wide"><Clock size={20} className="text-emerald-500"/> strict Time Limit</span>
                 <span className="font-black bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100">{quiz.timeLimit} Mins</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
                 <span className="flex items-center gap-3 font-semibold text-slate-700 tracking-wide">
                   <HelpCircle size={20} className="text-emerald-500"/>
                   {quiz.questionsToDisplay && quiz.questionsToDisplay < (quiz.questions?.length || 0) ? 'Questions Per Attempt' : 'Total Questions'}
                 </span>
                 <span className="font-black bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100">
                   {quiz.questionsToDisplay && quiz.questionsToDisplay < (quiz.questions?.length || 0) ? quiz.questionsToDisplay : (quiz.questions?.length || 0)}
                 </span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
                 <span className="flex items-center gap-3 font-semibold text-slate-700 tracking-wide"><AlertTriangle size={20} className="text-emerald-500"/> Allowed Submissions</span>
                 <span className="font-black bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100">{quiz.attemptsAllowed} Maximum</span>
              </div>
           </div>
        </div>

        <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
           <div>
              <h4 className="font-black text-emerald-900 mb-1.5 text-lg">Readiness Check</h4>
              <p className="text-sm font-semibold text-emerald-700/70">You have completed <span className="text-emerald-600 font-bold">{completed.length}</span> out of {quiz.attemptsAllowed} potential attempts.</p>
           </div>
           
           {inProgress ? (
              <button disabled={starting} onClick={executeResume} className="w-full md:w-auto px-10 py-4 rounded-xl font-black text-white shadow-xl shadow-amber-500/30 transition-all bg-amber-500 hover:bg-amber-600 hover:-translate-y-1">
                {starting ? 'Loading...' : 'Resume Active Attempt'}
              </button>
           ) : canAttempt ? (
              <button disabled={starting} onClick={() => setShowConfirm(true)} className="w-full md:w-auto px-12 py-4 rounded-xl font-black text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all text-lg tracking-wide bg-emerald-500 hover:bg-emerald-600">
                {starting ? 'Starting...' : 'Start Quiz'}
              </button>
           ) : (
              <div className="px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-black flex items-center gap-3 shadow-inner">
                 <XCircle size={22}/> Access Protocol Locked
              </div>
            )}
         </div>
      </div>

      {showConfirm && (
        <ConfirmationModal 
          onCancel={() => setShowConfirm(false)} 
          onConfirm={executeStart} 
        />
      )}
    </div>
  );
}
