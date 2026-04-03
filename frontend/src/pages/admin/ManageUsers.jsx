import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus, deleteUser } from '../../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      // Filter out admins if you only want to manage students, otherwise keep all
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const isCurrentlyActive = user.status !== 'inactive';
      const newStatus = isCurrentlyActive ? 'inactive' : 'active';
      const { data } = await updateUserStatus(user._id, newStatus);
      setUsers(users.map(u => u._id === user._id ? data : u));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to completely delete ${user.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user._id);
      setUsers(users.filter(u => u._id !== user._id));
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👥 Manage Users</h1>
        <p className="text-gray-500 mt-1">View and manage all registered accounts.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role & Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center p-8 text-slate-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 text-slate-500">No users found in database.</td></tr>
              ) : (
                users.map((user) => {
                  const isActive = user.status !== 'inactive';

                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                            {user.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${isActive
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                          >
                            Delete
                          </button>
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
  );
}