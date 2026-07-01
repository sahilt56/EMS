import React from 'react';

export const Loader = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-darkBorder"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin"></div>
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f19]">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{spinner}</div>;
};

export default Loader;
