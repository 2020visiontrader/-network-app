export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count?: number;
  page?: number;
  totalPages?: number;
}

