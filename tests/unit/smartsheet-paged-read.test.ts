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
    getAllRows: jest.fn(), // get_sheet uses this for limit: -1
  },
} as unknown as SmartsheetAPI;

describe('get_sheet tool pagination', () => {
  let toolCallback: (args: any) => Promise<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-register tools to capture the callback
    getSheetTools(mockServer, mockApi, false, true);
    // Find the 'get_sheet' tool registration
    const call = (mockServer.tool as jest.Mock).mock.calls.find((args) => args[0] === 'get_sheet');
    if (call) {
      toolCallback = call[3];
    }
  });

  it('should call getSheet with correct page and pageSize', async () => {
    (mockApi.sheets.getSheet as jest.Mock).mockResolvedValue({
      id: 'sheet-1',
      rows: [],
    });

    await toolCallback({
      sheetId: 'sheet-1',
      page: 2,
      pageSize: 25,
    });

    expect(mockApi.sheets.getSheet).toHaveBeenCalledWith(
      'sheet-1',
      undefined,
      undefined,
      25, // limit/pageSize
      2, // page
    );
  });

  it('should use limit as pageSize', async () => {
    (mockApi.sheets.getSheet as jest.Mock).mockResolvedValue({
      id: 'sheet-1',
      rows: [],
    });

    await toolCallback({
      sheetId: 'sheet-1',
      limit: 10,
    });

    expect(mockApi.sheets.getSheet).toHaveBeenCalledWith(
      'sheet-1',
      undefined,
      undefined,
      10, // effectivePageSize
      1, // effectivePage (default)
    );
  });

  it('should default to page 1 and size 50 if unspecified', async () => {
    (mockApi.sheets.getSheet as jest.Mock).mockResolvedValue({
      id: 'sheet-1',
      rows: [],
    });

    await toolCallback({
      sheetId: 'sheet-1',
    });

    expect(mockApi.sheets.getSheet).toHaveBeenCalledWith(
      'sheet-1',
      undefined,
      undefined,
      50, // default limit
      1, // default page
    );
  });
});
