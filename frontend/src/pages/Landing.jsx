import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 overflow-x-hidden relative">
      {/* Background Blobs for overall page */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[80px] -z-10"></div>

      {/* Navbar */}
      <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-3xl">🎓</span>
            <div className="font-bold text-2xl text-slate-900 tracking-tight">
              UNI<span className="text-emerald-500">collab</span>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8 text-slate-600 font-medium">
            <a href="#home" className="hover:text-emerald-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#academics" className="hover:text-emerald-600 transition-colors">Academics</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-700 font-bold hover:text-emerald-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-transform transform hover:-translate-y-0.5">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="lg:w-1/2 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Welcome to UNIcollab
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Better <span className="text-emerald-500">Learning</span> <br />
              Future Starts <br />
              With UNIcollab
            </h1>
            
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
              Connect with peer-to-peer tutoring, academic resources, and study groups all in one place to achieve academic excellence.
            </p>
            
            <div className="flex gap-4">
              <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all hover:pr-10 relative group">
                Join Us Today
                <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <a href="#features" className="bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm">
                Learn More
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-orange-50 rounded-full blur-[80px] -z-10"></div>
             <img 
               src="/src/assets/hero_light.png" 
               alt="Student studying" 
               className="w-full h-auto object-cover relative z-10 animate-float"
             />
             
             {/* Floating Badge */}
             <div className="absolute bottom-10 left-[-20px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 animate-float-delayed">
               <div className="bg-orange-100 p-3 rounded-full text-2xl">🎓</div>
               <div>
                 <div className="text-slate-900 font-bold">100+</div>
                 <div className="text-slate-500 text-sm">Kuppi Classes</div>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* Mini Features Row */}
      <section className="container mx-auto px-6 py-12 relative z-20 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-100 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 p-8">
          <div className="flex items-center gap-6 p-6">
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center text-emerald-500 text-2xl flex-shrink-0">👨‍🏫</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Expert Tutors</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Learn from top-performing peers in specialized Kuppi classes.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6">
            <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 text-2xl flex-shrink-0">📚</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Study Materials</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Access past papers, lecture notes, and community resources.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center text-blue-500 text-2xl flex-shrink-0">🤝</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Study Groups</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Find like-minded students to collaborate on challenging modules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Area */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative bg-emerald-50 rounded-[40px] p-8 aspect-square flex items-center justify-center">
             <div className="absolute inset-0 bg-pattern opacity-10 rounded-[40px]"></div>
             <div className="relative z-10 bg-white p-8 rounded-3xl shadow-xl max-w-md transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Learn New Skills To Go Ahead For Your Career</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-100 text-emerald-600 rounded-full p-1 mt-1">✓</span>
                    <span className="text-slate-600">Premium library of verified study notes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-100 text-emerald-600 rounded-full p-1 mt-1">✓</span>
                    <span className="text-slate-600">Interactive peer tutoring sessions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-100 text-emerald-600 rounded-full p-1 mt-1">✓</span>
                    <span className="text-slate-600">24/7 access to your academic network.</span>
                  </li>
                </ul>
                <button className="mt-8 bg-emerald-50 text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-100 transition-colors w-full">
                  Discover platform
                </button>
             </div>
          </div>

          <div className="lg:w-1/2">
            <div className="text-emerald-500 font-bold uppercase tracking-wider mb-2">ABOUT US</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Our Educational System <br />
              Inspires You More.
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              UNIcollab provides a unique environment where students don't just consume information, but actively participate in peer-to-peer knowledge sharing and collaborative learning.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-extrabold text-emerald-500 mb-2">50+</div>
                <div className="text-slate-700 font-medium">Distinct Modules</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-orange-400 mb-2">200+</div>
                <div className="text-slate-700 font-medium">Active Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses / Kuppi Section */}
      <section id="academics" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="text-emerald-500 font-bold uppercase tracking-wider mb-2">OUR POPULAR CLASSES</div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-16">Choose Our Top Kuppi Classes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Mock Card 1 */}
            <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Class" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Programming</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <span className="flex items-center text-amber-400">★★★★★</span>
                  <span>(4.8)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Advanced Web Development React & Node</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">JD</div>
                    <span className="text-sm font-medium text-slate-700">John Doe</span>
                  </div>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
              </div>
            </div>

            {/* Mock Card 2 */}
            <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Class" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Database</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <span className="flex items-center text-amber-400">★★★★☆</span>
                  <span>(4.5)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Database Management Systems Crash Course</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">AS</div>
                    <span className="text-sm font-medium text-slate-700">Alice Smith</span>
                  </div>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
              </div>
            </div>

            {/* Mock Card 3 */}
            <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Class" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Mathematics</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <span className="flex items-center text-amber-400">★★★★★</span>
                  <span>(4.9)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Discrete Mathematics Mid-Term Revision</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">RW</div>
                    <span className="text-sm font-medium text-slate-700">Robert Wilson</span>
                  </div>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12">
            <Link to="/register" className="inline-block bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold px-8 py-4 rounded-full transition-colors">
              View All Classes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1A2C] text-slate-400 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-emerald-500 text-3xl">🎓</span>
              <div className="font-bold text-2xl text-white tracking-tight">
                UNI<span className="text-emerald-500">collab</span>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed">
              Your gateway to academic success. Connecting students to resources, peer tutoring, and collaborative study groups.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Academics</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Kuppi Classes</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Resource Center</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Study Groups</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Skill Assessments</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-emerald-500">📍</span>
                <span>Sri Lanka Technology Campus,<br/>Padukka, Sri Lanka</span>
              </li>
              <li className="flex gap-3 mt-4">
                <span className="text-emerald-500">✉️</span>
                <span>support@unicollab.edu</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} UNIcollab. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
