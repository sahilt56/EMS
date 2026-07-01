import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, DollarSign, ScanLine, Link as LinkIcon, Plus, Loader2, Edit2, Image as ImageIcon, User, CheckCircle, XCircle, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
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

// CLOUDINARY CONFIGURATION (From .env)
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  
  const [subTab, setSubTab] = useState('events'); // 'events' | 'scanner' | 'attendees' | 'profile'
  
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event Creation Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const initialEventState = {
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    address: '',
    city: '',
    pinCode: '',
    landmark: '',
    category: '',
    organizerName: user?.displayName || '',
    imageUrl: '',
    price: 0,
    capacity: 50
  };
  const [newEvent, setNewEvent] = useState(initialEventState);

  // Scanner Simulator
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [eventRes] = await Promise.all([
        api.get('/events')
      ]);
      setEvents(eventRes.data.data);
      // Fetch organizer bookings separately (non-blocking)
      try {
        const attendeeRes = await api.get('/bookings/organizer-bookings');
        setAttendees(attendeeRes.data.data);
      } catch (attendeeErr) {
        console.warn('Could not load attendee data:', attendeeErr.response?.data?.message);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter events hosted by this Organizer
  const myEvents = events.filter((e) => e.organizer?._id === user._id || e.organizer === user._id);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
      toast.error("Please configure Cloudinary in your .env file!");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setNewEvent({ ...newEvent, imageUrl: data.secure_url });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = newEvent;
    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', payload);
        toast.success('Event published successfully!');
      }
      setIsEventModalOpen(false);
      setNewEvent(initialEventState);
      setEditingEventId(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save event: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (event) => {
    // Format dates for datetime-local input
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    setNewEvent({
      ...event,
      date: formatDate(event.date),
      endDate: formatDate(event.endDate)
    });
    setEditingEventId(event._id);
    setIsEventModalOpen(true);
  };

  const handleCheckIn = async (e) => {
    if (e) e.preventDefault();
    await processCheckIn(scanBookingId);
  };

  const processCheckIn = async (bookingId) => {
    if (!bookingId) return;
    setIsScanning(true);
    setScanFeedback(null);
    setScanBookingId(bookingId);
    try {
      const response = await api.post('/bookings/check-in', { bookingId });
      setScanFeedback({
        success: true,
        message: `Check-in Successful! Welcome ${response.data.data.user?.displayName || 'Attendee'}.`
      });
      fetchDashboardData(); // Refresh attendee status
      setScanBookingId('');
      
      // Clear last scanned code after a success so they can scan the SAME code again if they really want, after a short delay
      setTimeout(() => {
        lastScannedRef.current = null;
      }, 2000);
    } catch (err) {
      setScanFeedback({
        success: false,
        message: err.response?.data?.message || 'Check-in validation failed.'
      });
      // Allow trying again soon if error
      setTimeout(() => {
        lastScannedRef.current = null;
      }, 2000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartCamera = async () => {
    setIsCameraActive(true);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
      } else {
        toast.error("No cameras found on your device.");
        setIsCameraActive(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access denied. Please grant permissions in your browser.");
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
    setCameras([]);
    setSelectedCameraId('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Use the hidden reader div for file scanning
      const html5QrCode = new Html5Qrcode("hidden-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      
      try {
        const data = JSON.parse(decodedText);
        if (data.bookingId) {
          processCheckIn(data.bookingId);
        }
      } catch(parseErr) {
        setScanFeedback({ success: false, message: "Invalid QR format in the image." });
      }
      // Clean up after scanning image
      html5QrCode.clear();
    } catch (err) {
      setScanFeedback({ success: false, message: "Could not find a valid QR code in this image." });
    }
    
    // Reset file input
    e.target.value = '';
  };

  useEffect(() => {
    if (!isCameraActive || !selectedCameraId) return;

    let isComponentMounted = true;
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode.start(
      selectedCameraId, 
      { 
        fps: 30, 
        qrbox: { width: 300, height: 300 },
        formatsToSupport: [ 0 ]
      },
      (decodedText) => {
        // Ignore rapid duplicate scans
        if (decodedText === lastScannedRef.current) return;
        
        try {
          const data = JSON.parse(decodedText);
          if (data.bookingId) {
            lastScannedRef.current = decodedText;
            processCheckIn(data.bookingId);
          }
        } catch(e) {
          console.error("Invalid QR format");
        }
      },
      () => {} // Ignore parse errors (fired every frame a QR is not found)
    ).catch(err => {
      console.error("Error starting html5qrcode", err);
    });

    return () => {
      isComponentMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
        }).catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, [selectedCameraId, isCameraActive]);

  const totalEvents = myEvents.length;
  const totalTicketsSold = myEvents.reduce((sum, e) => sum + (e.ticketsSold || 0), 0);
  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.ticketsSold * e.price || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 flex-grow min-h-screen overflow-x-hidden">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-white/10"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Organizer Console <span className="text-xl"></span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your events, scan tickets, and view attendees.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-4">
          <Button onClick={() => {
            setEditingEventId(null);
            setNewEvent(initialEventState);
            setIsEventModalOpen(true);
          }} className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white border-none flex items-center gap-2 shadow-xl shadow-orange-500/20 rounded-xl transition-all duration-300 px-6 py-3 font-bold">
            <Plus className="w-5 h-5" /> Host New Event
          </Button>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl group hover:border-orange-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 bg-gradient-to-br from-orange-500/20 to-rose-500/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Hosted Events</h3>
            <p className="text-4xl font-black text-white">{totalEvents}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl group hover:border-rose-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 bg-gradient-to-br from-rose-500/20 to-pink-500/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-500">
              <Users className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Tickets Sold</h3>
            <p className="text-4xl font-black text-white">{totalTicketsSold}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl group hover:border-amber-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-500">
              <DollarSign className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Earnings</h3>
            <p className="text-4xl font-black text-white">₹{totalRevenue}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Internal Navigation */}
      <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-1 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl sm:rounded-full border border-white/10 w-full sm:w-fit mb-10 shadow-lg">
        {['events', 'scanner', 'attendees', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`relative flex-1 sm:flex-none justify-center px-3 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              subTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {subTab === tab && (
              <motion.div
                layoutId="orgTab"
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl sm:rounded-full shadow-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab === 'events' && <Calendar className="w-4 h-4" />}
              {tab === 'scanner' && <ScanLine className="w-4 h-4" />}
              {tab === 'attendees' && <Users className="w-4 h-4" />}
              {tab === 'profile' && <User className="w-4 h-4" />}
              {tab === 'events' ? 'My Events' : tab === 'scanner' ? 'Scanner' : tab === 'attendees' ? 'Attendees' : 'Profile'}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[420px] animate-pulse flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-24 bg-white/10 rounded-xl"></div>
                <div className="h-6 w-16 bg-white/10 rounded-xl"></div>
              </div>
              <div className="h-8 w-3/4 bg-white/10 rounded-xl mb-4"></div>
              <div className="h-4 w-full bg-white/10 rounded-xl mb-2"></div>
              <div className="h-4 w-5/6 bg-white/10 rounded-xl mb-8"></div>
              
              <div className="mt-auto space-y-4">
                <div className="h-2 w-full bg-white/10 rounded-full"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded-xl"></div>
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <div className="h-10 flex-1 bg-white/10 rounded-xl"></div>
                  <div className="h-10 w-28 bg-white/10 rounded-xl"></div>
                </div>
              </div>
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
            {/* PANEL 1: EVENTS */}
            {subTab === 'events' && (
              <div className="space-y-6">
                {myEvents.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {myEvents.map((event) => {
                      const percentSold = Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100));
                      return (
                        <motion.div 
                          variants={itemVariants}
                          key={event._id} 
                          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between group shadow-2xl relative"
                        >
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(event)}
                            className="absolute top-5 right-5 p-2.5 bg-slate-900/80 hover:bg-orange-500 rounded-full transition-colors group-hover:opacity-100 opacity-0 text-white shadow-lg backdrop-blur-md"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex justify-between items-start mb-4 pr-10">
                              <Badge variant={event.price === 0 ? 'success' : 'brand'} className="bg-orange-500/20 text-orange-400 border-none">
                                {event.price === 0 ? 'Free' : `₹${event.price}`}
                              </Badge>
                              <div className="text-right">
                                <span className="text-xs text-slate-500 font-medium block">Date</span>
                                <span className="text-sm font-bold text-slate-300">{new Date(event.date).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-6">{event.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-6">
                              <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                <span>{event.ticketsSold} / {event.capacity} Sold</span>
                                <span className="text-orange-400">{percentSold}%</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentSold}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="bg-gradient-to-r from-orange-500 to-rose-500 h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Link to="/lounge" className="flex-1">
                              <Button className="w-full text-xs py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300">
                                Enter Lounge
                              </Button>
                            </Link>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(event._id);
                                toast.success('Event ID copied!');
                              }}
                              className="px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="Copy Event ID"
                            >
                              Copy Event ID
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">No Hosted Events</h4>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">You haven't published any events yet. Ready to host?</p>
                    <Button onClick={() => setIsEventModalOpen(true)}>Host New Event</Button>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 2: SCANNER */}
            {subTab === 'scanner' && (
              <div className="flex flex-col items-center gap-6">
                <Card className="w-full max-w-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 shadow-[0_0_50px_-12px_rgba(244,63,94,0.15)] rounded-3xl relative overflow-hidden">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <ScanLine className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="font-bold text-white text-xl">Ticket Scanner</h3>
                    <p className="text-sm text-slate-400 mt-2">Scan attendee QR codes using your camera.</p>
                  </div>

                  {!isCameraActive ? (
                    <div className="w-full mb-6 flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-slate-900/40">
                      <ScanLine className="w-12 h-12 text-slate-500 mb-4" />
                      <p className="text-slate-400 mb-6 font-medium">Camera is currently paused.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
                        <Button onClick={handleStartCamera} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30">
                          Request Camera Access
                        </Button>
                        
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="qr-upload"
                          />
                          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-black/20 border border-white/10 pointer-events-none">
                            Upload QR Image
                          </Button>
                        </div>
                      </div>
                      <div id="hidden-reader" style={{ display: 'none' }}></div>
                    </div>
                  ) : (
                    <div className="w-full mb-6">
                      {cameras.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Camera</label>
                          <select 
                            value={selectedCameraId}
                            onChange={(e) => setSelectedCameraId(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            {cameras.map(cam => (
                              <option key={cam.id} value={cam.id}>
                                {cam.label || `Camera ${cam.id}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="relative w-full">
                        <div id="reader" className="w-full text-slate-300 rounded-2xl overflow-hidden shadow-2xl border border-white/10 [&_video]:rounded-2xl [&_video]:w-full bg-black min-h-[250px]"></div>
                        <button 
                          onClick={handleStopCamera}
                          className="absolute top-4 right-4 bg-slate-900/80 hover:bg-rose-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/20 z-10"
                          title="Stop Camera"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {scanFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
                          scanFeedback.success
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {scanFeedback.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-500 uppercase tracking-widest font-bold">Or Manual Entry</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckIn} className="space-y-5 mt-8">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking ID</label>
                      <input
                        type="text"
                        value={scanBookingId}
                        onChange={(e) => setScanBookingId(e.target.value)}
                        placeholder="e.g. 64a8fc..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isScanning} className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white border-none shadow-xl shadow-orange-500/20 rounded-xl font-bold text-base transition-all">
                      {isScanning ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Ticket Manually'}
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {/* PANEL 3: ATTENDEES */}
            {subTab === 'attendees' && (
              <div className="space-y-6">
                {attendees.length > 0 ? (
                  <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-white/10">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Attendee</th>
                            <th className="px-6 py-4 font-semibold">Event</th>
                            <th className="px-6 py-4 font-semibold">Booking ID</th>
                            <th className="px-6 py-4 font-semibold text-center">Passes</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {attendees.map((attendee) => (
                            <tr key={attendee._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-white">{attendee.user?.displayName || 'Unknown'}</div>
                                <div className="text-xs text-slate-500">{attendee.user?.email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-300">{attendee.event?.title}</td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-400">{attendee._id}</td>
                              <td className="px-6 py-4 text-center font-bold text-white">{attendee.ticketCount}x</td>
                              <td className="px-6 py-4 text-center">
                                {attendee.checkedIn ? (
                                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-none"><CheckCircle className="w-3 h-3 mr-1 inline"/> Checked In</Badge>
                                ) : (
                                  <Badge variant="warning" className="bg-orange-500/20 text-orange-400 border-none">Pending</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">No Attendees Yet</h4>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">No tickets have been sold for your events.</p>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 4: PROFILE */}
            {subTab === 'profile' && (
              <ProfileTab 
                stats={[
                  { label: 'Total Events', value: totalEvents },
                  { label: 'Total Tickets Sold', value: totalTicketsSold },
                  { label: 'Total Earnings', value: `₹${totalRevenue}` }
                ]}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* MODAL: CREATE / EDIT EVENT */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEventId ? "Edit Event" : "Host New Event"}
        footer={
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setIsEventModalOpen(false)} disabled={isSubmitting || isUploadingImage}>Cancel</Button>
            <Button onClick={handleCreateOrUpdateEvent} disabled={isSubmitting || isUploadingImage} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-none min-w-[140px]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingEventId ? 'Save Changes' : 'Publish Event')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-2">
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-800/50 rounded-2xl p-6 relative">
            {newEvent.imageUrl ? (
              <img src={newEvent.imageUrl} alt="Event Preview" className="w-full h-32 object-cover rounded-xl mb-4" />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-500 mb-2" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <span className="text-sm font-semibold text-orange-400">
                {isUploadingImage ? 'Uploading...' : 'Click to Upload Event Image'}
              </span>
              <p className="text-xs text-slate-400 mt-1">Uses Cloudinary (Requires Credentials)</p>
            </div>
          </div>

          <Input
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="e.g. Next.js Conf"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Organizer Name"
              value={newEvent.organizerName}
              onChange={(e) => setNewEvent({ ...newEvent, organizerName: e.target.value })}
              placeholder="e.g. Vercel"
              required
            />
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 appearance-none"
                required
              >
                <option value="" disabled className="bg-slate-900 text-slate-500">Select Category</option>
                <option value="tech" className="bg-slate-900">Technology</option>
                <option value="music" className="bg-slate-900">Music</option>
                <option value="business" className="bg-slate-900">Business</option>
                <option value="sports" className="bg-slate-900">Sports</option>
                <option value="arts" className="bg-slate-900">Arts & Culture</option>
                <option value="education" className="bg-slate-900">Education</option>
                <option value="workshop" className="bg-slate-900">Workshop</option>
                <option value="health" className="bg-slate-900">Health & Wellness</option>
                <option value="other" className="bg-slate-900">Other</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="What is this event about?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 h-24 resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              required
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={newEvent.endDate}
              onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Short Location Name"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="e.g. Moscone Center"
              required
            />
            <Input
              label="Proper Venue Address"
              value={newEvent.address}
              onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
              placeholder="e.g. 747 Howard St"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={newEvent.city}
              onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
              placeholder="e.g. San Francisco"
              required
            />
            <Input
              label="Pin Code"
              value={newEvent.pinCode}
              onChange={(e) => setNewEvent({ ...newEvent, pinCode: e.target.value })}
              placeholder="e.g. 94103"
              required
            />
            <Input
              label="Landmark"
              value={newEvent.landmark}
              onChange={(e) => setNewEvent({ ...newEvent, landmark: e.target.value })}
              placeholder="e.g. Near Park"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ticket Price (INR)"
              type="number"
              value={newEvent.price}
              onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Max Capacity"
              type="number"
              value={newEvent.capacity}
              onChange={(e) => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })}
              min={1}
              required
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default OrganizerDashboard;
