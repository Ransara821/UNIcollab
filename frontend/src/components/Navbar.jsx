import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleScroll = (e, id) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav className="fixed w-full top-0 h-20 bg-white/90 backdrop-blur-md z-[60] border-b border-slate-100 shadow-sm">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-emerald-500 text-3xl">🎓</span>
                    <div className="font-bold text-2xl text-slate-900 tracking-tight">
                        UNI<span className="text-emerald-500">collab</span>
                    </div>
                </Link>

                <div className="hidden md:flex space-x-8 text-slate-600 font-medium">
                    <Link to="/#home" onClick={(e) => handleScroll(e, 'home')} className="hover:text-emerald-600 transition-colors">Home</Link>
                    <Link to="/#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-emerald-600 transition-colors">Features</Link>
                    <Link to="/#academics" onClick={(e) => handleScroll(e, 'academics')} className="hover:text-emerald-600 transition-colors">Academics</Link>
                    <Link to="/#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-emerald-600 transition-colors">About Us</Link>
                    <Link to="/#contact" onClick={(e) => handleScroll(e, 'contact')} className="hover:text-emerald-600 transition-colors">Contact</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="text-slate-700 font-bold hover:text-emerald-600 transition-colors">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-full font-bold shadow-sm transition-transform transform hover:-translate-y-0.5">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-700 font-bold hover:text-emerald-600 transition-colors">Login</Link>
                            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-transform transform hover:-translate-y-0.5">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
