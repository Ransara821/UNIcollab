import { useState, useEffect } from 'react';
import Spinner from '../../components/Spinner';
import { 
  GraduationCap, BookOpen, FileText, Presentation, 
  FileArchive, Image as ImageIcon, File as FileIcon, 
  FolderOpen, ArrowRight, Download, Search, 
  ChevronRight, Compass, Filter, BookDown, Library
} from 'lucide-react';

const RESOURCE_API = 'http://localhost:5000/api/resources';

const FILE_TYPE_ICON = (type = '', sizeClass = "w-8 h-8") => {
  if (type.includes('pdf')) return <FileText className={`${sizeClass} text-rose-500`} />;
  if (type.includes('word') || type.includes('doc')) return <FileText className={`${sizeClass} text-blue-500`} />;
  if (type.includes('sheet') || type.includes('excel')) return <FileText className={`${sizeClass} text-emerald-500`} />;
  if (type.includes('presentation') || type.includes('ppt')) return <Presentation className={`${sizeClass} text-orange-500`} />;
  if (type.includes('zip') || type.includes('rar')) return <FileArchive className={`${sizeClass} text-amber-500`} />;
  if (type.includes('image')) return <ImageIcon className={`${sizeClass} text-purple-500`} />;
  return <FileIcon className={`${sizeClass} text-slate-500`} />;
};

export default function ResourceSharing() {
  const [stage, setStage] = useState('year'); // 'year', 'semester', 'materials'
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchResources = async (year, semester, cat = category, q = search) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let url = `${RESOURCE_API}?year=${year}&semester=${semester}`;
      if (cat !== 'all') url += `&category=${cat}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
      setStage('materials');
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setStage('semester');
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    fetchResources(selectedYear, semester, 'all', '');
    setCategory('all');
    setSearch('');
  };

  const handleFilterChange = (newCat) => {
    setCategory(newCat);
    fetchResources(selectedYear, selectedSemester, newCat, search);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchResources(selectedYear, selectedSemester, category, search);
    }
  };

  const handleDownload = async (material) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${RESOURCE_API}/${material._id}/download`, { 
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(material.fileUrl, '_blank');
      setMaterials(prev => prev.map(m =>
        m._id === material._id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m
      ));
    } catch {
      window.open(material.fileUrl, '_blank');
    }
  };

  const resetToYear = () => {
    setStage('year');
    setSelectedYear(null);
    setSelectedSemester(null);
    setMaterials([]);
    setCategory('all');
    setSearch('');
  };

  const resetToSemester = () => {
    setStage('semester');
    setSelectedSemester(null);
    setMaterials([]);
    setCategory('all');
    setSearch('');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
       <Spinner className="w-10 h-10 text-emerald-500 mb-4" />
       <p className="text-sm font-bold text-slate-500 animate-pulse">Syncing library resources...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Premium Header Banner */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle background abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/40 to-emerald-50/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                   <Library className="w-6 h-6 text-white" />
                 </div>
                 <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Study Materials</h1>
              </div>
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 mt-2 text-sm font-bold bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 inline-flex">
                <button onClick={resetToYear} className={`transition-colors flex items-center gap-1.5 ${stage === 'year' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
                  <FolderOpen className="w-4 h-4" /> Library
                </button>
                {(selectedYear) && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <button 
                      onClick={resetToSemester} 
                      disabled={stage === 'semester'}
                      className={`transition-colors ${stage === 'semester' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                    >
                      Year {selectedYear}
                    </button>
                  </>
                )}
                {selectedSemester && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-emerald-600">Semester {selectedSemester}</span>
                  </>
                )}
              </div>
            </div>

            {/* Stage 3: Filters Toolbar */}
            {stage === 'materials' && (
              <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search titles or subjects..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>
                <div className="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={category}
                    onChange={e => handleFilterChange(e.target.value)}
                    className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 cursor-pointer min-w-[180px]"
                  >
                    <option value="all">All Categories</option>
                    <option value="lecture-notes">Lecture Notes</option>
                    <option value="past-papers">Past Papers</option>
                    <option value="slides">Presentations</option>
                    <option value="assignments">Assignments</option>
                    <option value="other">Other Documents</option>
                  </select>
                </div>
                <button 
                  onClick={() => fetchResources(selectedYear, selectedSemester, category, search)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-8 font-semibold flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
               <span className="text-red-600 font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        {/* Stage 1: Year Selection */}
        {stage === 'year' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
               <h2 className="text-lg font-bold text-slate-900">Select Academic Year</h2>
               <p className="text-sm text-slate-500">Choose your current year to view relevant modules and materials.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all text-left flex flex-col justify-between h-56 relative overflow-hidden ring-1 ring-slate-900/5"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-emerald-50"></div>
                  
                  <div className="relative z-10 w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      Year {y}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                      <span>Access curriculum</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stage 2: Semester Selection */}
        {stage === 'semester' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
               <h2 className="text-lg font-bold text-slate-900">Select Semester</h2>
               <p className="text-sm text-slate-500">Filter modules for Year {selectedYear} by semester.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto lg:mx-0">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSemesterSelect(s)}
                  className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-200 transition-all text-left flex items-center gap-6 ring-1 ring-slate-900/5 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                     <Compass className="w-48 h-48 text-teal-600" />
                  </div>
                  
                  <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-500 transition-all duration-300 shadow-sm shrink-0 relative z-10">
                    <BookOpen className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">Semester 0{s}</h3>
                    <p className="text-sm text-slate-500 font-semibold group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                      Explore study materials <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: Materials View */}
        {stage === 'materials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {materials.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm max-w-3xl mx-auto mt-8">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FolderOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Materials Found</h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto mb-8">
                  We couldn't find any study materials for this semester matching your filters. Try adjusting your search or category.
                </p>
                <button 
                  onClick={resetToSemester}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {materials.map((material) => {
                  const getCategoryStyle = (cat) => {
                    switch (cat) {
                      case 'lecture-notes': return 'bg-blue-50 text-blue-600 border-blue-200';
                      case 'past-papers': return 'bg-purple-50 text-purple-600 border-purple-200';
                      case 'slides': return 'bg-amber-50 text-amber-600 border-amber-200';
                      case 'assignments': return 'bg-rose-50 text-rose-600 border-rose-200';
                      default: return 'bg-slate-50 text-slate-600 border-slate-200'; // other
                    }
                  };
                  
                  return (
                  <div key={material._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all group flex flex-col h-full overflow-hidden">
                    
                    {/* Top decoration strip */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
                          {FILE_TYPE_ICON(material.fileType, "w-6 h-6")}
                        </div>
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getCategoryStyle(material.category)}`}>
                          {material.category?.replace('-', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2" title={material.title}>
                        {material.title}
                      </h3>
                      
                      {material.subject && (
                        <p className="text-xs font-bold text-indigo-500 mb-3 bg-indigo-50 inline-flex px-2 py-0.5 rounded border border-indigo-100 w-fit">
                           {material.subject}
                        </p>
                      )}
                      
                      {material.description && material.description.trim() !== '' && (
                        <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed line-clamp-3">
                          {material.description}
                        </p>
                      )}

                      <div className="mt-auto pt-5 border-t border-slate-100 flex items-end justify-between">
                        <div className="flex flex-col gap-0.5 text-slate-400 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downloads</span>
                          <div className="flex items-center gap-1.5">
                             <BookDown className="w-4 h-4 text-emerald-500" />
                             <span className="text-sm font-black text-slate-700">{material.downloadCount || 0}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:-translate-y-0.5"
                        >
                          <Download className="w-4 h-4" /> Download
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
    </div>
  );
}