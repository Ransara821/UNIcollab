import { useState, useEffect } from 'react';
import { getSubjects, createSubject, deleteSubject, updateSubject } from '../../services/quizService';
import { PlusCircle, Trash2, Pencil, BookOpen, X, Tag, AlignLeft, GraduationCap, Building, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

const BLANK = { name: '', code: '', year: '1st Year', semester: 'Semester 1', description: '' };
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

// Year-specific color palette matching dashboard stat cards
const YEAR_COLORS = {
  '1st Year': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-200', pill: 'bg-emerald-600 border-emerald-600', hover: 'hover:border-emerald-300 hover:text-emerald-600' },
  '2nd Year': { color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-100',    badge: 'bg-teal-50 text-teal-700 border-teal-200',       ring: 'ring-teal-200',    pill: 'bg-teal-600 border-teal-600',    hover: 'hover:border-teal-300 hover:text-teal-600'    },
  '3rd Year': { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    badge: 'bg-blue-50 text-blue-700 border-blue-200',       ring: 'ring-blue-200',    pill: 'bg-blue-600 border-blue-600',    hover: 'hover:border-blue-300 hover:text-blue-600'    },
  '4th Year': { color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100',  badge: 'bg-purple-50 text-purple-700 border-purple-200', ring: 'ring-purple-200',  pill: 'bg-purple-600 border-purple-600', hover: 'hover:border-purple-300 hover:text-purple-600' },
};

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
    <div
      className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition-all animate-fade-in ${styles[type] ?? styles.success}`}
    >
      <CheckCircle2 size={20} strokeWidth={2.5} className="shrink-0" />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirmModal({ subject, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
          <AlertTriangle size={28} className="text-red-500" strokeWidth={2.5} />
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-2">Delete Subject</h2>
        <p className="text-slate-500 text-sm font-medium mb-8">
          Are you sure you want to remove this subject?
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 size={16} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Subject Form Modal ───────────────────────────────────────
function SubjectFormModal({ editData, onClose, onRefresh, onSuccess }) {
  const isCreate = editData === 'create';
  const [form, setForm] = useState(isCreate ? { ...BLANK } : { ...editData });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const yrColors = YEAR_COLORS[form.year] || YEAR_COLORS['1st Year'];

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (isCreate) {
        await createSubject(form);
        onSuccess('success', 'Subject created successfully!');
      } else {
        await updateSubject(form._id, form);
        onSuccess('update', 'Subject updated successfully!');
      }
      onRefresh();
      onClose();
    } catch (er) {
      setErr(er.response?.data?.message || 'Error occurred while saving the subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-6 rounded-t-[2rem] flex items-center justify-between ${yrColors.bg} border-b ${yrColors.border}`}>
          <div>
            <h2 className={`text-2xl font-black ${yrColors.color}`}>{isCreate ? 'Initialize Subject' : 'Modify Syllabus'}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{isCreate ? 'Add a new academic module' : 'Update course registry'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm border border-slate-200 text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <BookOpen size={14} className={yrColors.color} /> Subject Title
              </label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400" placeholder="Enter Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Tag size={14} className={yrColors.color} /> Course Code
              </label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400" placeholder="Enter Course Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <GraduationCap size={14} className={yrColors.color} /> Academic Year
                </label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-800" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Building size={14} className={yrColors.color} /> Term / Semester
                </label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-800" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <AlignLeft size={14} className={yrColors.color} /> Short Description
              </label>
              <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-400 focus:bg-white transition-all font-medium text-slate-600 resize-none h-24 placeholder:font-normal placeholder:text-slate-400" placeholder="Brief outline of the course parameters..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          {err && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold">{err}</div>}

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors">Cancel</button>
            <button disabled={saving} className={`flex-1 py-4 rounded-xl text-white font-black shadow-lg transition-all disabled:opacity-50 flex justify-center items-center hover:-translate-y-0.5 ${yrColors.bg.replace('bg-', 'shadow-')} ${yrColors.pill}`}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Registry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');
  const [toast, setToast] = useState(null); // { type, message }

  const showToast = (type, message) => setToast({ type, message });
  const dismissToast = () => setToast(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      setSubjects(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredSubjects = yearFilter === 'All'
    ? subjects
    : subjects.filter(s => s.year === yearFilter);

  const [deleteTarget, setDeleteTarget] = useState(null); // subject object to delete
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (sub) => setDeleteTarget(sub);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteSubject(deleteTarget._id);
      setDeleteTarget(null);
      load();
      showToast('delete', 'Subject deleted successfully!');
    } catch (err) {
      setDeleteTarget(null);
      showToast('error', 'Deletion blocked. Subject may be linked to active quizzes.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">

      {/* Header — matches dashboard header style */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <TrendingUp size={14} /> Course Registry
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Course Subjects</h1>
          <p className="text-slate-500 mt-2 text-base font-medium">Manage global curriculum categories for quizzes and modules.</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={20} /> Initialize Subject
        </button>
      </div>

      {/* Year Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">Filter by Year</span>
        {['All', ...YEARS].map(yr => {
          const c = yr === 'All' ? null : YEAR_COLORS[yr];
          const isActive = yearFilter === yr;
          return (
            <button
              key={yr}
              onClick={() => setYearFilter(yr)}
              className={`px-5 py-2 rounded-full text-sm font-black border-2 transition-all ${
                isActive
                  ? yr === 'All'
                    ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-800/20'
                    : `${c.pill} text-white shadow-lg`
                  : yr === 'All'
                  ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                  : `bg-white border-slate-200 text-slate-500 ${c.hover}`
              }`}
            >
              {yr === 'All' ? 'All Years' : yr}
            </button>
          );
        })}
      </div>

      {/* Subject Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="font-bold text-slate-600">Syncing syllabus registry...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSubjects.length === 0 && (
            <div className="md:col-span-2 text-center py-16 text-slate-500 bg-white border border-dashed border-slate-300 rounded-[2rem] font-bold">
              {yearFilter === 'All' ? 'No subjects mapped in registry.' : `No subjects found for ${yearFilter}.`}
            </div>
          )}

          {filteredSubjects.map(sub => {
            const c = YEAR_COLORS[sub.year] || YEAR_COLORS['1st Year'];
            return (
              <div key={sub._id} className={`bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                {/* Decorative blob */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.bg} opacity-60 blur-2xl group-hover:scale-150 transition-transform duration-500`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.color} border ${c.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <BookOpen size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-slate-800 leading-tight">{sub.code}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block border ${c.badge}`}>
                          {sub.year} · {sub.semester}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal(sub)}
                        className={`w-10 h-10 border-2 border-slate-100 rounded-xl text-slate-400 flex items-center justify-center hover:${c.bg} hover:${c.color} hover:${c.border} transition-colors`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub)}
                        className="w-10 h-10 border-2 border-slate-100 rounded-xl text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-slate-800 mb-1 text-base">{sub.name}</h4>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2">{sub.description || 'No description provided.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <SubjectFormModal
          editData={modal}
          onClose={() => setModal(null)}
          onRefresh={load}
          onSuccess={showToast}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          subject={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </div>
  );
}
