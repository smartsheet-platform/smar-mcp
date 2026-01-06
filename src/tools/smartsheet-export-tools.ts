import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getExportTools(server: McpServer, api: SmartsheetAPI) {

  server.tool(
    "export_sheet_to_csv",
    "Exports a sheet to CSV format",
    {
      sheetId: z.number().describe("The ID of the sheet to export"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Exporting sheet ${sheetId} to CSV`);
        const csvContent = await api.export.exportSheetToCsv(sheetId);
        return {
          content: [{ type: "text", text: csvContent }]
        };
      } catch (error: any) {
        console.error(`Failed to export sheet ${sheetId} to CSV`, { error });
        return {
          content: [{ type: "text", text: `Failed to export to CSV: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "export_sheet_to_excel",
    "Exports a sheet to Excel format (returns base64 encoded content)",
    {
      sheetId: z.number().describe("The ID of the sheet to export"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Exporting sheet ${sheetId} to Excel`);
        const excelBuffer = await api.export.exportSheetToExcel(sheetId);
        const base64Content = Buffer.from(excelBuffer).toString('base64');
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              format: "xlsx",
              encoding: "base64",
              content: base64Content
            }, null, 2)
          }]
        };
      } catch (error: any) {
        console.error(`Failed to export sheet ${sheetId} to Excel`, { error });
        return {
          content: [{ type: "text", text: `Failed to export to Excel: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "export_sheet_to_pdf",
    "Exports a sheet to PDF format (returns base64 encoded content)",
    {
      sheetId: z.number().describe("The ID of the sheet to export"),
      paperSize: z.enum(["LETTER", "LEGAL", "WIDE", "ARCHD", "A4", "A3", "A2", "A1", "A0"]).optional()
        .describe("Paper size for the PDF"),
    },
    async ({ sheetId, paperSize }) => {
      try {
        console.info(`Exporting sheet ${sheetId} to PDF`);
        const pdfBuffer = await api.export.exportSheetToPdf(sheetId, { paperSize });
        const base64Content = Buffer.from(pdfBuffer).toString('base64');
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              format: "pdf",
              encoding: "base64",
              paperSize: paperSize || "LETTER",
              content: base64Content
            }, null, 2)
          }]
        };
      } catch (error: any) {
        console.error(`Failed to export sheet ${sheetId} to PDF`, { error });
        return {
          content: [{ type: "text", text: `Failed to export to PDF: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "import_csv_to_new_sheet",
    "Imports CSV content into a new sheet",
    {
      csvContent: z.string().describe("The CSV content to import"),
      sheetName: z.string().describe("Name for the new sheet"),
      headerRowIndex: z.number().optional().describe("Row index for headers (default: 0)"),
      primaryColumnIndex: z.number().optional().describe("Column index for the primary column (default: 0)"),
    },
    async ({ csvContent, sheetName, headerRowIndex, primaryColumnIndex }) => {
      try {
        console.info(`Importing CSV to new sheet "${sheetName}"`);
        const result = await api.export.importCsvToNewSheet(csvContent, sheetName, {
          headerRowIndex,
          primaryColumnIndex,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to import CSV to new sheet "${sheetName}"`, { error });
        return {
          content: [{ type: "text", text: `Failed to import CSV: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "import_csv_to_existing_sheet",
    "Imports CSV content as new rows in an existing sheet",
    {
      sheetId: z.number().describe("The ID of the sheet to import into"),
      csvContent: z.string().describe("The CSV content to import"),
    },
    async ({ sheetId, csvContent }) => {
      try {
        console.info(`Importing CSV to existing sheet ${sheetId}`);
        const result = await api.export.importCsvToExistingSheet(sheetId, csvContent);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to import CSV to sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to import CSV: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_sheet_as_json",
    "Gets a sheet in JSON format with optional filtering and pagination",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      include: z.array(z.string()).optional().describe("Elements to include (e.g., ['attachments', 'discussions'])"),
      exclude: z.array(z.string()).optional().describe("Elements to exclude"),
      rowIds: z.array(z.number()).optional().describe("Specific row IDs to return"),
      columnIds: z.array(z.number()).optional().describe("Specific column IDs to return"),
      filterId: z.number().optional().describe("Filter ID to apply"),
      pageSize: z.number().optional().describe("Number of rows per page"),
      page: z.number().optional().describe("Page number"),
    },
    async ({ sheetId, include, exclude, rowIds, columnIds, filterId, pageSize, page }) => {
      try {
        console.info(`Getting sheet ${sheetId} as JSON`);
        const result = await api.export.getSheetAsJson(sheetId, {
          include, exclude, rowIds, columnIds, filterId, pageSize, page
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get sheet ${sheetId} as JSON`, { error });
        return {
          content: [{ type: "text", text: `Failed to get sheet as JSON: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
