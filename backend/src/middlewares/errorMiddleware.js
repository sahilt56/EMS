const logger = require('../utils/logger');

/**
 * Centralized global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error using the winston logger
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack
  });

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Production: Do not leak detailed error stack/internals for programming bugs
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Generic fallback response for unhandled bug exceptions
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong on the server.'
  });
};

module.exports = errorHandler;
