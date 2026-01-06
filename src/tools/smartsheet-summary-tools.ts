import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

const summaryFieldTypeSchema = z.enum([
  "TEXT_NUMBER", "DATE", "DATETIME", "CONTACT_LIST",
  "CHECKBOX", "PICKLIST", "DURATION", "PREDECESSOR", "ABSTRACT_DATETIME"
]);

export function getSummaryTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  server.tool(
    "get_summary_fields",
    "Gets all summary fields for a sheet (the sheet summary section)",
    {
      sheetId: z.number().describe("The ID of the sheet"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Getting summary fields for sheet ${sheetId}`);
        const fields = await api.summary.getSummaryFields(sheetId);
        return {
          content: [{ type: "text", text: JSON.stringify(fields, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get summary fields for sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get summary fields: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_summary_field",
    "Gets a specific summary field by ID",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      fieldId: z.number().describe("The ID of the summary field"),
    },
    async ({ sheetId, fieldId }) => {
      try {
        console.info(`Getting summary field ${fieldId} for sheet ${sheetId}`);
        const field = await api.summary.getSummaryField(sheetId, fieldId);
        return {
          content: [{ type: "text", text: JSON.stringify(field, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get summary field ${fieldId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get summary field: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "add_summary_fields",
    "Adds new summary fields to a sheet",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      fields: z.array(z.object({
        title: z.string().describe("Title of the summary field"),
        type: summaryFieldTypeSchema.describe("Type of the summary field"),
        formula: z.string().optional().describe("Formula for the field"),
        objectValue: z.any().optional().describe("Value for the field"),
        index: z.number().optional().describe("Position index for the field"),
      })).describe("Array of summary fields to add"),
    },
    async ({ sheetId, fields }) => {
      try {
        console.info(`Adding ${fields.length} summary fields to sheet ${sheetId}`);
        const result = await api.summary.addSummaryFields(sheetId, fields);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to add summary fields", { error });
        return {
          content: [{ type: "text", text: `Failed to add summary fields: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update_summary_fields",
    "Updates existing summary fields",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      fields: z.array(z.object({
        id: z.number().describe("ID of the summary field to update"),
        title: z.string().optional().describe("New title for the field"),
        formula: z.string().optional().describe("New formula for the field"),
        objectValue: z.any().optional().describe("New value for the field"),
        index: z.number().optional().describe("New position index"),
        locked: z.boolean().optional().describe("Whether to lock the field"),
      })).describe("Array of summary field updates"),
    },
    async ({ sheetId, fields }) => {
      try {
        console.info(`Updating ${fields.length} summary fields in sheet ${sheetId}`);
        const result = await api.summary.updateSummaryFields(sheetId, fields);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to update summary fields", { error });
        return {
          content: [{ type: "text", text: `Failed to update summary fields: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "delete_summary_fields",
      "Deletes summary fields from a sheet",
      {
        sheetId: z.number().describe("The ID of the sheet"),
        fieldIds: z.array(z.number()).describe("Array of summary field IDs to delete"),
      },
      async ({ sheetId, fieldIds }) => {
        try {
          console.info(`Deleting ${fieldIds.length} summary fields from sheet ${sheetId}`);
          const result = await api.summary.deleteSummaryFields(sheetId, fieldIds);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          };
        } catch (error: any) {
          console.error("Failed to delete summary fields", { error });
          return {
            content: [{ type: "text", text: `Failed to delete summary fields: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }
}
