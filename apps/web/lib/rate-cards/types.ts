import type { RateCard, RateCardCategory, TaxRate } from '@oreko/database';

// Rate card with relations
export type RateCardWithRelations = RateCard & {
  category?: RateCardCategory | null;
  taxRate?: TaxRate | null;
  _count?: {
    quoteLineItems: number;
    invoiceLineItems: number;
  };
};

// Rate card category with relations
export type RateCardCategoryWithRelations = RateCardCategory & {
  rateCards?: RateCard[];
  _count?: {
    rateCards: number;
  };
};

// Pricing type options
export type PricingType = 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'per_unit';

// Rate card list item (for list views)
export interface RateCardListItem {
  id: string;
  name: string;
  description: string | null;
  pricingType: string;
  rate: number;
  unit: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  taxRateId: string | null;
  taxRateName: string | null;
  taxRatePercentage: number | null;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Rate card detail (for detail/edit views)
export interface RateCardDetail {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  pricingType: string;
  rate: number;
  unit: string | null;
  categoryId: string | null;
  taxRateId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  taxRate: {
    id: string;
    name: string;
    rate: number;
  } | null;
  _count: {
    quoteLineItems: number;
    invoiceLineItems: number;
  };
}

// Category list item
export interface CategoryListItem {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
  rateCardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create rate card input
export interface CreateRateCardInput {
  name: string;
  description?: string;
  pricingType?: PricingType;
  rate: number;
  unit?: string;
  categoryId?: string;
  taxRateId?: string;
  isActive?: boolean;
}

// Update rate card input
export interface UpdateRateCardInput extends Partial<CreateRateCardInput> {
  id: string;
}

// Create category input
export interface CreateCategoryInput {
  name: string;
  color?: string;
  sortOrder?: number;
}

// Update category input
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// Rate card filter
export interface RateCardFilter {
  search?: string;
  categoryId?: string;
  pricingType?: PricingType;
  isActive?: boolean;
  minRate?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Rate card stats
export interface RateCardStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    count: number;
  }>;
  byPricingType: Array<{
    pricingType: string;
    count: number;
  }>;
}

// Paginated result
export interface PaginatedRateCards {
  data: RateCardListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Rate card selection (for quote builder)
export interface RateCardSelection {
  id: string;
  name: string;
  description: string | null;
  pricingType: string;
  rate: number;
  unit: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  taxRateId: string | null;
}

// Import result
export interface RateCardImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
