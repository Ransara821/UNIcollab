import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createStudyGroup } from '../../services/api';

export default function CreateStudyGroup() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', subject: '', description: '',
    requiredSkills: [], workingStyle: 'mixed',
    maxSize: 5, deadline: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s))
      setForm(p => ({ ...p, requiredSkills: [...p.requiredSkills, s] }));
    setSkillInput('');
  };
  const removeSkill = (s) => setForm(p => ({ ...p, requiredSkills: p.requiredSkills.filter(x => x !== s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await createStudyGroup({ ...form, leaderName: user?.name });
      setSuccess('Study group created successfully!');
      setForm({ name: '', subject: '', description: '', requiredSkills: [], workingStyle: 'mixed', maxSize: 5, deadline: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Create Study Group</h1>
        <p className="text-slate-500 text-sm mt-1">Set up a new study group for students to discover and join.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">✅ {success}</div>}
        {error   && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">⚠️ {error}</div>}

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Group Name *</label>
          <input type="text" placeholder="e.g. React Developers Group" value={form.name} required
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Subject / Topic *</label>
          <input type="text" placeholder="e.g. Frontend Development" value={form.subject} required
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
          <textarea placeholder="What will this group focus on?" value={form.description} rows={3}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 resize-none" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Required Skills</label>
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="Add a skill..." value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
            <button type="button" onClick={addSkill}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600">+</button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-8">
            {form.requiredSkills.length === 0
              ? <span className="text-xs text-slate-300 italic">No skills added</span>
              : form.requiredSkills.map(sk => (
                <span key={sk} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-semibold">
                  {sk}
                  <button type="button" onClick={() => removeSkill(sk)} className="text-emerald-300 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Working Style</label>
            <div className="flex gap-2">
              {['collaborative','independent','mixed'].map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, workingStyle: s }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${form.workingStyle === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Max Members</label>
            <input type="number" min={2} max={20} value={form.maxSize}
              onChange={e => setForm(p => ({ ...p, maxSize: parseInt(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Assignment Deadline</label>
          <input type="date" value={form.deadline}
            onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all">
          {loading ? 'Creating...' : '✅ Create Study Group'}
        </button>
      </form>
    </div>
  );
}
