import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getUpdateRequestTools(api: SmartsheetAPI) {
    return {
        create_update_request: {
            name: "create_update_request",
            description: "Creates an update request for a sheet",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "The ID of the sheet"
                    },
                    rowIds: {
                        type: "array",
                        items: { type: "number" },
                        description: "Array of row IDs to include in the update request"
                    },
                    columnIds: {
                        type: "array",
                        items: { type: "number" },
                        description: "Array of column IDs to include in the update request"
                    },
                    includeAttachments: {
                        type: "boolean",
                        description: "Whether to include attachments in the update request"
                    },
                    includeDiscussions: {
                        type: "boolean",
                        description: "Whether to include discussions in the update request"
                    },
                    message: {
                        type: "string",
                        description: "Message to include in the update request email"
                    },
                    subject: {
                        type: "string",
                        description: "Subject line for the update request email"
                    },
                    ccMe: {
                        type: "boolean",
                        description: "Whether to CC the sender on the update request email"
                    },
                    sendTo: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    description: "Email address of the recipient"
                                }
                            },
                            required: ["email"]
                        },
                        description: "Array of recipients for the update request"
                    }
                },
                required: ["sheetId", "sendTo"]
            },
            handler: async ({ sheetId, rowIds, columnIds, includeAttachments, includeDiscussions, message, subject, ccMe, sendTo }: {
                sheetId: string;
                rowIds?: number[];
                columnIds?: number[];
                includeAttachments?: boolean;
                includeDiscussions?: boolean;
                message?: string;
                subject?: string;
                ccMe?: boolean;
                sendTo: Array<{ email: string }>;
            }) => {
                try {
                    console.info(`Creating update request for sheet: ${sheetId}`);
                    const result = await api.sheets.createUpdateRequest(sheetId, {
                        rowIds,
                        columnIds,
                        includeAttachments,
                        includeDiscussions,
                        message,
                        subject,
                        ccMe,
                        sendTo
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
                    console.error("Failed to create update request", { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to create update request: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        }
    };
}
