import { createSmartsheetDirectAPI } from '../build/smartsheet-direct-api.js';
import dotenv from 'dotenv';

dotenv.config();

async function testWorkspaceFolders() {
  try {
    const api = createSmartsheetDirectAPI();
    
    // Get the workspace ID from the sheet
    console.log('Getting sheet details...');
    const sheetId = '7532263697764228'; // Claude sheet ID
    const sheet = await api.getSheet(sheetId);
    const workspaceId = sheet.workspace?.id;
    
    if (!workspaceId) {
      console.error('Sheet is not in a workspace');
      return;
    }
    
    console.log(`Sheet is in workspace: ${workspaceId} (${sheet.workspace.name})`);
    
    // List folders in the workspace
    console.log('Listing workspace folders...');
    const foldersResponse = await api.listWorkspaceFolders(workspaceId);
    console.log('Workspace folders:', JSON.stringify(foldersResponse, null, 2));
    
    // Check if backup folder exists
    const backupFolderName = `Backup of ${sheet.name}`;
    let backupFolder = foldersResponse.data?.find(folder => folder.name === backupFolderName);
    
    if (backupFolder) {
      console.log(`Found backup folder: ${backupFolder.name} (${backupFolder.id})`);
    } else {
      console.log(`Creating backup folder: ${backupFolderName}`);
      const createFolderResult = await api.createWorkspaceFolder(workspaceId, backupFolderName);
      backupFolder = createFolderResult.result;
      console.log(`Created backup folder: ${backupFolder.name} (${backupFolder.id})`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testWorkspaceFolders();