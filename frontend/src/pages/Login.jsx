import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, BookMarked, ArrowRight } from 'lucide-react';

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
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', opacity: 0.12 }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full -z-0"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
            <BookMarked size={18} color="white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            UNI<span style={{ color: '#06B6D4' }}>collab</span>
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your academic<br />
            <span style={{ color: '#06B6D4' }}>journey continues.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Access kuppi classes, study materials, group sessions, and more — all in one platform.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[['200+', 'Active Students'], ['50+', 'Modules'], ['100+', 'Kuppi Classes'], ['4', 'Academic Years']].map(([val, lbl]) => (
              <div key={lbl} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-sm text-slate-400 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm relative z-10">© 2026 UNIcollab. All rights reserved.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
            <BookMarked size={16} color="white" />
          </div>
          <span className="text-xl font-bold text-white">UNI<span style={{ color: '#06B6D4' }}>collab</span></span>
        </div>

        <div className="w-full max-w-md animate-slide-up">
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-400">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="name@university.edu" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all mt-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
                {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: '#64748B' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:text-indigo-400 transition-colors" style={{ color: '#818CF8' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}