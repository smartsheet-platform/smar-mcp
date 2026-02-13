export type SmartsheetRegion = 'us' | 'eu';

export interface ParsedSmartsheetUrl {
  directIdToken: string;
  region: SmartsheetRegion;
}

const FRONTEND_HOST_REGION: Record<string, SmartsheetRegion> = {
  'app.smartsheet.com': 'us',
  'app.smartsheet.eu': 'eu',
};

const API_HOST_REGION: Record<string, SmartsheetRegion> = {
  'api.smartsheet.com': 'us',
  'api.smartsheet.eu': 'eu',
};

/**
 * Parses a Smartsheet frontend URL, extracting the directIdToken and detecting
 * the region (US: app.smartsheet.com, EU: app.smartsheet.eu).
 */
export function parseSmartsheetUrl(url: string): ParsedSmartsheetUrl | null {
  const tokenMatch = url.match(/\/sheets\/([^?\/]+)/);
  if (!tokenMatch) {
    return null;
  }

  const directIdToken = tokenMatch[1];
  let region: SmartsheetRegion = 'us';

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (FRONTEND_HOST_REGION[hostname]) {
      region = FRONTEND_HOST_REGION[hostname];
    }
  } catch {
    if (url.includes('smartsheet.eu')) {
      region = 'eu';
    }
  }

  return { directIdToken, region };
}

export function detectApiRegion(apiBaseUrl: string): SmartsheetRegion {
  try {
    const parsed = new URL(apiBaseUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (API_HOST_REGION[hostname]) {
      return API_HOST_REGION[hostname];
    }

    if (hostname.includes('smartsheet.eu') || hostname.includes('.eu')) {
      return 'eu';
    }
  } catch {
    if (apiBaseUrl.includes('smartsheet.eu')) {
      return 'eu';
    }
  }

  return 'us';
}

export function regionLabel(region: SmartsheetRegion): string {
  return region === 'eu' ? 'EU' : 'US';
}

/**
 * Returns an error message if the frontend URL region doesn't match the configured
 * API endpoint region, or null if they match. Region mismatches cause auth failures
 * because Smartsheet API keys are region-specific.
 */
export function validateRegionMatch(
  urlRegion: SmartsheetRegion,
  apiRegion: SmartsheetRegion
): string | null {
  if (urlRegion !== apiRegion) {
    const urlLabel = regionLabel(urlRegion);
    const apiLabel = regionLabel(apiRegion);
    return (
      `Region mismatch: the Smartsheet URL points to the ${urlLabel} region, ` +
      `but your SMARTSHEET_ENDPOINT is configured for the ${apiLabel} region. ` +
      `${urlLabel} sheets require a ${urlLabel} API token and endpoint. ` +
      `Set SMARTSHEET_ENDPOINT to https://api.smartsheet.${urlRegion === 'eu' ? 'eu' : 'com'}/2.0 ` +
      `and use a ${urlLabel} API token.`
    );
  }
  return null;
}
