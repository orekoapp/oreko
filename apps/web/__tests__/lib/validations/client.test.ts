import { describe, it, expect } from 'vitest';
import {
  clientTypeSchema,
  clientContactSchema,
  createClientSchema,
  updateClientSchema,
  clientFilterSchema,
  bulkDeleteClientsSchema,
  clientImportRowSchema,
  clientImportSchema,
} from '@/lib/validations/client';

describe('clientTypeSchema', () => {
  it('accepts individual', () => {
    const result = clientTypeSchema.safeParse('individual');
    expect(result.success).toBe(true);
  });

  it('accepts company', () => {
    const result = clientTypeSchema.safeParse('company');
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = clientTypeSchema.safeParse('other');
    expect(result.success).toBe(false);
  });
});

describe('clientContactSchema', () => {
  it('accepts valid contact', () => {
    const result = clientContactSchema.safeParse({
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-123-4567',
      role: 'Project Manager',
      isPrimary: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal contact', () => {
    const result = clientContactSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(true);
    expect(result.data?.isPrimary).toBe(false); // Default
  });

  it('requires name', () => {
    const result = clientContactSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('requires email', () => {
    const result = clientContactSchema.safeParse({
      name: 'John Smith',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = clientContactSchema.safeParse({
      name: '',
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 100 chars', () => {
    const result = clientContactSchema.safeParse({
      name: 'x'.repeat(101),
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('createClientSchema', () => {
  const validClient = {
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    type: 'company' as const,
    phone: '555-555-5555',
    website: 'https://acme.com',
    company: 'Acme Corp',
    taxId: '12-3456789',
    notes: 'Important client',
  };

  it('accepts valid client data', () => {
    const result = createClientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('accepts minimal client data', () => {
    const result = createClientSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('individual'); // Default
  });

  it('requires name', () => {
    const { name, ...withoutName } = validClient;
    const result = createClientSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it('requires email', () => {
    const { email, ...withoutEmail } = validClient;
    const result = createClientSchema.safeParse(withoutEmail);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createClientSchema.safeParse({ ...validClient, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name over 200 chars', () => {
    const result = createClientSchema.safeParse({ ...validClient, name: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts address', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial address', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      address: {
        city: 'New York',
        country: 'USA',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts tags', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      tags: ['VIP', 'Enterprise'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 tags', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      tags: Array(11).fill('tag'),
    });
    expect(result.success).toBe(false);
  });

  it('rejects tag over 50 chars', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      tags: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });

  it('accepts contacts', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      contacts: [
        { name: 'John', email: 'john@acme.com', isPrimary: true },
        { name: 'Jane', email: 'jane@acme.com' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 contacts', () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      contacts: Array(11).fill({ name: 'Contact', email: 'contact@example.com' }),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateClientSchema', () => {
  it('requires id', () => {
    const result = updateClientSchema.safeParse({
      name: 'Updated Name',
    });
    expect(result.success).toBe(false);
  });

  it('accepts update with just id', () => {
    const result = updateClientSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial update', () => {
    const result = updateClientSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Updated Name',
      phone: '555-123-4567',
    });
    expect(result.success).toBe(true);
  });
});

describe('clientFilterSchema', () => {
  it('accepts valid filter', () => {
    const result = clientFilterSchema.safeParse({
      page: 1,
      limit: 20,
      type: 'company',
      search: 'acme',
      tags: ['VIP'],
      hasQuotes: true,
      hasInvoices: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty filter', () => {
    const result = clientFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('coerces boolean strings', () => {
    const result = clientFilterSchema.safeParse({
      hasQuotes: 'true',
    });
    expect(result.success).toBe(true);
    expect(result.data?.hasQuotes).toBe(true);
  });
});

describe('bulkDeleteClientsSchema', () => {
  it('accepts array of client IDs', () => {
    const result = bulkDeleteClientsSchema.safeParse({
      ids: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty array', () => {
    const result = bulkDeleteClientsSchema.safeParse({
      ids: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 100 IDs', () => {
    const result = bulkDeleteClientsSchema.safeParse({
      ids: Array(101).fill('550e8400-e29b-41d4-a716-446655440000'),
    });
    expect(result.success).toBe(false);
  });
});

describe('clientImportRowSchema', () => {
  it('accepts valid import row', () => {
    const result = clientImportRowSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      company: 'Acme Corp',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal import row', () => {
    const result = clientImportRowSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = clientImportRowSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('requires email', () => {
    const result = clientImportRowSchema.safeParse({
      name: 'Test Client',
    });
    expect(result.success).toBe(false);
  });
});

describe('clientImportSchema', () => {
  it('accepts valid import', () => {
    const result = clientImportSchema.safeParse({
      clients: [
        { name: 'Client 1', email: 'client1@example.com' },
        { name: 'Client 2', email: 'client2@example.com' },
      ],
      skipDuplicates: true,
    });
    expect(result.success).toBe(true);
  });

  it('defaults skipDuplicates to true', () => {
    const result = clientImportSchema.safeParse({
      clients: [{ name: 'Client', email: 'client@example.com' }],
    });
    expect(result.success).toBe(true);
    expect(result.data?.skipDuplicates).toBe(true);
  });

  it('rejects empty clients array', () => {
    const result = clientImportSchema.safeParse({
      clients: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 500 clients', () => {
    const result = clientImportSchema.safeParse({
      clients: Array(501).fill({ name: 'Client', email: 'client@example.com' }),
    });
    expect(result.success).toBe(false);
  });
});
