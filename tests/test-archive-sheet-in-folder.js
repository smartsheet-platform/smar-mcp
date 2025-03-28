import { createSmartsheetDirectAPI } from '../build/smartsheet-direct-api.js';
import { createArchiveSheet } from '../build/smartsheet-workflows.js';
import dotenv from 'dotenv';

dotenv.config();

async function testArchiveSheetInFolder() {
  try {
    const api = createSmartsheetDirectAPI();
    
    // Get the sheet details
    console.log('Getting sheet details...');
    const sheetId = '7532263697764228'; // Claude sheet ID
    const sheet = await api.getSheet(sheetId);
    
    // Create an archive sheet
    console.log('Creating archive sheet...');
    const timestamp = new Date().toISOString();
    const result = await createArchiveSheet(api, {
      sheetId,
      timestamp,
      includeFormulas: true,
      includeFormatting: true,
      batchSize: 100,
      maxConcurrentRequests: 5
    });
    
    console.log('Archive sheet created:', JSON.stringify(result, null, 2));
    
    // Get the location of the archive sheet
    console.log('Getting archive sheet location...');
    const archiveSheetId = result.details.archiveSheetId;
    const archiveSheet = await api.getSheet(archiveSheetId);
    
    console.log('Archive sheet name:', archiveSheet.name);
    console.log('Archive sheet parent ID:', archiveSheet.parentId);
    
    // List workspace folders to verify
    console.log('Listing workspace folders...');
    const workspaceId = sheet.workspace?.id;
    const foldersResponse = await api.listWorkspaceFolders(workspaceId);
    const backupFolder = foldersResponse.data?.find(folder => folder.name === `Backup of ${sheet.name}`);
    
    if (backupFolder) {
      console.log(`Backup folder: ${backupFolder.name} (${backupFolder.id})`);
      console.log(`Archive sheet parent ID matches backup folder ID: ${archiveSheet.parentId === backupFolder.id}`);
    } else {
      console.log('Backup folder not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testArchiveSheetInFolder();