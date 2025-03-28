// Example script for testing the SmartsheetDirectAPI class
import { createSmartsheetDirectAPI } from '../src/smartsheet-direct-api.js';
import { config } from 'dotenv';

// Load environment variables
config();

async function main() {
  try {
    console.log('Starting SmartsheetDirectAPI test...');
    
    // Create a direct API client
    const api = createSmartsheetDirectAPI();
    
    // Define the sheet ID and row to update
    const sheetId = '7532263697764228';
    const rowId = '2597884423311236'; // Row 5
    
    // Update a cell with just a formula
    console.log(`Updating formula in row ${rowId} of sheet ${sheetId}...`);
    
    const updateResult = await api.updateRows(sheetId, [
      {
        id: rowId,
        cells: [
          {
            columnId: 5626250922250116, // Primary Column
            formula: "=MONTH([End Date]1)"
          }
        ]
      }
    ]);
    
    console.log('Update result:', JSON.stringify(updateResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();