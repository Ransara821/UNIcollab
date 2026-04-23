import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Users, BookOpen, BrainCircuit, ChevronRight, MapPin, Mail, ArrowRight, CheckCircle2, Star, PlayCircle, Award, File as FileIcon } from 'lucide-react';

import { getPublicFeedbacks } from '../services/api';

export default function Landing() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    getPublicFeedbacks().then(res => setFeedbacks(res.data.slice(0, 3))).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── Navbar ── */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/40 border-b border-slate-100' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20">
              <BookMarked size={18} color="white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">UNI<span className="text-emerald-500">collab</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
            <a href="#academics" className="hover:text-emerald-500 transition-colors">Academics</a>
            <a href="#about" className="hover:text-emerald-500 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="pt-24 lg:pt-28 pb-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-emerald-100/25 to-teal-100/15 rounded-full blur-[130px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              #1 Student Academic Collaboration Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Better <span className="text-emerald-500 relative">
                Learning
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> <br className="hidden lg:block"/> Future Starts <br/> With UNIcollab
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              Join university students connecting for peer tutoring, sharing study materials, and mastering every semester — all in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}>
                Start Learning Now <ArrowRight size={18} />
              </Link>
              <a href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                <PlayCircle size={18} className="text-emerald-500" /> Watch Demo
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-200/60 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 z-${10-i} flex items-center justify-center text-[10px] font-bold text-slate-600`}>U{i}</div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-extrabold text-slate-900">200+ Students</p>
                  <p className="text-slate-500 font-medium">Already joined</p>
                </div>
                <p className="text-sm text-slate-500 font-medium">Trusted by <span className="font-bold text-slate-800">200+</span> students</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="relative w-full max-w-[550px] mx-auto">
              {/* Decorative background shape */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-full shadow-2xl shadow-emerald-900/20 translate-y-8 -z-10 blur-xl opacity-60"></div>
              
              <div className="relative rounded-[40px] overflow-hidden bg-white shadow-2xl shadow-emerald-900/10 border-[8px] border-white z-0">
                <img src="/modern-student.png" alt="Happy modern university student holding notebook" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 ease-in-out bg-slate-50" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-1/4 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none transition-all cursor-default z-20" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-600" size={20}/></div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Quiz Passed!</p>
                  <p className="text-xs text-slate-500">Score: 92/100</p>
                </div>
              </div>

              <div className="absolute bottom-1/4 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-pulse hover:animate-none z-20" style={{ animationDuration: '4s' }}>
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center"><Users className="text-teal-600" size={20}/></div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Study Group</p>
                  <p className="text-xs text-slate-500">5 members online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { value: '200+', label: 'Active Students', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { value: '150+', label: 'Resources Shared', icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-50' },
              { value: '4', label: 'Academic Years', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50' },
              { value: '50+', label: 'Quizzes Available', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(({ value, label, icon: Icon, color, bg }) => (
              <div key={label} className="flex flex-col items-center text-center group">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={color} />
                </div>
                <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
                <div className="text-sm font-semibold text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6 bg-slate-50/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 mb-4"><Zap size={11} /> Our Services</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Everything You Need to <span className="text-emerald-500">Excel</span></h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">Six powerful tools built for university students — all in one unified platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Kuppi Classes', desc: 'Book peer-to-peer tutoring with top-performing students. Learn from those who already aced the course.', light: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' },
              { icon: BookOpen, title: 'Resource Sharing', desc: 'Access and share lecture notes, past papers, slides, and comprehensive study materials across all semesters.', light: 'bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white' },
              { icon: BrainCircuit, title: 'Interactive Quizzes', desc: 'Test knowledge with curated quizzes per year and semester. Track your scores and climb the leaderboard.', light: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white' },
              { icon: MapPin, title: 'Study Groups', desc: 'Form or join dedicated study groups to prepare for exams or tackle difficult assignments collaboratively.', light: 'bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white' },
              { icon: Award, title: 'Achievement Tracking', desc: 'Monitor academic progress through quiz scores and completed modules over the academic years.', light: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' },
              { icon: TrendingUp, title: 'Leaderboards', desc: 'Get ranked by academic performance. Compete with peers and motivate each other to achieve more.', light: 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
            ].map(({ icon: Icon, title, desc, light }) => (
              <div key={title} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 cursor-default">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${light}`}><Icon size={26} /></div>
                <h3 className="text-lg font-black text-slate-900 mb-2.5">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-5">{desc}</p>
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action (Banner style matching image) ─ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">One Platform For True Academic Success</h2>
            <p className="text-emerald-50 text-lg max-w-2xl mx-auto mb-10 font-medium">
              UNIcollab bridges the gap between institutional learning and collaborative study. Our platform empowers students to share knowledge, find study partners, and prepare efficiently.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-emerald-600 bg-white hover:bg-slate-50 transition-all transform hover:-translate-y-1 shadow-lg cursor-pointer">
              Join UNIcollab Today
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-[2.5rem] p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-500/25">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold text-white mb-6">
                <Rocket size={11} /> Start Your Journey Today
              </div>
              <h2 className="text-4xl lg:text-5xl font-black mb-5 leading-tight">Ready to Unlock Your <br />Academic Potential?</h2>
              <p className="text-emerald-50 text-lg max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                Join hundreds of students already using UNIcollab to collaborate, learn smarter, and achieve more every semester.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-emerald-600 bg-white hover:bg-slate-50 shadow-xl hover:-translate-y-1 transition-all">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-white border-2 border-white/40 hover:bg-white/10 hover:-translate-y-1 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {feedbacks.length > 0 && (
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 mb-4">
                <Star size={11} className="fill-amber-500 text-amber-500" /> Student Reviews
              </span>
              <h2 className="text-4xl font-black text-slate-900 mb-3">What Our <span className="text-emerald-500">Students Say</span></h2>
              <p className="text-slate-500 font-medium">Real feedback from real students across the university</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map(fb => (
                <div key={fb._id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={15} className={i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}
                    <span className="ml-1.5 text-xs font-bold text-slate-500">{fb.rating}.0</span>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed flex-1 font-medium">"{fb.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {fb.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fb.user?.name || 'Anonymous Student'}</p>
                      <p className="text-xs text-slate-400 font-medium">SLTC Student</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="bg-slate-900 pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-400">
                  <BookMarked size={16} color="white" />
                </div>
                <span className="font-black text-white text-xl">UNI<span className="text-emerald-400">collab</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs mb-6">Your gateway to academic excellence through collaborative learning, shared resources, and peer mentorship.</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {['#10B981','#14B8A6','#6366F1','#F59E0B'].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-400 text-sm font-medium">200+ students joined</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Features</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-400">
                {['Kuppi Classes', 'Resource Sharing', 'Study Groups', 'Quiz Zone', 'Leaderboard'].map(item => (
                  <li key={item}><a href="#" className="hover:text-emerald-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-400">
                {[['About Us', '#about'], ['Academics', '#academics'], ['Features', '#features'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, href]) => (
                  <li key={label}><a href={href} className="hover:text-emerald-400 transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-5 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="flex items-start gap-3"><MapPin size={15} className="mt-0.5 shrink-0 text-emerald-400" />Sri Lanka Technology Campus, Padukka</li>
                <li className="flex items-center gap-3"><Mail size={15} className="shrink-0 text-emerald-400" />hello@unicollab.edu.lk</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <p>© {new Date().getFullYear()} UNIcollab. All rights reserved. Built with ❤️ for SLTC students.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">Facebook</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
