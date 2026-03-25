import { useState } from 'react';

export default function CreateStudyGroup() {
  const [group, setGroup] = useState({ title: '', description: '', subject: '' });
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('Study Group created successfully! (Connect to study-group-service when ready)');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👥 Create Study Group</h1>
        <p className="text-gray-500 mt-1">Setup new study groups for students.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white rounded-xl shadow-sm p-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input
            type="text"
            placeholder="e.g. React Developers Group"
            value={group.title}
            onChange={e => setGroup({ ...group, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Topic</label>
          <input
            type="text"
            placeholder="e.g. Frontend Development"
            value={group.subject}
            onChange={e => setGroup({ ...group, subject: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="What will this group focus on?"
            value={group.description}
            onChange={e => setGroup({ ...group, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Create Study Group
        </button>
      </form>
    </div>
  );
}