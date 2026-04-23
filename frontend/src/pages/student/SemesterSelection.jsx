import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LibraryBig } from 'lucide-react';

const SEMESTERS = ['Semester 1', 'Semester 2'];

const SEM_COLORS = [
  { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600', btn: 'group-hover:bg-emerald-600' },
  { gradient: 'from-teal-500 to-cyan-400',    bg: 'bg-teal-50',    border: 'border-teal-100',    text: 'text-teal-700',    icon: 'text-teal-600',    btn: 'group-hover:bg-teal-600'    },
];

export default function SemesterSelection() {
  const { year } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-20 font-sans">

      {/* Back button */}
      <button
        onClick={() => navigate('/student/quizzes')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit hover:border-emerald-200 hover:shadow-md text-sm"
      >
        <ArrowLeft size={16} /> Back to Years
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-4">
          <LibraryBig size={13} /> {year}
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{year} Curriculum</h1>
        <p className="text-slate-500 font-medium text-base max-w-lg mx-auto">
          Select your current semester to view assigned modules and available assessments.
        </p>
      </div>

      {/* Semester cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {SEMESTERS.map((s, i) => {
          const c = SEM_COLORS[i];
          return (
            <div
              key={s}
              onClick={() => navigate(`/student/quizzes/${year}/${s}`)}
              className={`bg-white rounded-[2rem] p-10 border-2 ${c.border} shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden`}
            >
              {/* Top color bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`w-24 h-24 ${c.bg} rounded-full flex items-center justify-center mb-7 group-hover:scale-110 transition-transform duration-300 shadow-inner border ${c.border}`}>
                <LibraryBig size={38} className={c.icon} />
              </div>

              <h2 className={`text-3xl font-black mb-3 ${c.text} group-hover:scale-105 transition-transform`}>{s}</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                Access all active evaluations, midterms, and assignments configured for the subjects in {s.toLowerCase()}.
              </p>

              <div className={`mt-auto w-full py-3.5 rounded-2xl bg-slate-50 text-slate-600 font-black text-sm flex items-center justify-center gap-2 ${c.btn} group-hover:text-white transition-colors duration-300 shadow-sm`}>
                Enter Curriculum <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
