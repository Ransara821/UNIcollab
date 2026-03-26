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

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  };
  const focusStyle = { borderColor: '#4F46E5', boxShadow: '0 0 0 3px rgba(79,70,229,0.15)' };
  const blurStyle = { borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'none' };

  const fields = [
    { label: 'Full Name',    key: 'name',      type: 'text',     placeholder: 'Enter your full name',          icon: User },
    { label: 'Student ID',   key: 'studentId', type: 'text',     placeholder: 'e.g. IT23100000',               icon: Hash },
    { label: 'Phone Number', key: 'phone',     type: 'tel',      placeholder: 'e.g. +94 77 123 4567',         icon: Phone },
    { label: 'Email Address',key: 'email',     type: 'email',    placeholder: 'name@university.edu',           icon: Mail },
    { label: 'Password',     key: 'password',  type: 'password', placeholder: 'Create a strong password',      icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: '#0F172A' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] -z-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
            <BookMarked size={18} color="white" />
          </div>
          <span className="text-2xl font-bold text-white">UNI<span style={{ color: '#06B6D4' }}>collab</span></span>
        </div>

        <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400">Join UNIcollab and start learning today</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ label, key, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, blurStyle)}
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:text-indigo-400 transition-colors" style={{ color: '#818CF8' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}