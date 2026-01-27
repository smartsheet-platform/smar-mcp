import { describe, test, expect, jest } from '@jest/globals';
import { getSheetTools } from '../../src/tools/smartsheet-sheet-tools.js';

describe('add_rows hierarchy support', () => {
  test('passes parentId to API', async () => {
    const mockServer = { tool: jest.fn() };
    const mockApi: any = {
      sheets: {
        addRows: jest.fn().mockResolvedValue({ resultCode: 0 }),
      },
    };

    // Use safeMode=false to avoid dry run complexity unless specifically testing dry run
    getSheetTools(mockServer as any, mockApi as any, true, false);
    const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'add_rows')[3];

    await handler({
      sheetId: '123',
      rows: [{ cells: [] }],
      parentId: '987',
    });

    expect(mockApi.sheets.addRows).toHaveBeenCalledWith(
      '123',
      [{ cells: [] }],
      expect.objectContaining({ parentId: '987' }),
    );
  });

  test('passes siblingId to API', async () => {
    const mockServer = { tool: jest.fn() };
    const mockApi: any = {
      sheets: {
        addRows: jest.fn().mockResolvedValue({ resultCode: 0 }),
      },
    };

    getSheetTools(mockServer as any, mockApi as any, true, false);
    const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'add_rows')[3];

    await handler({
      sheetId: '123',
      rows: [{ cells: [] }],
      siblingId: '654',
    });

    expect(mockApi.sheets.addRows).toHaveBeenCalledWith(
      '123',
      [{ cells: [] }],
      expect.objectContaining({ siblingId: '654' }),
    );
  });
});
