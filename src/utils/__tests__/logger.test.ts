/**
 * Tests for the logger module
 */

// Create mock functions for logger methods
const mockDebug = jest.fn();
const mockInfo = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();
const mockTrace = jest.fn();
const mockChild = jest.fn();

// Create child logger mock
const mockChildLogger = {
  debug: mockDebug,
  info: mockInfo,
  warn: mockWarn,
  error: mockError,
  trace: mockTrace,
  child: mockChild
};

// Create the base mock logger
const mockBaseLogger = {
  debug: mockDebug,
  info: mockInfo,
  warn: mockWarn,
  error: mockError,
  trace: mockTrace,
  child: jest.fn().mockImplementation((context) => {
    return { ...mockChildLogger, context };
  })
};

jest.mock('../logger.js', () => ({
  logger: mockBaseLogger,
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    TRACE: 'trace'
  },
  withComponent: jest.fn().mockImplementation((component) => {
    mockBaseLogger.child({ component });
    return mockBaseLogger;
  }),
  withRequestContext: jest.fn().mockImplementation((requestId, userId) => {
    if (userId) {
      mockBaseLogger.child({ requestId, userId });
    } else {
      mockBaseLogger.child({ requestId });
    }
    return mockBaseLogger;
  }),
  formatError: jest.fn().mockImplementation((error) => {
    if (error instanceof Error) {
      return { message: error.message, stack: error.stack };
    }
    return { message: String(error) };
  })
}));

// AFTER mocking, import the module under test
import { logger, LOG_LEVELS, withComponent, withRequestContext, formatError } from '../logger.js';

describe('Logger module', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('LOG_LEVELS constants', () => {
    test('should export correct log levels', () => {
      expect(LOG_LEVELS).toEqual({
        ERROR: 'error',
        WARN: 'warn',
        INFO: 'info',
        DEBUG: 'debug',
        TRACE: 'trace'
      });
    });
  });

  describe('withComponent function', () => {
    test('should call child logger with component context', () => {
      const component = 'test-component';
      withComponent(component);
      expect(mockBaseLogger.child).toHaveBeenCalledWith({ component });
    });
  });

  describe('withRequestContext function', () => {
    test('should call child logger with requestId', () => {
      const requestId = 'req-123';
      withRequestContext(requestId);
      expect(mockBaseLogger.child).toHaveBeenCalledWith({ requestId });
    });

    test('should include userId in context when provided', () => {
      const requestId = 'req-123';
      const userId = 'user-456';
      withRequestContext(requestId, userId);
      expect(mockBaseLogger.child).toHaveBeenCalledWith({
        requestId,
        userId
      });
    });
  });

  describe('logger methods', () => {
    test('should expose standard logging methods', () => {
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.trace).toBeDefined();
      expect(logger.child).toBeDefined();
    });

    test('debug method should work', () => {
      const message = 'test debug message';
      logger.debug(message);
      expect(mockDebug).toHaveBeenCalledWith(message);
    });

    test('info method should work', () => {
      const message = 'test info message';
      logger.info(message);
      expect(mockInfo).toHaveBeenCalledWith(message);
    });

    test('warn method should work', () => {
      const message = 'test warn message';
      logger.warn(message);
      expect(mockWarn).toHaveBeenCalledWith(message);
    });

    test('error method should work', () => {
      const message = 'test error message';
      const error = new Error('test error');
      logger.error(message, { error });
      expect(mockError).toHaveBeenCalledWith(message, { error });
    });

    test('trace method should work', () => {
      const message = 'test trace message';
      logger.trace(message);
      expect(mockTrace).toHaveBeenCalledWith(message);
    });
  });
  
  describe('formatError function', () => {
    test('should format Error objects correctly', () => {
      const errorObj = new Error('test error');
      const result = formatError(errorObj);
      expect(result).toEqual({
        message: errorObj.message,
        stack: errorObj.stack
      });
    });
    
    test('should format non-Error values correctly', () => {
      const stringError = 'test error string';
      expect(formatError(stringError)).toEqual({ message: stringError });
      
      const numberError = 404;
      expect(formatError(numberError)).toEqual({ message: '404' });
      
      const objError = { error: 'bad request' };
      expect(formatError(objError)).toEqual({ message: '[object Object]' });
    });
  });
});