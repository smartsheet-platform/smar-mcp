import { SmartsheetAPI } from './smartsheet-api.js';

export type FavoriteType = 'sheet' | 'folder' | 'report' | 'template' | 'workspace' | 'sight';

export interface Favorite {
  type: FavoriteType;
  objectId: number;
}

export interface FavoriteResult {
  type: FavoriteType;
  objectId: number;
}

export class SmartsheetFavoritesAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * List all favorites
   */
  async listFavorites(): Promise<{ data: Favorite[] }> {
    return this.api.request<{ data: Favorite[] }>('GET', '/favorites');
  }

  /**
   * Add items to favorites
   */
  async addFavorites(favorites: Favorite[]): Promise<{ result: FavoriteResult[] }> {
    return this.api.request<{ result: FavoriteResult[] }>('POST', '/favorites', favorites);
  }

  /**
   * Add a sheet to favorites
   */
  async addSheetToFavorites(sheetId: number): Promise<{ result: FavoriteResult[] }> {
    return this.addFavorites([{ type: 'sheet', objectId: sheetId }]);
  }

  /**
   * Add a folder to favorites
   */
  async addFolderToFavorites(folderId: number): Promise<{ result: FavoriteResult[] }> {
    return this.addFavorites([{ type: 'folder', objectId: folderId }]);
  }

  /**
   * Add a report to favorites
   */
  async addReportToFavorites(reportId: number): Promise<{ result: FavoriteResult[] }> {
    return this.addFavorites([{ type: 'report', objectId: reportId }]);
  }

  /**
   * Add a workspace to favorites
   */
  async addWorkspaceToFavorites(workspaceId: number): Promise<{ result: FavoriteResult[] }> {
    return this.addFavorites([{ type: 'workspace', objectId: workspaceId }]);
  }

  /**
   * Add a dashboard/sight to favorites
   */
  async addDashboardToFavorites(sightId: number): Promise<{ result: FavoriteResult[] }> {
    return this.addFavorites([{ type: 'sight', objectId: sightId }]);
  }

  /**
   * Remove items from favorites
   */
  async removeFavorites(type: FavoriteType, objectIds: number[]): Promise<void> {
    await this.api.request<void>('DELETE', `/favorites/${type}`, undefined, {
      objectIds: objectIds.join(','),
    });
  }

  /**
   * Remove a sheet from favorites
   */
  async removeSheetFromFavorites(sheetId: number): Promise<void> {
    return this.removeFavorites('sheet', [sheetId]);
  }

  /**
   * Remove a folder from favorites
   */
  async removeFolderFromFavorites(folderId: number): Promise<void> {
    return this.removeFavorites('folder', [folderId]);
  }

  /**
   * Remove a workspace from favorites
   */
  async removeWorkspaceFromFavorites(workspaceId: number): Promise<void> {
    return this.removeFavorites('workspace', [workspaceId]);
  }
}
