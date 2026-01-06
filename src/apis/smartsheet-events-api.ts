import { SmartsheetAPI } from './smartsheet-api.js';

export interface Event {
  eventId: string;
  objectType: 'SHEET' | 'WORKSPACE' | 'FOLDER' | 'REPORT' | 'DASHBOARD' | 'ROW' | 'COLUMN' | 'CELL' | 'ATTACHMENT' | 'DISCUSSION' | 'COMMENT' | 'USER' | 'GROUP' | 'ACCESS_TOKEN';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE' | 'COPY' | 'LOAD' | 'SHARE' | 'UNSHARE' | 'RENAME' | 'ACTIVATE' | 'DEACTIVATE' | 'PURGE' | 'RESTORE' | 'LOGIN' | 'SEND' | 'DOWNLOAD' | 'IMPORT';
  objectId: number;
  eventTimestamp: string;
  userId: number;
  requestUserId?: number;
  source: 'WEB_APP' | 'MOBILE_ANDROID' | 'MOBILE_IOS' | 'API' | 'UNKNOWN';
  additionalDetails?: Record<string, any>;
}

export interface EventsResponse {
  data: Event[];
  moreAvailable: boolean;
  nextStreamPosition?: string;
}

export class SmartsheetEventsAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Get events from the event stream
   * Requires admin privileges
   */
  async getEvents(params?: {
    since?: string; // ISO 8601 datetime or stream position
    maxCount?: number; // Max events to return (1-10000, default 1000)
    numericDates?: boolean; // Return dates as milliseconds since epoch
  }): Promise<EventsResponse> {
    const queryParams: Record<string, any> = {};

    if (params?.since) {
      queryParams.since = params.since;
    }
    if (params?.maxCount) {
      queryParams.maxCount = params.maxCount;
    }
    if (params?.numericDates !== undefined) {
      queryParams.numericDates = params.numericDates;
    }

    return this.api.request<EventsResponse>('GET', '/events', undefined, queryParams);
  }

  /**
   * Get events since a specific timestamp
   */
  async getEventsSince(timestamp: string, maxCount?: number): Promise<EventsResponse> {
    return this.getEvents({ since: timestamp, maxCount });
  }

  /**
   * Get the next page of events using a stream position
   */
  async getEventsFromPosition(streamPosition: string, maxCount?: number): Promise<EventsResponse> {
    return this.getEvents({ since: streamPosition, maxCount });
  }

  /**
   * Get recent events (last 24 hours)
   */
  async getRecentEvents(maxCount?: number): Promise<EventsResponse> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getEvents({ since: yesterday.toISOString(), maxCount });
  }

  /**
   * Get events filtered by object type
   * Note: Filtering is done client-side as API doesn't support filtering
   */
  async getEventsByObjectType(
    objectType: Event['objectType'],
    params?: {
      since?: string;
      maxCount?: number;
    }
  ): Promise<Event[]> {
    const response = await this.getEvents(params);
    return response.data.filter(event => event.objectType === objectType);
  }

  /**
   * Get events filtered by action type
   * Note: Filtering is done client-side as API doesn't support filtering
   */
  async getEventsByAction(
    action: Event['action'],
    params?: {
      since?: string;
      maxCount?: number;
    }
  ): Promise<Event[]> {
    const response = await this.getEvents(params);
    return response.data.filter(event => event.action === action);
  }

  /**
   * Get all events by paginating through the stream
   */
  async getAllEvents(
    since: string,
    maxTotal?: number
  ): Promise<Event[]> {
    const allEvents: Event[] = [];
    let streamPosition = since;
    let hasMore = true;

    while (hasMore && (!maxTotal || allEvents.length < maxTotal)) {
      const response = await this.getEvents({
        since: streamPosition,
        maxCount: Math.min(10000, maxTotal ? maxTotal - allEvents.length : 10000),
      });

      allEvents.push(...response.data);
      hasMore = response.moreAvailable;

      if (response.nextStreamPosition) {
        streamPosition = response.nextStreamPosition;
      } else {
        break;
      }
    }

    return maxTotal ? allEvents.slice(0, maxTotal) : allEvents;
  }
}
