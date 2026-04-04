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
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(n => (
          <button key={n}
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            className="text-2xl transition-all duration-200 hover:scale-125 transform">
            <span className={(hovered || selected) >= n ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200 opacity-60 hover:opacity-100'}>★</span>
          </button>
        ))}
      </div>
      {selected > 0 && (
        <button disabled={submitting} onClick={() => onSubmit(selected)}
          className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm shadow-amber-200 transform hover:scale-105">
          {submitting ? '⏳ Submitting…' : `✓ Submit ${selected}★`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 my-auto border border-white/20 transform transition-all">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-2xl leading-none">×</button>
        </div>
        {err && <p className="text-red-500 text-sm mb-5 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">⚠️ {err}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. OOP Exam Prep Session"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.title ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
            {errors.title && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.title}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Subject *</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.subject ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`}>
                <option value="">Select subject</option>
                {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.subject}</p>}
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Academic Year *</label>
              <select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.academicYear ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`}>
                <option value="">Select year</option>
                {filterOptions.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.academicYear && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.academicYear}</p>}
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Date & Time *</label>
              <input type="datetime-local" value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.sessionDate ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
              {errors.sessionDate && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.sessionDate}</p>}
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Capacity *</label>
              <input type="number" min="1" max="200" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                placeholder="Max participants"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.capacity ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
              {errors.capacity && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.capacity}</p>}
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Lab 2, Block A"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.location ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
              {errors.location && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.location}</p>}
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Your Name *</label>
              <input value={form.postedBy} onChange={e => set('postedBy', e.target.value)} placeholder="Display name"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 ${errors.postedBy ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
              {errors.postedBy && <p className="text-red-500 text-xs mt-2 font-medium">✕ {errors.postedBy}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Description *</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What will be covered in this session?"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:outline-none transition-all duration-200 resize-none ${errors.description ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'}`} />
            <div className="flex justify-between items-center mt-2.5">
              <p className={`text-xs font-medium ${form.description.length > 10 ? 'text-emerald-600' : 'text-slate-400'}`}>{form.description.length}/10+ characters required</p>
              {errors.description && <p className="text-red-500 text-xs font-medium">✕ {errors.description}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm shadow-emerald-200 transform hover:scale-105 disabled:hover:scale-100">
              {submitting ? '⏳ Saving…' : '✓ Save Session'}
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
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col gap-2 min-w-[200px] flex-1">
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Subject</label>
            <select value={filters.subject} onChange={e => handleFilter('subject', e.target.value)}
              className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 hover:border-slate-300 cursor-pointer">
              <option value="">All Subjects</option>
              {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Academic Year</label>
            <select value={filters.academicYear} onChange={e => handleFilter('academicYear', e.target.value)}
              className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 hover:border-slate-300 cursor-pointer">
              <option value="">All Years</option>
              {filterOptions.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Status</label>
            <div className="flex gap-2 flex-wrap">
              {['', 'upcoming', 'completed'].map(s => (
                <button key={s} onClick={() => handleFilter('status', s)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 transform ${
                    filters.status === s
                      ? s === 'upcoming'  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200 scale-105'
                      : s === 'completed' ? 'bg-slate-600 text-white border-slate-600 shadow-sm shadow-slate-200 scale-105'
                      : 'bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-400 scale-105'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-100'}`}>
                  {s === '' ? '✓ All' : s === 'upcoming' ? '🚀 ' + s.charAt(0).toUpperCase() + s.slice(1) : '✓ ' + s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {activeCount > 0 && (
            <button onClick={clearFilters}
              className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-red-100">
              ✕ Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-slate-600 mb-6 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          {classes.length === 0 ? 'No classes match your filters.' : `📊 Showing ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
        </p>
      )}

      {loading && <div className="py-16 text-center text-slate-400 font-medium">⏳ Loading amazing classes…</div>}
      {error   && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-5 text-sm font-medium">⚠️ {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => {
            const status    = getStatus(cls.sessionDate);
            const isRated   = ratingState[cls._id] === 'done';
            const isRateErr = ratingState[cls._id] === 'error';
            return (
              <div key={cls._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 p-6 flex flex-col gap-4 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                    status === 'upcoming' ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 shadow-sm shadow-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
                    {status === 'upcoming' ? '🚀 ' : '✓ '}{status}
                  </span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-bold shadow-sm shadow-blue-100">📚 {cls.academicYear}</span>
                    {cls.capacity && <span className="px-3 py-1 bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 rounded-full text-xs font-bold shadow-sm shadow-violet-100">👥 {cls.capacity}</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug line-clamp-2">{cls.title}</h3>
                  <p className="text-sm text-emerald-600 font-bold mt-1.5 flex items-center gap-1">📖 {cls.subject}</p>
                </div>
                {cls.description && <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 bg-slate-50 rounded-lg p-3 italic">\"{cls.description}\"</p>}
                <div className="space-y-2 text-sm text-slate-600 py-2">
                  <div className="flex items-center gap-2 font-medium"><span>📅</span><span>{fmt(cls.sessionDate)}</span></div>
                  <div className="flex items-center gap-2 font-medium"><span>🕐</span><span>{fmtTime(cls.sessionDate)}</span></div>
                  {cls.location && <div className="flex items-center gap-2 font-medium"><span>📍</span><span className="truncate">{cls.location}</span></div>}
                  {cls.postedBy && <div className="flex items-center gap-2 font-medium"><span>👤</span><span className="truncate">{cls.postedBy}</span></div>}
                </div>
                {status === 'upcoming' ? (
                  <button className="mt-auto w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-200 transition-all duration-200 transform hover:scale-105 active:scale-95">
                    🎯 Enroll Now
                  </button>
                ) : (
                  <div className="mt-auto pt-4 border-t border-slate-200">
                    {isRated || isRateErr ? (
                      <p className={`text-sm font-bold flex items-center gap-2 ${isRated ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isRated ? '✓ ' : '✕ '}{ratingFeedback[cls._id]}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-extrabold text-slate-700 mb-3 uppercase tracking-widest">⭐ Rate this session</p>
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
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-700 font-bold text-lg mb-2">No Kuppi classes match your filters.</p>
          <p className="text-slate-500 mb-6">Try adjusting your search criteria or check back later!</p>
          <button onClick={clearFilters}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md shadow-emerald-200 transform hover:scale-105">
            ✕ Clear Filters
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

      {/* ── Edit Modal ── */}
      {isEditing && myApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 my-auto border border-white/20 transform transition-all">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Edit Recognition Details</h2>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-2xl leading-none">×</button>
            </div>
            {editErr && <p className="text-red-500 text-sm mb-5 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">⚠️ {editErr}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Full Name *</label>
                  <input required value={editForm.name} onChange={e => setEditField('name', e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Academic Year *</label>
                  <input required value={editForm.year} onChange={e => setEditField('year', e.target.value)}
                    placeholder="e.g. Year 2"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Specialization *</label>
                  <input required value={editForm.specialization} onChange={e => setEditField('specialization', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Qualification *</label>
                  <input required value={editForm.qualification} onChange={e => setEditField('qualification', e.target.value)}
                    placeholder="e.g. BSc (Hons) in IT"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)} disabled={editSubmitting}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm shadow-emerald-200 transform hover:scale-105 disabled:hover:scale-100">
                  {editSubmitting ? '⏳ Saving…' : '✓ Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {myApp === undefined ? (
        <div className="py-12 text-center text-slate-400 font-medium">⏳ Loading…</div>
      ) : myApp && hasCompletedRequired ? (
        /* Already applied and completed required sessions — show recognition card */
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-md shadow-emerald-300 transform -rotate-12 animate-bounce">🏅</div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 mb-1">✓ Recognition Granted</p>
                <h2 className="text-2xl font-extrabold text-emerald-900">Recognized Tutor</h2>
                <p className="text-sm text-emerald-700 mt-1 font-medium">You can now create and manage Kuppi sessions!</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)}
              className="px-5 py-3 bg-white hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-700 text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap transform hover:scale-105">
              ✏️ Edit Detail
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Name',           value: myApp.name, icon: '👤' },
              { label: 'Year',           value: myApp.year, icon: '📚' },
              { label: 'Specialization', value: myApp.specialization, icon: '🎓' },
              { label: 'Qualification',  value: myApp.qualification, icon: '📜' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/80 hover:bg-white rounded-2xl px-4 py-4 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-200">
                <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1">{icon} {label}</p>
                <p className="font-bold text-slate-800 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : myApp && !hasCompletedRequired ? (
        /* Applied but not yet completed required sessions — show progress */
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center text-3xl shadow-md shadow-amber-300">⏳</div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-amber-700 mb-1">⚡ Pending Recognition</p>
                <h2 className="text-2xl font-extrabold text-amber-900">Complete {minSessions} Sessions</h2>
                <p className="text-sm text-amber-700 mt-1 font-medium">Need {minSessions - completedSessions} more session(s) for recognition</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)}
              className="px-5 py-3 bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-700 text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap transform hover:scale-105">
              ✏️ Edit Details
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            {[
              { label: 'Name',           value: myApp.name, icon: '👤' },
              { label: 'Year',           value: myApp.year, icon: '📚' },
              { label: 'Specialization', value: myApp.specialization, icon: '🎓' },
              { label: 'Qualification',  value: myApp.qualification, icon: '📜' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/80 hover:bg-white rounded-2xl px-4 py-4 border-2 border-amber-100 hover:border-amber-300 transition-all duration-200">
                <p className="text-xs font-extrabold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">{icon} {label}</p>
                <p className="font-bold text-slate-800 truncate">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/80 rounded-2xl px-5 py-4 border-2 border-amber-100 mt-6">
            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📊 Progress: {completedSessions} / {minSessions} sessions</p>
            <div className="w-full bg-amber-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500 shadow-sm shadow-amber-300"
                style={{ width: `${Math.min(100, (completedSessions / minSessions) * 100)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        /* Not yet applied — show recognition form */
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📋</div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Apply for Recognition</h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">Fill in your details to become a recognized tutor instantly 🚀</p>
            </div>
          </div>

          {formErr && <p className="text-red-500 text-sm mb-6 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">⚠️ {formErr}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Full Name *</label>
                <input required value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Academic Year *</label>
                <input required value={form.year} onChange={e => setField('year', e.target.value)}
                  placeholder="e.g. Year 2"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Specialization *</label>
                <input required value={form.specialization} onChange={e => setField('specialization', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest block mb-2">Qualification *</label>
                <input required value={form.qualification} onChange={e => setField('qualification', e.target.value)}
                  placeholder="e.g. BSc (Hons) in IT"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-md shadow-emerald-200 transform hover:scale-105 disabled:hover:scale-100">
              {submitting ? '⏳ Submitting…' : '🚀 Submit & Get Recognized'}
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

  const reload = useCallback(() => {
    setLoading(true);
    loadFn()
      .then(r => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadFn]);

  useEffect(() => { reload(); }, [reload]);

  const handleCreate = async (form) => { await createKuppiClass(form); reload(); };
  const handleEdit   = async (form) => { await updateKuppiClass(editTarget._id, form); reload(); };
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
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PANEL A — Admin: full CRUD over all sessions
// ════════════════════════════════════════════════════════════════════════════
function AdminPanel({ filterOptions }) {
  const crud = useCRUD(useCallback(() => getKuppiClasses(), []));

  return (
    <div>
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
      {/* ── Hero Banner ── */}
      <div className="mb-12 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-10 shadow-lg overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
                <span className="text-lg">🏫</span>
                <span className="text-xs font-bold text-white uppercase tracking-widest">Peer Learning Center</span>
              </div>
              
              {/* Main heading */}
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                Kuppi Classes
              </h1>
              
              {/* Description */}
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed font-medium">
                Connect with recognized tutors and peer-learners. Host sessions, earn recognition, and master your subjects through interactive tutoring.
              </p>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button onClick={() => setActiveTab('browse')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'browse'
                    ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200'
                    : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
                }`}>
                <span>🔍</span> Browse Classes
              </button>
              <button onClick={() => setActiveTab('recognition')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'recognition'
                    ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200'
                    : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
                }`}>
                <span>🏅</span> Recognition
              </button>
              <button onClick={() => setActiveTab('my-sessions')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'my-sessions'
                    ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200'
                    : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
                }`}>
                <span>📋</span> Create Session
              </button>
              <button onClick={() => setActiveTab('ratings')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'ratings'
                    ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200'
                    : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
                }`}>
                <span>⭐</span> Ratings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation (compact) ── */}
      <div className="flex flex-wrap gap-2 mb-10 hidden">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border-2 transform ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm'
            }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {/* Badge: recognition status pill on the Recognition tab */}
            {tab.id === 'recognition' && recognition && (
              <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                activeTab === tab.id ? 'bg-white/30' : isRecognized ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {isRecognized ? '✓ Recognized' : '⏳ Pending'}
              </span>
            )}
            {/* Lock badge on Create Session tab if no access */}
            {tab.id === 'my-sessions' && !isAdmin && !isRecognized && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>
                🔒 Locked
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
