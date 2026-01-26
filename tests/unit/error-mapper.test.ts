import { describe, test, expect } from '@jest/globals';
import { SmartsheetErrorMapper } from '../../src/utils/error-mapper.js';

describe('SmartsheetErrorMapper', () => {
  test('maps 4004 Row Not Found correctly', () => {
    const error = {
      response: {
        status: 404,
        data: {
          errorCode: 4004,
          message: 'Row not found',
        },
      },
    };
    const message = SmartsheetErrorMapper.getErrorMessage(error);
    expect(message).toContain('Row Not Found');
    expect(message).toContain('specified row ID');
  });

  test('formats MCP error response', () => {
    const error = { message: 'Some internal error' };
    const formatted = SmartsheetErrorMapper.formatError(error);
    expect(formatted.isError).toBe(true);
    expect(formatted.content[0].text).toContain('Some internal error');
  });

  test('handles null/undefined gracefully', () => {
    expect(SmartsheetErrorMapper.getErrorMessage(null)).toContain('Null/Undefined');
    expect(SmartsheetErrorMapper.getErrorMessage(undefined)).toContain('Null/Undefined');
  });

  test('handles string errors', () => {
    expect(SmartsheetErrorMapper.getErrorMessage('Just a string error')).toBe(
      'Just a string error',
    );
  });
});
