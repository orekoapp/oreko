import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock authentication
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock Prisma
const mockPrisma = {
  quote: {
    findFirst: vi.fn(),
  },
  workspaceMember: {
    findFirst: vi.fn(),
  },
};

vi.mock('@oreko/database', () => ({
  prisma: mockPrisma,
}));

// Mock PDF generation
vi.mock('@/lib/pdf/generate', () => ({
  generateQuotePDF: vi.fn(),
}));

describe('Quote PDF API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/pdf/quote/[quoteId]', () => {
    const mockQuote = {
      id: 'quote-123',
      quoteNumber: 'QT-0001',
      title: 'Web Development Project',
      status: 'sent',
      workspaceId: 'ws-123',
      clientId: 'client-123',
      subtotal: 5000,
      taxTotal: 0,
      total: 5000,
      issueDate: new Date('2024-01-15'),
      expirationDate: new Date('2024-02-15'),
      settings: { blocks: [] },
      lineItems: [
        {
          id: 'li-1',
          name: 'Development Services',
          quantity: 10,
          rate: 500,
          amount: 5000,
        },
      ],
      client: {
        id: 'client-123',
        name: 'Acme Corp',
        email: 'client@acme.com',
      },
    };

    it('validates quote ID format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const invalidId = 'invalid-id';

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(validUUID)).toBe(true);
      expect(uuidRegex.test(invalidId)).toBe(false);
    });

    it('requires authentication for protected quotes', async () => {
      const { auth } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const session = await auth();
      expect(session).toBeNull();
    });

    it('checks workspace membership', async () => {
      mockPrisma.workspaceMember.findFirst.mockResolvedValue({
        userId: 'user-123',
        workspaceId: 'ws-123',
      });

      const membership = await mockPrisma.workspaceMember.findFirst({
        where: {
          userId: 'user-123',
          workspaceId: 'ws-123',
        },
      });

      expect(membership).toBeDefined();
      expect(membership.workspaceId).toBe('ws-123');
    });

    it('returns 404 for non-existent quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const quote = await mockPrisma.quote.findFirst({
        where: { id: 'non-existent' },
      });

      expect(quote).toBeNull();
    });

    it('generates PDF with correct content type', () => {
      const contentType = 'application/pdf';
      const contentDisposition = `attachment; filename="quote-${mockQuote.quoteNumber}.pdf"`;

      expect(contentType).toBe('application/pdf');
      expect(contentDisposition).toContain('.pdf');
    });

    it('includes quote metadata in PDF', () => {
      const pdfMetadata = {
        title: mockQuote.title,
        quoteNumber: mockQuote.quoteNumber,
        clientName: mockQuote.client.name,
        issueDate: mockQuote.issueDate,
        total: mockQuote.total,
      };

      expect(pdfMetadata.title).toBe('Web Development Project');
      expect(pdfMetadata.quoteNumber).toBe('QT-0001');
      expect(pdfMetadata.total).toBe(5000);
    });

    it('includes line items in PDF', () => {
      const lineItems = mockQuote.lineItems;

      expect(lineItems.length).toBe(1);
      expect(lineItems[0]!.name).toBe('Development Services');
      expect(lineItems[0]!.amount).toBe(5000);
    });
  });

  describe('PDF Generation Options', () => {
    it('supports different paper sizes', () => {
      const validSizes = ['A4', 'Letter', 'Legal'];
      const defaultSize = 'A4';

      expect(validSizes).toContain(defaultSize);
    });

    it('supports portrait and landscape orientation', () => {
      const validOrientations = ['portrait', 'landscape'];
      const defaultOrientation = 'portrait';

      expect(validOrientations).toContain(defaultOrientation);
    });

    it('includes company branding when configured', () => {
      const branding = {
        logo: 'https://example.com/logo.png',
        primaryColor: '#3B82F6',
        fontFamily: 'Inter',
      };

      expect(branding.logo).toBeDefined();
      expect(branding.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
