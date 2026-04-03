import { useState, useEffect } from 'react';
import { getAllAttempts } from '../../services/quizService';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminStudentAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getAllAttempts();
      setAttempts(res.data.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Attempts</h1>
          <p className="text-sm font-medium mt-1 text-slate-500">Monitor all quiz attempts and scores across the university</p>
        </div>
      </div>

      {loading ? <div className="text-indigo-500 text-center py-20 font-bold text-lg animate-pulse">Loading Attempts...</div> : 
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
            <tr>
              <th className="px-6 py-5">Student Name</th>
              <th className="px-6 py-5">Quiz Examination</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Score Metrics</th>
              <th className="px-6 py-5">Duration Used</th>
              <th className="px-6 py-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.length === 0 && <tr><td colSpan={6} className="text-center py-16 font-medium text-slate-500 border-dashed border-2 m-4 rounded-xl">No attempts recorded globally.</td></tr>}
            {attempts.map(att => (
              <tr key={att._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                      <Users size={15}/>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-slate-800 leading-tight">{att.userName || 'Unknown Student'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-semibold text-slate-600">{att.quizId?.title || 'Deleted Quiz'} <div className="text-xs text-slate-400 font-medium">{att.quizId?.subjectId?.name}</div></td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${att.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {att.status === 'completed' ? <CheckCircle size={12}/> : <Clock size={12}/>} {att.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {att.status === 'completed' ? (
                    <div className="flex items-center gap-2 font-black text-base">
                      <span className={att.score >= (att.quizId?.passMark || 0) ? 'text-emerald-600' : 'text-red-500'}>{att.score} <span className="text-xs text-slate-400 font-semibold">/ {att.totalMarks || att.totalQuestions}</span></span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 rounded-md">({Math.round((att.score / (att.totalMarks || att.totalQuestions || 1)) * 100)}%)</span>
                    </div>
                  ) : <span className="text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-md">In Progress</span>}
                </td>
                <td className="px-6 py-5 font-bold text-slate-600">{Math.floor(att.durationUsed / 60)}m {att.durationUsed % 60}s</td>
                <td className="px-6 py-5 text-slate-500 font-medium">{att.submittedAt ? new Date(att.submittedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      }
    </div>
  );
}
