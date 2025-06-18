/**
 * Tests for the Smartsheet User tools
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { getUserTools } from '../tools/smartsheet-user-tools.js';

// Mock the SmartsheetAPI
jest.mock('../apis/smartsheet-api.js', () => {
  return {
    SmartsheetAPI: jest.fn().mockImplementation(() => ({
      users: {
        getCurrentUser: jest.fn(),
        getUserById: jest.fn(),
        listUsers: jest.fn(),
      },
      request: jest.fn(),
    })),
  };
});

describe('User Tools Tests', () => {
  let server: McpServer;
  let api: jest.Mocked<SmartsheetAPI>;

  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();

    // Create a new server instance for each test
    server = {
      tool: jest.fn(),
    } as unknown as McpServer;

    // Create a mocked API
    api = new SmartsheetAPI() as jest.Mocked<SmartsheetAPI>;
    
    // Mock the users object and its methods
    api.users = {
      getCurrentUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
    } as any;

    // Register the tools
    getUserTools(server, api);
  });

  describe('get_current_user tool', () => {
    it('should register get_current_user tool with the server', () => {
      // Verify the tool was registered
      expect(server.tool).toHaveBeenCalledWith(
        'get_current_user',
        'Gets the current user\'s information',
        expect.any(Function)
      );
    });

    it('should return current user data on success', async () => {
      // Get the handler function that was registered
      const handlerFn = (server.tool as jest.Mock).mock.calls.find(
        call => call[0] === 'get_current_user'
      )[2];

      // Mock successful response
      const mockUser = { 
        id: '123', 
        email: 'test@example.com', 
        firstName: 'Test', 
        lastName: 'User' 
      };
      
      (api.users.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

      // Call the handler
      const result = await handlerFn();

      // Verify the API was called
      expect(api.users.getCurrentUser).toHaveBeenCalledTimes(1);

      // Verify the response format
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockUser, null, 2)
          }
        ]
      });
    });

    it('should return error response when API call fails', async () => {
      // Get the handler function that was registered
      const handlerFn = (server.tool as jest.Mock).mock.calls.find(
        call => call[0] === 'get_current_user'
      )[2];

      // Mock error response
      const errorMessage = 'API error';
      (api.users.getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Call the handler
      const result = await handlerFn();

      // Verify the API was called
      expect(api.users.getCurrentUser).toHaveBeenCalledTimes(1);

      // Verify the error response format
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: `Failed to get current user: ${errorMessage}`
          }
        ],
        isError: true
      });
    });
  });
});