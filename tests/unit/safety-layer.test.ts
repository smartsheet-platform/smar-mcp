import { describe, test, expect, jest } from '@jest/globals';
import { getSheetTools } from '../../src/tools/smartsheet-sheet-tools.js';

describe('Safety Layer', () => {
  describe('Safe Mode (Bulk Delete)', () => {
    test('BLOCKS bulk delete when Safe Mode is ON', async () => {
      const mockServer = { tool: jest.fn() };
      const mockApi = { sheets: { deleteRows: jest.fn() } };
      const allowDelete = true;
      const safeMode = true;

      getSheetTools(mockServer as any, mockApi as any, allowDelete, safeMode);
      const handler = (mockServer.tool as any).mock.calls.find(
        (c: any) => c[0] === 'delete_rows',
      )[3];

      const result = await handler({ sheetId: '123', rowIds: ['1', '2'] });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Bulk delete is disabled in Safe Mode');
      expect(mockApi.sheets.deleteRows).not.toHaveBeenCalled();
    });

    test('ALLOWS single row delete when Safe Mode is ON', async () => {
      const mockServer = { tool: jest.fn() };
      const mockApi = {
        sheets: {
          deleteRows: jest.fn().mockResolvedValue({ resultCode: 0 }) as unknown as jest.Mock,
        },
      };
      const allowDelete = true;
      const safeMode = true;

      getSheetTools(mockServer as any, mockApi as any, allowDelete, safeMode);
      const handler = (mockServer.tool as any).mock.calls.find(
        (c: any) => c[0] === 'delete_rows',
      )[3];

      const result = await handler({ sheetId: '123', rowIds: ['1'] });

      expect(result.isError).toBeUndefined();
      expect(mockApi.sheets.deleteRows).toHaveBeenCalledWith('123', ['1'], undefined);
    });

    test('ALLOWS bulk delete when Safe Mode is OFF', async () => {
      const mockServer = { tool: jest.fn() };
      const mockApi = {
        sheets: {
          deleteRows: jest.fn().mockResolvedValue({ resultCode: 0 }) as unknown as jest.Mock,
        },
      };
      const allowDelete = true;
      const safeMode = false;

      getSheetTools(mockServer as any, mockApi as any, allowDelete, safeMode);
      const handler = (mockServer.tool as any).mock.calls.find(
        (c: any) => c[0] === 'delete_rows',
      )[3];

      const result = await handler({ sheetId: '123', rowIds: ['1', '2'] });

      expect(result.isError).toBeUndefined();
      expect(mockApi.sheets.deleteRows).toHaveBeenCalledWith('123', ['1', '2'], undefined);
    });
  });

  describe('Dry Run', () => {
    test('Returns simulated success for add_rows', async () => {
      const mockServer = { tool: jest.fn() };
      const mockApi = { sheets: { addRows: jest.fn() } };
      const safeMode = true;

      getSheetTools(mockServer as any, mockApi as any, false, safeMode); // allowDelete irrelevant
      const handler = (mockServer.tool as any).mock.calls.find((c: any) => c[0] === 'add_rows')[3];

      const result = await handler({ sheetId: '123', rows: [{ cells: [] }], dry_run: true });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('[Dry Run]');
      expect(mockApi.sheets.addRows).not.toHaveBeenCalled();
    });

    test('Returns simulated success for delete_rows', async () => {
      const mockServer = { tool: jest.fn() };
      const mockApi = { sheets: { deleteRows: jest.fn() } };
      const allowDelete = true;
      const safeMode = true; // Even in safe mode, dry run should simulate?
      // Actually, safe mode check happens BEFORE dry run in implementation?
      // "If Safe Mode ON and Bulk Delete -> Block". Yes, blocks even dry run for safety clarity, or should simulated bulk delete be allowed?
      // Implementation: Block check is first. So verify blocked first.

      getSheetTools(mockServer as any, mockApi as any, allowDelete, safeMode);
      const handler = (mockServer.tool as any).mock.calls.find(
        (c: any) => c[0] === 'delete_rows',
      )[3];

      // 1. Bulk Delete Dry Run (Safe Mode ON) -> Should still BLOCK (security first)
      const resultBlocked = await handler({ sheetId: '123', rowIds: ['1', '2'], dry_run: true });
      expect(resultBlocked.isError).toBe(true);

      // 2. Single Delete Dry Run -> Should Simulate
      const resultSimulated = await handler({ sheetId: '123', rowIds: ['1'], dry_run: true });
      expect(resultSimulated.content[0].text).toContain('[Dry Run]');
      expect(mockApi.sheets.deleteRows).not.toHaveBeenCalled();
    });
  });
});
