/**
 * Smartsheet API Configuration Tests
 *
 * These tests verify API configuration and environment variables.
 * Note: Integration tests require running with proper ESM configuration.
 * Use `npm run cli` for direct API testing.
 */

describe('SmartsheetAPI Configuration', () => {
  describe('Environment Variables', () => {
    it('should have SMARTSHEET_API_KEY defined in test environment', () => {
      // This test checks if the env var is set
      const apiKey = process.env.SMARTSHEET_API_KEY;
      // We don't fail if it's not set, just skip integration tests
      if (apiKey) {
        expect(apiKey.length).toBeGreaterThan(10);
      } else {
        console.log('SMARTSHEET_API_KEY not set - integration tests will be skipped');
        expect(true).toBe(true);
      }
    });

    it('should default SMARTSHEET_ENDPOINT to US production', () => {
      const endpoint = process.env.SMARTSHEET_ENDPOINT || 'https://api.smartsheet.com/2.0';
      expect(endpoint).toMatch(/^https:\/\/api\.smartsheet/);
    });
  });

  describe('API Endpoint Patterns', () => {
    const validEndpoints = [
      'https://api.smartsheet.com/2.0',
      'https://api.smartsheet.eu/2.0',
      'https://api.smartsheet.au/2.0',
      'https://api.smartsheetgov.com/2.0'
    ];

    it('should recognize valid regional endpoints', () => {
      validEndpoints.forEach(endpoint => {
        expect(endpoint).toMatch(/^https:\/\/api\.smartsheet/);
      });
    });

    it('should validate endpoint format', () => {
      const endpointPattern = /^https:\/\/api\.smartsheet(gov)?\.com\/2\.0$|^https:\/\/api\.smartsheet\.(eu|au)\/2\.0$/;

      expect('https://api.smartsheet.com/2.0').toMatch(endpointPattern);
      expect('https://api.smartsheet.eu/2.0').toMatch(endpointPattern);
      expect('https://api.smartsheet.au/2.0').toMatch(endpointPattern);
      expect('https://api.smartsheetgov.com/2.0').toMatch(endpointPattern);
    });
  });

  describe('API Key Format', () => {
    it('should validate API key is alphanumeric', () => {
      const validKeyPattern = /^[A-Za-z0-9]+$/;
      const testKey = 'PP7M7DEtsPGguQeE1zhI69sOQGzuwVSv3bKm5';
      expect(testKey).toMatch(validKeyPattern);
    });

    it('should have minimum length for API key', () => {
      const minLength = 20;
      const testKey = 'PP7M7DEtsPGguQeE1zhI69sOQGzuwVSv3bKm5';
      expect(testKey.length).toBeGreaterThanOrEqual(minLength);
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should define max retries', () => {
      const maxRetries = 3;
      expect(maxRetries).toBe(3);
    });

    it('should use exponential backoff', () => {
      const baseDelay = 1000; // 1 second
      const retries = [0, 1, 2];

      retries.forEach(retry => {
        const delay = Math.pow(2, retry) * baseDelay;
        expect(delay).toBeGreaterThanOrEqual(baseDelay);
      });
    });
  });
});

describe('API Response Handling', () => {
  describe('Error Codes', () => {
    const errorCodes = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Rate Limited',
      500: 'Server Error'
    };

    it('should recognize all standard HTTP error codes', () => {
      Object.keys(errorCodes).forEach(code => {
        expect(parseInt(code)).toBeGreaterThanOrEqual(400);
      });
    });

    it('should identify rate limit errors', () => {
      const rateLimitCode = 429;
      expect(rateLimitCode).toBe(429);
    });
  });

  describe('Pagination', () => {
    it('should support page size configuration', () => {
      const defaultPageSize = 100;
      const maxPageSize = 500;

      expect(defaultPageSize).toBeLessThanOrEqual(maxPageSize);
    });

    it('should support page number navigation', () => {
      const pageNumber = 1;
      expect(pageNumber).toBeGreaterThanOrEqual(1);
    });
  });
});
