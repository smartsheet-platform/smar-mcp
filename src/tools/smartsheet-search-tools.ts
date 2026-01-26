import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { z } from 'zod';

export function getSearchTools(server: McpServer, api: SmartsheetAPI) {
  const searchSheetsSchema = {
    query: z.string().describe('Text to search for in sheet names, cell data, or summary fields'),
  };

  server.tool(
    'search_sheets',
    'Search for sheets by name, cell data, or summary fields',
    searchSheetsSchema as any,
    async (args: any) => {
      const { query } = args;
      try {
        console.info(`Searching for sheets with query: ${query}`);
        const results = await api.search.searchSheets(query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search for sheets with query "${query}": ${error.message}`, {
          error,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for sheets: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchInSheetSchema = {
    sheetId: z.string().describe('The ID of the sheet to retrieve'),
    query: z.string().describe('Text to search for in sheet names, cell data, or summary fields'),
  };

  server.tool(
    'search_in_sheet',
    "Search all cell data and summary fields in a specific sheet. For a more targeted search in a specific column, use 'find_rows_by_column_value'.",
    searchInSheetSchema as any,
    async (args: any) => {
      const { sheetId, query } = args;
      try {
        console.info(`Searching for sheet with ID: ${sheetId} with query: ${query}`);
        const results = await api.search.searchSheet(sheetId, query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(
          `Failed to search in sheet ${sheetId} with query "${query}": ${error.message}`,
          { error },
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search in sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchInSheetByUrlSchema = {
    url: z.string().describe('The URL of the sheet to retrieve'),
    query: z.string().describe('Text to search for in sheet names, cell data, or summary fields'),
  };

  server.tool(
    'search_in_sheet_by_url',
    'Search cell data and summary fields for a specific sheet by URL',
    searchInSheetByUrlSchema as any,
    async (args: any) => {
      const { url, query } = args;
      try {
        console.info(`Searching for sheet with URL: ${url} with query: ${query}`);
        const match = url.match(/sheets\/([^/?]+)/);
        const directIdToken = match ? match[1] : null;
        if (!directIdToken) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to get sheet: Invalid URL format`,
              },
            ],
            isError: true,
          };
        }
        const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
        const results = await api.search.searchSheet(sheet.id.toString(), query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search in sheet ${url} with query "${query}": ${error.message}`, {
          error,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search in sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const whatAmIAssignedToBySheetIdSchema = {
    sheetId: z.string().describe('The ID of the sheet to retrieve'),
  };

  server.tool(
    'what_am_i_assigned_to_by_sheet_id',
    'Search a sheet by ID to find assigned tasks',
    whatAmIAssignedToBySheetIdSchema as any,
    async (args: any) => {
      const { sheetId } = args;
      try {
        const user = await api.users.getCurrentUser();
        const results = await api.search.searchSheet(sheetId, user.email);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search in sheet ${sheetId}: ${error.message}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for assigned tasks in sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const whatAmIAssignedToBySheetUrlSchema = {
    url: z.string().describe('The URL of the sheet to retrieve'),
  };

  server.tool(
    'what_am_i_assigned_to_by_sheet_url',
    'Search a sheet by URL to find assigned tasks',
    whatAmIAssignedToBySheetUrlSchema as any,
    async (args: any) => {
      const { url } = args;
      try {
        const user = await api.users.getCurrentUser();
        const match = url.match(/sheets\/([^/?]+)/);
        const directIdToken = match ? match[1] : null;
        if (!directIdToken) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to get sheet: Invalid URL format`,
              },
            ],
            isError: true,
          };
        }
        const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
        const results = await api.search.searchSheet(sheet.id.toString(), user.email);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search in sheet ${url}: ${error.message}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for assigned tasks in sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchFoldersSchema = {
    query: z.string().describe('Text to search for in folder names'),
  };

  server.tool(
    'search_folders',
    'Search for folders by name',
    searchFoldersSchema as any,
    async (args: any) => {
      const { query } = args;
      try {
        console.info(`Searching for folders with query: ${query}`);
        const results = await api.search.searchFolders(query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search for folders with query: ${query}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for folders: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchWorkspacesSchema = {
    query: z.string().describe('Text to search for in workspace names'),
  };

  server.tool(
    'search_workspaces',
    'Search for workspaces by name',
    searchWorkspacesSchema as any,
    async (args: any) => {
      const { query } = args;
      try {
        console.info(`Searching for workspaces with query: ${query}`);
        const results = await api.search.searchWorkspaces(query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search for workspaces with query: ${query}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for workspaces: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchReportsSchema = {
    query: z.string().describe('Text to search for in report names'),
  };

  server.tool(
    'search_reports',
    'Search for reports by name',
    searchReportsSchema as any,
    async (args: any) => {
      const { query } = args;
      try {
        console.info(`Searching for reports with query: ${query}`);
        const results = await api.search.searchReports(query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search for reports with query: ${query}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for reports: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const searchDashboardsSchema = {
    query: z.string().describe('Text to search for in dashboard names'),
  };

  server.tool(
    'search_dashboards',
    'Search for dashboards by name',
    searchDashboardsSchema as any,
    async (args: any) => {
      const { query } = args;
      try {
        console.info(`Searching for dashboards with query: ${query}`);
        const results = await api.search.searchDashboards(query);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to search for dashboards with query: ${query}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to search for dashboards: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
