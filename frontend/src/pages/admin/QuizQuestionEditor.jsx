import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, getQuestions, addQuestion, updateQuestion, deleteQuestion, importQuestionsFromApi } from '../../services/quizService';
import {
  ArrowLeft, PlusCircle, Pencil, Trash2, CheckCircle2, AlertCircle,
  DownloadCloud, X, HelpCircle, FileText, AlertTriangle, Clock, Target, ListChecks
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: 'bg-emerald-600 shadow-emerald-600/30',
    update:  'bg-emerald-600 shadow-emerald-600/30',
    delete:  'bg-red-500 shadow-red-500/30',
    error:   'bg-red-500 shadow-red-500/30',
  };

  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl ${styles[type] ?? styles.success}`}>
      <CheckCircle2 size={20} strokeWidth={2.5} className="shrink-0" />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X size={16} /></button>
    </div>
  );
}

const OPTION_KEYS = ['a', 'b', 'c', 'd'];
const BLANK_Q = { questionText: '', options: OPTION_KEYS.map(k => ({ key: k, text: '' })), correctAnswer: 'a', marks: 1, explanation: '' };

// ── Question Form ─────────────────────────────────────────────
function QuestionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? { ...BLANK_Q, options: OPTION_KEYS.map(k => ({ key: k, text: '' })) });
  const [saving, setSav] = useState(false);
  const [err, setErr] = useState('');

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
    <form onSubmit={handle} className="bg-white rounded-3xl border border-emerald-100 shadow-md p-7 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-3xl" />
      <h3 className="font-bold text-lg mb-5 text-slate-800 flex items-center gap-2 pl-2">
        <FileText className="text-emerald-500" size={20} />
        {initial ? 'Edit Question' : 'New Question'}
      </h3>

      {/* Question text */}
      <div className="mb-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Question Prompt</label>
        <textarea
          value={form.questionText}
          onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
          rows={2}
          className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white bg-slate-50 resize-none font-medium text-slate-800 transition-all"
          placeholder="Enter the question you want to test..."
          required
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {form.options.map(({ key, text }) => (
          <div key={key} className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all ${form.correctAnswer === key ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${form.correctAnswer === key ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-200'}`}>
              {key.toUpperCase()}
            </span>
            <input
              value={text}
              onChange={e => setOpt(key, e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800 font-medium"
              placeholder={`Option ${key.toUpperCase()}`}
            />
            <button type="button" onClick={() => setForm(f => ({ ...f, correctAnswer: key }))}
              className="shrink-0 hover:scale-110 transition-transform" title="Mark as correct">
              <CheckCircle2 size={22} style={{ color: form.correctAnswer === key ? '#10B981' : '#E2E8F0' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="mb-5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Explanation (Optional)</label>
        <textarea
          value={form.explanation || ''}
          onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
          rows={2}
          className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 bg-slate-50 focus:bg-white resize-none text-slate-600 transition-all"
          placeholder="Explain why this answer is correct (shown after quiz)..."
        />
      </div>

      {/* Marks + correct indicator */}
      <div className="flex items-center gap-4 mb-5 pt-4 border-t border-slate-100">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Marks</label>
          <input
            type="number" min={1} value={form.marks}
            onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
            className="w-20 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 font-bold text-center bg-slate-50"
          />
        </div>
        <div className="text-sm font-bold bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl flex items-center gap-2 mt-5 border border-emerald-100">
          <CheckCircle2 size={15} /> Correct: Option {form.correctAnswer.toUpperCase()}
        </div>
      </div>

      {err && <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4 bg-red-50 border border-red-100 text-red-600 font-semibold"><AlertCircle size={15} />{err}</div>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : initial ? 'Save Changes' : 'Add Question'}
        </button>
      </div>
    </form>
  );
}

// ── Import QuizAPI Modal ──────────────────────────────────────
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
      setErr(er.response?.data?.message || 'Import failed. Check your category or tag.');
    } finally { setImporting(false); }
  };

  const fieldCls = "w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors text-slate-800 font-semibold text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative">
          {/* Header */}
          <div className="p-6 rounded-t-[2rem] bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl border border-emerald-200 flex items-center justify-center shadow-sm">
                <DownloadCloud size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-emerald-700">Import from QuizAPI</h2>
                <p className="text-xs font-medium text-slate-500">Pull developer questions instantly</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleImport} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={fieldCls}>
                  <option value="">Any Category</option>
                  <option value="Linux">Linux</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Programming">Programming</option>
                  <option value="Docker">Docker</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className={fieldCls}>
                  <option value="">Any Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tags</label>
                <input placeholder="e.g. JavaScript" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={fieldCls} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pull Limit</label>
                <input type="number" min={1} max={50} value={form.limit} onChange={e => setForm({ ...form, limit: +e.target.value })} className={fieldCls} />
              </div>
            </div>

            {err && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold flex items-center gap-2"><AlertCircle size={15} /> {err}</div>}

            <div className="flex gap-3 pt-1 border-t border-slate-100">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button disabled={importing}
                className="flex-1 py-3 rounded-xl text-white font-black text-sm bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {importing
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><DownloadCloud size={16} /> Import Questions</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Delete Question Modal ─────────────────────────────────────
function DeleteQuestionModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Delete Question</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full pt-1">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2">
            <Trash2 size={14} /> Delete It
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function QuizQuestionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });
  const dismissToast = () => setToast(null);

  const load = async () => {
    try {
      const [qzRes, qsRes] = await Promise.all([getQuizById(id), getQuestions(id)]);
      setQuiz(qzRes.data.data);
      setQuestions(qsRes.data.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleAdd = async (form) => {
    await addQuestion(id, form);
    setAdding(false);
    load();
    showToast('success', 'Question added successfully!');
  };
  const handleEdit = async (form) => {
    await updateQuestion(editId, form);
    setEditId(null);
    load();
    showToast('update', 'Question updated successfully!');
  };
  const handleDelete = async () => {
    await deleteQuestion(confirmDel);
    setConfirmDel(null);
    load();
    showToast('delete', 'Question deleted successfully!');
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-20">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/quiz-management')}
            className="w-11 h-11 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-1">
              <ListChecks size={12} /> Question Builder
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {quiz ? quiz.title : 'Loading...'}
            </h1>
          </div>
        </div>

        {!adding && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
            >
              <DownloadCloud size={16} /> Import QuizAPI
            </button>
            <button
              onClick={() => { setAdding(true); setEditId(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle size={16} /> Add Question
            </button>
          </div>
        )}
      </div>

      {/* ── Stats cards ── */}
      {quiz && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Questions', value: questions.length, color: 'emerald', icon: <ListChecks size={18} className="text-emerald-500" /> },
            { label: 'Total Marks', value: totalMarks, color: 'blue', icon: <Target size={18} className="text-blue-500" /> },
            { label: 'Pass Mark', value: quiz.passMark, color: 'teal', icon: <CheckCircle2 size={18} className="text-teal-500" /> },
            { label: 'Time Limit', value: `${quiz.timeLimit}m`, color: 'purple', icon: <Clock size={18} className="text-purple-500" /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-14 h-14 rounded-bl-full -mr-3 -mt-3 bg-${color}-50 opacity-80`} />
              <div className="flex items-center gap-2 mb-2">{icon}</div>
              <p className={`text-3xl font-black text-${color}-600 mb-1`}>{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="font-bold text-slate-500 text-sm">Loading questions...</p>
        </div>
      )}

      {/* ── Add question form ── */}
      {adding && <div className="mb-6"><QuestionForm onSave={handleAdd} onCancel={() => setAdding(false)} /></div>}

      {/* ── Question list ── */}
      <div className="space-y-4">
        {questions.length === 0 && !loading && !adding && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={28} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">No questions yet</h3>
            <p className="text-slate-500 font-medium mb-6 text-sm">Add questions manually or import from QuizAPI.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setAdding(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
              >
                Add Question
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-black text-slate-600 bg-white border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                Import QuizAPI
              </button>
            </div>
          </div>
        )}

        {questions.map((q, idx) =>
          editId === q._id ? (
            <QuestionForm
              key={q._id}
              initial={{ questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, marks: q.marks, explanation: q.explanation }}
              onSave={handleEdit}
              onCancel={() => setEditId(null)}
            />
          ) : (
            <div
              key={q._id}
              className="bg-white rounded-3xl border border-slate-100 p-6 group hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row items-stretch gap-5 relative overflow-hidden"
            >
              {/* Hover accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-3xl" />

              {/* Q number + source + marks */}
              <div className="flex flex-col items-center gap-2 md:border-r border-slate-100 md:pr-5 shrink-0">
                <span className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm font-black text-emerald-700">
                  Q{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${q.source === 'quizapi' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                  {q.source}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-auto">{q.marks} pts</span>
              </div>

              {/* Question content */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-base leading-relaxed mb-4">{q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map(opt => (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border ${opt.key === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${opt.key === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {opt.key.toUpperCase()}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {opt.key === q.correctAnswer && <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100 font-medium">
                    <span className="font-bold text-slate-700">Explanation: </span>{q.explanation}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                <button
                  onClick={() => { setEditId(q._id); setAdding(false); }}
                  className="w-10 h-10 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmDel(q._id)}
                  className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Modals ── */}
      {showImport && <ImportQuizApiModal quizId={id} onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); load(); }} />}
      {confirmDel && <DeleteQuestionModal onCancel={() => setConfirmDel(null)} onConfirm={handleDelete} />}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}
