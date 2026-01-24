import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { getSheetTools } from './smartsheet-sheet-tools.js';

describe('getSheetTools', () => {
  let server: McpServer;
  let api: SmartsheetAPI;

  beforeEach(() => {
    server = new McpServer({ name: 'test', version: '1.0.0' });
    api = new SmartsheetAPI('test_key');
  });

  it('should not register delete_rows tool if allowDeleteTools is false', () => {
    getSheetTools(server, api, false);
    expect(server.getTool('delete_rows')).toBeUndefined();
  });

  it('should register delete_rows tool if allowDeleteTools is true', () => {
    getSheetTools(server, api, true);
    expect(server.getTool('delete_rows')).toBeDefined();
  });
});
