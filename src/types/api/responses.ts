/**
 * Standardized API Response Types
 * All API routes should return these response types for consistency
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
    field?: string; // For validation errors
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Common error codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
}
