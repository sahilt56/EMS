const winston = require('winston');

// Define human-readable format for development console output
const consoleFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `[${timestamp}] [${level}]: ${stack || message}`;
});

// Configure the Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json() // Logs JSON to files for easy parser consumption
  ),
  transports: [
    // Output error logs to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Output all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add colorized console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  }));
}

module.exports = logger;
