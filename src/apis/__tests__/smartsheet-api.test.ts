import axios from 'axios';

jest.mock('../../../package.json', () => ({ version: '0.0.0-test' }), { virtual: true });

import { SmartsheetAPI } from '../smartsheet-api.js';

jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

const TEST_TOKEN = 'test-secret-token-12345';
const TEST_BASE_URL = 'https://api.smartsheet.com/2.0';

function createAPI(): SmartsheetAPI {
  return new SmartsheetAPI(TEST_TOKEN, TEST_BASE_URL);
}

describe('SmartsheetAPI - HTTPS enforcement', () => {
  it('should reject HTTP base URLs', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'http://api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should accept HTTPS base URLs', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'https://api.smartsheet.com/2.0'))
      .not.toThrow();
  });

  it('should reject non-URL base URLs', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'ftp://api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should reject uppercase HTTP scheme', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'HTTP://api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should reject mixed-case HTTPS scheme (not canonical)', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'Https://api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should reject a bare domain without scheme', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should reject a URL with https embedded but not as the scheme', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'http://https://api.smartsheet.com/2.0'))
      .toThrow('SMARTSHEET_ENDPOINT must use HTTPS');
  });

  it('should reject missing endpoint (empty string triggers different error)', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, ''))
      .toThrow('SMARTSHEET_ENDPOINT environment variable is not set');
  });

  it('should reject undefined endpoint', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, undefined))
      .toThrow('SMARTSHEET_ENDPOINT environment variable is not set');
  });

  it('should accept HTTPS URLs with ports', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'https://api.smartsheet.com:443/2.0'))
      .not.toThrow();
  });

  it('should accept HTTPS URLs with custom paths', () => {
    expect(() => new SmartsheetAPI(TEST_TOKEN, 'https://proxy.internal/smartsheet/2.0'))
      .not.toThrow();
  });
});

describe('SmartsheetAPI - token leakage prevention', () => {
  let errorSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });

  describe('error logging sanitization', () => {
    it('should not log Authorization header in error output', async () => {
      const axiosError = {
        message: 'Request failed with status code 500',
        config: {
          headers: {
            Authorization: `Bearer ${TEST_TOKEN}`,
          },
        },
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
          headers: {},
        },
      };
      mockedAxios.mockRejectedValueOnce(axiosError);

      const api = createAPI();
      await expect(api.request('GET', '/sheets')).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalled();
      const loggedArgs = JSON.stringify(errorSpy.mock.calls);
      expect(loggedArgs).not.toContain(TEST_TOKEN);
      expect(loggedArgs).not.toContain('Authorization');
    });

    it('should log only message, status, and data in error output', async () => {
      const axiosError = {
        message: 'Not Found',
        config: {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` },
          url: `${TEST_BASE_URL}/sheets/123`,
        },
        response: {
          status: 404,
          data: { message: 'Sheet not found', errorCode: 1006 },
          headers: {},
        },
      };
      mockedAxios.mockRejectedValueOnce(axiosError);

      const api = createAPI();
      await expect(api.request('GET', '/sheets/123')).rejects.toThrow();

      const sanitizedArg = errorSpy.mock.calls[0][1];
      expect(Object.keys(sanitizedArg)).toEqual(['message', 'status', 'data']);
      expect(sanitizedArg.message).toBe('Not Found');
      expect(sanitizedArg.status).toBe(404);
      expect(sanitizedArg.data).toEqual({ message: 'Sheet not found', errorCode: 1006 });
    });

    it('should not leak token when error has no response', async () => {
      const networkError = {
        message: 'Network Error',
        config: {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        },
      };
      mockedAxios.mockRejectedValueOnce(networkError);

      const api = createAPI();
      await expect(api.request('GET', '/sheets')).rejects.toThrow();

      const loggedArgs = JSON.stringify(errorSpy.mock.calls);
      expect(loggedArgs).not.toContain(TEST_TOKEN);
    });
  });

  describe('request logging sanitization', () => {
    it('should log only the endpoint path, not the full URL', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { results: [] } });

      const api = createAPI();
      await api.request('GET', '/search', undefined, { query: 'sensitive-data' });

      expect(infoSpy).toHaveBeenCalledWith('API Request: GET /search');
    });

    it('should not log query parameters', async () => {
      mockedAxios.mockResolvedValueOnce({ data: {} });

      const api = createAPI();
      await api.request('GET', '/sheets', undefined, {
        accessApiLevel: '2',
        include: 'attachments'
      });

      const loggedArgs = JSON.stringify(infoSpy.mock.calls);
      expect(loggedArgs).not.toContain('accessApiLevel');
      expect(loggedArgs).not.toContain('attachments');
    });

    it('should not log the base URL', async () => {
      mockedAxios.mockResolvedValueOnce({ data: {} });

      const api = createAPI();
      await api.request('GET', '/sheets');

      const loggedArgs = JSON.stringify(infoSpy.mock.calls);
      expect(loggedArgs).not.toContain(TEST_BASE_URL);
    });
  });
});
