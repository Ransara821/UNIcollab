import { Link } from 'react-router-dom';
import { BookMarked, Users, BookOpen, BrainCircuit, ChevronRight, MapPin, Mail, ArrowRight, CheckCircle2, Star, PlayCircle, Award, File as FileIcon } from 'lucide-react';

export default function Landing() {
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

            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Better <span className="text-emerald-500 relative">
                Learning
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> <br className="hidden lg:block"/> Future Starts <br/> With UNIcollab
            </h1>

            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              Join thousands of university students connecting for peer tutoring, sharing study materials, and tracking academic progress in one place.
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
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="relative w-full max-w-[550px] mx-auto">
              {/* Decorative background shape */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-full shadow-2xl shadow-emerald-900/20 translate-y-8 -z-10 blur-xl opacity-60"></div>
              
              <div className="relative rounded-[40px] overflow-hidden bg-white shadow-2xl shadow-emerald-900/10 border-[8px] border-white z-0">
                <img src="/hero-student.png" alt="Happy university student holding notebook" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 ease-in-out bg-slate-50" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-1/4 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none transition-all cursor-default z-20" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-600" size={20}/></div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Target Met!</p>
                  <p className="text-xs text-slate-500">GPA Improved</p>
                </div>
              </div>

              <div className="absolute bottom-1/4 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-pulse hover:animate-none z-20" style={{ animationDuration: '4s' }}>
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center"><Users className="text-teal-600" size={20}/></div>
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
