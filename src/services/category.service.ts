import { apiFetch, buildQueryString } from '@/lib/api-client';
import type { Category, CategoryPayload, TransactionType } from '@/types/finance';

export const categoryService = {
  async findAll(type?: TransactionType) {
    const res = await apiFetch<Category[]>(`/v1/categories${buildQueryString({ type })}`);
    return res.data;
  },

  async create(payload: CategoryPayload) {
    const res = await apiFetch<Category>('/v1/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async update(id: number, payload: Partial<CategoryPayload>) {
    const res = await apiFetch<Category>(`/v1/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async remove(id: number) {
    const res = await apiFetch<{ id: number; deleted: boolean }>(`/v1/categories/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
