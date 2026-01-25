import * as dotenv from 'dotenv';
import { SmartsheetAPI } from '../../src/apis/smartsheet-api.js';

dotenv.config();

export const INTEGRATION_TEST_TIMEOUT = 30000; // 30 seconds

export function validateIntegrationEnvironment() {
  if (process.env.RUN_INTEGRATION_TESTS !== 'true') {
    console.warn('Skipping integration tests. Set RUN_INTEGRATION_TESTS=true to run them.');
    // In Jest, we can't easily skip the whole suite programmatically from a helper without using test.skip or similar in the test file itself.
    // For now, we'll rely on the test files calling this and deciding what to do, or throwing.
    return false;
  }

  if (!process.env.SMARTSHEET_API_KEY) {
    console.error(`
      \x1b[31m================================================================================\x1b[0m
      \x1b[31m[ERROR] Integration Test Prerequisites Missing\x1b[0m
      \x1b[31m================================================================================\x1b[0m
      
      The integration tests require a valid Smartsheet API Key to communicate with the live API.
      
      \x1b[33mReason:\x1b[0m SMARTSHEET_API_KEY environment variable is not set.
      
      \x1b[33mHow to fix:\x1b[0m
      1. Create a .env file in the project root (if not exists).
      2. Add your API key: SMARTSHEET_API_KEY=your_token_here
      3. Ensure you are using a Developer Account to avoid modifying production data.
      
      \x1b[31m================================================================================\x1b[0m
    `);
    throw new Error('Integration test prerequisites missing: SMARTSHEET_API_KEY is not set.');
  }

  return true;
}

export function getTestClient() {
  const apiToken = process.env.SMARTSHEET_API_KEY!;
  const apiEndpoint = process.env.SMARTSHEET_ENDPOINT || 'https://api.smartsheet.com/2.0';
  return new SmartsheetAPI(apiToken, apiEndpoint);
}
