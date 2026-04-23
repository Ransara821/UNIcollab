import { useState, useRef, useEffect } from 'react';
import Spinner from '../../components/Spinner';
import { 
  BookOpen, FileText, Presentation, ClipboardList, Package, 
  CheckCircle2, Trash2, FolderOpen, Edit, UploadCloud, 
  File as FileIcon, Library, AlertCircle, X, Download,
  Search, Filter, AlertTriangle
} from 'lucide-react';

const RESOURCE_API = 'http://localhost:5000/api/resources';

const CATEGORIES = [
  { value: 'lecture-notes',  label: 'Lecture Notes', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'past-papers',   label: 'Past Papers', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { value: 'Lecture Announcements',  label: 'Lecture Announcements', icon: Presentation, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'assignments',    label: 'Assignments', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'other',          label: 'Other', icon: Package, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
];

export default function UploadResource() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'lecture-notes', subject: '', year: 1, semester: 1 });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Replace simple success string with a toast object for specific colors
  const [toast, setToast] = useState({ message: '', type: '' });
  const [error, setError] = useState('');
  
  // Validation States
  const [titleError, setTitleError] = useState('');
  const [subjectError, setSubjectError] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, resourceId: null });
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const fileInputRef = useRef();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(RESOURCE_API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  // Validation Check: only letters, numbers, and spaces
  const validateAlphanumeric = (val) => /^[a-zA-Z0-9 ]*$/.test(val);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!validateAlphanumeric(val)) {
      setTitleError('Only letters and numbers are allowed without symbols.');
    } else {
      setTitleError('');
    }
    setForm({ ...form, title: val });
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    if (!validateAlphanumeric(val)) {
      setSubjectError('Only letters and numbers are allowed without symbols.');
    } else {
      setSubjectError('');
    }
    setForm({ ...form, subject: val });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !file) return setError('Please select a file to upload.');
    if (!form.title.trim()) return setError('Title is required.');
    
    // Prevent submit if validation errors active
    if (!validateAlphanumeric(form.title) || !validateAlphanumeric(form.subject)) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      if (file) data.append('file', file);
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('subject', form.subject);
      data.append('year', form.year);
      data.append('semester', form.semester);

      const url = editingId ? `${RESOURCE_API}/${editingId}` : `${RESOURCE_API}/upload`;
      const method = editingId ? 'PUT' : 'POST';

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(JSON.parse(xhr.responseText)?.message || 'Operation failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(data);
      });

      showToast(editingId ? 'Resource updated successfully!' : 'Resource uploaded successfully!', 'success');
      resetForm();
      fetchMaterials();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setUploading(false);
    }
  };

  const clickDelete = (id) => {
    setDeleteModal({ isOpen: true, resourceId: id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.resourceId;
    setDeleteModal({ isOpen: false, resourceId: null });
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RESOURCE_API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Resource removed successfully.', 'delete');
        fetchMaterials();
      } else {
        throw new Error('Failed to delete resource.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (m) => {
    setEditingId(m._id);
    setForm({
      title: m.title,
      description: m.description || '',
      category: m.category || 'other',
      subject: m.subject || '',
      year: m.year || 1,
      semester: m.semester || 1
    });
    setFile(null);
    setTitleError('');
    setSubjectError('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'lecture-notes', subject: '', year: 1, semester: 1 });
    setFile(null);
    setEditingId(null);
    setProgress(0);
    setTitleError('');
    setSubjectError('');
    setError('');
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-2.5 transition-all duration-200 outline-none";
  const labelClass = "block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest";

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-12 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notifications (Right Corner) */}
      {toast.message && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
           <div className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-2xl border ${
             toast.type === 'delete' 
               ? 'bg-red-600 shadow-red-900/20 border-red-500' 
               : 'bg-emerald-600 shadow-emerald-900/20 border-emerald-500'
           }`}>
             {toast.type === 'delete' ? (
                <Trash2 className="w-5 h-5 text-white/90" />
             ) : (
                <CheckCircle2 className="w-5 h-5 text-white/90" />
             )}
             <p className="text-sm font-bold">{toast.message}</p>
             <button onClick={() => setToast({ message: '', type: '' })} className="ml-4 text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
             </button>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Resource</h3>
                <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, resourceId: null })}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                Delete It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Workspace Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-inner">
               <FolderOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resource Management</h1>
               <p className="text-xs font-medium text-slate-500 mt-0.5">Upload and organize academic documents</p>
             </div>
          </div>
          {editingId && (
            <button onClick={resetForm} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-all active:scale-95">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Fixed Upload Form */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-[104px] z-10">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
              
              <div className="px-6 py-5 border-b border-slate-100 bg-white">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  {editingId ? <><Edit className="w-4 h-4 text-emerald-500" /> Edit Resource</> : <><UploadCloud className="w-4 h-4 text-emerald-500" /> New Resource</>}
                </h2>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className={labelClass}>Document Title <span className="text-emerald-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter Document Title" 
                      value={form.title} 
                      onChange={handleTitleChange} 
                      className={`${inputClass} ${titleError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30' : ''}`} 
                      required 
                    />
                    {titleError && <p className="text-[11px] font-semibold text-red-500 mt-1.5 animate-in fade-in">{titleError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Academic Year</label>
                      <select value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} className={inputClass}>
                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Semester</label>
                      <select value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} className={inputClass}>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 xl:col-span-1">
                       <label className={labelClass}>Course Code</label>
                       <input 
                         type="text" 
                         placeholder="Enter Course Code" 
                         value={form.subject} 
                         onChange={handleSubjectChange} 
                         className={`${inputClass} ${subjectError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30' : ''}`} 
                       />
                       {subjectError && <p className="text-[11px] font-semibold text-red-500 mt-1.5 animate-in fade-in">{subjectError}</p>}
                    </div>
                    <div className="col-span-2 xl:col-span-1">
                       <label className={labelClass}>Category</label>
                       <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                       </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>File Attachment <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">(Optional for edits)</span></label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className={`group relative flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 outline-none ${
                        file 
                          ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' 
                          : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className={`p-3 rounded-xl mb-3 transition-colors ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-white shadow-sm border border-slate-200 text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-200'}`}>
                        {file ? <FileIcon className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                      </div>
                      <div className="text-center">
                        {file ? (
                          <>
                            <p className="text-xs font-bold text-emerald-900 mb-1 line-clamp-1 break-all px-2">{file.name}</p>
                            <p className="text-[10px] font-semibold text-emerald-600/80">Click to replace file</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-slate-700 mb-1"><span className="text-emerald-600">Click to upload</span> or drag and drop</p>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">PDF, PPTX, DOCX up to 50MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-2 py-2">
                       <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
                       </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={uploading || titleError !== '' || subjectError !== ''}
                      className="w-full relative group overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {editingId ? 'Save Changes' : 'Upload Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Fluid DataTable */}
          <div className="flex-1 w-full min-w-0 z-0">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
              
              {/* Table Toolbar */}
              <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search resources..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                       />
                    </div>
                    <div className="relative">
                       <select 
                          value={filterCategory} 
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                       >
                         <option value="all">All Categories</option>
                         {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                       </select>
                       <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                       {filteredMaterials.length} {filteredMaterials.length === 1 ? 'Item' : 'Items'}
                    </span>
                 </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                      <th className="px-6 py-3.5">Resource</th>
                      <th className="px-6 py-3.5 text-center">Program</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5 text-center">Stats</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {loading && materials.length === 0 ? (
                       <tr>
                         <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-medium text-slate-500">Loading library data...</p>
                         </td>
                       </tr>
                    ) : filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                              <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">No resources found</h3>
                            <p className="text-xs text-slate-500 whitespace-normal">Try adjusting your search filters or upload a new resource.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((m) => {
                        const styleCategory = CATEGORIES.find(c => c.value === m.category) || CATEGORIES[4];
                        const Icon = styleCategory.icon;
                        
                        return (
                          <tr key={m._id} className="bg-white hover:bg-slate-50/50 transition-colors group">
                            
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 flex items-center justify-center rounded-lg border ${styleCategory.border} ${styleCategory.bg} shadow-sm shrink-0`}>
                                  <Icon className={`w-4 h-4 ${styleCategory.color}`} />
                                </div>
                                <div className="min-w-0 max-w-[200px] xl:max-w-[250px]">
                                  <p className="text-sm font-bold text-slate-900 truncate" title={m.title}>{m.title}</p>
                                  <p className="text-[11px] font-semibold text-slate-500 truncate" title={m.subject}>
                                    {m.subject || 'General'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-3.5">
                               <div className="flex justify-center">
                                 <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                   Y{m.year} <span className="text-slate-300">|</span> S{m.semester}
                                 </div>
                               </div>
                            </td>

                            <td className="px-6 py-3.5">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styleCategory.bg} ${styleCategory.color} border ${styleCategory.border}`}>
                                  {styleCategory.label}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-3.5">
                               <div className="flex justify-center items-center gap-1.5 text-slate-500">
                                 <Download className="w-3.5 h-3.5" />
                                 <span className="text-xs font-bold">{m.downloadCount || 0}</span>
                               </div>
                            </td>

                            <td className="px-6 py-3.5">
                               {/* Premium Icon Actions Group */}
                               <div className="flex items-center justify-end">
                                 <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => startEdit(m)} 
                                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-r border-slate-200 transition-colors tooltip-trigger"
                                      title="Edit Resource"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => clickDelete(m._id)} 
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors tooltip-trigger"
                                      title="Delete Resource"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                               </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
