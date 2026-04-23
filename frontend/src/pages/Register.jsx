import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Hash, Phone, Mail, Lock, AlertCircle, BookMarked, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', phoneNumber: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      // Redirect to login page instead of dashboard
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name',    key: 'name',      type: 'text',     placeholder: 'Enter your full name',          icon: User },
    { label: 'Phone Number', key: 'phone',     type: 'tel',      placeholder: 'e.g. +94 77 123 4567',         icon: Phone },
    { label: 'Email Address',key: 'email',     type: 'email',    placeholder: 'name@university.edu',           icon: Mail },
    { label: 'Password',     key: 'password',  type: 'password', placeholder: 'Create a strong password',      icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/60 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none -z-0" />

      <div className="w-full max-w-[480px] relative z-10 animate-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-teal-400">
            <BookMarked size={24} color="white" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">UNI<span className="text-emerald-500">collab</span></span>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500 font-medium">Join UNIcollab and start learning today</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-bold bg-red-50 border border-red-100 text-red-600">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={form.phoneNumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setForm({ ...form, phoneNumber: val });
                }}
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits"
                maxLength="10"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
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
                placeholder="Create a password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-full shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-4 text-base"
            >
              {loading ? 'Creating account...' : 'Register Now'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}