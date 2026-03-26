import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getQuizLeaderboard, getGlobalLeaderboard, getQuizDetails } from '../../services/quizService';
import { ArrowLeft, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const [lbRes, quizRes] = await Promise.all([getQuizLeaderboard(id), getQuizDetails(id)]);
          setEntries(lbRes.data.data);
          setQuizTitle(quizRes.data.data.title);
        } else {
          const year = searchParams.get('year');
          const semester = searchParams.get('semester');
          const lbRes = await getGlobalLeaderboard(year, semester);
          setEntries(lbRes.data.data);
          setQuizTitle('Global Leaderboard');
        }
      } catch { setError('Failed to load leaderboard.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const rankStyle = (i) => {
    if (i === 0) return { bg: '#FEF9C3', border: '#FDE047', color: '#854D0E' };
    if (i === 1) return { bg: '#F1F5F9', border: '#CBD5E1', color: '#475569' };
    if (i === 2) return { bg: '#FFF7ED', border: '#FED7AA', color: '#9A3412' };
    return { bg: 'white', border: '#E2E8F0', color: '#64748B' };
  };

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-sm text-indigo-600 font-medium mt-0.5">{quizTitle}</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-[3px] rounded-full animate-spin" style={{ borderColor: '#EEF2FF', borderTopColor: '#4F46E5' }} />
        </div>
      )}

      {error && <div className="p-4 rounded-xl border text-sm" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>{error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center py-24">
          <Medal size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No entries yet</h3>
          <p className="text-slate-400 text-sm">Be the first to complete this quiz!</p>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const { bg, border, color } = rankStyle(idx);
          const score = entry.highestScore ?? entry.totalScore;
          const pct = entry.percentage !== undefined ? `${Math.round(entry.percentage)}%` : null;
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all"
              style={{ background: bg, borderColor: border }}>
              <span className="w-9 h-9 flex items-center justify-center text-xl font-bold rounded-lg shrink-0"
                style={{ background: idx < 3 ? 'transparent' : '#F8FAFC', color }}>
                {idx < 3 ? medals[idx] : `#${idx + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate text-sm">{entry._id || 'Anonymous'}</p>
                {pct && <p className="text-xs text-slate-400">{pct} accuracy</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-indigo-600">{score} pts</p>
                {entry.submittedAt && (
                  <p className="text-xs text-slate-400">{new Date(entry.submittedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
