import { apiFetch, buildQueryString } from '@/lib/api-client';
import type {
  FinanceSummary,
  FindAllTransactionsQuery,
  SummaryQuery,
  Transaction,
  TransactionPayload,
} from '@/types/finance';

export const transactionService = {
  async findAll(query: FindAllTransactionsQuery) {
    const res = await apiFetch<Transaction[]>(`/v1/transactions${buildQueryString(query)}`);
    return { items: res.data, meta: res.meta! };
  },

  async create(payload: TransactionPayload) {
    const res = await apiFetch<Transaction>('/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async update(id: number, payload: Partial<TransactionPayload>) {
    const res = await apiFetch<Transaction>(`/v1/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async remove(id: number) {
    const res = await apiFetch<{ id: number; deleted: boolean }>(`/v1/transactions/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async getSummary(query: SummaryQuery) {
    const res = await apiFetch<FinanceSummary>(`/v1/transactions/summary${buildQueryString(query)}`);
    return res.data;
  },
};
