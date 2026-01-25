import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import {
  validateIntegrationEnvironment,
  getTestClient,
  INTEGRATION_TEST_TIMEOUT,
} from './setup.js';
import { SmartsheetAPI } from '../../src/apis/smartsheet-api.js';

// Conditional describe to skip tests if not enabled
const runTests = process.env.RUN_INTEGRATION_TESTS === 'true';

(runTests ? describe : describe.skip)('Integration Tests (Live API)', () => {
  let client: SmartsheetAPI;
  let testSheetId: string | undefined;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  beforeAll(() => {
    validateIntegrationEnvironment();
    client = getTestClient();
  });

  afterAll(async () => {
    // Cleanup: Delete the test sheet
    if (testSheetId) {
      console.log(`Cleaning up: Deleting test sheet ${testSheetId}...`);
      try {
        await client.sheets.deleteSheet(testSheetId);
        console.log('Cleanup successful.');
      } catch (error) {
        console.error('Failed to clean up test sheet:', error);
      }
    }
  });

  test(
    'Should be able to get current user',
    async () => {
      const user = await client.users.getCurrentUser();
      expect(user).toBeDefined();
      expect(user.email).toBeDefined();
      console.log(`Running tests as: ${user.email}`);
    },
    INTEGRATION_TEST_TIMEOUT,
  );

  test(
    'Full CRUD Loop: Create Sheet -> Add Row -> Get Row',
    async () => {
      const sheetName = `Integration Test Sheet ${timestamp}`;
      console.log(`Creating sheet: ${sheetName}`);

      // 1. Create Sheet
      const columns = [
        { title: 'Task Name', type: 'TEXT_NUMBER' as const, primary: true },
        {
          title: 'Status',
          type: 'PICKLIST' as const,
          options: ['Not Started', 'In Progress', 'Complete'],
        },
        { title: 'Due Date', type: 'DATE' as const },
      ];

      const newSheet = await client.sheets.createSheet(sheetName, columns);
      testSheetId = newSheet.id.toString();

      if (!testSheetId) {
        throw new Error('Failed to create sheet, ID is undefined');
      }

      expect(newSheet).toBeDefined();
      expect(newSheet.id).toBeDefined();
      console.log(`Sheet created with ID: ${newSheet.id}`);

      // 2. Add Row
      console.log('Adding a row...');
      const colMap = new Map(newSheet.columns.map((c: any) => [c.title, c.id]));

      const rowData = {
        toBottom: true,
        cells: [
          { columnId: colMap.get('Task Name'), value: 'Integration Test Task' },
          { columnId: colMap.get('Status'), value: 'In Progress' },
          { columnId: colMap.get('Due Date'), value: '2025-12-31' },
        ],
      };

      const addedRows = await client.sheets.addRows(testSheetId, [rowData]);
      expect(addedRows).toBeDefined();
      expect(addedRows.length).toBe(1);
      const newRowId = addedRows[0].id;
      console.log(`Row added with ID: ${newRowId}`);

      // 3. Verify Row Data (Get Sheet)
      console.log('Verifying row data...');
      const sheetData = await client.sheets.getSheet(testSheetId);
      const fetchedRow = sheetData.rows.find((r: any) => r.id.toString() === newRowId.toString());

      expect(fetchedRow).toBeDefined();
      const taskCell = fetchedRow.cells.find((c: any) => c.columnId === colMap.get('Task Name'));
      expect(taskCell.value).toBe('Integration Test Task');
      console.log('Row verified successfully.');
    },
    INTEGRATION_TEST_TIMEOUT,
  );
});
