import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    workspace: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    businessProfile: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), create: vi.fn() },
    brandingSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    taxRate: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    numberSequence: { findMany: vi.fn(), upsert: vi.fn() },
    paymentSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    workspaceInvitation: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    rateCard: { count: vi.fn() },
    $transaction: vi.fn((fn: any) => fn(mockPrisma)),
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/workspace/get-current-workspace', () => ({ getCurrentUserWorkspace: mockGetCurrentUserWorkspace }));
vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: {
    InputJsonValue: {},
    Decimal: class { value: number; constructor(v: number) { this.value = v; } toNumber() { return this.value; } },
  },
}));
import {
  getWorkspace,
  updateWorkspaceName,
  getBusinessProfile,
  updateBusinessProfile,
  getTaxRates,
  createTaxRate,
  deleteTaxRate,
} from '@/lib/settings/actions';

describe('Settings Actions', () => {
  const WORKSPACE_ID = 'ws-123';
  const USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
    });
  });

  describe('getWorkspace', () => {
    it('returns workspace data', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: WORKSPACE_ID,
        name: 'Test Workspace',
        slug: 'test-workspace',
        ownerId: USER_ID,
        createdAt: new Date(),
      });

      const result = await getWorkspace();

      expect(result.id).toBe(WORKSPACE_ID);
      expect(result.name).toBe('Test Workspace');
      expect(result.slug).toBe('test-workspace');
    });

    it('throws when workspace not found', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      await expect(getWorkspace()).rejects.toThrow('Workspace not found');
    });
  });

  describe('updateWorkspaceName', () => {
    it('updates the workspace name', async () => {
      mockPrisma.workspace.update.mockResolvedValue({ id: WORKSPACE_ID, name: 'New Name' });

      await updateWorkspaceName('New Name');

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: WORKSPACE_ID },
        data: { name: 'New Name' },
      });
    });
  });

  describe('getBusinessProfile', () => {
    it('returns business profile data', async () => {
      mockPrisma.businessProfile.findUnique.mockResolvedValue({
        businessName: 'Acme Corp',
        logoUrl: null,
        email: 'billing@acme.com',
        phone: '+1234567890',
        website: 'https://acme.com',
        address: { street: '123 Main St', city: 'NYC', state: 'NY', postalCode: '10001', country: 'US' },
        taxId: 'TAX-123',
        currency: 'USD',
        timezone: 'America/New_York',
      });

      const result = await getBusinessProfile();

      expect(result).not.toBeNull();
      expect(result!.businessName).toBe('Acme Corp');
      expect(result!.currency).toBe('USD');
    });

    it('returns null when no profile exists', async () => {
      mockPrisma.businessProfile.findUnique.mockResolvedValue(null);

      const result = await getBusinessProfile();

      expect(result).toBeNull();
    });
  });

  describe('updateBusinessProfile', () => {
    it('updates existing business profile', async () => {
      mockPrisma.businessProfile.findUnique.mockResolvedValue({ workspaceId: WORKSPACE_ID, businessName: 'Old' });
      mockPrisma.businessProfile.update.mockResolvedValue({ businessName: 'Updated' });

      await updateBusinessProfile({ businessName: 'Updated' });

      expect(mockPrisma.businessProfile.update).toHaveBeenCalledTimes(1);
      const updateCall = mockPrisma.businessProfile.update.mock.calls[0]![0];
      expect(updateCall.where.workspaceId).toBe(WORKSPACE_ID);
    });

    it('creates business profile when none exists', async () => {
      mockPrisma.businessProfile.findUnique.mockResolvedValue(null);
      mockPrisma.businessProfile.create.mockResolvedValue({ businessName: 'New' });

      await updateBusinessProfile({ businessName: 'New' });

      expect(mockPrisma.businessProfile.create).toHaveBeenCalledTimes(1);
      const createCall = mockPrisma.businessProfile.create.mock.calls[0]![0];
      expect(createCall.data.workspaceId).toBe(WORKSPACE_ID);
    });
  });

  describe('getTaxRates', () => {
    it('returns tax rates for workspace', async () => {
      mockPrisma.taxRate.findMany.mockResolvedValue([
        { id: 'tr-1', name: 'Sales Tax', rate: 10, description: null, isInclusive: false, isDefault: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const result = await getTaxRates();

      expect(result.length).toBe(1);
      expect(result[0]!.name).toBe('Sales Tax');
    });
  });

  describe('createTaxRate', () => {
    it('creates a tax rate', async () => {
      mockPrisma.taxRate.create.mockResolvedValue({ id: 'tr-new' });

      const result = await createTaxRate({ name: 'GST', rate: 18 });

      expect(result.id).toBe('tr-new');
      const createCall = mockPrisma.taxRate.create.mock.calls[0]![0];
      expect(createCall.data.workspaceId).toBe(WORKSPACE_ID);
      expect(createCall.data.name).toBe('GST');
    });
  });

  describe('deleteTaxRate', () => {
    it('deletes a tax rate belonging to workspace', async () => {
      mockPrisma.taxRate.findFirst.mockResolvedValue({ id: 'tr-1', workspaceId: WORKSPACE_ID });
      mockPrisma.rateCard.count.mockResolvedValue(0);
      mockPrisma.taxRate.delete.mockResolvedValue({ id: 'tr-1' });

      await expect(deleteTaxRate('tr-1')).resolves.not.toThrow();
    });

    it('throws when tax rate not found', async () => {
      mockPrisma.taxRate.findFirst.mockResolvedValue(null);

      await expect(deleteTaxRate('nonexistent')).rejects.toThrow('Tax rate not found');
    });

    it('prevents deleting tax rate in use by rate cards', async () => {
      mockPrisma.taxRate.findFirst.mockResolvedValue({ id: 'tr-1', workspaceId: WORKSPACE_ID });
      mockPrisma.rateCard.count.mockResolvedValue(2);

      await expect(deleteTaxRate('tr-1')).rejects.toThrow('Cannot delete tax rate');
    });
  });
});
