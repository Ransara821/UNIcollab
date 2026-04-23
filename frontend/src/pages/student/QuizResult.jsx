import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyAttempts } from '../../services/quizService';
import { ArrowLeft, CheckCircle2, XCircle, Award, AlertCircle, Brain, Lightbulb } from 'lucide-react';

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
      } catch (err) { } finally { setLoading(false); }
    };
    load();
  }, [attemptId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-500">Loading your result...</p>
    </div>
  );
  if (!attempt) return (
    <div className="p-20 text-center text-red-500 font-bold">Result not found.</div>
  );

  const safeTotalQ = attempt.totalQuestions || 0;
  
  // Strictly truncate to 2 decimals without rounding (e.g., 66.666... -> 66.66)
  let percent = 0;
  if (safeTotalQ > 0) {
    const rawPercent = (attempt.score / safeTotalQ) * 100;
    const strMatch = rawPercent.toString().match(/^-?\d+(?:\.\d{0,2})?/);
    percent = strMatch ? parseFloat(strMatch[0]) : 0;
  }

  const passed   = percent >= (attempt.quizId?.passMark || 0);
  const totalPts = attempt.answers?.reduce((s, a) => s + (a.questionId?.marks || 1), 0) ?? attempt.totalQuestions;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto pb-24 font-sans">

      {/* Back */}
      <button
        onClick={() => navigate('/student/quizzes')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit hover:border-emerald-200 hover:shadow-md text-sm"
      >
        <ArrowLeft size={16} /> Back to Quizzes
      </button>

      {/* ── Result Hero ── */}
      <div className={`rounded-[2rem] p-8 lg:p-12 mb-10 text-center relative overflow-hidden shadow-2xl ${passed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 text-white">
          {/* Icon */}
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-5 border-4 ${passed ? 'bg-emerald-400 border-emerald-300' : 'bg-red-400 border-red-300'}`}>
            {passed ? <Award size={48} className="drop-shadow-md" /> : <AlertCircle size={48} className="drop-shadow-md" />}
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2 drop-shadow-sm">{passed ? 'PASSED' : 'FAILED'}</h1>
          <p className="text-lg font-semibold opacity-80 mb-8">{attempt.quizId?.title}</p>

          {/* Stats strip */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-5">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Score</p>
              <p className="text-3xl font-black">
                {attempt.score}
                <span className="text-lg font-bold opacity-60"> / {safeTotalQ}</span>
              </p>
            </div>
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Accuracy</p>
              <p className="text-3xl font-black">{percent}%</p>
            </div>
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Time Used</p>
              <p className="text-3xl font-black">
                {Math.floor((attempt.durationUsed || 0) / 60)}
                <span className="text-lg font-bold opacity-60">m</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Evaluation Report ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Brain size={18} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Evaluation Report</h2>
        <span className="ml-auto text-sm font-bold text-slate-400">{attempt.answers?.length ?? 0} Questions</span>
      </div>

      <div className="space-y-5">
        {attempt.answers?.map((ans, i) => {
          const options      = ans.questionId?.options ?? [];
          const correctKey   = ans.correctAnswer;
          const selectedKey  = ans.selectedAnswer;
          const isCorrect    = ans.isCorrect;
          const questionText =
            ans.questionId?.questionText ||
            ans.questionId?.question ||
            'Question text unavailable';
          const marks        = ans.questionId?.marks ?? 1;
          const awarded      = ans.marksAwarded ?? 0;
          const explanation  = ans.questionId?.explanation;

          return (
            <div
              key={ans._id || i}
              className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${isCorrect ? 'border-slate-100' : 'border-slate-100'}`}
            >
              {/* ── Question header ── */}
              <div className={`px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-slate-100`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Q-number badge */}
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Q{i + 1}
                  </span>
                  {/* Question text */}
                  <p className="text-base font-bold text-slate-900 leading-snug">{questionText}</p>
                </div>

                {/* Score chip */}
                <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                  isCorrect
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {awarded} / {marks} pts
                </div>
              </div>

              {/* ── Answer options ── */}
              <div className="px-6 py-4 space-y-2.5">
                {options.length > 0 ? (
                  options.map(opt => {
                    const isCorrectOpt   = opt.key === correctKey;
                    const isSelectedOpt  = opt.key === selectedKey;
                    const isWrongSelected = isSelectedOpt && !isCorrect;

                    let optStyle = 'bg-slate-50 border-slate-200 text-slate-700'; // neutral
                    let keyStyle = 'bg-white text-slate-400 border border-slate-200';
                    let badge    = null;

                    if (isCorrectOpt) {
                      optStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                      keyStyle = 'bg-emerald-500 text-white';
                      badge    = 'Correct Answer';
                    }
                    if (isWrongSelected) {
                      optStyle = 'bg-red-50 border-red-300 text-red-800';
                      keyStyle = 'bg-red-500 text-white';
                      badge    = 'Your Answer';
                    }
                    // correct + selected (both) → already covered by isCorrectOpt
                    if (isCorrectOpt && isSelectedOpt && isCorrect) {
                      optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                      keyStyle = 'bg-emerald-600 text-white';
                      badge    = 'Your Answer · Correct';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${optStyle}`}
                      >
                        {/* Option key */}
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${keyStyle}`}>
                          {opt.key.toUpperCase()}
                        </span>

                        {/* Option text */}
                        <span className="flex-1">{opt.text}</span>

                        {/* Badge */}
                        {badge && (
                          <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            isWrongSelected
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {badge}
                          </span>
                        )}

                        {/* Icon */}
                        {isCorrectOpt && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
                        {isWrongSelected && <XCircle size={16} className="shrink-0 text-red-500" />}
                      </div>
                    );
                  })
                ) : (
                  /* Fallback if options aren't populated */
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-semibold text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {selectedKey?.toUpperCase() || '?'}
                      </span>
                      <span className="flex-1">Your Answer: Option {selectedKey?.toUpperCase() || 'N/A'}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">Your Answer</span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold text-sm">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black bg-emerald-500 text-white">
                          {correctKey?.toUpperCase()}
                        </span>
                        <span className="flex-1">Correct: Option {correctKey?.toUpperCase()}</span>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Explanation ── */}
              {explanation && (
                <div className="mx-6 mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Explanation</span>
                  </div>
                  <p className="text-sm font-medium text-blue-900 leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
