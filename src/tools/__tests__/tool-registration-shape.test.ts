import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../../apis/smartsheet-api.js';
import { getUserTools } from '../smartsheet-user-tools.js';
import { getSheetTools } from '../smartsheet-sheet-tools.js';
import { getSearchTools } from '../smartsheet-search-tools.js';
import { getFolderTools } from '../smartsheet-folder-tools.js';
import { getWorkspaceTools } from '../smartsheet-workspace-tools.js';
import { getDiscussionTools } from '../smartsheet-discussion-tools.js';
import { getUpdateRequestTools } from '../smartsheet-update-request-tools.js';

jest.mock('../../apis/smartsheet-api.js');

/**
 * Anti-regression test: every server.tool() call must use the 4-arg signature
 * (name, description, inputSchema, handler).
 *
 * Calling server.tool(name, description, handler) without an inputSchema causes
 * the MCP SDK to register a tool with no/invalid JSON schema, which breaks
 * downstream consumers such as @langchain/core/tools (see issue #79). This test
 * captures every registration and asserts the third argument is an object
 * (the inputSchema map) rather than a function (the handler).
 */

type AnyArgs = unknown[];

interface CapturedRegistration {
  name: string;
  args: AnyArgs;
}

function captureFromRegistrar(register: (server: McpServer, api: SmartsheetAPI) => void): CapturedRegistration[] {
  const captured: CapturedRegistration[] = [];
  const mockServer = {
    tool: jest.fn((...args: AnyArgs) => {
      captured.push({ name: String(args[0]), args });
    }),
  } as unknown as McpServer;
  const mockApi = {} as SmartsheetAPI;
  register(mockServer, mockApi);
  return captured;
}

const TOOL_REGISTRARS: Array<{
  fileLabel: string;
  register: (server: McpServer, api: SmartsheetAPI) => void;
}> = [
  { fileLabel: 'smartsheet-user-tools', register: getUserTools },
  {
    fileLabel: 'smartsheet-sheet-tools',
    register: (s, a) => getSheetTools(s, a, false),
  },
  { fileLabel: 'smartsheet-search-tools', register: getSearchTools },
  { fileLabel: 'smartsheet-folder-tools', register: getFolderTools },
  { fileLabel: 'smartsheet-workspace-tools', register: getWorkspaceTools },
  { fileLabel: 'smartsheet-discussion-tools', register: getDiscussionTools },
  { fileLabel: 'smartsheet-update-request-tools', register: getUpdateRequestTools },
];

describe('server.tool() registrations have a valid input schema', () => {
  describe.each(TOOL_REGISTRARS)('$fileLabel', ({ register }) => {
    const registrations = captureFromRegistrar(register);

    it('registers at least one tool', () => {
      expect(registrations.length).toBeGreaterThan(0);
    });

    it.each(registrations.map((r) => [r.name, r] as const))(
      '%s passes an inputSchema object as the 3rd argument',
      (_name, registration) => {
        const [toolName, description, third, fourth] = registration.args;
        expect(typeof toolName).toBe('string');
        expect(typeof description).toBe('string');
        expect(typeof third).toBe('object');
        expect(third).not.toBeNull();
        expect(Array.isArray(third)).toBe(false);
        expect(typeof fourth).toBe('function');
      }
    );
  });
});
