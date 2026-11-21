import { PaginationMeta } from './pagination.util';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export function ok<T>(
  message: string,
  data: T,
  meta?: PaginationMeta,
  statusCode = 200,
): ApiResponse<T> {
  return {
    success: true,
    statusCode,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}
