import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ user, onOpenAssistant }) => {
  return (
    <div className="relative w-full pt-20 pb-24 md:pt-32 md:pb-40 z-10 overflow-hidden bg-slate-950">
      
      {/* Indigo glow blobs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-secondary-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-start text-left w-full relative z-10">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center p-1 pr-4 bg-brand-500/10 border border-brand-500/30 rounded-full mb-8 hover:bg-brand-500/20 transition-colors shadow-sm cursor-pointer">
          <span className="bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mr-3 uppercase tracking-wider shadow-sm">
            New
          </span>
          <span className="text-sm text-brand-300 font-semibold">
            EMS 2.0 is now live
          </span>
          <svg className="w-4 h-4 ml-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.05] mb-8 max-w-4xl">
          Next-Gen Events<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-secondary-400 to-accent-400">
            That Drive Growth
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
          Simplify ticket bookings, automate check-ins via custom secure QR codes, launch affiliate referral loops, and chat in pre-event lounges.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onOpenAssistant}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 border border-secondary-500/40 hover:bg-secondary-500/10 text-secondary-300 font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:border-secondary-400"
          >
            <svg className="w-5 h-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask AI Assistant
          </button>
          
          <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-500/30 hover:-translate-y-0.5">
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default memo(HeroSection);
