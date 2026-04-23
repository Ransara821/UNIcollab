import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, getSubjects } from '../../services/quizService';
import {
  PlusCircle, Pencil, Trash2, Eye, EyeOff, HelpCircle,
  BookOpen, GraduationCap, Clock, FileWarning, Search, X, Type, AlignLeft, Building, Target, Zap, TrendingUp, CheckCircle2, AlertTriangle, Shuffle
} from 'lucide-react';

const BLANK = { title: '', description: '', subjectId: '', year: '1st Year', semester: 'Semester 1', difficulty: 'medium', timeLimit: 30, passMark: 50, attemptsAllowed: 1, questionsToDisplay: '' };
const YEARS     = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// ── Toast Notification ──────────────────────────────────────
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
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl animate-fade-in ${styles[type] ?? styles.success}`}>
      <CheckCircle2 size={20} strokeWidth={2.5} className="shrink-0" />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X size={16} /></button>
    </div>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────
function DeleteQuizModal({ quiz, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-red-500" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Delete Quiz</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 size={15} /> Delete It</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Form Modal ───────────────────────────────────────────
function QuizFormModal({ quiz, subjects, onClose, onSaved, onSuccess }) {
  const [form, setForm] = useState(quiz
    ? { ...quiz, subjectId: quiz.subjectId?._id || quiz.subjectId, questionsToDisplay: quiz.questionsToDisplay ?? '' }
    : { ...BLANK });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const setObj = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.subjectId) return setErr('Please select a subject to bind this quiz.');
    setSaving(true); setErr('');
    try {
      const payload = { ...form, questionsToDisplay: form.questionsToDisplay !== '' ? +form.questionsToDisplay : null };
      if (quiz) {
        await updateQuiz(quiz._id, payload);
        onSuccess('update', 'Quiz updated successfully!');
      } else {
        await createQuiz(payload);
        onSuccess('success', 'Quiz created successfully!');
      }
      onSaved();
    } catch (ex) { setErr(ex.response?.data?.message || 'Server error. Please try again.'); }
    finally { setSaving(false); }
  };

  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-semibold text-slate-800 text-sm placeholder:font-normal placeholder:text-slate-400";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-8 px-4">
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="p-6 rounded-t-[2rem] flex items-center justify-between bg-emerald-50 border-b border-emerald-100">
          <div>
            <h2 className="text-xl font-black text-emerald-700">
              {quiz ? 'Edit Assessment' : 'New Assessment'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {quiz ? 'Update quiz parameters and grading limits.' : 'Define core parameters and grading limits.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handle} className="p-5 space-y-3.5">

          {/* Title */}
          <div>
            <label className={labelBase}><Type size={11} className="text-emerald-500" /> Quiz Title</label>
            <input
              required
              value={form.title}
              onChange={e => setObj('title', e.target.value)}
              className={inputBase}
              placeholder="Enter Quiz Title"
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelBase}><AlignLeft size={11} className="text-emerald-500" /> Description / Instructions</label>
            <textarea
              required
              value={form.description}
              onChange={e => setObj('description', e.target.value)}
              className={`${inputBase} h-16 resize-none`}
              placeholder="Provide clear instructions for students..."
            />
          </div>

          {/* Subject + Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}><BookOpen size={11} className="text-emerald-500" /> Subject Module</label>
              <select
                required
                value={form.subjectId}
                onChange={e => setObj('subjectId', e.target.value)}
                className={inputBase}
              >
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} – {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelBase}><Zap size={11} className="text-emerald-500" /> Difficulty</label>
              <select
                value={form.difficulty}
                onChange={e => setObj('difficulty', e.target.value)}
                className={inputBase}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Year + Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}><GraduationCap size={11} className="text-emerald-500" /> Academic Year</label>
              <select value={form.year} onChange={e => setObj('year', e.target.value)} className={inputBase}>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelBase}><Building size={11} className="text-emerald-500" /> Semester</label>
              <select value={form.semester} onChange={e => setObj('semester', e.target.value)} className={inputBase}>
                {SEMESTERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Time + Pass Mark + Max Retries */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelBase}><Clock size={11} className="text-emerald-500" /> Time Limit (mins)</label>
              <input
                type="number" min={1} required
                value={form.timeLimit}
                onChange={e => setObj('timeLimit', +e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}><Target size={11} className="text-emerald-500" /> Pass Mark (%)</label>
              <input
                type="number" min={0} max={100} required
                value={form.passMark}
                onChange={e => setObj('passMark', +e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}><FileWarning size={11} className="text-emerald-500" /> Max Retries</label>
              <input
                type="number" min={1} max={10} required
                value={form.attemptsAllowed}
                onChange={e => setObj('attemptsAllowed', +e.target.value)}
                className={inputBase}
              />
            </div>
          </div>

          {/* Questions to Display */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
            <label className={labelBase + ' text-indigo-600'}><Shuffle size={11} className="text-indigo-500" /> Questions to Display per User</label>
            <input
              type="number" min={1}
              value={form.questionsToDisplay}
              onChange={e => setObj('questionsToDisplay', e.target.value)}
              className={inputBase + ' border-indigo-100 focus:border-indigo-400'}
              placeholder="Leave empty to show all questions"
            />
            <p className="text-[11px] font-medium text-indigo-500 flex items-center gap-1.5">
              <Shuffle size={10} /> Each user receives a <strong>random subset</strong> of questions. Must be ≤ total questions added.
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold">
              {err}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : quiz ? 'Save Changes' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
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
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, message) => setToast({ type, message });
  const dismissToast = () => setToast(null);
  
  const load = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([ getQuizzes(), getSubjects() ]);
      setQuizzes(qRes.data.data);
      setSubjects(sRes.data.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = (quiz) => setDeleteTarget(quiz);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteQuiz(deleteTarget._id);
      setDeleteTarget(null);
      load();
      showToast('delete', 'Quiz deleted successfully!');
    } catch {
      setDeleteTarget(null);
      showToast('error', 'Failed to delete quiz.');
    } finally { setDeleting(false); }
  };

  const handleToggle = async (quiz) => {
    try {
      if(quiz.status === 'draft' && quiz.questionCount === 0) return alert("Must add questions to publish.");
      await updateQuiz(quiz._id, { status: quiz.status === 'published' ? 'draft' : 'published' });
      load();
    } catch (e) { alert('Update failed'); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">

      {/* Header — matches dashboard */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <TrendingUp size={14} /> Assessment Registry
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Quiz Management</h1>
          <p className="text-slate-500 mt-2 text-base font-medium">Manage all internal LMS assessments and imported tests.</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={20} /> New Assessment
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="font-bold text-slate-600">Synchronizing assessments...</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {quizzes.length === 0 && (
            <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
              <span className="bg-emerald-50 border border-emerald-100 p-4 rounded-full inline-block mb-3">
                <BookOpen size={24} className="text-emerald-500" />
              </span>
              <p className="font-bold text-lg mt-2">No Assessments Built</p>
              <p className="text-sm mt-1">Click "New Assessment" to get started.</p>
            </div>
          )}

          {quizzes.map(quiz => (
            <div
              key={quiz._id}
              className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center relative overflow-hidden group"
            >
              {/* Hover accent bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-3xl" />

              <div className="flex-1 pl-2">
                <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                  <h3 className="font-extrabold text-xl text-slate-900">{quiz.title}</h3>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${quiz.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {quiz.status.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase">
                    {quiz.difficulty}
                  </span>
                  {quiz.importedFrom === 'quizapi' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 uppercase">QUIZAPI.IO</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-4 font-medium pr-10 line-clamp-2">{quiz.description}</p>

                {/* Meta strip — emerald themed */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-emerald-900/60 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/60">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-emerald-500" /> {quiz.subjectId?.name || 'Unassigned'}</span>
                  <span className="text-emerald-200">|</span>
                  <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-emerald-500" /> {quiz.year} · {quiz.semester}</span>
                  <span className="text-emerald-200">|</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500" /> {quiz.timeLimit} mins</span>
                  <span className="text-emerald-200">|</span>
                  <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-emerald-500" /> {quiz.questionCount} Questions</span>
                  {quiz.questionsToDisplay && quiz.questionsToDisplay < quiz.questionCount && (
                    <>
                      <span className="text-emerald-200">|</span>
                      <span className="flex items-center gap-1.5 text-indigo-600 font-bold"><Shuffle size={14} className="text-indigo-400" /> Shows {quiz.questionsToDisplay} randomly</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-2xl w-full xl:w-auto">
                <button
                  onClick={() => navigate(`/admin/quiz-management/${quiz._id}/questions`)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-600 flex items-center gap-2 transition-all shadow-sm"
                >
                  <FileWarning size={16} /> Build
                </button>
                <button
                  onClick={() => handleToggle(quiz)}
                  className={`px-5 py-2.5 bg-white border rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${quiz.status === 'published' ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                >
                  {quiz.status === 'published' ? <><EyeOff size={16} /> Unpublish</> : <><Eye size={16} /> Publish</>}
                </button>
                <button
                  onClick={() => setModal(quiz)}
                  className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={() => handleDelete(quiz)}
                  className="w-11 h-11 border border-red-200 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <QuizFormModal
          quiz={modal === 'create' ? null : modal}
          subjects={subjects}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
          onSuccess={showToast}
        />
      )}

      {deleteTarget && (
        <DeleteQuizModal
          quiz={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}
