import { SmartsheetAPI } from "./smartsheet-api.js";
import { User } from "../models/User.js";

export class SmartsheetUserAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Get user by ID 
   * @param userId ID of the user to get
   * @returns User data
   */
  async getUserById(userId: string): Promise<User> {
    return this.api.request('GET', `/users/${userId}`);
  }

  /**
   * Gets the current user
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    return this.api.request('GET', '/users/me');
  }

}