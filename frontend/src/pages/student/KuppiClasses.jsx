import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getKuppiClasses, getKuppiFilterOptions,
  getMyRecognitionStatus, rateKuppiClass,
  createKuppiClass, getMySessions,
  updateKuppiClass, deleteKuppiClass,
  applyForRecognition, getAllRecognitionApplications, getMyRecognitionApplication, updateRecognitionApplication,
} from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatus   = (d) => new Date(d) >= new Date() ? 'upcoming' : 'completed';
const fmt         = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const fmtTime     = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const toInputDate = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
const EMPTY_FORM  = { title: '', subject: '', academicYear: '', description: '', location: '', sessionDate: '', postedBy: '', capacity: 20 };

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'browse',      label: 'Browse Classes',  icon: '🔍' },
  { id: 'recognition', label: 'Recognition',     icon: '🏅' },
  { id: 'my-sessions', label: 'Create Session',   icon: '📋' },
  { id: 'ratings',     label: 'Ratings',          icon: '⭐' },
];

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ onSubmit, submitting }) {
  const [hovered, setHovered]   = useState(0);
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <button key={n}
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            className="text-xl transition-transform hover:scale-110">
            <span className={(hovered || selected) >= n ? 'text-amber-400' : 'text-slate-200'}>★</span>
          </button>
        ))}
      </div>
      {selected > 0 && (
        <button disabled={submitting} onClick={() => onSubmit(selected)}
          className="text-xs font-bold px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition disabled:opacity-50">
          {submitting ? 'Submitting…' : `Submit ${selected}★`}
        </button>
      )}
    </div>
  );
}

