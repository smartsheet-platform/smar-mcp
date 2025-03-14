import { config } from 'dotenv';
import { createClient, SmartsheetClient } from 'smartsheet';
config();
export const smartsheetClient: SmartsheetClient = createClient({
  accessToken: process.env.SMARTSHEET_API_KEY|| '',
  baseUrl: 'https://api.smartsheet.com/2.0/',
});