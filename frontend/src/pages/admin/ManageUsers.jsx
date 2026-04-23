import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus, deleteUser } from '../../services/api';
import { Pencil, Trash2, AlertTriangle, X, UserCheck, Users, ShieldCheck, GraduationCap, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [editUser, setEditUser] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── KPI derived values ────────────────────────────── */
  const totalUsers = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const students = users.filter(u => u.role !== 'admin').length;
  const activeUsers = users.filter(u => u.status !== 'inactive').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;

  const kpiCards = [
    { label: 'Total Users', value: totalUsers, icon: Users, from: '#3B82F6', to: '#6366F1', light: '#EFF6FF', text: '#1D4ED8' },
    { label: 'Administrators', value: admins, icon: ShieldCheck, from: '#8B5CF6', to: '#A855F7', light: '#F5F3FF', text: '#6D28D9' },
    { label: 'Students', value: students, icon: GraduationCap, from: '#10B981', to: '#14B8A6', light: '#ECFDF5', text: '#065F46' },
    { label: 'Active Users', value: activeUsers, icon: CheckCircle2, from: '#22C55E', to: '#16A34A', light: '#F0FDF4', text: '#15803D' },
    { label: 'Inactive Users', value: inactiveUsers, icon: XCircle, from: '#F97316', to: '#EF4444', light: '#FFF7ED', text: '#C2410C' },
  ];

  /* ── Edit handlers ────────────────────────────────── */
  const openEdit = (user) => {
    setEditUser(user);
    setEditStatus(user.status !== 'inactive' ? 'active' : 'inactive');
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const { data } = await updateUserStatus(editUser._id, editStatus);
      setUsers(users.map(u => u._id === editUser._id ? data : u));
      setEditUser(null);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete handlers ──────────────────────────────── */
  const openDelete = (user) => setDeleteTarget(user);

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget._id);
      setUsers(users.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8">

      {/* ── Page heading ─────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👥 Manage Users</h1>
        <p className="text-gray-500 mt-1">View and manage all registered accounts.</p>
      </div>

      {/* ── KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, from, to, light, text }) => (
          <div
            key={label}
            className="relative rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden"
            style={{ background: light }}
          >
            {/* Gradient accent strip at top */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              <Icon size={18} color="white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: text }}>{label}</p>
            <p className="text-3xl font-black" style={{ color: text }}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">

        {/* Gradient header banner — emerald green */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #065F46 0%, #10B981 60%, #14B8A6 100%)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Users size={20} color="white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">User Management</p>
            <p className="text-emerald-100 text-sm font-medium">Create, edit, and remove platform users</p>
          </div>
          {/* Search bar */}
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="pl-9 pr-4 py-2 rounded-xl bg-white/20 text-white placeholder-emerald-200 text-sm font-medium border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-56 backdrop-blur-sm"
              />
            </div>
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm whitespace-nowrap">
              {loading ? '…' : totalUsers} users
            </span>
          </div>
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
              ) : users.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
              ).length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 text-slate-500">
                  {search ? `No users found matching "${search}"` : 'No users found in database.'}
                </td></tr>
              ) : (
                users
                  .filter(u =>
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((user) => {
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                              {isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(user)}
                              title="Edit user status"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => openDelete(user)}
                              title="Delete user"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} />
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

      {/* ── Edit Modal ─────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-8 relative">
            <button
              onClick={() => setEditUser(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <UserCheck className="text-blue-600" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit User</h3>
                <p className="text-sm text-slate-500 font-medium">Update account status</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-6 border border-slate-100">
              <p className="text-sm font-bold text-slate-900">{editUser.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{editUser.email}</p>
            </div>

            <label className="block text-sm font-bold text-slate-700 mb-3">Account Status</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={() => setEditStatus('active')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${editStatus === 'active'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}
              >
                ✓ Active
              </button>
              <button
                onClick={() => setEditStatus('inactive')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${editStatus === 'inactive'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                  }`}
              >
                ✕ Inactive
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-60"
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 opacity-60 pointer-events-none" />
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete User?</h3>
              <p className="text-sm font-semibold text-slate-500 mb-2 max-w-[260px] leading-relaxed">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-extrabold text-slate-800 mb-1">"{deleteTarget.name}"</p>
              <p className="text-xs text-slate-400 font-medium mb-8">This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {deleteLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}