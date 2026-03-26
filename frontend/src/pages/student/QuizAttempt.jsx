import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetails, getQuizQuestions, submitQuiz } from '../../services/quizService';
import { Clock, ChevronLeft, ChevronRight, Send, BookMarked, AlertCircle } from 'lucide-react';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [quizRes, questionsRes] = await Promise.all([getQuizDetails(id), getQuizQuestions(id)]);
        setQuiz(quizRes.data.data);
        setQuestions(questionsRes.data.data);
      } catch { setError('Failed to load quiz. Please try again.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSelect = (answerKey) => setAnswers(prev => ({ ...prev, [currentIndex]: answerKey }));

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = questions.map((_, i) => answers[i] || null);
      const res = await submitQuiz(id, { answers: formattedAnswers, questions, duration });
      navigate(`/student/quizzes/result/${res.data.data.attemptId}`);
    } catch { setError('Failed to submit. Please try again.'); setSubmitting(false); }
  }, [id, answers, questions, startTime, navigate, submitting]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const optionKeys = ['a', 'b', 'c', 'd', 'e', 'f'];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#EEF2FF', borderTopColor: '#4F46E5' }} />
        <p className="text-slate-500 text-sm">Loading quiz…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="text-center p-8 rounded-2xl border border-red-200 bg-red-50">
        <AlertCircle size={36} className="mx-auto mb-3" style={{ color: '#DC2626' }} />
        <p className="font-semibold text-red-700 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#DC2626' }}>Go Back</button>
      </div>
    </div>
  );

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const options = currentQ
    ? Object.entries(currentQ.answers || {}).filter(([, v]) => v !== null).map(([key, val]) => ({ rawKey: key, key: key.replace('answer_', ''), label: val }))
    : [];

  return (
    <div className="min-h-screen p-4 sm:p-8 animate-fade-in" style={{ background: '#F8FAFC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Top Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 mb-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              <BookMarked size={16} color="white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{quiz?.title}</p>
              <p className="text-xs text-slate-400">{quiz?.year} · {quiz?.semester}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono font-semibold text-sm px-3 py-1.5 rounded-lg"
              style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Clock size={14} /> {fmt(timer)}
            </span>
            <span className="text-xs text-slate-400">{answeredCount}/{questions.length} answered</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: '#E2E8F0' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4F46E5, #06B6D4)' }} />
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-5">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>{currentIndex + 1}</span>
              <p className="font-medium text-slate-800 leading-relaxed">{currentQ.question}</p>
            </div>
            <div className="space-y-2.5">
              {options.map(({ key, label, rawKey }) => {
                const isSelected = answers[currentIndex] === rawKey;
                return (
                  <button key={key} onClick={() => handleSelect(rawKey)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150"
                    style={{
                      borderColor: isSelected ? '#4F46E5' : '#E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#F8FAFC',
                    }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: isSelected ? '#4F46E5' : '#E2E8F0', color: isSelected ? 'white' : '#64748B' }}>
                      {key.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium" style={{ color: isSelected ? '#3730A3' : '#334155' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30">
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: i === currentIndex ? '#4F46E5' : answers[i] ? '#DCFCE7' : '#F1F5F9',
                  color: i === currentIndex ? 'white' : answers[i] ? '#16A34A' : '#64748B',
                }}>{i + 1}</button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button onClick={() => setCurrentIndex(i => i + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#4F46E5' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              <Send size={14} /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
