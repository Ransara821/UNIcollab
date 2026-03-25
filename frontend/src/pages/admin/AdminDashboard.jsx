import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Students', value: '24', icon: '👥', color: 'bg-emerald-500' },
    { label: 'Active Kuppi Classes', value: '12', icon: '🎓', color: 'bg-emerald-400' },
    { label: 'Enrollments', value: '36', icon: '📋', color: 'bg-amber-400' },
    { label: 'Study Materials', value: '8', icon: '📚', color: 'bg-orange-500' },
  ];

  const quickActions = [
    { label: 'Post New Kuppi Class', icon: '➕', path: '/admin/post-kuppi-class', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/50 shadow-sm hover:shadow-md' },
    { label: 'View Enrollments', icon: '📄', path: '/admin/enrollments', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100/50 shadow-sm hover:shadow-md' },
    { label: 'Upload Material', icon: '📤', path: '/admin/upload-material', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-100/50 shadow-sm hover:shadow-md' },
    { label: 'Create Quiz', icon: '✏️', path: '/admin/create-quiz', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/50 shadow-sm hover:shadow-md' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your UNIcollab admin overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer ${action.color}`}
            >
              <span className="text-3xl mb-2">{action.icon}</span>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { text: 'New student registered', time: '2 mins ago', icon: '👤' },
            { text: 'New enrollment submitted', time: '15 mins ago', icon: '📋' },
            { text: 'Kuppi class posted successfully', time: '1 hour ago', icon: '🎓' },
            { text: 'Study material uploaded', time: '2 hours ago', icon: '📚' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{activity.text}</p>
              </div>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}