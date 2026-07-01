/**
 * Custom Error class for operational API exceptions
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Identifies operational errors (errors we anticipate and handle) 
    // vs programming/system errors (bugs, package failures, etc.)
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
