/**
 * Tests for the notification logger module
 */
import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { createNotificationLogger } from '../notification-logger.js';
import { sendLogNotification } from '../../server/notification-helpers.js';

// Mock dependencies
jest.mock('../../server/notification-helpers.js', () => ({
  sendLogNotification: jest.fn(),
}));

// Create mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn()
};

// Save original console methods
const originalConsole = { 
  debug: console.debug, 
  info: console.info, 
  warn: console.warn, 
  error: console.error, 
  trace: console.trace 
};

beforeEach(() => {
  // Replace console methods with mocks
  console.debug = mockConsole.debug;
  console.info = mockConsole.info;
  console.warn = mockConsole.warn;
  console.error = mockConsole.error;
  console.trace = mockConsole.trace;
});

afterEach(() => {
  jest.clearAllMocks();
  // Restore console methods
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.trace = originalConsole.trace;
});

describe('NotificationLogger', () => {
  const mockServer: any = {
    notify: jest.fn(),
  };

  test('should call base logger and send notification for debug', () => {
    const logger = createNotificationLogger(mockServer, 'test-component');
    logger.debug('Debug message', { detail: 'value' });
    
    expect(mockConsole.debug).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'debug',
      'Debug message',
      'test-component',
      { detail: 'value' }
    );
  });

  test('should call base logger and send notification for info', () => {
    const logger = createNotificationLogger(mockServer, 'test-component');
    logger.info('Info message', { detail: 'value' });
    
    expect(mockConsole.info).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'info',
      'Info message',
      'test-component',
      { detail: 'value' }
    );
  });

  test('should call base logger and send notification for warn', () => {
    const logger = createNotificationLogger(mockServer, 'test-component');
    logger.warn('Warning message', { detail: 'value' });
    
    expect(mockConsole.warn).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'warning',
      'Warning message',
      'test-component',
      { detail: 'value' }
    );
  });

  test('should call base logger and send notification for error', () => {
    const logger = createNotificationLogger(mockServer, 'test-component');
    logger.error('Error message', { detail: 'value' });
    
    expect(mockConsole.error).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'error',
      'Error message',
      'test-component',
      { detail: 'value' }
    );
  });

  test('should create child loggers with combined component names', () => {
    const logger = createNotificationLogger(mockServer, 'parent');
    const childLogger = logger.child({ component: 'child' });
    
    childLogger.info('Child message');
    
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'info',
      'Child message',
      'parent:child',
      undefined
    );
  });

  test('should handle RFC 5424 levels not in base logger', () => {
    const logger = createNotificationLogger(mockServer);
    
    if (logger.notice) {
      logger.notice('Notice message');
    }
    expect(mockConsole.info).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'notice',
      'Notice message',
      undefined,
      undefined
    );
    
    if (logger.critical) {
      logger.critical('Critical message');
    }
    expect(mockConsole.error).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'critical',
      'Critical message',
      undefined,
      undefined
    );
    
    if (logger.alert) {
      logger.alert('Alert message');
    }
    expect(mockConsole.error).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'alert',
      'Alert message',
      undefined,
      undefined
    );
    
    if (logger.emergency) {
      logger.emergency('Emergency message');
    }
    expect(mockConsole.error).toHaveBeenCalled();
    expect(sendLogNotification).toHaveBeenCalledWith(
      mockServer,
      'emergency',
      'Emergency message',
      undefined,
      undefined
    );
  });
});