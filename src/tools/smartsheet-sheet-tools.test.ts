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
      getSheetTools(server, api, true);
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
      getSheetTools(server, api, false);
      expect(toolCallbacks.has('delete_rows')).toBe(false);
      expect(toolCallbacks.has('get_sheet')).toBe(true);
    });
  });

  describe('Tool Logic', () => {
    beforeEach(() => {
      // Register tools for logic testing
      getSheetTools(server, api, true);
    });

    describe('get_sheet', () => {
      it('should call api.sheets.getSheet with correct params', async () => {
        const callback = toolCallbacks.get('get_sheet')!;
        (api.sheets.getSheet as jest.Mock).mockResolvedValue({ id: '123', name: 'Test Sheet' });

        const result = await callback({ sheetId: '123', include: 'format' });

        expect(api.sheets.getSheet).toHaveBeenCalledWith(
          '123',
          'format',
          undefined,
          undefined,
          undefined,
        );
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
  });
});
