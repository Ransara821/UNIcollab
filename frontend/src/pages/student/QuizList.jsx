import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzes, getMyAttempts } from '../../services/quizService';
import { ArrowLeft, BookOpen, Clock, HelpCircle, AlertCircle, PlayCircle, Eye, GraduationCap } from 'lucide-react';

const DIFF_STYLES = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
};

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

  const getAttemptStatus = (quizId) =>
    attempts.filter(a => a.quizId?._id === quizId || a.quizId === quizId);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-20 font-sans">

      {/* Back */}
      <button
        onClick={() => navigate(`/student/quizzes/${year}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit hover:border-emerald-200 hover:shadow-md text-sm"
      >
        <ArrowLeft size={16} /> Back to Semesters
      </button>

      {/* Page header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-3">
          <GraduationCap size={13} /> {year} · {semester}
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Available Assessments</h1>
        <p className="text-slate-500 font-medium mt-1.5 text-sm">Assigned modules and evaluations for your semester.</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="font-bold text-slate-500 text-sm">Fetching assessments...</p>
        </div>
      ) : (
        <div className="grid gap-5">

          {/* Empty state */}
          {quizzes.length === 0 && (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={26} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Assessments</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">
                There are no published quizzes available for this semester yet. Check back later.
              </p>
            </div>
          )}

          {quizzes.map(quiz => {
            const myAttempts = getAttemptStatus(quiz._id);
            const isCompleted = myAttempts.some(a => a.status === 'completed');
            const isInProgress = myAttempts.some(a => a.status === 'in-progress');
            const currentAtt = myAttempts[0];

            return (
              <div
                key={quiz._id}
                className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden"
              >
                {/* Hover accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-3xl" />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {quiz.title}
                    </h2>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${DIFF_STYLES[quiz.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                      {quiz.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 text-sm font-medium mb-5 max-w-3xl line-clamp-2">{quiz.description}</p>

                  {/* Meta strip */}
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                    <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl">
                      <BookOpen size={14} /> {quiz.subjectId?.name || 'General'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-xl">
                      <Clock size={14} className="text-slate-400" /> {quiz.timeLimit} mins
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-xl">
                      <HelpCircle size={14} className="text-slate-400" /> {quiz.questionCount} Questions
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-5 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {isCompleted ? (
                    <div className="text-right w-full">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Your Score</p>
                      <p className={`text-2xl font-black ${currentAtt.score >= quiz.passMark ? 'text-emerald-600' : 'text-red-500'}`}>
                        {currentAtt.score}
                        <span className="text-sm font-bold text-slate-400"> / {quiz.questionCount}</span>
                      </p>
                      <button
                        onClick={() => navigate(`/student/quizzes/result/${currentAtt._id}`)}
                        className="mt-3 w-full py-2.5 px-6 rounded-xl font-black text-sm bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} /> Review Result
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/quizzes/${quiz._id}/details`)}
                      className="w-full md:w-auto px-8 py-3.5 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <PlayCircle size={18} />
                      {isInProgress ? 'Resume Attempt' : 'Start Quiz'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
