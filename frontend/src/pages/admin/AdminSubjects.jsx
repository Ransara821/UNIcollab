import { useState, useEffect } from 'react';
import { getSubjects, createSubject, deleteSubject, updateSubject } from '../../services/quizService';
import { PlusCircle, Trash2, Pencil, Book, X, Tag, AlignLeft, GraduationCap, Building } from 'lucide-react';

const BLANK = { name: '', code: '', year: '1st Year', semester: 'Semester 1', description: '' };
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

function SubjectFormModal({ editData, onClose, onRefresh }) {
  const isCreate = editData === 'create';
  const [form, setForm] = useState(isCreate ? { ...BLANK } : { ...editData });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); 
    setSaving(true); setErr('');
    try {
      if (isCreate) await createSubject(form);
      else await updateSubject(form._id, form);
      onRefresh();
      onClose();
    } catch (er) { 
      setErr(er.response?.data?.message || 'Error occurred while saving the subject.'); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-6 rounded-t-[2rem] text-white flex items-center justify-between shadow-md">
           <div>
              <h2 className="text-2xl font-black">{isCreate ? 'Initialize Subject' : 'Modify Syllabus'}</h2>
              <p className="text-sm font-medium text-indigo-100 mt-1 opacity-90">{isCreate ? 'Add a new academic module' : 'Update course registry'}</p>
           </div>
           <button onClick={onClose} className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
               <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Book size={14} className="text-indigo-400"/> Subject Title</label>
               <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-slate-800" placeholder="e.g. Data Structures and Algorithms" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            </div>

            <div>
               <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Tag size={14} className="text-indigo-400"/> Course Code</label>
               <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-slate-800" placeholder="e.g. CS204" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><GraduationCap size={14} className="text-indigo-400"/> Academic Year</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-slate-800" value={form.year} onChange={e=>setForm({...form, year: e.target.value})}>
                     {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Building size={14} className="text-indigo-400"/> Term / Semester</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold text-slate-800" value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})}>
                     {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            <div>
               <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><AlignLeft size={14} className="text-indigo-400"/> Short Description</label>
               <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium text-slate-600 resize-none h-24" placeholder="Brief outline of the course parameters..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
            </div>
          </div>

          {err && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold">{err}</div>}

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors">Cancel</button>
            <button disabled={saving} className="flex-1 py-4 rounded-xl text-white font-black shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      setSubjects(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this subject permanently from the registry?")) return;
    try { await deleteSubject(id); load(); } catch (err) { alert('Deletion blocked. Subject might be linked to active quizzes.'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in relative z-0">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
         <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Subjects</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Manage global curriculum categories for quizzes and modules.</p>
         </div>
         <button onClick={()=>setModal('create')} className="flex items-center gap-2 px-6 py-4 rounded-xl font-black text-white shadow-xl shadow-indigo-600/20 hover:-translate-y-1 transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
           <PlusCircle size={20}/> Initialize Subject
         </button>
       </div>

       {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
             <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
             <p className="font-bold">Syncing syllabus registry...</p>
          </div>
       ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {subjects.length === 0 && <div className="md:col-span-2 text-center py-16 text-slate-500 bg-white border border-dashed border-slate-300 rounded-[2rem] font-bold">No subjects mapped in registry.</div>}
          
          {subjects.map(sub => (
            <div key={sub._id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col justify-between group h-full">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                         <Book size={20}/>
                      </div>
                      <div>
                         <h3 className="font-black text-xl text-slate-800 leading-tight">{sub.code}</h3>
                         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">{sub.year} • {sub.semester}</span>
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                     <button onClick={()=>setModal(sub)} className="w-10 h-10 border-2 border-slate-100 rounded-xl text-slate-500 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"><Pencil size={16}/></button>
                     <button onClick={()=>handleDelete(sub._id)} className="w-10 h-10 border-2 border-slate-100 rounded-xl text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"><Trash2 size={16}/></button>
                   </div>
                </div>
                <h4 className="font-black text-slate-800 mb-2">{sub.name}</h4>
                <p className="text-slate-500 text-sm font-medium line-clamp-2">{sub.description || 'No description provided.'}</p>
              </div>
            </div>
          ))}
        </div>
       )}

       {modal && <SubjectFormModal editData={modal} onClose={()=>setModal(null)} onRefresh={load} />}
    </div>
  );
}
