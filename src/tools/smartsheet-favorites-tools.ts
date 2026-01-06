import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

const favoriteTypeSchema = z.enum(["sheet", "folder", "report", "template", "workspace", "sight"]);

export function getFavoritesTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  server.tool(
    "list_favorites",
    "Lists all favorites for the current user",
    {},
    async () => {
      try {
        console.info("Listing favorites");
        const favorites = await api.favorites.listFavorites();
        return {
          content: [{ type: "text", text: JSON.stringify(favorites, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to list favorites", { error });
        return {
          content: [{ type: "text", text: `Failed to list favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_favorites",
    "Adds items to favorites",
    {
      favorites: z.array(z.object({
        type: favoriteTypeSchema.describe("Type of item to favorite"),
        objectId: z.number().describe("ID of the item to favorite"),
      })).describe("Array of items to add to favorites"),
    },
    async ({ favorites }) => {
      try {
        console.info(`Adding ${favorites.length} items to favorites`);
        const result = await api.favorites.addFavorites(favorites);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to add favorites", { error });
        return {
          content: [{ type: "text", text: `Failed to add favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_sheet_to_favorites",
    "Adds a sheet to favorites",
    {
      sheetId: z.number().describe("The ID of the sheet to favorite"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Adding sheet ${sheetId} to favorites`);
        const result = await api.favorites.addSheetToFavorites(sheetId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add sheet ${sheetId} to favorites`, { error });
        return {
          content: [{ type: "text", text: `Failed to add sheet to favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_folder_to_favorites",
    "Adds a folder to favorites",
    {
      folderId: z.number().describe("The ID of the folder to favorite"),
    },
    async ({ folderId }) => {
      try {
        console.info(`Adding folder ${folderId} to favorites`);
        const result = await api.favorites.addFolderToFavorites(folderId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add folder ${folderId} to favorites`, { error });
        return {
          content: [{ type: "text", text: `Failed to add folder to favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_workspace_to_favorites",
    "Adds a workspace to favorites",
    {
      workspaceId: z.number().describe("The ID of the workspace to favorite"),
    },
    async ({ workspaceId }) => {
      try {
        console.info(`Adding workspace ${workspaceId} to favorites`);
        const result = await api.favorites.addWorkspaceToFavorites(workspaceId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add workspace ${workspaceId} to favorites`, { error });
        return {
          content: [{ type: "text", text: `Failed to add workspace to favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_report_to_favorites",
    "Adds a report to favorites",
    {
      reportId: z.number().describe("The ID of the report to favorite"),
    },
    async ({ reportId }) => {
      try {
        console.info(`Adding report ${reportId} to favorites`);
        const result = await api.favorites.addReportToFavorites(reportId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add report ${reportId} to favorites`, { error });
        return {
          content: [{ type: "text", text: `Failed to add report to favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_dashboard_to_favorites",
    "Adds a dashboard (sight) to favorites",
    {
      sightId: z.number().describe("The ID of the dashboard/sight to favorite"),
    },
    async ({ sightId }) => {
      try {
        console.info(`Adding dashboard ${sightId} to favorites`);
        const result = await api.favorites.addDashboardToFavorites(sightId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add dashboard ${sightId} to favorites`, { error });
        return {
          content: [{ type: "text", text: `Failed to add dashboard to favorites: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "remove_favorites",
      "Removes items from favorites",
      {
        type: favoriteTypeSchema.describe("Type of items to remove"),
        objectIds: z.array(z.number()).describe("Array of item IDs to remove from favorites"),
      },
      async ({ type, objectIds }) => {
        try {
          console.info(`Removing ${objectIds.length} ${type}(s) from favorites`);
          await api.favorites.removeFavorites(type, objectIds);
          return {
            content: [{ type: "text", text: `Successfully removed ${objectIds.length} item(s) from favorites` }]
          };
        } catch (error: any) {
          console.error("Failed to remove favorites", { error });
          return {
            content: [{ type: "text", text: `Failed to remove favorites: ${error.message}` }],
            isError: true
          };
        }
      }
    );

    server.tool(
      "remove_sheet_from_favorites",
      "Removes a sheet from favorites",
      {
        sheetId: z.number().describe("The ID of the sheet to remove from favorites"),
      },
      async ({ sheetId }) => {
        try {
          console.info(`Removing sheet ${sheetId} from favorites`);
          await api.favorites.removeSheetFromFavorites(sheetId);
          return {
            content: [{ type: "text", text: `Successfully removed sheet ${sheetId} from favorites` }]
          };
        } catch (error: any) {
          console.error(`Failed to remove sheet ${sheetId} from favorites`, { error });
          return {
            content: [{ type: "text", text: `Failed to remove sheet from favorites: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }
}
