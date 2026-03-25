import { useState, useEffect } from 'react';
import Spinner from '../../components/Spinner';

const RESOURCE_API = 'http://localhost:5000/api/resources';

const FILE_TYPE_ICON = (type = '') => {
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('doc')) return '📘';
  if (type.includes('sheet') || type.includes('excel')) return '📗';
  if (type.includes('presentation') || type.includes('ppt')) return '📙';
  if (type.includes('zip')) return '🗜️';
  if (type.includes('image')) return '🖼️';
  return '📄';
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

  if (loading) return <Spinner message="Fetching study materials..." />;

  const inputClass = "px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700 shadow-sm placeholder:text-slate-300";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">📚 Study Materials</h1>
          <div className="flex items-center gap-2 mt-3 text-sm font-bold">
            <button onClick={resetToYear} className={`transition-colors ${stage === 'year' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
              All Years
            </button>
            {(selectedYear) && (
              <>
                <span className="text-slate-300">/</span>
                <button 
                  onClick={resetToSemester} 
                  disabled={stage === 'semester'}
                  className={`transition-colors ${stage === 'semester' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                >
                  {selectedYear}{selectedYear === 1 ? 'st' : selectedYear === 2 ? 'nd' : selectedYear === 3 ? 'rd' : 'th'} Year
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-emerald-600">Semester {selectedSemester}</span>
              </>
            )}
          </div>
        </div>

        {/* Filters Stage 3 */}
        {stage === 'materials' && (
          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              placeholder="Search title or subject..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className={`${inputClass} w-64`}
            />
            <select 
              value={category}
              onChange={e => handleFilterChange(e.target.value)}
              className={`${inputClass} cursor-pointer min-w-[200px]`}
            >
              <option value="all">All Categories</option>
              <option value="lecture-notes">Lecture Notes</option>
              <option value="past-papers">Past Papers</option>
              <option value="slides">Slides / Presentations</option>
              <option value="assignments">Assignments</option>
              <option value="other">Other</option>
            </select>
            <button 
              onClick={() => fetchResources(selectedYear, selectedSemester, category, search)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all shadow-lg"
            >
              Search
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 font-bold flex items-center gap-3 animate-shake">
          ⚠️ {error}
        </div>
      )}

      {/* Stage 1: Year Selection */}
      {stage === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((y) => (
            <button
              key={y}
              onClick={() => handleYearSelect(y)}
              className="group relative bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 group-hover:opacity-20 transition-opacity font-black">
                {y}
              </div>
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
                🎓
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year
              </h3>
              <p className="text-slate-500 text-sm font-bold">Access academic resources</p>
            </button>
          ))}
        </div>
      )}

      {/* Stage 2: Semester Selection */}
      {stage === 'semester' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => handleSemesterSelect(s)}
              className="group bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all text-left flex items-center gap-8"
            >
              <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl group-hover:bg-orange-400 group-hover:text-white transition-all duration-500 shadow-inner shrink-0">
                📖
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Semester 0{s}</h3>
                <p className="text-slate-500 font-bold group-hover:text-orange-500 transition-colors">Click to view materials →</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stage 3: Materials View */}
      {stage === 'materials' && (
        <>
          {materials.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-sm">
              <div className="text-8xl mb-6 grayscale opacity-30">📂</div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">No Materials Found</h3>
              <p className="text-slate-500 text-lg font-bold max-w-md mx-auto leading-relaxed">
                No study materials available for this semester.
              </p>
              <button 
                onClick={resetToSemester}
                className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm hover:bg-emerald-500 transition-all shadow-lg"
              >
                ← Back to Semester Selection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {materials.map((material) => (
                <div key={material._id} className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] group-hover:bg-emerald-500 transition-colors duration-500 -mr-4 -mt-4 opacity-50 group-hover:opacity-100"></div>
                  
                  <div className="flex items-start justify-between mb-6 relative">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500">
                      {FILE_TYPE_ICON(material.fileType)}
                    </div>
                    <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-100 text-slate-500 shadow-sm relative z-10">
                      {material.category?.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{material.title}</h3>
                  {material.subject && (
                    <p className="text-xs font-black text-orange-500 mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {material.subject}
                    </p>
                  )}
                  <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed line-clamp-3">
                    {material.description || 'No description provided for this resource.'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider">DOWNLOADS</span>
                      <span className="text-lg font-black text-slate-900">{material.downloadCount || 0}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(material)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-1 transform active:scale-95"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}