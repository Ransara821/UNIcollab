import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked, Users, BookOpen, BrainCircuit, ChevronRight, MapPin, Mail,
  ArrowRight, CheckCircle2, Star, Award, GraduationCap, Target, Lightbulb,
  Shield, Zap, TrendingUp, Heart, BarChart3, Globe, Rocket
} from 'lucide-react';
import { getPublicFeedbacks } from '../services/api';

export default function Landing() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getPublicFeedbacks()
      .then(res => {
        // Show up to 3 feedbacks
        setFeedbacks(res.data.slice(0, 3));
      })
      .catch(err => console.error("Could not load feedbacks:", err));
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── Navbar ───────────────────────────────────── */}
      <nav className="fixed w-full top-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20">
              <BookMarked size={18} color="white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              UNI<span className="text-emerald-500">collab</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
            <a href="#academics" className="hover:text-emerald-500 transition-colors">Academics</a>
            <a href="#about" className="hover:text-emerald-500 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors px-4 py-2 rounded-xl hover:bg-emerald-50">Sign In</Link>
            <Link to="/register" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero section (Matching image aesthetic) ──────── */}
      <section id="home" className="pt-32 lg:pt-40 pb-20 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Soft decorative blobs */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-50/60 rounded-full blur-[120px] -z-10 mix-blend-multiply" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100/50 border border-emerald-200 mb-8 mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              #1 Student Academic Platform
            </div>
            <h1 className="text-5xl lg:text-[4.5rem] font-black text-slate-900 leading-[1.08] tracking-tight mb-6">
              Better <span className="text-emerald-500">Learning,</span><br />
              Brighter{' '}
              <span className="relative inline-block">
                Future
                <svg className="absolute w-full h-2.5 -bottom-1 left-0 text-emerald-300" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 6 Q 100 0 200 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              Join thousands of university students connecting for peer tutoring, sharing study materials, and tracking academic progress in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/25 hover:-translate-y-1 transition-all">
                Start Learning Now <ArrowRight size={18} />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-all">
                Explore Features <ChevronRight size={16} />
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-5 pt-8 border-t border-slate-200/70">
              <div className="flex -space-x-2.5">
                {['#10B981','#14B8A6','#6366F1','#F59E0B'].map((color, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: color }}>
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-sm font-bold text-slate-700 ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero visual — student image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full max-w-[520px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-full shadow-2xl shadow-emerald-900/20 translate-y-8 -z-10 blur-xl opacity-50" />
              <div className="relative rounded-[40px] overflow-hidden bg-white shadow-2xl shadow-emerald-900/10 border-[8px] border-white">
                <img
                  src="/modern-student.png"
                  alt="Happy modern university student holding notebook"
                  className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 ease-in-out bg-slate-100"
                />
              </div>
              <div className="absolute top-1/4 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce cursor-default z-20" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Target Met!</p>
                  <p className="text-xs text-slate-500">GPA Improved</p>
                </div>
              </div>
              <div className="absolute bottom-1/4 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-pulse cursor-default z-20" style={{ animationDuration: '4s' }}>
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <Users className="text-teal-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Study Group</p>
                  <p className="text-xs text-slate-500">5 members active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features List (Horizontal) ───────────────── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-bold text-sm text-emerald-600 uppercase tracking-widest mb-8">Trusted by academic achievers</p>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            {[
              { icon: BookOpen, text: 'Resource Hub', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: BrainCircuit, text: 'Quiz Master', color: 'text-teal-500', bg: 'bg-teal-50' },
              { icon: Users, text: 'Kuppi Classes', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Star, text: 'Leaderboards', color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors cursor-default">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon size={16} className={item.color} />
                </div>
                <span className="font-bold text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Features Grid ────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-2 block">Our Services</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900">Find The <span className="text-emerald-500">Best Features</span> Form UNIcollab</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Kuppi Classes', desc: 'Book peer-to-peer tutoring sessions with top-performing students in your faculty. Learn efficiently from those who aced it.' },
              { icon: BookOpen, title: 'Resource Sharing', desc: 'Access and share lecture notes, past papers, slides, and comprehensive study materials across all semesters.' },
              { icon: BrainCircuit, title: 'Interactive Quizzes', desc: 'Test your knowledge with curated quizzes by year and semester. Track your scores and climb the leaderboard.' },
              { icon: MapPin, title: 'Study Groups', desc: 'Form or join dedicated study groups to prepare for final exams or tackle difficult assignments collaboratively.' },
              { icon: Award, title: 'Achievement Tracking', desc: 'Monitor your academic progress through quiz scores and completed modules over the academic years.' },
              { icon: FileIcon, title: 'Real-time Updates', desc: 'Get direct access to the latest uploaded resources, lecture slides, and newly scheduled Kuppi sessions.' }
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academics ── */}
      <section id="academics" className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-teal-700 bg-teal-100 border border-teal-200 mb-4"><GraduationCap size={11} /> Academic Structure</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Your <span className="text-emerald-500">4-Year</span> Academic Journey</h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">UNIcollab supports every stage of your university education — from first year fundamentals to final year projects.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { year: '1st', label: 'Foundation Year', desc: 'Core concepts, foundational subjects, and building strong academic habits.', subjects: ['Programming Basics', 'Mathematics', 'IT Fundamentals'], grad: 'from-emerald-500 to-teal-500', border: 'border-emerald-200 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
              { year: '2nd', label: 'Development Year', desc: 'Expanding knowledge in databases, algorithms, and data structures.', subjects: ['Data Structures', 'Database Systems', 'Web Development'], grad: 'from-teal-500 to-cyan-500', border: 'border-teal-200 hover:border-teal-400', badge: 'bg-teal-100 text-teal-700' },
              { year: '3rd', label: 'Specialization Year', desc: 'Advanced modules, specializations, and industry-oriented learning tracks.', subjects: ['Software Engineering', 'AI & Machine Learning', 'Networks'], grad: 'from-cyan-500 to-blue-500', border: 'border-cyan-200 hover:border-cyan-400', badge: 'bg-cyan-100 text-cyan-700' },
              { year: '4th', label: 'Professional Year', desc: 'Research projects, internship work, thesis, and final year assessments.', subjects: ['Research Methods', 'Final Year Project', 'Industry Practice'], grad: 'from-blue-500 to-indigo-500', border: 'border-blue-200 hover:border-blue-400', badge: 'bg-blue-100 text-blue-700' },
            ].map(({ year, label, desc, subjects, grad, border, badge }) => (
              <div key={year} className={`group relative bg-white rounded-3xl border-2 ${border} p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}>
                <div className={`absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br ${grad} opacity-[0.07] rounded-full group-hover:opacity-[0.12] transition-opacity`} />
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge} mb-4`}><GraduationCap size={10} /> {label}</div>
                <div className={`text-5xl font-black bg-gradient-to-br ${grad} bg-clip-text text-transparent mb-3 leading-none`}>{year}</div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-5">{desc}</p>
                <div className="space-y-2">
                  {subjects.map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />{s}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-full">Sem 1</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-full">Sem 2</span>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-[2rem] border border-slate-200/60 p-10 lg:p-14">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2">How UNIcollab Works</h3>
              <p className="text-slate-500 font-medium text-sm">Three simple steps to academic success</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-9 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px border-t-2 border-dashed border-emerald-200" />
              {[
                { step: '01', title: 'Create Your Account', desc: 'Register with your credentials, set your academic year and semester to personalize your experience.', icon: Shield },
                { step: '02', title: 'Access Resources', desc: 'Browse kuppi classes, download study materials, join study groups and take quizzes anytime.', icon: BookOpen },
                { step: '03', title: 'Track Progress', desc: 'Monitor your quiz scores, leaderboard rank, and academic growth throughout every semester.', icon: TrendingUp },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-emerald-500 mb-2 tracking-widest uppercase">{step}</span>
                  <h4 className="font-black text-slate-900 mb-2 text-lg">{title}</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-28 px-6 bg-slate-50/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 mb-4"><Heart size={11} /> About UNIcollab</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Built by Students, <span className="text-emerald-500">For Students</span></h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              UNIcollab bridges the gap between institutional learning and the real-world need for collaboration, resource sharing, and peer support.
            </p>
          </div>

          {/* Mission + Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-9 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20">
                <Target size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                To empower every university student with the tools, connections, and resources they need to thrive academically — through a unified, collaborative digital platform that makes learning more accessible, efficient, and enjoyable for everyone.
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-9 shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
                <Lightbulb size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Our Vision</h3>
              <p className="text-emerald-50 font-medium leading-relaxed">
                To become the leading academic collaboration platform for Sri Lankan universities — fostering a culture where knowledge flows freely, students support each other, and academic excellence becomes a shared pursuit, not a solo journey.
              </p>
            </div>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Shield, title: 'Admin Panel', headerBg: 'bg-slate-800', desc: 'Admins manage the entire platform — publishing quizzes, uploading resources, scheduling kuppi classes, and overseeing student progress.', features: ['Manage all users', 'Publish quizzes & resources', 'Monitor student attempts', 'Generate feedback reports'] },
              { icon: GraduationCap, title: 'Student Portal', headerBg: 'bg-emerald-600', desc: 'Students access a rich set of academic tools — from taking quizzes and booking tutoring sessions to finding study groups and sharing notes.', features: ['Access all resources', 'Take & review quizzes', 'Book kuppi sessions', 'Join study groups'] },
              { icon: BarChart3, title: 'Analytics & Insights', headerBg: 'bg-teal-600', desc: 'Data-driven insights help both admins and students track progress, understand performance patterns, and identify areas for improvement.', features: ['Quiz performance reports', 'Leaderboard rankings', 'Attempt history', 'Progress tracking'] },
            ].map(({ icon: Icon, title, headerBg, desc, features }) => (
              <div key={title} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                <div className={`${headerBg} p-7`}>
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4"><Icon size={22} className="text-white" /></div>
                  <h3 className="text-xl font-black text-white">{title}</h3>
                </div>
                <div className="p-7">
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-5">{desc}</p>
                  <div className="space-y-2.5">
                    {features.map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, label: 'Student-First', desc: 'Every feature built with students in mind' },
              { icon: Shield, label: 'Secure & Private', desc: 'Your data is always safe with us' },
              { icon: Zap, label: 'Always Available', desc: 'Access anytime, anywhere, any device' },
              { icon: Globe, label: 'SLTC Community', desc: 'Built for Sri Lanka Technology Campus' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 text-center hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-emerald-500" />
                </div>
                <p className="font-black text-slate-900 text-sm mb-1">{label}</p>
                <p className="text-xs text-slate-400 font-medium leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedbacks Section */}
      {feedbacks.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6 text-center">
            <div className="text-emerald-500 font-bold uppercase tracking-wider mb-2">TESTIMONIALS</div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-12">What Our Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {feedbacks.map(fb => (
                <div key={fb._id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col">
                  <div className="flex gap-1 text-amber-400 mb-4 text-xl">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < fb.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic leading-relaxed flex-1">"{fb.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                      {fb.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="font-bold text-slate-900">{fb.user?.name || 'Anonymous Student'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-slate-900 pt-16 pb-8 px-6 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1 border-b md:border-b-0 border-slate-800 pb-8 md:pb-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-400">
                <BookMarked size={16} color="white" />
              </div>
              <span className="font-black text-white text-xl">UNI<span className="text-emerald-400">collab</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Your gateway to academic excellence through collaborative learning and shared resources.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Features</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Kuppi Classes</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Resource Sharing</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Study Groups</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Quiz Zone</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-emerald-400" /> Sri Lanka Technology Campus</li>
              <li className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-emerald-400" /> hello@unicollab.edu</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} UNIcollab. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">FB</a>
            <a href="#" className="hover:text-white transition-colors">TW</a>
            <a href="#" className="hover:text-white transition-colors">IG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
