import { Link } from 'react-router-dom';
import { BookMarked, Users, BookOpen, BrainCircuit, ChevronRight, MapPin, Mail, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0F172A', color: '#E2E8F0' }}>

      {/* ── Navbar ───────────────────────────────────── */}
      <nav className="fixed w-full top-0 z-50 px-6 py-4" style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              <BookMarked size={16} color="white" />
            </div>
            <span className="text-xl font-bold text-white">UNI<span style={{ color: '#06B6D4' }}>collab</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#94A3B8' }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#academics" className="hover:text-white transition-colors">Academics</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold transition-colors hover:text-white" style={{ color: '#94A3B8' }}>Sign In</Link>
            <Link to="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section id="home" className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* BG glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none -z-0"
          style={{ background: 'radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', color: '#818CF8' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#818CF8' }} />
            Student Collaboration Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Better <span style={{ background: 'linear-gradient(90deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>learning</span> starts here.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with peer tutoring, access academic resources, join study groups, and track your knowledge — all in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-base transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              Join for free <ChevronRight size={18} />
            </Link>
            <a href="#features"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8' }}>
              Learn more
            </a>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16 pt-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[['200+', 'Students'], ['50+', 'Modules'], ['100+', 'Kuppi Classes']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-slate-500 mt-1">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#4F46E5' }}>Platform Features</p>
            <h2 className="text-4xl font-bold text-white">Everything you need to excel</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">A complete academic ecosystem built for university students to learn smarter and collaborate better.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Kuppi Classes', desc: 'Book peer-to-peer tutoring sessions with top-performing students in your faculty.', gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
              { icon: BookOpen, title: 'Resource Sharing', desc: 'Access and share lecture notes, past papers, slides, and study materials.', gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' },
              { icon: BrainCircuit, title: 'Quiz Zone', desc: 'Test your knowledge with curated quizzes by year and semester. Track your scores.', gradient: 'linear-gradient(135deg, #7C3AED, #4F46E5)' },
            ].map(({ icon: Icon, title, desc, gradient }) => (
              <div key={title} className="p-6 rounded-2xl transition-all hover:-translate-y-1 group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: gradient }}>
                  <Icon size={22} color="white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academics ────────────────────────────────── */}
      <section id="academics" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#06B6D4' }}>Academic Structure</p>
            <h2 className="text-4xl font-bold text-white">Organized by year and semester</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year, i) => (
              <div key={year} className="p-6 rounded-2xl text-center hover:-translate-y-1 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl font-extrabold mb-2" style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {i + 1}
                </div>
                <p className="font-semibold text-white text-sm">{year}</p>
                <p className="text-xs text-slate-500 mt-1">2 Semesters</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#4F46E5' }}>About UNIcollab</p>
            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              An academic platform built for students, by students.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              UNIcollab bridges the gap between institutional learning and collaborative study. Our platform empowers students to share knowledge, find study partners, and prepare more effectively.
            </p>
            <ul className="space-y-3">
              {['Peer-to-peer knowledge sharing', 'Structured academic resources by year & semester', 'Interactive quizzes with real-time feedback', 'Community study groups'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.4)' }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['50+', 'Distinct Modules'], ['200+', 'Active Students'], ['100+', 'Kuppi Sessions'], ['4', 'Academic Years']].map(([val, lbl]) => (
              <div key={lbl} className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-3xl font-extrabold text-white mb-1">{val}</p>
                <p className="text-sm text-slate-400">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-16 px-6 mx-6 mb-24 rounded-3xl max-w-5xl mx-auto text-center" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(79,70,229,0.2)' }}>
        <h2 className="text-3xl font-bold text-white mb-4">Ready to start learning smarter?</h2>
        <p className="text-slate-400 mb-8">Join hundreds of students building better academic habits today.</p>
        <Link to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all hover:-translate-y-1"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
          Create free account <ArrowRight size={18} />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t px-6 py-12" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
                <BookMarked size={14} color="white" />
              </div>
              <span className="font-bold text-white">UNI<span style={{ color: '#06B6D4' }}>collab</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Your gateway to academic excellence through collaborative learning.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {['Kuppi Classes', 'Resource Sharing', 'Study Groups', 'Quiz Zone'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {['Home', 'Features', 'About', 'Contact'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> Sri Lanka Technology Campus, Padukka</li>
              <li className="flex items-center gap-2"><Mail size={14} className="shrink-0" /> support@unicollab.edu</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p>© {new Date().getFullYear()} UNIcollab. All rights reserved.</p>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
