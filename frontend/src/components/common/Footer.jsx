import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Event Management System SaaS. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
