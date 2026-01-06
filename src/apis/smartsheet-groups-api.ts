import { SmartsheetAPI } from './smartsheet-api.js';

export interface GroupMember {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  owner?: string;
  ownerId?: number;
  members?: GroupMember[];
  createdAt?: string;
  modifiedAt?: string;
}

export class SmartsheetGroupsAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * List all groups in the organization
   */
  async listGroups(): Promise<{ data: Group[] }> {
    return this.api.request<{ data: Group[] }>('GET', '/groups');
  }

  /**
   * Get a specific group
   */
  async getGroup(groupId: number): Promise<Group> {
    return this.api.request<Group>('GET', `/groups/${groupId}`);
  }

  /**
   * Create a new group
   */
  async createGroup(params: {
    name: string;
    description?: string;
    members?: Array<{ email: string }>;
  }): Promise<{ result: Group }> {
    return this.api.request<{ result: Group }>('POST', '/groups', params);
  }

  /**
   * Update a group
   */
  async updateGroup(
    groupId: number,
    updates: {
      name?: string;
      description?: string;
      ownerId?: number;
    }
  ): Promise<{ result: Group }> {
    return this.api.request<{ result: Group }>('PUT', `/groups/${groupId}`, updates);
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: number): Promise<void> {
    await this.api.request<void>('DELETE', `/groups/${groupId}`);
  }

  /**
   * Add members to a group
   */
  async addGroupMembers(
    groupId: number,
    members: Array<{ email: string }>
  ): Promise<{ result: GroupMember[] }> {
    return this.api.request<{ result: GroupMember[] }>(
      'POST',
      `/groups/${groupId}/members`,
      members
    );
  }

  /**
   * Remove a member from a group
   */
  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    await this.api.request<void>('DELETE', `/groups/${groupId}/members/${userId}`);
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const group = await this.getGroup(groupId);
    return group.members || [];
  }
}
