import { SmartsheetDirectAPI } from './smartsheet-direct-api.js';
import {
  findCellValueAtTimestamp,
  getCellsExistingAtTime,
  chunkArray,
  processBatches,
  identifySystemColumns,
  mapColumnIds
} from './smartsheet-utils.js';

/**
 * Options for sheet version restore operations
 */
export interface SheetVersionRestoreOptions {
  sheetId: string;
  timestamp: string;
  createBackup: boolean;
  includeFormulas: boolean;
  includeFormatting: boolean;
  batchSize: number;
  maxConcurrentRequests: number;
}

/**
 * Creates an archive sheet with data from a specific timestamp
 * @param api SmartsheetDirectAPI instance
 * @param options Options for the archive operation
 * @returns Result of the archive operation
 */
export async function createVersionBackup(
  api: SmartsheetDirectAPI,
  options: SheetVersionRestoreOptions & { archiveName?: string }
): Promise<any> {
  try {
    const {
      sheetId,
      timestamp,
      includeFormulas,
      includeFormatting,
      batchSize,
      maxConcurrentRequests,
      archiveName
    } = options;
    
    // Step 1: Get the source sheet to determine its structure and folder location
    console.error(`[Workflow] Getting source sheet details for ${sheetId}`);
    const sourceSheet = await api.getSheet(sheetId);
    
    // Extract location details from sheet
    const workspaceId = sourceSheet.workspace?.id;
    
    if (!workspaceId) {
      throw new Error("Sheet must be in a workspace to create an archive");
    }
    
    // Step 2: Create or find the backup folder in the workspace
    const backupFolderName = `Backup of ${sourceSheet.name}`;
    console.error(`[Workflow] Looking for backup folder: ${backupFolderName}`);
    
    // List all folders in the workspace
    const foldersResponse = await api.listWorkspaceFolders(workspaceId);
    const folders = foldersResponse.data || [];
    
    // Try to find an existing backup folder
    let backupFolderId: string | undefined;
    for (const folder of folders) {
      if (folder.name === backupFolderName) {
        backupFolderId = folder.id;
        console.error(`[Workflow] Found existing backup folder with ID: ${backupFolderId}`);
        break;
      }
    }
    
    // If no backup folder exists, create one
    if (!backupFolderId) {
      console.error(`[Workflow] Creating new backup folder: ${backupFolderName}`);
      const createFolderResult = await api.createWorkspaceFolder(workspaceId, backupFolderName);
      backupFolderId = createFolderResult.result.id;
      console.error(`[Workflow] Created backup folder with ID: ${backupFolderId}`);
    }
    
    // Step 3: Create a name for the archive sheet
    const formattedTimestamp = new Date(timestamp).toLocaleString();
    const archiveSheetName = archiveName || `Version as of ${formattedTimestamp}`;
    
    // Step 4: Create a copy of the sheet in the backup folder
    console.error(`[Workflow] Creating archive sheet: ${archiveSheetName} in folder ${backupFolderId}`);
    
    // Use the direct API request to copy the sheet to the backup folder
    const copyData = {
      newName: archiveSheetName,
      destinationType: 'folder',
      destinationId: backupFolderId
    };
    
    const copyResult = await api.request<any>('POST', `/sheets/${sheetId}/copy`, copyData);
    const archiveSheetId = copyResult.result.id;
    
    console.error(`[Workflow] Created archive sheet with ID: ${archiveSheetId}`);
    
    // Step 4: Get the newly created archive sheet to get its column IDs
    console.error(`[Workflow] Fetching archive sheet with ID: ${archiveSheetId}`);
    const archiveSheet = await api.getSheet(archiveSheetId);
    
    // Step 5: Get cells that existed at the timestamp
    console.error(`[Workflow] Identifying cells that existed at ${timestamp}`);
    const existingCells = getCellsExistingAtTime(sourceSheet, timestamp);
    console.error(`[Workflow] Found ${existingCells.length} cells to process`);
    
    // Step 6: Get historical values for cells
    console.error(`[Workflow] Getting historical values for cells`);
    const historicalCellValues: Record<string, Record<string, any>> = {};
    
    // Process cells in batches
    const cellBatches = chunkArray(existingCells, maxConcurrentRequests);
    
    for (let i = 0; i < cellBatches.length; i++) {
      const batch = cellBatches[i];
      console.error(`[Workflow] Processing batch ${i + 1}/${cellBatches.length} (${batch.length} cells)`);
      
      const batchPromises = batch.map(async (cell: { rowId: string, columnId: string }) => {
        try {
          // Include all necessary parameters in the request
          // Note: columnType MUST be included to get format information for formula cells
          const includeParams = ['columnType', 'formula'];
          if (includeFormatting) {
            includeParams.push('format', 'conditionalFormat', 'hyperlink', 'image', 'objectValue');
          }
          
          // Always include format in the request
          if (!includeParams.includes('format')) {
            includeParams.push('format');
          }
          
          console.error(`[Info] Getting history for cell at row ${cell.rowId}, column ${cell.columnId}`);
          const history = await api.getCellHistory(
            sheetId,
            cell.rowId,
            cell.columnId,
            includeParams.join(',')
          );
          
          console.error(`[Info] Got ${history.data?.length || 0} history entries`);
          
          const historicalValue = findCellValueAtTimestamp(history.data, timestamp);
          
          if (historicalValue) {
            // If historical value doesn't have format, use the current cell's format
            // Note: Smartsheet API doesn't return format for non-formula cells
            if (!historicalValue.format) {
              const sourceCell = sourceSheet.rows
                .find((row: any) => row.id === cell.rowId)
                ?.cells
                .find((c: any) => c.columnId === cell.columnId);
              
              if (sourceCell?.format) {
                console.error(`[Info] Using current cell format for cell at row ${cell.rowId}, column ${cell.columnId}: ${sourceCell.format}`);
                historicalValue.format = sourceCell.format;
              }
            }
            
            if (!historicalCellValues[cell.rowId]) {
              historicalCellValues[cell.rowId] = {};
            }
            historicalCellValues[cell.rowId][cell.columnId] = historicalValue;
          }
          
          return { success: true, cell };
        } catch (error) {
          console.error(`[Error] Failed to get history for cell at row ${cell.rowId}, column ${cell.columnId}:`, error);
          return { success: false, cell, error };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to avoid rate limiting
      if (i < cellBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Step 7: Create a mapping of source row IDs to archive sheet row IDs
    console.error(`[Workflow] Creating row ID mapping`);
    const rowIdMap = new Map<string, string>();
    
    // Create a map of row numbers to archive sheet row IDs
    const archiveRowNumberMap = new Map<number, string>();
    for (const row of archiveSheet.rows) {
      archiveRowNumberMap.set(row.rowNumber, row.id);
    }
    
    // Map source row IDs to archive sheet row IDs based on row number
    for (const row of sourceSheet.rows) {
      const archiveRowId = archiveRowNumberMap.get(row.rowNumber);
      if (archiveRowId) {
        rowIdMap.set(row.id, archiveRowId);
      }
    }
    
    console.error(`[Workflow] Mapped ${rowIdMap.size} rows from source to archive sheet`);
    
    // Step 8: Prepare row updates
    console.error(`[Workflow] Preparing row updates`);
    const rowUpdates: any[] = [];
    
    // Identify system columns that shouldn't be updated
    const systemColumnIds = identifySystemColumns(archiveSheet.columns);
    
    // Create column ID mapping
    const columnIdMap = mapColumnIds(sourceSheet.columns, archiveSheet.columns);
    
    for (const sourceRowId in historicalCellValues) {
      // Skip rows that don't have a mapping in the archive sheet
      if (!rowIdMap.has(sourceRowId)) {
        console.error(`[Warning] No matching row found in archive sheet for source row ${sourceRowId}`);
        continue;
      }
      
      const targetRowId = rowIdMap.get(sourceRowId)!;
      const cellUpdates: any[] = [];
      
      for (const sourceColumnId in historicalCellValues[sourceRowId]) {
        const historicalValue = historicalCellValues[sourceRowId][sourceColumnId];
        
        // Map column ID
        const targetColumnId = columnIdMap.get(sourceColumnId) || sourceColumnId;
        
        // Skip system columns
        if (systemColumnIds.has(targetColumnId)) {
          console.error(`[Info] Skipping update to system column: ${targetColumnId}`);
          continue;
        }
        
        const cellUpdate: any = {
          columnId: targetColumnId
        };
        
        // Handle formulas and values correctly
        if (includeFormulas && historicalValue.formula) {
          // If we have a formula, only include the formula (not the value)
          cellUpdate.formula = historicalValue.formula;
        } else {
          // Otherwise include the value
          cellUpdate.value = historicalValue.value !== undefined ? historicalValue.value : null;
        }
        
        // Always include formatting if available
        if (historicalValue.format) {
          cellUpdate.format = historicalValue.format;
        } else {
          // Find the source cell to get its format
          const sourceRowData = sourceSheet.rows.find((row: any) => row.id === sourceRowId);
          const sourceCell = sourceRowData?.cells?.find((cell: any) => cell.columnId === sourceColumnId);
          
          // Fall back to the current cell's format if historical format is not available
          if (sourceCell?.format) {
            cellUpdate.format = sourceCell.format;
          }
        }
        
        cellUpdates.push(cellUpdate);
      }
      
      if (cellUpdates.length > 0) {
        rowUpdates.push({
          id: targetRowId,
          cells: cellUpdates
        });
      }
    }
    
    // Step 8: Instead of updating rows, let's delete all rows and add new ones
    console.error(`[Workflow] Deleting existing rows in archive sheet`);
    
    // Get all row IDs in the archive sheet
    const rowIds = archiveSheet.rows.map((row: any) => row.id);
    
    // Delete all rows if there are any
    if (rowIds.length > 0) {
      await api.deleteRows(archiveSheetId, rowIds);
    }
    
    // Convert row updates to row additions
    const rowsToAdd = [];
    
    // For each row in the source sheet
    for (const sourceRow of sourceSheet.rows) {
      // Skip if we don't have historical values for this row
      if (!historicalCellValues[sourceRow.id]) {
        continue;
      }
      
      const cellsToAdd = [];
      
      // For each column in the source sheet
      for (const sourceColumn of sourceSheet.columns) {
        // Get the target column ID
        const targetColumnId = columnIdMap.get(sourceColumn.id);
        if (!targetColumnId) {
          continue;
        }
        
        // Skip system columns
        if (systemColumnIds.has(targetColumnId) ||
            sourceColumn.systemColumnType ||
            sourceColumn.title === 'Modified By' ||
            sourceColumn.title === 'Modified Date' ||
            sourceColumn.title === 'Created By' ||
            sourceColumn.title === 'Created Date') {
          console.error(`[Info] Skipping system column: ${sourceColumn.title} (${sourceColumn.id} -> ${targetColumnId})`);
          continue;
        }
        
        // Get the historical value for this cell
        const historicalValue = historicalCellValues[sourceRow.id]?.[sourceColumn.id];
        
        const cellAdd: any = {
          columnId: targetColumnId
        };
        
        // Check if the source column has a formula in the original sheet
        const sourceRowData = sourceSheet.rows.find((row: any) => row.id === sourceRow.id);
        const sourceCell = sourceRowData?.cells?.find((cell: any) => cell.columnId === sourceColumn.id);
        const hasFormulaInSource = sourceCell?.formula !== undefined;
        
        // Special handling for Duration column - always use formula
        if (sourceColumn.title === 'Duration') {
          cellAdd.formula = "=[Start Date]@row - [End Date]@row";
          // When using a formula, don't set any other properties
          console.error(`[Info] Using hardcoded formula for Duration column: ${cellAdd.formula}`);
        }
        // Always prioritize formulas over values for other columns
        else if (includeFormulas && (
          // Use formula from historical value if available
          (historicalValue && historicalValue.formula) ||
          // Or use formula from current source cell if it has one
          hasFormulaInSource
        )) {
          // If we have a formula, include only the formula
          cellAdd.formula = historicalValue?.formula || sourceCell?.formula;
          console.error(`[Info] Using formula for cell: ${sourceColumn.title} (${cellAdd.formula})`);
        }
        // Use value if no formula or if it's not a formula column
        else if (historicalValue) {
          // Otherwise include the value
          cellAdd.value = historicalValue.value !== undefined ? historicalValue.value : null;
          console.error(`[Info] Using value for cell: ${sourceColumn.title} (${historicalValue?.value})`);
        }
        // Ensure every cell has a value property
        else {
          cellAdd.value = null;
          console.error(`[Info] No historical value found for cell: ${sourceColumn.title}, using null`);
        }
        
        // Include all available properties from historical value
        if (historicalValue) {
          // If we have a formula, we can't set any other properties except format and conditionalFormat
          const hasFormula = cellAdd.formula !== undefined;
          
          // Always include formatting (can be used with formula)
          if (historicalValue.format) {
            cellAdd.format = historicalValue.format;
            console.error(`[Info] Using format from history for cell: ${sourceColumn.title}`);
          } else {
            // Try to get format from the current cell if available
            if (sourceCell?.format) {
              cellAdd.format = sourceCell.format;
              console.error(`[Info] Using format from current cell: ${sourceColumn.title}`);
            } else {
              // If no format is available from history or current cell, use the column's format
              const columnFormat = sourceColumn.format;
              if (columnFormat) {
                cellAdd.format = columnFormat;
                console.error(`[Info] Using format from column for cell: ${sourceColumn.title}`);
              }
            }
          }
          
          // Conditional formatting (can be used with formula)
          if (historicalValue.conditionalFormat) {
            cellAdd.conditionalFormat = historicalValue.conditionalFormat;
            console.error(`[Info] Using conditional format from history for cell: ${sourceColumn.title}`);
          }
          
          // The following properties can't be used with formula
          if (!hasFormula) {
            // Hyperlinks
            if (historicalValue.hyperlink) {
              cellAdd.hyperlink = historicalValue.hyperlink;
              console.error(`[Info] Using hyperlink from history for cell: ${sourceColumn.title}: ${JSON.stringify(historicalValue.hyperlink)}`);
            } else if (sourceCell?.hyperlink) {
              cellAdd.hyperlink = sourceCell.hyperlink;
              console.error(`[Info] Using hyperlink from current cell: ${sourceColumn.title}`);
            }
            
            // Images
            if (historicalValue.image) {
              cellAdd.image = historicalValue.image;
              console.error(`[Info] Using image from history for cell: ${sourceColumn.title}`);
            } else if (sourceCell?.image) {
              cellAdd.image = sourceCell.image;
              console.error(`[Info] Using image from current cell: ${sourceColumn.title}`);
            }
            
            // Cell links
            if (historicalValue.linkInFromCell) {
              cellAdd.linkInFromCell = historicalValue.linkInFromCell;
              console.error(`[Info] Using linkInFromCell from history for cell: ${sourceColumn.title}`);
            }
            
            if (historicalValue.linksOutToCells) {
              cellAdd.linksOutToCells = historicalValue.linksOutToCells;
              console.error(`[Info] Using linksOutToCells from history for cell: ${sourceColumn.title}`);
            }
            
            // Object values (like dates, contact lists, etc.)
            if (historicalValue.objectValue) {
              // If we have an objectValue, use it and remove the value property
              cellAdd.objectValue = historicalValue.objectValue;
              delete cellAdd.value; // Remove value property to avoid conflict
              console.error(`[Info] Using objectValue from history for cell: ${sourceColumn.title}: ${JSON.stringify(historicalValue.objectValue)}`);
            } else if (sourceCell?.objectValue) {
              // If we have an objectValue from the source cell, use it and remove the value property
              cellAdd.objectValue = sourceCell.objectValue;
              delete cellAdd.value; // Remove value property to avoid conflict
              console.error(`[Info] Using objectValue from current cell: ${sourceColumn.title}`);
            }
          }
          
          // Validation (can be used with formula)
          if (historicalValue.overrideValidation !== undefined) {
            cellAdd.overrideValidation = historicalValue.overrideValidation;
          }
          
          if (historicalValue.strict !== undefined) {
            cellAdd.strict = historicalValue.strict;
          }
        }
        
        cellsToAdd.push(cellAdd);
      }
      
      if (cellsToAdd.length > 0) {
        rowsToAdd.push({
          toBottom: true,
          cells: cellsToAdd
        });
      }
    }
    
    // Add rows in batches
    console.error(`[Workflow] Adding ${rowsToAdd.length} rows in batches of ${batchSize}`);
    const addBatches = chunkArray(rowsToAdd, batchSize);
    
    for (let i = 0; i < addBatches.length; i++) {
      const batch = addBatches[i];
      console.error(`[Workflow] Adding batch ${i + 1}/${addBatches.length} (${batch.length} rows)`);
      
      await api.addRows(archiveSheetId, batch);
      
      // Add a small delay between batches to avoid rate limiting
      if (i < addBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Step 9: We no longer add a metadata row at the top
    console.error(`[Workflow] Skipping metadata row as requested`);
    
    return {
      success: true,
      message: `Archive sheet created with data from ${timestamp}`,
      details: {
        sourceSheetId: sheetId,
        archiveSheetId,
        archiveSheetName,
        timestamp,
        rowsProcessed: Object.keys(historicalCellValues).length,
        cellsProcessed: existingCells.length,
        rowsUpdated: rowUpdates.length
      }
    };
  } catch (error: any) {
    console.error('[Error] Archive sheet creation failed:', error);
    
    // Extract more detailed error information
    let errorCode = "ARCHIVE_FAILED";
    let errorMessage = error.message || "Archive sheet creation failed";
    let errorDetails: any = {
      sheetId: options.sheetId,
      timestamp: options.timestamp
    };
    
    // Add more specific error information based on the error type
    if (error.statusCode === 404) {
      errorCode = "RESOURCE_NOT_FOUND";
      errorDetails.resourceType = error.detail?.resourceType || "unknown";
    } else if (error.statusCode === 403) {
      errorCode = "PERMISSION_DENIED";
    } else if (error.statusCode === 429) {
      errorCode = "RATE_LIMIT_EXCEEDED";
      errorDetails.retryAfter = error.headers?.['retry-after'];
    } else if (error.message?.includes("INVALID_COLUMN_ID")) {
      errorCode = "INVALID_COLUMN_ID";
      // Try to extract the column ID from the error message
      const match = error.message.match(/columnId (\d+)/);
      if (match) {
        errorDetails.columnId = match[1];
      }
    }
    
    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: errorDetails
      }
    };
  }
}