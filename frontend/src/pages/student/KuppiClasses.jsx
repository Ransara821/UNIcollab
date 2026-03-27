import { useState, useEffect } from 'react';
import { getKuppiClasses, getKuppiFilterOptions } from '../../services/api';

const STATUS_COLORS = {
  upcoming: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-500',
};

function getStatus(sessionDate) {
  return new Date(sessionDate) >= new Date() ? 'upcoming' : 'completed';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

export default function KuppiClasses() {
  const [classes, setClasses] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ subjects: [], academicYears: [], statuses: [] });
  const [filters, setFilters] = useState({ subject: '', academicYear: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load predefined filter options once
  useEffect(() => {
    getKuppiFilterOptions()
      .then(res => setFilterOptions(res.data))
      .catch(() => {});
  }, []);

  // Fetch classes whenever filters change
  useEffect(() => {
    setLoading(true);
    setError('');
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    getKuppiClasses(activeFilters)
      .then(res => setClasses(res.data))
      .catch(() => setError('Failed to load Kuppi classes. Make sure the service is running.'))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({ subject: '', academicYear: '', status: '' });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">🎓 Kuppi Classes</h1>
        <p className="text-slate-500 mt-1">Browse and enroll in peer-to-peer tutoring sessions.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Subject Filter */}
          <div className="flex flex-col gap-1 min-w-[200px] flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</label>
            <select
              value={filters.subject}
              onChange={e => handleFilter('subject', e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">All Subjects</option>
              {filterOptions.subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={e => handleFilter('academicYear', e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">All Years</option>
              {filterOptions.academicYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
            <div className="flex gap-2">
              {['', 'upcoming', 'completed'].map(s => (
                <button
                  key={s}
                  onClick={() => handleFilter('status', s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    filters.status === s
                      ? s === 'upcoming'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : s === 'completed'
                        ? 'bg-slate-600 text-white border-slate-600'
                        : 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <p className="text-sm text-slate-500 mb-4 font-medium">
          {classes.length === 0
            ? 'No classes found for the selected filters.'
            : `Showing ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
        </p>
      )}

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 font-medium">
          Loading classes...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-5 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Class Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map(cls => {
            const status = getStatus(cls.sessionDate);
            return (
              <div
                key={cls._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
              >
                {/* Top row: status + year badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[status]}`}>
                    {status}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    {cls.academicYear}
                  </span>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 leading-snug">{cls.title}</h3>
                  <p className="text-sm text-emerald-600 font-semibold mt-0.5">{cls.subject}</p>
                </div>

                {/* Description */}
                {cls.description && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{cls.description}</p>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(cls.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🕐</span>
                    <span>{formatTime(cls.sessionDate)}</span>
                  </div>
                  {cls.location && (
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{cls.location}</span>
                    </div>
                  )}
                  {cls.postedBy && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{cls.postedBy}</span>
                    </div>
                  )}
                </div>

                {/* Enroll Button */}
                <button
                  disabled={status === 'completed'}
                  className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    status === 'upcoming'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {status === 'upcoming' ? 'Enroll Now' : 'Session Ended'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && classes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-600 font-semibold">No Kuppi classes match your filters.</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting or clearing the filters above.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-5 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
