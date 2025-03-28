import { createSmartsheetDirectAPI } from '../build/smartsheet-direct-api.js';
import dotenv from 'dotenv';

dotenv.config();

async function testCopySheetToFolder() {
  try {
    const api = createSmartsheetDirectAPI();
    
    // Get the sheet details
    console.log('Getting sheet details...');
    const sheetId = '7532263697764228'; // Claude sheet ID
    const sheet = await api.getSheet(sheetId);
    
    // Get or create the backup folder
    console.log('Getting or creating backup folder...');
    const workspaceId = sheet.workspace?.id;
    const backupFolderName = `Backup of ${sheet.name}`;
    
    // List folders in the workspace
    const foldersResponse = await api.listWorkspaceFolders(workspaceId);
    let backupFolder = foldersResponse.data?.find(folder => folder.name === backupFolderName);
    
    if (!backupFolder) {
      console.log(`Creating backup folder: ${backupFolderName}`);
      const createFolderResult = await api.createWorkspaceFolder(workspaceId, backupFolderName);
      backupFolder = createFolderResult.result;
    }
    
    console.log(`Using backup folder: ${backupFolder.name} (${backupFolder.id})`);
    
    // Test copying the sheet to the folder
    console.log('Copying sheet to folder...');
    const copyResult = await api.request('POST', `/sheets/${sheetId}/copy`, {
      newName: `Test Copy to Folder ${new Date().toLocaleTimeString()}`,
      destinationType: 'folder',
      destinationId: backupFolder.id
    });
    
    console.log('Copy result:', JSON.stringify(copyResult, null, 2));
    
    // Get the copied sheet to verify its location
    const copiedSheetId = copyResult.result.id;
    const copiedSheet = await api.getSheet(copiedSheetId);
    
    console.log('Copied sheet name:', copiedSheet.name);
    console.log('Copied sheet parent ID:', copiedSheet.parentId);
    console.log('Backup folder ID:', backupFolder.id);
    console.log('Parent ID matches backup folder ID:', copiedSheet.parentId === backupFolder.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCopySheetToFolder();