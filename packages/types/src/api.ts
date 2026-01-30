/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API metadata for pagination
 */
export interface ApiMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search/filter parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

/**
 * Bulk action request
 */
export interface BulkActionRequest {
  ids: string[];
  action: string;
  data?: Record<string, unknown>;
}

/**
 * Bulk action response
 */
export interface BulkActionResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}
