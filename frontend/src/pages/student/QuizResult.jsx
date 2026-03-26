import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResult } from '../../services/quizService';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

export default function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuizResult(attemptId)
      .then(res => setResult(res.data.data))
      .catch(() => setError('Could not load your result.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="w-10 h-10 border-[3px] rounded-full animate-spin" style={{ borderColor: '#EEF2FF', borderTopColor: '#4F46E5' }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button onClick={() => navigate('/student/quizzes')} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#4F46E5' }}>Go to Quizzes</button>
      </div>
    </div>
  );

  const { score, totalQuestions, correctCount, wrongCount, percentage, submittedAt, quizId } = result;
  const grade =
    percentage >= 80 ? { label: 'Excellent', suffix: '!', gradientText: '#16A34A' } :
    percentage >= 60 ? { label: 'Good job', suffix: '.', gradientText: '#2563EB' } :
    percentage >= 40 ? { label: 'Keep going', suffix: '.', gradientText: '#D97706' } :
                      { label: 'Try again', suffix: '.', gradientText: '#DC2626' };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #4F46E5, #06B6D4)' }} />

          <div className="p-8">
            {/* Score Ring */}
            <div className="text-center mb-8">
              <div className="w-28 h-28 rounded-full mx-auto mb-4 flex flex-col items-center justify-center border-4"
                style={{ borderColor: '#EEF2FF', background: 'linear-gradient(135deg, #EEF2FF, #ECFEFF)' }}>
                <span className="text-3xl font-extrabold text-slate-900">{Math.round(percentage)}%</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: grade.gradientText }}>
                {grade.label}{grade.suffix}
              </h2>
              <p className="text-slate-500 text-sm mt-1">{quizId?.title || 'Quiz'} · {result.year} · {result.semester}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Score', value: `${score} / ${totalQuestions}`, bg: '#F8FAFC', color: '#0F172A' },
                { label: 'Questions', value: totalQuestions, bg: '#F8FAFC', color: '#0F172A' },
                { label: 'Correct', value: correctCount, bg: '#F0FDF4', color: '#16A34A', icon: CheckCircle2 },
                { label: 'Wrong',   value: wrongCount,   bg: '#FEF2F2', color: '#DC2626', icon: XCircle },
              ].map(({ label, value, bg, color, icon: Icon }) => (
                <div key={label} className="p-4 rounded-xl text-center" style={{ background: bg }}>
                  {Icon && <Icon size={20} className="mx-auto mb-1" style={{ color }} />}
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-slate-400 mb-6">
              Submitted: {new Date(submittedAt).toLocaleString()}
            </p>

            <div className="flex flex-col gap-2">
              <button onClick={() => navigate(`/student/quizzes/${result.quizId?._id || result.quizId}/leaderboard`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
                <Trophy size={16} /> View Leaderboard
              </button>
              <button onClick={() => navigate('/student/quizzes')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
                <RotateCcw size={16} /> Try Another Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
