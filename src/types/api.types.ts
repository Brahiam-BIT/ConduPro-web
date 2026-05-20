export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
