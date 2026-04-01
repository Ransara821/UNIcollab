import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, getQuestions, addQuestion, updateQuestion, deleteQuestion, importQuestionsFromApi } from '../../services/quizService';
import { ArrowLeft, PlusCircle, Pencil, Trash2, CheckCircle2, AlertCircle, GripVertical, DownloadCloud, X, HelpCircle, FileText } from 'lucide-react';

const OPTION_KEYS = ['a','b','c','d'];
const BLANK_Q = { questionText: '', options: OPTION_KEYS.map(k => ({ key: k, text: '' })), correctAnswer: 'a', marks: 1, explanation: '' };

function QuestionForm({ initial, onSave, onCancel }) {
  const [form, setForm]   = useState(initial ?? { ...BLANK_Q, options: OPTION_KEYS.map(k => ({ key: k, text: '' })) });
  const [saving, setSav]  = useState(false);
  const [err, setErr]     = useState('');

  const setOpt = (key, val) => setForm(f => ({ ...f, options: f.options.map(o => o.key === key ? { ...o, text: val } : o) }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.questionText.trim()) return setErr('Question text is required.');
    if (form.options.some(o => !o.text.trim())) return setErr('All 4 options must be filled.');
    setSav(true); setErr('');
    try { await onSave(form); }
    catch (ex) { setErr(ex.response?.data?.message || 'Failed to save question.'); setSav(false); }
  };

  return (
    <form onSubmit={handle} className="bg-white rounded-3xl border border-indigo-200 shadow-md p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
      <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><FileText className="text-indigo-500" size={20}/> {initial ? 'Edit Question Details' : 'Draft New Question'}</h3>
      <div className="mb-5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Prompt</label>
        <textarea value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} rows={2}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none font-medium text-slate-800 transition-all"
          placeholder="Ask whatever you want to test..." required />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {form.options.map(({ key, text }) => (
          <div key={key} className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all ${form.correctAnswer === key ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-300'}`}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${form.correctAnswer === key ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
              {key.toUpperCase()}
            </span>
            <input value={text} onChange={e => setOpt(key, e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800 font-medium"
              placeholder={`Option ${key.toUpperCase()}`} />
            <button type="button" onClick={() => setForm(f => ({ ...f, correctAnswer: key }))}
              className="shrink-0 hover:scale-110 transition-transform" title="Set as correct answer">
              <CheckCircle2 size={24} style={{ color: form.correctAnswer === key ? '#10B981' : '#E2E8F0' }} />
            </button>
          </div>
        ))}
      </div>
      <div className="mb-6">
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Explanation (Optional)</label>
         <textarea value={form.explanation || ''} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none text-slate-600 transition-all bg-slate-50"
          placeholder="Explain the correct answer logic... (shown after attempt limit)" />
      </div>
      <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-100">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Marks Setup</label>
          <input type="number" min={1} value={form.marks} onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
            className="w-24 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 font-bold" />
        </div>
        <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl flex items-center gap-2 mt-6">
          <CheckCircle2 size={16} /> Correct Target: {form.correctAnswer.toUpperCase()}
        </div>
      </div>
      {err && <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4 bg-red-50 border border-red-100 text-red-600 font-semibold"><AlertCircle size={16} />{err}</div>}
      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel drafting</button>
        <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
          {saving ? 'Processing…' : initial ? 'Update Question Database' : 'Inject Question'}
        </button>
      </div>
    </form>
  );
}

function ImportQuizApiModal({ quizId, onClose, onImported }) {
  const [form, setForm] = useState({ limit: 10, category: '', difficulty: '', tags: '' });
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true); setErr('');
    try {
      const res = await importQuestionsFromApi(quizId, form);
      alert(`Success! Imported ${res.data.count} questions from QuizAPI.`);
      onImported();
    } catch (er) {
      setErr(er.response?.data?.message || "Import failed. Be sure you have the exact category or tag.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16}/></button>
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center border-4 border-purple-50 shadow-inner">
             <DownloadCloud size={28} className="text-purple-600"/>
           </div>
        </div>
        <h2 className="text-2xl font-black text-center text-slate-900 mb-2">Import from QuizAPI.io</h2>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 px-4">Pull high-quality developer questions instantly into your local curriculum.</p>
        
        <form onSubmit={handleImport} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
              <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-colors text-slate-800 font-semibold">
                <option value="">Any Category</option>
                <option value="Linux">Linux</option>
                <option value="DevOps">DevOps</option>
                <option value="Programming">Programming</option>
                <option value="Docker">Docker</option>
                <option value="SQL">SQL</option>
              </select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Difficulty</label>
               <select value={form.difficulty} onChange={e=>setForm({...form, difficulty: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-colors text-slate-800 font-semibold">
                 <option value="">Any Difficulty</option>
                 <option value="Easy">Easy</option>
                 <option value="Medium">Medium</option>
                 <option value="Hard">Hard</option>
               </select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Specific Tags</label>
               <input placeholder="e.g. JavaScript" value={form.tags} onChange={e=>setForm({...form, tags: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-semibold text-slate-800 transition-colors" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Pull Limit</label>
               <input type="number" min={1} max={50} value={form.limit} onChange={e=>setForm({...form, limit: +e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-bold text-slate-800 transition-colors" />
            </div>
          </div>
          
          {err && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold flex items-center gap-2"><AlertCircle size={16}/> {err}</div>}
          
          <button disabled={importing} className="w-full py-4 rounded-xl text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:-translate-y-0.5 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#9333EA,#A855F7)' }}>
             {importing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><DownloadCloud size={18}/> Initiate External Import</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function QuizQuestionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz,       setQuiz]      = useState(null);
  const [questions,  setQuestions] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [adding,     setAdding]    = useState(false);
  const [editId,     setEditId]    = useState(null);
  const [confirmDel, setConfirmDel]= useState(null);
  const [showImport, setShowImport]= useState(false);

  const load = async () => {
    try {
      const [qzRes, qsRes] = await Promise.all([getQuizById(id), getQuestions(id)]);
      setQuiz(qzRes.data.data);
      setQuestions(qsRes.data.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleAdd = async (form) => {
    await addQuestion(id, form);
    setAdding(false); load();
  };
  const handleEdit = async (form) => {
    await updateQuestion(editId, form);
    setEditId(null); load();
  };
  const handleDelete = async (qid) => {
    await deleteQuestion(qid);
    setConfirmDel(null); load();
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/admin/quiz-management')}
            className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Architect</h1>
            {quiz && <p className="text-sm font-semibold mt-1 text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500" /> {quiz.title}</p>}
          </div>
        </div>
        {!adding && (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all shadow-sm">
              <DownloadCloud size={16} /> Import QuizAPI
            </button>
            <button onClick={() => { setAdding(true); setEditId(null); }} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
              <PlusCircle size={16} /> Manual Inject
            </button>
          </div>
        )}
      </div>

      {quiz && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-4 -mt-4" />
             <p className="text-4xl font-black text-indigo-600 mb-1">{questions.length}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4" />
             <p className="text-4xl font-black text-blue-600 mb-1">{totalMarks}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4" />
             <p className="text-4xl font-black text-emerald-600 mb-1">{quiz.passMark}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Pass Mark</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4" />
             <p className="text-4xl font-black text-amber-600 mb-1">{quiz.timeLimit}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Minutes Clock</p>
          </div>
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><div className="w-10 h-10 border-[4px] rounded-full animate-spin border-indigo-100 border-t-indigo-600" /></div>}

      {adding && <div className="mb-6"><QuestionForm onSave={handleAdd} onCancel={() => setAdding(false)} /></div>}

      <div className="space-y-4">
        {questions.length === 0 && !loading && !adding && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <HelpCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-bold text-xl text-slate-800 mb-2">Architect your first question!</h3>
            <p className="text-slate-500 font-medium mb-6">Manually write questions, or import from QuizAPI.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setAdding(true)} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors">Manual Create</button>
              <button onClick={() => setShowImport(true)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors">Import QuizAPI</button>
            </div>
          </div>
        )}
        {questions.map((q, idx) => (
          editId === q._id ? (
            <QuestionForm key={q._id} initial={{ questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, marks: q.marks, explanation: q.explanation }}
              onSave={handleEdit} onCancel={() => setEditId(null)} />
          ) : (
            <div key={q._id} className="bg-white rounded-3xl border border-slate-200/60 p-6 group hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col md:flex-row items-stretch gap-6">
              <div className="flex flex-col items-center gap-2 md:border-r border-slate-100 md:pr-6">
                <span className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600 shadow-inner">
                  Q{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${q.source === 'quizapi' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>{q.source}</span>
                <span className="text-xs font-bold text-slate-400 mt-auto">{q.marks} Pts</span>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-slate-900 text-lg leading-relaxed mb-4">{q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options?.map(opt => (
                    <div key={opt.key} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border ${opt.key === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-bold shrink-0 shadow-sm ${opt.key === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                        {opt.key.toUpperCase()}
                      </span>
                      {opt.text}
                      {opt.key === q.correctAnswer && <CheckCircle2 size={16} className="ml-auto shrink-0 text-emerald-500" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100 font-medium">
                    <span className="font-bold text-slate-800">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                <button onClick={() => { setEditId(q._id); setAdding(false); }} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"><Pencil size={18} /></button>
                <button onClick={() => setConfirmDel(q._id)} className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
              </div>
            </div>
          )
        ))}
      </div>

      {showImport && <ImportQuizApiModal quizId={id} onClose={()=>setShowImport(false)} onImported={()=>{setShowImport(false); load();}} />}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <Trash2 size={40} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Eradicate Node?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">This question will be removed permanently from the database. It cannot be recovered.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Abort</button>
              <button onClick={() => handleDelete(confirmDel)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">Eradicate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
