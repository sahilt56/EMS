import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export const Lounge = () => {
  const { user, token } = useAuth();
  const [eventId, setEventId] = useState(() => sessionStorage.getItem('loungeEventId') || '');
  const [joined, setJoined] = useState(() => sessionStorage.getItem('loungeJoined') === 'true');
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist session state
  useEffect(() => {
    if (joined && eventId) {
      sessionStorage.setItem('loungeJoined', 'true');
      sessionStorage.setItem('loungeEventId', eventId);
    } else {
      sessionStorage.removeItem('loungeJoined');
      sessionStorage.removeItem('loungeEventId');
    }
  }, [joined, eventId]);

  // Auto-join on refresh if previously joined
  useEffect(() => {
    if (sessionStorage.getItem('loungeJoined') === 'true' && sessionStorage.getItem('loungeEventId') && !socketRef.current) {
      connectToLounge(sessionStorage.getItem('loungeEventId'));
    }
  }, []);

  // Clean up socket on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleJoinLounge = (e) => {
    e.preventDefault();
    connectToLounge(eventId);
  };

  const connectToLounge = (roomId) => {
    if (!roomId.trim()) return;
    setEventId(roomId.trim()); // Ensure state is in sync if auto-joined

    // Prevent duplicate connections by cleaning up any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect to backend Socket.io server passing token during handshake authentication
    const serverUrl = import.meta.env.VITE_WS_URL || 'http://192.168.1.5:5000';
    const socket = io(serverUrl, {
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected successfully.');
      socket.emit('joinLounge', { eventId: roomId.trim() });
      setJoined(true);
    });

    socket.on('connect_error', (err) => {
      toast.error('Lounge Connection Error: ' + err.message);
      socket.disconnect();
    });

    // Listen for validation errors from backend
    socket.on('loungeError', (payload) => {
      toast.error('Error: ' + payload.message);
      handleLeaveLounge();
    });

    // Listen to history sent on join
    socket.on('previousMessages', (history) => {
      setMessages(history);
    });

    // Listen to rosters update
    socket.on('activeUsersList', (users) => {
      setActiveUsers(users);
    });

    // Listen to entry notifications
    socket.on('userJoined', (payload) => {
      setMessages((prev) => [...prev, { system: true, text: payload.message }]);
    });

    // Listen to exit notifications
    socket.on('userLeft', (payload) => {
      setMessages((prev) => [...prev, { system: true, text: payload.message }]);
    });

    // Listen to chat feeds
    socket.on('receiveLoungeMessage', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socketRef.current) return;

    socketRef.current.emit('sendLoungeMessage', {
      eventId: eventId.trim(),
      message: msgInput.trim()
    });

    setMsgInput('');
  };

  const handleLeaveLounge = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setJoined(false);
    setMessages([]);
    setActiveUsers([]);
    setEventId('');
    sessionStorage.removeItem('loungeJoined');
    sessionStorage.removeItem('loungeEventId');
  };

  if (!joined) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 flex-grow min-h-[80vh] flex flex-col justify-center relative">
        {/* Glow effect behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <Card className="relative border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-8 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-indigo-500 to-violet-600"></div>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Users className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Enter Lounge</h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">Connect with other registered attendees in real time.</p>
          </div>
          <form onSubmit={handleJoinLounge} className="space-y-6">
            <div>
              <Input
                label="Event Room ID"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Paste the event ID here"
                required
                className="w-full bg-slate-950/50 border-white/5 focus:border-brand-500/50 py-3"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full py-4 text-sm font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Join Room Lounge
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 flex-grow flex flex-col min-h-[90vh]">
      <div className="flex items-center justify-between pb-4 border-b border-darkBorder mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-200">Networking Lounge</h2>
            <Badge variant="brand">Live Room: {eventId}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Pre-event chat channel with active attendees.</p>
        </div>
        <Button variant="danger" onClick={handleLeaveLounge} className="px-4 py-2 text-xs">
          Leave Room
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow h-[65vh]">
        {/* Chat Feeds Window */}
        <Card className="lg:col-span-3 border border-darkBorder p-0 flex flex-col h-full overflow-hidden">
          {/* Scrollable messages container */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              if (msg.system) {
                return (
                  <div key={idx} className="text-center text-xs text-slate-500 font-medium py-1.5 bg-darkBg/30 rounded-lg max-w-max mx-auto px-4 border border-darkBorder/40">
                     {msg.text}
                  </div>
                );
              }

              const isMe = msg.sender.userId === user._id;

              return (
                <div key={idx} className={`flex space-x-3.5 max-w-[85%] ${isMe ? 'self-end ml-auto flex-row-reverse space-x-reverse' : 'self-start'}`}>
                  {/* Sender Avatar */}
                  {msg.sender.photoURL ? (
                    <img src={msg.sender.photoURL} alt="" className="w-7 h-7 rounded-full border border-darkBorder mt-1 flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold mt-1 flex-shrink-0">
                      {msg.sender.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl text-sm ${isMe ? 'bg-brand-600/20 border border-brand-500/20 text-slate-200' : 'bg-darkBg border border-darkBorder text-slate-300'}`}>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400">{msg.sender.displayName}</span>
                      <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Form chat input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-darkBorder/60 bg-darkSurface/60 flex space-x-2">
            <Input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type message to the lounge..."
              className="flex-grow"
            />
            <Button type="submit" className="py-2.5 px-6">Send</Button>
          </form>
        </Card>

        {/* Sidebar Roster of Active attendees */}
        <Card className="border border-darkBorder p-5 flex flex-col h-full overflow-hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-darkBorder/40 pb-2">
            <span>Online Attendees</span>
            <Badge variant="brand" className="text-[9px]">{activeUsers.length}</Badge>
          </h3>
          <div className="flex-grow overflow-y-auto space-y-3">
            {activeUsers.map((activeUser) => (
              <div key={activeUser.userId} className="flex items-center space-x-2.5 py-1">
                <div className="relative">
                  {activeUser.photoURL ? (
                    <img src={activeUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-darkBorder" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold border border-darkBorder">
                      {activeUser.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Indicator green dot */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-darkSurface bg-emerald-500"></span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{activeUser.displayName}</span>
                  <span className="text-[9px] text-slate-500">Active</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Lounge;
