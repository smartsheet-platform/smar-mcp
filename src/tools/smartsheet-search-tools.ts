import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getSearchTools(api: SmartsheetAPI) {
    return {
        search_sheets: {
            name: "search_sheets",
            description: "Search for sheets by name, cell data, or summary fields",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for in sheet names, cell data, or summary fields"
                    }
                },
                required: ["query"]
            },
            handler: async ({ query }: { query: string }) => {
                try {
                    console.info(`Searching for sheets with query: ${query}`);
                    const results = await api.search.searchSheets(query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search sheets: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search sheets: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_dashboards: {
            name: "search_dashboards",
            description: "Search for dashboards by name",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for in dashboard names"
                    }
                },
                required: ["query"]
            },
            handler: async ({ query }: { query: string }) => {
                try {
                    console.info(`Searching for dashboards with query: ${query}`);
                    const results = await api.search.searchDashboards(query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search dashboards: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search dashboards: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_folders: {
            name: "search_folders",
            description: "Search for folders by name",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for in folder names"
                    }
                },
                required: ["query"]
            },
            handler: async ({ query }: { query: string }) => {
                try {
                    console.info(`Searching for folders with query: ${query}`);
                    const results = await api.search.searchFolders(query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search folders: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search folders: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_reports: {
            name: "search_reports",
            description: "Search for reports by name",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for in report names"
                    }
                },
                required: ["query"]
            },
            handler: async ({ query }: { query: string }) => {
                try {
                    console.info(`Searching for reports with query: ${query}`);
                    const results = await api.search.searchReports(query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search reports: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search reports: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_workspaces: {
            name: "search_workspaces",
            description: "Search for workspaces by name",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for in workspace names"
                    }
                },
                required: ["query"]
            },
            handler: async ({ query }: { query: string }) => {
                try {
                    console.info(`Searching for workspaces with query: ${query}`);
                    const results = await api.search.searchWorkspaces(query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search workspaces: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search workspaces: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_in_sheet: {
            name: "search_in_sheet",
            description: "Search cell data and summary fields for a specific sheet",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "The ID of the sheet to retrieve"
                    },
                    query: {
                        type: "string",
                        description: "Text to search for in sheet names, cell data, or summary fields"
                    }
                },
                required: ["sheetId", "query"]
            },
            handler: async ({ sheetId, query }: { sheetId: string; query: string }) => {
                try {
                    console.info(`Searching in sheet ${sheetId} with query: ${query}`);
                    const results = await api.search.searchSheet(sheetId, query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search in sheet ${sheetId}: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search in sheet: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        search_in_sheet_by_url: {
            name: "search_in_sheet_by_url",
            description: "Search cell data and summary fields for a specific sheet by URL",
            inputSchema: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "The URL of the sheet to retrieve"
                    },
                    query: {
                        type: "string",
                        description: "Text to search for in sheet names, cell data, or summary fields"
                    }
                },
                required: ["url", "query"]
            },
            handler: async ({ url, query }: { url: string; query: string }) => {
                try {
                    console.info(`Searching in sheet by URL ${url} with query: ${query}`);
                    const match = url.match(/\/sheets\/([^?\/]+)/);
                    const directIdToken = match ? match[1] : null;
                    if (!directIdToken) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Failed to get sheet: Invalid URL format`
                                }
                            ],
                            isError: true
                        };
                    }
                    const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
                    const results = await api.search.searchSheet(sheet.id, query);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search in sheet by URL ${url}: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search in sheet by URL: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        what_am_i_assigned_to_by_sheet_id: {
            name: "what_am_i_assigned_to_by_sheet_id",
            description: "Search a sheet by ID to find assigned tasks",
            inputSchema: {
                type: "object",
                properties: {
                    sheetId: {
                        type: "string",
                        description: "The ID of the sheet to retrieve"
                    }
                },
                required: ["sheetId"]
            },
            handler: async ({ sheetId }: { sheetId: string }) => {
                try {
                    console.info(`Searching for assigned tasks in sheet ${sheetId}`);
                    const user = await api.users.getCurrentUser();
                    const results = await api.search.searchSheet(sheetId, user.email);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search for assigned tasks in sheet ${sheetId}: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search for assigned tasks in sheet: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        what_am_i_assigned_to_by_sheet_url: {
            name: "what_am_i_assigned_to_by_sheet_url",
            description: "Search a sheet by URL to find assigned tasks",
            inputSchema: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "The URL of the sheet to retrieve"
                    }
                },
                required: ["url"]
            },
            handler: async ({ url }: { url: string }) => {
                try {
                    console.info(`Searching for assigned tasks in sheet by URL ${url}`);
                    const user = await api.users.getCurrentUser();
                    const match = url.match(/\/sheets\/([^?\/]+)/);
                    const directIdToken = match ? match[1] : null;
                    if (!directIdToken) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Failed to get sheet: Invalid URL format`
                                }
                            ],
                            isError: true
                        };
                    }
                    const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
                    const results = await api.search.searchSheet(sheet.id, user.email);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to search for assigned tasks in sheet by URL ${url}: ${error.message}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to search for assigned tasks in sheet by URL: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        }
    };
}
