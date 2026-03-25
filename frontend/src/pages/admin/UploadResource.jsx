import { useState, useRef, useEffect } from 'react';
import Spinner from '../../components/Spinner';

const RESOURCE_API = 'http://localhost:5000/api/resources';

const CATEGORIES = [
  { value: 'lecture-notes',  label: '📝 Lecture Notes' },
  { value: 'past-papers',   label: '📄 Past Papers' },
  { value: 'slides',         label: '📊 Slides / Presentations' },
  { value: 'assignments',    label: '📋 Assignments' },
  { value: 'other',          label: '📦 Other' },
];

export default function UploadResource() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'lecture-notes', subject: '', year: 1, semester: 1 });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(RESOURCE_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !file) return setError('Please select a file to upload.');
    if (!form.title.trim()) return setError('Title is required.');

    setUploading(true);
    setError('');
    setSuccess('');
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

      // Use XMLHttpRequest for progress tracking
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

      setSuccess(editingId ? '✅ Material updated successfully!' : '✅ Material uploaded successfully!');
      resetForm();
      fetchMaterials();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RESOURCE_API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('🗑️ Material deleted successfully');
        fetchMaterials();
      } else {
        throw new Error('Failed to delete');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'lecture-notes', subject: '', year: 1, semester: 1 });
    setFile(null);
    setEditingId(null);
    setProgress(0);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">💼 Manage Study Materials</h1>
          <p className="text-slate-500 mt-2 font-medium">Create, update, and manage academic resources across all years.</p>
        </div>
        {editingId && (
          <button onClick={resetForm} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-200 transition-all">
            Cancel Editing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              {editingId ? '✏️ Edit Material' : '📤 Upload New Material'}
            </h2>

            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-xs font-bold">{success}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-xs font-bold">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Title *</label>
                <input type="text" placeholder="e.g. Week 5 - Normalization" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Year</label>
                  <select value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} className={inputClass}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>{y}{y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Semester</label>
                  <select value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} className={inputClass}>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                <input type="text" placeholder="e.g. DBMS (IT2030)" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">File {editingId && '(Optional)'}</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400'}`}
                >
                  <span className="text-sm font-bold text-slate-600">{file ? `📄 ${file.name}` : 'Click to select file'}</span>
                </div>
              </div>

              {uploading && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50"
              >
                {uploading ? `Uploading... ${progress}%` : editingId ? 'Update Material' : 'Upload Material'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">📑 Existing Materials</h2>
              <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Total: {materials.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Title & Year</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Downloads</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {materials.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <p className="font-black text-slate-900 line-clamp-1">{m.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold text-orange-500">{m.year}{m.year===1?'st':m.year===2?'nd':m.year===3?'rd':'th'} Year</span>
                          <span className="text-[10px] font-bold text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-emerald-500">Sem {m.semester}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                          {m.category?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="font-black text-slate-900">{m.downloadCount || 0}</span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => startEdit(m)} className="p-2 hover:bg-emerald-50 text-emerald-500 rounded-lg transition-all" title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(m._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold">No materials uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
