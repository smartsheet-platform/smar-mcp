import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { SmartsheetAPI } from "../apis/smartsheet-api";

type RequestHandlerExtra = {
  signal: AbortSignal;
};

// Mock the MCP server
jest.mock("@modelcontextprotocol/sdk/server/mcp", () => {
  const mockTool = jest.fn();
  return {
    McpServer: jest.fn().mockImplementation(() => ({
      tool: mockTool,
      connect: jest.fn(),
      name: 'smartsheet',
      version: '1.0.0'
    }))
  };
});

// Mock the StdioServerTransport
jest.mock("@modelcontextprotocol/sdk/server/stdio", () => ({
  StdioServerTransport: jest.fn()
}));

// Mock the SmartsheetAPI
jest.mock("../apis/smartsheet-api", () => {
  const mockApi = {
    sheets: {
      getSheet: jest.fn(),
      getSheetVersion: jest.fn(),
      getCellHistory: jest.fn(),
      updateRows: jest.fn(),
      addRows: jest.fn(),
      deleteRows: jest.fn(),
      getSheetLocation: jest.fn(),
      copySheet: jest.fn(),
      createSheet: jest.fn(),
      getSheetDiscussions: jest.fn(),
      createRowDiscussion: jest.fn(),
      createUpdateRequest: jest.fn()
    },
    workspaces: {
      getWorkspaces: jest.fn(),
      getWorkspace: jest.fn(),
      createWorkspace: jest.fn(),
      createWorkspaceFolder: jest.fn()
    },
    folders: {
      getFolder: jest.fn(),
      createFolder: jest.fn()
    },
    users: {
      getCurrentUser: jest.fn(),
      getUserById: jest.fn()
    }
  };
  return {
    SmartsheetAPI: jest.fn(() => mockApi)
  };
});

describe('Smartsheet MCP Server', () => {
  let server: jest.Mocked<McpServer>;
  let api: jest.Mocked<SmartsheetAPI>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import the index file to trigger tool registrations
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Get the mocked instances
    server = new McpServer({} as any) as jest.Mocked<McpServer>;
    api = new SmartsheetAPI('dummy-token') as jest.Mocked<SmartsheetAPI>;
  });

  const mockExtra: RequestHandlerExtra = {
    signal: new AbortController().signal
  };

  describe('Tool Registration', () => {
    it('should register all tools with correct names and schemas', () => {
      const registeredTools = (server.tool as jest.Mock).mock.calls.map(call => ({
        name: call[0],
        description: call[1]
      }));

      // Verify core tools are registered
      expect(registeredTools).toContainEqual({
        name: 'get_sheet',
        description: 'Retrieves the current state of a sheet, including rows, columns, and cells'
      });

      expect(registeredTools).toContainEqual({
        name: 'get_sheet_version',
        description: 'Gets the current version number of a sheet'
      });

      expect(registeredTools).toContainEqual({
        name: 'get_cell_history',
        description: 'Retrieves the history of changes for a specific cell'
      });

      // ... and so on for other tools
    });

    it('should only register delete_rows when ALLOW_DELETE_TOOLS is true', () => {
      const originalEnv = process.env.ALLOW_DELETE_TOOLS;
      
      // Test with delete tools disabled
      process.env.ALLOW_DELETE_TOOLS = 'false';
      jest.isolateModules(() => {
        require('../index');
      });
      const disabledCalls = server.tool.mock.calls;
      const hasDeleteRowsDisabled = (server.tool as jest.Mock).mock.calls.some(call => call[0] === 'delete_rows');
      expect(hasDeleteRowsDisabled).toBe(false);

      // Test with delete tools enabled
      process.env.ALLOW_DELETE_TOOLS = 'true';
      jest.isolateModules(() => {
        require('../index');
      });
      const enabledCalls = server.tool.mock.calls;
      const hasDeleteRowsEnabled = (server.tool as jest.Mock).mock.calls.some(call => call[0] === 'delete_rows');
      expect(hasDeleteRowsEnabled).toBe(true);

      // Restore original env
      process.env.ALLOW_DELETE_TOOLS = originalEnv;
    });
  });

  describe('Tool Handlers', () => {
    describe('get_sheet', () => {
      it('should handle successful sheet retrieval', async () => {
        const mockSheet = { id: '123', name: 'Test Sheet' };
        (api.sheets.getSheet as jest.Mock).mockResolvedValueOnce(mockSheet);

        const handler = server.tool.mock.calls.find(call => call[0] === 'get_sheet')?.[3];
        if (!handler) throw new Error('Handler not found');

        const result = await handler({ sheetId: '123', include: 'format,formulas' }, mockExtra);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: JSON.stringify(mockSheet, null, 2)
          }]
        });
      });

      it('should handle errors gracefully', async () => {
        const error = new Error('API Error');
        (api.sheets.getSheet as jest.Mock).mockRejectedValueOnce(error);

        const handler = server.tool.mock.calls.find(call => call[0] === 'get_sheet')?.[3];
        if (!handler) throw new Error('Handler not found');

        const result = await handler({ sheetId: '123' }, mockExtra);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Failed to get sheet: API Error'
          }],
          isError: true
        });
      });
    });

    describe('create_workspace', () => {
      it('should handle successful workspace creation', async () => {
        const mockWorkspace = { id: '456', name: 'New Workspace' };
        (api.workspaces.createWorkspace as jest.Mock).mockResolvedValueOnce(mockWorkspace);

        const handler = server.tool.mock.calls.find(call => call[0] === 'create_workspace')?.[3];
        if (!handler) throw new Error('Handler not found');

        const result = await handler({ workspaceName: 'New Workspace' });
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: JSON.stringify(mockWorkspace, null, 2)
          }]
        });
      });

      it('should handle errors gracefully', async () => {
        const error = new Error('API Error');
        (api.workspaces.createWorkspace as jest.Mock).mockRejectedValueOnce(error);

        const handler = server.tool.mock.calls.find(call => call[0] === 'create_workspace')?.[3];
        if (!handler) throw new Error('Handler not found');

        const result = await handler({ workspaceName: 'New Workspace' });
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Failed to create_workspace: API Error'
          }],
          isError: true
        });
      });
    });

    describe('create_update_request', () => {
      it('should handle successful update request creation', async () => {
        const mockResponse = { id: '789', sent: true };
        (api.sheets.createUpdateRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

        const handler = server.tool.mock.calls.find(call => call[0] === 'create_update_request')?.[3];
        if (!handler) throw new Error('Handler not found');

        const result = await handler({
          sheetId: '123',
          rowIds: [1, 2],
          sendTo: [{ email: 'test@example.com' }]
        }, mockExtra);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: JSON.stringify(mockResponse, null, 2)
          }]
        });
      });
    });
  });

  describe('Server Initialization', () => {
    it('should initialize with correct configuration', () => {
      const serverConfig = (McpServer as jest.Mock).mock.calls[0][0];
      
      expect(serverConfig).toEqual({
        name: 'smartsheet',
        version: '1.0.0'
      });
    });
  });
});
