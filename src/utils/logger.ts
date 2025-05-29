import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import os from 'os';
import 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get application name from package.json
const appName = process.env.npm_package_name || 'smartsheet-mcp';

// Interface for log file info
interface LogFileInfo {
  path: string;
  size: number;
  createdAt: Date;
}

// Get log directory based on platform
const getLogsDir = (): string => {
  const platform = process.platform;
  
  // Try to use platform-specific log directories
  if (platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Local', appName, 'logs');
  } else if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Logs', appName);
  } else {
    // Linux/Unix
    const xdgLogs = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
    return path.join(xdgLogs, appName, 'logs');
  }
};

// Create logs directory
const ensureLogsDir = async (): Promise<string | null> => {
  const logsDir = getLogsDir();
  
  try {
    await fs.mkdir(logsDir, { recursive: true, mode: 0o755 });
    return logsDir;
  } catch (err) {
    // Fall back to system temp directory if we can't use the preferred location
    try {
      const tempDir = path.join(os.tmpdir(), `${appName}-logs`);
      await fs.mkdir(tempDir, { recursive: true, mode: 0o755 });
      console.warn(`[LOGGER] Using temporary directory for logs: ${tempDir}`);
      return tempDir;
    } catch (tempErr) {
      console.error('[LOGGER] Failed to create logs directory:', err);
      return null;
    }
  }
};

// Log format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    if (metaString) {
      log += ` ${metaString}`;
    }
    
    return log;
  })
);

// Log format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Initialize logs directory and file transport
let effectiveLogsDir: string | null = null;

// Create the base logger with console transport only
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: appName,
    pid: process.pid,
    hostname: os.hostname()
  },
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  ],
  exitOnError: false
});

// Initialize file transport
const initializeFileTransport = async (): Promise<void> => {
  try {
    effectiveLogsDir = await ensureLogsDir();
    
    if (effectiveLogsDir) {
      const logFile = path.join(effectiveLogsDir, `${appName}-%DATE%.log`);
      
      // Add daily rotate file transport
      const fileTransport = new winston.transports.DailyRotateFile({
        level: process.env.LOG_LEVEL || 'info',
        filename: logFile,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        handleExceptions: true,
        handleRejections: true
      });
      
      logger.add(fileTransport);
      logger.info(`File logging initialized at: ${logFile}`);
    } else {
      logger.warn('File logging disabled - could not create logs directory');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize file transport: ${errorMessage}`, { error });
  }
};

// Initialize file transport asynchronously
initializeFileTransport().catch(error => {
  logger.error('Failed to initialize file transport', { error });
});

// Create a stream for Morgan HTTP logging
export const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  }
};

// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error): void => {
  logger.error('Uncaught Exception', { error });
  // Don't exit immediately, allow the process to continue
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>): void => {
  logger.error('Unhandled Rejection', { promise, reason });
  // Don't exit immediately, allow the process to continue
});

// Helper to get the current log file path
export const getLogFilePath = (): string | null => {
  if (!effectiveLogsDir) return null;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return path.join(effectiveLogsDir, `${appName}-${dateStr}.log`);
};

// Helper to get all log files
export const getLogFiles = async (): Promise<LogFileInfo[]> => {
  if (!effectiveLogsDir) return [];
  
  try {
    const files = await fs.readdir(effectiveLogsDir);
    const logFiles: LogFileInfo[] = [];
    
    for (const file of files) {
      if (file.startsWith(appName) && file.endsWith('.log')) {
        const filePath = path.join(effectiveLogsDir, file);
        const stats = await fs.stat(filePath);
        
        logFiles.push({
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime
        });
      }
    }
    
    return logFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    logger.error('Failed to read log files', { error });
    return [];
  }
};

export default logger;
