import * as winston from 'winston';

/**
 * Winston logger configuration.
 * Provides a unified interface for logging with different log levels.
 */

// Define custom log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`;
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create the winston logger instance
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    logFormat
  ),
  transports: [
    // Output to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Uncomment to add file logging
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' })
  ],
  exitOnError: false
});

/**
 * Logger wrapper class that provides a simplified interface to winston
 * with methods matching the previous console-based logger.
 */
export class Logger {
  /**
   * Log debug messages
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public debug(message: string, ...optionalParams: any[]): void {
    if (optionalParams.length > 0) {
      winstonLogger.debug(message, optionalParams[0]);
    } else {
      winstonLogger.debug(message);
    }
  }

  /**
   * Log informational messages
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public info(message: string, ...optionalParams: any[]): void {
    if (optionalParams.length > 0) {
      winstonLogger.info(message, optionalParams[0]);
    } else {
      winstonLogger.info(message);
    }
  }

  /**
   * Log warning messages
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public warn(message: string, ...optionalParams: any[]): void {
    if (optionalParams.length > 0) {
      winstonLogger.warn(message, optionalParams[0]);
    } else {
      winstonLogger.warn(message);
    }
  }

  /**
   * Log error messages
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public error(message: string, ...optionalParams: any[]): void {
    if (optionalParams.length > 0) {
      winstonLogger.error(message, optionalParams[0]);
    } else {
      winstonLogger.error(message);
    }
  }
}

// Create a singleton instance
export const logger = new Logger();
