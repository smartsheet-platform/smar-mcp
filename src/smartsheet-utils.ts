/**
 * Helper functions for Smartsheet operations
 */

/**
 * Finds the cell value at or before a specific timestamp
 * @param cellHistory Array of cell history entries
 * @param targetTimestamp Target timestamp to find value at
 * @returns Cell value at or before the timestamp, or null if not found
 */
export function findCellValueAtTimestamp(cellHistory: any[], targetTimestamp: string): any {
  // Convert target timestamp to Date object
  const targetDate = new Date(targetTimestamp);
  
  // Sort history by modifiedAt in descending order (newest first)
  const sortedHistory = [...cellHistory].sort((a, b) =>
    new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
  );
  
  // Find the first entry that is older than or equal to the target timestamp
  for (const entry of sortedHistory) {
    const entryDate = new Date(entry.modifiedAt);
    if (entryDate <= targetDate) {
      // Log the entry for debugging
      console.info(`[Info] Found historical value at ${entry.modifiedAt} for timestamp ${targetTimestamp}`);
      
      // Log important properties for debugging
      if (entry.formula) {
        console.info(`[Info] Formula found: ${entry.formula}`);
      }
      if (entry.format) {
        console.info(`[Info] Format found: ${entry.format}`);
      }
      if (entry.hyperlink) {
        console.info(`[Info] Hyperlink found: ${JSON.stringify(entry.hyperlink)}`);
      }
      if (entry.objectValue) {
        console.info(`[Info] Object value found: ${JSON.stringify(entry.objectValue)}`);
      }
      
      // Create a comprehensive historical value object with all available properties
      const historicalValue: any = {};
      
      // Basic properties
      if (entry.value !== undefined) historicalValue.value = entry.value;
      if (entry.displayValue !== undefined) historicalValue.displayValue = entry.displayValue;
      
      // Formula
      if (entry.formula !== undefined) historicalValue.formula = entry.formula;
      
      // Formatting
      if (entry.format !== undefined) historicalValue.format = entry.format;
      if (entry.conditionalFormat !== undefined) historicalValue.conditionalFormat = entry.conditionalFormat;
      
      // Hyperlinks
      if (entry.hyperlink !== undefined) historicalValue.hyperlink = entry.hyperlink;
      
      // Images
      if (entry.image !== undefined) historicalValue.image = entry.image;
      
      // Cell links
      if (entry.linkInFromCell !== undefined) historicalValue.linkInFromCell = entry.linkInFromCell;
      if (entry.linksOutToCells !== undefined) historicalValue.linksOutToCells = entry.linksOutToCells;
      
      // Object values (like dates, contact lists, etc.)
      if (entry.objectValue !== undefined) historicalValue.objectValue = entry.objectValue;
      
      // Validation
      if (entry.overrideValidation !== undefined) historicalValue.overrideValidation = entry.overrideValidation;
      if (entry.strict !== undefined) historicalValue.strict = entry.strict;
      
      // Column metadata
      if (entry.columnType !== undefined) historicalValue.columnType = entry.columnType;
      
      return historicalValue;
    }
  }
  
  // If no entry is found, return null
  return null;
}

/**
 * Gets cells that existed at a specific time
 * @param sheet Sheet data
 * @param timestamp Target timestamp
 * @returns Array of cell identifiers (rowId, columnId)
 */
export function getCellsExistingAtTime(sheet: any, timestamp: string): { rowId: string, columnId: string }[] {
  const targetDate = new Date(timestamp);
  const existingCells: { rowId: string, columnId: string }[] = [];
  
  for (const row of sheet.rows) {
    // Check if row existed at the time (based on createdAt if available)
    if (row.createdAt && new Date(row.createdAt) > targetDate) {
      continue;
    }
    
    for (const cell of row.cells) {
      // Skip cells without columnId
      if (!cell.columnId) continue;
      
      // Add cell to the list if it has a value or if we want all cells
      if (cell.value !== null && cell.value !== undefined) {
        existingCells.push({
          rowId: row.id,
          columnId: cell.columnId
        });
      }
    }
  }
  
  return existingCells;
}

/**
 * Chunks an array into smaller arrays of a specified size
 * @param array Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Processes promises in batches to avoid overwhelming the API
 * @param items Items to process
 * @param batchSize Number of items to process in each batch
 * @param processFn Function to process each item
 * @param delayBetweenBatches Delay between batches in milliseconds
 * @returns Array of results
 */
export async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processFn: (item: T) => Promise<R>,
  delayBetweenBatches: number = 100
): Promise<R[]> {
  const results: R[] = [];
  const chunks = chunkArray(items, batchSize);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkPromises = chunk.map(item => processFn(item));
    const chunkResults = await Promise.all(chunkPromises);
    
    results.push(...chunkResults);
    
    // Add delay between batches to avoid rate limiting
    if (i < chunks.length - 1 && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

/**
 * Identifies system columns in a sheet
 * @param columns Array of column objects
 * @returns Set of system column IDs
 */
export function identifySystemColumns(columns: any[]): Set<string> {
  const systemColumnIds = new Set<string>();
  
  for (const column of columns) {
    // Check if this is a system column (usually has a type like 'SYSTEM')
    if (
      column.systemColumnType || 
      column.type === 'SYSTEM' || 
      column.systemColumnId ||
      column.title === 'Modified By' ||
      column.title === 'Modified Date' ||
      column.title === 'Created By' ||
      column.title === 'Created Date'
    ) {
      systemColumnIds.add(column.id);
      console.info(`[Info] Identified system column: ${column.title} (${column.id})`);
    }
  }
  
  return systemColumnIds;
}

/**
 * Maps column IDs from source sheet to target sheet
 * @param sourceColumns Source sheet columns
 * @param targetColumns Target sheet columns
 * @returns Map of source column IDs to target column IDs
 */
export function mapColumnIds(sourceColumns: any[], targetColumns: any[]): Map<string, string> {
  const columnIdMap = new Map<string, string>();
  
  console.info(`[Info] Mapping ${sourceColumns.length} source columns to ${targetColumns.length} target columns`);
  
  // First try to map by title (most reliable)
  for (const sourceColumn of sourceColumns) {
    const targetColumn = targetColumns.find(col => col.title === sourceColumn.title);
    if (targetColumn) {
      columnIdMap.set(sourceColumn.id, targetColumn.id);
      console.info(`[Info] Mapped column by title: ${sourceColumn.title} (${sourceColumn.id} -> ${targetColumn.id})`);
    }
  }
  
  // Then try to map by index for any that weren't mapped
  const unmappedSourceColumns = sourceColumns.filter(col => !Array.from(columnIdMap.keys()).includes(col.id));
  
  if (unmappedSourceColumns.length > 0) {
    console.info(`[Info] Mapping ${unmappedSourceColumns.length} remaining columns by index`);
    
    for (const sourceColumn of unmappedSourceColumns) {
      const sourceIndex = sourceColumns.findIndex(col => col.id === sourceColumn.id);
      if (sourceIndex >= 0 && sourceIndex < targetColumns.length) {
        columnIdMap.set(sourceColumn.id, targetColumns[sourceIndex].id);
        console.info(`[Info] Mapped column by index: ${sourceColumn.title} (${sourceColumn.id} -> ${targetColumns[sourceIndex].id})`);
      } else {
        console.warn(`[Warning] Could not map column: ${sourceColumn.title} (${sourceColumn.id})`);
      }
    }
  }
  
  console.info(`[Info] Successfully mapped ${columnIdMap.size} of ${sourceColumns.length} columns`);
  return columnIdMap;
}