// ── Session Form Modal ────────────────────────────────────────────────────────
function SessionFormModal({ title, initialValues = EMPTY_FORM, filterOptions, onClose, onSave }) {
  const [form, setForm]         = useState({ ...EMPTY_FORM, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr]           = useState('');
  const [errors, setErrors]     = useState({});
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!form.title || !form.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Subject validation
    if (!form.subject || !form.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // Academic Year validation
    if (!form.academicYear || !form.academicYear.trim()) {
      newErrors.academicYear = 'Academic Year is required';
    }

    // Date validation
    if (!form.sessionDate) {
      newErrors.sessionDate = 'Date & Time is required';
    } else {
      const selectedDate = new Date(form.sessionDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.sessionDate = 'Date cannot be in the past';
      }
    }

    // Capacity validation
    if (!form.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else {
      const capacityNum = Number(form.capacity);
      if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 200) {
        newErrors.capacity = 'Capacity must be between 1 and 200';
      }
    }

    // Location validation
    if (!form.location || !form.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Your Name validation
    if (!form.postedBy || !form.postedBy.trim()) {
      newErrors.postedBy = 'Your Name is required';
    }

    // Description validation
    if (!form.description || !form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length <= 10) {
      newErrors.description = 'Description must be more than 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true); setErr('');
    try { await onSave(form); onClose(); }
    catch (e) { setErr(e.response?.data?.message || 'Operation failed.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        {err && <p className="text-red-500 text-sm mb-4 font-medium">⚠️ {err}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. OOP Exam Prep Session"
              className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject *</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.subject ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                <option value="">Select subject</option>
                {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year *</label>
              <select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.academicYear ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                <option value="">Select year</option>
                {filterOptions.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date & Time *</label>
              <input type="datetime-local" value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)}
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.sessionDate ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
              {errors.sessionDate && <p className="text-red-500 text-xs mt-1">{errors.sessionDate}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacity *</label>
              <input type="number" min="1" max="200" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                placeholder="Max participants"
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.capacity ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Lab 2, Block A"
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.location ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your Name *</label>
              <input value={form.postedBy} onChange={e => set('postedBy', e.target.value)} placeholder="Display name"
                className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${errors.postedBy ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
              {errors.postedBy && <p className="text-red-500 text-xs mt-1">{errors.postedBy}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description *</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What will be covered?"
              className={`mt-1 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} />
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-500 text-xs">{form.description.length}/10+ characters required</p>
              {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Browse Classes (Feature 1: Subject-Based Categorization)
// ════════════════════════════════════════════════════════════════════════════
function BrowseTab({ filterOptions }) {
  const [classes, setClasses]           = useState([]);
  const [filters, setFilters]           = useState({ subject: '', academicYear: '', status: '' });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [ratingState, setRatingState]   = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});

  const load = useCallback(() => {
    setLoading(true); setError('');
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    getKuppiClasses(active)
      .then(r => setClasses(r.data))
      .catch(() => setError('Failed to load classes. Make sure the service is running.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const clearFilters = () => setFilters({ subject: '', academicYear: '', status: '' });
  const activeCount  = Object.values(filters).filter(Boolean).length;

  const handleRate = async (id, rating) => {
    setRatingState(s => ({ ...s, [id]: 'submitting' }));
    try {
      await rateKuppiClass(id, rating);
      setRatingState(s => ({ ...s, [id]: 'done' }));
      setRatingFeedback(s => ({ ...s, [id]: 'Rating submitted! ⭐' }));
    } catch (err) {
      setRatingState(s => ({ ...s, [id]: 'error' }));
      setRatingFeedback(s => ({ ...s, [id]: err.response?.data?.message || 'Could not submit rating.' }));
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[200px] flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</label>
            <select value={filters.subject} onChange={e => handleFilter('subject', e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500">
              <option value="">All Subjects</option>
              {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year</label>
            <select value={filters.academicYear} onChange={e => handleFilter('academicYear', e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500">
              <option value="">All Years</option>
              {filterOptions.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
            <div className="flex gap-2">
              {['', 'upcoming', 'completed'].map(s => (
                <button key={s} onClick={() => handleFilter('status', s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    filters.status === s
                      ? s === 'upcoming'  ? 'bg-emerald-500 text-white border-emerald-500'
                      : s === 'completed' ? 'bg-slate-600 text-white border-slate-600'
                      : 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {activeCount > 0 && (
            <button onClick={clearFilters}
              className="px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100">
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-slate-500 mb-4 font-medium">
          {classes.length === 0 ? 'No classes match.' : `Showing ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
        </p>
      )}

      {loading && <div className="py-16 text-center text-slate-400 font-medium">Loading classes…</div>}
      {error   && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-5 text-sm font-medium">⚠️ {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map(cls => {
            const status    = getStatus(cls.sessionDate);
            const isRated   = ratingState[cls._id] === 'done';
            const isRateErr = ratingState[cls._id] === 'error';
            return (
              <div key={cls._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {status}
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{cls.academicYear}</span>
                    {cls.capacity && <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs font-bold">👥 {cls.capacity}</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 leading-snug">{cls.title}</h3>
                  <p className="text-sm text-emerald-600 font-semibold mt-0.5">{cls.subject}</p>
                </div>
                {cls.description && <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{cls.description}</p>}
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><span>📅</span><span>{fmt(cls.sessionDate)}</span></div>
                  <div className="flex items-center gap-2"><span>🕐</span><span>{fmtTime(cls.sessionDate)}</span></div>
                  {cls.location && <div className="flex items-center gap-2"><span>📍</span><span>{cls.location}</span></div>}
                  {cls.postedBy && <div className="flex items-center gap-2"><span>👤</span><span>{cls.postedBy}</span></div>}
                </div>
                {status === 'upcoming' ? (
                  <button className="mt-auto w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200 transition">
                    Enroll Now
                  </button>
                ) : (
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    {isRated || isRateErr ? (
                      <p className={`text-xs font-semibold ${isRated ? 'text-emerald-600' : 'text-red-500'}`}>
                        {ratingFeedback[cls._id]}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-500 mb-1.5">Rate this session</p>
                        <StarRating onSubmit={r => handleRate(cls._id, r)} submitting={ratingState[cls._id] === 'submitting'} />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && classes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-600 font-semibold">No Kuppi classes match your filters.</p>
          <button onClick={clearFilters}
            className="mt-4 px-5 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — Recognition (Form-based: submit to become a recognized tutor)
// ════════════════════════════════════════════════════════════════════════════
function RecognitionTab({ recognition, onRefreshRecognition }) {
  const EMPTY_APP = { name: '', year: '', specialization: '', qualification: '' };
  const [myApp, setMyApp]             = useState(undefined);   // undefined = loading
  const [allApps, setAllApps]         = useState([]);
  const [form, setForm]               = useState(EMPTY_APP);
  const [submitting, setSubmitting]   = useState(false);
  const [formErr, setFormErr]         = useState('');
  const [appsLoading, setAppsLoading] = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [editForm, setEditForm]       = useState(EMPTY_APP);
  const [editErr, setEditErr]         = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [toast, setToast]             = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const loadAll = useCallback(() => {
    setAppsLoading(true);
    getAllRecognitionApplications()
      .then(r => setAllApps(r.data))
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  }, []);

  useEffect(() => {
    getMyRecognitionApplication()
      .then(r => {
        setMyApp(r.data);
        if (r.data) setEditForm(r.data);  // initialize edit form with current data
      })
      .catch(() => setMyApp(null));
    loadAll();
  }, [loadAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormErr('');
    try {
      const res = await applyForRecognition(form);
      setMyApp(res.data.application);
      setForm(EMPTY_APP);
      if (res.data.application) setEditForm(res.data.application);
      onRefreshRecognition();   // update badge + unlock Create Session tab
      loadAll();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true); setEditErr('');
    try {
      const res = await updateRecognitionApplication(editForm);
      setMyApp(res.data.application);
      setIsEditing(false);
      onRefreshRecognition();
      loadAll();
      showToast('Successfully updated!', 'success');
    } catch (err) {
      setEditErr(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const isRecognized = recognition?.recognitionStatus === 'recognized';
  const completedSessions = recognition?.completedSessionsCount ?? 0;
  const minSessions = recognition?.thresholds?.MIN_COMPLETED_SESSIONS ?? 3;
  const hasCompletedRequired = completedSessions >= minSessions;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Toast Notification ── */}
      {toast.message && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
           <div className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-2xl border ${
             toast.type === 'error' 
               ? 'bg-red-600 shadow-red-900/20 border-red-500' 
               : 'bg-emerald-600 shadow-emerald-900/20 border-emerald-500'
           }`}>
             <p className="text-sm font-bold">{toast.message}</p>
             <button onClick={() => setToast({ message: '', type: '' })} className="ml-4 text-white/70 hover:text-white transition-colors text-xl leading-none">
                ×
             </button>
           </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditing && myApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-slate-800">Edit Recognition Details</h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            {editErr && <p className="text-red-500 text-sm mb-4 font-medium">⚠️ {editErr}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                  <input required value={editForm.name} onChange={e => setEditField('name', e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year *</label>
                  <input required value={editForm.year} onChange={e => setEditField('year', e.target.value)}
                    placeholder="e.g. Year 2"
                    className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Specialization *</label>
                  <input required value={editForm.specialization} onChange={e => setEditField('specialization', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Qualification *</label>
                  <input required value={editForm.qualification} onChange={e => setEditField('qualification', e.target.value)}
                    placeholder="e.g. BSc (Hons) in IT"
                    className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)} disabled={editSubmitting}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {editSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {myApp === undefined ? (
        <div className="py-10 text-center text-slate-400">Loading…</div>
      ) : myApp && hasCompletedRequired ? (
        /* Already applied and completed required sessions — show recognition card */
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🏅</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Recognition Granted</p>
                <h2 className="text-xl font-extrabold text-emerald-800">You are a Recognized Tutor</h2>
                <p className="text-sm text-emerald-600 mt-0.5">You can now create and manage Kuppi sessions.</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-xl transition whitespace-nowrap">
              ✏️ Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Name',           value: myApp.name },
              { label: 'Year',           value: myApp.year },
              { label: 'Specialization', value: myApp.specialization },
              { label: 'Qualification',  value: myApp.qualification },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-xl px-4 py-3 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : myApp && !hasCompletedRequired ? (
        /* Applied but not yet completed required sessions — show progress */
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">⏳</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-0.5">Application Pending</p>
                <h2 className="text-xl font-extrabold text-amber-800">Complete {minSessions} Sessions</h2>
                <p className="text-sm text-amber-600 mt-0.5">You need to complete {minSessions - completedSessions} more session(s) to be recognized.</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white hover:bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold rounded-xl transition whitespace-nowrap">
              ✏️ Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              { label: 'Name',           value: myApp.name },
              { label: 'Year',           value: myApp.year },
              { label: 'Specialization', value: myApp.specialization },
              { label: 'Qualification',  value: myApp.qualification },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-xl px-4 py-3 border border-amber-100">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl px-4 py-3 border border-amber-100">
            <p className="text-sm font-semibold text-slate-700 mb-2">Completed Sessions: {completedSessions} / {minSessions}</p>
            <div className="w-full bg-amber-100 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedSessions / minSessions) * 100)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        /* Not yet applied — show recognition form */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">📋</div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Apply for Recognition</h2>
              <p className="text-sm text-slate-400 mt-0.5">Fill in your details to become a recognized Kuppi tutor instantly.</p>
            </div>
          </div>

          {formErr && <p className="text-red-500 text-sm mb-4 font-medium">⚠️ {formErr}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                <input required value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year *</label>
                <input required value={form.year} onChange={e => setField('year', e.target.value)}
                  placeholder="e.g. Year 2"
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Specialization *</label>
                <input required value={form.specialization} onChange={e => setField('specialization', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Qualification *</label>
                <input required value={form.qualification} onChange={e => setField('qualification', e.target.value)}
                  placeholder="e.g. BSc (Hons) in IT"
                  className="mt-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-sm shadow-emerald-200">
              {submitting ? 'Submitting…' : 'Submit & Get Recognized'}
            </button>
          </form>
        </div>
      )}

      {/* ── Recognized Tutors Directory ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-extrabold text-slate-800 mb-1">Recognized Tutors</h3>
        <p className="text-sm text-slate-400 mb-5">All approved tutors in the platform</p>

        {appsLoading && <div className="py-8 text-center text-slate-400 text-sm">Loading tutors…</div>}

        {!appsLoading && allApps.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">No recognized tutors yet.</div>
        )}

        {!appsLoading && allApps.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allApps.map(app => (
              <div key={app._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg shrink-0">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{app.name}</p>
                  <p className="text-xs text-slate-500 truncate">{app.specialization} · {app.year}</p>
                  <p className="text-xs text-emerald-600 font-medium truncate">{app.qualification}</p>
                </div>
                <span className="ml-auto shrink-0 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">🏅</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh button — only useful if the user wants to check if others got recognized */}
      {isRecognized && (
        <button onClick={loadAll}
          className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
          🔄 Refresh Directory
        </button>
      )}
    </div>
  );
}

// ── Shared: session list rows used by both admin and student panels ───────────
function SessionRows({ sessions, onEdit, deleteId, deleteErr, deleting, onDeleteRequest, onDeleteCancel, onDeleteConfirm }) {
  return (
    <div className="space-y-4">
      {sessions.map(cls => {
        const status          = getStatus(cls.sessionDate);
        const isPendingDelete = deleteId === cls._id;
        return (
          <div key={cls._id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition p-5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {status}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{cls.academicYear}</span>
                <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs font-bold">👥 {cls.capacity ?? '—'} seats</span>
              </div>
              <p className="text-base font-extrabold text-slate-800 truncate">{cls.title}</p>
              <p className="text-sm text-emerald-600 font-semibold">{cls.subject}</p>
              <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-slate-400 font-medium">
                <span>📅 {fmt(cls.sessionDate)} · {fmtTime(cls.sessionDate)}</span>
                {cls.location && <span>📍 {cls.location}</span>}
                {cls.postedBy && <span>👤 {cls.postedBy}</span>}
              </div>
              {cls.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cls.description}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isPendingDelete ? (
                <>
                  <button onClick={() => onEdit(cls)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
                    ✏️ Edit
                  </button>
                  <button onClick={() => onDeleteRequest(cls._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 text-xs font-bold rounded-xl transition">
                    🗑️ Delete
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 items-end">
                  <p className="text-xs font-bold text-red-500">Delete this session?</p>
                  {deleteErr && <p className="text-xs text-red-400">{deleteErr}</p>}
                  <div className="flex gap-2">
                    <button onClick={onDeleteCancel} disabled={deleting}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition">
                      Cancel
                    </button>
                    <button onClick={() => onDeleteConfirm(cls._id)} disabled={deleting}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
                      {deleting ? 'Deleting…' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Shared: CRUD state logic used by both panels ──────────────────────────────
function useCRUD(loadFn) {
  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [deleteErr, setDeleteErr]   = useState('');
  const [toast, setToast]           = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const reload = useCallback(() => {
    setLoading(true);
    loadFn()
      .then(r => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadFn]);

  useEffect(() => { reload(); }, [reload]);

  const handleCreate = async (form) => { await createKuppiClass(form); reload(); };
  const handleEdit   = async (form) => {
    await updateKuppiClass(editTarget._id, form);
    reload();
    showToast('Successfully updated!', 'success');
  };
  const handleDelete = async (id) => {
    setDeleting(true); setDeleteErr('');
    try {
      await deleteKuppiClass(id);
      setSessions(s => s.filter(c => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      setDeleteErr(err.response?.data?.message || 'Delete failed.');
    } finally { setDeleting(false); }
  };

  return {
    sessions, loading, editTarget, setEditTarget,
    showCreate, setShowCreate, deleteId, setDeleteId,
    deleting, deleteErr, setDeleteErr,
    reload, handleCreate, handleEdit, handleDelete,
    toast, setToast, showToast
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PANEL A — Admin: full CRUD over all sessions
// ════════════════════════════════════════════════════════════════════════════
function AdminPanel({ filterOptions }) {
  const crud = useCRUD(useCallback(() => getKuppiClasses(), []));

  return (
    <div>
      {/* ── Toast Notification ── */}
      {crud.toast.message && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
           <div className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-2xl border ${
             crud.toast.type === 'error' 
               ? 'bg-red-600 shadow-red-900/20 border-red-500' 
               : 'bg-emerald-600 shadow-emerald-900/20 border-emerald-500'
           }`}>
             <p className="text-sm font-bold">{crud.toast.message}</p>
             <button onClick={() => crud.setToast({ message: '', type: '' })} className="ml-4 text-white/70 hover:text-white transition-colors text-xl leading-none">
                ×
             </button>
           </div>
        </div>
      )}

      {/* Admin header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Admin — Kuppi Class Management</h2>
            <p className="text-sm text-slate-400 mt-0.5">Full CRUD access over all sessions — no recognition required</p>
          </div>
        </div>
        <button onClick={() => crud.setShowCreate(true)}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-violet-200 transition">
          + Create Session
        </button>
      </div>

      {/* Stats row */}
      {!crud.loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Sessions', value: crud.sessions.length, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Upcoming',       value: crud.sessions.filter(s => getStatus(s.sessionDate) === 'upcoming').length,  color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Completed',      value: crud.sessions.filter(s => getStatus(s.sessionDate) === 'completed').length, color: 'text-slate-500',   bg: 'bg-slate-100' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-slate-100`}>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {crud.loading && <div className="py-16 text-center text-slate-400">Loading all sessions…</div>}

      {!crud.loading && crud.sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-600 font-semibold">No Kuppi sessions exist yet.</p>
        </div>
      )}

      {!crud.loading && crud.sessions.length > 0 && (
        <SessionRows
          sessions={crud.sessions}
          onEdit={cls => crud.setEditTarget(cls)}
          deleteId={crud.deleteId}
          deleteErr={crud.deleteErr}
          deleting={crud.deleting}
          onDeleteRequest={id => { crud.setDeleteId(id); crud.setDeleteErr(''); }}
          onDeleteCancel={() => crud.setDeleteId(null)}
          onDeleteConfirm={crud.handleDelete}
        />
      )}

      {crud.showCreate && (
        <SessionFormModal title="Create Kuppi Session (Admin)" filterOptions={filterOptions}
          onClose={() => crud.setShowCreate(false)} onSave={crud.handleCreate} />
      )}
      {crud.editTarget && (
        <SessionFormModal title="Edit Session (Admin)"
          initialValues={{ ...crud.editTarget, sessionDate: toInputDate(crud.editTarget.sessionDate) }}
          filterOptions={filterOptions}
          onClose={() => crud.setEditTarget(null)} onSave={crud.handleEdit} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANEL B — Recognized Student: CRUD over their own sessions only
// ════════════════════════════════════════════════════════════════════════════
function StudentPanel({ filterOptions }) {
  const crud = useCRUD(useCallback(() => getMySessions(), []));

  return (
    <div>
      {/* ── Toast Notification ── */}
      {crud.toast.message && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
           <div className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-2xl border ${
             crud.toast.type === 'error' 
               ? 'bg-red-600 shadow-red-900/20 border-red-500' 
               : 'bg-emerald-600 shadow-emerald-900/20 border-emerald-500'
           }`}>
             <p className="text-sm font-bold">{crud.toast.message}</p>
             <button onClick={() => crud.setToast({ message: '', type: '' })} className="ml-4 text-white/70 hover:text-white transition-colors text-xl leading-none">
                ×
             </button>
           </div>
        </div>
      )}

      {/* Student header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">🏅</div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">My Kuppi Sessions</h2>
            <p className="text-sm text-slate-400 mt-0.5">Create and manage the sessions you host</p>
          </div>
        </div>
        <button onClick={() => crud.setShowCreate(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-200 transition">
          + Create Session
        </button>
      </div>

      {crud.loading && <div className="py-16 text-center text-slate-400">Loading your sessions…</div>}

      {!crud.loading && crud.sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-600 font-semibold">No sessions yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "Create Session" to host your first Kuppi session.</p>
        </div>
      )}

      {!crud.loading && crud.sessions.length > 0 && (
        <SessionRows
          sessions={crud.sessions}
          onEdit={cls => crud.setEditTarget(cls)}
          deleteId={crud.deleteId}
          deleteErr={crud.deleteErr}
          deleting={crud.deleting}
          onDeleteRequest={id => { crud.setDeleteId(id); crud.setDeleteErr(''); }}
          onDeleteCancel={() => crud.setDeleteId(null)}
          onDeleteConfirm={crud.handleDelete}
        />
      )}

      {crud.showCreate && (
        <SessionFormModal title="Create Kuppi Session" filterOptions={filterOptions}
          onClose={() => crud.setShowCreate(false)} onSave={crud.handleCreate} />
      )}
      {crud.editTarget && (
        <SessionFormModal title="Edit Session"
          initialValues={{ ...crud.editTarget, sessionDate: toInputDate(crud.editTarget.sessionDate) }}
          filterOptions={filterOptions}
          onClose={() => crud.setEditTarget(null)} onSave={crud.handleEdit} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — Create Session: routes to the right panel based on role
// ════════════════════════════════════════════════════════════════════════════
function MySessionsTab({ filterOptions, isRecognized, isAdmin, onSwitchToRecognition }) {
  if (isAdmin)      return <AdminPanel filterOptions={filterOptions} />;
  if (isRecognized) return <StudentPanel filterOptions={filterOptions} />;

  // Normal student — locked
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center max-w-md mx-auto">
      <p className="text-5xl mb-4">🔒</p>
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">Recognized Students Only</h3>
      <p className="text-slate-400 text-sm mb-6">
        You need to be a Recognized Student to create and manage Kuppi sessions.
        Submit the recognition form to unlock this feature instantly.
      </p>
      <button onClick={onSwitchToRecognition}
        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition">
        Go to Recognition Form
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 4 — Ratings & Auto-Recognition
// ════════════════════════════════════════════════════════════════════════════
function RatingsTab({ recognition, onRefreshRecognition }) {
  const [sessions, setSessions]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [ratingState, setRatingState]       = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});

  useEffect(() => {
    setLoading(true);
    getKuppiClasses({ status: 'completed' })
      .then(r => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async (id, rating) => {
    setRatingState(s => ({ ...s, [id]: 'submitting' }));
    try {
      await rateKuppiClass(id, rating);
      setRatingState(s => ({ ...s, [id]: 'done' }));
      setRatingFeedback(s => ({ ...s, [id]: `${rating}★ submitted! Host recognition updated.` }));
      onRefreshRecognition();
    } catch (err) {
      setRatingState(s => ({ ...s, [id]: 'error' }));
      setRatingFeedback(s => ({ ...s, [id]: err.response?.data?.message || 'Could not submit rating.' }));
    }
  };

  const isRecognized = recognition?.recognitionStatus === 'recognized';
  const count        = recognition?.completedSessionsCount ?? 0;
  const avg          = recognition?.averageRating ?? 0;
  const minSessions  = recognition?.thresholds?.MIN_COMPLETED_SESSIONS ?? 3;
  const minRating    = recognition?.thresholds?.MIN_AVERAGE_RATING ?? 4.0;
  const sessionsPct  = Math.min(100, (count / minSessions) * 100);
  const ratingPct    = Math.min(100, (avg / minRating) * 100);

  return (
    <div className="space-y-6">

      {/* ── Your Teaching Performance ── */}
      <div className={`rounded-2xl border p-6 ${isRecognized ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${isRecognized ? 'bg-emerald-500' : 'bg-amber-100'}`}>
            {isRecognized ? '🏅' : '📊'}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-800">Your Teaching Performance</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {isRecognized ? 'You are a recognized tutor. Keep up the great work!' : 'Host sessions and earn ratings to get auto-recognized.'}
            </p>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
            isRecognized ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
            {isRecognized ? 'Recognized' : 'Normal'}
          </span>
        </div>

        {!isRecognized && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700 font-medium">
            🤖 Auto-recognition is granted when you complete <strong>{minSessions} sessions</strong> with an average rating of <strong>{minRating}+</strong>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-slate-600">✅ Completed Sessions</span>
              <span className="text-sm font-bold text-slate-800">{count} / {minSessions}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${sessionsPct}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {count >= minSessions ? '✓ Requirement met' : `${minSessions - count} more session(s) needed`}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-slate-600">⭐ Average Rating</span>
              <span className="text-sm font-bold text-slate-800">{avg.toFixed(1)} / {minRating}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${ratingPct}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {avg >= minRating ? '✓ Requirement met' : `Need avg rating of ${minRating} or above`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Rate Completed Sessions ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-base font-extrabold text-slate-800">Rate Completed Sessions</h3>
          {!loading && (
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && <div className="py-10 text-center text-slate-400 text-sm">Loading sessions…</div>}

        {!loading && sessions.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-3xl mb-3">🎓</p>
            <p className="text-slate-600 font-semibold">No completed sessions yet.</p>
            <p className="text-slate-400 text-sm mt-1">Sessions appear here once they have passed their scheduled date.</p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(cls => {
              const isDone = ratingState[cls._id] === 'done';
              const isErr  = ratingState[cls._id] === 'error';
              const isBusy = ratingState[cls._id] === 'submitting';
              return (
                <div key={cls._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800 leading-snug">{cls.title}</h4>
                    <p className="text-sm text-emerald-600 font-semibold mt-0.5">{cls.subject}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 font-medium">
                    <span>📅 {fmt(cls.sessionDate)}</span>
                    <span>🕐 {fmtTime(cls.sessionDate)}</span>
                    {cls.postedBy && <span>👤 {cls.postedBy}</span>}
                    {cls.academicYear && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">{cls.academicYear}</span>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-auto">
                    {isDone || isErr ? (
                      <p className={`text-sm font-semibold ${isDone ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isDone ? '⭐ ' : '⚠️ '}{ratingFeedback[cls._id]}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-500 mb-2">Rate this session</p>
                        <StarRating onSubmit={r => handleRate(cls._id, r)} submitting={isBusy} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── How Auto-Recognition Works ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-extrabold text-slate-800 mb-4">How Auto-Recognition Works</h3>
        <div className="space-y-3">
          {[
            { icon: '🎓', title: 'Host Sessions',    desc: 'Create and run Kuppi sessions as a tutor.' },
            { icon: '⭐', title: 'Collect Ratings',  desc: 'Participants rate your sessions once they are completed.' },
            { icon: '🤖', title: 'Auto-Evaluated',   desc: 'Your average rating is re-calculated after every new submission.' },
            { icon: '🏅', title: 'Get Recognized',   desc: `Reach ${minSessions} sessions with avg ≥ ${minRating} and recognition is granted automatically.` },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-700">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════
export default function KuppiClasses() {
  const { user }                          = useAuth();
  const [activeTab, setActiveTab]         = useState('browse');
  const [recognition, setRecognition]     = useState(null);
  const [filterOptions, setFilterOptions] = useState({ subjects: [], academicYears: [] });

  const isAdmin      = user?.role === 'admin';
  const isRecognized = recognition?.recognitionStatus === 'recognized';

  const refreshRecognition = useCallback(() => {
    getMyRecognitionStatus().then(r => setRecognition(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    getKuppiFilterOptions().then(r => setFilterOptions(r.data)).catch(() => {});
    refreshRecognition();
  }, [refreshRecognition]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">🎓 Kuppi Classes</h1>
        <p className="text-slate-500 mt-1">Browse, manage, and enroll in peer-to-peer tutoring sessions.</p>
      </div>

      {/* ── Tab Navigation (matches Study Group Finder style) ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
            }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {/* Badge: recognition status pill on the Recognition tab */}
            {tab.id === 'recognition' && recognition && (
              <span className={`ml-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : isRecognized ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'
              }`}>
                {isRecognized ? 'Recognized' : 'Normal'}
              </span>
            )}
            {/* Lock badge on Create Session tab if no access */}
            {tab.id === 'my-sessions' && !isAdmin && !isRecognized && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                🔒
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'browse' && (
        <BrowseTab filterOptions={filterOptions} />
      )}
      {activeTab === 'recognition' && (
        <RecognitionTab recognition={recognition} onRefreshRecognition={refreshRecognition} />
      )}
      {activeTab === 'my-sessions' && (
        <MySessionsTab
          filterOptions={filterOptions}
          isRecognized={isRecognized}
          isAdmin={isAdmin}
          onSwitchToRecognition={() => setActiveTab('recognition')}
        />
      )}
      {activeTab === 'ratings' && (
        <RatingsTab recognition={recognition} onRefreshRecognition={refreshRecognition} />
      )}
    </div>
  );
}
