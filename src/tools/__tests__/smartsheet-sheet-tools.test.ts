import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../../apis/smartsheet-api.js';
import { getSheetTools } from '../smartsheet-sheet-tools.js';

jest.mock('../../apis/smartsheet-api.js');

// Capture tool registrations from server.tool() calls
type ToolRegistration = {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: Function;
};

function captureToolRegistrations(): ToolRegistration[] {
  const registrations: ToolRegistration[] = [];

  const mockServer = {
    tool: jest.fn(
      (name: string, description: string, schema: Record<string, z.ZodTypeAny>, handler: Function) => {
        registrations.push({ name, description, schema, handler });
      }
    ),
  } as unknown as McpServer;

  const mockApi = {} as SmartsheetAPI;
  getSheetTools(mockServer, mockApi, false);

  return registrations;
}

function getToolSchema(registrations: ToolRegistration[], toolName: string): z.ZodObject<any> {
  const tool = registrations.find(r => r.name === toolName);
  if (!tool) throw new Error(`Tool "${toolName}" not found`);
  return z.object(tool.schema);
}

describe('smartsheet-sheet-tools - cell value validation', () => {
  const registrations = captureToolRegistrations();

  describe.each(['update_rows', 'add_rows'])('%s', (toolName) => {
    const schema = getToolSchema(registrations, toolName);

    function buildInput(cellValue: unknown) {
      const base: Record<string, unknown> = {
        sheetId: '12345',
        rows: [
          {
            cells: [{ columnId: 67890, value: cellValue }],
            ...(toolName === 'update_rows' ? { id: '11111' } : { toBottom: true }),
          },
        ],
      };
      return base;
    }

    it('accepts a string cell value', () => {
      const result = schema.safeParse(buildInput('hello'));
      expect(result.success).toBe(true);
    });

    it('accepts a number cell value', () => {
      const result = schema.safeParse(buildInput(42));
      expect(result.success).toBe(true);
    });

    it('accepts a boolean cell value', () => {
      const result = schema.safeParse(buildInput(true));
      expect(result.success).toBe(true);
    });

    it('accepts a null cell value', () => {
      const result = schema.safeParse(buildInput(null));
      expect(result.success).toBe(true);
    });

    it('accepts an omitted cell value', () => {
      const input = {
        sheetId: '12345',
        rows: [
          {
            cells: [{ columnId: 67890 }],
            ...(toolName === 'update_rows' ? { id: '11111' } : { toBottom: true }),
          },
        ],
      };
      const result = schema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an object cell value', () => {
      const result = schema.safeParse(buildInput({ nested: 'object' }));
      expect(result.success).toBe(false);
    });

    it('rejects an array cell value', () => {
      const result = schema.safeParse(buildInput([1, 2, 3]));
      expect(result.success).toBe(false);
    });

    it('rejects a deeply nested object cell value', () => {
      const result = schema.safeParse(buildInput({ a: { b: { c: 'd' } } }));
      expect(result.success).toBe(false);
    });
  });
});
