import { SmartsheetAPI } from './smartsheet-api.js';

export interface Webhook {
  id: number;
  name: string;
  callbackUrl: string;
  scope: string;
  scopeObjectId: number;
  events: string[];
  version: number;
  status: string;
  enabled: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

export interface WebhookCreateParams {
  name: string;
  callbackUrl: string;
  scope: 'sheet' | 'workspace';
  scopeObjectId: number;
  events: string[];
  version?: number;
}

export class SmartsheetWebhookAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * List all webhooks for the current user
   */
  async listWebhooks(): Promise<{ data: Webhook[] }> {
    return this.api.request<{ data: Webhook[] }>('GET', '/webhooks');
  }

  /**
   * Get a specific webhook by ID
   */
  async getWebhook(webhookId: number): Promise<Webhook> {
    return this.api.request<Webhook>('GET', `/webhooks/${webhookId}`);
  }

  /**
   * Create a new webhook
   */
  async createWebhook(params: WebhookCreateParams): Promise<{ result: Webhook }> {
    return this.api.request<{ result: Webhook }>('POST', '/webhooks', {
      name: params.name,
      callbackUrl: params.callbackUrl,
      scope: params.scope,
      scopeObjectId: params.scopeObjectId,
      events: params.events,
      version: params.version || 1,
    });
  }

  /**
   * Update a webhook (enable/disable or change properties)
   */
  async updateWebhook(webhookId: number, updates: Partial<{ enabled: boolean; callbackUrl: string }>): Promise<{ result: Webhook }> {
    return this.api.request<{ result: Webhook }>('PUT', `/webhooks/${webhookId}`, updates);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: number): Promise<void> {
    await this.api.request<void>('DELETE', `/webhooks/${webhookId}`);
  }

  /**
   * Reset a webhook's shared secret
   */
  async resetWebhookSecret(webhookId: number): Promise<{ result: { sharedSecret: string } }> {
    return this.api.request<{ result: { sharedSecret: string } }>('POST', `/webhooks/${webhookId}/resetsharedsecret`);
  }
}
