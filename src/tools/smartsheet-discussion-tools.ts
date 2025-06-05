import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getDiscussionTools(api: SmartsheetAPI) {
    return {
        get_discussions_by_sheet_id: {
            name: "get_discussions_by_sheet_id",
            description: "Gets discussions by sheet ID",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "The ID of the sheet"
                    },
                    include: {
                        type: "string",
                        description: "Optional parameter to include additional information (e.g., 'attachments')"
                    },
                    pageSize: {
                        type: "number",
                        description: "Number of discussions to return per page"
                    },
                    page: {
                        type: "number",
                        description: "Page number to return"
                    },
                    includeAll: {
                        type: "boolean",
                        description: "Whether to include all results"
                    }
                },
                required: ["sheetId"]
            },
            handler: async ({ sheetId, include, pageSize, page, includeAll }: { 
                sheetId: string; 
                include?: string; 
                pageSize?: number; 
                page?: number; 
                includeAll?: boolean; 
            }) => {
                try {
                    console.info(`Getting discussions for sheet with ID: ${sheetId}`);
                    const discussions = await api.discussions.getDiscussionsBySheetId(sheetId, include, pageSize, page, includeAll);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(discussions, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to get discussions for sheet with ID: ${sheetId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get discussions: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        get_discussions_by_row_id: {
            name: "get_discussions_by_row_id",
            description: "Gets discussions by row ID",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "ID of the sheet to get discussions for"
                    },
                    rowId: {
                        type: "string",
                        description: "ID of the row to get discussions for"
                    },
                    include: {
                        type: "string",
                        description: "Optional parameter to include additional information (e.g., 'attachments')"
                    },
                    pageSize: {
                        type: "number",
                        description: "Number of discussions to return per page"
                    },
                    page: {
                        type: "number",
                        description: "Page number to return"
                    },
                    includeAll: {
                        type: "boolean",
                        description: "Whether to include all results"
                    }
                },
                required: ["sheetId", "rowId"]
            },
            handler: async ({ sheetId, rowId, include, pageSize, page, includeAll }: { 
                sheetId: string; 
                rowId: string; 
                include?: string; 
                pageSize?: number; 
                page?: number; 
                includeAll?: boolean; 
            }) => {
                try {
                    console.info(`Getting discussions for row ${rowId} in sheet ${sheetId}`);
                    const discussions = await api.discussions.getDiscussionsByRowId(sheetId, rowId, include, pageSize, page, includeAll);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(discussions, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to get discussions for row ${rowId} in sheet ${sheetId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get discussions: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        create_sheet_discussion: {
            name: "create_sheet_discussion",
            description: "Creates a new discussion on a sheet",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "ID of the sheet to create a discussion for"
                    },
                    commentText: {
                        type: "string",
                        description: "Text of the comment to add"
                    }
                },
                required: ["sheetId", "commentText"]
            },
            handler: async ({ sheetId, commentText }: { sheetId: string; commentText: string }) => {
                try {
                    console.info(`Creating discussion on sheet ID: ${sheetId}`);
                    const discussion = await api.discussions.createSheetDiscussion(sheetId, commentText);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(discussion, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to create discussion on sheet ID: ${sheetId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to create discussion: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        create_row_discussion: {
            name: "create_row_discussion",
            description: "Creates a new discussion on a row",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "ID of the sheet to create a discussion for"
                    },
                    rowId: {
                        type: "string",
                        description: "ID of the row to create a discussion for"
                    },
                    commentText: {
                        type: "string",
                        description: "Text of the comment to add"
                    }
                },
                required: ["sheetId", "rowId", "commentText"]
            },
            handler: async ({ sheetId, rowId, commentText }: { sheetId: string; rowId: string; commentText: string }) => {
                try {
                    console.info(`Creating discussion on row ${rowId} in sheet ${sheetId}`);
                    const discussion = await api.discussions.createRowDiscussion(sheetId, rowId, commentText);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(discussion, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to create discussion on row ${rowId} in sheet ${sheetId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to create discussion: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        }
    };
}
