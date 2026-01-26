import { describe, test, expect, jest } from '@jest/globals';
import { getDocsTools } from '../../src/tools/smartsheet-docs-tools.js';

describe('getDocsTools', () => {
  test('registers get_tool_docs tool', async () => {
    const mockServer = {
      tool: jest.fn(),
    };
    const mockApi = {};

    getDocsTools(mockServer as any, mockApi as any);

    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_tool_docs',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );

    // Verify content
    const handler = (mockServer.tool as any).mock.calls[0][3];
    const result = await handler();
    expect(result.content[0].text).toContain('find_rows');
    expect(result.content[0].text).toContain('add_rows');
  });
});
