import { useState } from 'react';
import {
  GraduationCap, BookOpen, FileText, Presentation,
  FileArchive, Image as ImageIcon, File as FileIcon,
  FolderOpen, ArrowRight, Download, Search,
  ChevronRight, Filter, BookDown, Library, BookMarked, Sparkles
} from 'lucide-react';

const RESOURCE_API = 'http://localhost:5000/api/resources';

const FILE_TYPE_ICON = (type = '') => {
  if (type.includes('pdf'))          return <FileText   className="w-5 h-5 text-rose-500" />;
  if (type.includes('word') || type.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileText className="w-5 h-5 text-emerald-500" />;
  if (type.includes('presentation') || type.includes('ppt')) return <Presentation className="w-5 h-5 text-orange-500" />;
  if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-5 h-5 text-amber-500" />;
  if (type.includes('image'))        return <ImageIcon  className="w-5 h-5 text-purple-500" />;
  return                                    <FileIcon   className="w-5 h-5 text-slate-400" />;
};

const CAT_STYLE = {
  'lecture-notes': { badge: 'bg-blue-50 text-blue-700 border-blue-200',   label: 'Lecture Notes' },
  'past-papers':   { badge: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Past Papers' },
  'slides':        { badge: 'bg-amber-50 text-amber-700 border-amber-200',  label: 'Slides' },
  'assignments':   { badge: 'bg-rose-50 text-rose-700 border-rose-200',    label: 'Assignments' },
  'other':         { badge: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Other' },
};

const YEAR_COLORS = [
  { accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', hover: 'group-hover:bg-emerald-500', ring: 'group-hover:border-emerald-200 group-hover:shadow-emerald-500/10' },
  { accent: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  hover: 'group-hover:bg-indigo-500',  ring: 'group-hover:border-indigo-200  group-hover:shadow-indigo-500/10'  },
  { accent: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-100',    hover: 'group-hover:bg-teal-500',    ring: 'group-hover:border-teal-200    group-hover:shadow-teal-500/10'    },
  { accent: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100',  hover: 'group-hover:bg-purple-500',  ring: 'group-hover:border-purple-200  group-hover:shadow-purple-500/10'  },
];

export default function ResourceSharing() {
  const [stage, setStage]                   = useState('year');
  const [selectedYear, setSelectedYear]     = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [materials, setMaterials]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [search, setSearch]                 = useState('');
  const [category, setCategory]             = useState('all');

  const fetchResources = async (year, semester, cat = category, q = search) => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      let url = `${RESOURCE_API}?year=${year}&semester=${semester}`;
      if (cat !== 'all') url += `&category=${cat}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
      setStage('materials');
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally { setLoading(false); }
  };

  const handleYearSelect     = (y) => { setSelectedYear(y); setStage('semester'); };
  const handleSemesterSelect = (s) => { setSelectedSemester(s); fetchResources(selectedYear, s, 'all', ''); setCategory('all'); setSearch(''); };
  const handleFilterChange   = (c) => { setCategory(c); fetchResources(selectedYear, selectedSemester, c, search); };
  const handleSearchSubmit   = (e) => { if (e.key === 'Enter') fetchResources(selectedYear, selectedSemester, category, search); };

  const handleDownload = async (material) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${RESOURCE_API}/${material._id}/download`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      window.open(material.fileUrl, '_blank');
      setMaterials(prev => prev.map(m => m._id === material._id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m));
    } catch { window.open(material.fileUrl, '_blank'); }
  };

  const resetToYear = () => { setStage('year'); setSelectedYear(null); setSelectedSemester(null); setMaterials([]); setCategory('all'); setSearch(''); };
  const resetToSemester = () => { setStage('semester'); setSelectedSemester(null); setMaterials([]); setCategory('all'); setSearch(''); };

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto font-sans selection:bg-emerald-100 pb-16">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles size={12} /> Study Materials
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Library size={20} className="text-white" />
              </div>
              Resource Library
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Browse lecture notes, past papers and study materials by year and semester.</p>
          </div>

          {/* Breadcrumb pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={resetToYear}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${stage === 'year' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'}`}>
              <FolderOpen size={12} /> Library
            </button>
            {selectedYear && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <button onClick={resetToSemester}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${stage === 'semester' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'}`}>
                  Year {selectedYear}
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-sm">
                  Semester {selectedSemester}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-6 font-semibold flex items-center gap-3 text-sm">
          <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 font-black text-xs">!</div>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading resources…</p>
        </div>
      )}

      {/* ── Stage 1 : Year ───────────────────────────────────────────────────── */}
      {!loading && stage === 'year' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-emerald-50 rounded-xl"><GraduationCap size={15} className="text-emerald-600" /></div>
            <div>
              <h2 className="font-black text-slate-900">Select Academic Year</h2>
              <p className="text-xs text-slate-400 font-medium">Choose your year to browse relevant materials.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((y, i) => {
              const c = YEAR_COLORS[i];
              return (
                <button key={y} onClick={() => handleYearSelect(y)}
                  className={`group bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl ${c.ring} hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between h-48 relative overflow-hidden active:scale-[0.98]`}>
                  <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.bg} opacity-60 blur-xl group-hover:scale-150 transition-transform duration-500`} />
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.border} border group-hover:scale-110 ${c.hover} group-hover:text-white transition-all duration-300 shadow-sm relative z-10`}>
                    <GraduationCap size={22} className={`${c.accent} group-hover:text-white transition-colors`} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 mb-0.5 group-hover:text-slate-800 transition-colors">Year {y}</h3>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${c.accent} transition-colors`}>
                      <span>Browse materials</span>
                      <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stage 2 : Semester ───────────────────────────────────────────────── */}
      {!loading && stage === 'semester' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-teal-50 rounded-xl"><BookOpen size={15} className="text-teal-600" /></div>
            <div>
              <h2 className="font-black text-slate-900">Select Semester — Year {selectedYear}</h2>
              <p className="text-xs text-slate-400 font-medium">Pick a semester to view its study materials.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {[1, 2].map((s) => (
              <button key={s} onClick={() => handleSemesterSelect(s)}
                className="group bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98] relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-teal-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 transition-all duration-300 shadow-sm shrink-0 relative z-10">
                  <BookMarked size={22} className="text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-slate-900 mb-0.5">Semester 0{s}</h3>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-teal-600 transition-colors flex items-center gap-1">
                    Explore study materials <ArrowRight size={11} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stage 3 : Materials ──────────────────────────────────────────────── */}
      {!loading && stage === 'materials' && (
        <div>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl"><BookMarked size={15} className="text-emerald-600" /></div>
              <div>
                <h2 className="font-black text-slate-900">Year {selectedYear} · Semester {selectedSemester}</h2>
                <p className="text-xs text-slate-400 font-medium">{materials.length} material{materials.length !== 1 ? 's' : ''} available</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search materials…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-slate-800 w-48"
                />
              </div>
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={category}
                  onChange={e => handleFilterChange(e.target.value)}
                  className="appearance-none pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-slate-800 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="lecture-notes">Lecture Notes</option>
                  <option value="past-papers">Past Papers</option>
                  <option value="slides">Presentations</option>
                  <option value="assignments">Assignments</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={() => fetchResources(selectedYear, selectedSemester, category, search)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm shadow-emerald-500/20">
                Search
              </button>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={26} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">No Materials Found</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 max-w-xs mx-auto">
                No study materials match your current filters. Try changing the category or search term.
              </p>
              <button onClick={resetToSemester}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                ← Go Back
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {materials.map((material) => {
                const cat  = CAT_STYLE[material.category] ?? CAT_STYLE['other'];
                return (
                  <div key={material._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/8 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
                    {/* Accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon + badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                          {FILE_TYPE_ICON(material.fileType)}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${cat.badge}`}>
                          {cat.label}
                        </span>
                      </div>
                      {/* Title */}
                      <h3 className="text-sm font-black text-slate-900 mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2" title={material.title}>
                        {material.title}
                      </h3>
                      {/* Subject */}
                      {material.subject && (
                        <span className="inline-flex px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 mb-3 w-fit">
                          {material.subject}
                        </span>
                      )}
                      {/* Description */}
                      {material.description?.trim() && (
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-3">
                          {material.description}
                        </p>
                      )}
                      {/* Footer */}
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BookDown size={13} className="text-emerald-500" />
                          <span className="text-xs font-black text-slate-700">{material.downloadCount || 0}</span>
                          <span className="text-[10px] font-semibold text-slate-400">downloads</span>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5">
                          <Download size={13} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}