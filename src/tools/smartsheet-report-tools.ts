import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getReportTools(server: McpServer, api: SmartsheetAPI) {

  // Tool: List Reports
  server.tool(
    "list_reports",
    "Lists all reports accessible to the current user",
    {
      pageSize: z.number().optional().describe("Number of reports to return per page"),
      page: z.number().optional().describe("Page number to return"),
      includeAll: z.boolean().optional().describe("Include all results without pagination"),
    },
    async ({ pageSize, page, includeAll }) => {
      try {
        console.info("Listing all reports");
        const reports = await api.reports.listReports(pageSize, page, includeAll);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(reports, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to list reports: ${error.message}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to list reports: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Get Report
  server.tool(
    "get_report",
    "Retrieves a report by ID with its data rows",
    {
      reportId: z.string().describe("The ID of the report to retrieve"),
      pageSize: z.number().optional().describe("Number of rows to return per page"),
      page: z.number().optional().describe("Page number to return"),
      include: z.string().optional().describe("Comma-separated list of elements to include"),
    },
    async ({ reportId, pageSize, page, include }) => {
      try {
        console.info(`Getting report with ID: ${reportId}`);
        const report = await api.reports.getReport(reportId, pageSize, page, include);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(report, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to get report with ID: ${reportId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to get report: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Send Report
  server.tool(
    "send_report",
    "Sends a report via email to specified recipients",
    {
      reportId: z.string().describe("The ID of the report to send"),
      sendTo: z.array(
        z.object({
          email: z.string().describe("Email address of recipient")
        })
      ).describe("Array of email recipients"),
      subject: z.string().describe("Email subject line"),
      message: z.string().optional().describe("Email message body"),
      ccMe: z.boolean().optional().describe("CC the sender"),
      format: z.enum(['PDF', 'EXCEL', 'PDF_GANTT']).optional().describe("Export format"),
    },
    async ({ reportId, sendTo, subject, message, ccMe, format }) => {
      try {
        console.info(`Sending report ${reportId} to ${sendTo.length} recipients`);
        const result = await api.reports.sendReport(reportId, {
          sendTo,
          subject,
          message,
          ccMe,
          format
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to send report ${reportId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to send report: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Get Report Publish Status
  server.tool(
    "get_report_publish_status",
    "Gets the publish status of a report",
    {
      reportId: z.string().describe("The ID of the report"),
    },
    async ({ reportId }) => {
      try {
        console.info(`Getting publish status for report ${reportId}`);
        const status = await api.reports.getReportPublishStatus(reportId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to get publish status for report ${reportId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to get report publish status: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

}
