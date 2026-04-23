import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, getQuestions, getMyAttempts, submitAttempt } from '../../services/quizService';
import { Clock, ShieldAlert, CheckCircle, ChevronRight, ChevronLeft, Flag, Send } from 'lucide-react';

function ConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-indigo-500" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Finish Assessment</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5 leading-relaxed">Are you sure you want to submit your answers? You cannot change them after submission.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full pt-1">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors">
            Review Answers
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition-all">
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadData = async () => {
    try {
      const [qRes, qsRes, aRes] = await Promise.all([getQuizById(id), getQuestions(id), getMyAttempts()]);
      const quizData = qRes.data.data;
      const atts = aRes.data.data;
      const active = atts.find(a => (a.quizId?._id === id || a.quizId === id) && a.status === 'in-progress');
      
      if (!active) {
        alert("No active attempt found. Start the quiz properly.");
        return navigate(`/student/quizzes/${id}/details`);
      }

      setQuiz(quizData);

      let questionsData = qsRes.data.data;
      if (active.selectedQuestionIds && active.selectedQuestionIds.length > 0) {
        const qMap = {};
        questionsData.forEach(q => { qMap[q._id] = q; });
        const ordered = active.selectedQuestionIds.map(sid => qMap[sid.toString ? sid.toString() : sid]).filter(Boolean);
        if (ordered.length > 0) questionsData = ordered;
      } else if (quizData.questionsToDisplay && quizData.questionsToDisplay < questionsData.length) {
        const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
        questionsData = shuffled.slice(0, quizData.questionsToDisplay);
      }
      setQuestions(questionsData);
      setAttempt(active);

      const elapsedSec = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
      const remainingSec = (quizData.timeLimit * 60) - elapsedSec;
      setTimeLeft(remainingSec > 0 ? remainingSec : 0);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
      const res = await submitAttempt(attempt._id, payload);
      navigate(`/student/quizzes/result/${res.data.data._id}`, { replace: true });
    } catch (err) {
      alert("Submission Error: " + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  }, [answers, attempt, submitting, navigate]);

  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft <= 0) {
      handleSubmit(); 
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, submitting, handleSubmit]);

  const selectAnswer = (qId, optionKey) => {
    setAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const currentQ = questions[currentIdx];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500 font-bold text-xl">Securing execution environment...</div>;
  if (!quiz || !attempt) return null;

  const isWarning = timeLeft < 60; 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-fade-in relative z-50 fixed inset-0">
       <div className="bg-white border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
               <ShieldAlert size={20}/>
             </div>
             <div>
               <h2 className="font-black text-slate-800 text-lg">{quiz.title}</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Sec Session</p>
             </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 font-black text-xl transition-colors ${isWarning ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
             <Clock size={24} className={isWarning ? 'text-red-500' : 'text-slate-400'}/>
             {formatTime(timeLeft)}
          </div>
       </div>

       <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex flex-col">
             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 lg:p-12 mb-6 flex-1 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                   <span className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-sm border border-indigo-100/50">Question {currentIdx + 1} of {questions.length}</span>
                   <span className="text-slate-400 font-bold text-sm bg-slate-50 px-3 py-1 rounded-md">{currentQ.marks} PTS</span>
                </div>

                <h3 className="text-2xl font-black text-slate-800 leading-relaxed mb-10">{currentQ.questionText}</h3>

                <div className="space-y-4">
                   {currentQ.options?.map(opt => {
                      const isSelected = answers[currentQ._id] === opt.key;
                      return (
                         <div key={opt.key} onClick={() => selectAnswer(currentQ._id, opt.key)} className={`w-full text-left p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 hover:-translate-y-0.5 ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-500/10' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-slate-50'}`}>
                               {isSelected && <div className="w-3 h-3 bg-white rounded-full"/>}
                            </div>
                            <span className={`font-semibold text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.text}</span>
                         </div>
                      );
                   })}
                </div>
             </div>

             <div className="flex items-center justify-between">
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)} className="px-6 py-3.5 rounded-xl font-bold border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 transition-colors flex items-center gap-2"><ChevronLeft size={18}/> Previous</button>
                {currentIdx === questions.length - 1 ? (
                   <button disabled={submitting} onClick={() => setShowConfirmModal(true)} className="px-8 py-3.5 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">Finish Exam <Send size={18}/></button>
                ) : (
                   <button onClick={() => setCurrentIdx(i => i + 1)} className="px-8 py-3.5 rounded-xl font-black text-white bg-slate-800 hover:bg-indigo-600 shadow-lg transition-all flex items-center gap-2">Next <ChevronRight size={18}/></button>
                )}
             </div>
          </div>

          <div className="hidden lg:block">
             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-6 sticky top-32">
                <h4 className="font-black text-slate-800 mb-6 uppercase tracking-wider text-sm flex items-center gap-2"><Flag className="text-indigo-500"/>Navigator</h4>
                <div className="grid grid-cols-5 gap-3">
                   {questions.map((q, i) => {
                      const isAns = answers[q._id];
                      const isCurr = currentIdx === i;
                      return (
                         <button key={q._id} onClick={() => setCurrentIdx(i)} className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${isCurr ? 'ring-4 ring-indigo-200 ring-offset-1 bg-indigo-600 text-white shadow-md' : isAns ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-700' : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                            {i + 1}
                         </button>
                      );
                   })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                   <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md border-2 border-slate-200 bg-white"/> Unanswered</div>
                   <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md border-2 border-indigo-200 bg-indigo-50"/> Attempted</div>
                   <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-indigo-600"/> Current Node</div>
                </div>

                <button disabled={submitting} onClick={() => setShowConfirmModal(true)} className="mt-8 w-full py-3 rounded-xl border-2 border-slate-900 bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">Submit All</button>
             </div>
          </div>
       </div>

       {submitting && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
             <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Syncing Results...</h3>
                <p className="font-semibold text-slate-500">Transmitting secure package payload to server cluster.</p>
             </div>
          </div>
       )}

        {showConfirmModal && (
          <ConfirmationModal 
             onCancel={() => setShowConfirmModal(false)}
             onConfirm={() => {
               setShowConfirmModal(false);
               handleSubmit();
             }}
          />
        )}
    </div>
  );
}
