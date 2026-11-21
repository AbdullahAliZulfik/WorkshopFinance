import type { ApiErrorResponse, ApiResponse } from '@/types/finance';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Pastikan backend dan MySQL (Laragon) sudah berjalan.',
      0,
    );
  }

  const body = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | ApiErrorResponse
    | null;

  if (!response.ok || !body || body.success === false) {
    const error = body as ApiErrorResponse | null;
    throw new ApiError(
      error?.message ?? 'Terjadi kesalahan pada server',
      error?.statusCode ?? response.status,
      error?.errors,
    );
  }

  return body;
}

export function buildQueryString(params: object): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
