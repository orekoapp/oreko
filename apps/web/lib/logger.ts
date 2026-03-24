import pino from 'pino';

/**
 * Structured logger using pino.
 * - Production: 'warn' level (only warnings and errors)
 * - Development: 'debug' level (everything)
 *
 * PII fields (email, ip) are automatically redacted in production.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: isProduction ? 'warn' : 'debug',
  redact: isProduction
    ? {
        paths: ['email', 'ip', 'ipAddress', 'userAgent', '*.email', '*.ip', '*.ipAddress'],
        censor: '[REDACTED]',
      }
    : undefined,
  transport: isProduction
    ? undefined
    : {
        target: 'pino/file',
        options: { destination: 1 }, // stdout
      },
});

/**
 * Mask an email for safe logging: "da***@gmail.com"
 */
export function maskEmail(email: string): string {
  return email.replace(/(.{2}).*(@.*)/, '$1***$2');
}

/**
 * Mask an IP for safe logging: "192.168.***"
 */
export function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return '***';
}
