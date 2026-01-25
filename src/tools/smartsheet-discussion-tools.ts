import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { z } from 'zod';

export function getDiscussionTools(server: McpServer, api: SmartsheetAPI) {
  // Tool: Get discussions by sheet ID
  const getDiscussionsBySheetIdSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    include: z
      .string()
      .optional()
      .describe("Optional parameter to include additional information (e.g., 'attachments')"),
    pageSize: z.number().optional().describe('Number of discussions to return per page'),
    page: z.number().optional().describe('Page number to return'),
    includeAll: z.boolean().optional().describe('Whether to include all results'),
  };

  server.tool(
    'get_discussions_by_sheet_id',
    'Gets discussions by sheet ID',
    getDiscussionsBySheetIdSchema as any,
    async (args: any) => {
      const { sheetId, include, pageSize, page, includeAll } = args;
      try {
        console.info(`Getting discussions for sheet with ID: ${sheetId}`);
        const discussions = await api.discussions.getDiscussionsBySheetId(
          sheetId,
          include,
          pageSize,
          page,
          includeAll,
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(discussions, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to get discussions for sheet ID: ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get discussions: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Get discussions by row ID
  const getDiscussionsByRowIdSchema = {
    sheetId: z.string().describe('ID of the sheet to get discussions for'),
    rowId: z.string().describe('ID of the row to get discussions for'),
    include: z
      .string()
      .optional()
      .describe("Optional parameter to include additional information (e.g., 'attachments')"),
    pageSize: z.number().optional().describe('Number of discussions to return per page'),
    page: z.number().optional().describe('Page number to return'),
    includeAll: z.boolean().optional().describe('Whether to include all results'),
  };

  server.tool(
    'get_discussions_by_row_id',
    'Gets discussions by row ID',
    getDiscussionsByRowIdSchema as any,
    async (args: any) => {
      const { sheetId, rowId, include, pageSize, page, includeAll } = args;
      try {
        console.info(`Getting discussions for row with ID: ${rowId} in sheet with ID: ${sheetId}`);
        const discussions = await api.discussions.getDiscussionsByRowId(
          sheetId,
          rowId,
          include,
          pageSize,
          page,
          includeAll,
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(discussions, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to get discussions for row ID: ${rowId} in sheet ID: ${sheetId}`, {
          error,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get discussions: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Create sheet discussion
  const createSheetDiscussionSchema = {
    sheetId: z.string().describe('ID of the sheet to create a discussion for'),
    commentText: z.string().describe('Text of the comment to add'),
  };

  server.tool(
    'create_sheet_discussion',
    'Creates a new discussion on a sheet',
    createSheetDiscussionSchema as any,
    async (args: any) => {
      const { sheetId, commentText } = args;
      try {
        console.info(`Creating discussion on sheet with ID: ${sheetId}`);
        const discussion = await api.discussions.createSheetDiscussion(sheetId, commentText);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(discussion, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to create discussion on sheet ID: ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to create discussion: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Create row discussion
  const createRowDiscussionSchema = {
    sheetId: z.string().describe('ID of the sheet to create a discussion for'),
    rowId: z.string().describe('ID of the row to create a discussion for'),
    commentText: z.string().describe('Text of the comment to add'),
  };

  server.tool(
    'create_row_discussion',
    'Creates a new discussion on a row',
    createRowDiscussionSchema as any,
    async (args: any) => {
      const { sheetId, rowId, commentText } = args;
      try {
        console.info(`Creating discussion on row with ID: ${rowId} in sheet with ID: ${sheetId}`);
        const discussion = await api.discussions.createRowDiscussion(sheetId, rowId, commentText);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(discussion, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to create discussion on row ID: ${rowId} in sheet ID: ${sheetId}`, {
          error,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to create discussion: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
