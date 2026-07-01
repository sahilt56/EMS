import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutsideClick } from '../../hooks/use-outside-click';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-slate-900"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const TrendingEvents = ({ events, loading, user }) => {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 text-left w-full mb-20 relative ${active && typeof active === 'object' ? 'z-[60]' : 'z-10'}`}>
      {/* Background Overlay for Modal */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm h-full w-full z-[100]"
          />
        )}
      </AnimatePresence>
      
      {/* Expanded Modal Content */}
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[110] p-4 sm:p-10">
            <motion.div
              layoutId={`card-${active._id}-${id}`}
              ref={ref}
              className="w-full max-w-2xl h-auto max-h-[90vh] flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <motion.button
                key={`button-${active._id}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-4 right-4 items-center justify-center bg-white/60 backdrop-blur-md hover:bg-white border border-white/40 shadow-sm rounded-full h-10 w-10 z-[120] transition-colors"
                onClick={() => setActive(null)}
              >
                <CloseIcon />
              </motion.button>

              <motion.div layoutId={`image-${active._id}-${id}`}>
                <div className="w-full h-64 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-center relative overflow-hidden">
                  {active.imageUrl ? (
                    <img src={active.imageUrl} alt={active.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </motion.div>

              <div className="flex flex-col flex-grow overflow-hidden relative">
                <div className="flex flex-col justify-between items-start p-6 border-b border-slate-100 gap-4 shrink-0">
                  <div className="w-full">
                    <motion.h3
                      layoutId={`title-${active._id}-${id}`}
                      className="text-2xl font-black text-slate-900 mb-3 tracking-tight"
                    >
                      {active.title}
                    </motion.h3>
                    <div className="flex items-center gap-3 flex-wrap w-full">
                      <Badge className="bg-slate-900 text-white border-none font-extrabold px-3 py-1 shadow-sm rounded-lg">{active.price === 0 ? 'FREE' : `${active.price} INR`}</Badge>
                      <span className="text-sm text-slate-500 font-bold tracking-widest uppercase">
                        {new Date(active.date).toLocaleDateString()}
                      </span>
                      
                      <motion.div layoutId={`button-${active._id}-${id}`} className="ml-auto">
                        <Link to={user ? `/dashboard` : `/auth`} onClick={() => setActive(null)}>
                          <Button className="px-6 py-2 sm:px-8 sm:py-2.5 text-xs sm:text-sm bg-slate-900 text-white hover:bg-black transition-all font-extrabold rounded-xl shadow-xl shadow-slate-900/20">
                            Book Now
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto pb-12">
                  <div className="text-center sm:hidden mb-4 animate-bounce">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Scroll to read more &darr;</span>
                  </div>
                  <motion.p
                    layoutId={`description-${active._id}-${id}`}
                    className="text-slate-600 leading-relaxed font-medium mb-6"
                  >
                    {active.description}
                  </motion.p>
                  
                  {/* Start and End Date Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Starts</span>
                      <span className="text-sm text-slate-900 font-bold tracking-wide">
                        {new Date(active.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Ends</span>
                      <span className="text-sm text-slate-900 font-bold tracking-wide">
                        {active.endDate ? new Date(active.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Availability</span>
                      <span className="text-sm text-slate-900 font-black tracking-wide">
                        {active.ticketsSold} / {active.capacity} Sold
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Location</span>
                      <span className="text-sm text-slate-900 font-bold tracking-wide">
                        {active.location || 'TBA'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Organizer Section */}
                  {active.organizer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100"
                    >
                      {active.organizer.photoURL ? (
                        <img src={active.organizer.photoURL} alt={active.organizer.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-200 shadow-sm">
                          {active.organizer.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Organized by</p>
                        <p className="text-sm font-semibold text-slate-900">{active.organizer.displayName}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Subtle fade at the bottom to indicate scrollable content */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent z-10" />
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Trending Events</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Discover the most popular upcoming events in your area.</p>
        </div>
        <Link to="/events" className="text-sm font-extrabold text-slate-900 hover:text-black focus:outline-none underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900 transition-all" aria-label="Browse all events">
          View all events &rarr;
        </Link>
      </div>

      {/* Base Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-[2rem] bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 p-0 m-0 list-none">
          {events.map((event) => (
            <motion.li
              layoutId={`card-${event._id}-${id}`}
              key={`card-${event._id}-${id}`}
              onClick={() => setActive(event)}
              className="text-left flex flex-col justify-between h-full border-2 border-slate-100 hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-2 transition-all duration-300 ease-in-out group overflow-hidden p-0 bg-white rounded-[2rem] cursor-pointer"
            >
              {/* Image Placeholder */}
              <motion.div layoutId={`image-${event._id}-${id}`}>
                <div className="w-full h-48 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 transition-all">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  ) : (
                    <svg className="w-12 h-12 text-slate-300 group-hover:scale-110 group-hover:text-slate-400 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </motion.div>

              <div className="p-5 flex flex-col flex-grow z-20">
                <div className="flex items-center justify-between mb-5">
                  <Badge className="bg-slate-900 text-white border-none font-extrabold px-3 py-1.5 shadow-sm rounded-xl">{event.price === 0 ? 'FREE' : `${event.price} INR`}</Badge>
                  <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                
                <motion.h3 
                  layoutId={`title-${event._id}-${id}`}
                  className="text-xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-black transition-colors duration-300 tracking-tight"
                >
                  {event.title}
                </motion.h3>
                
                <motion.p 
                  layoutId={`description-${event._id}-${id}`}
                  className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow leading-relaxed font-medium"
                >
                  {event.description}
                </motion.p>
                
                <div className="flex items-center justify-between border-t-2 border-slate-50 pt-5 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Availability</span>
                    <span className="text-xs text-slate-900 font-black tracking-wide">
                      {event.ticketsSold} / {event.capacity} Sold
                    </span>
                  </div>
                  <motion.div layoutId={`button-${event._id}-${id}`}>
                    <Button className="px-6 py-2.5 text-xs bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-extrabold rounded-xl" onClick={(e) => {
                      e.stopPropagation(); // prevent modal open if button is directly clicked
                    }}>
                      <Link to={user ? `/dashboard` : `/auth`} aria-label={`Book ticket for ${event.title}`}>
                        Book Now
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <Card className="py-24 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-4 rounded-[2.5rem] bg-slate-50">
          <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-slate-900 font-black mb-3 text-2xl tracking-tight">No Events Published Yet</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-md leading-relaxed font-medium">Be the first to publish a new event by registering as an organizer and start selling tickets today!</p>
          <Link to="/auth" aria-label="Host an event now">
            <Button className="px-8 py-3.5 text-sm bg-slate-900 text-white hover:bg-black font-extrabold focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none shadow-xl shadow-slate-900/10 rounded-2xl transition-all">Host Event Now</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default memo(TrendingEvents);
