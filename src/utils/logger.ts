import { config } from 'dotenv';

// Ensure env vars are loaded
config();

/**
 * Centralized logger that enforces secret sanitization.
 * Writes to stderr to ensure stdout is reserved for MCP JSON-RPC protocol.
 */
export class Logger {
  private static secrets: string[] = [];

  static initialize() {
    if (process.env.SMARTSHEET_API_KEY) {
      this.secrets.push(process.env.SMARTSHEET_API_KEY);
    }
  }

  /**
   * Redacts known secrets from the message
   */
  private static sanitize(message: string): string {
    let sanitized = message;
    for (const secret of this.secrets) {
      if (secret && secret.length > 5) {
        // Avoid redacting short common strings
        sanitized = sanitized.split(secret).join('[REDACTED]');
      }
    }
    return sanitized;
  }

  private static format(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let text = `[${timestamp}] [${level}] ${message}`;

    if (meta) {
      try {
        const metaStr = JSON.stringify(meta);
        text += ` ${metaStr}`;
      } catch (e) {
        text += ` [Meta serialization failed]`;
      }
    }

    return this.sanitize(text);
  }

  static info(message: string, meta?: any) {
    console.error(this.format('INFO', message, meta));
  }

  static warn(message: string, meta?: any) {
    console.error(this.format('WARN', message, meta));
  }

  static error(message: string, meta?: any) {
    console.error(this.format('ERROR', message, meta));
  }

  static debug(message: string, meta?: any) {
    // Only debug if explicit env var set, or just always log to stderr?
    // Sticking to standard levels for now.
    console.error(this.format('DEBUG', message, meta));
  }
}

// Initialize immediately
Logger.initialize();
