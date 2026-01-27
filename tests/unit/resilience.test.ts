import { SmartsheetAPI } from '../../src/apis/smartsheet-api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe('SmartsheetAPI Resilience & Queue', () => {
  let api: SmartsheetAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMARTSHEET_API_KEY = 'test-token';
    process.env.SMARTSHEET_ENDPOINT = 'https://api.test';
    api = new SmartsheetAPI('test-token', 'https://api.test');
  });

  it('should pass through successful requests', async () => {
    mockedAxios.mockResolvedValue({ data: { success: true } });
    const result = await api.request('GET', '/test');
    expect(result).toEqual({ success: true });
    expect(mockedAxios).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 Too Many Requests', async () => {
    mockedAxios
      .mockRejectedValueOnce({
        response: { status: 429, headers: { 'retry-after': '0' } },
        message: 'Rate Limited',
      })
      .mockResolvedValue({ data: { success: true } });

    const result = await api.request('GET', '/test');
    expect(result).toEqual({ success: true });
    expect(mockedAxios).toHaveBeenCalledTimes(2);
  });

  it('should retry on 503 Service Unavailable', async () => {
    mockedAxios
      .mockRejectedValueOnce({
        response: { status: 503 },
        message: 'Service Unavailable',
      })
      .mockResolvedValue({ data: { success: true } });

    const result = await api.request('GET', '/test');
    expect(result).toEqual({ success: true });
    expect(mockedAxios).toHaveBeenCalledTimes(2);
  });

  it('should fail immediately on 400 Bad Request', async () => {
    mockedAxios.mockRejectedValue({
      response: { status: 400, data: { errorCode: 1001, detail: 'bad' } },
      message: 'Bad Request',
    });

    await expect(api.request('GET', '/test')).rejects.toThrow();
    expect(mockedAxios).toHaveBeenCalledTimes(1);
  });

  it('should fail after max retries', async () => {
    mockedAxios.mockRejectedValue({
      response: { status: 429, headers: { 'retry-after': '0' } },
      message: 'Rate Limited',
    });

    await expect(api.request('GET', '/test')).rejects.toThrow();
    expect(mockedAxios).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });
});
