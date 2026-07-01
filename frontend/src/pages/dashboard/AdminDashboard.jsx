import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, DollarSign, Search, Trash2, LayoutDashboard, Eye, MapPin, Tag, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('overview');
  
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get(`/events?search=${search}`)
      ]);
      setUsers(usersRes.data.data);
      setEvents(eventsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search]);

  const handleUpdateRole = async (targetUserId, newRole) => {
    try {
      await api.patch('/auth/update-role', { userId: targetUserId, role: newRole });
      toast.success(`User role updated to ${newRole}!`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      if (window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
        await api.delete(`/events/${eventId}`);
        toast.success('Event deleted successfully.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to delete event: ' + (err.response?.data?.message || err.message));
    }
  };

  // Metrics
  const totalSystemEvents = events.length;
  const totalSystemRevenue = events.reduce((sum, e) => sum + ((e.ticketsSold || 0) * (e.price || 0)), 0);
  const totalOrganizers = users.filter(u => u.role === 'Organizer').length;
  const totalAttendees = users.filter(u => u.role === 'Attendee').length;

  const navItems = [
    { title: "Overview",       id: "overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { title: "Manage Users",   id: "users",    icon: <Users className="w-4 h-4" /> },
    { title: "Audit Events",   id: "events",   icon: <Calendar className="w-4 h-4" /> },
  ];

  const tabTitles = {
    overview: { title: 'System Overview',     sub: 'High-level metrics and platform health.' },
    users:    { title: 'User Management',     sub: 'View, modify, and manage all platform users.' },
    events:   { title: 'Global Events Audit', sub: 'Monitor all events and moderate listings.' },
  };

  const statCards = [
    { label: 'Total Events',    value: totalSystemEvents, icon: <Calendar className="w-6 h-6" />,   color: 'from-brand-500/20 to-brand-600/10',   textColor: 'text-brand-400',   iconBg: 'bg-brand-500/20' },
    { label: 'Total Organizers', value: totalOrganizers,  icon: <Shield className="w-6 h-6" />,     color: 'from-secondary-500/20 to-secondary-600/10', textColor: 'text-secondary-400', iconBg: 'bg-secondary-500/20' },
    { label: 'Total Attendees', value: totalAttendees,    icon: <Users className="w-6 h-6" />,      color: 'from-violet-500/20 to-violet-600/10',  textColor: 'text-violet-400',  iconBg: 'bg-violet-500/20' },
    { label: 'Gross Revenue',   value: `₹${totalSystemRevenue}`, icon: <TrendingUp className="w-6 h-6" />, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
  ];

  return (
    <div className="flex w-full min-h-screen bg-slate-950">
      
      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-900 border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
        {/* Sidebar Header — combined logo + user info */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-brand-500/5 border border-brand-500/10 rounded-xl px-3 py-2.5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-brand-500/30 object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs border border-brand-500/30 shrink-0">
                {user?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-brand-400 font-medium uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-2 pb-1">System</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                ${subTab === item.id
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className={subTab === item.id ? 'text-brand-400' : 'text-slate-500'}>{item.icon}</span>
              {item.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/10 flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors
              ${subTab === item.id ? 'text-brand-400' : 'text-slate-500'}`}
          >
            {item.icon}
            {item.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-0">
        
        {/* Top Header Bar */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 md:px-10 py-5 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{tabTitles[subTab]?.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{tabTitles[subTab]?.sub}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-900 border border-white/10 p-6 rounded-2xl animate-pulse flex flex-col h-36">
                  <div className="h-3 w-24 bg-white/10 rounded-full mb-4"></div>
                  <div className="h-8 w-16 bg-white/10 rounded-xl mt-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={subTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >

                {/* ── OVERVIEW ── */}
                {subTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {statCards.map((card, idx) => (
                        <div key={idx} className={`bg-gradient-to-br ${card.color} border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                          <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center ${card.textColor} mb-4`}>
                            {card.icon}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{card.label}</p>
                          <p className={`text-3xl font-black ${card.textColor}`}>{card.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Summary Table */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Recent Events</h3>
                        <button onClick={() => setSubTab('events')} className="text-xs text-brand-400 hover:text-brand-300 font-semibold">View All →</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-white/5">
                            <tr>
                              <th className="px-6 py-3 text-left font-semibold">Event</th>
                              <th className="px-6 py-3 text-left font-semibold">Organizer</th>
                              <th className="px-6 py-3 text-center font-semibold">Sold</th>
                              <th className="px-6 py-3 text-right font-semibold">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {events.slice(0, 5).map((event) => (
                              <tr key={event._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-semibold text-white">{event.title}</td>
                                <td className="px-6 py-4 text-slate-400 text-xs">{event.organizer?.displayName || 'System'}</td>
                                <td className="px-6 py-4 text-center text-slate-300 font-medium">{event.ticketsSold} / {event.capacity}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-400">₹{(event.ticketsSold || 0) * (event.price || 0)}</td>
                              </tr>
                            ))}
                            {events.length === 0 && (
                              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No events found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── USERS ── */}
                {subTab === 'users' && (
                  <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">All Users <span className="text-slate-500 font-normal">({users.length})</span></h3>
                    </div>
                    {users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-white/5">
                            <tr>
                              <th className="px-6 py-4 font-semibold">User</th>
                              <th className="px-6 py-4 font-semibold">Email</th>
                              <th className="px-6 py-4 font-semibold">Role</th>
                              <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {users.map((targetUser) => (
                              <tr key={targetUser._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {targetUser.photoURL ? (
                                      <img src={targetUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold border border-brand-500/20 text-xs">
                                        {targetUser.displayName?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                    )}
                                    <span className="font-semibold text-white">{targetUser.displayName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{targetUser.email}</td>
                                <td className="px-6 py-4">
                                  <Badge variant={targetUser.role === 'Admin' ? 'danger' : targetUser.role === 'Organizer' ? 'brand' : 'success'}>
                                    {targetUser.role}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {targetUser.role !== 'Admin' && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="secondary"
                                        onClick={() => handleUpdateRole(targetUser._id, 'Admin')}
                                        className="py-1.5 px-3 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-none shadow-none"
                                      >
                                        Make Admin
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        onClick={() => handleUpdateRole(targetUser._id, targetUser.role === 'Organizer' ? 'Attendee' : 'Organizer')}
                                        className="py-1.5 px-3 text-xs bg-white/5 hover:bg-white/10 text-slate-300 border-none shadow-none"
                                      >
                                        Toggle {targetUser.role === 'Organizer' ? 'Attendee' : 'Organizer'}
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm py-12 text-center">No users found in the system.</p>
                    )}
                  </div>
                )}

                {/* ── EVENTS AUDIT ── */}
                {subTab === 'events' && (
                  <div className="space-y-6">
                    <div className="relative max-w-xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search events by title or location..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/30 text-sm"
                      />
                    </div>

                    {events.length > 0 ? (
                      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                          <h3 className="text-sm font-bold text-white">All Events <span className="text-slate-500 font-normal">({events.length})</span></h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-4 font-semibold">Event Title</th>
                                <th className="px-6 py-4 font-semibold">Organizer</th>
                                <th className="px-6 py-4 font-semibold text-center">Tickets</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {events.map((event) => (
                                <tr key={event._id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-white">{event.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{new Date(event.date).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-400">{event.organizer?.displayName || 'System'}</td>
                                  <td className="px-6 py-4 text-center font-semibold text-slate-300">{event.ticketsSold} / {event.capacity}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="secondary"
                                        onClick={() => openEventDetails(event)}
                                        className="py-1.5 px-3 text-xs bg-white/5 hover:bg-white/10 text-slate-300 border-none shadow-none flex items-center gap-1.5"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Details
                                      </Button>
                                      <Button
                                        variant="danger"
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="py-1.5 px-3 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-none shadow-none flex items-center gap-1.5"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 border border-white/10 rounded-2xl py-16 text-center">
                        <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No events matched the search query.</p>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* ── EVENT DETAILS MODAL ── */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Audit Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
              <h4 className="text-lg font-bold text-white mb-1">{selectedEvent.title}</h4>
              <p className="text-sm text-slate-400">{selectedEvent.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Calendar className="w-5 h-5" />, label: 'Date & Time', value: `${new Date(selectedEvent.date).toLocaleDateString()} ${new Date(selectedEvent.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: selectedEvent.location, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
                { icon: <Tag className="w-5 h-5" />, label: 'Price', value: selectedEvent.price > 0 ? `₹${selectedEvent.price}` : 'Free', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: <Users className="w-5 h-5" />, label: 'Tickets', value: `${selectedEvent.ticketsSold} / ${selectedEvent.capacity} Sold`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className={`p-2 ${item.bg} ${item.color} rounded-lg`}>{item.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">{item.label}</p>
                    <p className="text-sm font-medium text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
              <h4 className="text-xs text-slate-500 uppercase font-semibold mb-3">Created By Organizer</h4>
              <div className="flex items-center gap-3">
                {selectedEvent.organizer?.photoURL ? (
                  <img src={selectedEvent.organizer.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold border border-brand-500/20">
                    {selectedEvent.organizer?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{selectedEvent.organizer?.displayName || 'Unknown Organizer'}</p>
                  <p className="text-xs text-slate-400 font-mono">{selectedEvent.organizer?.email || 'No email available'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
