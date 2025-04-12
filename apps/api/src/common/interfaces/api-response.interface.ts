/**
 * Standardized API response format
 */
export interface ApiResponse<T = unknown> {
  /**
   * Response status
   */
  status: 'success' | 'error' | 'warning';

  /**
   * Message describing the response
   */
  message?: string;

  /**
   * Response data
   */
  data?: T;

  /**
   * Error details (only present when status is 'error')
   */
  error?: {
    /**
     * Error code
     */
    code?: string;

    /**
     * Detailed error message
     */
    message: string;

    /**
     * Error details for field-level errors
     */
    details?: Record<string, string>;
  };

  /**
   * Meta information about the response
   */
  meta?: {
    /**
     * Timestamp of the response
     */
    timestamp: number;

    /**
     * API version
     */
    version?: string;

    /**
     * Request ID
     */
    requestId?: string;

    /**
     * Pagination information
     */
    pagination?: PaginationMeta;
  };
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  perPage: number;

  /**
   * Total number of items
   */
  total: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}
