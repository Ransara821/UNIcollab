import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[80px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span className="text-emerald-500 text-3xl">🎓</span>
        <div className="font-bold text-xl text-slate-900 tracking-tight">
          UNI<span className="text-emerald-500">collab</span>
        </div>
      </div>

      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 border border-slate-100/50 relative z-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back!</h2>
              <p className="text-slate-500 font-medium">Log in to continue your learning journey</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium border border-red-100">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between text-sm px-1 pt-2">
                <label className="flex items-center gap-2 text-slate-500 font-medium cursor-pointer hover:text-slate-700 transition">
                  <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer" /> 
                  Remember me
                </label>
                <a href="#" className="text-emerald-600 font-bold hover:text-emerald-700 transition">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-full shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-4 text-base"
              >
                {loading ? 'Logging in...' : 'Login to Account'}
              </button>
            </form>

            <p className="text-center text-slate-500 font-medium mt-10">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 transition">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}