const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const initLoungeSocket = require('./sockets/loungeSocket');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*', // For production development restrict origin appropriately
    methods: ['GET', 'POST']
  }
});

// Configure real-time pre-event lounges
initLoungeSocket(io);

// Connect to MongoDB and start HTTP server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
