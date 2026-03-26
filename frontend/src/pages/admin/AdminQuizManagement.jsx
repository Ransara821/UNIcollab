import { useState, useEffect } from 'react';
import {
  getAdminAllQuizzes, createQuiz, updateQuiz, deleteQuiz, getAdminAttempts,
} from '../../services/quizService';
import {
  Plus, Pencil, Trash2, BarChart2, X, Check, AlertCircle, BrainCircuit
} from 'lucide-react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['Linux', 'DevOps', 'Networking', 'Programming', 'Cloud', 'Docker', 'Kubernetes', 'Code', 'SQL', 'CMS', 'Bash'];

const defaultForm = { title: '', description: '', year: '1st Year', semester: 'Semester 1', category: 'Linux', difficulty: 'Medium', tags: '', questionCount: 10, isActive: true };

const diffBadge = { Easy: { bg: '#DCFCE7', color: '#16A34A' }, Medium: { bg: '#FEF9C3', color: '#CA8A04' }, Hard: { bg: '#FEE2E2', color: '#DC2626' } };

const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

export default function AdminQuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewAttempts, setViewAttempts] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchQuizzes = async () => { try { const res = await getAdminAllQuizzes(); setQuizzes(res.data.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchQuizzes(); }, []);

  const flash = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleEdit = (quiz) => { setEditingId(quiz._id); setForm({ ...quiz, tags: (quiz.tags || []).join(', ') }); setShowForm(true); };

  const handleDelete = async (id) => {
    try { await deleteQuiz(id); flash('Quiz deleted.'); setDeleteConfirm(null); fetchQuizzes(); }
    catch { flash('Failed to delete.', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingId) { await updateQuiz(editingId, payload); flash('Quiz updated!'); }
      else { await createQuiz(payload); flash('Quiz created!'); }
      setShowForm(false); setEditingId(null); setForm(defaultForm); fetchQuizzes();
    } catch (err) { flash(err.response?.data?.message || 'Failed to save.', 'error'); }
    finally { setSaving(false); }
  };

  const handleViewAttempts = async (quiz) => { setViewAttempts(quiz); try { const res = await getAdminAttempts(quiz._id); setAttempts(res.data.data); } catch { setAttempts([]); } };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(defaultForm); };

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg animate-slide-up"
          style={toast.type === 'success' ? { background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' } : { background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#7C3AED' }}>Admin Panel</p>
          <h1 className="text-3xl font-bold text-slate-900">Quiz Management</h1>
          <p className="text-slate-500 mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} configured</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
          <Plus size={18} /> Create Quiz
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit size={20} style={{ color: '#7C3AED' }} />
                <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Quiz' : 'Create Quiz'}</h2>
              </div>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all">
                <X size={18} style={{ color: '#64748B' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className={inputCls} placeholder="e.g. Linux Fundamentals Quiz" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={2} className={`${inputCls} resize-none`} placeholder="Brief quiz description…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Year</label>
                  <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className={selectCls}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Semester</label>
                  <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className={selectCls}>{SEMESTERS.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={selectCls}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className={selectCls}>{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className={inputCls} placeholder="bash, shell, linux" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Question Count</label>
                  <input type="number" min={1} max={50} value={form.questionCount} onChange={e => setForm(f => ({ ...f, questionCount: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Active (visible to students)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                  {saving ? 'Saving…' : editingId ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button type="button" onClick={closeForm} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-sm transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ background: '#FEF2F2' }}>
              <Trash2 size={22} style={{ color: '#DC2626' }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Quiz?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This will permanently delete <strong>"{deleteConfirm.title}"</strong> and all its attempts.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ background: '#DC2626' }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-sm transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Attempts Modal */}
      {viewAttempts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Attempts</h3>
                <p className="text-xs text-slate-400 mt-0.5">{viewAttempts.title}</p>
              </div>
              <button onClick={() => setViewAttempts(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"><X size={18} style={{ color: '#64748B' }} /></button>
            </div>
            <div className="p-4">
              {attempts.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No attempts yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-semibold">User</th>
                    <th className="pb-2 font-semibold text-center">Score</th>
                    <th className="pb-2 font-semibold text-center">%</th>
                    <th className="pb-2 font-semibold text-right">Date</th>
                  </tr></thead>
                  <tbody>
                    {attempts.map((a, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 text-slate-700 font-medium truncate max-w-[140px]">{a.userId}</td>
                        <td className="py-2.5 text-center font-bold text-indigo-600">{a.score}/{a.totalQuestions}</td>
                        <td className="py-2.5 text-center text-slate-600">{Math.round(a.percentage)}%</td>
                        <td className="py-2.5 text-right text-slate-400 text-xs">{new Date(a.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-[3px] rounded-full animate-spin" style={{ borderColor: '#EEF2FF', borderTopColor: '#7C3AED' }} /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200/60">
          <BrainCircuit size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No quizzes yet</h3>
          <p className="text-slate-400 text-sm">Create your first quiz to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100" style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quiz</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Year / Sem</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qns</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => {
                const d = diffBadge[quiz.difficulty] || { bg: '#F1F5F9', color: '#64748B' };
                return (
                  <tr key={quiz._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{quiz.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{quiz.category}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-slate-700 text-xs font-medium">{quiz.year}</p>
                      <p className="text-slate-400 text-xs">{quiz.semester}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: d.bg, color: d.color }}>{quiz.difficulty}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-700">{quiz.questionCount}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={quiz.isActive ? { background: '#EEF2FF', color: '#4F46E5' } : { background: '#F8FAFC', color: '#94A3B8' }}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleViewAttempts(quiz)} title="View Attempts"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-all" style={{ color: '#4F46E5' }}>
                          <BarChart2 size={15} />
                        </button>
                        <button onClick={() => handleEdit(quiz)} title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-all" style={{ color: '#D97706' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(quiz)} title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-all" style={{ color: '#DC2626' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
