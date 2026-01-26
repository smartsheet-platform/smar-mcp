import { describe, test, expect, jest } from '@jest/globals';
import { getSearchTools } from '../../src/tools/smartsheet-search-tools.js';

describe('search_sheets', () => {
  test('registers search_sheets tool', async () => {
    const mockServer = {
      tool: jest.fn(),
    };
    const mockApi = {
      search: {
        searchSheets: jest.fn(),
      },
    };

    getSearchTools(mockServer as any, mockApi as any);

    // Verify registration
    expect(mockServer.tool).toHaveBeenCalledWith(
      'search_sheets',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );

    // Verify handler logic
    const handler = (mockServer.tool as any).mock.calls.find(
      (c: any) => c[0] === 'search_sheets',
    )[3];

    // Mock API response
    (mockApi.search.searchSheets as unknown as jest.Mock).mockResolvedValue({
      totalCount: 1,
      results: [{ id: 123, name: 'Test Sheet', permalink: 'https://...', objectType: 'sheet' }],
    });

    const result = await handler({ query: 'Test' });

    // Check API call
    expect(mockApi.search.searchSheets).toHaveBeenCalledWith('Test');

    // Check Tool Response
    const content = JSON.parse(result.content[0].text);
    expect(content.totalCount).toBe(1);
    expect(content.results[0].name).toBe('Test Sheet');
    expect(content.results[0].id).toBe(123);
  });
});
