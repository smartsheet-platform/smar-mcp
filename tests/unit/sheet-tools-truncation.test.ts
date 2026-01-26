import { describe, test, expect, jest } from '@jest/globals';
import { getSheetTools } from '../../src/tools/smartsheet-sheet-tools.js';

describe('get_sheet truncation', () => {
  test('uses default limit of 50 when limit is undefined', async () => {
    const mockServer = { tool: jest.fn() };
    const mockApi = {
      sheets: {
        getSheet: jest.fn(),
      },
    };

    getSheetTools(mockServer as any, mockApi as any, false);
    const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'get_sheet')[3];

    (mockApi.sheets.getSheet as jest.Mock).mockResolvedValue({ id: 123, rows: [] });

    await handler({ sheetId: '123' });

    expect(mockApi.sheets.getSheet).toHaveBeenCalledWith(
      '123',
      undefined,
      undefined,
      50,
      1, // Expect pageSize=50, page=1
    );
  });

  test('uses specific limit', async () => {
    const mockServer = { tool: jest.fn() };
    const mockApi = {
      sheets: {
        getSheet: jest.fn(),
      },
    };

    getSheetTools(mockServer as any, mockApi as any, false);
    const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'get_sheet')[3];

    (mockApi.sheets.getSheet as jest.Mock).mockResolvedValue({ id: 123, rows: [] });

    await handler({ sheetId: '123', limit: 10 });

    expect(mockApi.sheets.getSheet).toHaveBeenCalledWith(
      '123',
      undefined,
      undefined,
      10,
      1, // Expect pageSize=10
    );
  });

  test('calls getAllRows when limit is -1', async () => {
    const mockServer = { tool: jest.fn() };
    const mockApi = {
      sheets: {
        getAllRows: jest.fn(),
      },
    };

    getSheetTools(mockServer as any, mockApi as any, false);
    const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'get_sheet')[3];

    (mockApi.sheets.getAllRows as jest.Mock).mockResolvedValue({ id: 123, rows: [] });

    await handler({ sheetId: '123', limit: -1 });

    expect(mockApi.sheets.getAllRows).toHaveBeenCalledWith('123', undefined);
  });
});
