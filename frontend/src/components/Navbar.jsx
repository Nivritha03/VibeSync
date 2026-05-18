import React, { useState, useEffect, useContext } from 'react';
import { PlayCircle, BarChart2, Activity, Info, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', icon: <Activity className="w-4 h-4 mr-2" />, id: 'home', href: '/' },
    ...(user ? [
      { name: 'Mood Timeline', icon: <BarChart2 className="w-4 h-4 mr-2" />, id: 'analytics', href: '/app' }
    ] : [
      { name: 'Features', icon: <Info className="w-4 h-4 mr-2" />, id: 'features', href: '/#features' },
      { name: 'Detect Mood', icon: <Activity className="w-4 h-4 mr-2" />, id: 'detect', href: '/app' }
    ]),
  ];

  const handleNavLinkClick = (e, item) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (item.id === 'home') {
      navigate('/');
      return;
    }

    if (item.id === 'features') {
      if (pathname === '/') {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
             const element = document.getElementById('features');
             if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    if (item.id === 'analytics') {
      if (pathname === '/app') {
          const element = document.getElementById('analytics');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
          navigate('/app');
          setTimeout(() => {
              const element = document.getElementById('analytics');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
          }, 500);
      }
      return;
    }

    if (!user && (item.id === 'detect' || item.href === '/app')) {
      onLoginClick();
      return;
    }

    navigate(item.href);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
      scrolled ? 'bg-black/90 backdrop-blur-xl py-3 border-white/5' : 'bg-transparent py-5 border-transparent'
    }`}>
      <div className="w-full px-6 sm:px-12 lg:px-24">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-neonBlue flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">VibeSync</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={(e) => handleNavLinkClick(e, link)} 
                className={`flex items-center transition-all duration-200 hover:text-white group border-none bg-transparent cursor-pointer ${
                  (pathname === link.href) ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <span className="group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="text-sm font-bold">{link.name}</span>
              </button>
            ))}
            
            <div className="pl-4 border-l border-white/10 flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
                        {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{user}</span>
                  </div>
                  <button 
                    onClick={() => {
                        logout();
                        navigate('/');
                    }} 
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
            <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                <button 
                    key={link.id}
                    onClick={(e) => handleNavLinkClick(e, link)} 
                    className="flex items-center text-gray-300 hover:text-white p-3 rounded-2xl hover:bg-white/5 w-full text-left"
                >
                    <span className="p-2 bg-white/5 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">{link.icon}</span>
                    <span className="font-bold">{link.name}</span>
                </button>
                ))}
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
