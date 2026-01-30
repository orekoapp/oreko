import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  urlSchema,
  partialAddressSchema,
  idSchema,
  listQuerySchema,
} from './common';

// Client type enum
export const clientTypeSchema = z.enum(['individual', 'company']);

// Client contact schema
export const clientContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(100),
  email: emailSchema,
  phone: phoneSchema,
  role: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
});

// Create client schema
export const createClientSchema = z.object({
  type: clientTypeSchema.default('individual'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  email: emailSchema,
  phone: phoneSchema,
  website: urlSchema,
  company: z.string().max(200).optional(),
  taxId: z.string().max(50).optional(),
  address: partialAddressSchema.optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  contacts: z.array(clientContactSchema).max(10).optional(),
});

// Update client schema (all fields optional except ID)
export const updateClientSchema = createClientSchema.partial().extend({
  id: idSchema,
});

// Client filter schema
export const clientFilterSchema = listQuerySchema.extend({
  type: clientTypeSchema.optional(),
  tags: z.array(z.string()).optional(),
  hasQuotes: z.coerce.boolean().optional(),
  hasInvoices: z.coerce.boolean().optional(),
});

// Client ID param schema
export const clientIdSchema = z.object({
  id: idSchema,
});

// Bulk delete schema
export const bulkDeleteClientsSchema = z.object({
  ids: z.array(idSchema).min(1, 'At least one client ID is required').max(100),
});

// Client import schema (for CSV import)
export const clientImportRowSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
  phone: z.string().optional(),
  company: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const clientImportSchema = z.object({
  clients: z.array(clientImportRowSchema).min(1).max(500),
  skipDuplicates: z.boolean().default(true),
});

// Type exports
export type ClientType = z.infer<typeof clientTypeSchema>;
export type ClientContact = z.infer<typeof clientContactSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
export type ClientImportRow = z.infer<typeof clientImportRowSchema>;
export type ClientImportInput = z.infer<typeof clientImportSchema>;
