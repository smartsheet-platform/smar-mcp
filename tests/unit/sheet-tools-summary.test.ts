import { describe, test, expect, jest } from '@jest/globals';
import { getSheetTools } from '../../src/tools/smartsheet-sheet-tools.js';

describe('get_sheet_summary', () => {
  test('registers get_sheet_summary tool', async () => {
    const mockServer = {
      tool: jest.fn(),
    };
    const mockApi = {
      sheets: {
        getSheetSummary: jest.fn(),
      },
    };

    // Note: getSheetTools registers MANY tools. We just want to check our specific one.
    getSheetTools(mockServer as any, mockApi as any, false); // false = no delete tools

    // Verify registration
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_sheet_summary',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );

    // Find the handler
    const call = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'get_sheet_summary');
    const handler = call[3];

    // Mock API response
    const mockSummary = {
      id: 123,
      name: 'Project Plan',
      totalRowCount: 100,
      columns: [{ id: 1, title: 'Task Name', type: 'TEXT_NUMBER' }],
      rows: [{ id: 10, cells: [] }],
    };
    (mockApi.sheets.getSheetSummary as jest.Mock).mockResolvedValue(mockSummary);

    const result = await handler({ sheetId: '123' });

    // Check API call
    expect(mockApi.sheets.getSheetSummary).toHaveBeenCalledWith('123');

    // Check Tool Response
    const content = JSON.parse(result.content[0].text);
    expect(content.id).toBe(123);
    expect(content.name).toBe('Project Plan');
    expect(content.rows.length).toBe(1);
  });
});
