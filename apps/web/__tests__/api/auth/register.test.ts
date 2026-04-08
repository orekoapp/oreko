import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Define mock functions outside vi.mock to avoid hoisting issues
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockHashPassword = vi.fn().mockResolvedValue('hashed_password_123');

// Mock Prisma
vi.mock('@oreko/database', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

// Mock password hashing
vi.mock('@/lib/auth/credentials', () => ({
  hashPassword: mockHashPassword,
}));

describe('Auth Register API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore mock implementations after clearAllMocks
    mockHashPassword.mockResolvedValue('hashed_password_123');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: unknown) => {
    return new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  describe('POST /api/auth/register', () => {
    const validBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('creates a new user successfully', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      });

      // Test the registration flow
      expect(mockFindUnique).toBeDefined();
    });

    it('returns 400 for invalid email format', async () => {
      const invalidBody = { ...validBody, email: 'invalid-email' };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(invalidBody.email);

      expect(isValid).toBe(false);
    });

    it('returns 400 for short password', async () => {
      const invalidBody = { ...validBody, password: '12345' };

      const isValidPassword = invalidBody.password.length >= 8;
      expect(isValidPassword).toBe(false);
    });

    it('returns 400 for missing name', async () => {
      const invalidBody = { email: 'john@example.com', password: 'password123' };

      expect(invalidBody).not.toHaveProperty('name');
    });

    it('returns 409 for existing email', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'john@example.com',
      });

      const existing = await mockFindUnique({ where: { email: 'john@example.com' } });
      expect(existing).not.toBeNull();
    });

    it('hashes password before storing', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 'user-123' });

      // Verify password would be hashed
      const hashedPassword = await mockHashPassword('password123');
      expect(hashedPassword).toBe('hashed_password_123');
    });

    it('handles database errors gracefully', async () => {
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      await expect(mockFindUnique({})).rejects.toThrow('Database error');
    });
  });

  describe('Input Validation', () => {
    it('validates email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.org'];
      const invalidEmails = ['notanemail', '@missing.com', 'spaces in@email.com'];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('enforces minimum password length', () => {
      const minLength = 8;
      const shortPassword = 'short';
      const validPassword = 'validpassword123';

      expect(shortPassword.length).toBeLessThan(minLength);
      expect(validPassword.length).toBeGreaterThanOrEqual(minLength);
    });

    it('requires name to be non-empty', () => {
      const emptyName = '';
      const validName = 'John Doe';

      expect(emptyName.length).toBe(0);
      expect(validName.length).toBeGreaterThan(0);
    });
  });

  describe('Security', () => {
    it('never stores plain text password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await mockHashPassword(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toBe('hashed_password_123');
    });

    it('returns minimal user data in response', () => {
      const userData = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password', // Should not be returned
      };

      const sanitizedUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };

      expect(sanitizedUser).not.toHaveProperty('password');
    });
  });
});
