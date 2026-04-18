import {
  parseSmartsheetUrl,
  detectApiRegion,
  regionLabel,
  validateRegionMatch,
  type SmartsheetRegion,
} from '../url-utils.js';

describe('parseSmartsheetUrl', () => {
  describe('valid URLs - US region', () => {
    it('parses a standard US sheet URL', () => {
      const result = parseSmartsheetUrl(
        'https://app.smartsheet.com/sheets/abc123XYZ'
      );
      expect(result).toEqual({ directIdToken: 'abc123XYZ', region: 'us' });
    });

    it('parses a US URL with query string', () => {
      const result = parseSmartsheetUrl(
        'https://app.smartsheet.com/sheets/token123?view=grid'
      );
      expect(result).toEqual({ directIdToken: 'token123', region: 'us' });
    });

    it('parses a US URL with trailing path segments', () => {
      const result = parseSmartsheetUrl(
        'https://app.smartsheet.com/sheets/token456/details'
      );
      expect(result).toEqual({ directIdToken: 'token456', region: 'us' });
    });

    it('treats unknown hostnames as US by default', () => {
      const result = parseSmartsheetUrl(
        'https://app.example.com/sheets/foo'
      );
      expect(result).toEqual({ directIdToken: 'foo', region: 'us' });
    });
  });

  describe('valid URLs - EU region', () => {
    it('parses a standard EU sheet URL', () => {
      const result = parseSmartsheetUrl(
        'https://app.smartsheet.eu/sheets/euToken789'
      );
      expect(result).toEqual({ directIdToken: 'euToken789', region: 'eu' });
    });

    it('detects EU region case-insensitively', () => {
      const result = parseSmartsheetUrl(
        'https://APP.SMARTSHEET.EU/sheets/MixedCase'
      );
      expect(result).toEqual({ directIdToken: 'MixedCase', region: 'eu' });
    });

    it('parses an EU URL with query string', () => {
      const result = parseSmartsheetUrl(
        'https://app.smartsheet.eu/sheets/euTok?ss_d=abc'
      );
      expect(result).toEqual({ directIdToken: 'euTok', region: 'eu' });
    });
  });

  describe('invalid URLs', () => {
    it('returns null for a URL without /sheets/', () => {
      expect(parseSmartsheetUrl('https://app.smartsheet.com/dashboards/123'))
        .toBeNull();
    });

    it('returns null for a malformed URL with no sheet token', () => {
      expect(parseSmartsheetUrl('not a url at all')).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(parseSmartsheetUrl('')).toBeNull();
    });

    it('returns null for a URL with /sheets/ but no token', () => {
      expect(parseSmartsheetUrl('https://app.smartsheet.com/sheets/'))
        .toBeNull();
    });
  });

  describe('fallback path (URL constructor failure)', () => {
    it('still detects EU region from a non-URL string containing smartsheet.eu', () => {
      const result = parseSmartsheetUrl('app.smartsheet.eu/sheets/fallbackToken');
      expect(result).toEqual({
        directIdToken: 'fallbackToken',
        region: 'eu',
      });
    });

    it('defaults to US for non-URL string without EU marker', () => {
      const result = parseSmartsheetUrl('app.smartsheet.com/sheets/usFallback');
      expect(result).toEqual({
        directIdToken: 'usFallback',
        region: 'us',
      });
    });
  });
});

describe('detectApiRegion', () => {
  it('returns "us" for the canonical US API endpoint', () => {
    expect(detectApiRegion('https://api.smartsheet.com/2.0')).toBe('us');
  });

  it('returns "eu" for the canonical EU API endpoint', () => {
    expect(detectApiRegion('https://api.smartsheet.eu/2.0')).toBe('eu');
  });

  it('detects EU from hostname containing smartsheet.eu', () => {
    expect(detectApiRegion('https://api-staging.smartsheet.eu/2.0')).toBe('eu');
  });

  it('detects EU from hostnames ending in .eu', () => {
    expect(detectApiRegion('https://api.smartsheet.eu/2.0')).toBe('eu');
  });

  it('returns "us" for unknown hostnames as a safe default', () => {
    expect(detectApiRegion('https://api.example.com/2.0')).toBe('us');
  });

  it('falls back to EU detection on malformed URL with smartsheet.eu', () => {
    expect(detectApiRegion('not-a-url-but-contains-smartsheet.eu'))
      .toBe('eu');
  });

  it('falls back to US for malformed URLs without EU marker', () => {
    expect(detectApiRegion('not-a-url')).toBe('us');
  });

  it('handles hostnames case-insensitively', () => {
    expect(detectApiRegion('https://API.SMARTSHEET.EU/2.0')).toBe('eu');
  });
});

describe('regionLabel', () => {
  it('returns "US" for the us region', () => {
    expect(regionLabel('us')).toBe('US');
  });

  it('returns "EU" for the eu region', () => {
    expect(regionLabel('eu')).toBe('EU');
  });
});

describe('validateRegionMatch', () => {
  it('returns null when regions match (us/us)', () => {
    expect(validateRegionMatch('us', 'us')).toBeNull();
  });

  it('returns null when regions match (eu/eu)', () => {
    expect(validateRegionMatch('eu', 'eu')).toBeNull();
  });

  describe('mismatch: EU URL with US endpoint', () => {
    let message: string;
    beforeAll(() => {
      message = validateRegionMatch('eu', 'us') as string;
    });

    it('returns a non-null error message', () => {
      expect(message).not.toBeNull();
      expect(typeof message).toBe('string');
    });

    it('mentions both regions clearly', () => {
      expect(message).toContain('EU region');
      expect(message).toContain('US region');
    });

    it('suggests the correct EU endpoint', () => {
      expect(message).toContain('https://api.smartsheet.eu/2.0');
    });

    it('explains why a region-specific token is required', () => {
      expect(message).toContain('EU API token');
    });
  });

  describe('mismatch: US URL with EU endpoint', () => {
    let message: string;
    beforeAll(() => {
      message = validateRegionMatch('us', 'eu') as string;
    });

    it('returns a non-null error message', () => {
      expect(message).not.toBeNull();
    });

    it('suggests the correct US endpoint', () => {
      expect(message).toContain('https://api.smartsheet.com/2.0');
    });

    it('explains a US token is required', () => {
      expect(message).toContain('US API token');
    });
  });

  it('produces a helpful diagnostic for every region pair', () => {
    const pairs: Array<[SmartsheetRegion, SmartsheetRegion]> = [
      ['us', 'eu'],
      ['eu', 'us'],
    ];
    for (const [urlRegion, apiRegion] of pairs) {
      const msg = validateRegionMatch(urlRegion, apiRegion);
      expect(msg).toMatch(/Region mismatch/);
      expect(msg).toMatch(/SMARTSHEET_ENDPOINT/);
    }
  });
});
