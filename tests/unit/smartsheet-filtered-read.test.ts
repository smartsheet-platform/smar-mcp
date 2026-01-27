import { getSheetTools } from '../../src/tools/smartsheet-sheet-tools';
import { SmartsheetAPI } from '../../src/apis/smartsheet-api';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Mock McpServer
const mockServer = {
  tool: jest.fn(),
} as unknown as McpServer;

// Mock SmartsheetAPI
const mockApi = {
  sheets: {
    getSheet: jest.fn(),
    getAllRows: jest.fn(),
  },
} as unknown as SmartsheetAPI;

describe('get_sheet_filtered tool', () => {
  let toolCallback: (args: any) => Promise<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-register tools to capture the callback
    getSheetTools(mockServer, mockApi, false, true);
    // Find the 'get_sheet_filtered' tool registration
    const call = (mockServer.tool as jest.Mock).mock.calls.find(
      (args) => args[0] === 'get_sheet_filtered',
    );
    if (call) {
      toolCallback = call[3];
    }
  });

  it('should be registered', () => {
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_sheet_filtered',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it('should filter rows by a single column exact match', async () => {
    const mockSheet = {
      id: 'sheet-1',
      name: 'Test Sheet',
      columns: [
        { id: 101, title: 'Status', type: 'TEXT_NUMBER' },
        { id: 102, title: 'Title', type: 'TEXT_NUMBER' },
      ],
      rows: [
        {
          id: 'row-1',
          cells: [
            { columnId: 101, value: 'Open' },
            { columnId: 102, value: 'Task 1' },
          ],
        },
        {
          id: 'row-2',
          cells: [
            { columnId: 101, value: 'Closed' },
            { columnId: 102, value: 'Task 2' },
          ],
        },
        {
          id: 'row-3',
          cells: [
            { columnId: 101, value: 'Open' },
            { columnId: 102, value: 'Task 3' },
          ],
        },
      ],
    };

    (mockApi.sheets.getAllRows as jest.Mock).mockResolvedValue(mockSheet);

    const result = await toolCallback({
      sheetId: 'sheet-1',
      filter: { Status: 'Open' },
    });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.length).toBe(2);
    expect(content[0].id).toBe('row-1');
    expect(content[1].id).toBe('row-3');
  });

  it('should filter rows case-insensitively', async () => {
    const mockSheet = {
      id: 'sheet-1',
      name: 'Test Sheet',
      columns: [{ id: 101, title: 'Status', type: 'TEXT_NUMBER' }],
      rows: [
        { id: 'row-1', cells: [{ columnId: 101, value: 'Open' }] },
        { id: 'row-2', cells: [{ columnId: 101, value: 'open' }] },
        { id: 'row-3', cells: [{ columnId: 101, value: 'OPEN' }] },
        { id: 'row-4', cells: [{ columnId: 101, value: 'Closed' }] },
      ],
    };

    (mockApi.sheets.getAllRows as jest.Mock).mockResolvedValue(mockSheet);

    const result = await toolCallback({
      sheetId: 'sheet-1',
      filter: { Status: 'Open' },
    });

    const content = JSON.parse(result.content[0].text);
    expect(content.length).toBe(3);
  });

  it('should return empty list if no matches found', async () => {
    const mockSheet = {
      id: 'sheet-1',
      name: 'Test Sheet',
      columns: [{ id: 101, title: 'Status', type: 'TEXT_NUMBER' }],
      rows: [{ id: 'row-1', cells: [{ columnId: 101, value: 'Closed' }] }],
    };

    (mockApi.sheets.getAllRows as jest.Mock).mockResolvedValue(mockSheet);

    const result = await toolCallback({
      sheetId: 'sheet-1',
      filter: { Status: 'Open' },
    });

    const content = JSON.parse(result.content[0].text);
    expect(content.length).toBe(0);
  });

  it('should return error if column not found', async () => {
    const mockSheet = {
      id: 'sheet-1',
      name: 'Test Sheet',
      columns: [{ id: 101, title: 'Status', type: 'TEXT_NUMBER' }],
      rows: [],
    };

    (mockApi.sheets.getAllRows as jest.Mock).mockResolvedValue(mockSheet);

    const result = await toolCallback({
      sheetId: 'sheet-1',
      filter: { Priority: 'High' }, // Column does not exist
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Column 'Priority' not found");
  });
});
