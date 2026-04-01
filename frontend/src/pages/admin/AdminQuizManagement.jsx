import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, getSubjects } from '../../services/quizService';
import {
  PlusCircle, Pencil, Trash2, Eye, EyeOff, HelpCircle,
  BookOpen, GraduationCap, Clock, FileWarning, Search, X, Type, AlignLeft, Building, Target, Zap
} from 'lucide-react';

const BLANK = { title: '', description: '', subjectId: '', year: '1st Year', semester: 'Semester 1', difficulty: 'medium', timeLimit: 30, passMark: 50, attemptsAllowed: 1 };
const YEARS     = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

function QuizFormModal({ quiz, subjects, onClose, onSaved }) {
  const [form, setForm] = useState(quiz ? { ...quiz, subjectId: quiz.subjectId?._id || quiz.subjectId } : { ...BLANK });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const setObj = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    if(!form.subjectId) return setErr('Please specify a curriculum Subject to bind this quiz.');
    setSaving(true); setErr('');
    try {
      if (quiz) await updateQuiz(quiz._id, form);
      else      await createQuiz(form);
      onSaved();
    } catch (ex) { setErr(ex.response?.data?.message || 'Server rejected payload boundaries.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl relative max-h-[95vh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-4 rounded-t-[2rem] text-white flex justify-between items-center shrink-0 shadow-md">
          <div>
            <h2 className="text-xl font-black tracking-tight">{quiz ? 'Reconfigure Assessment' : 'Construct New Assessment'}</h2>
            <p className="text-indigo-200 text-xs font-medium mt-0.5">Define core parameters and grading limits.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors shadow-inner"><X size={16}/></button>
        </div>
        
        <form onSubmit={handle} className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Type size={12} className="text-indigo-500"/> Title</label>
              <input required value={form.title} onChange={e=>setObj('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-sm font-bold text-slate-800 transition-all text-sm" placeholder="e.g. Midterm Evaluation..." />
            </div>
            
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><AlignLeft size={12} className="text-indigo-500"/> Context / Protocol Description</label>
              <textarea required value={form.description} onChange={e=>setObj('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-sm font-medium text-slate-600 transition-all h-20 resize-none text-sm" placeholder="Provide clear instructions for students..." />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><BookOpen size={12} className="text-indigo-500"/> Subject Module</label>
              <select required value={form.subjectId} onChange={e=>setObj('subjectId', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:shadow-sm font-bold text-slate-800 transition-all text-sm appearance-none cursor-pointer">
                <option value="" disabled>--- Select Course Module ---</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Zap size={12} className="text-indigo-500"/> Difficulty</label>
              <select value={form.difficulty} onChange={e=>setObj('difficulty', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-400 transition-all font-bold text-slate-800 text-sm capitalize cursor-pointer appearance-none">
                {DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={12} className="text-indigo-500"/> Year</label>
              <select value={form.year} onChange={e=>setObj('year', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-400 transition-all font-bold text-slate-800 text-sm cursor-pointer appearance-none">
                {YEARS.map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Building size={12} className="text-indigo-500"/> Semester</label>
              <select value={form.semester} onChange={e=>setObj('semester', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-400 transition-all font-bold text-slate-800 text-sm cursor-pointer appearance-none">
                {SEMESTERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} className="text-indigo-500"/> Time Limit (Mins)</label>
              <input type="number" min={1} required value={form.timeLimit} onChange={e=>setObj('timeLimit', +e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 font-extrabold text-indigo-900 transition-all text-sm shadow-inner" />
            </div>
            
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Target size={12} className="text-indigo-500"/> Pass Mark</label>
              <input type="number" min={0} required value={form.passMark} onChange={e=>setObj('passMark', +e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 font-extrabold text-indigo-900 transition-all text-sm shadow-inner" />
            </div>
            
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><FileWarning size={12} className="text-indigo-500"/> Max Retries</label>
              <input type="number" min={1} max={10} required value={form.attemptsAllowed} onChange={e=>setObj('attemptsAllowed', +e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 font-extrabold text-slate-800 transition-all text-sm shadow-sm" />
            </div>
          </div>
          
          {err && <div className="text-red-500 text-xs mt-4 font-bold bg-red-50 p-3 rounded-xl border-l-4 border-l-red-500 shadow-sm animate-pulse">{err}</div>}
          
          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-200 font-black text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm">Cancel</button>
            <button disabled={saving} className="flex-1 py-3 rounded-xl font-black text-white shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#1E293B,#0F172A)' }}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Operational Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminQuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); 
  
  const load = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([ getQuizzes(), getSubjects() ]);
      setQuizzes(qRes.data.data);
      setSubjects(sRes.data.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this quiz entirely?")) return;
    try { await deleteQuiz(id); load(); } catch {}
  };

  const handleToggle = async (quiz) => {
    try {
      if(quiz.status === 'draft' && quiz.questionCount === 0) return alert("Must add questions to publish.");
      await updateQuiz(quiz._id, { status: quiz.status === 'published' ? 'draft' : 'published' });
      load();
    } catch (e) { alert('Update failed'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quiz Control Center</h1>
          <p className="text-sm font-medium mt-1 text-slate-500">Manage all internal LMS assessments and imported tests</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-600 shadow-md transition-all"><PlusCircle size={18}/> New Assessment</button>
      </div>

      {loading ? <div className="text-indigo-500 text-center py-20 font-bold text-lg animate-pulse">Synchronizing Quizzes...</div> : 
      <div className="grid gap-5">
        {quizzes.length === 0 && <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-200/60 shadow-sm"><span className="bg-slate-100 p-4 rounded-full inline-block mb-3"><BookOpen size={24} className="text-indigo-400"/></span><p className="font-semibold text-lg">No Assessments Built</p></div>}
        {quizzes.map(quiz => (
          <div key={quiz._id} className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex-1 pl-2">
              <div className="flex items-center gap-3 mb-2.5">
                <h3 className="font-extrabold text-xl text-slate-900">{quiz.title}</h3>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${quiz.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {quiz.status.toUpperCase()}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase`}>
                  {quiz.difficulty}
                </span>
                {quiz.importedFrom === 'quizapi' && <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 uppercase">QUIZAPI.IO</span>}
              </div>
              <p className="text-slate-500 text-sm mb-5 font-medium pr-10">{quiz.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-indigo-900/60 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-indigo-500"/> {quiz.subjectId?.name || 'Unassigned'}</span>
                <span className="text-indigo-200">|</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={15} className="text-indigo-500"/> {quiz.year} - {quiz.semester}</span>
                <span className="text-indigo-200">|</span>
                <span className="flex items-center gap-1.5"><Clock size={15} className="text-indigo-500"/> {quiz.timeLimit} mins</span>
                <span className="text-indigo-200">|</span>
                <span className="flex items-center gap-1.5"><HelpCircle size={15} className="text-indigo-500"/> {quiz.questionCount} Questions</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-2xl w-full xl:w-auto">
              <button onClick={() => navigate(`/admin/quiz-management/${quiz._id}/questions`)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 flex items-center gap-2 transition-all shadow-sm"><FileWarning size={16}/> Build</button>
              <button onClick={() => handleToggle(quiz)} className={`px-5 py-2.5 bg-white border rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${quiz.status === 'published' ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                {quiz.status === 'published' ? <><EyeOff size={16}/> Unpublish</> : <><Eye size={16}/> Publish</>}
              </button>
              <button onClick={() => setModal(quiz)} className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"><Pencil size={17}/></button>
              <button onClick={() => handleDelete(quiz._id)} className="w-11 h-11 border border-red-200 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={17}/></button>
            </div>
          </div>
        ))}
      </div>
      }

      {modal && <QuizFormModal quiz={modal === 'create' ? null : modal} subjects={subjects} onClose={()=>setModal(null)} onSaved={()=>{setModal(null); load();}} />}
    </div>
  );
}
