import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Hash, Phone, Mail, Lock, AlertCircle, BookMarked, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', studentId: '', phone: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name',    key: 'name',      type: 'text',     placeholder: 'Enter your full name',          icon: User },
    { label: 'Student ID',   key: 'studentId', type: 'text',     placeholder: 'e.g. IT23100000',               icon: Hash },
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
            {fields.map(({ label, key, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 px-1">{label}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold"
                  />
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-y-0 shadow-lg shadow-emerald-500/25"
                style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}>
                {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
              </button>
            </div>
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