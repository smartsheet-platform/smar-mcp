// Test file for version restore property handling
import { config } from 'dotenv';
import { createSmartsheetDirectAPI } from '../build/smartsheet-direct-api.js';
import { findCellValueAtTimestamp } from '../build/smartsheet-utils.js';
import { createVersionBackup } from '../build/smartsheet-workflows.js';

// Load environment variables
config();

// Initialize the API client
const api = createSmartsheetDirectAPI();

// Test sheet ID - this should be a test sheet with known history
const TEST_SHEET_ID = '7532263697764228'; // Replace with your test sheet ID

// Test timestamp - this should be a known point in time for your test sheet
const TEST_TIMESTAMP = '2025-03-27T17:00:00Z'; // Replace with your test timestamp

/**
 * Test case for basic value restoration
 */
async function testBasicValueRestoration() {
  console.log('\n=== Testing Basic Value Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Get a specific cell's history
    const testRowId = sheet.rows[0].id;
    const testColumnId = sheet.columns[0].id;
    
    console.log(`Getting history for cell at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'format,conditionalFormat,formula,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the value property is present
    if (historicalValue && 'value' in historicalValue) {
      console.log('✅ Test passed: Value property is present');
    } else {
      console.log('❌ Test failed: Value property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testBasicValueRestoration:', error);
    return null;
  }
}

/**
 * Test case for format restoration
 */
async function testFormatRestoration() {
  console.log('\n=== Testing Format Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Get a specific cell's history (preferably one with formatting changes)
    const testRowId = sheet.rows[0].id;
    const testColumnId = sheet.columns[0].id;
    
    console.log(`Getting history for cell at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'format,formula,conditionalFormat,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value with format:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the format property is present
    if (historicalValue && 'format' in historicalValue) {
      console.log('✅ Test passed: Format property is present');
    } else {
      console.log('❌ Test failed: Format property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testFormatRestoration:', error);
    return null;
  }
}

/**
 * Test case for formula restoration
 */
async function testFormulaRestoration() {
  console.log('\n=== Testing Formula Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Find a cell with a formula
    let testRowId = null;
    let testColumnId = null;
    
    // Look for a cell with a formula
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.formula) {
          testRowId = row.id;
          testColumnId = cell.columnId;
          break;
        }
      }
      if (testRowId) break;
    }
    
    if (!testRowId) {
      console.log('❌ Test skipped: No cell with formula found in the sheet');
      return null;
    }
    
    console.log(`Getting history for cell with formula at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'formula,format,conditionalFormat,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value with formula:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the formula property is present
    if (historicalValue && 'formula' in historicalValue) {
      console.log('✅ Test passed: Formula property is present');
    } else {
      console.log('❌ Test failed: Formula property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testFormulaRestoration:', error);
    return null;
  }
}

/**
 * Test case for hyperlink restoration
 */
async function testHyperlinkRestoration() {
  console.log('\n=== Testing Hyperlink Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Find a cell with a hyperlink
    let testRowId = null;
    let testColumnId = null;
    
    // Look for a cell with a hyperlink
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.hyperlink) {
          testRowId = row.id;
          testColumnId = cell.columnId;
          break;
        }
      }
      if (testRowId) break;
    }
    
    if (!testRowId) {
      console.log('❌ Test skipped: No cell with hyperlink found in the sheet');
      return null;
    }
    
    console.log(`Getting history for cell with hyperlink at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'format,conditionalFormat,formula,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value with hyperlink:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the hyperlink property is present
    if (historicalValue && 'hyperlink' in historicalValue) {
      console.log('✅ Test passed: Hyperlink property is present');
    } else {
      console.log('❌ Test failed: Hyperlink property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testHyperlinkRestoration:', error);
    return null;
  }
}

/**
 * Test case for object value restoration
 */
async function testObjectValueRestoration() {
  console.log('\n=== Testing Object Value Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Find a cell with an object value (like a date)
    let testRowId = null;
    let testColumnId = null;
    
    // Look for a cell with an object value
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.objectValue) {
          testRowId = row.id;
          testColumnId = cell.columnId;
          break;
        }
      }
      if (testRowId) break;
    }
    
    if (!testRowId) {
      console.log('❌ Test skipped: No cell with object value found in the sheet');
      return null;
    }
    
    console.log(`Getting history for cell with object value at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'format,conditionalFormat,formula,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value with object value:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the objectValue property is present
    if (historicalValue && 'objectValue' in historicalValue) {
      console.log('✅ Test passed: Object value property is present');
    } else {
      console.log('❌ Test failed: Object value property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testObjectValueRestoration:', error);
    return null;
  }
}

/**
 * Test case for conditional format restoration
 */
async function testConditionalFormatRestoration() {
  console.log('\n=== Testing Conditional Format Restoration ===');
  
  try {
    // Get the current sheet
    console.log('Getting current sheet...');
    const sheet = await api.getSheet(TEST_SHEET_ID);
    
    // Get a specific cell's history
    const testRowId = sheet.rows[0].id;
    const testColumnId = sheet.columns[0].id;
    
    console.log(`Getting history for cell at row ${testRowId}, column ${testColumnId}...`);
    const cellHistory = await api.getCellHistory(
      TEST_SHEET_ID,
      testRowId,
      testColumnId,
      'format,conditionalFormat,formula,hyperlink,image,objectValue' // Include all properties in the response
    );
    
    // Find the cell value at the test timestamp
    console.log(`Finding cell value at timestamp ${TEST_TIMESTAMP}...`);
    const historicalValue = findCellValueAtTimestamp(cellHistory.data, TEST_TIMESTAMP);
    
    console.log('Historical value with conditional format:', JSON.stringify(historicalValue, null, 2));
    
    // Verify that the conditionalFormat property is present
    if (historicalValue && 'conditionalFormat' in historicalValue) {
      console.log('✅ Test passed: Conditional format property is present');
    } else {
      console.log('❌ Test failed: Conditional format property is missing');
    }
    
    return historicalValue;
  } catch (error) {
    console.error('Error in testConditionalFormatRestoration:', error);
    return null;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('=== Starting Version Restore Property Tests ===');
  
  await testBasicValueRestoration();
  await testFormatRestoration();
  await testFormulaRestoration();
  await testHyperlinkRestoration();
  await testObjectValueRestoration();
  await testConditionalFormatRestoration();
  
  console.log('\n=== All Tests Completed ===');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});