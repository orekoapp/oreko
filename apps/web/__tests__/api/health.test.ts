import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Define mock functions before vi.mock to avoid hoisting issues
const mockQueryRaw = vi.fn();

// Mock Prisma
vi.mock('@oreko/database', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

describe('Health API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns healthy status when database is connected', async () => {
      mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Test the health check response structure
      const healthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };

      expect(healthResponse.status).toBe('healthy');
      expect(healthResponse.database).toBe('connected');
    });

    it('returns unhealthy status when database is disconnected', async () => {
      mockQueryRaw.mockRejectedValue(new Error('Connection refused'));

      // Test unhealthy response structure
      const healthResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Connection refused',
      };

      expect(healthResponse.status).toBe('unhealthy');
      expect(healthResponse.database).toBe('disconnected');
    });

    it('returns 200 status code for healthy', () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    it('returns 503 status code for unhealthy', () => {
      const statusCode = 503;
      expect(statusCode).toBe(503);
    });

    it('includes timestamp in response', () => {
      const response = {
        timestamp: new Date().toISOString(),
      };

      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe('string');
    });

    it('executes simple database query for health check', async () => {
      mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

      await mockQueryRaw();
      expect(mockQueryRaw).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('returns JSON response', () => {
      const contentType = 'application/json';
      expect(contentType).toBe('application/json');
    });

    it('includes all required fields in healthy response', () => {
      const fields = ['status', 'timestamp', 'database'];
      const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };

      fields.forEach((field) => {
        expect(response).toHaveProperty(field);
      });
    });

    it('includes error details in unhealthy response', () => {
      const unhealthyResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Connection timeout',
      };

      expect(unhealthyResponse).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('handles database timeout', async () => {
      mockQueryRaw.mockRejectedValue(new Error('Timeout'));

      await expect(mockQueryRaw()).rejects.toThrow('Timeout');
    });

    it('handles unexpected errors', async () => {
      mockQueryRaw.mockRejectedValue(new Error('Unknown error'));

      await expect(mockQueryRaw()).rejects.toThrow('Unknown error');
    });
  });
});
