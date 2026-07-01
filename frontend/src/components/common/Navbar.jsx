import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm px-4 py-1.5 rounded-full transition-all duration-300 font-medium ${
      isActive
        ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
        : "text-slate-300 hover:text-white hover:bg-white/10"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
      isActive
        ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
        : "text-slate-300 hover:text-white hover:bg-white/10"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between h-15 px-5 bg-slate-950/95 backdrop-blur-md rounded-full shadow-xl border border-brand-500/20">
          
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-lg font-black tracking-tight text-white flex items-center gap-2 cursor-default">
              Event Management System
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!user && <NavLink to="/" className={navLinkClass} end>Home</NavLink>}
            <NavLink to="/events" className={navLinkClass}>All Events</NavLink>
            {!user && <NavLink to="/about" className={navLinkClass}>About</NavLink>}
            {!user && <a href="/#features" className={navLinkClass({ isActive: false })}>Features</a>}
            {user && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/lounge" className={navLinkClass}>Lounges</NavLink>
              </>
            )}
          </div>

          {/* User Session & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200"></span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <Button 
                  onClick={handleLogout} 
                  className="rounded-full h-8 px-4 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/5 shadow-none transition-all"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button className="rounded-full h-8 px-5 text-xs bg-white text-slate-900 hover:bg-slate-200 transition-all font-semibold shadow-sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Hamburger Button (Mobile) */}
            <button 
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-2 mt-6">
              {!user && (
                <NavLink 
                  to="/" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                  end
                >
                  Home
                </NavLink>
              )}
              <NavLink 
                to="/events" 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Events
              </NavLink>
              {!user && (
                <NavLink 
                  to="/about" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </NavLink>
              )}
              {!user && (
                <a 
                  href="/#features" 
                  className={mobileNavLinkClass({ isActive: false })}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
              )}
              {user && (
                <>
                  <NavLink 
                    to="/dashboard" 
                    className={mobileNavLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/lounge" 
                    className={mobileNavLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Lounges
                  </NavLink>
                </>
              )}<div className="h-px bg-white/10 my-2"></div>
              
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white">

                      
                    </span>
                  </div>
                  <Button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    className="rounded-xl h-8 px-4 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border-none transition-all"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl py-3 text-sm bg-white text-slate-900 hover:bg-slate-200 transition-all font-black shadow-sm mt-2">
                    Sign In to EventFlow
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
