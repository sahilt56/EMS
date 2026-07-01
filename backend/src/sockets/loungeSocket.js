const admin = require('../config/firebase');
const User = require('../models/User');
const Event = require('../models/Event');

// Simple in-memory storage for lounge chat histories
// In production, this should be moved to Redis or MongoDB for persistence across restarts
const loungeHistories = {};

/**
 * Initialize Socket.io pre-event networking lounge connections
 * @param {object} io - Socket.io Server instance
 */
const initLoungeSocket = (io) => {
  // Middleware to authenticate socket connections via Firebase ID Token
  io.use(async (socket, next) => {
    try {
      // Token can be passed in auth payload or query string/headers
      const token = socket.handshake.auth?.token || 
                    socket.handshake.query?.token ||
                    socket.handshake.headers['authorization']?.split('Bearer ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token is required for socket connection.'));
      }

      // Verify the token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Fetch user details from MongoDB linked by UID
      const user = await User.findOne({ uid: decodedToken.uid });
      if (!user) {
        return next(new Error('Authentication error: User profiles not synced in database.'));
      }

      // Store authenticated user profile in the socket instance
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket Authentication failed:', err.message);
      return next(new Error('Authentication error: Token is invalid or expired.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Lounge connection active: ${socket.user.displayName} (socket ID: ${socket.id})`);

    // Handle joining a pre-event lounge channel
    socket.on('joinLounge', async ({ eventId }) => {
      if (!eventId) return;

      try {
        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit('loungeError', { message: 'Invalid Event ID. This event does not exist.' });
          return;
        }
      } catch (err) {
        socket.emit('loungeError', { message: 'Invalid Event ID format. Please check your ID.' });
        return;
      }

      socket.join(eventId);
      console.log(`User ${socket.user.displayName} joined lounge room: ${eventId}`);

      socket.to(eventId).emit('userJoined', {
        userId: socket.user._id,
        displayName: socket.user.displayName,
        photoURL: socket.user.photoURL,
        message: `${socket.user.displayName} has joined the networking lounge!`
      });

      // Send the history of the lounge to the newly joined user
      const history = loungeHistories[eventId] || [];
      socket.emit('previousMessages', history);

      // Compile current list of active users in the room
      const activeClients = io.sockets.adapter.rooms.get(eventId);
      const activeUsers = [];
      
      if (activeClients) {
        activeClients.forEach((clientId) => {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket && clientSocket.user) {
            activeUsers.push({
              userId: clientSocket.user._id,
              displayName: clientSocket.user.displayName,
              photoURL: clientSocket.user.photoURL
            });
          }
        });
      }

      // Emit full roster to all occupants in the lounge
      io.to(eventId).emit('activeUsersList', activeUsers);
    });

    // Real-time message broadcast
    socket.on('sendLoungeMessage', ({ eventId, message }) => {
      if (!eventId || !message || message.trim() === '') return;

      const payload = {
        sender: {
          userId: socket.user._id,
          displayName: socket.user.displayName,
          photoURL: socket.user.photoURL
        },
        message: message.trim(),
        timestamp: new Date()
      };

      // Store in memory (keep last 100 messages)
      if (!loungeHistories[eventId]) {
        loungeHistories[eventId] = [];
      }
      loungeHistories[eventId].push(payload);
      if (loungeHistories[eventId].length > 100) {
        loungeHistories[eventId].shift();
      }

      // Broadcast message to everyone in the room
      io.to(eventId).emit('receiveLoungeMessage', payload);
    });

    // Broadcast leave notification on room changes
    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('userLeft', {
            userId: socket.user._id,
            displayName: socket.user.displayName,
            message: `${socket.user.displayName} has exited the lounge.`
          });

          // If this is the last person leaving, clear the chat history permanently
          const room = io.sockets.adapter.rooms.get(roomId);
          if (room && room.size <= 1) {
            delete loungeHistories[roomId];
            console.log(`Lounge ${roomId} is now empty. History deleted permanently.`);
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`Lounge connection closed: ${socket.user.displayName} (socket ID: ${socket.id})`);
    });
  });
};

module.exports = initLoungeSocket;
