export interface FormattedError {
  isError: true;
  content: Array<{ type: 'text'; text: string }>;
}

export class SmartsheetErrorMapper {
  /**
   * Maps an unknown error (likely from axios/Smartsheet) to a user-friendly message
   */
  static getErrorMessage(error: any): string {
    if (!error) return 'Unknown Error (Null/Undefined)';

    // Handle string errors
    if (typeof error === 'string') return error;

    // 1. Handle Axios Response Errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Smartsheet structured error
      if (data && data.errorCode) {
        switch (data.errorCode) {
          case 1002:
            return `Access Denied: Your API Token is invalid or expired. Check SMARTSHEET_API_KEY.`;
          case 1003:
            return `Permission Denied: You do not have access to this resource.`;
          case 1004:
            return `Resource Not Found: The requested Sheet, Row, or Column does not exist.`;
          case 4004:
            return `Row Not Found: The specified row ID could not be located.`;
          default:
            return `Smartsheet API Error ${data.errorCode}: ${data.message}`;
        }
      }

      return `Smartsheet API Error (${status}): ${JSON.stringify(data)}`;
    }

    // 2. Handle Network/Request Errors
    if (error.request) {
      return `Network Error: Could not connect to Smartsheet API. Check your internet connection.`;
    }

    // 3. Handle Standard JS Errors
    return error.message || 'Unknown Error';
  }

  /**
   * Creates a standard MCP failure response
   */
  static formatError(error: any): FormattedError {
    const message = this.getErrorMessage(error);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: message,
        },
      ],
    };
  }
}
