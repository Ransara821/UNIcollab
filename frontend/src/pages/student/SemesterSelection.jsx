import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LibraryBig } from 'lucide-react';

const SEMESTERS = ['Semester 1', 'Semester 2'];

export default function SemesterSelection() {
  const { year } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in py-12">
      <button onClick={() => navigate('/student/quizzes')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit hover:shadow-md">
        <ArrowLeft size={18}/> Overview
      </button>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{year} Curriculums</h1>
        <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto">Select your current semester to view assigned modules and available assessments.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {SEMESTERS.map(s => (
          <div key={s} onClick={() => navigate(`/student/quizzes/${year}/${s}`)} className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-indigo-50/50 text-indigo-600 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-100 transition-all shadow-inner">
              <LibraryBig size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">{s}</h2>
            <p className="text-slate-500 text-sm font-semibold mb-8 leading-relaxed">Access all active evaluations, midterms, and assignments configured for the subjects administered in {s.toLowerCase()}.</p>
            <div className="mt-auto w-full py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold text-base flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
              Enter Curriculum <ArrowRight size={18}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
