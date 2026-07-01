import React, { memo, useState } from 'react';
import Button from '../ui/Button';

const SearchBar = ({ onSearch = () => {} }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ title, category, location });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-4 sm:mt-8 mb-16 w-full">
      <div className="bg-slate-900 p-3 sm:p-5 rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-slate-800">
        <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleSearch}>
          <div className="w-full sm:flex-1">
            <label htmlFor="search-title" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Event Title</label>
            <input 
              id="search-title"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you looking for?" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:bg-slate-800 transition-all placeholder:text-slate-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="search-category" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Category</label>
            <div className="relative">
              <select 
                id="search-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:bg-slate-800 transition-all appearance-none"
              >
                <option value="">All Categories</option>
                <option value="tech">Technology</option>
                <option value="music">Music</option>
                <option value="business">Business</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts & Culture</option>
                <option value="education">Education</option>
                <option value="workshop">Workshop</option>
                <option value="health">Health & Wellness</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="search-location" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Location</label>
            <input 
              id="search-location"
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or Virtual" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:bg-slate-800 transition-all placeholder:text-slate-500"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-white text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded-2xl font-extrabold transition-all">
            Search
          </Button>
        </form>
      </div>
    </div>
  );
};

export default memo(SearchBar);
