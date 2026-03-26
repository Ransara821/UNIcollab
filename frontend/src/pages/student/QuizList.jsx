import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getQuizzes } from '../../services/quizService';
import { ArrowLeft, ChevronRight, Trophy, Tag, HelpCircle, Layers } from 'lucide-react';

const difficultyConfig = {
  Easy:   { bg: '#DCFCE7', color: '#16A34A' },
  Medium: { bg: '#FEF9C3', color: '#CA8A04' },
  Hard:   { bg: '#FEE2E2', color: '#DC2626' },
};

export default function QuizList() {
  const [searchParams] = useSearchParams();
  const year = searchParams.get('year');
  const semester = searchParams.get('semester');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try { const res = await getQuizzes(year, semester); setQuizzes(res.data.data); }
      catch { setError('Failed to load quizzes. Please try again.'); }
      finally { setLoading(false); }
    };
    fetchQuizzes();
  }, [year, semester]);

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/student/quizzes')}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Quizzes</h1>
          <p className="text-sm text-indigo-600 font-medium mt-0.5">{year} · {semester}</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-[3px] rounded-full animate-spin" style={{ borderColor: '#EEF2FF', borderTopColor: '#4F46E5' }} />
          <p className="text-slate-400 text-sm">Loading quizzes…</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm border" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>{error}</div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="text-center py-24">
          <HelpCircle size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No quizzes available</h3>
          <p className="text-slate-400 text-sm">No quizzes published for {year} · {semester} yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const d = difficultyConfig[quiz.difficulty] || { bg: '#F1F5F9', color: '#64748B' };
          return (
            <div key={quiz._id}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: d.bg, color: d.color }}>{quiz.difficulty}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-1">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Layers size={12} /> {quiz.category}</span>
                    <span className="flex items-center gap-1"><HelpCircle size={12} /> {quiz.questionCount} questions</span>
                    {quiz.tags?.length > 0 && (
                      <span className="flex items-center gap-1"><Tag size={12} /> {quiz.tags.slice(0, 2).join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => navigate(`/student/quizzes/${quiz._id}/attempt`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
                    Start <ChevronRight size={14} />
                  </button>
                  <button onClick={() => navigate(`/student/quizzes/${quiz._id}/leaderboard`)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <Trophy size={14} /> Board
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
