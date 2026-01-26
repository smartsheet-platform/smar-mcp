import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { getSheetTools } from './smartsheet-sheet-tools.js';

// Mock dependencies
jest.mock('@modelcontextprotocol/sdk/server/mcp.js');
jest.mock('../apis/smartsheet-api.js', () => ({
  SmartsheetAPI: jest.fn().mockImplementation(() => ({
    sheets: {
      getSheet: jest.fn(),
      getSheetByDirectIdToken: jest.fn(),
      getSheetVersion: jest.fn(),
      getCellHistory: jest.fn(),
      getRow: jest.fn(),
      updateRows: jest.fn(),
      addRows: jest.fn(),
      deleteRows: jest.fn(),
      getSheetLocation: jest.fn(),
      copySheet: jest.fn(),
      createSheet: jest.fn(),
      findRows: jest.fn(),
    },
  })),
}));

describe('getSheetTools', () => {
  let server: McpServer;
  let api: SmartsheetAPI;
  // eslint-disable-next-line @typescript-eslint/ban-types
  let toolCallbacks: Map<string, Function>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup server mock
    toolCallbacks = new Map();
    server = {
      tool: jest.fn().mockImplementation((name, description, schema, callback) => {
        toolCallbacks.set(name, callback);
      }),
      getTool: jest.fn(), // Placeholder if needed
    } as unknown as McpServer;

    // Setup API mock structure
    api = {
      sheets: {
        getSheet: jest.fn(),
        getSheetByDirectIdToken: jest.fn(),
        getSheetVersion: jest.fn(),
        getCellHistory: jest.fn(),
        getRow: jest.fn(),
        updateRows: jest.fn(),
        addRows: jest.fn(),
        deleteRows: jest.fn(),
        getSheetLocation: jest.fn(),
        copySheet: jest.fn(),
        createSheet: jest.fn(),
        findRows: jest.fn(),
      },
    } as unknown as SmartsheetAPI;
  });

  describe('Registration', () => {
    it('should register all tools when deletion is enabled', () => {
      getSheetTools(server, api, true, false);
      const expectedTools = [
        'get_sheet',
        'get_sheet_by_url',
        'get_sheet_version',
        'get_cell_history',
        'get_row',
        'update_rows',
        'add_rows',
        'delete_rows',
        'get_sheet_location',
        'copy_sheet',
        'create_sheet',
        'find_rows_by_column_value',
      ];
      expectedTools.forEach((tool) => {
        expect(server.tool).toHaveBeenCalledWith(
          tool,
          expect.any(String),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    it('should NOT register delete_rows when deletion is disabled', () => {
      getSheetTools(server, api, false, false);
      expect(toolCallbacks.has('delete_rows')).toBe(false);
      expect(toolCallbacks.has('get_sheet')).toBe(true);
    });
  });

  describe('Tool Logic', () => {
    beforeEach(() => {
      // Register tools for logic testing
      getSheetTools(server, api, true, false);
    });

    describe('get_sheet', () => {
      it('should call api.sheets.getSheet with correct params', async () => {
        const callback = toolCallbacks.get('get_sheet')!;
        (api.sheets.getSheet as jest.Mock).mockResolvedValue({ id: '123', name: 'Test Sheet' });

        const result = await callback({ sheetId: '123', include: 'format' });

        expect(api.sheets.getSheet).toHaveBeenCalledWith('123', 'format', undefined, 50, 1);
        expect(JSON.parse(result.content[0].text)).toEqual({ id: '123', name: 'Test Sheet' });
      });

      it('should return error content on failure', async () => {
        const callback = toolCallbacks.get('get_sheet')!;
        (api.sheets.getSheet as jest.Mock).mockRejectedValue(new Error('API Error'));

        const result = await callback({ sheetId: '123' });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Failed to get sheet: API Error');
      });
    });

    describe('get_sheet_by_url', () => {
      it('should extract directIdToken and call getSheetByDirectIdToken', async () => {
        const callback = toolCallbacks.get('get_sheet_by_url')!;
        (api.sheets.getSheetByDirectIdToken as jest.Mock).mockResolvedValue({ id: '123' });

        const url = 'https://app.smartsheet.com/sheets/abcdef123456?view=grid';
        await callback({ url });

        expect(api.sheets.getSheetByDirectIdToken).toHaveBeenCalledWith(
          'abcdef123456',
          undefined,
          undefined,
          undefined,
          undefined,
        );
      });

      it('should return error for invalid URL format', async () => {
        const callback = toolCallbacks.get('get_sheet_by_url')!;
        const url = 'https://google.com';
        const result = await callback({ url });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Invalid URL format');
      });
    });

    describe('copy_sheet', () => {
      it('should use explicit destinationFolderId if provided', async () => {
        const callback = toolCallbacks.get('copy_sheet')!;
        (api.sheets.copySheet as jest.Mock).mockResolvedValue({ result: 'success' });

        await callback({
          sheetId: '123',
          destinationName: 'Copy',
          destinationFolderId: '999',
        });

        expect(api.sheets.copySheet).toHaveBeenCalledWith('123', 'Copy', '999');
        expect(api.sheets.getSheetLocation).not.toHaveBeenCalled();
      });

      it('should fetch sheet location if destinationFolderId is missing', async () => {
        const callback = toolCallbacks.get('copy_sheet')!;
        (api.sheets.getSheetLocation as jest.Mock).mockResolvedValue({ folderId: '888' });
        (api.sheets.copySheet as jest.Mock).mockResolvedValue({ result: 'success' });

        await callback({ sheetId: '123', destinationName: 'Copy' });

        expect(api.sheets.getSheetLocation).toHaveBeenCalledWith('123');
        expect(api.sheets.copySheet).toHaveBeenCalledWith('123', 'Copy', '888');
      });

      it('should handle getSheetLocation failure gracefully', async () => {
        const callback = toolCallbacks.get('copy_sheet')!;
        (api.sheets.getSheetLocation as jest.Mock).mockRejectedValue(new Error('Loc Error'));
        (api.sheets.copySheet as jest.Mock).mockResolvedValue({ result: 'success' });

        await callback({ sheetId: '123', destinationName: 'Copy' });

        // Should still attempt copy with undefined folderId
        expect(api.sheets.copySheet).toHaveBeenCalledWith('123', 'Copy', undefined);
      });
    });

    describe('find_rows_by_column_value', () => {
      it('should call api.sheets.findRows', async () => {
        const callback = toolCallbacks.get('find_rows_by_column_value')!;
        (api.sheets.findRows as jest.Mock).mockResolvedValue([{ id: 'row1' }]);

        const result = await callback({
          sheetId: '123',
          columnId: 456,
          value: 'search_term',
        });

        expect(api.sheets.findRows).toHaveBeenCalledWith('123', 456, 'search_term');
        expect(JSON.parse(result.content[0].text)).toEqual([{ id: 'row1' }]);
      });
    });

    describe('add_rows - Story 2.2: Hierarchy Support', () => {
      it('should add rows with parentId for hierarchy', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        const mockResult = {
          resultCode: 0,
          message: 'SUCCESS',
          result: [{ id: 'newrow1' }],
        };
        (api.sheets.addRows as jest.Mock).mockResolvedValue(mockResult);

        const rows = [
          {
            cells: [
              { columnId: 123, value: 'Child Task' },
              { columnId: 456, value: 'In Progress' },
            ],
          },
        ];

        const result = await callback({
          sheetId: '999',
          rows,
          parentId: '888',
        });

        // Verify API called with parentId in options
        expect(api.sheets.addRows).toHaveBeenCalledWith('999', rows, {
          toTop: undefined,
          toBottom: undefined,
          parentId: '888',
          siblingId: undefined,
        });

        expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
      });

      it('should add rows with siblingId for positioning', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        (api.sheets.addRows as jest.Mock).mockResolvedValue({ resultCode: 0 });

        const rows = [{ cells: [{ columnId: 123, value: 'Sibling Task' }] }];

        await callback({
          sheetId: '999',
          rows,
          siblingId: '777',
        });

        expect(api.sheets.addRows).toHaveBeenCalledWith('999', rows, {
          toTop: undefined,
          toBottom: undefined,
          parentId: undefined,
          siblingId: '777',
        });
      });

      it('should add rows to top when toTop is true', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        (api.sheets.addRows as jest.Mock).mockResolvedValue({ resultCode: 0 });

        const rows = [{ cells: [{ columnId: 123, value: 'Top Task' }] }];

        await callback({
          sheetId: '999',
          rows,
          toTop: true,
        });

        expect(api.sheets.addRows).toHaveBeenCalledWith('999', rows, {
          toTop: true,
          toBottom: undefined,
          parentId: undefined,
          siblingId: undefined,
        });
      });

      it('should add rows to bottom when toBottom is true', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        (api.sheets.addRows as jest.Mock).mockResolvedValue({ resultCode: 0 });

        const rows = [{ cells: [{ columnId: 123, value: 'Bottom Task' }] }];

        await callback({
          sheetId: '999',
          rows,
          toBottom: true,
        });

        expect(api.sheets.addRows).toHaveBeenCalledWith('999', rows, {
          toTop: undefined,
          toBottom: true,
          parentId: undefined,
          siblingId: undefined,
        });
      });

      it('should support dry_run for add_rows', async () => {
        const callback = toolCallbacks.get('add_rows')!;

        const rows = [{ cells: [{ columnId: 123, value: 'Dry Run Task' }] }];

        const result = await callback({
          sheetId: '999',
          rows,
          parentId: '888',
          dry_run: true,
        });

        // Should NOT call API during dry run
        expect(api.sheets.addRows).not.toHaveBeenCalled();

        const response = JSON.parse(result.content[0].text);
        expect(response.message).toContain('[Dry Run]');
        expect(response.result).toEqual(rows);
      });

      it('should populate cells correctly with hierarchy', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        (api.sheets.addRows as jest.Mock).mockResolvedValue({
          resultCode: 0,
          result: [
            {
              id: 'newrow1',
              parentId: '888',
              cells: [
                { columnId: 123, value: 'Child Task', displayValue: 'Child Task' },
                { columnId: 456, value: 'Open', displayValue: 'Open' },
              ],
            },
          ],
        });

        const rows = [
          {
            cells: [
              { columnId: 123, value: 'Child Task' },
              { columnId: 456, value: 'Open' },
            ],
          },
        ];

        const result = await callback({
          sheetId: '999',
          rows,
          parentId: '888',
        });

        expect(api.sheets.addRows).toHaveBeenCalledWith('999', rows, {
          toTop: undefined,
          toBottom: undefined,
          parentId: '888',
          siblingId: undefined,
        });

        const response = JSON.parse(result.content[0].text);
        expect(response.result[0].parentId).toBe('888');
        expect(response.result[0].cells).toHaveLength(2);
      });

      it('should handle addRows API errors gracefully', async () => {
        const callback = toolCallbacks.get('add_rows')!;
        (api.sheets.addRows as jest.Mock).mockRejectedValue(new Error('Invalid parent ID'));

        const rows = [{ cells: [{ columnId: 123, value: 'Task' }] }];

        const result = await callback({
          sheetId: '999',
          rows,
          parentId: 'invalid',
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Failed to add rows: Invalid parent ID');
      });
    });
  });

  describe('Safe Mode - Story 2.1', () => {
    it('should block bulk delete in safe mode', async () => {
      getSheetTools(server, api, true, true); // safeMode = true
      const callback = toolCallbacks.get('delete_rows')!;

      const result = await callback({
        sheetId: '123',
        rowIds: ['1', '2', '3'],
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Bulk delete is disabled in Safe Mode');
      expect(api.sheets.deleteRows).not.toHaveBeenCalled();
    });

    it('should allow single row delete in safe mode', async () => {
      getSheetTools(server, api, true, true); // safeMode = true
      const callback = toolCallbacks.get('delete_rows')!;
      (api.sheets.deleteRows as jest.Mock).mockResolvedValue({ resultCode: 0 });

      const result = await callback({
        sheetId: '123',
        rowIds: ['1'],
      });

      expect(result.isError).toBeFalsy();
      expect(api.sheets.deleteRows).toHaveBeenCalledWith('123', ['1'], undefined);
    });

    it('should allow bulk delete when safe mode is disabled', async () => {
      getSheetTools(server, api, true, false); // safeMode = false
      const callback = toolCallbacks.get('delete_rows')!;
      (api.sheets.deleteRows as jest.Mock).mockResolvedValue({ resultCode: 0 });

      const result = await callback({
        sheetId: '123',
        rowIds: ['1', '2', '3'],
      });

      expect(result.isError).toBeFalsy();
      expect(api.sheets.deleteRows).toHaveBeenCalledWith('123', ['1', '2', '3'], undefined);
    });
  });
});
