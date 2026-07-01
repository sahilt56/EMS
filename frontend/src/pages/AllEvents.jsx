import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Navbar from '../components/common/Navbar';

import Loader from '../components/common/Loader';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SearchBar from '../components/home/SearchBar';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState({ search: '', category: '', location: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (queryParams.search) query.append('search', queryParams.search);
        if (queryParams.category) query.append('category', queryParams.category);
        if (queryParams.location) query.append('location', queryParams.location);

        const response = await api.get(`/events?${query.toString()}`);
        setEvents(response.data.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [queryParams]);

  const handleSearch = ({ title, category, location }) => {
    setQueryParams({ search: title, category, location });
  };

  // Group events by category
  const categorizedEvents = events.reduce((acc, event) => {
    const category = event.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {});

  const categories = Object.keys(categorizedEvents).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col font-sans text-slate-200">
      <Navbar />
      
      <div className="pt-28 pb-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Discover All Events</h1>
          <p className="text-lg text-slate-400 font-medium">Browse our full catalog of upcoming experiences, categorized just for you.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-[2rem] overflow-hidden h-[420px] flex flex-col group shadow-lg animate-pulse">
                <div className="h-48 bg-slate-800/50"></div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-5">
                    <div className="h-6 w-16 bg-white/10 rounded-xl"></div>
                    <div className="h-4 w-20 bg-white/10 rounded-lg"></div>
                  </div>
                  <div className="h-7 w-3/4 bg-white/10 rounded-xl mb-3"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-white/10"></div>
                    <div className="h-3 w-24 bg-white/10 rounded-lg"></div>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-lg mb-2"></div>
                  <div className="h-3 w-5/6 bg-white/10 rounded-lg mb-6"></div>
                  
                  <div className="mt-auto flex justify-between items-center pt-5 border-t border-white/10">
                    <div className="h-10 w-24 bg-white/10 rounded-lg"></div>
                    <div className="h-10 w-28 bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-white/10 pb-2">
                  <h2 className="text-2xl font-extrabold text-white uppercase tracking-widest">{category}</h2>
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">{categorizedEvents[category].length} Events</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {categorizedEvents[category].map((event) => (
                    <div
                      key={event._id}
                      className="text-left flex flex-col justify-between h-full border border-white/10 hover:border-accent-400/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 transition-all duration-300 ease-in-out group overflow-hidden p-0 bg-white/5 backdrop-blur-sm rounded-[2rem]"
                    >
                      <div className="w-full h-48 bg-slate-900 border-b border-white/10 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-800 transition-all">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-12 h-12 text-slate-700 group-hover:scale-110 group-hover:text-slate-600 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-grow z-20">
                        <div className="flex items-center justify-between mb-5">
                          <span className="bg-accent-400 text-white border-none font-extrabold px-3 py-1.5 shadow-sm rounded-xl text-xs">{event.price === 0 ? 'FREE' : `${event.price} INR`}</span>
                          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors duration-300 tracking-tight">
                          {event.title}
                        </h3>
                        {event.organizer && (
                          <div className="flex items-center gap-2 mb-3">
                            {event.organizer.photoURL ? (
                              <img src={event.organizer.photoURL} alt={event.organizerName} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white border border-white/20">
                                {event.organizerName?.charAt(0).toUpperCase() || event.organizer.displayName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="text-xs text-secondary-400 font-bold uppercase tracking-wider">By {event.organizerName || event.organizer.displayName}</p>
                          </div>
                        )}
                        {!event.organizer && event.organizerName && (
                          <p className="text-xs text-secondary-400 font-bold mb-3 uppercase tracking-wider">By {event.organizerName}</p>
                        )}
                        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow leading-relaxed font-medium">{event.description}</p>
                        
                        <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Availability</span>
                            <span className="text-xs text-white font-black tracking-wide">
                              {event.ticketsSold} / {event.capacity} Sold
                            </span>
                          </div>
                          <Link to="/auth" aria-label={`View details for ${event.title}`}>
                            <Button className="px-6 py-2.5 text-xs bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500 shadow-md shadow-accent-500/20 transition-all font-extrabold rounded-xl">
                              Register Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-slate-400">Check back later for exciting new events!</p>
          </div>
        )}
      </main>
      
    </div>
  );
};

export default AllEvents;
