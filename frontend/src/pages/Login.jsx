import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, BookMarked, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

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
    <div className="min-h-screen flex font-sans text-slate-800 bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Left Panel - Light Mode Theme */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-0 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-50/60 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-0 mix-blend-multiply" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
            <BookMarked size={20} color="white" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            UNI<span className="text-emerald-500">collab</span>
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
            Welcome back to your <br />
            <span className="text-emerald-500">learning hub.</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium mb-12">
            Access kuppi classes, study materials, group sessions, and more — all in one unified platform.
          </p>
          
          <div className="space-y-4">
            {['Connect with top student tutors', 'Access curated past papers', 'Join faculty study groups'].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white pr-6 pl-2 py-2 rounded-full border border-slate-100 w-fit font-bold text-sm text-slate-700 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-400 font-medium text-sm relative z-10">© {new Date().getFullYear()} UNIcollab. All rights reserved.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20">
            <BookMarked size={20} color="white" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            UNI<span className="text-emerald-500">collab</span>
          </span>
        </div>

        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
            <div className="mb-8 items-center text-center">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Sign in</h2>
              <p className="text-slate-500 font-medium">Please enter your credentials</p>
            </div>

            {successMessage && (
              <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium border border-emerald-100">
                <span className="text-lg">✅</span> {successMessage}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-bold bg-red-50 border border-red-100 text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email" required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold"
                  />
                </div>
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

              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-y-0 shadow-lg shadow-emerald-500/25"
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}>
                  {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={18} /></>}
                </button>
              </div>
            </form>

            <p className="text-center mt-8 text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}