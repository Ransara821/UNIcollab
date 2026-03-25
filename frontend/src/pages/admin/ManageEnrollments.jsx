export default function ManageEnrollments() {
  const enrollments = [
    { id: '1', student: 'John Student', kuppiClass: 'Frontend Developer Kuppi', module: 'React.js', status: 'pending', date: '2026-03-01' },
    { id: '2', student: 'Jane Student', kuppiClass: 'Backend Developer Kuppi', module: 'Node.js', status: 'accepted', date: '2026-03-02' },
    { id: '3', student: 'Bob Student', kuppiClass: 'UI/UX Design Kuppi', module: 'Figma', status: 'rejected', date: '2026-03-03' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📋 Manage Enrollments</h1>
        <p className="text-gray-500 mt-1">Review and manage student enrollments for Kuppi classes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">All Enrollments ({enrollments.length})</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kuppi Class</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Module</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{app.student}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{app.kuppiClass}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{app.module}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium">
                      Accept
                    </button>
                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}