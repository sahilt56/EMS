import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, Search, QrCode, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ProfileTab from '../../components/dashboard/ProfileTab';
import { User } from 'lucide-react';

// Helper to dynamically inject Razorpay payment scripts
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const AttendeeDashboard = () => {
  const { user } = useAuth();
  
  const [subTab, setSubTab] = useState('explore'); // 'explore' | 'tickets' | 'profile'
  
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEventToBook, setSelectedEventToBook] = useState(null);
  
  // Checkout
  const [bookingCount, setBookingCount] = useState(1);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [eventRes, ticketRes] = await Promise.all([
        api.get(`/events?search=${search}`),
        api.get('/bookings/my-bookings')
      ]);
      setEvents(eventRes.data.data);
      setTickets(ticketRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search]);

  // Handle Razorpay Checkout
  const handleBuyTicket = async () => {
    if (!selectedEventToBook) return;
    setIsProcessingCheckout(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        console.error('Razorpay SDK failed to load');
        toast.error('Razorpay Payment gateway failed to load.');
        setIsProcessingCheckout(false);
        return;
      }

      // 1. Initiate booking on backend
      const bookingRes = await api.post('/bookings/initiate', {
        eventId: selectedEventToBook._id,
        ticketCount: Number(bookingCount)
      });

      const { booking, order } = bookingRes.data.data;

      // 2. Free Event Checkout
      if (selectedEventToBook.price === 0) {
        await api.post('/bookings', {
          eventId: selectedEventToBook._id,
          ticketQuantity: bookingCount
        });
        toast.success('Ticket booked successfully (Free Event)!');
        setSelectedEventToBook(null);
        setBookingCount(1);
        fetchDashboardData();
        setSubTab('tickets');
        setIsProcessingCheckout(false);
        return;
      }

      // 3. Mock payments fallback
      if (order.isMock) {
        const mockResponse = {
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_pay_${Math.random().toString(36).substring(2, 11)}`,
          razorpay_signature: 'mock_sig_valid'
        };

        await api.post('/bookings/verify', {
          bookingId: booking._id,
          razorpayOrderId: mockResponse.razorpay_order_id,
          razorpayPaymentId: mockResponse.razorpay_payment_id,
          razorpaySignature: mockResponse.razorpay_signature
        });

        toast.success('Ticket booked successfully (Mock Checkout Verification)!');
        setSelectedEventToBook(null);
        setBookingCount(1);
        fetchDashboardData();
        setSubTab('tickets');
        setIsProcessingCheckout(false);
        return;
      }

      // 4. Real Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T78A3LpOCu08gZ',
        amount: order.amount,
        currency: order.currency,
        name: 'EventFlow EMS',
        description: `Ticket for ${selectedEventToBook.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/bookings/verify', {
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment Successful & Ticket Booked!');
            setSelectedEventToBook(null);
            setBookingCount(1);
            fetchDashboardData();
            setSubTab('tickets');
          } catch (verifyErr) {
            toast.error('Verification failed: ' + (verifyErr.response?.data?.message || verifyErr.message));
          }
        },
        modal: {
          ondismiss: () => setIsProcessingCheckout(false)
        },
        prefill: {
          name: user.displayName,
          email: user.email
        },
        theme: {
          color: '#14b8a6' // Tailwind teal-500
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Checkout failed: ' + (err.response?.data?.message || err.message));
      setIsProcessingCheckout(false);
    }
  };


  const totalSpent = tickets.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 flex-grow min-h-screen">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-white/10"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Welcome back, {user.displayName?.split(' ')[0]} <span className="text-xl"></span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Explore events and manage your tickets.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-3 bg-white/5 p-1.5 rounded-2xl sm:rounded-full border border-white/10 backdrop-blur-md w-full sm:w-auto">
          {['explore', 'tickets', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`relative flex-1 sm:flex-none justify-center px-3 py-2.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                subTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {subTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl sm:rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 capitalize flex items-center gap-1.5">
                {tab === 'profile' && <User className="w-4 h-4" />}
                {tab === 'explore' ? 'Explore' : tab}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-xl group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
            <Ticket className="w-6 h-6 text-teal-400 mb-4" />
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">My Tickets</h3>
            <p className="text-3xl font-bold text-white">{tickets.length}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-xl group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <CreditCard className="w-6 h-6 text-emerald-400 mb-4" />
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Spent</h3>
            <p className="text-3xl font-bold text-white">₹{totalSpent}</p>
          </div>
        </motion.div>
        
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden h-[380px] flex flex-col group shadow-lg animate-pulse">
              <div className="h-48 bg-slate-800/50"></div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-5 w-16 bg-white/10 rounded-lg"></div>
                  <div className="h-4 w-20 bg-white/10 rounded-lg"></div>
                </div>
                <div className="h-6 w-3/4 bg-white/10 rounded-lg mb-2"></div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-white/10"></div>
                  <div className="h-3 w-24 bg-white/10 rounded-lg"></div>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-lg mb-1"></div>
                <div className="h-3 w-5/6 bg-white/10 rounded-lg mb-4"></div>
                <div className="mt-auto h-10 w-full bg-white/10 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* EXPLORE EVENTS */}
            {subTab === 'explore' && (
              <div className="space-y-6">
                <div className="relative max-w-xl mx-auto md:mx-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search upcoming events..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 backdrop-blur-sm"
                  />
                </div>

                {events.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {events.map((event) => (
                      <motion.div 
                        variants={itemVariants}
                        key={event._id}
                        whileHover={{ y: -5 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col group shadow-lg hover:shadow-teal-500/10 transition-all"
                      >
                        <div 
                          className="h-48 bg-slate-800 relative flex flex-col justify-between p-6 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                          style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/20"></div>
                          <div className="relative z-10 flex justify-between items-start">
                            <Badge variant={event.price === 0 ? 'success' : 'brand'} className="shadow-lg">
                              {event.price === 0 ? 'Free' : `₹${event.price}`}
                            </Badge>
                            <span className="text-xs font-bold px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg">
                              {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">{event.description}</p>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-6 font-medium">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {event.location}</span>
                            <span>{event.ticketsSold} / {event.capacity} Sold</span>
                          </div>
                          
                            <Button
                              onClick={() => setSelectedEventToBook(event)}
                              disabled={event.ticketsSold >= event.capacity}
                              className="flex-1 bg-white text-slate-900 hover:bg-slate-200 shadow-xl w-full"
                            >
                              {event.ticketsSold >= event.capacity ? 'Sold Out' : 'Buy Ticket'}
                            </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-slate-500">No events found matching your search.</p>
                  </div>
                )}
              </div>
            )}

            {/* MY TICKETS */}
            {subTab === 'tickets' && (
              <div className="space-y-6">
                {tickets.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {tickets.map((ticket) => (
                      <motion.div 
                        variants={itemVariants}
                        key={ticket._id}
                        className="flex flex-col sm:flex-row bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                      >
                        {/* Ticket left/top (QR) */}
                        <div className="sm:w-1/3 bg-white p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200 border-dashed relative">
                          <div className="w-4 h-4 rounded-full bg-slate-900 absolute -bottom-2 sm:-right-2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-10" />
                          <div className="w-4 h-4 rounded-full bg-slate-900 absolute -top-2 sm:-left-2 sm:top-1/2 sm:-translate-y-1/2 z-10 hidden sm:block" />
                          
                          {ticket.qrCodeData ? (
                            <img src={ticket.qrCodeData} alt="QR" className="w-32 h-32 mb-3 rounded-lg shadow-sm" />
                          ) : (
                            <div className="w-32 h-32 mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
                              <QrCode className="w-10 h-10 text-slate-300" />
                            </div>
                          )}
                          <button 
                            onClick={() => setSelectedTicket({ title: ticket.event?.title, qr: ticket.qrCodeData })}
                            className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest"
                          >
                            Expand QR
                          </button>
                        </div>
                        
                        {/* Ticket Right/Bottom (Details) */}
                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-none">Confirmed</Badge>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-500 font-mono font-bold tracking-widest">ID: {ticket._id}</span>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{ticket.event?.title || 'Unknown Event'}</h3>
                            <p className="text-sm text-slate-400 mb-2">{ticket.event?.date ? new Date(ticket.event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</p>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
                              </div>
                              <span className="text-sm text-slate-300 font-medium">{user?.displayName || 'Attendee'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <div className="text-sm">
                              <span className="text-slate-500 block text-xs">Passes</span>
                              <span className="font-bold text-white">{ticket.ticketCount}x</span>
                            </div>
                            <Button 
                              onClick={() => {
                                sessionStorage.setItem('loungeEventId', ticket.event?._id);
                                window.location.href = '/lounge';
                              }}
                              className="px-4 py-2 text-xs bg-slate-800 text-white hover:bg-slate-700"
                            >
                              Enter Lounge
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">No Tickets Yet</h4>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Explore our upcoming events and secure your spot.</p>
                    <Button onClick={() => setSubTab('explore')}>Explore Events</Button>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {subTab === 'profile' && (
              <ProfileTab 
                stats={[
                  { label: 'My Tickets', value: tickets.length },
                  { label: 'Total Spent', value: `₹${totalSpent}` }
                ]}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* MODAL: VIEW TICKET QR */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Check-In Pass"
      >
        {selectedTicket && (
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-4 rounded-2xl shadow-2xl mb-6">
              {selectedTicket.qr ? (
                <img src={selectedTicket.qr} alt="Ticket QR" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-xl">
                  <QrCode className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>
            <h4 className="font-bold text-xl text-white mb-2 text-center">{selectedTicket.title}</h4>
            <p className="text-sm text-slate-400 text-center">Present this QR code to the event coordinator.</p>
          </div>
        )}
      </Modal>

      {/* MODAL: CHECKOUT */}
      <Modal
        isOpen={!!selectedEventToBook}
        onClose={() => setSelectedEventToBook(null)}
        title="Complete Purchase"
        footer={
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setSelectedEventToBook(null)} disabled={isProcessingCheckout}>Cancel</Button>
            <Button onClick={handleBuyTicket} disabled={isProcessingCheckout} className="bg-teal-500 hover:bg-teal-600 text-white border-none min-w-[140px]">
              {isProcessingCheckout ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Pay Now'}
            </Button>
          </div>
        }
      >
        {selectedEventToBook && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-bold text-lg text-white mb-1">{selectedEventToBook.title}</h4>
              <p className="text-sm text-slate-400 mb-4">{selectedEventToBook.location}</p>
              
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-slate-400">Price per ticket</span>
                <span className="font-bold text-white">{selectedEventToBook.price === 0 ? 'Free' : `₹${selectedEventToBook.price}`}</span>
              </div>

              {selectedEventToBook.organizer && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  {selectedEventToBook.organizer.photoURL ? (
                    <img src={selectedEventToBook.organizer.photoURL} alt={selectedEventToBook.organizer.displayName} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-white/20">
                      {selectedEventToBook.organizer.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Organized by</p>
                    <p className="text-sm font-semibold text-white">{selectedEventToBook.organizer.displayName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Number of Passes"
                type="number"
                value={bookingCount}
                onChange={(e) => setBookingCount(Number(e.target.value))}
                min={1}
                max={10}
                required
              />
            </div>

            <div className="border-t border-white/10 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Amount</span>
                <span className="text-2xl font-bold text-teal-400">₹{selectedEventToBook.price * bookingCount}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AttendeeDashboard;
